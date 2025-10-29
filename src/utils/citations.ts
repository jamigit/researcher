/**
 * Citation formatting utilities
 * Formats research paper citations in various styles
 */

import type { ResearchPaper, Author } from '@/types/paper';

export type CitationStyle = 'apa';

/**
 * Format a paper citation in the specified style
 */
export function formatCitation(
  paper: ResearchPaper,
  style: CitationStyle = 'apa'
): string {
  switch (style) {
    case 'apa':
      return formatAPA(paper);
    default:
      return formatAPA(paper);
  }
}

/**
 * Format citation in APA 7th edition style
 * Format: Author, A. A., Author, B. B., & Author, C. C. (Year). Title. Journal, Volume(Issue), Pages. https://doi.org/xxx
 */
function formatAPA(paper: ResearchPaper): string {
  const parts: string[] = [];

  // Authors
  if (paper.authors && paper.authors.length > 0) {
    parts.push(formatAuthorsAPA(paper.authors));
  }

  // Year
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 'n.d.';
  parts.push(`(${year})`);

  // Title (sentence case)
  parts.push(`${paper.title}.`);

  // Journal
  if (paper.journal) {
    let journalPart = `*${paper.journal}*`;
    
    // Volume and Issue
    if (paper.volume) {
      journalPart += `, *${paper.volume}*`;
      if (paper.issue) {
        journalPart += `(${paper.issue})`;
      }
    }
    
    // Pages
    if (paper.pages) {
      journalPart += `, ${paper.pages}`;
    }
    
    parts.push(journalPart + '.');
  }

  // DOI or URL
  if (paper.doi) {
    parts.push(`https://doi.org/${paper.doi}`);
  } else if (paper.pubmedId) {
    parts.push(`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`);
  }

  return parts.join(' ');
}

/**
 * Format authors for APA style
 * - 1-20 authors: List all
 * - 21+ authors: List first 19, then "...", then last author
 */
function formatAuthorsAPA(authors: Author[]): string {
  if (authors.length === 0) return '';
  
  if (authors.length === 1) {
    return formatAuthorAPA(authors[0]) + '.';
  }
  
  if (authors.length <= 20) {
    const formattedAuthors = authors.map((a) => formatAuthorAPA(a));
    const lastAuthor = formattedAuthors.pop();
    return `${formattedAuthors.join(', ')}, & ${lastAuthor}.`;
  }
  
  // 21+ authors
  const first19 = authors.slice(0, 19).map((a) => formatAuthorAPA(a));
  const lastAuthor = formatAuthorAPA(authors[authors.length - 1]);
  return `${first19.join(', ')}, ... ${lastAuthor}.`;
}

/**
 * Format single author for APA style
 * Format: LastName, F. M. (First Middle initials)
 */
function formatAuthorAPA(author: Author): string {
  const name = author.name.trim();
  
  // Try to parse "FirstName LastName" format
  const parts = name.split(/\s+/);
  
  if (parts.length === 1) {
    // Only one name part, treat as last name
    return parts[0];
  }
  
  // Last name is the last part
  const lastName = parts[parts.length - 1];
  
  // Get initials from first and middle names
  const initials = parts
    .slice(0, -1)
    .map((part) => part.charAt(0).toUpperCase() + '.')
    .join(' ');
  
  return `${lastName}, ${initials}`;
}

/**
 * Get a plain text version of the citation (no markdown)
 */
export function formatCitationPlainText(
  paper: ResearchPaper,
  style: CitationStyle = 'apa'
): string {
  const citation = formatCitation(paper, style);
  // Remove markdown italics
  return citation.replace(/\*/g, '');
}

/**
 * Create a BibTeX citation
 * Useful for academic writing
 */
export function formatBibTeX(paper: ResearchPaper): string {
  const key = generateBibTeXKey(paper);
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : '';
  
  const authors = paper.authors
    .map((a) => a.name)
    .join(' and ');
  
  return `@article{${key},
  author = {${authors}},
  title = {${paper.title}},
  journal = {${paper.journal || ''}},
  year = {${year}},
  volume = {${paper.volume || ''}},
  number = {${paper.issue || ''}},
  pages = {${paper.pages || ''}},
  doi = {${paper.doi || ''}},
  pmid = {${paper.pubmedId || ''}}
}`;
}

/**
 * Generate a BibTeX citation key
 * Format: FirstAuthorLastName_Year
 */
function generateBibTeXKey(paper: ResearchPaper): string {
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 'n.d.';
  
  if (paper.authors.length > 0) {
    const firstAuthor = paper.authors[0].name.split(/\s+/).pop() || 'Unknown';
    return `${firstAuthor}_${year}`;
  }
  
  return `Unknown_${year}`;
}

