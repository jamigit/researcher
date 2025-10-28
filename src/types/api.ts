/**
 * API request and response type definitions
 * @ai-context Types for external API integrations (PubMed, Claude)
 */

/**
 * PubMed API search parameters
 */
export interface PubMedSearchParams {
  term: string;
  retmax?: number; // Maximum number of results (default: 20)
  retstart?: number; // Starting index for pagination (default: 0)
  sort?: 'relevance' | 'pub_date' | 'Author'; // Sort order
  mindate?: string; // Format: YYYY/MM/DD
  maxdate?: string; // Format: YYYY/MM/DD
}

/**
 * PubMed article author
 */
export interface PubMedAuthor {
  name: string;
  affiliation?: string;
}

/**
 * PubMed article metadata
 */
export interface PubMedArticle {
  pubmedId: string;
  title: string;
  abstract: string;
  authors: PubMedAuthor[];
  publicationDate: string;
  journal: string;
  doi?: string;
  url: string;
}

/**
 * PubMed API search response
 */
export interface PubMedSearchResponse {
  count: number;
  articles: PubMedArticle[];
}

/**
 * Claude API message role
 */
export type ClaudeRole = 'user' | 'assistant';

/**
 * Claude API message
 */
export interface ClaudeMessage {
  role: ClaudeRole;
  content: string;
}

/**
 * Claude API request parameters for paper summarization
 */
export interface ClaudeSummarizationRequest {
  title: string;
  abstract: string;
  authors?: string[];
  publicationDate?: string;
  journal?: string;
}

/**
 * Claude API response structure
 */
export interface ClaudeApiResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Generic API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * API request status
 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

