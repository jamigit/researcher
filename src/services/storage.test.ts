/**
 * Tests for storage service
 * @ai-context Unit tests for paper CRUD operations with fake-indexeddb
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createPaper,
  getPaperById,
  getAllPapers,
  updatePaper,
  deletePaper,
  searchPapers,
  createNote,
  getNotesByPaperId,
  createSavedSearch,
  getSavedSearches,
  getDatabaseStats,
} from './storage';
import { db, clearAllData } from './db';
import { createMockPaper, createMockNote, createMockSavedSearch } from '@/test/helpers';
import { ReadStatus, Importance, Category } from '@/types/paper';

describe('Storage Service - Papers', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('createPaper', () => {
    it('should create a paper with generated ID and timestamps', async () => {
      const paperData = createMockPaper();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).dateAdded;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).dateModified;

      const result = await createPaper(paperData);

      expect(result.id).toBeDefined();
      expect(result.dateAdded).toBeDefined();
      expect(result.dateModified).toBeDefined();
      expect(result.title).toBe(paperData.title);
    });

    it('should set default values for optional fields', async () => {
      const paperData = {
        title: 'Test Paper',
        authors: [{ name: 'John Doe' }],
        abstract: 'Test abstract with sufficient length for validation purposes.',
        publicationDate: '2024-01-15T00:00:00.000Z',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createPaper(paperData as any);

      expect(result.readStatus).toBe(ReadStatus.UNREAD);
      expect(result.importance).toBe(Importance.MEDIUM);
      expect(result.categories).toEqual([]);
      expect(result.tags).toEqual([]);
      expect(result.fullTextAvailable).toBe(false);
    });

    it('should persist paper to database', async () => {
      const paperData = createMockPaper();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).dateAdded;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (paperData as any).dateModified;

      const created = await createPaper(paperData);
      const retrieved = await db.papers.get(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe(paperData.title);
    });
  });

  describe('getPaperById', () => {
    it('should retrieve paper by ID', async () => {
      const paper = createMockPaper();
      await db.papers.add(paper);

      const result = await getPaperById(paper.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(paper.id);
      expect(result?.title).toBe(paper.title);
    });

    it('should return undefined for non-existent ID', async () => {
      const result = await getPaperById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllPapers', () => {
    it('should retrieve all papers', async () => {
      const paper1 = createMockPaper({ title: 'Paper 1' });
      const paper2 = createMockPaper({ title: 'Paper 2' });
      await db.papers.bulkAdd([paper1, paper2]);

      const result = await getAllPapers();

      expect(result).toHaveLength(2);
    });

    it('should filter by read status', async () => {
      const unread = createMockPaper({ readStatus: ReadStatus.UNREAD });
      const read = createMockPaper({ readStatus: ReadStatus.READ });
      await db.papers.bulkAdd([unread, read]);

      const result = await getAllPapers({ readStatus: ReadStatus.UNREAD });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(unread.id);
    });

    it('should filter by importance', async () => {
      const high = createMockPaper({ importance: Importance.HIGH });
      const medium = createMockPaper({ importance: Importance.MEDIUM });
      await db.papers.bulkAdd([high, medium]);

      const result = await getAllPapers({ importance: Importance.HIGH });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(high.id);
    });

    it('should filter by category', async () => {
      const biomarkers = createMockPaper({ categories: [Category.BIOMARKERS] });
      const treatment = createMockPaper({ categories: [Category.TREATMENT] });
      await db.papers.bulkAdd([biomarkers, treatment]);

      const result = await getAllPapers({ category: Category.BIOMARKERS });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(biomarkers.id);
    });

    it('should apply limit', async () => {
      const papers = Array.from({ length: 5 }, (_, i) =>
        createMockPaper({ title: `Paper ${i}` })
      );
      await db.papers.bulkAdd(papers);

      const result = await getAllPapers({ limit: 3 });

      expect(result).toHaveLength(3);
    });

    it('should sort by specified field', async () => {
      const paper1 = createMockPaper({ title: 'A Paper' });
      const paper2 = createMockPaper({ title: 'Z Paper' });
      await db.papers.bulkAdd([paper2, paper1]);

      const result = await getAllPapers({ sortBy: 'title', sortOrder: 'asc' });

      expect(result[0].title).toBe('A Paper');
      expect(result[1].title).toBe('Z Paper');
    });
  });

  describe('updatePaper', () => {
    it('should update paper fields', async () => {
      const paper = createMockPaper();
      await db.papers.add(paper);

      await updatePaper(paper.id, { title: 'Updated Title' });

      const updated = await db.papers.get(paper.id);
      expect(updated?.title).toBe('Updated Title');
    });

    it('should update dateModified timestamp', async () => {
      const paper = createMockPaper();
      await db.papers.add(paper);
      const originalModified = paper.dateModified;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await updatePaper(paper.id, { readStatus: ReadStatus.READ });

      const updated = await db.papers.get(paper.id);
      expect(updated?.dateModified).not.toBe(originalModified);
    });

    it('should not modify dateAdded', async () => {
      const paper = createMockPaper();
      await db.papers.add(paper);
      const originalAdded = paper.dateAdded;

      await updatePaper(paper.id, { title: 'Updated' });

      const updated = await db.papers.get(paper.id);
      expect(updated?.dateAdded).toBe(originalAdded);
    });
  });

  describe('deletePaper', () => {
    it('should delete paper from database', async () => {
      const paper = createMockPaper();
      await db.papers.add(paper);

      await deletePaper(paper.id);

      const result = await db.papers.get(paper.id);
      expect(result).toBeUndefined();
    });

    it('should not throw error when deleting non-existent paper', async () => {
      await expect(deletePaper('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('searchPapers', () => {
    beforeEach(async () => {
      const papers = [
        createMockPaper({
          title: 'Biomarkers for ME/CFS Diagnosis',
          abstract: 'This paper discusses cytokine levels in ME/CFS patients',
          tags: ['biomarkers', 'cytokines'],
        }),
        createMockPaper({
          title: 'Treatment Options for Chronic Fatigue',
          abstract: 'Review of various treatment approaches',
          tags: ['treatment', 'therapy'],
        }),
        createMockPaper({
          title: 'Energy Metabolism in ME/CFS',
          abstract: 'Study on mitochondrial function and energy production',
          tags: ['metabolism', 'mitochondria'],
        }),
      ];
      await db.papers.bulkAdd(papers);
    });

    it('should find papers by title match', async () => {
      const result = await searchPapers('biomarkers');
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Biomarkers');
    });

    it('should find papers by abstract match', async () => {
      const result = await searchPapers('mitochondrial');
      expect(result).toHaveLength(1);
      expect(result[0].abstract).toContain('mitochondrial');
    });

    it('should find papers by tag match', async () => {
      const result = await searchPapers('cytokines');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('cytokines');
    });

    it('should be case insensitive', async () => {
      const result = await searchPapers('BIOMARKERS');
      expect(result).toHaveLength(1);
    });

    it('should return multiple matches', async () => {
      const result = await searchPapers('ME/CFS');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for no matches', async () => {
      const result = await searchPapers('nonexistent-term-xyz');
      expect(result).toHaveLength(0);
    });
  });
});

describe('Storage Service - Notes', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('createNote', () => {
    it('should create note with generated ID and timestamps', async () => {
      const noteData = createMockNote();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).dateCreated;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).dateModified;

      const result = await createNote(noteData);

      expect(result.id).toBeDefined();
      expect(result.dateCreated).toBeDefined();
      expect(result.dateModified).toBeDefined();
    });

    it('should persist note to database', async () => {
      const noteData = createMockNote();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).dateCreated;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (noteData as any).dateModified;

      const created = await createNote(noteData);
      const retrieved = await db.notes.get(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.content).toBe(noteData.content);
    });
  });

  describe('getNotesByPaperId', () => {
    it('should retrieve all notes for a paper', async () => {
      const paperId = 'test-paper-id';
      const note1 = createMockNote({ paperId, content: 'Note 1' });
      const note2 = createMockNote({ paperId, content: 'Note 2' });
      const note3 = createMockNote({ paperId: 'other-paper', content: 'Note 3' });

      await db.notes.bulkAdd([note1, note2, note3]);

      const result = await getNotesByPaperId(paperId);

      expect(result).toHaveLength(2);
      expect(result.map((n) => n.content)).toContain('Note 1');
      expect(result.map((n) => n.content)).toContain('Note 2');
    });

    it('should return empty array when no notes exist', async () => {
      const result = await getNotesByPaperId('non-existent-paper');
      expect(result).toHaveLength(0);
    });
  });
});

describe('Storage Service - Saved Searches', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('createSavedSearch', () => {
    it('should create saved search with generated fields', async () => {
      const searchData = createMockSavedSearch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (searchData as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (searchData as any).dateCreated;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (searchData as any).lastUsed;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (searchData as any).useCount;

      const result = await createSavedSearch(searchData);

      expect(result.id).toBeDefined();
      expect(result.dateCreated).toBeDefined();
      expect(result.lastUsed).toBeDefined();
      expect(result.useCount).toBe(0);
    });
  });

  describe('getSavedSearches', () => {
    it('should retrieve saved searches sorted by last used', async () => {
      const now = new Date();
      const search1 = createMockSavedSearch({
        name: 'Old Search',
        lastUsed: new Date(now.getTime() - 2000).toISOString(),
      });
      const search2 = createMockSavedSearch({
        name: 'Recent Search',
        lastUsed: new Date(now.getTime() - 1000).toISOString(),
      });

      await db.searches.bulkAdd([search1, search2]);

      const result = await getSavedSearches();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Recent Search');
    });
  });
});

describe('Storage Service - Database Stats', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('getDatabaseStats', () => {
    it('should return correct statistics', async () => {
      const papers = [
        createMockPaper({ readStatus: ReadStatus.UNREAD }),
        createMockPaper({ readStatus: ReadStatus.READ }),
        createMockPaper({ 
          readStatus: ReadStatus.READ, 
          aiSummary: {
            overview: 'Test summary',
            keyFindings: ['Finding 1'],
            methodology: 'Test methodology',
            limitations: ['Limitation 1'],
            relevanceToMECFS: 'High relevance',
            actionableInsights: ['Insight 1'],
            generatedAt: new Date().toISOString(),
          }
        }),
      ];
      const notes = [createMockNote(), createMockNote()];
      const searches = [createMockSavedSearch()];

      await db.papers.bulkAdd(papers);
      await db.notes.bulkAdd(notes);
      await db.searches.bulkAdd(searches);

      const stats = await getDatabaseStats();

      expect(stats.totalPapers).toBe(3);
      expect(stats.unreadPapers).toBe(1);
      expect(stats.readPapers).toBe(2);
      expect(stats.papersWithSummaries).toBe(1);
      expect(stats.totalNotes).toBe(2);
      expect(stats.savedSearches).toBe(1);
      expect(stats.lastUpdated).toBeDefined();
    });

    it('should return zero stats for empty database', async () => {
      const stats = await getDatabaseStats();

      expect(stats.totalPapers).toBe(0);
      expect(stats.unreadPapers).toBe(0);
      expect(stats.readPapers).toBe(0);
      expect(stats.papersWithSummaries).toBe(0);
      expect(stats.totalNotes).toBe(0);
      expect(stats.savedSearches).toBe(0);
    });
  });
});

