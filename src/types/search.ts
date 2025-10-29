/**
 * Type definitions for enhanced search functionality
 */

export enum SearchScope {
  PAPERS = 'papers',
  QUESTIONS = 'questions',
  ALL = 'all',
}

export enum SearchOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

export interface SearchFilters {
  // Paper filters
  dateFrom?: string; // ISO 8601 date
  dateTo?: string;
  studyTypes?: string[];
  categories?: string[];
  tags?: string[];
  importance?: string[];
  readStatus?: string[];
  
  // Question filters
  questionStatus?: string[];
  minConfidence?: number;
  maxConfidence?: number;
  hasContradictions?: boolean;
  hasMechanisms?: boolean;
  
  // Common filters
  peerReviewedOnly?: boolean;
}

export interface SearchQuery {
  text: string;
  scope: SearchScope;
  filters?: SearchFilters;
  operators?: SearchOperator[];
}

export interface SearchResult {
  type: 'paper' | 'question' | 'finding';
  id: string;
  title: string;
  snippet: string; // Highlighted excerpt
  relevanceScore: number; // 0-1
  matchedFields: string[]; // Which fields matched
  metadata?: Record<string, string | number | boolean | string[]>;
}

export interface SearchResults {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  executionTime: number; // milliseconds
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  dateCreated: string;
  lastUsed: string;
  useCount: number;
}

