/**
 * IndexedDB/Dexie database schema type definitions
 * @ai-context Database schema matching the ResearchPaper model with proper indexing
 */

import type { ResearchPaper } from './paper';

/**
 * Personal learning notes stored separately from papers
 */
export interface Note {
  id: string; // UUID v4
  paperId?: string; // Optional reference to a paper
  title: string;
  content: string;
  tags: string[];
  dateCreated: string; // ISO 8601 timestamp
  dateModified: string; // ISO 8601 timestamp
}

/**
 * Saved search queries for quick access
 */
export interface SavedSearch {
  id: string; // UUID v4
  name: string;
  query: string;
  filters?: {
    categories?: string[];
    studyTypes?: string[];
    readStatus?: string[];
    importance?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
  dateCreated: string; // ISO 8601 timestamp
  lastUsed: string; // ISO 8601 timestamp
  useCount: number;
}

/**
 * Database schema version history
 * Used for migration tracking
 */
export interface SchemaVersion {
  version: number;
  description: string;
  migratedAt: string; // ISO 8601 timestamp
}

/**
 * Complete database schema interface
 * Maps to Dexie table definitions
 */
export interface DatabaseSchema {
  papers: ResearchPaper;
  notes: Note;
  searches: SavedSearch;
}

/**
 * Database statistics for dashboard
 */
export interface DatabaseStats {
  totalPapers: number;
  unreadPapers: number;
  readPapers: number;
  papersWithSummaries: number;
  totalNotes: number;
  savedSearches: number;
  lastUpdated: string; // ISO 8601 timestamp
}

