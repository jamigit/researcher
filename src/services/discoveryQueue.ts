/**
 * Discovery Queue Service
 * Manages discovered papers before adding to main database
 * @ai-context Service layer for discovery workflow
 */

import { db } from './db';
import type { DiscoveredPaper, PaperCandidate } from '@/types/discovery';
import { createDiscoveredPaper, convertToResearchPaper } from '@/types/discovery';

/**
 * Add paper to discovery queue
 */
export async function addToQueue(paper: PaperCandidate): Promise<DiscoveredPaper> {
  const discovered = createDiscoveredPaper(paper);
  
  try {
    await db.discoveredPapers.add(discovered);
    console.log(`Added paper to queue: ${discovered.id}`);
    return discovered;
  } catch (error) {
    console.error('Failed to add to queue:', error);
    throw new Error('Failed to add paper to discovery queue');
  }
}

/**
 * Get all queued papers
 */
export async function getQueuedPapers(
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected'
): Promise<DiscoveredPaper[]> {
  try {
    if (status) {
      return await db.discoveredPapers
        .where('reviewStatus')
        .equals(status)
        .sortBy('dateDiscovered');
    }
    
    return await db.discoveredPapers
      .orderBy('dateDiscovered')
      .reverse()
      .toArray();
  } catch (error) {
    console.error('Failed to get queued papers:', error);
    return [];
  }
}

/**
 * Get single discovered paper by ID
 */
export async function getDiscoveredPaper(id: string): Promise<DiscoveredPaper | undefined> {
  try {
    return await db.discoveredPapers.get(id);
  } catch (error) {
    console.error('Failed to get discovered paper:', error);
    return undefined;
  }
}

/**
 * Update review status
 */
export async function updateReviewStatus(
  id: string,
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
): Promise<void> {
  try {
    await db.discoveredPapers.update(id, { reviewStatus: status });
    console.log(`Updated paper ${id} status to ${status}`);
  } catch (error) {
    console.error('Failed to update review status:', error);
    throw error;
  }
}

/**
 * Update abstract review result
 */
export async function updateAbstractReview(
  id: string,
  review: DiscoveredPaper['abstractReview']
): Promise<void> {
  try {
    await db.discoveredPapers.update(id, {
      abstractReview: review,
      relevanceScore: review?.relevanceScore,
    });
  } catch (error) {
    console.error('Failed to update abstract review:', error);
    throw error;
  }
}

/**
 * Update full text review result
 */
export async function updateFullTextReview(
  id: string,
  review: DiscoveredPaper['fullTextReview']
): Promise<void> {
  try {
    await db.discoveredPapers.update(id, { fullTextReview: review });
  } catch (error) {
    console.error('Failed to update full text review:', error);
    throw error;
  }
}

/**
 * Approve paper and move to main papers table
 */
export async function approvePaper(id: string): Promise<void> {
  try {
    const discovered = await db.discoveredPapers.get(id);
    
    if (!discovered) {
      throw new Error('Discovered paper not found');
    }
    
    // Convert to research paper
    const researchPaper = convertToResearchPaper(discovered);
    
    // Add to main papers table
    await db.papers.add(researchPaper);
    
    // Update status in queue
    await db.discoveredPapers.update(id, { reviewStatus: 'approved' });
    
    console.log(`Approved and added paper: ${researchPaper.id}`);
  } catch (error) {
    console.error('Failed to approve paper:', error);
    throw error;
  }
}

/**
 * Reject paper
 */
export async function rejectPaper(id: string): Promise<void> {
  try {
    await db.discoveredPapers.update(id, { reviewStatus: 'rejected' });
    console.log(`Rejected paper: ${id}`);
  } catch (error) {
    console.error('Failed to reject paper:', error);
    throw error;
  }
}

/**
 * Delete paper from queue
 */
export async function deleteFromQueue(id: string): Promise<void> {
  try {
    await db.discoveredPapers.delete(id);
    console.log(`Deleted paper from queue: ${id}`);
  } catch (error) {
    console.error('Failed to delete from queue:', error);
    throw error;
  }
}

/**
 * Clear all papers from queue
 */
export async function clearQueue(status?: 'pending' | 'reviewing' | 'approved' | 'rejected'): Promise<void> {
  try {
    if (status) {
      await db.discoveredPapers
        .where('reviewStatus')
        .equals(status)
        .delete();
    } else {
      await db.discoveredPapers.clear();
    }
    console.log('Cleared discovery queue');
  } catch (error) {
    console.error('Failed to clear queue:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
}> {
  try {
    const all = await db.discoveredPapers.toArray();
    
    return {
      total: all.length,
      pending: all.filter(p => p.reviewStatus === 'pending').length,
      reviewing: all.filter(p => p.reviewStatus === 'reviewing').length,
      approved: all.filter(p => p.reviewStatus === 'approved').length,
      rejected: all.filter(p => p.reviewStatus === 'rejected').length,
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    return { total: 0, pending: 0, reviewing: 0, approved: 0, rejected: 0 };
  }
}

/**
 * Bulk add papers to queue
 */
export async function bulkAddToQueue(papers: PaperCandidate[]): Promise<DiscoveredPaper[]> {
  const discovered = papers.map(createDiscoveredPaper);
  
  try {
    await db.discoveredPapers.bulkAdd(discovered);
    console.log(`Added ${discovered.length} papers to queue`);
    return discovered;
  } catch (error) {
    console.error('Failed to bulk add to queue:', error);
    throw error;
  }
}

