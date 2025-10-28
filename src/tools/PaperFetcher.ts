/**
 * PaperFetcher Tool
 * Automatically fetches paper metadata from multiple sources
 * @ai-context Smart paper ingestion with fallback strategies
 */

import type { ResearchPaper, Author } from '@/types/paper';
import type {
  PaperInput,
  InputType,
  FetchResult,
  FetchOptions,
  CrossrefWork,
} from '@/types/fetcher';
import { InputType as InputTypeEnum } from '@/types/fetcher';
import { StudyType, Category, ReadStatus, Importance } from '@/types/paper';
import { fetchWithRetry } from '@/lib/http';

/**
 * Identify the type of input provided
 */
export function identifyInputType(input: string): InputType {
  const trimmed = input.trim();

  // DOI pattern: 10.xxxx/xxxxx
  if (/^10\.\d{4,}\/\S+$/.test(trimmed)) {
    return InputTypeEnum.DOI;
  }

  // PMID pattern: numeric only
  if (/^\d{7,8}$/.test(trimmed)) {
    return InputTypeEnum.PMID;
  }

  // PubMed URL pattern
  if (
    trimmed.includes('pubmed.ncbi.nlm.nih.gov') ||
    trimmed.includes('www.ncbi.nlm.nih.gov/pubmed')
  ) {
    return InputTypeEnum.PUBMED_URL;
  }

  // Springer URL pattern
  if (
    trimmed.includes('link.springer.com') ||
    trimmed.includes('springer.com/article')
  ) {
    return InputTypeEnum.SPRINGER_URL;
  }

  // Nature URL pattern
  if (
    trimmed.includes('nature.com/articles') ||
    trimmed.includes('nature.com/nature/')
  ) {
    return InputTypeEnum.NATURE_URL;
  }

  // arXiv pattern
  if (/arxiv\.org\/abs\//.test(trimmed) || /^\d{4}\.\d{4,5}$/.test(trimmed)) {
    return InputTypeEnum.ARXIV;
  }

  // General URL
  if (/^https?:\/\/.+/.test(trimmed)) {
    return InputTypeEnum.URL;
  }

  return InputTypeEnum.UNKNOWN;
}

/**
 * Extract PMID from PubMed URL
 */
function extractPMID(url: string): string | null {
  const match = url.match(/\/(\d{7,8})\/?/);
  return match ? match[1] : null;
}

/**
 * Extract DOI from publisher URLs
 * Handles Springer, Nature, Elsevier, Wiley, and other publishers
 */
