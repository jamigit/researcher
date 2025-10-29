/**
 * Export service for generating doctor summaries, PDFs, and Markdown
 * @ai-context Medical language for professional audience, conservative claims
 */

import { db } from './db';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type { Contradiction } from '@/types/contradiction';
import type {
  ExportOptions,
  DoctorSummary,
  QuestionSummaryForDoctor,
  FindingSummaryForDoctor,
  ContradictionSummaryForDoctor,
} from '@/types/export';
import { formatCitation } from '@/utils/citations';

/**
 * Generate a doctor summary for a specific question
 */
export const generateDoctorSummary = async (
  questionId: string
): Promise<DoctorSummary> => {
  try {
    const question = await db.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const findings = await db.findings.where('questionId').equals(questionId).toArray();
    const questionSummary = await generateQuestionSummaryForDoctor(question, findings);

    const allPaperIds = new Set<string>();
    findings.forEach((f) => f.supportingPapers.forEach((p) => allPaperIds.add(p)));

    const mechanisms = new Set<string>();
    findings.forEach((f) => {
      if (f.relatedMechanisms) {
        f.relatedMechanisms.forEach((m) => mechanisms.add(m));
      }
    });

    const contradictionCount = await db.contradictions
      .where('findingId')
      .anyOf(findings.map((f) => f.id))
      .count();

    return {
      dateGenerated: new Date().toISOString(),
      questionsSummary: [questionSummary],
      totalPapersReferenced: allPaperIds.size,
      mechanismsExplored: Array.from(mechanisms),
      contradictionsHighlighted: contradictionCount,
    };
  } catch (error) {
    console.error('Failed to generate doctor summary:', error);
    throw new Error('Failed to generate doctor summary');
  }
};

/**
 * Generate summary for a single question in medical language
 */
const generateQuestionSummaryForDoctor = async (
  question: ResearchQuestion,
  findings: Finding[]
): Promise<QuestionSummaryForDoctor> => {
  const findingSummaries = await Promise.all(
    findings.map((f) => generateFindingSummaryForDoctor(f))
  );

  const contradictions = await Promise.all(
    findings.map(async (f) => {
      const contras = await db.contradictions.where('findingId').equals(f.id).toArray();
      return Promise.all(contras.map((c) => generateContradictionSummaryForDoctor(c)));
    })
  );
  const flatContradictions = contradictions.flat();

  const mechanisms = new Set<string>();
  findings.forEach((f) => {
    if (f.relatedMechanisms) {
      f.relatedMechanisms.forEach((m) => mechanisms.add(m));
    }
  });

  return {
    question: question.question,
    dateAsked: question.dateCreated,
    summary: generateSyntheticSummary(findings),
    keyFindings: findingSummaries,
    contradictions: flatContradictions,
    mechanismsInvolved: Array.from(mechanisms),
    clinicalRelevance: generateClinicalRelevance(findings),
  };
};

/**
 * Convert a finding into doctor-friendly summary
 */
const generateFindingSummaryForDoctor = async (
  finding: Finding
): Promise<FindingSummaryForDoctor> => {
  const papers = await db.papers.bulkGet(finding.supportingPapers);
  const validPapers = papers.filter((p) => p !== undefined);

  const peerReviewedCount = validPapers.filter(
    (p) => p && !p.url?.includes('preprint')
  ).length;

  let evidenceStrength: 'weak' | 'moderate' | 'strong' = 'weak';
  if (finding.consistency === 'high' && peerReviewedCount >= 3) {
    evidenceStrength = 'strong';
  } else if (finding.consistency === 'medium' || peerReviewedCount >= 2) {
    evidenceStrength = 'moderate';
  }

  return {
    description: finding.description,
    evidenceStrength,
    studyCount: finding.supportingPapers.length,
    peerReviewedCount: finding.peerReviewedCount,
    citations: finding.supportingPapers,
  };
};

/**
 * Convert contradiction into doctor-friendly summary
 */
const generateContradictionSummaryForDoctor = async (
  contradiction: Contradiction
): Promise<ContradictionSummaryForDoctor> => {
  const finding1 = await db.findings.get(contradiction.findingId);
  const finding2 = contradiction.conflictingFindingId
    ? await db.findings.get(contradiction.conflictingFindingId)
    : null;

  return {
    topic: contradiction.topic,
    conflictingSides: {
      finding1: finding1?.description || '',
      finding2: finding2?.description || 'Alternative finding',
    },
    clinicalImplications: contradiction.interpretation || '',
    possibleExplanations: contradiction.possibleExplanations || [],
  };
};

/**
 * Generate synthetic summary from multiple findings
 */
const generateSyntheticSummary = (findings: Finding[]): string => {
  if (findings.length === 0) {
    return 'No findings available for this question.';
  }

  const highConsistency = findings.filter((f) => f.consistency === 'high').length;
  const totalPapers = new Set(findings.flatMap((f) => f.supportingPapers)).size;

  return `Based on analysis of ${totalPapers} research paper${totalPapers !== 1 ? 's' : ''}, ${findings.length} finding${findings.length !== 1 ? 's were' : ' was'} identified. ${highConsistency > 0 ? `${highConsistency} finding${highConsistency !== 1 ? 's show' : ' shows'} high consistency across multiple studies.` : ''} Evidence synthesis suggests caution in interpretation due to study heterogeneity and varying methodologies.`;
};

/**
 * Generate clinical relevance statement
 */
