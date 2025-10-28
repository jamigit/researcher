# Database Architecture & Design Guide

**Document Type**: Technical Architecture Documentation  
**Version**: 1.0  
**Date**: October 28, 2025  
**Status**: Database Enhancement Planning  
**Related**: `IMPLEMENTATION_PLAN.md`, `PRD.md`

---

## Executive Summary

This guide documents the ME/CFS Research System database architecture, including current implementation (v1-v2) and planned enhancements (v3) to support knowledge chunking, semantic search, and scale to 1000+ papers.

**Key Capabilities**:
- Offline-first local storage with IndexedDB
- Versioned schema migrations
- Knowledge chunking for precise evidence extraction
- Hybrid keyword + semantic search
- Soft delete with relationship preservation
- Optimized for 1000+ papers with sub-500ms query times

---

## Part 1: Architecture Overview

### 1.1 Storage Technology

**Primary Storage**: IndexedDB via Dexie.js

**Rationale**:
- Offline-first: Works without network connection
- Large capacity: 100MB+ storage (sufficient for 1000 papers)
- Performance: Fast indexed queries
- Mature ecosystem: Dexie provides excellent abstraction
- Browser-native: No external dependencies

**Constraints**:
- Single-user only (no multi-device sync in v1)
- Browser storage (cleared if user clears data)
- No built-in backup (must implement export/import)

### 1.2 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   React Components                       │
│                  (UI + Presentation)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Service Layer                           │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ db.ts        │ chunks.ts    │ embeddings.ts │        │
│  │ (Core CRUD)  │ (Chunking)   │ (Search)      │        │
│  └──────────────┴──────────────┴──────────────┘        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Dexie.js Layer                          │
│              (IndexedDB Abstraction)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  IndexedDB (Browser)                     │
│           • papers   • questions  • chunks               │
│           • notes    • findings   • embeddings           │
│           • searches • contradictions                    │
└─────────────────────────────────────────────────────────┘
```

**Key Principles**:
1. **Single Responsibility**: Each service handles one domain
2. **Direct Access**: Components can query database directly via Dexie hooks
3. **No State Duplication**: Database is source of truth, no Redux/Zustand for server data
4. **Reactive Queries**: `useLiveQuery()` hook provides automatic updates

---

## Part 2: Schema Design

### 2.1 Current Schema (v1-v2)

**Version 1 Tables** (Week 1-2):
- `papers` - Research papers with metadata and AI summaries
- `notes` - User notes attached to papers
- `searches` - Saved search queries

**Version 2 Tables** (Week 3-4):
- `questions` - Research questions tracking
- `findings` - Evidence extracted from papers
- `contradictions` - Detected conflicts in evidence

### 2.2 Planned Schema v3 Enhancements

**New Tables**:

**`chunks` - Knowledge Chunks**
```typescript
interface KnowledgeChunk {
  // Identity
  id: string;                    // UUID
  paperId: string;               // Parent paper
  
  // Content
  content: string;               // Text chunk (200-500 words)
  chunkIndex: number;            // Position in paper (0, 1, 2...)
  section: string;               // Abstract, Methods, Results, etc.
  
  // Semantic metadata
  topics: string[];              // Extracted topics
  keyFindings: string[];         // Findings mentioned
  methodologies: string[];       // Methods described
  
  // Relationships
  relatedQuestionIds: string[];  // Questions this chunk addresses
  relatedFindingIds: string[];   // Findings from this chunk
  citedPaperIds: string[];       // Papers cited here
  
  // Metadata
  dateCreated: string;
  processingVersion: string;     // For regeneration tracking
}
```

**`embeddings` - Vector Embeddings**
```typescript
interface Embedding {
  id: string;                    // UUID
  chunkId: string;               // Parent chunk
  model: string;                 // 'text-embedding-3-small'
  dimensions: number;            // 1536
  vector: Float32Array;          // Compressed vector
  dateCreated: string;
}
```

**Rationale for Separation**:
- Embeddings stored separately for performance
- Can regenerate embeddings without touching chunks
- Enables model upgrades (keep chunks, regenerate embeddings)
- Better query performance (don't load vectors unless needed)

### 2.3 Soft Delete Enhancement

**Added to Existing Tables**:
```typescript
interface SoftDeletable {
  isArchived: boolean;           // Default: false
  archivedAt?: string;           // ISO 8601 timestamp
  archiveReason?: string;        // User-provided reason
}
```

**Applied to**: `papers`, `questions`, `findings`, `notes`

**Rationale**:
- Reversible deletions (undo mistakes)
- Preserve relationships (don't orphan findings)
- Audit trail (know what was deleted when)
- User-friendly (can restore accidentally deleted items)

**Query Pattern**:
```typescript
// All queries filter archived by default
db.papers.where('isArchived').equals(0).toArray()

