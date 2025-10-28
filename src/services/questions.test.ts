/**
 * Tests for questions service
 * @ai-context Unit tests for Q&A system CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createQuestion,
  getQuestion,
  getAllQuestions,
  getQuestionsByStatus,
  getPriorityQuestions,
  updateQuestion,
  deleteQuestion,
  addFindingToQuestion,
  addContradictionToQuestion,
  getFindingsForQuestion,
  getContradictionsForQuestion,
  updateQuestionStatus,
  searchQuestions,
} from './questions';
import { db, clearAllData } from './db';
import {
  createMockQuestion,
  createMockFinding,
  createMockContradiction,
} from '@/test/helpers';
import { QuestionStatus } from '@/types/question';
import { Consistency } from '@/types/finding';

describe('Questions Service', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('createQuestion', () => {
    it('should create a question and return its ID', async () => {
      const question = createMockQuestion();

      const id = await createQuestion(question);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should persist question to database', async () => {
      const question = createMockQuestion({ question: 'Test Question?' });

      const id = await createQuestion(question);
      const retrieved = await db.questions.get(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.question).toBe('Test Question?');
    });
  });

  describe('getQuestion', () => {
    it('should retrieve question by ID', async () => {
      const question = createMockQuestion();
      await db.questions.add(question);

      const result = await getQuestion(question.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(question.id);
      expect(result?.question).toBe(question.question);
    });

    it('should return undefined for non-existent ID', async () => {
      const result = await getQuestion('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllQuestions', () => {
    it('should retrieve all questions', async () => {
      const questions = [
        createMockQuestion({ question: 'Question 1?' }),
        createMockQuestion({ question: 'Question 2?' }),
        createMockQuestion({ question: 'Question 3?' }),
      ];
      await db.questions.bulkAdd(questions);

      const result = await getAllQuestions();

      expect(result).toHaveLength(3);
    });

    it('should return empty array when no questions exist', async () => {
      const result = await getAllQuestions();
      expect(result).toHaveLength(0);
    });
  });

  describe('getQuestionsByStatus', () => {
    it('should filter questions by status', async () => {
      const unanswered = createMockQuestion({
        status: QuestionStatus.UNANSWERED,
      });
      const answered = createMockQuestion({ status: QuestionStatus.ANSWERED });
      const partial = createMockQuestion({ status: QuestionStatus.PARTIAL });

      await db.questions.bulkAdd([unanswered, answered, partial]);

      const result = await getQuestionsByStatus(QuestionStatus.ANSWERED);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(answered.id);
    });

    it('should return empty array when no questions match status', async () => {
      const result = await getQuestionsByStatus(QuestionStatus.ANSWERED);
      expect(result).toHaveLength(0);
    });
  });

  describe('getPriorityQuestions', () => {
    it('should retrieve only priority questions', async () => {
      const priority = createMockQuestion({ isPriority: true });
      const normal1 = createMockQuestion({ isPriority: false });
      const normal2 = createMockQuestion({ isPriority: false });

      await db.questions.bulkAdd([priority, normal1, normal2]);

      const result = await getPriorityQuestions();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(priority.id);
    });
  });

  describe('updateQuestion', () => {
    it('should update question fields', async () => {
      const question = createMockQuestion();
      await db.questions.add(question);

      await updateQuestion(question.id, { question: 'Updated Question?' });

      const updated = await db.questions.get(question.id);
      expect(updated?.question).toBe('Updated Question?');
    });

    it('should update lastUpdated timestamp', async () => {
      const question = createMockQuestion();
      await db.questions.add(question);
      const originalUpdated = question.lastUpdated;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await updateQuestion(question.id, { isPriority: true });

      const updated = await db.questions.get(question.id);
      expect(updated?.lastUpdated).not.toBe(originalUpdated);
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question and associated findings', async () => {
      const question = createMockQuestion();
      const finding = createMockFinding({ questionId: question.id });

      await db.questions.add(question);
      await db.findings.add(finding);

      await deleteQuestion(question.id);

      const deletedQuestion = await db.questions.get(question.id);
      const deletedFinding = await db.findings.get(finding.id);

      expect(deletedQuestion).toBeUndefined();
      expect(deletedFinding).toBeUndefined();
    });

    it('should delete question and associated contradictions', async () => {
      const question = createMockQuestion();
      const finding = createMockFinding({ questionId: question.id });
      const contradiction = createMockContradiction({ findingId: finding.id });

      await db.questions.add(question);
      await db.findings.add(finding);
      await db.contradictions.add(contradiction);

      await deleteQuestion(question.id);

      const deletedContradiction = await db.contradictions.get(contradiction.id);
      expect(deletedContradiction).toBeUndefined();
    });
  });

  describe('addFindingToQuestion', () => {
    it('should add finding to database', async () => {
      const question = createMockQuestion();
      const finding = createMockFinding({ questionId: question.id });

      await db.questions.add(question);
      await addFindingToQuestion(question.id, finding);

      const retrieved = await db.findings.get(finding.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.description).toBe(finding.description);
    });

    it('should update question paper count', async () => {
      const question = createMockQuestion();
      const paperId1 = 'paper-1';
      const paperId2 = 'paper-2';
      const finding1 = createMockFinding({
        questionId: question.id,
        supportingPapers: [paperId1],
      });
      const finding2 = createMockFinding({
        questionId: question.id,
        supportingPapers: [paperId2],
      });

      await db.questions.add(question);
      await addFindingToQuestion(question.id, finding1);
      await addFindingToQuestion(question.id, finding2);

      const updated = await db.questions.get(question.id);
      expect(updated?.paperCount).toBe(2);
    });

    it('should count unique papers only', async () => {
      const question = createMockQuestion();
      const paperId = 'same-paper';
      const finding1 = createMockFinding({
        questionId: question.id,
        supportingPapers: [paperId],
      });
      const finding2 = createMockFinding({
        questionId: question.id,
        supportingPapers: [paperId],
      });

      await db.questions.add(question);
      await addFindingToQuestion(question.id, finding1);
      await addFindingToQuestion(question.id, finding2);

      const updated = await db.questions.get(question.id);
      expect(updated?.paperCount).toBe(1);
    });
  });

  describe('addContradictionToQuestion', () => {
    it('should add contradiction to database', async () => {
      const question = createMockQuestion();
      const finding = createMockFinding({ questionId: question.id });
      const contradiction = createMockContradiction({ findingId: finding.id });

      await db.questions.add(question);
      await db.findings.add(finding);
      await addContradictionToQuestion(question.id, contradiction);

      const retrieved = await db.contradictions.get(contradiction.id);
      expect(retrieved).toBeDefined();
    });
  });

  describe('getFindingsForQuestion', () => {
    it('should retrieve all findings for a question', async () => {
      const question = createMockQuestion();
      const finding1 = createMockFinding({ questionId: question.id });
      const finding2 = createMockFinding({ questionId: question.id });
      const otherFinding = createMockFinding({ questionId: 'other-question' });

      await db.questions.add(question);
      await db.findings.bulkAdd([finding1, finding2, otherFinding]);

      const result = await getFindingsForQuestion(question.id);

      expect(result).toHaveLength(2);
      expect(result.map((f) => f.id)).toContain(finding1.id);
      expect(result.map((f) => f.id)).toContain(finding2.id);
    });
  });

  describe('getContradictionsForQuestion', () => {
    it('should retrieve all contradictions for a question', async () => {
      const question = createMockQuestion();
      const finding1 = createMockFinding({ questionId: question.id });
      const finding2 = createMockFinding({ questionId: question.id });
      const contradiction1 = createMockContradiction({ findingId: finding1.id });
      const contradiction2 = createMockContradiction({ findingId: finding2.id });

      await db.questions.add(question);
      await db.findings.bulkAdd([finding1, finding2]);
      await db.contradictions.bulkAdd([contradiction1, contradiction2]);

      const result = await getContradictionsForQuestion(question.id);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toContain(contradiction1.id);
      expect(result.map((c) => c.id)).toContain(contradiction2.id);
    });
  });

  describe('updateQuestionStatus', () => {
    it('should set status to UNANSWERED with no findings', async () => {
      const question = createMockQuestion();
      await db.questions.add(question);

      await updateQuestionStatus(question.id);

      const updated = await db.questions.get(question.id);
      expect(updated?.status).toBe(QuestionStatus.UNANSWERED);
      expect(updated?.confidence).toBe(0);
    });

    it('should set status to PARTIAL with few findings', async () => {
      const question = createMockQuestion();
      const finding1 = createMockFinding({ questionId: question.id });
      const finding2 = createMockFinding({ questionId: question.id });

      await db.questions.add(question);
      await db.findings.bulkAdd([finding1, finding2]);

      await updateQuestionStatus(question.id);

      const updated = await db.questions.get(question.id);
      expect(updated?.status).toBe(QuestionStatus.PARTIAL);
      expect(updated?.confidence).toBe(0.5);
    });

    it('should set status to ANSWERED with many findings', async () => {
      const question = createMockQuestion();
      const findings = Array.from({ length: 5 }, () =>
        createMockFinding({
          questionId: question.id,
          consistency: Consistency.HIGH,
        })
      );

      await db.questions.add(question);
      await db.findings.bulkAdd(findings);

      await updateQuestionStatus(question.id);

      const updated = await db.questions.get(question.id);
      expect(updated?.status).toBe(QuestionStatus.ANSWERED);
      expect(updated?.confidence).toBeGreaterThan(0.5);
    });

    it('should calculate confidence based on consistency', async () => {
      const question = createMockQuestion();
      const highConsistency = Array.from({ length: 3 }, () =>
        createMockFinding({ questionId: question.id, consistency: Consistency.HIGH })
      );
      const lowConsistency = Array.from({ length: 2 }, () =>
        createMockFinding({ questionId: question.id, consistency: Consistency.LOW })
      );

      await db.questions.add(question);
      await db.findings.bulkAdd([...highConsistency, ...lowConsistency]);

      await updateQuestionStatus(question.id);

      const updated = await db.questions.get(question.id);
      // 3/5 = 0.6 high consistency findings
      expect(updated?.confidence).toBe(0.6);
    });
  });

  describe('searchQuestions', () => {
    it('should find questions by text match', async () => {
      const questions = [
        createMockQuestion({ question: 'What are the biomarkers for ME/CFS?' }),
        createMockQuestion({
          question: 'How is chronic fatigue syndrome treated?',
        }),
        createMockQuestion({ question: 'What causes ME/CFS?' }),
      ];

      await db.questions.bulkAdd(questions);

      const result = await searchQuestions('biomarkers');

      expect(result).toHaveLength(1);
      expect(result[0].question).toContain('biomarkers');
    });

    it('should be case insensitive', async () => {
      const question = createMockQuestion({
        question: 'What are ME/CFS biomarkers?',
      });
      await db.questions.add(question);

      const result = await searchQuestions('BIOMARKERS');

      expect(result).toHaveLength(1);
    });

    it('should return empty array when no matches', async () => {
      const result = await searchQuestions('nonexistent-term-xyz');
      expect(result).toHaveLength(0);
    });

    it('should find partial word matches', async () => {
      const question = createMockQuestion({
        question: 'What are biomarkers?',
      });
      await db.questions.add(question);

      const result = await searchQuestions('marker');

      expect(result).toHaveLength(1);
    });
  });
});

