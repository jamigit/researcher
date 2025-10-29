/**
 * Integration tests for full discovery pipeline
 * @ai-context End-to-end workflow testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { discoverNewPapers } from '@/agents/PubMedMonitor';
import { batchScreenAbstracts, getDefaultCriteria } from '@/workflows/abstractScreening';
import { bulkAddToQueue, approvePaper, getQueueStats } from '@/services/discoveryQueue';
import { db } from '@/services/db';
import { createMockPaperCandidate } from '@/test/helpers/mockDiscoveredPaper';
import { mockClaudeAbstractReview } from '@/test/helpers/mockClaudeAPI';

// Mock external APIs
vi.mock('@/lib/claude', () => ({
  callClaudeJSON: vi.fn(),
}));

vi.mock('@/agents/PubMedMonitor', async () => {
  const actual = await vi.importActual('@/agents/PubMedMonitor');
  return {
    ...actual,
    discoverNewPapers: vi.fn(),
  };
});

import { callClaudeJSON } from '@/lib/claude';

describe('Discovery Pipeline Integration', () => {
  beforeEach(async () => {
    // Clear all database tables
    await db.discoveredPapers.clear();
    await db.papers.clear();
    vi.clearAllMocks();
  });

  describe('Full Pipeline: Discover → Screen → Approve', () => {
    it('should discover, screen, and approve papers end-to-end', async () => {
      // 1. Mock discovery of 5 papers
      const mockPapers = Array.from({ length: 5 }, (_, i) =>
        createMockPaperCandidate({
          pubmedId: `3823456${i}`,
          title: `ME/CFS Study ${i + 1}`,
          abstract: i < 3
            ? 'This study examined ME/CFS patients and found immune abnormalities.'
            : 'This unrelated diabetes study examined insulin therapy.',
        })
      );

      (discoverNewPapers as any).mockResolvedValueOnce(mockPapers);

      const discovered = await discoverNewPapers({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 10,
      });

      expect(discovered).toHaveLength(5);

      // 2. Screen abstracts - first 3 relevant, last 2 irrelevant
      (callClaudeJSON as any)
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.85))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.80))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.75))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.30))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.25));

      const screeningResults = await batchScreenAbstracts(
        discovered,
        getDefaultCriteria()
      );

      expect(screeningResults).toHaveLength(5);

      // 3. Filter for relevant papers
      const approved = screeningResults.filter((r) => r.result.keepForFullReview);
      expect(approved).toHaveLength(3);

      // 4. Add to discovery queue
      const discoveredPapers = await bulkAddToQueue(approved.map((p) => p.paper));
      expect(discoveredPapers).toHaveLength(3);

      // 5. Verify queue statistics
      const stats = await getQueueStats();
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(3);
      expect(stats.approved).toBe(0);

      // 6. Approve papers (move to main database)
      for (const paper of discoveredPapers) {
        await approvePaper(paper.id);
      }

      // 7. Verify papers moved to main table
      const mainPapers = await db.papers.toArray();
      expect(mainPapers).toHaveLength(3);
      expect(mainPapers[0].discoveredBy).toBe('pubmed');

      // 8. Verify queue statistics updated
      const finalStats = await getQueueStats();
      expect(finalStats.approved).toBe(3);
    });

    it('should handle partial failures gracefully', async () => {
      // Mock discovery success
      const mockPapers = [
        createMockPaperCandidate({ title: 'Paper 1' }),
        createMockPaperCandidate({ title: 'Paper 2' }),
        createMockPaperCandidate({ title: 'Paper 3' }),
      ];

      (discoverNewPapers as any).mockResolvedValueOnce(mockPapers);

      const discovered = await discoverNewPapers({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 10,
      });

      // Mock Claude API failing for second paper
      (callClaudeJSON as any)
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.85))
        .mockRejectedValueOnce(new Error('Claude API Error'))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.80));

      const screeningResults = await batchScreenAbstracts(
        discovered,
        getDefaultCriteria()
      );

      // Should still have results for papers 1 and 3 (paper 2 falls back to keyword matching)
      expect(screeningResults).toHaveLength(3);

      // All results should have scores (either from Claude or fallback)
      screeningResults.forEach((result) => {
        expect(result.result.relevanceScore).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty discovery results', async () => {
      (discoverNewPapers as any).mockResolvedValueOnce([]);

      const discovered = await discoverNewPapers({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 10,
      });

      expect(discovered).toHaveLength(0);

      const screeningResults = await batchScreenAbstracts(
        discovered,
        getDefaultCriteria()
      );

      expect(screeningResults).toHaveLength(0);

      const stats = await getQueueStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('Database Persistence', () => {
    it('should persist discovered papers across sessions', async () => {
      const paper = createMockPaperCandidate();
      const discovered = await bulkAddToQueue([paper]);

      // Simulate app restart
      await db.close();
      await db.open();

      const queued = await db.discoveredPapers.toArray();
      expect(queued).toHaveLength(1);
      expect(queued[0].id).toBe(discovered[0].id);
    });

    it('should handle concurrent queue operations', async () => {
      const papers = Array.from({ length: 10 }, (_, i) =>
        createMockPaperCandidate({ title: `Paper ${i}` })
      );

      // Add papers concurrently
      const results = await Promise.all(
        papers.map(async (paper) => {
          const [discovered] = await bulkAddToQueue([paper]);
          return discovered;
        })
      );

      expect(results).toHaveLength(10);

      const queued = await db.discoveredPapers.toArray();
      expect(queued).toHaveLength(10);
    });

    it('should maintain data integrity during approval', async () => {
      const paper = createMockPaperCandidate({
        pubmedId: '12345',
        doi: '10.1234/test',
        title: 'Test Paper',
      });

      const [discovered] = await bulkAddToQueue([paper]);

      await approvePaper(discovered.id);

      // Check discovery queue status
      const queuedPaper = await db.discoveredPapers.get(discovered.id);
      expect(queuedPaper?.reviewStatus).toBe('approved');

      // Check main papers table
      const mainPapers = await db.papers.toArray();
      expect(mainPapers).toHaveLength(1);
      expect(mainPapers[0].pubmedId).toBe('12345');
      expect(mainPapers[0].doi).toBe('10.1234/test');
      expect(mainPapers[0].title).toBe('Test Paper');
    });
  });

  describe('Error Recovery', () => {
    it('should continue processing after individual failures', async () => {
      const papers = Array.from({ length: 5 }, (_, i) =>
        createMockPaperCandidate({ title: `Paper ${i}` })
      );

      (discoverNewPapers as any).mockResolvedValueOnce(papers);

      const discovered = await discoverNewPapers({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 10,
      });

      // Mock failures for papers 1 and 3
      (callClaudeJSON as any)
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.85))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.80))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockClaudeAbstractReview(0.75));

      const results = await batchScreenAbstracts(discovered, getDefaultCriteria());

      // All papers should have results (failures use fallback)
      expect(results).toHaveLength(5);
      results.forEach((r) => {
        expect(r.result).toBeDefined();
        expect(typeof r.result.relevanceScore).toBe('number');
      });
    });
  });

  describe('Performance', () => {
    it('should process batch screening in parallel', async () => {
      const papers = Array.from({ length: 20 }, (_, i) =>
        createMockPaperCandidate({ title: `Paper ${i}` })
      );

      (discoverNewPapers as any).mockResolvedValueOnce(papers);

      const discovered = await discoverNewPapers({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 20,
      });

      // Mock all responses
      for (let i = 0; i < 20; i++) {
        (callClaudeJSON as any).mockResolvedValueOnce(
          mockClaudeAbstractReview(Math.random() * 0.5 + 0.5) // Random score 0.5-1.0
        );
      }

      const startTime = Date.now();
      const results = await batchScreenAbstracts(discovered, getDefaultCriteria());
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(20);

      // Should complete reasonably fast (parallel processing)
      // Allow generous time for CI environments
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });
  });
});

