/**
 * Enhanced search service with cross-collection search, filters, and operators
 * @ai-context Semantic search across papers, questions, and findings
 */

import { db } from './db';
import type { ResearchPaper } from '@/types/paper';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type {
  SearchQuery,
  SearchResult,
  SearchResults,
  SearchScope,
  SearchFilters,
} from '@/types/search';

/**
 * Main search function - searches across papers and/or questions
 */
export const search = async (query: SearchQuery): Promise<SearchResults> => {
  const startTime = performance.now();
  
  const results: SearchResult[] = [];

  // Search papers
  if (query.scope === SearchScope.PAPERS || query.scope === SearchScope.ALL) {
    const paperResults = await searchPapers(query.text, query.filters);
    results.push(...paperResults);
  }

  // Search questions
  if (query.scope === SearchScope.QUESTIONS || query.scope === SearchScope.ALL) {
    const questionResults = await searchQuestions(query.text, query.filters);
    results.push(...questionResults);
  }

  // Sort by relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const executionTime = performance.now() - startTime;

  return {
    query,
    results,
    totalCount: results.length,
    executionTime,
  };
};

/**
 * Search within papers collection
 */
const searchPapers = async (
  searchText: string,
  filters?: SearchFilters
): Promise<SearchResult[]> => {
  let papers = await db.papers.toArray();

  // Apply filters
  if (filters) {
    papers = applyPaperFilters(papers, filters);
  }

  // Search and score
  const results: SearchResult[] = [];
  const terms = tokenize(searchText);

  for (const paper of papers) {
    const score = calculatePaperRelevance(paper, terms);
    
    if (score > 0) {
      const matchedFields = getMatchedFields(paper, terms);
      const snippet = generateSnippet(paper.abstract, terms);

      results.push({
        type: 'paper',
        id: paper.id,
        title: paper.title,
        snippet,
        relevanceScore: score,
        matchedFields,
        metadata: {
          authors: paper.authors.map((a) => a.name).join(', '),
          journal: paper.journal,
          date: paper.publicationDate,
          studyType: paper.studyType,
        },
      });
    }
  }

  return results;
};

/**
 * Search within questions and findings
 */
const searchQuestions = async (
  searchText: string,
  filters?: SearchFilters
): Promise<SearchResult[]> => {
  let questions = await db.questions.toArray();

  // Apply filters
  if (filters) {
    questions = applyQuestionFilters(questions, filters);
  }

  const results: SearchResult[] = [];
  const terms = tokenize(searchText);

  for (const question of questions) {
    const score = calculateQuestionRelevance(question, terms);
    
    if (score > 0) {
      const matchedFields = ['question'];
      const snippet = generateSnippet(question.question, terms);

      results.push({
        type: 'question',
        id: question.id,
        title: question.question,
        snippet,
        relevanceScore: score,
        matchedFields,
        metadata: {
          status: question.status,
          confidence: question.confidence,
          findingsCount: question.findings.length,
          paperCount: question.paperCount,
        },
      });
    }

    // Also search findings
    const findings = await db.findings.where('questionId').equals(question.id).toArray();
    
    for (const finding of findings) {
      const findingScore = calculateFindingRelevance(finding, terms);
      
      if (findingScore > 0) {
        results.push({
          type: 'finding',
          id: finding.id,
          title: `Finding in: ${question.question}`,
          snippet: generateSnippet(finding.description, terms),
          relevanceScore: findingScore,
          matchedFields: ['description'],
          metadata: {
            questionId: question.id,
            consistency: finding.consistency,
            paperCount: finding.supportingPapers.length,
          },
        });
      }
    }
  }

  return results;
};

/**
 * Apply paper-specific filters
 */
const applyPaperFilters = (
  papers: ResearchPaper[],
  filters: SearchFilters
): ResearchPaper[] => {
  return papers.filter((paper) => {
    // Date range
    if (filters.dateFrom && paper.publicationDate < filters.dateFrom) return false;
    if (filters.dateTo && paper.publicationDate > filters.dateTo) return false;

    // Study type
    if (filters.studyTypes && filters.studyTypes.length > 0) {
      if (!paper.studyType || !filters.studyTypes.includes(paper.studyType)) return false;
    }

    // Categories
    if (filters.categories && filters.categories.length > 0) {
      const hasCategory = paper.categories.some((cat) => filters.categories!.includes(cat));
      if (!hasCategory) return false;
    }

    // Tags
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = paper.tags.some((tag) => filters.tags!.includes(tag));
      if (!hasTag) return false;
    }

    // Importance
    if (filters.importance && filters.importance.length > 0) {
      if (!filters.importance.includes(paper.importance)) return false;
    }

    // Read status
    if (filters.readStatus && filters.readStatus.length > 0) {
      if (!filters.readStatus.includes(paper.readStatus)) return false;
    }

    // Peer reviewed only
    if (filters.peerReviewedOnly) {
      // Heuristic: if URL contains "preprint", it's not peer-reviewed
      if (paper.url?.toLowerCase().includes('preprint')) return false;
    }

    return true;
  });
};

