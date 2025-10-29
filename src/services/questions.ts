/**
 * Service layer for research questions CRUD operations
 * @ai-context Database operations for Q&A system with conservative evidence synthesis
 */

import { db } from './db';
import type { ResearchQuestion, QuestionVersion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type { Contradiction } from '@/types/contradiction';
import { QuestionStatus } from '@/types/question';

/**
 * Create a new research question
 */
export const createQuestion = async (
  question: ResearchQuestion
): Promise<string> => {
  try {
    const id = await db.questions.add(question);
    return id;
  } catch (error) {
    console.error('Failed to create question:', error);
    throw new Error('Failed to create research question');
  }
};

/**
 * Get a question by ID
 */
export const getQuestion = async (
  id: string
): Promise<ResearchQuestion | undefined> => {
  try {
    return await db.questions.get(id);
  } catch (error) {
    console.error('Failed to get question:', error);
    throw new Error('Failed to retrieve question');
  }
};

/**
 * Get all questions
 */
export const getAllQuestions = async (): Promise<ResearchQuestion[]> => {
  try {
    return await db.questions.toArray();
  } catch (error) {
    console.error('Failed to get all questions:', error);
    throw new Error('Failed to retrieve questions');
  }
};

/**
 * Get questions by status
 */
export const getQuestionsByStatus = async (
  status: QuestionStatus
): Promise<ResearchQuestion[]> => {
  try {
    return await db.questions.where('status').equals(status).toArray();
  } catch (error) {
    console.error('Failed to get questions by status:', error);
    throw new Error('Failed to retrieve questions by status');
  }
};

/**
 * Get priority questions
 */
export const getPriorityQuestions = async (): Promise<ResearchQuestion[]> => {
  try {
    return await db.questions.filter(q => q.isPriority === true).toArray();
  } catch (error) {
    console.error('Failed to get priority questions:', error);
    throw new Error('Failed to retrieve priority questions');
  }
};

/**
 * Update a question
 */
export const updateQuestion = async (
  id: string,
  updates: Partial<ResearchQuestion>
): Promise<void> => {
  try {
    await db.questions.update(id, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update question:', error);
    throw new Error('Failed to update question');
  }
};

/**
 * Delete a question and its associated findings and contradictions
 */
export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    // Delete associated findings
    const findings = await db.findings.where('questionId').equals(id).toArray();
    const findingIds = findings.map((f) => f.id);

    // Delete contradictions associated with these findings
    for (const findingId of findingIds) {
      await db.contradictions.where('findingId').equals(findingId).delete();
    }

    // Delete findings
    await db.findings.where('questionId').equals(id).delete();

    // Delete question
    await db.questions.delete(id);
  } catch (error) {
    console.error('Failed to delete question:', error);
    throw new Error('Failed to delete question');
  }
};

/**
 * Add a finding to a question
 */
export const addFindingToQuestion = async (
  questionId: string,
  finding: Finding
): Promise<void> => {
  try {
    // Add finding to database
    await db.findings.add(finding);

    // Update question's last updated timestamp and paper count
    const question = await db.questions.get(questionId);
    if (question) {
      const findings = await db.findings
        .where('questionId')
        .equals(questionId)
        .toArray();
      
      // Count unique papers across all findings
      const allPaperIds = new Set<string>();
      findings.forEach((f) => {
        f.supportingPapers.forEach((paperId) => allPaperIds.add(paperId));
      });

      await updateQuestion(questionId, {
        findings: findings,
        paperCount: allPaperIds.size,
      });
    }
  } catch (error) {
    console.error('Failed to add finding to question:', error);
    throw new Error('Failed to add finding');
  }
};

/**
 * Add a contradiction to a question
 */
export const addContradictionToQuestion = async (
  questionId: string,
  contradiction: Contradiction
): Promise<void> => {
  try {
    // Add contradiction to database
    await db.contradictions.add(contradiction);

    // Update question
    const question = await db.questions.get(questionId);
    if (question) {
      const contradictions = await getContradictionsForQuestion(questionId);
      await updateQuestion(questionId, {
        contradictions: contradictions,
      });
    }
  } catch (error) {
    console.error('Failed to add contradiction to question:', error);
    throw new Error('Failed to add contradiction');
  }
};

