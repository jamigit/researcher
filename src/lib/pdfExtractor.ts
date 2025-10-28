/**
 * PDF Text Extraction Utilities
 * @ai-context Extract text and metadata from PDF files using pdf.js
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { ResearchPaper, Author } from '@/types/paper';
import { ReadStatus, Importance, Category, StudyType } from '@/types/paper';

// Configure PDF.js worker - using local file to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

/**
 * Extract text from PDF file using pdf.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    console.log('PDF loading task created');
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    const numPages = Math.min(pdf.numPages, 10); // Only extract first 10 pages for metadata
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`Extracting text from page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      // PDF.js TextItem and TextMarkedContent types
      interface TextItem {
        str: string;
      }
      interface TextMarkedContent {
        type: string;
      }
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          return 'str' in item ? item.str : '';
        })
        .join(' ');
      fullText += pageText + '\n';
      console.log(`Page ${pageNum} extracted, length: ${pageText.length}`);
    }
    
    console.log('Total text extracted, length:', fullText.length);
    return fullText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : '');
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract title from PDF text
 * Assumes title is at the beginning and before "Abstract"
 */
function extractTitle(text: string): string {
  // Try to find title (usually first few lines before abstract)
  const abstractIndex = text.search(/\babstract\b/i);
  const firstPart = abstractIndex > 0 ? text.substring(0, abstractIndex) : text.substring(0, 1000);
  
  // Remove common header artifacts
  const cleanedText = firstPart
    .replace(/^\s*\d+\s*$/gm, '') // Remove page numbers
    .replace(/^[A-Z\s]{10,}$/gm, '') // Remove all-caps headers
    .trim();
  
  // Split into lines and find potential titles
  const lines = cleanedText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 20 && line.length < 300);
  
  // Heuristics for title identification:
  // - Longer than 20 chars
  // - Shorter than 300 chars
  // - Contains multiple words (not just a header)
  // - Not all caps (usually)
  // - Has sentence-like structure
  
  for (const line of lines) {
    const wordCount = line.split(/\s+/).length;
    const isNotAllCaps = line !== line.toUpperCase();
    const hasProperCapitalization = /^[A-Z]/.test(line);
    
    if (wordCount >= 3 && isNotAllCaps && hasProperCapitalization) {
      // Clean up common artifacts
      const title = line
        .replace(/^\d+\s*/, '') // Remove leading numbers
        .replace(/^[A-Z\s]+:\s*/, '') // Remove "ARTICLE:", "RESEARCH:", etc.
        .trim();
      
      if (title.length > 20) {
        return title;
      }
    }
  }
  
  // Fallback: try to get the longest line in first part
  if (lines.length > 0) {
    const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b);
    if (longestLine.length > 20) {
      return longestLine;
    }
  }
  
  return 'Title not extracted - please edit';
}

/**
 * Extract abstract from PDF text
 */
function extractAbstract(text: string): string {
  // Look for abstract section
  const abstractMatch = text.match(/\babstract\b\s*[:-]?\s*(.{100,2000}?)(?=\b(?:introduction|keywords|background)\b)/is);
  
  if (abstractMatch) {
    return abstractMatch[1].trim();
  }
  
  // Fallback: take first substantial paragraph
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 100);
  if (paragraphs.length > 0) {
    return paragraphs[0].trim().substring(0, 1000);
  }
  
  return 'Abstract not found - please edit';
}

/**
 * Extract DOI from PDF text
 */
function extractDOI(text: string): string | undefined {
  const doiMatch = text.match(/\b(10\.\d{4,}\/[^\s]+)/);
  return doiMatch ? doiMatch[1] : undefined;
}

/**
 * Extract publication date from PDF text
 */
function extractPublicationDate(text: string): string {
  // Look for common date patterns
  const datePatterns = [
    /\b(20\d{2})\b/,  // Year only
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(20\d{2})/i,
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = match[1] || match[0];
      return `${year}-01-01`; // Return ISO date with year
    }
  }
  
  return new Date().toISOString();
}

/**
 * Extract authors from PDF text
 */
