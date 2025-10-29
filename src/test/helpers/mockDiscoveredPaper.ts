/**
 * Helper functions to create mock discovered papers for testing
 * @ai-context Test data factories
 */

import type { DiscoveredPaper, PaperCandidate } from '@/types/discovery';

export const createMockPaperCandidate = (
  overrides?: Partial<PaperCandidate>
): PaperCandidate => ({
  pubmedId: '38234567',
  doi: '10.1186/s12967-024-00001-1',
  title: 'Immune abnormalities in ME/CFS patients',
  abstract:
    'This study examined immune markers in ME/CFS patients. Findings suggest NK cell dysfunction.',
  authors: [{ name: 'John Smith' }],
  publicationDate: '2024-01-15',
  keywords: ['ME/CFS', 'immune'],
  source: 'pubmed',
  sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/38234567/',
  ...overrides,
});

export const createMockDiscoveredPaper = (
  overrides?: Partial<DiscoveredPaper>
): DiscoveredPaper => ({
  ...createMockPaperCandidate(),
  id: crypto.randomUUID(),
  dateDiscovered: new Date().toISOString(),
  reviewStatus: 'pending',
  relevanceScore: 0.85,
  ...overrides,
});

export const createMockIrrelevantPaper = (): PaperCandidate => ({
  pubmedId: '38234999',
  doi: '10.1234/diabetes.2024.001',
  title: 'Diabetes treatment outcomes',
  abstract: 'This study evaluated insulin therapy in diabetes patients.',
  authors: [{ name: 'Bob Johnson' }],
  publicationDate: '2024-01-10',
  keywords: ['diabetes', 'insulin'],
  source: 'pubmed',
  sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/38234999/',
});

