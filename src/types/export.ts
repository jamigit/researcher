/**
 * Type definitions for export functionality
 * Supports doctor summaries, PDF, and Markdown exports
 */

export enum ExportFormat {
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  JSON = 'json',
  HTML = 'html',
}

export enum ExportAudience {
  DOCTOR = 'doctor', // Medical professional language
  PATIENT = 'patient', // Plain language
  RESEARCHER = 'researcher', // Technical/academic language
}

export interface ExportOptions {
  format: ExportFormat;
  audience: ExportAudience;
  includeMetadata?: boolean;
  includeCitations?: boolean;
  includeNotes?: boolean;
  includeContradictions?: boolean;
  includeMechanisms?: boolean;
  includeFullPapers?: boolean;
}

export interface DoctorSummary {
  patientName?: string;
  dateGenerated: string;
  questionsSummary: QuestionSummaryForDoctor[];
  overallAssessment?: string;
  contradictionsHighlighted: number;
  totalPapersReferenced: number;
  mechanismsExplored: string[];
}

export interface QuestionSummaryForDoctor {
  question: string;
  dateAsked: string;
  summary: string; // Synthesized medical language summary
  keyFindings: FindingSummaryForDoctor[];
  contradictions: ContradictionSummaryForDoctor[];
  mechanismsInvolved: string[];
  clinicalRelevance: string; // Why this matters for treatment/diagnosis
}

export interface FindingSummaryForDoctor {
  description: string;
  evidenceStrength: 'weak' | 'moderate' | 'strong';
  studyCount: number;
  peerReviewedCount: number;
  sampleSizeRange?: string; // e.g., "n=50-200"
  citations: string[]; // Paper IDs
}

export interface ContradictionSummaryForDoctor {
  topic: string;
  conflictingSides: {
    finding1: string;
    finding2: string;
  };
  clinicalImplications: string;
  possibleExplanations: string[];
}

export interface ExportMetadata {
  exportDate: string;
  exportFormat: ExportFormat;
  audience: ExportAudience;
  softwareVersion: string;
  databaseVersion: number;
}

