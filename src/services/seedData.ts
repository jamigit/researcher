/**
 * Seed Data Service
 * Auto-loads pre-processed paper data on first app launch
 * @ai-context One-time data seeding for development/demo
 */

import { db } from './db';
import seedDataJson from '../data/seed-data.json';
import type { ResearchPaper } from '@/types/paper';

interface SeedData {
  papers: Array<Omit<ResearchPaper, 'id'> & { id: string }>;
  generated: string;
  count: number;
}

const seedData = seedDataJson as SeedData;

/**
 * Check if database needs seeding
 */
export const shouldSeedData = async (): Promise<boolean> => {
  try {
    const paperCount = await db.papers.count();
    return paperCount === 0 && seedData.count > 0;
  } catch (error) {
    console.error('Error checking if seeding needed:', error);
    return false;
  }
};

/**
 * Load seed data into database
 */
export const loadSeedData = async (): Promise<void> => {
  try {
    console.log('Loading seed data...');
    
    if (seedData.papers.length === 0) {
      console.log('No seed data available. Run "npm run seed:generate" to create seed data from PDFs.');
      return;
    }

    // Import papers
    await db.papers.bulkAdd(seedData.papers);
    
    console.log(`✅ Loaded ${seedData.count} papers from seed data (generated ${new Date(seedData.generated).toLocaleDateString()})`);
  } catch (error) {
    console.error('Failed to load seed data:', error);
    throw error;
  }
};

/**
 * Auto-seed on app initialization if needed
 * Will replace existing papers if count doesn't match expected seed count
 */
export const autoSeedIfNeeded = async (): Promise<void> => {
  try {
    const paperCount = await db.papers.count();
    const expectedCount = seedData.count;
    
    // Load seed data if:
    // 1. Database is empty, OR
    // 2. Paper count doesn't match expected seed count (incomplete or outdated data)
    if (paperCount === 0) {
      console.log('📦 Auto-loading seed data (database empty)...');
      await loadSeedData();
    } else if (paperCount !== expectedCount && expectedCount > 0) {
      console.log(`📦 Database has ${paperCount} papers but seed has ${expectedCount}. Reloading seed data...`);
      // Clear existing papers and reload
      await db.papers.clear();
      await loadSeedData();
    } else {
      console.log(`✅ Database already has ${paperCount} papers (matches seed count). Skipping auto-load.`);
    }
  } catch (error) {
    console.error('Error in autoSeedIfNeeded:', error);
    throw error;
  }
};

