/**
 * Tests for database service
 * @ai-context Unit tests for database initialization and management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  db,
  initializeDatabase,
  clearAllData,
  exportDatabase,
  importDatabase,
} from './db';
import {
  createMockPaper,
  createMockNote,
  createMockSavedSearch,
  createMockQuestion,
  createMockFinding,
  createMockContradiction,
} from '@/test/helpers';

describe('Database Service', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
    await db.close();
  });

  describe('initializeDatabase', () => {
    it('should successfully initialize database', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should create all required tables', async () => {
      await initializeDatabase();

      expect(db.papers).toBeDefined();
      expect(db.notes).toBeDefined();
      expect(db.searches).toBeDefined();
      expect(db.questions).toBeDefined();
      expect(db.findings).toBeDefined();
      expect(db.contradictions).toBeDefined();
    });
  });

  describe('clearAllData', () => {
    it('should clear all papers', async () => {
      const papers = [createMockPaper(), createMockPaper()];
      await db.papers.bulkAdd(papers);

      await clearAllData();

      const count = await db.papers.count();
      expect(count).toBe(0);
    });

    it('should clear all notes', async () => {
      const notes = [createMockNote(), createMockNote()];
      await db.notes.bulkAdd(notes);

      await clearAllData();

      const count = await db.notes.count();
      expect(count).toBe(0);
    });

    it('should clear all searches', async () => {
      const searches = [createMockSavedSearch(), createMockSavedSearch()];
      await db.searches.bulkAdd(searches);

      await clearAllData();

      const count = await db.searches.count();
      expect(count).toBe(0);
    });

    it('should clear all questions', async () => {
      const questions = [createMockQuestion(), createMockQuestion()];
      await db.questions.bulkAdd(questions);

      await clearAllData();

      const count = await db.questions.count();
      expect(count).toBe(0);
    });

    it('should clear all findings', async () => {
      const findings = [createMockFinding(), createMockFinding()];
      await db.findings.bulkAdd(findings);

      await clearAllData();

      const count = await db.findings.count();
      expect(count).toBe(0);
    });

    it('should clear all contradictions', async () => {
      const contradictions = [
        createMockContradiction(),
        createMockContradiction(),
      ];
      await db.contradictions.bulkAdd(contradictions);

      await clearAllData();

      const count = await db.contradictions.count();
      expect(count).toBe(0);
    });

    it('should clear all tables at once', async () => {
      await db.papers.add(createMockPaper());
      await db.notes.add(createMockNote());
      await db.searches.add(createMockSavedSearch());
      await db.questions.add(createMockQuestion());
      await db.findings.add(createMockFinding());
      await db.contradictions.add(createMockContradiction());

      await clearAllData();

      expect(await db.papers.count()).toBe(0);
      expect(await db.notes.count()).toBe(0);
      expect(await db.searches.count()).toBe(0);
      expect(await db.questions.count()).toBe(0);
      expect(await db.findings.count()).toBe(0);
      expect(await db.contradictions.count()).toBe(0);
    });
  });

  describe('exportDatabase', () => {
    it('should export all data from all tables', async () => {
      const paper = createMockPaper();
      const note = createMockNote();
      const search = createMockSavedSearch();
      const question = createMockQuestion();
      const finding = createMockFinding();
      const contradiction = createMockContradiction();

      await db.papers.add(paper);
      await db.notes.add(note);
      await db.searches.add(search);
      await db.questions.add(question);
      await db.findings.add(finding);
      await db.contradictions.add(contradiction);

      const exported = await exportDatabase();

      expect(exported.papers).toHaveLength(1);
      expect(exported.notes).toHaveLength(1);
      expect(exported.searches).toHaveLength(1);
      expect(exported.questions).toHaveLength(1);
      expect(exported.findings).toHaveLength(1);
      expect(exported.contradictions).toHaveLength(1);

      expect(exported.papers[0].id).toBe(paper.id);
      expect(exported.notes[0].id).toBe(note.id);
      expect(exported.searches[0].id).toBe(search.id);
      expect(exported.questions[0].id).toBe(question.id);
      expect(exported.findings[0].id).toBe(finding.id);
      expect(exported.contradictions[0].id).toBe(contradiction.id);
    });

    it('should export empty arrays for empty database', async () => {
      const exported = await exportDatabase();

      expect(exported.papers).toEqual([]);
      expect(exported.notes).toEqual([]);
      expect(exported.searches).toEqual([]);
      expect(exported.questions).toEqual([]);
      expect(exported.findings).toEqual([]);
      expect(exported.contradictions).toEqual([]);
    });

    it('should handle multiple items in each table', async () => {
      const papers = [createMockPaper(), createMockPaper(), createMockPaper()];
      const notes = [createMockNote(), createMockNote()];

      await db.papers.bulkAdd(papers);
      await db.notes.bulkAdd(notes);

      const exported = await exportDatabase();

      expect(exported.papers).toHaveLength(3);
      expect(exported.notes).toHaveLength(2);
    });
  });

  describe('importDatabase', () => {
    it('should import papers', async () => {
      const papers = [createMockPaper(), createMockPaper()];

      await importDatabase({ papers });

      const count = await db.papers.count();
      expect(count).toBe(2);
    });

    it('should import notes', async () => {
      const notes = [createMockNote(), createMockNote()];

      await importDatabase({ notes });

      const count = await db.notes.count();
      expect(count).toBe(2);
    });

    it('should import searches', async () => {
      const searches = [createMockSavedSearch()];

      await importDatabase({ searches });

      const count = await db.searches.count();
      expect(count).toBe(1);
    });

    it('should import questions', async () => {
      const questions = [createMockQuestion(), createMockQuestion()];

      await importDatabase({ questions });

      const count = await db.questions.count();
      expect(count).toBe(2);
    });

    it('should import findings', async () => {
      const findings = [createMockFinding()];

      await importDatabase({ findings });

      const count = await db.findings.count();
      expect(count).toBe(1);
    });

    it('should import contradictions', async () => {
      const contradictions = [createMockContradiction()];

      await importDatabase({ contradictions });

      const count = await db.contradictions.count();
      expect(count).toBe(1);
    });

    it('should import all tables at once', async () => {
      const data = {
        papers: [createMockPaper()],
        notes: [createMockNote()],
        searches: [createMockSavedSearch()],
        questions: [createMockQuestion()],
        findings: [createMockFinding()],
        contradictions: [createMockContradiction()],
      };

      await importDatabase(data);

      expect(await db.papers.count()).toBe(1);
      expect(await db.notes.count()).toBe(1);
      expect(await db.searches.count()).toBe(1);
      expect(await db.questions.count()).toBe(1);
      expect(await db.findings.count()).toBe(1);
      expect(await db.contradictions.count()).toBe(1);
    });

    it('should handle partial imports', async () => {
      await importDatabase({ papers: [createMockPaper()] });

      expect(await db.papers.count()).toBe(1);
      expect(await db.notes.count()).toBe(0);
    });

    it('should update existing records with same ID', async () => {
      const paper = createMockPaper({ title: 'Original Title' });
      await db.papers.add(paper);

      const updatedPaper = { ...paper, title: 'Updated Title' };
      await importDatabase({ papers: [updatedPaper] });

      const retrieved = await db.papers.get(paper.id);
      expect(retrieved?.title).toBe('Updated Title');
    });
  });

  describe('Export and Import Integration', () => {
    it('should maintain data integrity through export/import cycle', async () => {
      // Add test data
      const paper = createMockPaper({ title: 'Test Paper' });
      const note = createMockNote({ content: 'Test Note' });
      const question = createMockQuestion({ question: 'Test Question?' });

      await db.papers.add(paper);
      await db.notes.add(note);
      await db.questions.add(question);

      // Export
      const exported = await exportDatabase();

      // Clear database
      await clearAllData();
      expect(await db.papers.count()).toBe(0);

      // Import
      await importDatabase(exported);

      // Verify data
      const retrievedPaper = await db.papers.get(paper.id);
      const retrievedNote = await db.notes.get(note.id);
      const retrievedQuestion = await db.questions.get(question.id);

      expect(retrievedPaper?.title).toBe('Test Paper');
      expect(retrievedNote?.content).toBe('Test Note');
      expect(retrievedQuestion?.question).toBe('Test Question?');
    });
  });
});

