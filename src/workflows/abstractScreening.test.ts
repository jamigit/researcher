/**
 * Unit tests for Abstract Screening
 * @ai-context Tests abstract relevance evaluation
 */

import { describe, it, expect, vi } from 'vitest';
import {
  screenAbstract,
  getDefaultCriteria,
  batchScreenAbstracts,
  filterByRelevance,
} from './abstractScreening';
import {
  createMockPaperCandidate,
  createMockIrrelevantPaper,
} from '@/test/helpers/mockDiscoveredPaper';
import { mockClaudeAbstractReview } from '@/test/helpers/mockClaudeAPI';

// Mock Claude API
vi.mock('@/lib/claude', () => ({
  callClaudeJSON: vi.fn(),
}));

import { callClaudeJSON } from '@/lib/claude';

describe('abstractScreening', () => {
  describe('getDefaultCriteria', () => {
    it('should return default screening criteria', () => {
      const criteria = getDefaultCriteria();
      
      expect(criteria).toHaveProperty('keywords');
      expect(criteria.keywords).toContain('ME/CFS');
      expect(criteria.keywords).toContain('chronic fatigue syndrome');
      expect(criteria.minRelevanceScore).toBe(0.5);
      expect(criteria.minSampleSize).toBe(10);
    });
  });
  
  describe('screenAbstract', () => {
    it('should score relevant papers high', async () => {
      const paper = createMockPaperCandidate({
        title: 'ME/CFS biomarkers study',
        abstract: 'This study examined chronic fatigue syndrome patients and found immune abnormalities.',
      });
      
      (callClaudeJSON as any).mockResolvedValueOnce(mockClaudeAbstractReview(0.85));
      
      const result = await screenAbstract(paper, getDefaultCriteria());
      
      expect(result.relevant).toBe(true);
      expect(result.relevanceScore).toBeGreaterThan(0.7);
      expect(result.keepForFullReview).toBe(true);
    });
    
    it('should reject irrelevant papers', async () => {
      const paper = createMockIrrelevantPaper();
      
      (callClaudeJSON as any).mockResolvedValueOnce(mockClaudeAbstractReview(0.2));
      
      const result = await screenAbstract(paper, getDefaultCriteria());
      
      expect(result.relevant).toBe(false);
      expect(result.relevanceScore).toBeLessThan(0.5);
      expect(result.keepForFullReview).toBe(false);
    });
    
    it('should handle missing abstract with fallback', async () => {
      const paper = createMockPaperCandidate({ abstract: '' });
      
      const result = await screenAbstract(paper, getDefaultCriteria());
      
      expect(result.relevant).toBe(false);
      expect(result.relevanceScore).toBe(0);
      expect(result.reasoning).toContain('Abstract missing');
    });
    
    it('should handle short abstract with fallback', async () => {
      const paper = createMockPaperCandidate({ abstract: 'Too short' });
      
      const result = await screenAbstract(paper, getDefaultCriteria());
      
      expect(result.relevant).toBe(false);
      expect(result.reasoning).toContain('too short');
    });
    
    it('should use fallback on API error', async () => {
      const paper = createMockPaperCandidate({
        title: 'ME/CFS study',
        abstract: 'This study examined chronic fatigue syndrome patients.',
      });
      
      (callClaudeJSON as any).mockRejectedValueOnce(new Error('API Error'));
      
      const result = await screenAbstract(paper, getDefaultCriteria());
      
      // Fallback should find keywords
      expect(result.reasoning).toContain('Fallback keyword matching');
      expect(result.relevanceScore).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.5); // Low confidence for fallback
    });
    
    it('should validate relevance score range', async () => {
      const paper = createMockPaperCandidate();
      
      (callClaudeJSON as any).mockResolvedValueOnce({
        ...mockClaudeAbstractReview(0.85),
        relevanceScore: 1.5, // Invalid score
      });
      
      // Should fall back to keyword matching
      await expect(screenAbstract(paper, getDefaultCriteria())).resolves.toMatchObject({
        reasoning: expect.stringContaining('Fallback'),
      });
    });
  });
  
  describe('batchScreenAbstracts', () => {
    it('should screen multiple papers in parallel', async () => {
      const papers = [
        createMockPaperCandidate({ title: 'Paper 1' }),
        createMockPaperCandidate({ title: 'Paper 2' }),
        createMockIrrelevantPaper(),
      ];
      
      (callClaudeJSON as any)
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.85))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.75))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.2));
      
      const results = await batchScreenAbstracts(papers, getDefaultCriteria());
      
      expect(results).toHaveLength(3);
      expect(results[0].result.relevanceScore).toBeGreaterThan(0.7);
      expect(results[1].result.relevanceScore).toBeGreaterThan(0.7);
      expect(results[2].result.relevanceScore).toBeLessThan(0.5);
    });
    
    it('should handle empty array', async () => {
      const results = await batchScreenAbstracts([], getDefaultCriteria());
      expect(results).toHaveLength(0);
    });
  });
  
  describe('filterByRelevance', () => {
    it('should filter papers by relevance threshold', () => {
      const screenedPapers = [
        {
          paper: createMockPaperCandidate({ title: 'High relevance' }),
          result: mockClaudeAbstractReview(0.9),
        },
        {
          paper: createMockPaperCandidate({ title: 'Medium relevance' }),
          result: mockClaudeAbstractReview(0.6),
        },
        {
          paper: createMockPaperCandidate({ title: 'Low relevance' }),
          result: mockClaudeAbstractReview(0.3),
        },
      ];
      
      const filtered = filterByRelevance(screenedPapers, 0.7);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('High relevance');
    });
    
    it('should return all papers if threshold is 0', () => {
      const screenedPapers = [
        {
          paper: createMockPaperCandidate(),
          result: mockClaudeAbstractReview(0.5),
        },
      ];
      
      const filtered = filterByRelevance(screenedPapers, 0);
      expect(filtered).toHaveLength(1);
    });
    
    it('should return empty array if none meet threshold', () => {
      const screenedPapers = [
        {
          paper: createMockPaperCandidate(),
          result: mockClaudeAbstractReview(0.3),
        },
      ];
      
      const filtered = filterByRelevance(screenedPapers, 0.7);
      expect(filtered).toHaveLength(0);
    });
  });
});

