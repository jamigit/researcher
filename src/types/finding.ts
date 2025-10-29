/**
 * Type definitions for research findings and evidence
 * @ai-context Evidence extracted from papers with conservative language
 */

/**
 * Paper contribution tracking for findings
 * Shows how and whether a paper contributed to the answer
 */
export interface PaperContribution {
  paperId: string;
  relevanceScore: number; // 0-1 how relevant this paper was
  excerpts: string[]; // Key excerpts used from this paper
  wasUsed: boolean; // Whether it contributed to findings
}

/**
 * Evidence from a single paper supporting a finding
 * Multiple papers can provide evidence for the same finding
 */
export interface EvidenceSource {
  paperId: string;
  paperTitle: string;
  excerpt: string; // Specific quote or data from the paper
  studyType: string;
  sampleSize?: number;
  confidence: number; // 0-1 confidence in this evidence
  dateAdded: string; // ISO 8601 timestamp
}

/**
 * Consistency level across multiple papers
 */
export enum Consistency {
  HIGH = 'high',     // All papers agree
  MEDIUM = 'medium', // Most papers agree, some variation
  LOW = 'low',       // Significant disagreement
}

/**
 * Finding extracted from research papers
 * Each finding represents a specific claim supported by evidence
 */
export interface Finding {
  // Identity
  id: string; // UUID v4
  questionId: string; // Parent research question
  description: string; // Conservative statement of what was found

  // Evidence (NEW: detailed evidence from multiple papers)
  evidence: EvidenceSource[]; // Detailed evidence from each supporting paper
  
  // Legacy fields (kept for backwards compatibility, derived from evidence)
  supportingPapers: string[]; // Paper IDs supporting this finding
  studyTypes: string[]; // Types of studies (RCT, observational, etc.)
  sampleSizes: number[]; // Sample sizes from each study

  // Quality assessment
  consistency: Consistency; // Agreement across papers
  peerReviewedCount: number; // Number of peer-reviewed papers
  preprintCount: number; // Number of preprints
  qualityAssessment: string; // Overall quality notes

  // Results
  quantitativeResult?: string; // e.g., "ATP reduced 20-40%"
  qualitativeResult?: string; // Descriptive findings

  // Contradictions
  hasContradiction: boolean; // Whether this finding is contradicted
  contradictingPapers: string[]; // Paper IDs with conflicting results

  // Metadata
  dateCreated: string; // ISO 8601 timestamp
  lastUpdated: string; // ISO 8601 timestamp

  // User annotations
  userNotes?: string; // User's personal notes on this finding
  notesLastUpdated?: string; // ISO 8601 timestamp of last note edit

  // Mechanism link
  mechanismId?: string; // Link to mechanism explainer
}

/**
 * Extraction result from EvidenceExtractor tool
 * Returned when extracting evidence from a single paper
 */
export interface ExtractionResult {
  relevant: boolean; // Does paper address the question?
  finding?: string; // What the paper found (if relevant)
  evidence?: string; // Specific data/results
  studyType?: string; // Type of study
  sampleSize?: number; // Sample size
  limitations: string[]; // Study limitations
  confidence: number; // 0-1 confidence in extraction
}

/**
 * Type guard to check if a value is a valid Consistency
 */
export const isConsistency = (value: string): value is Consistency => {
  return Object.values(Consistency).includes(value as Consistency);
};

/**
 * Factory function to create a new finding
 */
export const createFinding = (
  questionId: string,
  description: string,
  evidence: EvidenceSource[] = []
): Finding => {
  const now = new Date().toISOString();
  
  // Derive legacy fields from evidence array
  const supportingPapers = evidence.map(e => e.paperId);
  const studyTypes = evidence.map(e => e.studyType);
  const sampleSizes = evidence.map(e => e.sampleSize).filter((s): s is number => s !== undefined);
  
  return {
    id: crypto.randomUUID(),
    questionId,
    description,
    evidence,
    supportingPapers,
    studyTypes,
    sampleSizes,
    consistency: Consistency.HIGH,
    peerReviewedCount: 0,
    preprintCount: 0,
    qualityAssessment: '',
    hasContradiction: false,
    contradictingPapers: [],
    dateCreated: now,
    lastUpdated: now,
  };
};

