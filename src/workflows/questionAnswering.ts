/**
 * Question Answering Workflow
 * Orchestrates evidence extraction and synthesis to answer research questions
 * @ai-context Core workflow for Phase 2 Q&A system
 */

import { db } from '@/services/db';
import type { ResearchPaper } from '@/types/paper';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import { createResearchQuestion, QuestionStatus } from '@/types/question';
import { createFinding } from '@/types/finding';
import {
  extractEvidence,
  synthesizeEvidence,
  validateConservativeLanguage,
} from '@/tools/EvidenceExtractor';
import {
  createQuestion,
  addFindingToQuestion,
  updateQuestionStatus,
  getFindingsForQuestion,
} from '@/services/questions';

/**
 * Search papers by keyword
 * Simple keyword-based search for now
 * @ai-technical-debt(medium, 4-5 hours, medium) - Implement semantic search
 */
export const searchPapers = async (
  questionText: string
): Promise<ResearchPaper[]> => {
  try {
    const allPapers = await db.papers.toArray();
    const keywords = extractKeywords(questionText);

    // Filter papers that match any keyword
    const relevantPapers = allPapers.filter((paper) => {
      const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
      return keywords.some((keyword) => searchText.includes(keyword));
    });

    console.log(
      `Found ${relevantPapers.length} papers matching question keywords`
    );
    return relevantPapers;
  } catch (error) {
    console.error('Failed to search papers:', error);
    return [];
  }
};

/**
 * Extract keywords from question text
 * Simple approach: lowercase, remove stop words, get significant terms
 */
const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'what',
    'where',
    'when',
    'why',
    'how',
    'does',
    'is',
    'are',
    'the',
    'a',
    'an',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  return Array.from(new Set(words));
};

/**
 * Answer a research question
 * Main workflow: search papers → extract evidence → synthesize answer
 */
export const answerQuestion = async (
  questionText: string
): Promise<ResearchQuestion> => {
  console.log('Answering question:', questionText);

  // Step 1: Create question object
  const question = createResearchQuestion(questionText);

  // Step 2: Search for relevant papers
  const papers = await searchPapers(questionText);
  console.log(`Found ${papers.length} potentially relevant papers`);

  if (papers.length === 0) {
    // No papers found - save unanswered question
    await createQuestion(question);
    return question;
  }

  // Step 3: Extract findings from each paper
  const findings: Finding[] = [];
  
  for (const paper of papers) {
    const extractionResult = await extractEvidence(paper, questionText);

    if (extractionResult && extractionResult.relevant) {
      // Create finding from extraction
      const finding = createFinding(
        question.id,
        extractionResult.finding || '',
        [paper.id]
      );

      finding.studyTypes = extractionResult.studyType
        ? [extractionResult.studyType]
        : [];
      finding.sampleSizes = extractionResult.sampleSize
        ? [extractionResult.sampleSize]
        : [];
      finding.qualityAssessment = `Confidence: ${extractionResult.confidence}`;
      finding.quantitativeResult = extractionResult.evidence;

      // Validate conservative language in finding
      if (validateConservativeLanguage(finding.description)) {
        findings.push(finding);
        await addFindingToQuestion(question.id, finding);
      } else {
        console.warn('Finding failed conservative language check, skipping');
      }
    }
  }

  console.log(`Extracted ${findings.length} relevant findings`);

  // Step 4: Synthesize evidence
  const synthesis = await synthesizeEvidence(findings, questionText);

  // Step 5: Update question with synthesis results
  question.findings = findings;
  question.confidence = synthesis.confidence;
  question.gaps = synthesis.gaps;
  question.paperCount = papers.length;

  // Determine status
  if (findings.length === 0) {
    question.status = QuestionStatus.UNANSWERED;
  } else if (findings.length < 3 || synthesis.confidence < 0.7) {
    question.status = QuestionStatus.PARTIAL;
  } else {
    question.status = QuestionStatus.ANSWERED;
  }

  // Step 6: Save question to database
  await createQuestion(question);

  console.log('Question answered:', {
    id: question.id,
    status: question.status,
    findingCount: findings.length,
    confidence: synthesis.confidence,
  });

  return question;
};

/**
 * Update an existing question with new papers
 * Re-run evidence extraction for any new papers
 */
export const updateQuestionWithNewPapers = async (
  questionId: string,
  newPapers: ResearchPaper[]
): Promise<void> => {
  try {
    const question = await db.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    console.log(
      `Updating question ${questionId} with ${newPapers.length} new papers`
    );

    // Extract evidence from new papers
    for (const paper of newPapers) {
      const extractionResult = await extractEvidence(paper, question.question);

      if (extractionResult && extractionResult.relevant) {
        const finding = createFinding(
          questionId,
          extractionResult.finding || '',
          [paper.id]
        );

        finding.studyTypes = extractionResult.studyType
          ? [extractionResult.studyType]
          : [];
        finding.sampleSizes = extractionResult.sampleSize
          ? [extractionResult.sampleSize]
          : [];

        if (validateConservativeLanguage(finding.description)) {
          await addFindingToQuestion(questionId, finding);
        }
      }
    }

    // Re-synthesize evidence with all findings
    const allFindings = await getFindingsForQuestion(questionId);
    await synthesizeEvidence(allFindings, question.question);

    // Update question status and confidence
    await updateQuestionStatus(questionId);

    console.log(
      `Question ${questionId} updated: ${allFindings.length} total findings`
    );
  } catch (error) {
    console.error('Failed to update question with new papers:', error);
    throw error;
  }
};

/**
 * Find questions that might be addressed by a new paper
 * Used when adding papers to automatically update relevant questions
 */
export const findRelevantQuestions = async (
  paper: ResearchPaper
): Promise<ResearchQuestion[]> => {
  try {
    const allQuestions = await db.questions.toArray();
    const relevantQuestions: ResearchQuestion[] = [];

    const paperText = `${paper.title} ${paper.abstract}`.toLowerCase();

    for (const question of allQuestions) {
      const keywords = extractKeywords(question.question);
      const matches = keywords.some((keyword) => paperText.includes(keyword));

      if (matches) {
        relevantQuestions.push(question);
      }
    }

    return relevantQuestions;
  } catch (error) {
    console.error('Failed to find relevant questions:', error);
    return [];
  }
};

/**
 * Batch answer multiple questions
 * Useful for initial system setup or bulk operations
 */
export const answerMultipleQuestions = async (
  questionTexts: string[]
): Promise<ResearchQuestion[]> => {
  const results: ResearchQuestion[] = [];

  for (const questionText of questionTexts) {
    try {
      const question = await answerQuestion(questionText);
      results.push(question);
    } catch (error) {
      console.error(`Failed to answer question: ${questionText}`, error);
    }
  }

  return results;
};