function extractDOIFromURL(url: string): string | null {
  // Pattern 1: DOI in path (most common)
  // e.g., https://link.springer.com/article/10.1007/s12026-020-09134-7
  // e.g., https://www.nature.com/articles/10.1038/s41467-021-12345-6
  const doiInPath = url.match(/\/(10\.\d{4,}\/[^\s?#]+)/);
  if (doiInPath) {
    return decodeURIComponent(doiInPath[1]);
  }

  // Pattern 2: DOI as query parameter
  // e.g., https://example.com/article?doi=10.1234/example
  const doiParam = url.match(/[?&]doi=([^&]+)/);
  if (doiParam) {
    return decodeURIComponent(doiParam[1]);
  }

  // Pattern 3: DOI identifier in URL
  // e.g., https://doi.org/10.1234/example
  if (url.includes('doi.org/')) {
    const doiOrg = url.match(/doi\.org\/(10\.\d{4,}\/[^\s?#]+)/);
    if (doiOrg) {
      return decodeURIComponent(doiOrg[1]);
    }
  }

  return null;
}

/**
 * Fetch paper from PubMed E-utilities API
 */
async function fetchFromPubMed(pmid: string): Promise<FetchResult> {
  try {
    console.log('Fetching from PubMed:', pmid);

    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    const email = import.meta.env.VITE_NCBI_EMAIL || 'research@example.com';
    const apiKey = import.meta.env.VITE_NCBI_API_KEY;

    // Fetch from PubMed
    const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&email=${email}${apiKey ? `&api_key=${apiKey}` : ''}`;

    const xmlText = await fetch(fetchUrl).then((r) => r.text());

    // Parse XML (simplified - in production, use proper XML parser)
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');

    // Check for error
    const error = xml.querySelector('ERROR');
    if (error) {
      throw new Error(`PubMed error: ${error.textContent}`);
    }

    // Extract article data
    const article = xml.querySelector('PubmedArticle');
    if (!article) {
      throw new Error('No article found in PubMed response');
    }

    // Title
    const title =
      article.querySelector('ArticleTitle')?.textContent?.trim() || '';

    // Authors
    const authorNodes = article.querySelectorAll('Author');
    const authors: Author[] = Array.from(authorNodes)
      .map((node) => {
        const lastName = node.querySelector('LastName')?.textContent || '';
        const foreName = node.querySelector('ForeName')?.textContent || '';
        const affiliation =
          node.querySelector('Affiliation')?.textContent || undefined;

        if (!lastName) return null;

        return {
          name: foreName ? `${foreName} ${lastName}` : lastName,
          affiliation,
        } as Author;
      })
      .filter((a): a is Author => a !== null);

    // Abstract
    const abstractNodes = article.querySelectorAll('AbstractText');
    const abstract = Array.from(abstractNodes)
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join('\n\n');

    // Journal
    const journal = article.querySelector('Journal Title')?.textContent?.trim();

    // Publication date
    const pubDate = article.querySelector('PubDate');
    const year = pubDate?.querySelector('Year')?.textContent || '';
    const month = pubDate?.querySelector('Month')?.textContent || '01';
    const day = pubDate?.querySelector('Day')?.textContent || '01';
    const publicationDate = year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';

    // DOI
    const articleIds = article.querySelectorAll('ArticleId');
    let doi: string | undefined;
    for (const id of Array.from(articleIds)) {
      if (id.getAttribute('IdType') === 'doi') {
        doi = id.textContent?.trim() || undefined;
        break;
      }
    }

    // Keywords
    const keywordNodes = article.querySelectorAll('Keyword');
    const keywords = Array.from(keywordNodes)
      .map((node) => node.textContent?.trim())
      .filter(Boolean);

    if (!title || !abstract) {
      throw new Error('Incomplete paper data from PubMed');
    }

    const paper: Partial<ResearchPaper> = {
      pubmedId: pmid,
      doi,
      title,
      authors,
      abstract,
      journal,
      publicationDate: publicationDate
        ? new Date(publicationDate).toISOString()
        : new Date().toISOString(),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      categories: inferCategories(title, abstract, keywords),
      tags: keywords as string[],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    return {
      success: true,
      paper,
      source: 'pubmed',
    };
  } catch (error) {
    console.error('PubMed fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch paper from Crossref API
 */
async function fetchFromCrossref(doi: string): Promise<FetchResult> {
  try {
    console.log('Fetching from Crossref:', doi);

    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    const response = await fetchWithRetry<{ message: CrossrefWork }>(url);

    const work = response.message;

    // Extract data
    const title = Array.isArray(work.title) ? work.title[0] : '';
    const journal = Array.isArray(work['container-title'])
      ? work['container-title'][0]
      : undefined;

    const authors: Author[] =
      work.author?.map((a) => ({
        name: `${a.given || ''} ${a.family || ''}`.trim(),
        affiliation: a.affiliation?.[0]?.name,
      })) || [];

    const publicationDate = work.published?.['date-parts']?.[0]
      ? new Date(
          work.published['date-parts'][0][0],
          (work.published['date-parts'][0][1] || 1) - 1,
          work.published['date-parts'][0][2] || 1
        ).toISOString()
      : new Date().toISOString();

    // Crossref doesn't always have abstracts
    const abstract =
      work.abstract || 'Abstract not available from Crossref.';

    const paper: Partial<ResearchPaper> = {
      doi: work.DOI,
      title,
      authors,
      abstract,
      journal,
      publicationDate,
      url: work.URL || `https://doi.org/${work.DOI}`,
      studyType: inferStudyType(work.type),
      categories: inferCategories(title, abstract),
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    return {
      success: true,
      paper,
      source: 'crossref',
    };
  } catch (error) {
    console.error('Crossref fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch paper from DOI resolver
 */
async function fetchFromDOIResolver(doi: string): Promise<FetchResult> {
  try {
    console.log('Fetching from DOI resolver:', doi);

    const url = `https://doi.org/${doi}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.citationstyles.csl+json',
      },
    });

    if (!response.ok) {
      throw new Error(`DOI resolver returned ${response.status}`);
    }

    const data = await response.json();

    // Crossref author data structure
    interface CrossrefAuthor {
      given?: string;
      family?: string;
    }

    const paper: Partial<ResearchPaper> = {
      doi: data.DOI || doi,
      title: data.title || '',
      authors:
        data.author?.map((a: CrossrefAuthor) => ({
          name: `${a.given || ''} ${a.family || ''}`.trim(),
        })) || [],
      abstract: data.abstract || 'Abstract not available from DOI resolver.',
      journal: data['container-title'] || undefined,
      publicationDate: data.issued
        ? new Date(
            data.issued['date-parts'][0][0],
            (data.issued['date-parts'][0][1] || 1) - 1,
            data.issued['date-parts'][0][2] || 1
          ).toISOString()
        : new Date().toISOString(),
      url: data.URL || `https://doi.org/${doi}`,
      categories: [],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    return {
      success: true,
      paper,
      source: 'doi_resolver',
    };
  } catch (error) {
    console.error('DOI resolver fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Infer study type from Crossref type
 */
function inferStudyType(crossrefType?: string): StudyType | undefined {
  if (!crossrefType) return undefined;

  const typeMap: Record<string, StudyType> = {
    'journal-article': StudyType.OBSERVATIONAL,
    'review-article': StudyType.REVIEW,
    'book-chapter': StudyType.REVIEW,
    proceedings: StudyType.OTHER,
  };

  return typeMap[crossrefType];
}

/**
 * Infer categories from title, abstract, and keywords
 */
function inferCategories(
  title: string,
  abstract: string,
  keywords: string[] = []
): Category[] {
  const text = `${title} ${abstract} ${keywords.join(' ')}`.toLowerCase();
  const categories: Category[] = [];

  // Simple keyword matching
  if (
    /biomarker|marker|diagnostic|test|assay/.test(text) &&
    !categories.includes(Category.BIOMARKERS)
  ) {
    categories.push(Category.BIOMARKERS);
  }

  if (
    /treatment|therapy|intervention|drug|medication/.test(text) &&
    !categories.includes(Category.TREATMENT)
  ) {
    categories.push(Category.TREATMENT);
  }

  if (
    /mechanism|pathway|pathophysiology|etiology/.test(text) &&
    !categories.includes(Category.PATHOPHYSIOLOGY)
  ) {
    categories.push(Category.PATHOPHYSIOLOGY);
  }

  if (
    /immune|immunity|cytokine|inflammation/.test(text) &&
    !categories.includes(Category.IMMUNOLOGY)
  ) {
    categories.push(Category.IMMUNOLOGY);
  }

  if (
    /brain|neural|cognitive|nervous/.test(text) &&
    !categories.includes(Category.NEUROLOGY)
  ) {
    categories.push(Category.NEUROLOGY);
  }

  if (
    /genetic|gene|genome|dna/.test(text) &&
    !categories.includes(Category.GENETICS)
  ) {
    categories.push(Category.GENETICS);
  }

  if (
    /quality of life|qol|disability|functioning/.test(text) &&
    !categories.includes(Category.QUALITY_OF_LIFE)
  ) {
    categories.push(Category.QUALITY_OF_LIFE);
  }

  // Default to OTHER if no categories matched
  if (categories.length === 0) {
    categories.push(Category.OTHER);
  }

  return categories;
}

/**
 * Main fetch function with fallback strategy
 */
export async function fetchPaper(
  input: PaperInput,
  _options: FetchOptions = {}
): Promise<FetchResult> {
  const inputType = identifyInputType(input);
  console.log('Input identified as:', inputType, '- Input:', input);

  try {
    // Strategy 1: PubMed (PMID or PubMed URL)
    if (inputType === InputTypeEnum.PMID) {
      const result = await fetchFromPubMed(input);
      if (result.success) return result;
    }

    if (inputType === InputTypeEnum.PUBMED_URL) {
      const pmid = extractPMID(input);
      if (pmid) {
        const result = await fetchFromPubMed(pmid);
        if (result.success) return result;
      }
    }

    // Strategy 2: Crossref (DOI)
    if (inputType === InputTypeEnum.DOI) {
      const result = await fetchFromCrossref(input);
      if (result.success) return result;

      // Fallback to DOI resolver
      const resolverResult = await fetchFromDOIResolver(input);
      if (resolverResult.success) return resolverResult;
    }

    // Strategy 3: Publisher URLs (Springer, Nature, etc.)
    if (
      inputType === InputTypeEnum.SPRINGER_URL ||
      inputType === InputTypeEnum.NATURE_URL ||
      inputType === InputTypeEnum.URL
    ) {
      const doi = extractDOIFromURL(input);
      if (doi) {
        console.log('Extracted DOI from URL:', doi);
        const result = await fetchFromCrossref(doi);
        if (result.success) return result;

        // Fallback to DOI resolver
        const resolverResult = await fetchFromDOIResolver(doi);
        if (resolverResult.success) return resolverResult;
      }
    }

    // Strategy 4: Try as DOI if looks like it might be one
    if (input.includes('/')) {
      const doiMatch = input.match(/10\.\d{4,}\/\S+/);
      if (doiMatch) {
        const result = await fetchFromCrossref(doiMatch[0]);
        if (result.success) return result;
      }
    }

    // All strategies failed
    return {
      success: false,
      error: `Unable to fetch paper from input: ${input}. Input type: ${inputType}. Please try manual entry or a different identifier.`,
    };
  } catch (error) {
    console.error('Paper fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate that fetched paper has required fields
 */
export function validateFetchedPaper(
  paper: Partial<ResearchPaper>
): boolean {
  const required = ['title', 'authors', 'abstract'];

  for (const field of required) {
    if (!paper[field as keyof typeof paper]) {
      console.error('Missing required field:', field);
      return false;
    }
  }

  if (!Array.isArray(paper.authors) || paper.authors.length === 0) {
    console.error('Invalid authors field');
    return false;
  }

  if (typeof paper.title !== 'string' || paper.title.length < 10) {
    console.error('Invalid title field');
    return false;
  }

  if (typeof paper.abstract !== 'string' || paper.abstract.length < 50) {
    console.error('Invalid abstract field');
    return false;
  }

  return true;
}

