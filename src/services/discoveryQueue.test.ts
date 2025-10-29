/**
 * Unit tests for Discovery Queue Service
 * @ai-context Tests discovery queue operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addToQueue,
  getQueuedPapers,
  getDiscoveredPaper,
  updateReviewStatus,
  approvePaper,
  rejectPaper,
  deleteFromQueue,
  getQueueStats,
  bulkAddToQueue,
} from './discoveryQueue';
import { createMockDiscoveredPaper, createMockPaperCandidate } from '@/test/helpers/mockDiscoveredPaper';
import { db } from './db';

describe('discoveryQueue', () => {
  beforeEach(async () => {
    // Clear queue before each test
    await db.discoveredPapers.clear();
    await db.papers.clear();
  });
  
  describe('addToQueue', () => {
    it('should add paper to queue', async () => {
      const paper = createMockPaperCandidate();
      const discovered = await addToQueue(paper);
      
      expect(discovered).toHaveProperty('id');
      expect(discovered.title).toBe(paper.title);
      expect(discovered.reviewStatus).toBe('pending');
      
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(1);
      expect(queued[0].id).toBe(discovered.id);
    });
    
    it('should generate unique IDs', async () => {
      const paper1 = createMockPaperCandidate({ title: 'Paper 1' });
      const paper2 = createMockPaperCandidate({ title: 'Paper 2' });
      
      const discovered1 = await addToQueue(paper1);
      const discovered2 = await addToQueue(paper2);
      
      expect(discovered1.id).not.toBe(discovered2.id);
    });
  });
  
  describe('getQueuedPapers', () => {
    it('should return all queued papers', async () => {
      await addToQueue(createMockPaperCandidate({ title: 'Paper 1' }));
      await addToQueue(createMockPaperCandidate({ title: 'Paper 2' }));
      
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(2);
    });
    
    it('should filter by status', async () => {
      const paper1 = await addToQueue(createMockPaperCandidate({ title: 'Paper 1' }));
      await addToQueue(createMockPaperCandidate({ title: 'Paper 2' }));
      
      await updateReviewStatus(paper1.id, 'approved');
      
      const pending = await getQueuedPapers('pending');
      const approved = await getQueuedPapers('approved');
      
      expect(pending).toHaveLength(1);
      expect(approved).toHaveLength(1);
      expect(approved[0].id).toBe(paper1.id);
    });
    
    it('should return empty array when queue is empty', async () => {
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(0);
    });
  });
  
  describe('getDiscoveredPaper', () => {
    it('should return paper by ID', async () => {
      const added = await addToQueue(createMockPaperCandidate());
      const paper = await getDiscoveredPaper(added.id);
      
      expect(paper).toBeDefined();
      expect(paper?.id).toBe(added.id);
    });
    
    it('should return undefined for non-existent ID', async () => {
      const paper = await getDiscoveredPaper('non-existent-id');
      expect(paper).toBeUndefined();
    });
  });
  
  describe('updateReviewStatus', () => {
    it('should update review status', async () => {
      const paper = await addToQueue(createMockPaperCandidate());
      
      await updateReviewStatus(paper.id, 'approved');
      
      const updated = await getDiscoveredPaper(paper.id);
      expect(updated?.reviewStatus).toBe('approved');
    });
    
    it('should handle all status values', async () => {
      const paper = await addToQueue(createMockPaperCandidate());
      
      const statuses: Array<'pending' | 'reviewing' | 'approved' | 'rejected'> = [
        'pending',
        'reviewing',
        'approved',
        'rejected',
      ];
      
      for (const status of statuses) {
        await updateReviewStatus(paper.id, status);
        const updated = await getDiscoveredPaper(paper.id);
        expect(updated?.reviewStatus).toBe(status);
      }
    });
  });
  
  describe('approvePaper', () => {
    it('should move approved paper to main table', async () => {
      const discovered = await addToQueue(createMockPaperCandidate());
      
      await approvePaper(discovered.id);
      
      // Check paper moved to main table
      const papers = await db.papers.toArray();
      expect(papers).toHaveLength(1);
      expect(papers[0].title).toBe(discovered.title);
      expect(papers[0].discoveredBy).toBe('pubmed');
      
      // Check status updated in queue
      const updated = await getDiscoveredPaper(discovered.id);
      expect(updated?.reviewStatus).toBe('approved');
    });
    
    it('should throw error for non-existent paper', async () => {
      await expect(approvePaper('non-existent-id')).rejects.toThrow();
    });
  });
  
  describe('rejectPaper', () => {
    it('should mark paper as rejected', async () => {
      const paper = await addToQueue(createMockPaperCandidate());
      
      await rejectPaper(paper.id);
      
      const updated = await getDiscoveredPaper(paper.id);
      expect(updated?.reviewStatus).toBe('rejected');
      
      // Should NOT be in main papers table
      const papers = await db.papers.toArray();
      expect(papers).toHaveLength(0);
    });
  });
  
  describe('deleteFromQueue', () => {
    it('should delete paper from queue', async () => {
      const paper = await addToQueue(createMockPaperCandidate());
      
      await deleteFromQueue(paper.id);
      
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(0);
      
      const deleted = await getDiscoveredPaper(paper.id);
      expect(deleted).toBeUndefined();
    });
  });
  
  describe('getQueueStats', () => {
    it('should return accurate statistics', async () => {
      const paper1 = await addToQueue(createMockPaperCandidate({ title: 'Paper 1' }));
      const paper2 = await addToQueue(createMockPaperCandidate({ title: 'Paper 2' }));
      const paper3 = await addToQueue(createMockPaperCandidate({ title: 'Paper 3' }));
      
      await updateReviewStatus(paper1.id, 'approved');
      await updateReviewStatus(paper2.id, 'reviewing');
      // paper3 stays pending
      
      const stats = await getQueueStats();
      
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.reviewing).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(0);
    });
    
    it('should return zeros for empty queue', async () => {
      const stats = await getQueueStats();
      
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
    });
  });
  
  describe('bulkAddToQueue', () => {
    it('should add multiple papers at once', async () => {
      const papers = [
        createMockPaperCandidate({ title: 'Paper 1' }),
        createMockPaperCandidate({ title: 'Paper 2' }),
        createMockPaperCandidate({ title: 'Paper 3' }),
      ];
      
      const discovered = await bulkAddToQueue(papers);
      
      expect(discovered).toHaveLength(3);
      
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(3);
    });
    
    it('should handle empty array', async () => {
      const discovered = await bulkAddToQueue([]);
      expect(discovered).toHaveLength(0);
    });
  });
  
  describe('Integration: Full workflow', () => {
    it('should handle concurrent queue operations', async () => {
      const papers = Array.from({ length: 10 }, (_, i) =>
        createMockPaperCandidate({ title: `Paper ${i}` })
      );
      
      // Add papers concurrently
      await Promise.all(papers.map(p => addToQueue(p)));
      
      const queued = await getQueuedPapers();
      expect(queued).toHaveLength(10);
    });
  });
});

