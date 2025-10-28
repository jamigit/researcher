# Test PDF Files

Sample PDFs for testing PDF extraction and metadata parsing.

## Current Files

None yet - add small (<1MB) open-access PDFs here for testing.

## Adding New PDFs

1. **Ensure open access**: Only use papers with permissive licenses (CC-BY, CC0, etc.)
2. **Keep small**: <1MB preferred, compress if needed
3. **Document below**: Add entry with purpose and metadata
4. **Name descriptively**: `{descriptor}-{identifier}.pdf`

## PDF Inventory

### Well-Formed Papers

(None yet - add entries as you add files)

Example format:
```
- `standard-paper-pmid12345.pdf`
  - Source: PubMed Central
  - Size: 450KB
  - Purpose: Test standard PDF extraction
  - Expected metadata: Title, authors, DOI, abstract
```

### Edge Cases

(None yet)

Example format:
```
- `scanned-no-text-layer.pdf`
  - Purpose: Test OCR fallback for scanned papers
  - Expected: Should fail gracefully or trigger OCR warning
```

## Usage in Tests

```typescript
import { extractPDFMetadata } from '@/lib/pdfExtractor';
import { readFileSync } from 'fs';
import { join } from 'path';

const pdfPath = join(__dirname, 'standard-paper-pmid12345.pdf');
const buffer = readFileSync(pdfPath);
const result = await extractPDFMetadata(buffer);

expect(result.title).toBe('Expected Title');
```

## Licensing Note

All PDFs in this directory MUST be:
- Open access (CC-BY, CC0, or similar)
- Used solely for testing purposes
- Properly attributed in documentation

If unsure about licensing, use DOI/PMID identifiers in `test-urls.json` instead.

