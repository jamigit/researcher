/**
 * Type definitions for knowledge chunks and semantic search
 * @ai-context Phase 2+ enhancement for precise evidence extraction
 * 
 * IMPLEMENTATION STATUS: DOCUMENTATION ONLY - Not yet implemented
 * 
 * Purpose: Enable chunk-level evidence extraction and semantic search
 * Benefits:
 * - Precise citation (quote exact paragraphs, not full papers)
 * - Better search relevance (chunk-level embeddings)
 * - Improved contradiction detection (compare specific claims)
 * - Scalable to 1000+ papers (10K chunks manageable)
 * - UI can link to exact source text
 * 
 * See: docs/DATABASE_GUIDE.md Part 4 for full chunking strategy
 */

/**
 * Knowledge Chunk - Semantic unit of paper content
 * 
 * Each chunk represents 200-500 words from a paper, preserving
 * section context and enabling precise evidence extraction.
 * 
 * Chunking Strategy:
 * - Section-aware: Split by Abstract, Methods, Results, Discussion
 * - Target size: 300 words (range: 150-500)
 * - Never split mid-sentence
 * - Preserve paragraph boundaries
 * - Average: 8-10 chunks per paper
 * 
 * Storage:
 * - Database table: `chunks`
 * - Indexes: id, paperId, *topics, *relatedQuestionIds, chunkIndex
 * - Multi-entry indexes (*) enable array value queries
 * 
 * Example Query:
 * ```typescript
 * // Find all chunks mentioning "mitochondria"
 * const chunks = await db.chunks
 *   .where('topics')
 *   .equals('mitochondria')
 *   .toArray();
 * 
 * // Get all chunks for a paper, in order
 * const paperChunks = await db.chunks
 *   .where('paperId')
 *   .equals(paperId)
 *   .sortBy('chunkIndex');
 * ```
 */
export interface KnowledgeChunk {
  // Identity
  id: string; // UUID v4
  paperId: string; // Parent paper reference

  // Content
  content: string; // The actual text (200-500 words)
  chunkIndex: number; // Position in paper (0, 1, 2...)
  section: string; // Abstract, Introduction, Methods, Results, Discussion, Conclusion

  // Semantic metadata (extracted during processing)
  topics: string[]; // Extracted keywords/topics (e.g., ['mitochondria', 'ATP', 'oxidative stress'])
  keyFindings: string[]; // Important findings mentioned in this chunk
  methodologies: string[]; // Research methods described (e.g., ['RCT', 'blood test', 'questionnaire'])

  // Relationships
  relatedQuestionIds: string[]; // Research question IDs this chunk addresses
  relatedFindingIds: string[]; // Finding IDs extracted from this chunk
  citedPaperIds: string[]; // Papers cited within this chunk

  // Metadata
  dateCreated: string; // ISO 8601 timestamp
  processingVersion: string; // Track chunking algorithm version (e.g., '1.0')
}

/**
 * Embedding - Vector representation for semantic search
 * 
 * Stored separately from chunks for performance:
 * - Don't load vectors unless searching
 * - Can regenerate embeddings without touching chunks
 * - Enables model upgrades (keep chunks, regenerate embeddings)
 * 
 * Storage:
 * - Database table: `embeddings`
 * - Indexes: id, chunkId, model
 * - Vector stored as Float32Array (efficient)
 * 
 * Model: OpenAI text-embedding-3-small
 * - Dimensions: 1536
 * - Cost: $0.02 per 1M tokens (~$0.0002 per chunk)
 * - Quality: Excellent for research text
 * 
 * Memory Usage (1000 papers):
 * - 10,000 chunks × 1536 dims × 4 bytes = 60MB
 * - Acceptable for modern browsers
 * 
 * Search Performance:
 * - Load all embeddings into memory: ~500ms (one-time)
 * - Compute cosine similarity: ~50ms for 10K chunks
 * - Total search time: ~560ms first search, ~60ms subsequent
 * 
 * Example Usage:
 * ```typescript
 * // Generate embedding for chunk
 * const vector = await generateEmbedding(chunk.content);
 * await db.embeddings.add({
 *   id: uuid(),
 *   chunkId: chunk.id,
 *   model: 'text-embedding-3-small',
 *   dimensions: 1536,
 *   vector: new Float32Array(vector),
 *   dateCreated: new Date().toISOString()
 * });
 * 
 * // Semantic search
 * const queryVector = await generateEmbedding(userQuery);
 * const allEmbeddings = await db.embeddings.toArray();
 * const scored = allEmbeddings.map(emb => ({
 *   chunkId: emb.chunkId,
 *   score: cosineSimilarity(queryVector, emb.vector)
 * }));
 * const topMatches = scored.sort((a, b) => b.score - a.score).slice(0, 20);
 * ```
 */
