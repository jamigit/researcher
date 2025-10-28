/**
 * IndexedDB database configuration using Dexie
 * @ai-context Central database configuration with schema definitions and indexes
 * @ai-dependencies Dexie.js for IndexedDB abstraction
 * 
 * SCHEMA VERSIONS:
 * - v1 (Week 1-2): papers, notes, searches
 * - v2 (Week 3-4): questions, findings, contradictions
 * - v3 (Week 5+): chunks, embeddings, soft delete fields (PLANNED)
 * 
 * PLANNED ENHANCEMENTS (v3):
 * 
 * 1. Knowledge Chunks Table:
 *    - Enable precise evidence extraction (quote exact paragraphs)
 *    - Support semantic search with chunk-level embeddings
 *    - Improve contradiction detection (compare specific claims)
 *    - Scale to 1000+ papers (10K chunks, 60MB embeddings)
 * 
 * 2. Embeddings Table:
 *    - Store vector embeddings separately for performance
 *    - text-embedding-3-small model (1536 dimensions)
 *    - Enable hybrid search (70% semantic + 30% keyword)
 * 
 * 3. Soft Delete Enhancement:
 *    - Add isArchived, archivedAt, archiveReason to entities
 *    - Reversible deletions (user-friendly, preserves relationships)
 *    - Queries filter archived by default
 * 
 * 4. Index Optimization:
 *    - Remove: title (not useful for equality queries)
 *    - Add: [readStatus+dateAdded], [importance+dateAdded] (compound)
 *    - Rationale: Optimize common queries like "unread papers by date"
 * 
 * 5. Relationship Tracking:
 *    - Add relatedQuestions/Findings/Mechanisms arrays to papers
 *    - Enable bidirectional navigation
 *    - Support "show all papers for question" queries
 * 
 * See: docs/DATABASE_GUIDE.md for complete architecture documentation
 */

import Dexie, { type Table } from 'dexie';
import type { ResearchPaper } from '@/types/paper';
import type { Note, SavedSearch } from '@/types/database';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type { Contradiction } from '@/types/contradiction';

/**
 * Database class definition extending Dexie
 * Schema version 1: Initial setup with papers, notes, and searches tables
 * Schema version 2: Phase 2 - Q&A system with questions, findings, contradictions
 */
export class ResearchTrackerDB extends Dexie {
  // Table declarations with TypeScript types
  papers!: Table<ResearchPaper, string>;
  notes!: Table<Note, string>;
  searches!: Table<SavedSearch, string>;
  // Phase 2 tables
  questions!: Table<ResearchQuestion, string>;
  findings!: Table<Finding, string>;
  contradictions!: Table<Contradiction, string>;

