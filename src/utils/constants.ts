/**
 * Application-wide constants and configuration values
 * @ai-context Central location for all configurable values
 */

import { StudyType, Category, Importance, ReadStatus } from '@/types/paper';

/**
 * API Configuration
 */
export const API_CONFIG = {
  PUBMED_BASE_URL: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
  PUBMED_RATE_LIMIT: 3, // requests per second without API key
  PUBMED_RATE_LIMIT_WITH_KEY: 10, // requests per second with API key
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
  CLAUDE_MAX_TOKENS: 4096,
} as const;

/**
 * Default values for paper creation
 */
export const PAPER_DEFAULTS = {
  READ_STATUS: ReadStatus.UNREAD,
  IMPORTANCE: Importance.MEDIUM,
  CATEGORIES: [] as Category[],
  TAGS: [] as string[],
  FULL_TEXT_AVAILABLE: false,
} as const;

/**
 * Study type options for dropdowns
 */
export const STUDY_TYPES = [
  { value: StudyType.CLINICAL_TRIAL, label: 'Clinical Trial' },
  { value: StudyType.OBSERVATIONAL, label: 'Observational Study' },
  { value: StudyType.REVIEW, label: 'Review' },
  { value: StudyType.META_ANALYSIS, label: 'Meta-Analysis' },
  { value: StudyType.CASE_STUDY, label: 'Case Study' },
  { value: StudyType.LABORATORY, label: 'Laboratory Study' },
  { value: StudyType.OTHER, label: 'Other' },
] as const;

/**
 * Category options for classification
 */
export const CATEGORIES = [
  { value: Category.PATHOPHYSIOLOGY, label: 'Pathophysiology' },
  { value: Category.TREATMENT, label: 'Treatment' },
  { value: Category.DIAGNOSIS, label: 'Diagnosis' },
  { value: Category.EPIDEMIOLOGY, label: 'Epidemiology' },
  { value: Category.BIOMARKERS, label: 'Biomarkers' },
  { value: Category.QUALITY_OF_LIFE, label: 'Quality of Life' },
  { value: Category.GENETICS, label: 'Genetics' },
  { value: Category.IMMUNOLOGY, label: 'Immunology' },
  { value: Category.NEUROLOGY, label: 'Neurology' },
  { value: Category.OTHER, label: 'Other' },
] as const;

/**
 * Read status options
 */
export const READ_STATUSES = [
  { value: ReadStatus.UNREAD, label: 'Unread', color: 'bg-gray-500' },
  { value: ReadStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
  { value: ReadStatus.READ, label: 'Read', color: 'bg-green-500' },
  { value: ReadStatus.SKIPPED, label: 'Skipped', color: 'bg-orange-500' },
] as const;

/**
 * Importance level options
 */
export const IMPORTANCE_LEVELS = [
  { value: Importance.LOW, label: 'Low', color: 'text-gray-600' },
  { value: Importance.MEDIUM, label: 'Medium', color: 'text-blue-600' },
  { value: Importance.HIGH, label: 'High', color: 'text-orange-600' },
  { value: Importance.CRITICAL, label: 'Critical', color: 'text-red-600' },
] as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 500,
  MIN_ABSTRACT_LENGTH: 50,
  MAX_ABSTRACT_LENGTH: 10000,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS_COUNT: 20,
  MAX_CATEGORIES_COUNT: 5,
  MAX_PERSONAL_NOTES_LENGTH: 50000,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  PAPERS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 5000,
  MAX_RECENT_PAPERS: 5,
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  VIEW_MODE: 'viewMode',
  SORT_PREFERENCE: 'sortPreference',
} as const;

/**
 * Date format strings (for date-fns)
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  FULL: 'MMMM d, yyyy',
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX = {
  URL: /^https?:\/\/.+/i,
  DOI: /^10\.\d{4,}\/\S+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PUBMED_ID: /^\d+$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DOI: 'Please enter a valid DOI',
  INVALID_EMAIL: 'Please enter a valid email address',
  TITLE_TOO_SHORT: `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} characters`,
  TITLE_TOO_LONG: `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`,
  ABSTRACT_TOO_SHORT: `Abstract must be at least ${VALIDATION.MIN_ABSTRACT_LENGTH} characters`,
  ABSTRACT_TOO_LONG: `Abstract must be less than ${VALIDATION.MAX_ABSTRACT_LENGTH} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'An error occurred while communicating with the server',
  DATABASE_ERROR: 'An error occurred while accessing the database',
  DUPLICATE_PAPER: 'This paper already exists in your collection',
} as const;

/**
 * App metadata
 */
export const APP_INFO = {
  NAME: 'ME/CFS Research Tracker',
  SHORT_NAME: 'Research Tracker',
  VERSION: '0.1.0',
  DESCRIPTION: 'Track and analyze ME/CFS research papers with AI assistance',
  GITHUB_URL: 'https://github.com/yourusername/mecfs-research-tracker',
  AUTHOR: 'Your Name',
} as const;

