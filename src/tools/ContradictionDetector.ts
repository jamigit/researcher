/**
 * ContradictionDetector Tool
 * Detects and analyzes contradictions between research findings
 * @ai-context CRITICAL: Contradictions must be prominently displayed (yellow warning)
 */

import type { Finding } from '@/types/finding';
import type {
  Contradiction,
  ContradictionView,
  DiscrepancyAnalysis,
  ContradictionSeverity,
} from '@/types/contradiction';
import {
  createContradiction,
  ContradictionSeverity as Severity,
} from '@/types/contradiction';
import { db } from '@/services/db';
import type { ResearchPaper } from '@/types/paper';

/**
 * Check semantic similarity between two text descriptions
 * Returns a score from 0 (completely different) to 1 (identical)
 * @ai-technical-debt(medium, 4-5 hours, high) - Implement embedding-based similarity
 */
const checkSemanticSimilarity = (text1: string, text2: string): number => {
  // Simple word overlap approach for now
  const words1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const words2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

/**
 * Check if two findings have conflicting results
 * Returns true if findings address same topic but reach different conclusions
 */
const checkResultConflict = (
  result1?: string,
  result2?: string
): boolean => {
  if (!result1 || !result2) return false;

  // Look for opposing terms
  const opposingPairs = [
    ['increased', 'decreased'],
    ['higher', 'lower'],
    ['elevated', 'reduced'],
    ['improved', 'worsened'],
    ['positive', 'negative'],
    ['present', 'absent'],
    ['found', 'not found'],
  ];

  const lower1 = result1.toLowerCase();
  const lower2 = result2.toLowerCase();

  for (const [term1, term2] of opposingPairs) {
    if (
      (lower1.includes(term1) && lower2.includes(term2)) ||
      (lower1.includes(term2) && lower2.includes(term1))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Determine severity of contradiction
 * Based on number of papers and study quality
 */
const determineSeverity = (
  papers1: ResearchPaper[],
  papers2: ResearchPaper[]
): ContradictionSeverity => {
  const totalPapers = papers1.length + papers2.length;

  // Major if both sides have substantial evidence
  if (papers1.length >= 2 && papers2.length >= 2) {
    return Severity.MAJOR;
  }

  // Major if high-quality studies disagree
  const hasHighQuality =
    papers1.some((p) => p.studyType === 'clinical_trial') ||
    papers2.some((p) => p.studyType === 'clinical_trial');

  if (hasHighQuality && totalPapers >= 3) {
    return Severity.MAJOR;
  }

  return Severity.MINOR;
};

/**
 * Get papers by IDs
 */
const getPapers = async (paperIds: string[]): Promise<ResearchPaper[]> => {
  const papers: ResearchPaper[] = [];
  for (const id of paperIds) {
    const paper = await db.papers.get(id);
    if (paper) papers.push(paper);
  }
  return papers;
};

/**
 * Compare methodologies between two sets of papers
 */
const compareMethodologies = (
  papers1: ResearchPaper[],
  papers2: ResearchPaper[]
): string[] => {
  console.log(`Comparing ${papers1.length} and ${papers2.length} papers`);

  const differences: string[] = [];

  // Study type differences
  const types1 = new Set(papers1.map((p) => p.studyType).filter(Boolean));
  const types2 = new Set(papers2.map((p) => p.studyType).filter(Boolean));

  if (types1.size > 0 && types2.size > 0 && !setsOverlap(types1, types2)) {
    differences.push(
      `Different study types: ${Array.from(types1).join(', ')} vs ${Array.from(types2).join(', ')}`
    );
  }

  return differences;
};

/**
 * Check if two sets have any overlap
 */
const setsOverlap = <T>(set1: Set<T>, set2: Set<T>): boolean => {
  for (const item of set1) {
    if (set2.has(item)) return true;
  }
  return false;
};

/**
 * Compare sample sizes
 */
const compareSampleSizes = (
  _papers1: ResearchPaper[],
  _papers2: ResearchPaper[]
): string => {
  // This is a placeholder - actual implementation would extract sample sizes
  // from abstracts or full text
  return 'Sample size comparison requires full text analysis';
};

/**
 * Compare study quality
 */
const compareQuality = (
  papers1: ResearchPaper[],
  papers2: ResearchPaper[]
): string => {
  const peer1 = papers1.filter((p) => p.fullTextAvailable).length;
  const peer2 = papers2.filter((p) => p.fullTextAvailable).length;

  if (peer1 !== peer2) {
    return `Quality difference: ${peer1}/${papers1.length} vs ${peer2}/${papers2.length} with full text`;
  }

  return 'Similar quality across both sets';
};

/**
 * Compare timings/dates
 */
const compareTimings = (
  papers1: ResearchPaper[],
  papers2: ResearchPaper[]
): string[] => {
  const differences: string[] = [];

  const getDates = (papers: ResearchPaper[]) =>
    papers
      .map((p) => new Date(p.publicationDate).getFullYear())
      .filter((y) => !isNaN(y));

  const years1 = getDates(papers1);
  const years2 = getDates(papers2);

  if (years1.length > 0 && years2.length > 0) {
    const avg1 = years1.reduce((a, b) => a + b, 0) / years1.length;
    const avg2 = years2.reduce((a, b) => a + b, 0) / years2.length;

    if (Math.abs(avg1 - avg2) > 3) {
      differences.push(
        `Timing difference: studies from ~${Math.round(avg1)} vs ~${Math.round(avg2)}`
      );
    }
  }

  return differences;
};

/**
 * Compare populations (placeholder)
 */
const comparePopulations = (
  papers1: ResearchPaper[],
  papers2: ResearchPaper[]
): string[] => {
  console.log(`Analyzing populations for ${papers1.length} and ${papers2.length} papers`);
  // This would require NLP to extract population details from abstracts
  return ['Population analysis requires deeper text analysis'];
};

/**
 * Generate biological explanations for contradiction
 * @ai-technical-debt(high, 6-8 hours, high) - Integrate Claude API for explanation generation
 */
const generateBiologicalExplanations = async (
  contradiction: Contradiction,
  analysis: Partial<DiscrepancyAnalysis>
): Promise<string[]> => {
  // TODO: Use Claude API to generate biological explanations
  // For now, return generic explanations based on methodological differences
  console.log('Generating biological explanations for:', contradiction.topic);
  const explanations: string[] = [];

  if (
    analysis.methodologicalDifferences &&
    analysis.methodologicalDifferences.length > 0
  ) {
    explanations.push(
      'Different study designs may measure different aspects of the condition'
    );
  }

  if (
    analysis.timingDifferences &&
    analysis.timingDifferences.length > 0
  ) {
    explanations.push(
      'Understanding of mechanisms may have evolved over time'
    );
  }

  explanations.push(
    'Patient heterogeneity in ME/CFS may lead to different findings in different populations'
  );

  return explanations;
};

/**
 * Analyze discrepancy between contradicting findings
 */
export const analyzeDiscrepancy = async (
  contradiction: Contradiction
): Promise<DiscrepancyAnalysis> => {
  const majorityPapers = await getPapers(contradiction.majorityView.papers);
  const minorityPapers = await getPapers(contradiction.minorityView.papers);

  const methodDiffs = compareMethodologies(majorityPapers, minorityPapers);
  const sampleComp = compareSampleSizes(majorityPapers, minorityPapers);
  const qualityComp = compareQuality(majorityPapers, minorityPapers);
  const timingDiffs = compareTimings(majorityPapers, minorityPapers);
  const popDiffs = comparePopulations(majorityPapers, minorityPapers);

  const bioExplanations = await generateBiologicalExplanations(
    contradiction,
    {
      methodologicalDifferences: methodDiffs,
      timingDifferences: timingDiffs,
    }
  );

  return {
    methodologicalDifferences: methodDiffs,
    sampleSizeComparison: sampleComp,
    qualityComparison: qualityComp,
    timingDifferences: timingDiffs,
    populationDifferences: popDiffs,
    possibleBiologicalExplanations: bioExplanations,
  };
};

/**
 * Generate conservative interpretation of contradiction
 * @ai-technical-debt(medium, 3-4 hours, high) - Integrate Claude API for interpretation
 */
export const generateConservativeInterpretation = async (
  contradiction: Contradiction,
  analysis: DiscrepancyAnalysis
): Promise<string> => {
  // TODO: Use Claude API to generate nuanced interpretation
  // For now, create a template-based interpretation

  const { majorityView, minorityView } = contradiction;

  let interpretation = `Most evidence (${majorityView.paperCount} papers) supports ${majorityView.description.toLowerCase()}, `;
  interpretation += `however ${minorityView.paperCount} paper${minorityView.paperCount > 1 ? 's' : ''} found ${minorityView.description.toLowerCase()}. `;

  if (analysis.methodologicalDifferences.length > 0) {
    interpretation += `The discrepancy may be explained by methodological differences. `;
  }

  interpretation += `More research is needed to resolve this contradiction.`;

  return interpretation;
};

/**
 * Detect contradictions between a new finding and existing findings
 * Returns array of detected contradictions
 */
export const detectContradictions = async (
  newFinding: Finding,
  existingFindings: Finding[]
): Promise<Contradiction[]> => {
  const contradictions: Contradiction[] = [];

  for (const existing of existingFindings) {
    // Step 1: Check topic similarity (must address same topic)
    const similarity = checkSemanticSimilarity(
      newFinding.description,
      existing.description
    );

    if (similarity < 0.6) continue; // Not same topic

    // Step 2: Check if results conflict
    const conflict = checkResultConflict(
      newFinding.quantitativeResult,
      existing.quantitativeResult
    );

    if (!conflict) continue; // Results agree

    // Step 3: Create contradiction object
    const papers1 = await getPapers(newFinding.supportingPapers);
    const papers2 = await getPapers(existing.supportingPapers);

    // Determine majority vs minority (more papers = majority)
    const [majorityView, minorityView]: [ContradictionView, ContradictionView] =
      papers1.length >= papers2.length
        ? [
            {
              description: newFinding.description,
              papers: newFinding.supportingPapers,
              evidence: newFinding.quantitativeResult || '',
              paperCount: papers1.length,
            },
            {
              description: existing.description,
              papers: existing.supportingPapers,
              evidence: existing.quantitativeResult || '',
              paperCount: papers2.length,
            },
          ]
        : [
            {
              description: existing.description,
              papers: existing.supportingPapers,
              evidence: existing.quantitativeResult || '',
              paperCount: papers2.length,
            },
            {
              description: newFinding.description,
              papers: newFinding.supportingPapers,
              evidence: newFinding.quantitativeResult || '',
              paperCount: papers1.length,
            },
          ];

    const contradiction = createContradiction(
      existing.id,
      existing.description,
      majorityView,
      minorityView
    );

    contradiction.severity = determineSeverity(papers1, papers2);

    // Step 4: Analyze discrepancy
    const analysis = await analyzeDiscrepancy(contradiction);
    contradiction.methodologicalDifferences =
      analysis.methodologicalDifferences;
    contradiction.possibleExplanations =
      analysis.possibleBiologicalExplanations;

    // Step 5: Generate conservative interpretation
    contradiction.conservativeInterpretation =
      await generateConservativeInterpretation(contradiction, analysis);

    contradictions.push(contradiction);

    console.log('Contradiction detected:', {
      topic: contradiction.topic,
      severity: contradiction.severity,
      majorityPapers: majorityView.paperCount,
      minorityPapers: minorityView.paperCount,
    });
  }

  return contradictions;
};

