/**
 * Type definitions for paper discovery system
 * @ai-context Discovery agents, screening, and analysis types
 */

import type { ResearchPaper } from './paper';

/**
 * Discovery source types
 */
export type DiscoverySource = 'pubmed' | 'rss' | 'manual';

/**
 * Review status for discovered papers
 */
export type ReviewStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

/**
 * Paper candidate from discovery
 */
export interface PaperCandidate {
  pubmedId?: string;
  doi?: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string; affiliation?: string }>;
  publicationDate?: string;
  keywords?: string[];
  source: DiscoverySource;
  sourceUrl: string;
}

/**
 * Discovered paper in queue
 */
export interface DiscoveredPaper extends PaperCandidate {
  id: string;
  dateDiscovered: string;
  reviewStatus: ReviewStatus;
  relevanceScore?: number;
  abstractReview?: AbstractReviewResult;
  fullTextReview?: FullTextReviewResult;
}

/**
 * Abstract screening criteria
 */
export interface ScreeningCriteria {
  keywords: string[];
  minRelevanceScore: number;
  requirePeerReviewed?: boolean;
  excludeReviews?: boolean;
  minSampleSize?: number;
}

/**
 * Abstract review result
 */
export interface AbstractReviewResult {
  relevant: boolean;
  relevanceScore: number; // 0-1
  reasoning: string;
  suggestedCategories: string[];
  keepForFullReview: boolean;
  confidence: number; // 0-1
}

/**
 * Full text review result
 */
export interface FullTextReviewResult {
  methodology: {
    studyDesign: string;
    sampleSize?: number;
    duration?: string;
    limitations: string[];
  };
  keyFindings: string[];
  dataQuality: number; // 0-1
  citableResults: string[];
  contradictions: string[];
  recommendAddToDatabase: boolean;
}

/**
 * Discovery configuration
 */
export interface DiscoveryConfig {
  pubmed: {
    keywords: string[];
    dateRange: 'week' | 'month' | 'custom';
    customDateFrom?: string;
    customDateTo?: string;
    maxResults: number;
  };
  rss: {
    feeds: RSSFeedConfig[];
    checkInterval: number; // hours
  };
  screening: {
    autoApproveThreshold: number; // 0-1
    autoRejectThreshold: number; // 0-1
    requireFullTextFor: string[]; // Categories
  };
}

/**
 * RSS feed configuration
 */
export interface RSSFeedConfig {
  name: string;
  url: string;
  keywords: string[];
  enabled: boolean;
}

/**
 * Discovery run result
 */
export interface DiscoveryRunResult {
  id: string;
  dateRun: string;
  papersFound: number;
  papersScreened: number;
  papersApproved: number;
  papersRejected: number;
  errors: Array<{ message: string; context: string }>;
  durationSeconds: number;
}

/**
 * PubMed search configuration
 */
export interface PubMedSearchConfig {
  keywords: string[];
  dateRange: { from: string; to: string };
  maxResults: number;
  email?: string;
  apiKey?: string;
}

/**
 * Analysis depth levels
 */
export enum AnalysisDepth {
  ABSTRACT_ONLY = 'abstract',
  ABSTRACT_METHODS = 'methods',
  ABSTRACT_RESULTS = 'results',
  FULL_TEXT = 'fulltext',
}

/**
 * Factory function to create discovered paper
 */
export const createDiscoveredPaper = (
  candidate: PaperCandidate
): DiscoveredPaper => {
  return {
    ...candidate,
    id: crypto.randomUUID(),
    dateDiscovered: new Date().toISOString(),
    reviewStatus: 'pending',
  };
};

/**
 * Convert discovered paper to research paper
 */
export const convertToResearchPaper = (
  discovered: DiscoveredPaper
): Omit<ResearchPaper, 'id'> & { id: string } => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    pubmedId: discovered.pubmedId,
    doi: discovered.doi,
    title: discovered.title,
    abstract: discovered.abstract,
    authors: discovered.authors,
    publicationDate: discovered.publicationDate || '',
    fullText: '',
    keywords: discovered.keywords || [],
    studyType: 'other',
    categories: [],
    tags: [],
    readStatus: 'unread',
    importance: 'medium',
    dateAdded: now,
    dateModified: now,
    fullTextAvailable: false,
    peerReviewed: true,
    journalName: '',
    // Discovery metadata
    discoveredBy: discovered.source,
    discoveryDate: discovered.dateDiscovered,
    abstractScreeningScore: discovered.relevanceScore,
  } as Omit<ResearchPaper, 'id'> & { id: string };
};

