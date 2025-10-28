/**
 * Type definitions for PaperFetcher tool
 * @ai-context Types for automatic paper metadata fetching from various sources
 */

import type { ResearchPaper } from './paper';

/**
 * Input type for paper fetching
 */
export type PaperInput = string; // DOI, PMID, URL, or identifier

/**
 * Input type classification
 */
export enum InputType {
  DOI = 'doi',
  PMID = 'pmid',
  PUBMED_URL = 'pubmed_url',
  SPRINGER_URL = 'springer_url',
  NATURE_URL = 'nature_url',
  ARXIV = 'arxiv',
  URL = 'url',
  UNKNOWN = 'unknown',
}

/**
 * Paper fetching result
 */
export interface FetchResult {
  success: boolean;
  paper?: Partial<ResearchPaper>;
  source?: 'pubmed' | 'crossref' | 'doi_resolver' | 'scraper';
  error?: string;
}

/**
 * PubMed API response types
 */
export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: Array<{
    name: string;
    affiliation?: string;
  }>;
  abstract: string;
  journal: string;
  publicationDate: string;
  doi?: string;
  keywords?: string[];
}

/**
 * Crossref API response types
 */
export interface CrossrefWork {
  DOI: string;
  title: string[];
  author?: Array<{
    given?: string;
    family?: string;
    affiliation?: Array<{ name: string }>;
  }>;
  abstract?: string;
  'container-title'?: string[];
  published?: {
    'date-parts': number[][];
  };
  URL?: string;
  type?: string;
}

/**
 * Fetch options
 */
export interface FetchOptions {
  timeout?: number; // milliseconds
  retries?: number; // number of retry attempts
  includeFullText?: boolean; // attempt to fetch full text
}