/**
 * Apply question-specific filters
 */
const applyQuestionFilters = (
  questions: ResearchQuestion[],
  filters: SearchFilters
): ResearchQuestion[] => {
  return questions.filter((question) => {
    // Status
    if (filters.questionStatus && filters.questionStatus.length > 0) {
      if (!filters.questionStatus.includes(question.status)) return false;
    }

    // Confidence range
    if (filters.minConfidence !== undefined && question.confidence < filters.minConfidence) {
      return false;
    }
    if (filters.maxConfidence !== undefined && question.confidence > filters.maxConfidence) {
      return false;
    }

    return true;
  });
};

/**
 * Tokenize search text into terms
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2); // Ignore very short terms
};

/**
 * Calculate relevance score for a paper
 */
const calculatePaperRelevance = (paper: ResearchPaper, terms: string[]): number => {
  let score = 0;

  const titleLower = paper.title.toLowerCase();
  const abstractLower = paper.abstract.toLowerCase();
  const authorsText = paper.authors.map((a) => a.name).join(' ').toLowerCase();

  for (const term of terms) {
    // Title matches (highest weight)
    if (titleLower.includes(term)) score += 5;

    // Abstract matches
    const abstractMatches = (abstractLower.match(new RegExp(term, 'g')) || []).length;
    score += abstractMatches * 1;

    // Author matches
    if (authorsText.includes(term)) score += 2;

    // Tags/categories
    if (paper.tags.some((tag) => tag.toLowerCase().includes(term))) score += 3;
    if (paper.categories.some((cat) => cat.toLowerCase().includes(term))) score += 3;
  }

  // Normalize to 0-1 range (rough approximation)
  return Math.min(score / (terms.length * 10), 1);
};

/**
 * Calculate relevance score for a question
 */
const calculateQuestionRelevance = (question: ResearchQuestion, terms: string[]): number => {
  let score = 0;
  const questionLower = question.question.toLowerCase();

  for (const term of terms) {
    if (questionLower.includes(term)) score += 5;
  }

  return Math.min(score / (terms.length * 10), 1);
};

/**
 * Calculate relevance score for a finding
 */
const calculateFindingRelevance = (finding: Finding, terms: string[]): number => {
  let score = 0;
  const descriptionLower = finding.description.toLowerCase();

  for (const term of terms) {
    const matches = (descriptionLower.match(new RegExp(term, 'g')) || []).length;
    score += matches * 2;
  }

  return Math.min(score / (terms.length * 10), 1);
};

/**
 * Get which fields matched the search
 */
const getMatchedFields = (paper: ResearchPaper, terms: string[]): string[] => {
  const matched: string[] = [];

  const titleLower = paper.title.toLowerCase();
  const abstractLower = paper.abstract.toLowerCase();

  for (const term of terms) {
    if (titleLower.includes(term) && !matched.includes('title')) {
      matched.push('title');
    }
    if (abstractLower.includes(term) && !matched.includes('abstract')) {
      matched.push('abstract');
    }
  }

  return matched;
};

/**
 * Generate snippet with highlighted search terms
 */
const generateSnippet = (text: string, terms: string[], maxLength = 150): string => {
  const textLower = text.toLowerCase();
  
  // Find first occurrence of any term
  let firstIndex = -1;
  for (const term of terms) {
    const index = textLower.indexOf(term);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  if (firstIndex === -1) {
    // No match found, return start of text
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Extract snippet around match
  const start = Math.max(0, firstIndex - 50);
  const end = Math.min(text.length, firstIndex + maxLength - 50);
  
  let snippet = text.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
};

/**
 * Get recent searches from history
 */
export const getRecentSearches = async (): Promise<string[]> => {
  // For now, return empty array
  // TODO: Implement search history tracking
  return [];
};

/**
 * Save search query for later use
 */
export const saveSearch = async (name: string, query: SearchQuery): Promise<void> => {
  // TODO: Implement saved searches
  console.log('Saving search:', name, query);
};

