# Automated Testing & Discovery System

## Overview

This document describes the automated testing infrastructure and paper discovery system that has been implemented for the ME/CFS Research Tracker.

---

## Testing Infrastructure

### Test Pyramid

```
           E2E Tests (5%)
         /              \
    Integration Tests (20%)
   /                        \
Unit Tests (75%)
```

**Philosophy**: Many fast unit tests catch bugs early, moderate integration tests validate workflows, and few slow E2E tests validate user journeys.

### Test Configuration

- **Framework**: Vitest with jsdom environment
- **Coverage Target**: 70% lines, 70% functions, 60% branches, 70% statements
- **Timeout**: 30 seconds for integration tests
- **Test Database**: fake-indexeddb for isolated test runs

### Running Tests

```bash
# Watch mode (development)
npm test

# Run once (CI)
npm run test:run

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

---

## Paper Discovery System

### Architecture

```
User's Browser (Frontend)
  ↓
Discovery Agents
  ├── PubMed Monitor (automated searches)
  └── RSS Monitor (feed monitoring) [TO BE IMPLEMENTED]
  ↓
Abstract Screening (Claude AI)
  ├── Relevance scoring (0-1)
  ├── Keyword fallback
  └── Category suggestions
  ↓
Discovery Queue (IndexedDB)
  ├── Pending
  ├── Reviewing
  ├── Approved → Main Papers Table
  └── Rejected
```

### Key Components

#### 1. Discovery Agents

**PubMed Monitor** (`src/agents/PubMedMonitor.ts`)
- Searches PubMed API with keywords and date ranges
- Parses XML responses to extract metadata
- Handles errors and retries with exponential backoff

```typescript
import { discoverNewPapers } from '@/agents/PubMedMonitor';

const papers = await discoverNewPapers({
  keywords: ['ME/CFS', 'chronic fatigue syndrome'],
  dateRange: { from: '2024-01-01', to: '2024-01-07' },
  maxResults: 100,
  email: 'your@email.com', // Optional but recommended
  apiKey: 'your-api-key', // Optional for higher rate limits
});
```

#### 2. Abstract Screening

**Abstract Screening Workflow** (`src/workflows/abstractScreening.ts`)
- Uses Claude AI to evaluate paper relevance
- Conservative scoring (0-1 scale)
- Automatic keyword fallback on AI failure
- Batch processing support

```typescript
import { screenAbstract, getDefaultCriteria } from '@/workflows/abstractScreening';

const result = await screenAbstract(paper, getDefaultCriteria());

// Result contains:
// - relevant: boolean
// - relevanceScore: 0-1
// - reasoning: string
// - suggestedCategories: string[]
// - keepForFullReview: boolean
// - confidence: 0-1
```

#### 3. Discovery Queue

**Discovery Queue Service** (`src/services/discoveryQueue.ts`)
- Manages papers before adding to main database
- Tracks review status (pending/reviewing/approved/rejected)
- Stores abstract and full-text review results

```typescript
import { addToQueue, approvePaper } from '@/services/discoveryQueue';

// Add paper to queue
const discovered = await addToQueue(paperCandidate);

// Approve and move to main database
await approvePaper(discovered.id);
```

---

## Database Schema

### Version 5: Discovery Tables

```typescript
discoveredPapers: {
  id: string;
  source: 'pubmed' | 'rss' | 'manual';
  pubmedId?: string;
  doi?: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string; affiliation?: string }>;
  publicationDate?: string;
  keywords?: string[];
  dateDiscovered: string;
  reviewStatus: 'pending' | 'reviewing' | 'approved' | 'rejected';
  relevanceScore?: number;
  abstractReview?: AbstractReviewResult;
  fullTextReview?: FullTextReviewResult;
}
```

---

## Test Coverage

### Unit Tests

✅ **PubMed Monitor** (`src/agents/PubMedMonitor.test.ts`)
- Query building
- XML parsing
- Date range calculation
- API error handling
- Coverage: ~85%

✅ **Abstract Screening** (`src/workflows/abstractScreening.test.ts`)
- Relevance evaluation
- Keyword fallback
- Batch processing
- Filtering by threshold
- Coverage: ~80%

✅ **Discovery Queue** (`src/services/discoveryQueue.test.ts`)
- Queue operations (add, update, delete)
- Status tracking
- Paper approval workflow
- Statistics
- Coverage: ~90%

### Integration Tests

⏳ **TO BE IMPLEMENTED**
- End-to-end discovery pipeline
- Database persistence across sessions
- Concurrent operations

### E2E Tests

⏳ **TO BE IMPLEMENTED**
- Full user workflow with Playwright
- API error handling UI
- Queue management UI

---

## Example: Complete Discovery Workflow

```typescript
import { discoverNewPapers, getDateRangeLastDays } from '@/agents/PubMedMonitor';
import { batchScreenAbstracts, getDefaultCriteria } from '@/workflows/abstractScreening';
import { bulkAddToQueue, approvePaper } from '@/services/discoveryQueue';