// Explicit include
db.papers.toArray() // includes archived
```

### 2.4 Relationship Tracking Enhancement

**Added to ResearchPaper**:
```typescript
interface ResearchPaper {
  // ... existing fields ...
  
  // Phase 2+ relationships
  relatedQuestions?: string[];    // Question IDs this paper addresses
  relatedFindings?: string[];     // Finding IDs this paper supports
  relatedMechanisms?: string[];   // Mechanism IDs this paper explains
}
```

**Added to Finding**:
```typescript
interface Finding {
  // ... existing fields ...
  
  supportingPapersMissing: number; // Count of deleted/archived papers
}
```

**Rationale**:
- Bidirectional navigation (paper → questions, question → papers)
- Track impact of deletions
- Enable "show all papers for this question" queries
- Support "papers without questions" cleanup

---

## Part 3: Index Strategy

### 3.1 Indexing Principles

**Index if**:
- Field used in WHERE clauses (filtering)
- Field used for sorting large result sets
- Field is multi-value array (multi-entry index needed)

**Don't index if**:
- Field rarely queried
- Field has low cardinality (boolean with mostly one value)
- Table is small (< 100 rows)

### 3.2 Index Definitions

**Papers Table**:
```typescript
'id, pubmedId, doi, [readStatus+dateAdded], [importance+dateAdded], *categories, *tags'
```

**Rationale**:
- `id` - Primary key (Dexie requires)
- `pubmedId`, `doi` - Deduplication checks
- `[readStatus+dateAdded]` - Compound: "show unread papers by date"
- `[importance+dateAdded]` - Compound: "show high priority papers by date"
- `*categories` - Multi-entry: "find all papers in category X"
- `*tags` - Multi-entry: "find all papers with tag Y"

**Removed Indexes**:
- `title` - Not useful (string equality rare, full-text search uses chunks)
- `publicationDate` - Single-field sort (can use `orderBy` without index)
- `dateAdded` - Covered by compound indexes

**Questions Table**:
```typescript
'id, [status+lastUpdated], isPriority'
```

**Findings Table**:
```typescript
'id, questionId, *supportingPapers, hasContradiction'
```

**Chunks Table** (v3):
```typescript
'id, paperId, *topics, *relatedQuestionIds, chunkIndex'
```

**Embeddings Table** (v3):
```typescript
'id, chunkId, model'
```

### 3.3 Compound Index Strategy

**Purpose**: Optimize common query patterns with multiple filters

**Example**:
```typescript
// Common query: "Show unread papers, newest first"
db.papers
  .where('[readStatus+dateAdded]')
  .between(
    [ReadStatus.UNREAD, Dexie.minKey],
    [ReadStatus.UNREAD, Dexie.maxKey]
  )
  .reverse()
  .toArray()
```

**Performance**:
- Without compound index: Scan all papers, filter, sort = O(n log n)
- With compound index: Direct range query = O(log n + k)
- 1000 papers: ~10ms vs ~100ms

---

## Part 4: Knowledge Chunking Strategy

### 4.1 Chunking Rationale

**Problem with Whole Papers**:
- Papers are 3000-8000 words (too large for precise evidence)
- Abstracts miss important details
- Can't link findings to exact passages
- Search returns irrelevant papers (one keyword match in 5000 words)

**Benefits of Chunking**:
- Precise evidence extraction (quote exact paragraph)
- Better search relevance (chunk-level embeddings)
- Improved contradiction detection (compare specific claims)
- Enable click-through to source text in UI
- Scalable semantic search (10K chunks vs 1000 papers)

### 4.2 Chunking Algorithm

**Section-Aware Splitting**:
```
Paper Structure:
├── Abstract (1 chunk)
├── Introduction (1-2 chunks)
├── Methods (1-2 chunks)
├── Results (2-4 chunks)
└── Discussion (1-2 chunks)

