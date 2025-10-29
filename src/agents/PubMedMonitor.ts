/**
 * PubMed Monitoring Agent
 * Discovers new ME/CFS papers from PubMed API
 * @ai-context Automated paper discovery from PubMed
 */

import type { PaperCandidate, PubMedSearchConfig } from '@/types/discovery';
import { fetchWithRetry } from '@/lib/http';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Build PubMed search query
 */
export function buildPubMedQuery(keywords: string[], dateRange: { from: string; to: string }): string {
  // Combine keywords with OR
  const keywordQuery = keywords
    .map(k => `"${k}"[Title/Abstract]`)
    .join(' OR ');
  
  // Add date range
  const dateQuery = `("${dateRange.from}"[PDAT] : "${dateRange.to}"[PDAT])`;
  
  return `(${keywordQuery}) AND ${dateQuery}`;
}

/**
 * Search PubMed for paper IDs
 */
export async function searchPubMed(config: PubMedSearchConfig): Promise<string[]> {
  const query = buildPubMedQuery(config.keywords, config.dateRange);
  
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: config.maxResults.toString(),
    retmode: 'json',
    sort: 'relevance',
  });
  
  if (config.email) {
    params.append('email', config.email);
  }
  if (config.apiKey) {
    params.append('api_key', config.apiKey);
  }
  
  const url = `${PUBMED_BASE_URL}/esearch.fcgi?${params.toString()}`;
  
  try {
    const response = await fetchWithRetry(url, {
      timeout: 30000,
      retries: 3,
    });
    
    if (!response.ok) {
      throw new Error(`PubMed API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const idList = data.esearchresult?.idlist || [];
    
    console.log(`PubMed search found ${idList.length} papers`);
    return idList;
  } catch (error) {
    console.error('PubMed search failed:', error);
    throw new Error(`Failed to search PubMed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch paper metadata from PubMed
 */
export async function fetchPaperMetadata(pmids: string[]): Promise<PaperCandidate[]> {
  if (pmids.length === 0) {
    return [];
  }
  
  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'xml',
  });
  
  const url = `${PUBMED_BASE_URL}/efetch.fcgi?${params.toString()}`;
  
  try {
    const response = await fetchWithRetry(url, {
      timeout: 30000,
      retries: 3,
    });
    
    if (!response.ok) {
      throw new Error(`PubMed API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return parsePubMedXML(xmlText);
  } catch (error) {
    console.error('Failed to fetch paper metadata:', error);
    throw error;
  }
}

/**
 * Parse PubMed XML response
 */
export function parsePubMedXML(xml: string): PaperCandidate[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  
  const articles = doc.querySelectorAll('PubmedArticle');
  const papers: PaperCandidate[] = [];
  
  articles.forEach((article) => {
    try {
      // Extract PMID
      const pmid = article.querySelector('PMID')?.textContent || '';
      
      // Extract DOI
      const doiElement = Array.from(article.querySelectorAll('ArticleId'))
        .find(el => el.getAttribute('IdType') === 'doi');
      const doi = doiElement?.textContent || undefined;
      
      // Extract title
      const title = article.querySelector('ArticleTitle')?.textContent || '';
      
      // Extract abstract
      const abstractNodes = article.querySelectorAll('AbstractText');
      const abstract = Array.from(abstractNodes)
        .map(node => node.textContent)
        .join(' ') || '';
      
      // Extract authors
      const authorNodes = article.querySelectorAll('Author');
      const authors = Array.from(authorNodes).map(authorNode => {
        const lastName = authorNode.querySelector('LastName')?.textContent || '';
        const foreName = authorNode.querySelector('ForeName')?.textContent || '';
        const initials = authorNode.querySelector('Initials')?.textContent || '';
        const affiliation = authorNode.querySelector('Affiliation')?.textContent;
        
        const name = foreName ? `${foreName} ${lastName}` : `${initials} ${lastName}`;
        
        return {
          name: name.trim(),
          affiliation,
        };
      });
      
      // Extract publication date
      const pubDate = article.querySelector('PubDate');
      const year = pubDate?.querySelector('Year')?.textContent || '';
      const month = pubDate?.querySelector('Month')?.textContent?.padStart(2, '0') || '01';
      const day = pubDate?.querySelector('Day')?.textContent?.padStart(2, '0') || '01';
      const publicationDate = year ? `${year}-${month}-${day}` : undefined;
      
      // Extract keywords
      const keywordNodes = article.querySelectorAll('Keyword');
      const keywords = Array.from(keywordNodes).map(node => node.textContent || '');
      
      if (title && abstract && pmid) {
        papers.push({
          pubmedId: pmid,
          doi,
          title,
          abstract,
          authors,
          publicationDate,
          keywords,
          source: 'pubmed',
          sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        });
      }
    } catch (error) {
      console.error('Failed to parse article:', error);
    }
  });
  
  return papers;
}

/**
 * Discover new papers from PubMed
 * Main entry point for PubMed monitoring
 */
export async function discoverNewPapers(config: PubMedSearchConfig): Promise<PaperCandidate[]> {
  console.log('Starting PubMed discovery with config:', config);
  
  try {
    // Step 1: Search for paper IDs
    const pmids = await searchPubMed(config);
    
    if (pmids.length === 0) {
      console.log('No papers found in PubMed search');
      return [];
    }
    
    // Step 2: Fetch metadata for papers
    const papers = await fetchPaperMetadata(pmids);
    
    console.log(`Successfully fetched metadata for ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('Paper discovery failed:', error);
    throw error;
  }
}

/**
 * Get date range for last N days
 */
export function getDateRangeLastDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

/**
 * Check for updates since last run
 */
export async function checkForUpdates(
  lastCheckDate: string,
  keywords: string[] = ['ME/CFS', 'chronic fatigue syndrome', 'myalgic encephalomyelitis']
): Promise<PaperCandidate[]> {
  const today = new Date().toISOString().split('T')[0];
  
  return discoverNewPapers({
    keywords,
    dateRange: { from: lastCheckDate, to: today },
    maxResults: 100,
  });
}

