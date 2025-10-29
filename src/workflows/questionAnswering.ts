/**
 * Question Answering Workflow
 * Orchestrates evidence extraction and synthesis to answer research questions
 * @ai-context Core workflow for Phase 2 Q&A system
 */

import { db } from '@/services/db';
import type { ResearchPaper } from '@/types/paper';
import type { ResearchQuestion, QuestionVersion } from '@/types/question';
import type { Finding, EvidenceSource, ExtractionResult } from '@/types/finding';
import type { Contradiction } from '@/types/contradiction';
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
  saveQuestionVersion,
} from '@/services/questions';
import { detectContradictions } from '@/tools/ContradictionDetector';

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
 * Aggregate similar findings from multiple papers
 * Groups evidence by semantic similarity to create findings with multiple sources
 */
const aggregateFindings = (
  questionId: string,
  extractions: Array<{ paper: ResearchPaper; result: ExtractionResult }>
): Finding[] => {
  const findingGroups = new Map<string, { 
    description: string; 
    evidence: EvidenceSource[];
  }>();

  // Group similar findings (simple keyword-based grouping for now)
  // @ai-technical-debt(medium, 4-5 hours, medium) - Implement semantic similarity grouping
  for (const { paper, result } of extractions) {
    if (!result.relevant || !result.finding) continue;

    const description = result.finding;
    const now = new Date().toISOString();
    
    // Create evidence source for this paper
    const evidenceSource: EvidenceSource = {
      paperId: paper.id,
      paperTitle: paper.title,
      excerpt: result.evidence || result.finding,
      studyType: result.studyType || 'other',
      sampleSize: result.sampleSize,
      confidence: result.confidence,
      dateAdded: now,
    };

    // Simple grouping: normalize finding text for comparison
    const normalizedKey = description
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Use first 100 chars as key

    if (findingGroups.has(normalizedKey)) {
      // Add to existing group
      findingGroups.get(normalizedKey)!.evidence.push(evidenceSource);
    } else {
      // Create new group
      findingGroups.set(normalizedKey, {
        description,
        evidence: [evidenceSource],
      });
    }
  }

  // Convert groups to Finding objects
  const findings: Finding[] = [];
  for (const { description, evidence } of findingGroups.values()) {
    if (validateConservativeLanguage(description)) {
      const finding = createFinding(questionId, description, evidence);
      
      // Calculate quality metrics
      const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;
      finding.qualityAssessment = `${evidence.length} paper(s), avg confidence: ${avgConfidence.toFixed(2)}`;
      
      findings.push(finding);
    } else {
      console.warn('Finding failed conservative language check, skipping:', description);
    }
  }

  return findings;
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

  // Step 3: Extract evidence from each paper
  const extractions: Array<{ paper: ResearchPaper; result: ExtractionResult }> = [];
  
  for (const paper of papers) {
    const extractionResult = await extractEvidence(paper, questionText);

    if (extractionResult && extractionResult.relevant) {
      extractions.push({ paper, result: extractionResult });
    }
  }

  console.log(`Extracted ${extractions.length} relevant extractions from ${papers.length} papers`);

  // Step 4: Aggregate similar findings from multiple papers
  const findings = aggregateFindings(question.id, extractions);
  
  // Save findings to database
  for (const finding of findings) {
    await addFindingToQuestion(question.id, finding);
  }

  console.log(`Aggregated into ${findings.length} findings`);

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

/**
 * Refresh a question's answer by re-running the analysis
 * Preserves user notes and creates a version snapshot
 * @ai-context Phase 4 - Version tracking and refresh workflow
 */
export const refreshQuestion = async (
  questionId: string
): Promise<ResearchQuestion> => {
  console.log('Refreshing question:', questionId);

  // Step 1: Load existing question
  const existingQuestion = await db.questions.get(questionId);
  
  if (!existingQuestion) {
    throw new Error('Question not found');
  }

  // Step 2: Preserve all user notes from current findings (keyed by description)
  const preservedNotes = new Map<string, string>();
  for (const finding of existingQuestion.findings) {
    if (finding.userNotes) {
      preservedNotes.set(finding.description, finding.userNotes);
    }
  }

  console.log(`Preserved ${preservedNotes.size} notes from current findings`);

  // Step 3: Save current state as a version snapshot
  const version: QuestionVersion = {
    id: crypto.randomUUID(),
    versionNumber: existingQuestion.currentVersion || 1,
    dateGenerated: existingQuestion.lastUpdated,
    findings: [...(existingQuestion.findings || [])], // Deep copy
    contradictions: [...(existingQuestion.contradictions || [])],
    paperCount: existingQuestion.paperCount || 0,
    confidence: existingQuestion.confidence || 0,
    status: existingQuestion.status,
    papersUsed: [...(existingQuestion.papersUsed || [])], // Handle legacy questions
  };

  await saveQuestionVersion(questionId, version);
  console.log(`Saved version ${version.versionNumber}`);

  // Step 4: Re-run analysis with ALL papers in collection
  const allPapers = await db.papers.toArray();
  console.log(`Re-analyzing with ${allPapers.length} papers`);

  // Extract evidence from all papers
  const extractions: Array<{ paper: ResearchPaper; result: ExtractionResult }> = [];
  
  for (const paper of allPapers) {
    const extraction = await extractEvidence(paper, existingQuestion.question);
    
    if (extraction && extraction.relevant) {
      extractions.push({ paper, result: extraction });
    }
  }

  console.log(`Extracted ${extractions.length} relevant extractions`);

  // Aggregate similar findings from multiple papers
  const newFindings = aggregateFindings(questionId, extractions);
  
  // Track papers that were used
  const papersUsed = Array.from(
    new Set(newFindings.flatMap(f => f.supportingPapers))
  );

  console.log(`Generated ${newFindings.length} findings from ${papersUsed.length} papers`);

  // Step 5: Re-attach notes to matching findings
  let notesReattached = 0;
  for (const newFinding of newFindings) {
    const matchingNote = preservedNotes.get(newFinding.description);
    if (matchingNote) {
      newFinding.userNotes = matchingNote;
      newFinding.notesLastUpdated = new Date().toISOString();
      preservedNotes.delete(newFinding.description);
      notesReattached++;
    }
  }

  console.log(`Reattached ${notesReattached} notes to matching findings`);

  // Step 6: Store orphaned notes separately (notes from findings that no longer exist)
  const orphanedNotes: Array<[string, string]> = Array.from(preservedNotes.entries());
  if (orphanedNotes.length > 0) {
    console.log(`Found ${orphanedNotes.length} orphaned notes from removed findings`);
  }

  // Step 7: Detect contradictions in new findings
  const contradictions: Contradiction[] = [];
  for (const finding of newFindings) {
    const findingContradictions = await detectContradictions(finding, newFindings);
    contradictions.push(...findingContradictions);
  }
  
  // Mark findings with contradictions
  for (const finding of newFindings) {
    const hasContradiction = contradictions.some(
      (c) => c.findingId === finding.id
    );
    finding.hasContradiction = hasContradiction;
  }

  // Step 8: Determine new status and confidence
  let newStatus = QuestionStatus.UNANSWERED;
  let newConfidence = 0;

  if (newFindings.length > 0) {
    if (newFindings.length >= 3 && papersUsed.length >= 3) {
      newStatus = QuestionStatus.ANSWERED;
      newConfidence = 0.8;
    } else {
      newStatus = QuestionStatus.PARTIAL;
      newConfidence = 0.5;
    }

    // Reduce confidence if contradictions exist
    if (contradictions.length > 0) {
      newConfidence *= 0.7;
    }
  }

  // Step 9: Update question with new version
  const updatedQuestion: ResearchQuestion = {
    ...existingQuestion,
    currentVersion: existingQuestion.currentVersion + 1,
    findings: newFindings,
    contradictions,
    papersUsed,
    paperCount: papersUsed.length,
    status: newStatus,
    confidence: newConfidence,
    orphanedNotes,
    lastUpdated: new Date().toISOString(),
  };

  // Step 10: Save updated question and new findings to database
  await db.questions.put(updatedQuestion);
  
  // Clear old findings for this question
  await db.findings.where('questionId').equals(questionId).delete();
  
  // Add new findings
  for (const finding of newFindings) {
    await db.findings.add(finding);
  }

  // Clear old contradictions and add new ones
  const oldContradictionIds = existingQuestion.contradictions.map((c) => c.id);
  for (const id of oldContradictionIds) {
    await db.contradictions.delete(id);
  }
  for (const contradiction of contradictions) {
    await db.contradictions.add(contradiction);
  }

  console.log(
    `Question refreshed to version ${updatedQuestion.currentVersion}`,
    `with ${newFindings.length} findings and ${contradictions.length} contradictions`
  );

  return updatedQuestion;
};