/**
 * Get all findings for a question
 */
export const getFindingsForQuestion = async (
  questionId: string
): Promise<Finding[]> => {
  try {
    return await db.findings.where('questionId').equals(questionId).toArray();
  } catch (error) {
    console.error('Failed to get findings for question:', error);
    throw new Error('Failed to retrieve findings');
  }
};

/**
 * Get all contradictions for a question
 */
export const getContradictionsForQuestion = async (
  questionId: string
): Promise<Contradiction[]> => {
  try {
    const findings = await getFindingsForQuestion(questionId);
    const findingIds = findings.map((f) => f.id);

    const contradictions: Contradiction[] = [];
    for (const findingId of findingIds) {
      const foundContradictions = await db.contradictions
        .where('findingId')
        .equals(findingId)
        .toArray();
      contradictions.push(...foundContradictions);
    }

    return contradictions;
  } catch (error) {
    console.error('Failed to get contradictions for question:', error);
    throw new Error('Failed to retrieve contradictions');
  }
};

/**
 * Update question status based on findings
 */
export const updateQuestionStatus = async (
  questionId: string
): Promise<void> => {
  try {
    const findings = await getFindingsForQuestion(questionId);

    let status: QuestionStatus;
    let confidence = 0;

    if (findings.length === 0) {
      status = QuestionStatus.UNANSWERED;
      confidence = 0;
    } else if (findings.length < 3) {
      status = QuestionStatus.PARTIAL;
      confidence = 0.5;
    } else {
      status = QuestionStatus.ANSWERED;
      // Calculate confidence based on consistency and paper count
      const avgConsistency =
        findings.filter((f) => f.consistency === 'high').length /
        findings.length;
      confidence = Math.min(0.9, avgConsistency); // Cap at 0.9
    }

    await updateQuestion(questionId, { status, confidence });
  } catch (error) {
    console.error('Failed to update question status:', error);
    throw new Error('Failed to update question status');
  }
};

/**
 * Search questions by text
 */
export const searchQuestions = async (
  searchText: string
): Promise<ResearchQuestion[]> => {
  try {
    const allQuestions = await getAllQuestions();
    const lowerSearch = searchText.toLowerCase();
    
    return allQuestions.filter((q) =>
      q.question.toLowerCase().includes(lowerSearch)
    );
  } catch (error) {
    console.error('Failed to search questions:', error);
    throw new Error('Failed to search questions');
  }
};

/**
 * Update notes on a finding
 */
export const updateFindingNotes = async (
  findingId: string,
  notes: string
): Promise<void> => {
  try {
    await db.findings.update(findingId, {
      userNotes: notes,
      notesLastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update finding notes:', error);
    throw new Error('Failed to update finding notes');
  }
};

/**
 * Save a question version to history
 */
export const saveQuestionVersion = async (
  questionId: string,
  version: QuestionVersion
): Promise<void> => {
  try {
    await db.questionVersions.add({
      ...version,
      questionId,
    });
  } catch (error) {
    console.error('Failed to save question version:', error);
    throw new Error('Failed to save question version');
  }
};

/**
 * Get all versions for a question
 */
export const getQuestionVersions = async (
  questionId: string
): Promise<QuestionVersion[]> => {
  try {
    const versions = await db.questionVersions
      .where('questionId')
      .equals(questionId)
      .sortBy('versionNumber');
    
    // Strip out the questionId field before returning
    return versions.map(({ questionId: _, ...version }) => version as QuestionVersion);
  } catch (error) {
    console.error('Failed to get question versions:', error);
    throw new Error('Failed to get question versions');
  }
};

/**
 * Get a specific version of a question
 */
export const getQuestionVersion = async (
  questionId: string,
  versionNumber: number
): Promise<QuestionVersion | undefined> => {
  try {
    const version = await db.questionVersions
      .where(['questionId', 'versionNumber'])
      .equals([questionId, versionNumber])
      .first();
    
    if (!version) return undefined;
    
    // Strip out the questionId field before returning (using _ to indicate intentionally unused)
    const { questionId: _questionId, ...versionData } = version;
    return versionData as QuestionVersion;
  } catch (error) {
    console.error('Failed to get question version:', error);
    throw new Error('Failed to get question version');
  }
};