export interface Embedding {
  // Identity
  id: string; // UUID v4
  chunkId: string; // Parent chunk reference

  // Vector data
  model: string; // 'text-embedding-3-small' or future models
  dimensions: number; // 1536 for text-embedding-3-small
  vector: Float32Array; // Compressed vector representation

  // Metadata
  dateCreated: string; // ISO 8601 timestamp
}

/**
 * Chunk metadata extracted during processing
 * Internal type used by ChunkProcessor tool
 */
export interface ChunkMetadata {
  topics: string[]; // Extracted topics/keywords
  keyFindings: string[]; // Findings mentioned
  methodologies: string[]; // Methods described
  citedPapers: string[]; // Papers referenced
}

/**
 * Chunk reference for linking findings to sources
 * Used in EvidenceSynthesis to show where evidence came from
 */
export interface ChunkReference {
  chunkId: string; // Chunk identifier
  paperId: string; // Parent paper
  section: string; // Which section (Results, Discussion, etc.)
  excerpt: string; // Relevant text snippet (50-100 words)
  relevanceScore?: number; // 0-1 how relevant to the finding
}

/**
 * Chunking configuration options
 */
export interface ChunkingOptions {
  targetSize: number; // Target words per chunk (default: 300)
  minSize: number; // Minimum words per chunk (default: 150)
  maxSize: number; // Maximum words per chunk (default: 500)
  preserveParagraphs: boolean; // Don't split mid-paragraph (default: true)
  sectionAware: boolean; // Split by sections (default: true)
}

/**
 * Search result with chunk context
 * Returned by hybrid search to show relevant chunks
 */
export interface ChunkSearchResult {
  chunk: KnowledgeChunk; // The matching chunk
  paper: {
    id: string;
    title: string;
    authors: string[];
    publicationDate: string;
  }; // Paper context
  relevanceScore: number; // 0-1 combined semantic + keyword score
  semanticScore: number; // 0-1 cosine similarity score
  keywordScore: number; // 0-1 keyword match score
  matchedTopics: string[]; // Topics that matched the query
  excerpt: string; // Highlighted excerpt with query terms
}

/**
 * Factory function to create a knowledge chunk
 * @param paperId - Parent paper ID
 * @param content - Chunk text content
 * @param chunkIndex - Position in paper
 * @param section - Section name
 * @returns New KnowledgeChunk instance with defaults
 */
export const createKnowledgeChunk = (
  paperId: string,
  content: string,
  chunkIndex: number,
  section: string
): KnowledgeChunk => {
  return {
    id: crypto.randomUUID(),
    paperId,
    content,
    chunkIndex,
    section,
    topics: [],
    keyFindings: [],
    methodologies: [],
    relatedQuestionIds: [],
    relatedFindingIds: [],
    citedPaperIds: [],
    dateCreated: new Date().toISOString(),
    processingVersion: '1.0',
  };
};

/**
 * Factory function to create an embedding
 * @param chunkId - Parent chunk ID
 * @param vector - Embedding vector
 * @param model - Model name
 * @returns New Embedding instance
 */
export const createEmbedding = (
  chunkId: string,
  vector: number[] | Float32Array,
  model: string = 'text-embedding-3-small'
): Embedding => {
  const vectorArray =
    vector instanceof Float32Array ? vector : new Float32Array(vector);

  return {
    id: crypto.randomUUID(),
    chunkId,
    model,
    dimensions: vectorArray.length,
    vector: vectorArray,
    dateCreated: new Date().toISOString(),
  };
};

/**
 * Type guard to check if a value is a valid KnowledgeChunk
 */
export const isKnowledgeChunk = (value: unknown): value is KnowledgeChunk => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as KnowledgeChunk).id === 'string' &&
    typeof (value as KnowledgeChunk).paperId === 'string' &&
    typeof (value as KnowledgeChunk).content === 'string' &&
    typeof (value as KnowledgeChunk).chunkIndex === 'number' &&
    Array.isArray((value as KnowledgeChunk).topics)
  );
};

/**
 * Type guard to check if a value is a valid Embedding
 */
export const isEmbedding = (value: unknown): value is Embedding => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Embedding).id === 'string' &&
    typeof (value as Embedding).chunkId === 'string' &&
    (value as Embedding).vector instanceof Float32Array
  );
};

/**
 * Default chunking options
 */
export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  targetSize: 300,
  minSize: 150,
  maxSize: 500,
  preserveParagraphs: true,
  sectionAware: true,
};

/**
 * Constants for semantic search
 */
export const SEMANTIC_SEARCH_CONFIG = {
  embeddingModel: 'text-embedding-3-small',
  dimensions: 1536,
  topK: 20, // Return top 20 results
  semanticWeight: 0.7, // 70% semantic, 30% keyword
  keywordWeight: 0.3,
  minRelevanceScore: 0.3, // Filter out low-relevance results
} as const;