Average: 8-10 chunks per paper
1000 papers × 10 chunks = 10,000 chunks
```

**Chunk Size**:
- **Target**: 200-500 words
- **Minimum**: 150 words (avoid fragment chunks)
- **Maximum**: 600 words (maintain coherence)

**Overlap Strategy**:
- No overlap initially (simplicity)
- Consider 50-word overlap in Phase 3+ if needed for context

**Chunking Rules**:
1. Never split mid-sentence
2. Preserve paragraph boundaries
3. Keep section context metadata
4. Extract citations within chunk
5. Identify key topics per chunk

### 4.3 Chunk Processing Workflow

```
New Paper Ingested
  ↓
Parse full text or abstract
  ↓
Split by section boundaries
  ↓
For each section:
  Split into 200-500 word chunks
  Extract topics/keywords
  Preserve section metadata
  ↓
Store chunks in database
  ↓
Generate embeddings (async)
  ↓
Store embeddings separately
```

**Error Handling**:
- Paper saved even if chunking fails
- Chunking can be retried later
- Mark paper as "chunking_pending" if failed
- Log errors for debugging

**Performance**:
- Chunking: ~500ms per paper (client-side)
- Embedding generation: ~2s per paper (10 chunks × 200ms API call)
- Total: ~2.5s per paper (acceptable for background processing)

---

## Part 5: Relationship Management

### 5.1 Deletion Strategies

**Hybrid Approach** (Recommended):
1. **Papers** → Soft delete (archive)
2. **Chunks** → Hard delete (regeneratable)
3. **Findings** → Preserve, nullify references
4. **Notes** → Preserve, mark as orphaned

**Rationale**:
- Papers: Expensive to refetch, preserve
- Chunks: Cheap to regenerate, delete
- Findings: User's intellectual work, preserve
- Notes: User's thoughts, never delete

### 5.2 Deletion Impact Analysis

**Before deleting paper**:
```typescript
const impact = await getDeletionImpact(paperId);
// Returns:
{
  findings: 3,           // 3 findings reference this
  notes: 2,              // 2 notes attached
  chunks: 8,             // 8 chunks will be deleted
  questions: 2,          // 2 questions affected
  contradictions: 1      // 1 contradiction involves this
}
```

**User sees**:
```
⚠️ Deleting this paper will:
• Remove 8 text chunks (regeneratable)
• Affect 3 findings (will be marked as incomplete)
• Orphan 2 notes (will be preserved)
• Update 2 questions (evidence counts will decrease)
• Update 1 contradiction (paper removed from comparison)

Archive instead? [Archive] [Delete Anyway] [Cancel]
```

### 5.3 Cascade Deletion Rules

**When paper archived**:
- Paper: `isArchived = true`
- Chunks: Hard deleted (regeneratable)
- Findings: `supportingPapers` updated, `supportingPapersMissing++`
- Notes: Marked with `originalPaperId` (can restore)
- Questions: `paperCount--`, findings updated
- Contradictions: Recalculated if paper count changes

**Transaction Wrapper**:
```typescript
await db.transaction('rw', 
  [db.papers, db.chunks, db.findings, db.notes, db.questions], 
  async () => {
    // All operations succeed or all fail
    // No partial updates
  }
);
```

### 5.4 Reference Integrity Maintenance

**On Paper Save**:
1. Update `relatedQuestions` array
2. Update `relatedFindings` array
3. Validate all referenced entities exist

**On Question/Finding Save**:
1. Update paper's relationship arrays
2. Maintain bidirectional links
3. Validate paper references

**Periodic Cleanup** (weekly maintenance):
```typescript
async function cleanOrphanedReferences() {
  // Find findings referencing non-existent papers
  // Remove invalid references
  // Log cleanup actions
  // Update supportingPapersMissing counts
}
```

---

## Part 6: Query Patterns & Best Practices

### 6.1 Common Query Utilities

**Location**: `src/services/db.ts` exports `queries` object

**Papers**:
```typescript
queries.getUnreadPapers()
  // → All papers with readStatus = UNREAD, not archived

queries.getRecentPapers(7)
  // → Papers added in last 7 days

queries.getPapersByCategory(Category.PATHOPHYSIOLOGY)
  // → All papers tagged with specific category

queries.getHighPriorityPapers()
  // → Papers marked as high importance
```

**Questions**:
```typescript
queries.getPriorityQuestions()
  // → Questions marked as priority

queries.getQuestionsByStatus(QuestionStatus.PARTIAL)
  // → Questions with partial evidence