const generateClinicalRelevance = (findings: Finding[]): string => {
  if (findings.length === 0) {
    return 'Clinical relevance cannot be determined without findings.';
  }

  const mechanisms = new Set<string>();
  findings.forEach((f) => {
    if (f.relatedMechanisms) {
      f.relatedMechanisms.forEach((m) => mechanisms.add(m));
    }
  });

  if (mechanisms.size > 0) {
    return `These findings implicate ${mechanisms.size} biological mechanism${mechanisms.size !== 1 ? 's' : ''} that may be relevant to ME/CFS pathophysiology and could inform treatment approaches. Further research is needed to establish causal relationships.`;
  }

  return 'These findings contribute to understanding of ME/CFS but require additional research to establish clinical utility.';
};

/**
 * Export question to Markdown format
 */
export const exportToMarkdown = async (
  questionId: string,
  options: Partial<ExportOptions> = {}
): Promise<string> => {
  const summary = await generateDoctorSummary(questionId);
  const question = await db.questions.get(questionId);
  
  if (!question) {
    throw new Error('Question not found');
  }

  const findings = await db.findings.where('questionId').equals(questionId).toArray();

  let markdown = `# ME/CFS Research Summary\n\n`;
  markdown += `**Generated**: ${new Date(summary.dateGenerated).toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  // Question
  markdown += `## Question\n\n`;
  markdown += `${question.question}\n\n`;
  markdown += `**Asked**: ${new Date(question.dateCreated).toLocaleDateString()}\n\n`;

  // Summary
  markdown += `## Summary\n\n`;
  markdown += `${summary.questionsSummary[0].summary}\n\n`;

  // Clinical Relevance
  if (options.includeMetadata !== false) {
    markdown += `### Clinical Relevance\n\n`;
    markdown += `${summary.questionsSummary[0].clinicalRelevance}\n\n`;
  }

  // Findings
  markdown += `## Key Findings\n\n`;
  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    const findingSummary = summary.questionsSummary[0].keyFindings[i];
    
    markdown += `### Finding ${i + 1}: ${finding.description}\n\n`;
    markdown += `- **Evidence Strength**: ${findingSummary.evidenceStrength}\n`;
    markdown += `- **Studies**: ${findingSummary.studyCount} (${findingSummary.peerReviewedCount} peer-reviewed)\n`;
    markdown += `- **Consistency**: ${finding.consistency}\n\n`;

    if (finding.quantitativeResult) {
      markdown += `**Quantitative Result**: ${finding.quantitativeResult}\n\n`;
    }
    if (finding.qualitativeResult) {
      markdown += `**Qualitative Result**: ${finding.qualitativeResult}\n\n`;
    }

    // Citations
    if (options.includeCitations !== false) {
      markdown += `#### Supporting Papers\n\n`;
      const papers = await db.papers.bulkGet(finding.supportingPapers);
      for (const paper of papers) {
        if (paper) {
          markdown += `- ${formatCitation(paper, 'apa')}\n`;
        }
      }
      markdown += `\n`;
    }

    // Notes
    if (options.includeNotes !== false && finding.userNotes) {
      markdown += `#### Personal Notes\n\n`;
      markdown += `${finding.userNotes}\n\n`;
    }
  }

  // Contradictions
  if (options.includeContradictions !== false && summary.questionsSummary[0].contradictions.length > 0) {
    markdown += `## ⚠️ Contradictions\n\n`;
    for (const contra of summary.questionsSummary[0].contradictions) {
      markdown += `### ${contra.topic}\n\n`;
      markdown += `**Conflicting Evidence**:\n\n`;
      markdown += `1. ${contra.conflictingSides.finding1}\n`;
      markdown += `2. ${contra.conflictingSides.finding2}\n\n`;
      markdown += `**Clinical Implications**: ${contra.clinicalImplications}\n\n`;
      if (contra.possibleExplanations.length > 0) {
        markdown += `**Possible Explanations**:\n\n`;
        contra.possibleExplanations.forEach((exp) => {
          markdown += `- ${exp}\n`;
        });
        markdown += `\n`;
      }
    }
  }

  // Mechanisms
  if (options.includeMechanisms !== false && summary.mechanismsExplored.length > 0) {
    markdown += `## Biological Mechanisms\n\n`;
    markdown += `This research explores the following mechanisms:\n\n`;
    for (const mechanism of summary.mechanismsExplored) {
      const explainer = await db.explainers.where('mechanism').equals(mechanism).first();
      if (explainer) {
        markdown += `### ${mechanism}\n\n`;
        markdown += `${explainer.plainLanguage.definition}\n\n`;
      } else {
        markdown += `- ${mechanism}\n`;
      }
    }
    markdown += `\n`;
  }

  // Footer
  markdown += `---\n\n`;
  markdown += `*This summary was generated from ${summary.totalPapersReferenced} research papers.*\n`;
  markdown += `*Software: ME/CFS Research Tracker | Conservative evidence synthesis*\n`;

  return markdown;
};

/**
 * Download exported content as a file
 */
export const downloadExport = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export all questions to Markdown
 */
export const exportAllQuestionsToMarkdown = async (
  options: Partial<ExportOptions> = {}
): Promise<string> => {
  const questions = await db.questions.toArray();
  
  let markdown = `# Complete ME/CFS Research Collection\n\n`;
  markdown += `**Generated**: ${new Date().toLocaleString()}\n`;
  markdown += `**Total Questions**: ${questions.length}\n\n`;
  markdown += `---\n\n`;

  for (const question of questions) {
    const questionMarkdown = await exportToMarkdown(question.id, options);
    markdown += questionMarkdown;
    markdown += `\n\n---\n\n`;
  }

  return markdown;
};

