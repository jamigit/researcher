/**
 * IndexedDB database configuration using Dexie
 * @ai-context Central database configuration with schema definitions and indexes
 * @ai-dependencies Dexie.js for IndexedDB abstraction
 */

import Dexie, { type Table } from 'dexie';
import type { ResearchPaper } from '@/types/paper';
import type { Note, SavedSearch } from '@/types/database';

/**
 * Database class definition extending Dexie
 * Schema version 1: Initial setup with papers, notes, and searches tables
 */
export class ResearchTrackerDB extends Dexie {
  // Table declarations with TypeScript types
  papers!: Table<ResearchPaper, string>;
  notes!: Table<Note, string>;
  searches!: Table<SavedSearch, string>;

  constructor() {
    super('ResearchTrackerDB');

    // Schema version 1 - Initial schema
    // Indexes are specified after the primary key (++)
    // The ++ means auto-incrementing primary key, but we use UUID strings instead
    this.version(1).stores({
      // Papers table with indexes on commonly queried fields
      papers:
        'id, pubmedId, doi, title, dateAdded, publicationDate, readStatus, importance, *categories, *tags',
      // Notes table with indexes for searching and filtering
      notes: 'id, paperId, dateCreated, dateModified, *tags',
      // Saved searches table with index on last used for sorting
      searches: 'id, name, dateCreated, lastUsed',
    });
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
}> => {
  try {
    const papers = await db.papers.toArray();
    const notes = await db.notes.toArray();
    const searches = await db.searches.toArray();
    return { papers, notes, searches };
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
    console.log('Database imported successfully');
  } catch (error) {
    console.error('Failed to import database:', error);
    throw error;
  }
};