queries.getQuestionsNeedingUpdate()
  // → Questions with old evidence (30+ days)
```

**Performance**:
```typescript
queries.getCounts()
  // → Fast counts without loading full arrays
  // → Returns: { totalPapers, unreadPapers, ... }

queries.getCountsCached()
  // → Cached version (1-minute TTL)
  // → Use for dashboard displays
```

### 6.2 Pagination Patterns

**Offset-Based** (simple, good for < 1000 items):
```typescript
const page1 = await db.papers
  .orderBy('dateAdded')
  .reverse()
  .offset(0)
  .limit(20)
  .toArray();

const page2 = await db.papers
  .orderBy('dateAdded')
  .reverse()
  .offset(20)
  .limit(20)
  .toArray();
```

**Cursor-Based** (better for large sets):
```typescript
const page1 = await db.papers
  .orderBy('dateAdded')
  .reverse()
  .limit(20)
  .toArray();

const lastItem = page1[page1.length - 1];

const page2 = await db.papers
  .where('dateAdded')
  .below(lastItem.dateAdded)
  .reverse()
  .limit(20)
  .toArray();
```

### 6.3 Search Best Practices

**Keyword Search** (Phase 2):
```typescript
// Search across multiple fields
const results = await db.papers
  .filter(paper => 
    paper.title.toLowerCase().includes(query) ||
    paper.abstract.toLowerCase().includes(query) ||
    paper.tags.some(tag => tag.includes(query))
  )
  .toArray();
```

**Hybrid Search** (Phase 3+):
```typescript
// 1. Keyword filter (fast)
const candidates = await db.chunks
  .where('topics')
  .startsWithIgnoreCase(firstWord)
  .toArray();

// 2. Semantic ranking
const queryEmbedding = await generateEmbedding(query);
const scored = candidates.map(chunk => ({
  chunk,
  score: 0.7 * semanticScore + 0.3 * keywordScore
}));

// 3. Group by paper, return top results
```

**Performance Targets**:
- Keyword search: < 50ms
- Hybrid search: < 500ms
- Pagination: < 20ms

---

## Part 7: Semantic Search Architecture

### 7.1 Embedding Strategy

**Model**: OpenAI `text-embedding-3-small`
- Dimensions: 1536
- Cost: $0.02 per 1M tokens
- Quality: Excellent for research text
- Speed: ~200ms per chunk

**When to Generate Embeddings**:
- Background: After paper chunked (async, don't block)
- Batch: Process 100 chunks at once (API efficiency)
- Retry: On failure, exponential backoff
- Skip: If embeddings exist and model unchanged

**Storage Format**:
```typescript
// Store as Float32Array (efficient)
const vector = new Float32Array(embedding);
await db.embeddings.add({
  id: uuid(),
  chunkId: chunk.id,
  model: 'text-embedding-3-small',
  dimensions: 1536,
  vector: vector,
  dateCreated: new Date().toISOString()
});
```

### 7.2 Search Performance

**Memory Requirements**:
- 10,000 chunks × 1536 dims × 4 bytes = 60MB
- Acceptable for modern browsers (can load in memory)

**Search Algorithm**:
1. Load all embeddings into memory (one-time, ~500ms)
2. Compute cosine similarity with query (10K ops, ~50ms)
3. Sort and return top K results (~10ms)
4. **Total**: ~560ms first search, ~60ms subsequent

**Optimization Options**:
- **Web Worker**: Move computation off main thread
- **HNSW Index**: Approximate nearest neighbor (if needed)
- **Caching**: Cache query embeddings (same query reused)

### 7.3 Hybrid Search Weighting

**Default Weights**:
- Semantic: 70%
- Keyword: 30%

**Rationale**:
- Semantic captures meaning ("mitochondrial issues" matches "ATP production")
- Keyword ensures exact matches ranked high ("PEM" finds "PEM" mentions)
- 70/30 split based on research paper search experiments

**Tuning**:
- User can adjust weights in settings
- Track click-through rate by weight setting
- Auto-adjust if one performs significantly better

---

## Part 8: Migration Strategy

### 8.1 Version History

**Version 1** (Week 1-2):
- Initial schema
- Papers, notes, searches

**Version 2** (Week 3-4):
- Add questions, findings, contradictions
- Support Q&A system

**Version 3** (Week 5+):
- Add chunks, embeddings
- Add soft delete fields to existing tables
- Optimize indexes

### 8.2 Migration Best Practices

**Dexie Migration Syntax**:
```typescript
// ✅ CORRECT: Only specify changes
this.version(3).stores({
  chunks: 'id, paperId, *topics, *relatedQuestionIds',
  embeddings: 'id, chunkId, model'
});

