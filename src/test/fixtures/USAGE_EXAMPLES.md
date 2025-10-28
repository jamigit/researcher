# Test Fixtures Usage Examples

Practical examples for using test fixtures in your tests.

## Loading Test URLs

```typescript
import { loadTestUrls, getTestDoi, getTestPmid } from '@/test/helpers';
import { describe, it, expect } from 'vitest';

describe('PaperFetcher', () => {
  it('fetches paper by DOI', async () => {
    const doi = await getTestDoi(0); // First DOI from test-urls.json
    const result = await fetcher.fetchByDoi(doi);
    
    expect(result).toBeDefined();
    expect(result.doi).toBe(doi);
  });

  it('handles all test DOIs', async () => {
    const testUrls = await loadTestUrls();
    
    for (const testCase of testUrls.dois) {
      const result = await fetcher.fetchByDoi(testCase.id);
      
      if (testCase.expectedAuthors) {
        expect(result.authors).toContain(testCase.expectedAuthors[0]);
      }
      if (testCase.expectedYear) {
        expect(new Date(result.publicationDate).getFullYear()).toBe(testCase.expectedYear);
      }
    }
  });
});
```

## Using Mock API Responses

```typescript
import { loadMockResponse } from '@/test/helpers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { fetchJSON } from '@/lib/http';

vi.mock('@/lib/http');

describe('PaperFetcher with mocked API', () => {
  beforeEach(async () => {
    // Load pre-saved CrossRef response
    const mockResponse = await loadMockResponse('crossref-sample-doi.json');
    vi.mocked(fetchJSON).mockResolvedValue(mockResponse);
  });

  it('parses CrossRef response correctly', async () => {
    const result = await fetcher.fetchByDoi('10.1016/j.cell.2024.02.032');
    
    expect(result.title).toBe('Deep Dive Into Chronic Fatigue: Mechanisms and Pathways');
    expect(result.authors).toHaveLength(2);
    expect(result.authors[0].name).toBe('John Smith');
  });
});
```

## Testing with PDF Files

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractPDFMetadata } from '@/lib/pdfExtractor';

describe('PDF Extraction', () => {
  it('extracts metadata from standard PDF', async () => {
    // Once you add PDFs to fixtures/pdfs/
    const pdfPath = join(__dirname, 'fixtures/pdfs/standard-paper-pmid12345.pdf');
    const buffer = readFileSync(pdfPath);
    
    const result = await extractPDFMetadata(buffer);
    
    expect(result.title).toBeTruthy();
    expect(result.authors).toBeInstanceOf(Array);
  });
});
```

## Testing Invalid Cases

```typescript
import { loadTestUrls } from '@/test/helpers';

describe('Validation', () => {
  it('rejects invalid DOIs', async () => {
    const testUrls = await loadTestUrls();
    
    for (const invalidCase of testUrls.invalidCases) {
      await expect(
        fetcher.fetchByDoi(invalidCase.input)
      ).rejects.toThrow(invalidCase.expectedError);
    }
  });
});
```

## Creating New Mock Responses

When adding a new mock response:

1. **Make an actual API call** (in browser or curl):
```bash
curl https://api.crossref.org/works/10.1016/j.cell.2024.02.032
```

2. **Save response** to `fixtures/mock-responses/`:
```bash
curl https://api.crossref.org/works/10.1016/j.cell.2024.02.032 > \
  src/test/fixtures/mock-responses/crossref-cell-paper.json
```

3. **Use in tests**:
```typescript
const mockResponse = await loadMockResponse('crossref-cell-paper.json');
vi.mocked(fetchJSON).mockResolvedValue(mockResponse);
```

## Organizing Test Data

### Good Practice ✅

```typescript
// Use fixtures for consistent test data
const doi = await getTestDoi();
const paper = await fetcher.fetchByDoi(doi);

// Use mock factories for variations
const paper1 = createMockPaper({ importance: Importance.HIGH });
const paper2 = createMockPaper({ importance: Importance.LOW });
```

### Avoid ❌

```typescript
// Don't hardcode test data in multiple places
const doi = '10.1016/j.cell.2024.02.032'; // Duplicated across tests

// Don't make real API calls in tests
const result = await fetch('https://api.crossref.org/...'); // Slow, brittle
```

## Combining Fixtures and Factories

```typescript
import { loadTestUrls, createMockPaper } from '@/test/helpers';

describe('Paper workflow', () => {
  it('completes full paper lifecycle', async () => {
    // Start with real identifier from fixtures
    const doi = await getTestDoi();
    
    // Fetch (mocked)
    const fetchedPaper = await fetcher.fetchByDoi(doi);
    
    // Create test paper with fetched data + custom overrides
    const paper = createMockPaper({
      doi: fetchedPaper.doi,
      title: fetchedPaper.title,
      readStatus: ReadStatus.READING, // Custom for test
    });
    
    // Add to database
    await db.papers.add(paper);
    
    // Verify
    const retrieved = await db.papers.get(paper.id);
    expect(retrieved?.readStatus).toBe(ReadStatus.READING);
  });
});
```

## Benefits

1. **Consistency**: Same test data across all tests
2. **Speed**: No real API calls
3. **Reliability**: Tests don't fail due to network issues
4. **Documentation**: Test data serves as examples
5. **Maintainability**: Change once, update everywhere

