/**
 * Validation utilities using Zod
 * @ai-context Type-safe validation for paper data and form inputs
 */

import { z } from 'zod';
import { StudyType, Category, ReadStatus, Importance } from '@/types/paper';
import { VALIDATION, REGEX, ERROR_MESSAGES } from './constants';

/**
 * Author validation schema
 */
const authorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  affiliation: z.string().optional(),
  email: z.string().email().optional(),
});

/**
 * Complete paper validation schema
 * Used for validating paper creation and updates
 */
export const paperSchema = z.object({
  // Identifiers (optional for new papers)
  id: z.string().uuid().optional(),
  pubmedId: z.string().regex(REGEX.PUBMED_ID, 'Invalid PubMed ID').optional(),
  doi: z.string().regex(REGEX.DOI, ERROR_MESSAGES.INVALID_DOI).optional(),

  // Core metadata (required)
  title: z
    .string()
    .min(VALIDATION.MIN_TITLE_LENGTH, ERROR_MESSAGES.TITLE_TOO_SHORT)
    .max(VALIDATION.MAX_TITLE_LENGTH, ERROR_MESSAGES.TITLE_TOO_LONG),
  authors: z.array(authorSchema).min(1, 'At least one author is required'),
  abstract: z
    .string()
    .min(VALIDATION.MIN_ABSTRACT_LENGTH, ERROR_MESSAGES.ABSTRACT_TOO_SHORT)
    .max(VALIDATION.MAX_ABSTRACT_LENGTH, ERROR_MESSAGES.ABSTRACT_TOO_LONG),
  publicationDate: z.string().datetime('Invalid date format (ISO 8601 required)'),
  journal: z.string().optional(),
  url: z.string().url(ERROR_MESSAGES.INVALID_URL).optional(),

  // Classification
  studyType: z.nativeEnum(StudyType).optional(),
  categories: z
    .array(z.nativeEnum(Category))
    .max(VALIDATION.MAX_CATEGORIES_COUNT, `Maximum ${VALIDATION.MAX_CATEGORIES_COUNT} categories`),
  tags: z
    .array(z.string().max(VALIDATION.MAX_TAG_LENGTH))
    .max(VALIDATION.MAX_TAGS_COUNT, `Maximum ${VALIDATION.MAX_TAGS_COUNT} tags`),

  // Status tracking
  readStatus: z.nativeEnum(ReadStatus),
  importance: z.nativeEnum(Importance),
  dateAdded: z.string().datetime().optional(),
  dateModified: z.string().datetime().optional(),

  // Personal notes
  personalNotes: z
    .string()
    .max(
      VALIDATION.MAX_PERSONAL_NOTES_LENGTH,
      `Notes must be less than ${VALIDATION.MAX_PERSONAL_NOTES_LENGTH} characters`
    )
    .optional(),

  // Additional metadata
  citationCount: z.number().int().nonnegative().optional(),
  fullTextAvailable: z.boolean(),
  pdfUrl: z.string().url().optional(),
});

/**
 * Schema for manual paper entry form
 * Relaxed validation for initial entry
 */
export const manualPaperEntrySchema = z.object({
  title: z
    .string()
    .min(VALIDATION.MIN_TITLE_LENGTH, ERROR_MESSAGES.TITLE_TOO_SHORT)
    .max(VALIDATION.MAX_TITLE_LENGTH, ERROR_MESSAGES.TITLE_TOO_LONG),
  authors: z.string().min(1, 'At least one author is required'), // Comma-separated string
  abstract: z
    .string()
    .min(VALIDATION.MIN_ABSTRACT_LENGTH, ERROR_MESSAGES.ABSTRACT_TOO_SHORT)
    .max(VALIDATION.MAX_ABSTRACT_LENGTH, ERROR_MESSAGES.ABSTRACT_TOO_LONG),
  publicationDate: z.string().min(1, 'Publication date is required'),
  journal: z.string().optional(),
  url: z.string().url(ERROR_MESSAGES.INVALID_URL).optional().or(z.literal('')),
  doi: z.string().regex(REGEX.DOI, ERROR_MESSAGES.INVALID_DOI).optional().or(z.literal('')),
  studyType: z.nativeEnum(StudyType).optional(),
  categories: z.array(z.nativeEnum(Category)),
  tags: z.string().optional(), // Comma-separated string
});

/**
 * Type inference from schemas
 */
export type PaperValidation = z.infer<typeof paperSchema>;
export type ManualPaperEntry = z.infer<typeof manualPaperEntrySchema>;

/**
 * Validate paper data
 */
export const validatePaper = (data: unknown): PaperValidation => {
  return paperSchema.parse(data);
};

/**
 * Validate manual paper entry form
 */
export const validateManualEntry = (data: unknown): ManualPaperEntry => {
  return manualPaperEntrySchema.parse(data);
};

/**
 * Check if a URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  return REGEX.URL.test(url);
};

/**
 * Check if a DOI is valid
 */
export const isValidDoi = (doi: string): boolean => {
  return REGEX.DOI.test(doi);
};

/**
 * Check if an email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return REGEX.EMAIL.test(email);
};

/**
 * Parse comma-separated author string into Author array
 */
export const parseAuthors = (authorsString: string): Array<{ name: string }> => {
  return authorsString
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ name }));
};

/**
 * Parse comma-separated tags string into array
 */
export const parseTags = (tagsString: string): string[] => {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

/**
 * Check for duplicate paper by DOI or PubMed ID
 * @ai-technical-debt(low, low, medium) Implement actual duplicate checking against database
 */
export const checkForDuplicate = async (
  _doi?: string,
  _pubmedId?: string,
  _title?: string
): Promise<boolean> => {
  // This would check the database for duplicates
  // Implementation depends on the database service
  // For now, return false (no duplicate)
  return false;
};