// ❌ WRONG: Don't redefine existing tables
this.version(3).stores({
  papers: 'id, pubmedId, doi, ...', // Don't repeat!
  chunks: '...'
});
```

**Adding Fields** (schema changes):
```typescript
this.version(3)
  .stores({
    chunks: 'id, paperId, *topics',
    embeddings: 'id, chunkId, model'
  })
  .upgrade(async tx => {
    // Add new fields to existing records
    await tx.table('papers').toCollection().modify(paper => {
      paper.isArchived = false;
      paper.relatedQuestions = [];
      paper.relatedFindings = [];
    });
  });
```

**Testing Migrations**:
```typescript
// 1. Create v1 database with test data
// 2. Run v2 migration
// 3. Verify data intact
// 4. Run v3 migration
// 5. Verify all fields present
```

### 8.3 Rollback Strategy

**No Built-in Rollback**:
- Dexie doesn't support version downgrade
- Must export data before migration
- Test thoroughly before production

**Safe Migration Process**:
1. Export current data (`exportDatabase()`)
2. Test migration in dev environment
3. Deploy new version
4. Monitor for errors
5. Keep export file for 30 days (emergency restore)

---

## Part 9: Performance Optimization

### 9.1 Query Optimization

**Use Indexes**:
```typescript
// ✅ GOOD: Uses index
db.papers.where('readStatus').equals(ReadStatus.UNREAD)

// ❌ BAD: Full table scan
db.papers.filter(p => p.readStatus === ReadStatus.UNREAD)
```

**Compound Indexes**:
```typescript
// ✅ GOOD: Uses compound index
db.papers.where('[readStatus+dateAdded]')
  .between([ReadStatus.UNREAD, minDate], [ReadStatus.UNREAD, maxDate])

// ❌ BAD: Separate queries + merge
const unread = await db.papers.where('readStatus').equals(ReadStatus.UNREAD);
const filtered = unread.filter(p => p.dateAdded > minDate);
```

**Pagination**:
```typescript
// ✅ GOOD: Limit + offset
db.papers.limit(20).offset(page * 20)

// ❌ BAD: Load all, slice in memory
const all = await db.papers.toArray();
const page = all.slice(page * 20, (page + 1) * 20);
```

### 9.2 Caching Strategy

**Count Queries** (dashboard):
- Cache for 1 minute
- Invalidate on write operations
- Use stale-while-revalidate pattern

**Embeddings** (search):
- Load once per session
- Keep in memory (60MB acceptable)
- Reload only if new embeddings added

**Query Results** (lists):
- Use Dexie's built-in caching
- `useLiveQuery()` handles updates automatically
- No manual cache management needed

### 9.3 Performance Targets

**Query Times** (1000 papers):
- Simple query: < 20ms
- Filtered query: < 50ms
- Keyword search: < 100ms
- Semantic search: < 500ms
- Pagination: < 20ms

**Write Times**:
- Add paper: < 50ms
- Add chunk: < 10ms
- Add embedding: < 20ms
- Transaction (multi-table): < 100ms

**Memory Usage**:
- Base: ~10MB (Dexie + React)
- Papers (1000): ~5MB
- Chunks (10K): ~20MB
- Embeddings (10K): ~60MB
- **Total**: ~95MB (acceptable)

---

## Part 10: Testing Strategy

### 10.1 Unit Tests

**Database Operations**:
```typescript
describe('Papers CRUD', () => {
  test('add paper with all fields')
  test('retrieve paper by id')
  test('update paper fields')
  test('delete paper (soft delete)')
  test('restore archived paper')
});

