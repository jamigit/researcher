/**
 * Mock Claude API for testing
 * @ai-context Provides mock responses for abstract screening and analysis
 */

import { vi } from 'vitest';
import type { AbstractReviewResult, FullTextReviewResult } from '@/types/discovery';

export const mockClaudeAbstractReview = (relevanceScore: number): AbstractReviewResult => ({
  relevant: relevanceScore > 0.5,
  relevanceScore,
  reasoning: relevanceScore > 0.7
    ? 'Paper directly addresses ME/CFS with original research'
    : relevanceScore > 0.5
    ? 'Paper mentions ME/CFS but not primary focus'
    : 'Paper not relevant to ME/CFS research',
  suggestedCategories: relevanceScore > 0.7
    ? ['immunology', 'pathophysiology']
    : [],
  keepForFullReview: relevanceScore > 0.7,
  confidence: 0.8,
});

export const mockClaudeFullTextReview = (): FullTextReviewResult => ({
  methodology: {
    studyDesign: 'Case-control study',
    sampleSize: 65,
    duration: '6 months',
    limitations: ['Single center study', 'Small sample size'],
  },
  keyFindings: [
    'NK cell activity reduced 30% in patients',
    'Elevated inflammatory cytokines',
  ],
  dataQuality: 0.8,
  citableResults: [
    '"NK cell cytotoxicity significantly reduced (p<0.001)"',
  ],
  contradictions: [],
  recommendAddToDatabase: true,
});

/**
 * Note: Due to vitest hoisting, these functions cannot be used as-is.
 * Instead, mock directly in test files using vi.mock() at the top level.
 * 
 * Example:
 * ```typescript
 * // At the top of your test file
 * vi.mock('@/lib/claude', () => ({
 *   callClaudeJSON: vi.fn(),
 * }));
 * 
 * // In your test
 * import { callClaudeJSON } from '@/lib/claude';
 * (callClaudeJSON as any).mockResolvedValueOnce(mockClaudeAbstractReview(0.85));
 * ```
 */