function extractAuthors(text: string): Author[] {
  // Author extraction is very unreliable from PDFs
  // Common false positives: copyright text, license info, etc.
  // Better to return empty and let user fill in manually
  
  // Blacklist of common false positive phrases
  const blacklist = [
    'open access',
    'creative commons',
    'the author',
    'all rights reserved',
    'published by',
    'corresponding author',
    'international license',
    'attribution',
    'noncommercial',
    'noderivatives',
  ];
  
  // Try to find author section (between title and abstract)
  const abstractIndex = text.search(/\babstract\b/i);
  const authorSection = abstractIndex > 0 ? text.substring(0, abstractIndex) : text.substring(0, 1000);
  
  // Look for patterns like "FirstName LastName" (capitalized words)
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const potentialAuthors = authorSection.match(namePattern) || [];
  
  // Filter out blacklisted terms
  const filteredAuthors = potentialAuthors
    .filter(name => {
      const lowerName = name.toLowerCase();
      return !blacklist.some(term => lowerName.includes(term));
    })
    .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
    .slice(0, 5); // Limit to 5 authors
  
  if (filteredAuthors.length > 0 && filteredAuthors.length <= 10) {
    return filteredAuthors.map(name => ({
      name: name.trim(),
      affiliation: 'Extracted from PDF - please verify',
    }));
  }
  
  // If extraction looks unreliable, return empty array
  // User should add authors manually
  return [];
}

/**
 * Infer study type from text
 */
function inferStudyType(text: string): StudyType {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('randomized') && lowerText.includes('control')) {
    return StudyType.CLINICAL_TRIAL;
  }
  if (lowerText.includes('systematic review') || lowerText.includes('meta-analysis')) {
    return StudyType.META_ANALYSIS;
  }
  if (lowerText.includes('review')) {
    return StudyType.REVIEW;
  }
  if (lowerText.includes('laboratory') || lowerText.includes('in vitro')) {
    return StudyType.LABORATORY;
  }
  if (lowerText.includes('cohort') || lowerText.includes('case-control') || lowerText.includes('cross-sectional')) {
    return StudyType.OBSERVATIONAL;
  }
  if (lowerText.includes('case report') || lowerText.includes('case series')) {
    return StudyType.CASE_STUDY;
  }
  
  return StudyType.OTHER;
}

/**
 * Extract metadata from PDF
 * Attempts to extract title, authors, abstract, DOI from PDF text
 */
export async function extractMetadataFromPDF(
  file: File
): Promise<Partial<ResearchPaper>> {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(file);
    
    console.log('Extracted text length:', text.length);
    
    // Parse metadata from text
    const title = extractTitle(text);
    const abstract = extractAbstract(text);
    const doi = extractDOI(text);
    const publicationDate = extractPublicationDate(text);
    const authors = extractAuthors(text);
    const studyType = inferStudyType(text);
    
    console.log('Extracted metadata:', {
      title: title.substring(0, 50),
      authorsCount: authors.length,
      authors: authors.map(a => ({ name: a.name, affiliation: a.affiliation })),
      doi,
      studyType
    });
    
    // Infer categories from content
    const categories: Category[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('biomarker') || lowerText.includes('diagnostic')) {
      categories.push(Category.BIOMARKERS);
    }
    if (lowerText.includes('treatment') || lowerText.includes('therapy')) {
      categories.push(Category.TREATMENT);
    }
    if (lowerText.includes('pathophysiology') || lowerText.includes('mechanism')) {
      categories.push(Category.PATHOPHYSIOLOGY);
    }
    if (lowerText.includes('immune') || lowerText.includes('cytokine')) {
      categories.push(Category.IMMUNOLOGY);
    }
    
    if (categories.length === 0) {
      categories.push(Category.OTHER);
    }
    
    return {
      title,
      authors,
      abstract,
      doi,
      publicationDate,
      studyType,
      categories,
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: true,
      pdfUrl: URL.createObjectURL(file),
    };
  } catch (error) {
    console.error('PDF metadata extraction error:', error);
    
    // Fallback to minimal metadata
    return {
      title: file.name.replace('.pdf', ''),
      authors: [],
      abstract: 'Could not extract text from PDF. Please edit manually.',
      publicationDate: new Date().toISOString(),
      studyType: StudyType.OTHER,
      categories: [Category.OTHER],
      tags: [],
      readStatus: ReadStatus.UNREAD,
      importance: Importance.MEDIUM,
      fullTextAvailable: true,
      pdfUrl: URL.createObjectURL(file),
    };
  }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): boolean {
  // Check file type
  if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
    console.error('Invalid file type:', file.type);
    return false;
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('File too large:', file.size);
    return false;
  }

  return true;
}

/**
 * Process PDF upload
 */
export async function processPDFUpload(
  file: File
): Promise<Partial<ResearchPaper> | null> {
  // Validate file
  if (!validatePDFFile(file)) {
    throw new Error('Invalid PDF file');
  }

  try {
    // Extract metadata
    const metadata = await extractMetadataFromPDF(file);

    // Try to extract full text (for future semantic search)
    const text = await extractTextFromPDF(file);
    
    // Store text if extracted successfully
    if (text && text.length > 100) {
      // Could store this in a separate field for full-text search
      console.log('Extracted text length:', text.length);
    }

    return metadata;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF file');
  }
}

