/**
 * Formatting and display utilities
 * @ai-context Helper functions for consistent data formatting across the UI
 */

import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { DATE_FORMATS } from './constants';
import type { Author } from '@/types/paper';

/**
 * Date Formatting
 */

/**
 * Format ISO date string for display
 * @param isoDate - ISO 8601 date string
 * @param formatString - Optional custom format (defaults to standard display format)
 */
export const formatDate = (isoDate: string, formatString?: string): string => {
  try {
    const date = parseISO(isoDate);
    return format(date, formatString || DATE_FORMATS.DISPLAY);
  } catch (error) {
    console.error('Invalid date format:', isoDate);
    return 'Invalid date';
  }
};

/**
 * Format date with time for display
 */
export const formatDateTime = (isoDate: string): string => {
  return formatDate(isoDate, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (isoDate: string): string => {
  try {
    const date = parseISO(isoDate);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Invalid date format:', isoDate);
    return 'Unknown time';
  }
};

/**
 * Author Formatting
 */

/**
 * Format author array as a comma-separated string
 * @param authors - Array of authors
 * @param maxAuthors - Maximum number of authors to display before "et al."
 */
export const formatAuthors = (authors: Author[], maxAuthors = 3): string => {
  if (authors.length === 0) {
    return 'Unknown authors';
  }

  const authorNames = authors.map((author) => author.name);

  if (authorNames.length <= maxAuthors) {
    return authorNames.join(', ');
  }

  const displayedAuthors = authorNames.slice(0, maxAuthors);
  return `${displayedAuthors.join(', ')}, et al.`;
};

/**
 * Text Formatting
 */

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Highlight search term in text (for search results)
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Convert string to sentence case
 */
export const toSentenceCase = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert enum value to display label
 */
export const enumToLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Number Formatting
 */

/**
 * Format citation count with abbreviation for large numbers
 */
export const formatCitationCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * URL Formatting
 */

/**
 * Extract domain from URL for display
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return 'Invalid URL';
  }
};

/**
 * Generate PubMed URL from ID
 */
export const getPubMedUrl = (pubmedId: string): string => {
  return `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`;
};

/**
 * Generate DOI URL
 */
export const getDoiUrl = (doi: string): string => {
  return `https://doi.org/${doi}`;
};

/**
 * Tag Formatting
 */

/**
 * Format tags array as comma-separated string
 */
export const formatTags = (tags: string[]): string => {
  if (tags.length === 0) {
    return 'No tags';
  }
  return tags.join(', ');
};

/**
 * Color generation for tags (consistent hashing)
 */
export const getTagColor = (tag: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ];

  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * File Size Formatting
 */

/**
 * Format bytes to human-readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

