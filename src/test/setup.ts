/**
 * Global test setup
 * @ai-context Configures fake-indexeddb for Dexie testing and test utilities
 */

import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { db } from '@/services/db';

// Initialize database before all tests
beforeAll(async () => {
  await db.open();
});

// Reset IndexedDB before each test for isolation
beforeEach(() => {
  // Create a fresh IndexedDB instance for each test
  global.indexedDB = new IDBFactory();
});

// Clean up after each test
afterEach(async () => {
  // Clear all database tables
  try {
    await db.papers.clear();
    await db.notes.clear();
    await db.questions.clear();
    await db.findings.clear();
    await db.contradictions.clear();
    await db.explainers.clear();
    await db.questionVersions.clear();
    await db.discoveredPapers.clear();
  } catch (error) {
    // Ignore errors if tables don't exist yet
  }
  
  vi.clearAllMocks();
});

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  // Keep log for debugging tests
  log: console.log,
};

