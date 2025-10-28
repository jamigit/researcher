/**
 * Hook for paper CRUD operations with Dexie
 * @ai-context React Query-style hook for managing paper data with IndexedDB
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';
import type { ResearchPaper } from '@/types/paper';
import { ReadStatus, Importance, Category } from '@/types/paper';
import { createPaper, updatePaper, deletePaper, searchPapers } from '@/services/storage';

/**
 * Get all papers with optional filtering
 */
export const usePapers = (options?: {
  readStatus?: ReadStatus;
  importance?: Importance;
  category?: Category;
}) => {
  const papers = useLiveQuery(async () => {
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

    // Sort by date added (most recent first)
    return await query.reverse().sortBy('dateAdded');
  }, [options?.readStatus, options?.importance, options?.category]);

  return {
    papers: papers || [],
    isLoading: papers === undefined,
  };
};

/**
 * Get a single paper by ID
 */
export const usePaper = (id: string) => {
  const paper = useLiveQuery(() => db.papers.get(id), [id]);

  return {
    paper,
    isLoading: paper === undefined,
  };
};

/**
 * Get unread papers count
 */
export const useUnreadCount = () => {
  const count = useLiveQuery(
    () => db.papers.where('readStatus').equals(ReadStatus.UNREAD).count(),
    []
  );

  return count || 0;
};

/**
 * Get recent papers (last 5)
 */
export const useRecentPapers = (limit = 5) => {
  const papers = useLiveQuery(
    () => db.papers.orderBy('dateAdded').reverse().limit(limit).toArray(),
    [limit]
  );

  return {
    papers: papers || [],
    isLoading: papers === undefined,
  };
};

/**
 * Hook for paper operations (create, update, delete)
 */
export const usePaperOperations = () => {
  const addPaper = async (
    paperData: Omit<ResearchPaper, 'id' | 'dateAdded' | 'dateModified'>
  ) => {
    try {
      return await createPaper(paperData);
    } catch (error) {
      console.error('Failed to add paper:', error);
      throw error;
    }
  };

  const updatePaperData = async (
    id: string,
    updates: Partial<Omit<ResearchPaper, 'id' | 'dateAdded'>>
  ) => {
    try {
      await updatePaper(id, updates);
    } catch (error) {
      console.error('Failed to update paper:', error);
      throw error;
    }
  };

  const removePaper = async (id: string) => {
    try {
      await deletePaper(id);
    } catch (error) {
      console.error('Failed to delete paper:', error);
      throw error;
    }
  };

  const searchPapersByText = async (searchTerm: string) => {
    try {
      return await searchPapers(searchTerm);
    } catch (error) {
      console.error('Failed to search papers:', error);
      throw error;
    }
  };

  return {
    addPaper,
    updatePaper: updatePaperData,
    removePaper,
    searchPapers: searchPapersByText,
  };
};

