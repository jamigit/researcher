/**
 * Global test setup
 * @ai-context Configures fake-indexeddb for Dexie testing and test utilities
 */

import { afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// Reset IndexedDB before each test for isolation
beforeEach(() => {
  // Create a fresh IndexedDB instance for each test
  global.indexedDB = new IDBFactory();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