  constructor() {
    super('ResearchTrackerDB');

    // Schema version 1 - Initial schema (Week 1-2)
    // Indexes are specified after the primary key
    // Multi-entry indexes (*) enable array value queries
    // Compound indexes ([field1+field2]) optimize multi-filter queries
    this.version(1).stores({
      // Papers table with indexes on commonly queried fields
      papers:
        'id, pubmedId, doi, title, dateAdded, publicationDate, readStatus, importance, *categories, *tags',
      // Notes table with indexes for searching and filtering
      notes: 'id, paperId, dateCreated, dateModified, *tags',
      // Saved searches table with index on last used for sorting
      searches: 'id, name, dateCreated, lastUsed',
    });

    // Schema version 2 - Phase 2: Q&A System (Week 3-4)
    // Add questions, findings, and contradictions tables
    // NOTE: Dexie requires only specifying new tables, but keeping all for clarity
    this.version(2).stores({
      // Papers table (unchanged from v1)
      papers:
        'id, pubmedId, doi, title, dateAdded, publicationDate, readStatus, importance, *categories, *tags',
      // Notes table (unchanged from v1)
      notes: 'id, paperId, dateCreated, dateModified, *tags',
      // Saved searches table (unchanged from v1)
      searches: 'id, name, dateCreated, lastUsed',
      // Questions table with indexes for filtering and sorting
      questions: 'id, question, dateCreated, lastUpdated, status, isPriority',
      // Findings table with index on question relationship
      findings: 'id, questionId, dateCreated, hasContradiction',
      // Contradictions table with index on finding relationship
      contradictions: 'id, findingId, dateDetected, status, severity',
    });

    // Schema version 3 - PLANNED (Week 5+): Knowledge Chunks + Semantic Search
    // 
    // WILL ADD:
    // - chunks: 'id, paperId, *topics, *relatedQuestionIds, chunkIndex'
    //   - Knowledge chunks (200-500 words each, section-aware)
    //   - Multi-entry index on topics for keyword search
    //   - Multi-entry index on relatedQuestionIds for linking
    //   - chunkIndex for ordering chunks within a paper
    // 
    // - embeddings: 'id, chunkId, model'
    //   - Vector embeddings (text-embedding-3-small, 1536 dims)
    //   - Stored separately from chunks for performance
    //   - Enable semantic search (cosine similarity)
    // 
    // WILL MODIFY (via .upgrade() hook):
    // - papers: Add isArchived, archivedAt, archiveReason (soft delete)
    //          Add relatedQuestions[], relatedFindings[] (relationships)
    // - questions: Add isArchived, archivedAt, archiveReason
    // - findings: Add isArchived, archivedAt, archiveReason
    //            Add supportingPapersMissing counter
    // 
    // WILL OPTIMIZE INDEXES:
    // - papers: Remove 'title' (not useful), add '[readStatus+dateAdded]', '[importance+dateAdded]'
    // - questions: Add '[status+lastUpdated]' for filtered sorting
    // - findings: Add '*supportingPapers' for multi-entry queries
    // 
    // Implementation:
    // this.version(3)
    //   .stores({
    //     chunks: 'id, paperId, *topics, *relatedQuestionIds, chunkIndex',
    //     embeddings: 'id, chunkId, model',
    //     papers: 'id, pubmedId, doi, [readStatus+dateAdded], [importance+dateAdded], *categories, *tags',
    //     questions: 'id, [status+lastUpdated], isPriority',
    //     findings: 'id, questionId, *supportingPapers, hasContradiction'
    //   })
    //   .upgrade(async tx => {
    //     // Add soft delete fields to existing records
    //     await tx.table('papers').toCollection().modify(paper => {
    //       paper.isArchived = false;
    //       paper.relatedQuestions = [];
    //       paper.relatedFindings = [];
    //     });
    //     // ... similar for questions, findings
    //   });
    // 
    // See: docs/DATABASE_GUIDE.md Part 8 for complete migration strategy
  }
}

// Create and export a singleton database instance
// This ensures all parts of the app use the same database connection
export const db = new ResearchTrackerDB();

/**
 * Initialize the database and perform any necessary setup
 * Should be called on app startup
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Open the database
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
};

/**
 * Clear all data from the database (for testing or reset purposes)
 * Use with caution - this is irreversible!
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await db.papers.clear();
    await db.notes.clear();
    await db.searches.clear();
    await db.questions.clear();
    await db.findings.clear();
    await db.contradictions.clear();
    console.log('All database data cleared');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
};

/**
 * Export database for backup purposes
 */
export const exportDatabase = async (): Promise<{
  papers: ResearchPaper[];
  notes: Note[];
  searches: SavedSearch[];
  questions: ResearchQuestion[];
  findings: Finding[];
  contradictions: Contradiction[];
}> => {
  try {
    const papers = await db.papers.toArray();
    const notes = await db.notes.toArray();
    const searches = await db.searches.toArray();
    const questions = await db.questions.toArray();
    const findings = await db.findings.toArray();
    const contradictions = await db.contradictions.toArray();
    return { papers, notes, searches, questions, findings, contradictions };
  } catch (error) {
    console.error('Failed to export database:', error);
    throw error;
  }
};

/**
 * Import database from backup
 */
export const importDatabase = async (data: {
  papers?: ResearchPaper[];
  notes?: Note[];
  searches?: SavedSearch[];
  questions?: ResearchQuestion[];
  findings?: Finding[];
  contradictions?: Contradiction[];
}): Promise<void> => {
  try {
    if (data.papers) {
      await db.papers.bulkPut(data.papers);
    }
    if (data.notes) {
      await db.notes.bulkPut(data.notes);
    }
    if (data.searches) {
      await db.searches.bulkPut(data.searches);
    }
    if (data.questions) {
      await db.questions.bulkPut(data.questions);
    }
    if (data.findings) {
      await db.findings.bulkPut(data.findings);
    }
    if (data.contradictions) {
      await db.contradictions.bulkPut(data.contradictions);
    }
    console.log('Database imported successfully');
  } catch (error) {
    console.error('Failed to import database:', error);
    throw error;
  }
};

