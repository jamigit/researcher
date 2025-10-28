/**
 * Test helper utilities and factory functions
 * @ai-context Mock data factories for repeatable test data generation
 */

import { v4 as uuidv4 } from 'uuid';
import type { ResearchPaper, Author } from '@/types/paper';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type { Contradiction, ContradictionView } from '@/types/contradiction';
import type { Note, SavedSearch } from '@/types/database';
import {
  ReadStatus,
  Importance,
  Category,
  StudyType,
} from '@/types/paper';
import { QuestionStatus } from '@/types/question';
import { Consistency } from '@/types/finding';
import { ContradictionSeverity, ContradictionStatus } from '@/types/contradiction';

/**
 * Factory function for creating mock authors
 */
export const createMockAuthor = (overrides?: Partial<Author>): Author => ({
  name: 'John Doe',
  affiliation: 'Test University',
  email: 'john.doe@test.edu',
  ...overrides,
});

/**
 * Factory function for creating mock research papers
 */
export const createMockPaper = (
  overrides?: Partial<ResearchPaper>
): ResearchPaper => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    pubmedId: '12345678',
    doi: '10.1234/test.2024',
    title: 'Test Research Paper on ME/CFS',
    authors: [createMockAuthor()],
    abstract:
      'This is a test abstract for ME/CFS research. It contains sufficient text to meet minimum length requirements for validation.',
    publicationDate: '2024-01-15T00:00:00.000Z',
    journal: 'Test Journal of ME/CFS Research',
    url: 'https://example.com/paper',
    studyType: StudyType.CLINICAL_TRIAL,
    categories: [Category.BIOMARKERS],
    tags: ['test', 'mecfs'],
    readStatus: ReadStatus.UNREAD,
    importance: Importance.MEDIUM,
    dateAdded: now,
    dateModified: now,
    personalNotes: 'Test notes',
    citationCount: 10,
    fullTextAvailable: true,
    pdfUrl: 'https://example.com/paper.pdf',
    ...overrides,
  };
};

/**
 * Factory function for creating mock research questions
 */
export const createMockQuestion = (
  overrides?: Partial<ResearchQuestion>
): ResearchQuestion => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    question: 'What are the biomarkers for ME/CFS?',
    dateCreated: now,
    lastUpdated: now,
    status: QuestionStatus.UNANSWERED,
    isPriority: false,
    confidence: 0,
    paperCount: 0,
    findings: [],
    contradictions: [],
    gaps: [],
    userNotes: [],
    relatedQuestions: [],
    ...overrides,
  };
};

/**
 * Factory function for creating mock findings
 */
export const createMockFinding = (overrides?: Partial<Finding>): Finding => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    questionId: uuidv4(),
    description: 'Test finding about ME/CFS biomarkers',
    supportingPapers: [uuidv4()],
    studyTypes: ['Clinical Trial'],
    sampleSizes: [100],
    consistency: Consistency.HIGH,
    peerReviewedCount: 1,
    preprintCount: 0,
    qualityAssessment: 'High quality peer-reviewed study',
    quantitativeResult: 'ATP reduced 20-40%',
    qualitativeResult: 'Patients showed significant improvement',
    hasContradiction: false,
    contradictingPapers: [],
    dateCreated: now,
    lastUpdated: now,
    ...overrides,
  };
};

/**
 * Factory function for creating mock contradictions
 */
export const createMockContradiction = (
  overrides?: Partial<Contradiction>
): Contradiction => {
  const now = new Date().toISOString();
  const majorityView: ContradictionView = {
    description: 'Majority view on biomarkers',
    papers: [uuidv4(), uuidv4(), uuidv4()],
    evidence: 'Three studies found significant ATP reduction',
    paperCount: 3,
  };
  const minorityView: ContradictionView = {
    description: 'Minority view on biomarkers',
    papers: [uuidv4()],
    evidence: 'One study found no significant change',
    paperCount: 1,
  };
  return {
    id: uuidv4(),
    findingId: uuidv4(),
    topic: 'ATP levels in ME/CFS patients',
    majorityView,
    minorityView,
    methodologicalDifferences: ['Sample size differences', 'Different measurement techniques'],
    possibleExplanations: ['Patient population variation', 'Timing of measurements'],
    severity: ContradictionSeverity.MAJOR,
    status: ContradictionStatus.UNRESOLVED,
    conservativeInterpretation: 'Evidence suggests ATP changes, but magnitude varies',
    dateDetected: now,
    lastUpdated: now,
    flaggedForResearch: true,
    ...overrides,
  };
};

/**
 * Factory function for creating mock notes
 */
export const createMockNote = (overrides?: Partial<Note>): Note => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    paperId: uuidv4(),
    title: 'Test Note',
    content: 'Test note content',
    tags: ['test'],
    dateCreated: now,
    dateModified: now,
    ...overrides,
  };
};

/**
 * Factory function for creating mock saved searches
 */
export const createMockSavedSearch = (
  overrides?: Partial<SavedSearch>
): SavedSearch => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: 'Test Search',
    query: 'biomarkers',
    filters: {
      categories: [Category.BIOMARKERS],
      readStatus: [ReadStatus.UNREAD],
    },
    dateCreated: now,
    lastUsed: now,
    useCount: 0,
    ...overrides,
  };
};

/**
 * Helper to wait for async operations in tests
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper to create multiple mock papers at once
 */
export const createMockPapers = (count: number): ResearchPaper[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPaper({
      title: `Test Paper ${i + 1}`,
      pubmedId: `${12345678 + i}`,
    })
  );
};

/**
 * Helper to create multiple mock questions at once
 */
export const createMockQuestions = (count: number): ResearchQuestion[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      question: `Test Question ${i + 1}?`,
    })
  );
};

/**
 * Load test URLs from fixtures
 */
export const loadTestUrls = async () => {
  const testUrls = await import('./fixtures/test-urls.json');
  return testUrls.default;
};

/**
 * Load mock API response from fixtures
 * @param filename - Name of the JSON file (e.g., 'crossref-sample-doi.json')
 */
export const loadMockResponse = async (filename: string) => {
  const response = await import(`./fixtures/mock-responses/${filename}`);
  return response.default;
};

/**
 * Get test DOI by index (defaults to first DOI)
 */
export const getTestDoi = async (index = 0): Promise<string> => {
  const urls = await loadTestUrls();
  return urls.dois[index]?.id || '10.1016/j.cell.2024.02.032';
};

/**
 * Get test PubMed ID by index (defaults to first PMID)
 */
export const getTestPmid = async (index = 0): Promise<string> => {
  const urls = await loadTestUrls();
  return urls.pubmed[index]?.id || '38123456';
};

