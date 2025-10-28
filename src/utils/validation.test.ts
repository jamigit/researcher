/**
 * Tests for validation utilities
 * @ai-context Unit tests for Zod schemas and validation helpers
 */

import { describe, it, expect } from 'vitest';
import {
  paperSchema,
  manualPaperEntrySchema,
  validatePaper,
  validateManualEntry,
  isValidUrl,
  isValidDoi,
  isValidEmail,
  parseAuthors,
  parseTags,
} from './validation';
import { ReadStatus, Importance, Category, StudyType } from '@/types/paper';

describe('paperSchema', () => {
  it('should validate a complete valid paper', () => {
    const validPaper = {
      title: 'Test Research Paper on ME/CFS Biomarkers',
      authors: [{ name: 'John Doe', affiliation: 'Test University' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements for validation purposes.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      journal: 'Test Journal',
      url: 'https://example.com/paper',
      doi: '10.1234/test.2024',
      studyType: StudyType.CLINICAL_TRIAL,
      categories: [Category.BIOMARKERS],
      tags: ['mecfs', 'biomarkers'],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.HIGH,
      fullTextAvailable: true,
    };

    const result = paperSchema.parse(validPaper);
    expect(result).toBeDefined();
    expect(result.title).toBe(validPaper.title);
  });

  it('should reject paper with title too short', () => {
    const invalidPaper = {
      title: 'Test',
      authors: [{ name: 'John Doe' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      categories: [],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    expect(() => paperSchema.parse(invalidPaper)).toThrow();
  });

  it('should reject paper with invalid DOI format', () => {
    const invalidPaper = {
      title: 'Test Research Paper on ME/CFS',
      authors: [{ name: 'John Doe' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      doi: 'invalid-doi',
      categories: [],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    expect(() => paperSchema.parse(invalidPaper)).toThrow();
  });

  it('should reject paper with too many categories', () => {
    const invalidPaper = {
      title: 'Test Research Paper on ME/CFS',
      authors: [{ name: 'John Doe' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      categories: [
        Category.BIOMARKERS,
        Category.TREATMENT,
        Category.IMMUNOLOGY,
        Category.DIAGNOSIS,
        Category.EPIDEMIOLOGY,
        Category.PATHOPHYSIOLOGY,
      ],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    expect(() => paperSchema.parse(invalidPaper)).toThrow();
  });

  it('should accept optional fields as undefined', () => {
    const minimalPaper = {
      title: 'Test Research Paper on ME/CFS',
      authors: [{ name: 'John Doe' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      categories: [],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    const result = paperSchema.parse(minimalPaper);
    expect(result).toBeDefined();
    expect(result.doi).toBeUndefined();
    expect(result.journal).toBeUndefined();
  });
});

describe('manualPaperEntrySchema', () => {
  it('should validate manual paper entry with comma-separated authors', () => {
    const validEntry = {
      title: 'Test Research Paper',
      authors: 'John Doe, Jane Smith',
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15',
      journal: 'Test Journal',
      url: 'https://example.com',
      doi: '10.1234/test.2024',
      categories: [Category.BIOMARKERS],
      tags: 'mecfs, biomarkers',
    };

    const result = manualPaperEntrySchema.parse(validEntry);
    expect(result).toBeDefined();
    expect(result.authors).toBe('John Doe, Jane Smith');
  });

  it('should accept empty optional strings', () => {
    const validEntry = {
      title: 'Test Research Paper',
      authors: 'John Doe',
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15',
      categories: [],
      url: '',
      doi: '',
    };

    const result = manualPaperEntrySchema.parse(validEntry);
    expect(result).toBeDefined();
  });
});

describe('validatePaper', () => {
  it('should successfully validate valid paper data', () => {
    const validData = {
      title: 'Test Research Paper on ME/CFS',
      authors: [{ name: 'John Doe' }],
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15T00:00:00.000Z',
      categories: [],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: false,
    };

    const result = validatePaper(validData);
    expect(result.title).toBe(validData.title);
  });

  it('should throw on invalid data', () => {
    expect(() => validatePaper({ title: 'Short' })).toThrow();
  });
});

describe('validateManualEntry', () => {
  it('should successfully validate valid manual entry', () => {
    const validData = {
      title: 'Test Research Paper',
      authors: 'John Doe',
      abstract:
        'This is a comprehensive abstract that meets the minimum length requirements.',
      publicationDate: '2024-01-15',
      categories: [],
    };

    const result = validateManualEntry(validData);
    expect(result.title).toBe(validData.title);
  });
});

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://test.org/path')).toBe(true);
    expect(isValidUrl('https://pubmed.ncbi.nlm.nih.gov/12345678/')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidDoi', () => {
  it('should return true for valid DOIs', () => {
    expect(isValidDoi('10.1234/test.2024')).toBe(true);
    expect(isValidDoi('10.1016/j.cell.2024.01.001')).toBe(true);
  });

  it('should return false for invalid DOIs', () => {
    expect(isValidDoi('invalid-doi')).toBe(false);
    expect(isValidDoi('10.123')).toBe(false);
    expect(isValidDoi('')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@test.org')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('parseAuthors', () => {
  it('should parse comma-separated author names', () => {
    const result = parseAuthors('John Doe, Jane Smith, Bob Johnson');
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('John Doe');
    expect(result[1].name).toBe('Jane Smith');
    expect(result[2].name).toBe('Bob Johnson');
  });

  it('should trim whitespace from author names', () => {
    const result = parseAuthors('  John Doe  ,  Jane Smith  ');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('John Doe');
    expect(result[1].name).toBe('Jane Smith');
  });

  it('should filter out empty names', () => {
    const result = parseAuthors('John Doe,,Jane Smith,');
    expect(result).toHaveLength(2);
  });

  it('should handle single author', () => {
    const result = parseAuthors('John Doe');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
  });

  it('should return empty array for empty string', () => {
    const result = parseAuthors('');
    expect(result).toHaveLength(0);
  });
});

describe('parseTags', () => {
  it('should parse comma-separated tags', () => {
    const result = parseTags('mecfs, biomarkers, chronic fatigue');
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('mecfs');
    expect(result[1]).toBe('biomarkers');
    expect(result[2]).toBe('chronic fatigue');
  });

  it('should trim whitespace from tags', () => {
    const result = parseTags('  mecfs  ,  biomarkers  ');
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('mecfs');
    expect(result[1]).toBe('biomarkers');
  });

  it('should filter out empty tags', () => {
    const result = parseTags('mecfs,,biomarkers,');
    expect(result).toHaveLength(2);
  });

  it('should return empty array for empty string', () => {
    expect(parseTags('')).toHaveLength(0);
    expect(parseTags('   ')).toHaveLength(0);
  });

  it('should handle undefined or null-like inputs', () => {
    expect(parseTags('')).toEqual([]);
  });
});