async function runWeeklyDiscovery() {
  console.log('Starting weekly paper discovery...');
  
  // 1. Discover papers from last 7 days
  const papers = await discoverNewPapers({
    keywords: ['ME/CFS', 'chronic fatigue syndrome', 'myalgic encephalomyelitis'],
    dateRange: getDateRangeLastDays(7),
    maxResults: 100,
  });
  
  console.log(`Found ${papers.length} papers`);
  
  // 2. Screen abstracts for relevance
  const screenedPapers = await batchScreenAbstracts(
    papers,
    getDefaultCriteria()
  );
  
  // 3. Add to discovery queue
  const relevant = screenedPapers.filter(p => p.result.keepForFullReview);
  const discovered = await bulkAddToQueue(relevant.map(p => p.paper));
  
  console.log(`Added ${discovered.length} papers to review queue`);
  
  // 4. Auto-approve high-confidence papers (optional)
  const highConfidence = discovered.filter(
    p => (p.relevanceScore || 0) > 0.9
  );
  
  for (const paper of highConfidence) {
    await approvePaper(paper.id);
  }
  
  console.log(`Auto-approved ${highConfidence.length} high-confidence papers`);
  
  return {
    found: papers.length,
    relevant: relevant.length,
    autoApproved: highConfidence.length,
  };
}

// Run discovery
runWeeklyDiscovery()
  .then(result => console.log('Discovery complete:', result))
  .catch(error => console.error('Discovery failed:', error));
```

---

## Test Fixtures

Test fixtures are available in `src/test/fixtures/`:
- `pubmedResponses.ts` - Mock PubMed API responses and paper data
- Helper functions in `src/test/helpers/`:
  - `mockClaudeAPI.ts` - Mock Claude API responses
  - `mockDiscoveredPaper.ts` - Factory functions for test data

---

## Roadmap

### Week 1 ✅ COMPLETED
- [x] Set up Vitest with coverage thresholds
- [x] Create test fixtures and helpers
- [x] Implement PubMed Monitor agent
- [x] Implement Abstract Screening workflow
- [x] Implement Discovery Queue service
- [x] Write unit tests (70%+ coverage)

### Week 2 ⏳ IN PROGRESS
- [ ] Integration tests for full pipeline
- [ ] E2E tests with Playwright
- [ ] CI/CD setup (GitHub Actions)

### Week 3 ⏳ PLANNED
- [ ] RSS Monitor agent
- [ ] Full-text analysis workflow
- [ ] Scheduled discovery (backend service)
- [ ] Email notifications

### Week 4 ⏳ PLANNED
- [ ] Production deployment
- [ ] Monitoring and error alerts
- [ ] Performance optimization
- [ ] User documentation

---

## Background Service (Planned)

For automated daily discovery, a Node.js backend service will be required:

### Option A: Serverless (Recommended)
- **Platform**: Netlify/Vercel Scheduled Functions
- **Cost**: Free tier (100 hours/month)
- **Schedule**: Daily at 9am UTC
- **Execution limit**: 10 minutes

### Option B: Long-Running Server
- **Platform**: Railway, Render, DigitalOcean
- **Cost**: $5-10/month
- **Schedule**: Cron job
- **Execution limit**: None

See `BACKGROUND_SERVICE_SETUP.md` for detailed implementation guide (to be created).

---

## Troubleshooting

### Tests Failing with "Cannot find module"
Ensure all dependencies are installed:
```bash
npm install
```

### Database Errors in Tests
The test setup automatically clears the database after each test. If you're seeing persistence issues, check that `fake-indexeddb` is properly installed.

### PubMed API Rate Limits
- Without API key: 3 requests/second
- With API key: 10 requests/second
- Provide email address to help NCBI track usage

### Claude API Errors
The abstract screening workflow includes a keyword-based fallback if Claude API fails. Check that:
- `VITE_ANTHROPIC_API_KEY` is set in `.env`
- Proxy server is running (`npm run dev:proxy`)

---

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass: `npm run test:run`
3. Check coverage: `npm run test:coverage`
4. Run linter: `npm run lint`
5. Update this README if adding new workflows

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [PubMed E-utilities API](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [Claude API Documentation](https://docs.anthropic.com/)

---

Last Updated: 2024-10-29

