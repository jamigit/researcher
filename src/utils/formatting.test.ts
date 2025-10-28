/**
 * Tests for formatting utilities
 * @ai-context Unit tests for date, author, text, and number formatting
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatAuthors,
  truncateText,
  highlightSearchTerm,
  toSentenceCase,
  enumToLabel,
  formatCitationCount,
  extractDomain,
  getPubMedUrl,
  getDoiUrl,
  formatTags,
  getTagColor,
  formatFileSize,
} from './formatting';
import type { Author } from '@/types/paper';

describe('formatDate', () => {
  it('should format ISO date string to display format', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toBe('Jan 15, 2024');
  });

  it('should handle custom format string', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z', 'yyyy-MM-dd');
    expect(result).toBe('2024-01-15');
  });

  it('should return error message for invalid date', () => {
    const result = formatDate('invalid-date');
    expect(result).toBe('Invalid date');
  });
});

describe('formatDateTime', () => {
  it('should format ISO date with time', () => {
    const result = formatDateTime('2024-01-15T14:30:00.000Z');
    // Note: Date-fns formats in local timezone, so just check it contains time
    expect(result).toContain('2024');
    expect(result).toContain(':');
  });
});

describe('formatRelativeTime', () => {
  it('should format recent date as relative time', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(yesterday.toISOString());
    expect(result).toContain('ago');
  });

  it('should return error message for invalid date', () => {
    const result = formatRelativeTime('invalid-date');
    expect(result).toBe('Unknown time');
  });
});

describe('formatAuthors', () => {
  const authors: Author[] = [
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Bob Johnson' },
    { name: 'Alice Williams' },
  ];

  it('should format authors with default max (3)', () => {
    const result = formatAuthors(authors);
    expect(result).toBe('John Doe, Jane Smith, Bob Johnson, et al.');
  });

  it('should format all authors when below max', () => {
    const result = formatAuthors(authors.slice(0, 2));
    expect(result).toBe('John Doe, Jane Smith');
  });

  it('should respect custom maxAuthors parameter', () => {
    const result = formatAuthors(authors, 2);
    expect(result).toBe('John Doe, Jane Smith, et al.');
  });

  it('should handle single author', () => {
    const result = formatAuthors([{ name: 'John Doe' }]);
    expect(result).toBe('John Doe');
  });

  it('should handle empty author array', () => {
    const result = formatAuthors([]);
    expect(result).toBe('Unknown authors');
  });
});

describe('truncateText', () => {
  it('should truncate text longer than maxLength', () => {
    const text = 'This is a long piece of text that needs to be truncated';
    const result = truncateText(text, 20);
    expect(result).toBe('This is a long piece...');
    expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
  });

  it('should not truncate text shorter than maxLength', () => {
    const text = 'Short text';
    const result = truncateText(text, 20);
    expect(result).toBe('Short text');
  });

  it('should trim whitespace before adding ellipsis', () => {
    const text = 'This is text with spaces';
    const result = truncateText(text, 12);
    expect(result).toBe('This is text...');
  });
});

describe('highlightSearchTerm', () => {
  it('should wrap search term with mark tags', () => {
    const result = highlightSearchTerm('Testing search functionality', 'search');
    expect(result).toBe('Testing <mark>search</mark> functionality');
  });

  it('should be case insensitive', () => {
    const result = highlightSearchTerm('Testing SEARCH functionality', 'search');
    expect(result).toContain('<mark>SEARCH</mark>');
  });

  it('should handle multiple occurrences', () => {
    const result = highlightSearchTerm('test test test', 'test');
    const matches = result.match(/<mark>test<\/mark>/gi);
    expect(matches).toHaveLength(3);
  });

  it('should return original text when search term is empty', () => {
    const result = highlightSearchTerm('Testing text', '');
    expect(result).toBe('Testing text');
  });
});

describe('toSentenceCase', () => {
  it('should convert to sentence case', () => {
    expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
    expect(toSentenceCase('hello world')).toBe('Hello world');
    expect(toSentenceCase('HeLLo WoRLd')).toBe('Hello world');
  });

  it('should handle single character', () => {
    expect(toSentenceCase('a')).toBe('A');
  });

  it('should handle empty string', () => {
    expect(toSentenceCase('')).toBe('');
  });
});

describe('enumToLabel', () => {
  it('should convert enum value to readable label', () => {
    expect(enumToLabel('CLINICAL_TRIAL')).toBe('Clinical Trial');
    expect(enumToLabel('RESEARCH_PAPER')).toBe('Research Paper');
    expect(enumToLabel('SINGLE_WORD')).toBe('Single Word');
  });

  it('should handle single word', () => {
    expect(enumToLabel('BIOMARKERS')).toBe('Biomarkers');
  });
});

describe('formatCitationCount', () => {
  it('should format large numbers with abbreviations', () => {
    expect(formatCitationCount(1500000)).toBe('1.5M');
    expect(formatCitationCount(1500)).toBe('1.5K');
    expect(formatCitationCount(500)).toBe('500');
  });

  it('should handle exact thousands and millions', () => {
    expect(formatCitationCount(1000)).toBe('1.0K');
    expect(formatCitationCount(1000000)).toBe('1.0M');
  });

  it('should handle zero', () => {
    expect(formatCitationCount(0)).toBe('0');
  });
});

describe('extractDomain', () => {
  it('should extract domain from URL', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('example.com');
    expect(extractDomain('https://test.org/article')).toBe('test.org');
    expect(extractDomain('http://www.pubmed.ncbi.nlm.nih.gov/')).toBe(
      'pubmed.ncbi.nlm.nih.gov'
    );
  });

  it('should handle invalid URL', () => {
    expect(extractDomain('not-a-url')).toBe('Invalid URL');
  });
});

describe('getPubMedUrl', () => {
  it('should generate PubMed URL from ID', () => {
    expect(getPubMedUrl('12345678')).toBe(
      'https://pubmed.ncbi.nlm.nih.gov/12345678/'
    );
  });
});

describe('getDoiUrl', () => {
  it('should generate DOI URL', () => {
    expect(getDoiUrl('10.1234/test.2024')).toBe(
      'https://doi.org/10.1234/test.2024'
    );
  });
});

describe('formatTags', () => {
  it('should format tags as comma-separated string', () => {
    expect(formatTags(['mecfs', 'biomarkers', 'research'])).toBe(
      'mecfs, biomarkers, research'
    );
  });

  it('should handle single tag', () => {
    expect(formatTags(['mecfs'])).toBe('mecfs');
  });

  it('should handle empty array', () => {
    expect(formatTags([])).toBe('No tags');
  });
});

describe('getTagColor', () => {
  it('should return consistent color for same tag', () => {
    const color1 = getTagColor('mecfs');
    const color2 = getTagColor('mecfs');
    expect(color1).toBe(color2);
  });

  it('should return valid Tailwind color classes', () => {
    const color = getTagColor('test');
    expect(color).toMatch(/bg-\w+-\d+ text-\w+-\d+/);
  });

  it('should distribute different tags across colors', () => {
    const colors = new Set([
      getTagColor('tag1'),
      getTagColor('tag2'),
      getTagColor('tag3'),
      getTagColor('tag4'),
      getTagColor('tag5'),
    ]);
    // Should have at least 2 different colors for 5 different tags
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('formatFileSize', () => {
  it('should format bytes to human-readable size', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should handle fractional sizes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('should handle small byte counts', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });
});

