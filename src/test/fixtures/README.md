# Test Fixtures

Organized test data for the ME/CFS Research Tracker.

## Directory Structure

```
fixtures/
├── test-urls.json          # Test URLs and identifiers (DOIs, PubMed IDs, etc.)
├── mock-responses/         # Mock API responses from CrossRef, PubMed, etc.
│   ├── crossref-*.json
│   ├── pubmed-*.json
│   └── springer-*.json
├── pdfs/                   # Sample PDF files for testing extraction
│   ├── sample-paper-1.pdf
│   └── README.md
└── README.md              # This file
```

## Usage

### Test URLs (`test-urls.json`)

Structured JSON with test cases organized by identifier type:

```typescript
import testUrls from './fixtures/test-urls.json';

// Access by type
const doi = testUrls.dois[0].id; // "10.1016/j.cell.2024.02.032"
const pmid = testUrls.pubmed[0].id; // "38123456"

// Test invalid cases
const invalidCase = testUrls.invalidCases[0];
```

**Format:**
- `id` or `url`: The identifier or URL to test
- `description`: What this test case covers
- `type`: Source type (doi, pmid, arxiv, etc.)
- `expectedAuthors`, `expectedYear`: Optional expected metadata for validation
- `expectedError`: For invalid cases, what error should be thrown

### Mock API Responses (`mock-responses/`)

Pre-saved JSON responses from academic APIs:

```typescript
import crossrefResponse from './fixtures/mock-responses/crossref-sample.json';

// Use in tests to avoid real API calls
vi.mock('@/lib/http', () => ({
  fetchJSON: vi.fn().mockResolvedValue(crossrefResponse)
}));
```

**Naming convention:** `{source}-{description}.json`
- `crossref-valid-doi.json` - Successful CrossRef lookup
- `pubmed-not-found.json` - 404 response
- `springer-rate-limit.json` - Rate limit error response

### PDF Files (`pdfs/`)

Small sample PDFs for testing PDF extraction:

```typescript
import { extractPDFMetadata } from '@/lib/pdfExtractor';

const pdfPath = '/src/test/fixtures/pdfs/sample-paper-1.pdf';
const result = await extractPDFMetadata(pdfPath);
```

**Requirements:**
- Keep files small (<1MB each)
- Include metadata comments in `pdfs/README.md`
- Real academic papers preferred (open access only)
- Include both well-formed and edge cases (scanned, missing metadata, etc.)

## Guidelines

### Adding New Test Data

1. **Test URLs**: Add to appropriate array in `test-urls.json`
2. **Mock Responses**: Save as JSON in `mock-responses/` with descriptive name
3. **PDFs**: Add to `pdfs/` and document in `pdfs/README.md`

### Best Practices

- **Real data when possible**: Use actual DOIs and PMIDs from open-access papers
- **Document edge cases**: Explain what each invalid case tests
- **Keep PDFs small**: Compress or use short papers
- **Update descriptions**: Keep metadata current and descriptive
- **Version control**: Git-track all fixtures (PDFs included if small)

### What NOT to Include

- ❌ Paywalled content without permission
- ❌ Personal/sensitive research data
- ❌ Large files (>1MB per PDF)
- ❌ Non-open-access papers without proper licensing

## Related Files

- Tests using fixtures: `src/tools/PaperFetcher.test.ts`, `src/lib/pdfExtractor.test.ts`
- Test helpers: `src/test/helpers.ts`
- Vitest config: `vitest.config.ts`

## Maintenance

Review quarterly:
- Update DOIs/URLs if papers move or get updated
- Refresh API mock responses for API changes
- Add new edge cases discovered in production