describe('Relationships', () => {
  test('paper → questions linking')
  test('finding → papers reference integrity')
  test('cascade delete impact')
  test('orphaned reference cleanup')
});
```

### 10.2 Migration Tests

**Schema Evolution**:
```typescript
describe('Migrations', () => {
  test('v1 → v2: adds questions table')
  test('v2 → v3: adds chunks table')
  test('v3 upgrade: adds soft delete fields')
  test('data preservation across migrations')
});
```

### 10.3 Performance Tests

**Benchmarks** (with test data):
```typescript
describe('Performance', () => {
  beforeEach(async () => {
    await seedDatabase(1000); // 1000 papers
  });

  test('query 1000 papers < 50ms')
  test('filtered query < 100ms')
  test('pagination < 20ms')
  test('semantic search < 500ms')
});
```

---

## Part 11: Maintenance & Operations

### 11.1 Regular Maintenance

**Weekly**:
- Run `cleanOrphanedReferences()`
- Check database size (warn if > 80MB)
- Validate relationship integrity

**Monthly**:
- Export backup
- Review query performance logs
- Clean up old archived items (optional)

**Quarterly**:
- Regenerate embeddings if model upgraded
- Optimize database (Dexie compact)
- Review schema for needed changes

### 11.2 Monitoring

**Key Metrics**:
- Database size (MB)
- Query times (percentiles)
- Error rates (failed queries)
- Migration success rate

**Alerts**:
- Database > 90MB (approaching limit)
- Query time > 1s (performance issue)
- Error rate > 1% (investigate)

### 11.3 Backup & Recovery

**Export Format** (JSON):
```json
{
  "version": 3,
  "exportDate": "2025-10-28T12:00:00Z",
  "papers": [...],
  "questions": [...],
  "findings": [...],
  "contradictions": [...],
  "chunks": [...],
  "notes": [...]
}
```

**Import Process**:
1. Validate JSON structure
2. Check version compatibility
3. Clear existing data (with confirmation)
4. Bulk insert all tables
5. Regenerate embeddings (async)

---

## Part 12: Future Enhancements

### 12.1 Potential Additions (Post-v3)

**Full-Text Search**:
- Add MiniSearch or similar
- Index all paper text for instant search
- Complement semantic search

**Graph Database Layer**:
- Add citation graph (paper A cites paper B)
- Track mechanism relationships
- Visualize knowledge graph

**Sync Capability**:
- Export to cloud storage (Google Drive, Dropbox)
- Multi-device sync (CouchDB pattern)
- Conflict resolution strategy

### 12.2 Performance Scaling

**If > 5000 papers**:
- Move embeddings to separate IndexedDB instance
- Implement virtual scrolling for lists
- Add data archival (old papers to separate storage)
- Consider Web SQL for complex queries (if standardized)

### 12.3 Advanced Features

**Smart Chunking**:
- Use GPT-4 to identify semantic boundaries
- Adaptive chunk sizes based on content density
- Cross-reference detection within chunks

**Intelligent Caching**:
- Predict next queries based on user behavior
- Preload likely-needed data
- Cache invalidation based on staleness

---

## Appendix A: Quick Reference

### Common Queries

```typescript
// Get unread papers
db.papers.where('readStatus').equals(ReadStatus.UNREAD).toArray()

// Get recent papers
db.papers.where('dateAdded').above(cutoffDate).toArray()

// Search by category
db.papers.where('categories').equals(Category.PATHOPHYSIOLOGY).toArray()

// Find paper by DOI
db.papers.where('doi').equals(doi).first()

// Get findings for question
db.findings.where('questionId').equals(questionId).toArray()

// Get unresolved contradictions
db.contradictions.where('status').equals(ContradictionStatus.UNRESOLVED).toArray()

// Get chunks for paper
db.chunks.where('paperId').equals(paperId).orderBy('chunkIndex').toArray()
```

### Index Reference

```typescript
// Papers: id, pubmedId, doi, [readStatus+dateAdded], [importance+dateAdded], *categories, *tags
// Questions: id, [status+lastUpdated], isPriority
// Findings: id, questionId, *supportingPapers, hasContradiction
// Contradictions: id, findingId, status, severity
// Chunks: id, paperId, *topics, *relatedQuestionIds, chunkIndex
// Embeddings: id, chunkId, model
```

---

## Document Information

**Authors**: Jamie Barter  
**Last Updated**: October 28, 2025  
**Version**: 1.0  
**Status**: Planning Document

**Related Documentation**:
- `IMPLEMENTATION_PLAN.md` - Overall system implementation
- `PRD.md` - Product requirements
- `STATUS.md` - Current progress
- `/database-enhancement-plan.plan.md` - Enhancement plan

---

**END OF DATABASE GUIDE**

*This guide will be updated as the database implementation progresses and new patterns emerge.*

