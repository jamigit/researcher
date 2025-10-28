/**
 * Storage service for IndexedDB operations
 * @ai-context CRUD operations for research papers with validation
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { ResearchPaper } from '@/types/paper';
import type { Note, SavedSearch, DatabaseStats } from '@/types/database';
import { ReadStatus, Importance, Category } from '@/types/paper';

/**
 * Paper CRUD Operations
 */

/**
 * Create a new research paper
 * Automatically generates ID and timestamps
 */
export const createPaper = async (
  paperData: Omit<ResearchPaper, 'id' | 'dateAdded' | 'dateModified'>
): Promise<ResearchPaper> => {
  try {
    const now = new Date().toISOString();
    const paper: ResearchPaper = {
      ...paperData,
      id: uuidv4(),
      dateAdded: now,
      dateModified: now,
      readStatus: paperData.readStatus || ReadStatus.UNREAD,
      importance: paperData.importance || Importance.MEDIUM,
      categories: paperData.categories || [],
      tags: paperData.tags || [],
      fullTextAvailable: paperData.fullTextAvailable ?? false,
    };

    await db.papers.add(paper);
    return paper;
  } catch (error) {
    console.error('Failed to create paper:', error);
    throw error;
  }
};

/**
 * Get a single paper by ID
 */
export const getPaperById = async (id: string): Promise<ResearchPaper | undefined> => {
  try {
    return await db.papers.get(id);
  } catch (error) {
    console.error('Failed to get paper:', error);
    throw error;
  }
};

/**
 * Get all papers with optional filtering and sorting
 */
export const getAllPapers = async (options?: {
  readStatus?: ReadStatus;
  importance?: Importance;
  category?: Category;
  sortBy?: 'dateAdded' | 'publicationDate' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): Promise<ResearchPaper[]> => {
  try {
    let query = db.papers.toCollection();

    // Apply filters
    if (options?.readStatus) {
      query = db.papers.where('readStatus').equals(options.readStatus);
    }
    if (options?.importance) {
      query = db.papers.where('importance').equals(options.importance);
    }
    if (options?.category) {
      query = db.papers.where('categories').equals(options.category);
    }

    // Get results
    let papers = await query.toArray();

    // Apply sorting
    if (options?.sortBy) {
      papers.sort((a, b) => {
        const aValue = a[options.sortBy!];
        const bValue = b[options.sortBy!];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply limit
    if (options?.limit) {
      papers = papers.slice(0, options.limit);
    }

    return papers;
  } catch (error) {
    console.error('Failed to get papers:', error);
    throw error;
  }
};

/**
 * Update an existing paper
 */
export const updatePaper = async (
  id: string,
  updates: Partial<Omit<ResearchPaper, 'id' | 'dateAdded'>>
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    await db.papers.update(id, {
      ...updates,
      dateModified: now,
    });
  } catch (error) {
    console.error('Failed to update paper:', error);
    throw error;
  }
};

/**
 * Delete a paper by ID
 */
export const deletePaper = async (id: string): Promise<void> => {
  try {
    await db.papers.delete(id);
  } catch (error) {
    console.error('Failed to delete paper:', error);
    throw error;
  }
};

/**
 * Search papers by text (title, abstract, tags)
 */
export const searchPapers = async (searchTerm: string): Promise<ResearchPaper[]> => {
  try {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const papers = await db.papers.toArray();

    return papers.filter((paper) => {
      const titleMatch = paper.title.toLowerCase().includes(lowerSearchTerm);
      const abstractMatch = paper.abstract.toLowerCase().includes(lowerSearchTerm);
      const tagsMatch = paper.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm));
      return titleMatch || abstractMatch || tagsMatch;
    });
  } catch (error) {
    console.error('Failed to search papers:', error);
    throw error;
  }
};

/**
 * Note CRUD Operations
 */

/**
 * Create a new note
 */
export const createNote = async (
  noteData: Omit<Note, 'id' | 'dateCreated' | 'dateModified'>
): Promise<Note> => {
  try {
    const now = new Date().toISOString();
    const note: Note = {
      ...noteData,
      id: uuidv4(),
      dateCreated: now,
      dateModified: now,
    };

    await db.notes.add(note);
    return note;
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

/**
 * Get all notes for a specific paper
 */
export const getNotesByPaperId = async (paperId: string): Promise<Note[]> => {
  try {
    return await db.notes.where('paperId').equals(paperId).toArray();
  } catch (error) {
    console.error('Failed to get notes:', error);
    throw error;
  }
};

/**
 * Saved Search Operations
 */

/**
 * Create a saved search
 */
export const createSavedSearch = async (
  searchData: Omit<SavedSearch, 'id' | 'dateCreated' | 'lastUsed' | 'useCount'>
): Promise<SavedSearch> => {
  try {
    const now = new Date().toISOString();
    const search: SavedSearch = {
      ...searchData,
      id: uuidv4(),
      dateCreated: now,
      lastUsed: now,
      useCount: 0,
    };

    await db.searches.add(search);
    return search;
  } catch (error) {
    console.error('Failed to create saved search:', error);
    throw error;
  }
};

/**
 * Get all saved searches
 */
export const getSavedSearches = async (): Promise<SavedSearch[]> => {
  try {
    return await db.searches.orderBy('lastUsed').reverse().toArray();
  } catch (error) {
    console.error('Failed to get saved searches:', error);
    throw error;
  }
};

/**
 * Database Statistics
 */

/**
 * Get database statistics for dashboard
 */
export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    const allPapers = await db.papers.toArray();
    const totalPapers = allPapers.length;
    const unreadPapers = allPapers.filter((p) => p.readStatus === ReadStatus.UNREAD).length;
    const readPapers = allPapers.filter((p) => p.readStatus === ReadStatus.READ).length;
    const papersWithSummaries = allPapers.filter((p) => p.aiSummary).length;
    const totalNotes = await db.notes.count();
    const savedSearches = await db.searches.count();

    return {
      totalPapers,
      unreadPapers,
      readPapers,
      papersWithSummaries,
      totalNotes,
      savedSearches,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
};

