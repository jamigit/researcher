/**
 * Type definitions for research papers and related entities
 * @ai-context Core data model for the ME/CFS research tracking system
 */

/**
 * Study type classification for research papers
 */
export enum StudyType {
  CLINICAL_TRIAL = 'clinical_trial',
  OBSERVATIONAL = 'observational',
  REVIEW = 'review',
  META_ANALYSIS = 'meta_analysis',
  CASE_STUDY = 'case_study',
  LABORATORY = 'laboratory',
  OTHER = 'other',
}

/**
 * Reading status tracking
 */
export enum ReadStatus {
  UNREAD = 'unread',
  IN_PROGRESS = 'in_progress',
  READ = 'read',
  SKIPPED = 'skipped',
}

/**
 * Importance/priority level
 */
export enum Importance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Research category/topic classification
 */
export enum Category {
  PATHOPHYSIOLOGY = 'pathophysiology',
  TREATMENT = 'treatment',
  DIAGNOSIS = 'diagnosis',
  EPIDEMIOLOGY = 'epidemiology',
  BIOMARKERS = 'biomarkers',
  QUALITY_OF_LIFE = 'quality_of_life',
  GENETICS = 'genetics',
  IMMUNOLOGY = 'immunology',
  NEUROLOGY = 'neurology',
  OTHER = 'other',
}

/**
 * Author information
 */
export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
}

/**
 * AI-generated summary with structured sections
 */
export interface PaperSummary {
  overview: string;
  keyFindings: string[];
  methodology: string;
  limitations: string[];
  relevanceToMECFS: string;
  actionableInsights: string[];
  generatedAt: string; // ISO 8601 timestamp
}

/**
 * Complete research paper model
 */
export interface ResearchPaper {
  // Identifiers
  id: string; // UUID v4
  pubmedId?: string;
  doi?: string;

  // Core metadata
  title: string;
  authors: Author[];
  abstract: string;
  publicationDate: string; // ISO 8601 date
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;

  // Classification
  studyType?: StudyType;
  categories: Category[];
  tags: string[]; // User-defined tags

  // Status tracking
  readStatus: ReadStatus;
  importance: Importance;
  dateAdded: string; // ISO 8601 timestamp
  dateModified: string; // ISO 8601 timestamp

  // AI enhancement
  aiSummary?: PaperSummary;
  personalNotes?: string;

  // Additional metadata
  citationCount?: number;
  fullTextAvailable: boolean;
  pdfUrl?: string;
}

/**
 * Type guard to check if a value is a valid StudyType
 */
export const isStudyType = (value: string): value is StudyType => {
  return Object.values(StudyType).includes(value as StudyType);
};

/**
 * Type guard to check if a value is a valid Category
 */
export const isCategory = (value: string): value is Category => {
  return Object.values(Category).includes(value as Category);
};

/**
 * Type guard to check if a value is a valid ReadStatus
 */
export const isReadStatus = (value: string): value is ReadStatus => {
  return Object.values(ReadStatus).includes(value as ReadStatus);
};

/**
 * Type guard to check if a value is a valid Importance
 */
export const isImportance = (value: string): value is Importance => {
  return Object.values(Importance).includes(value as Importance);
};

