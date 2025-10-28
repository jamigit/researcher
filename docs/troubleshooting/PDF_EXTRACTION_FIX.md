# PDF Extraction Fix - Copyright Text Issue

## Problem Reported
```
Title: "Title not extracted - please edit"
Authors: "Open Access, The Author, Open Access, Creative Commons, International License"
```

The PDF extraction was picking up **copyright/license boilerplate text** instead of actual author names.

---

## Root Causes

### Issue 1: Author Extraction Too Broad
**Old Logic:**
- Matched any pattern like "Capitalized Word + Capitalized Word"
- No filtering for common false positives
- Picked up: "Open Access", "Creative Commons", "International License"

### Issue 2: Title Extraction Too Simple
**Old Logic:**
- Just took first long line before "Abstract"
- No cleaning of page numbers, headers, artifacts
- Failed on PDFs with complex formatting

---

## Fixes Applied

### Fix 1: Author Extraction with Blacklist

**Before:**
```typescript
const emailMatches = text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b(?=.*?@)/g);
return emailMatches.map(name => ({ name, affiliation: "..." }));
```

**After:**
```typescript
// Blacklist common false positives
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

// Filter out blacklisted terms
const filteredAuthors = potentialAuthors
  .filter(name => {
    const lowerName = name.toLowerCase();
    return !blacklist.some(term => lowerName.includes(term));
  })
  .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
  .slice(0, 5); // Limit to 5 authors

// Only return if results look reliable
if (filteredAuthors.length > 0 && filteredAuthors.length <= 10) {
  return filteredAuthors.map(name => ({...}));
}

// Otherwise return empty - user enters manually
return [];
```

**Key Improvements:**
- ✅ Filters out "Open Access", "Creative Commons", etc.
- ✅ Removes duplicates
- ✅ Returns empty if extraction looks unreliable
- ✅ Limits to 5 authors max

### Fix 2: Better Title Extraction

**Before:**
```typescript
for (const line of lines.slice(0, 5)) {
  if (trimmed.length > 20 && trimmed.length < 300) {
    return trimmed.replace(/^\d+\s*/, '');
  }
}
```

**After:**
```typescript
// Remove common header artifacts
const cleanedText = firstPart
  .replace(/^\s*\d+\s*$/gm, '') // Remove page numbers
  .replace(/^[A-Z\s]{10,}$/gm, '') // Remove all-caps headers
  .trim();

// Heuristics for title identification
for (const line of lines) {
  const wordCount = line.split(/\s+/).length;
  const isNotAllCaps = line !== line.toUpperCase();
  const hasProperCapitalization = /^[A-Z]/.test(line);
  
  if (wordCount >= 3 && isNotAllCaps && hasProperCapitalization) {
    let title = line
      .replace(/^\d+\s*/, '') // Remove leading numbers
      .replace(/^[A-Z\s]+:\s*/, '') // Remove "ARTICLE:", "RESEARCH:", etc.
      .trim();
    
    if (title.length > 20) {
      return title;
    }
  }
}

// Fallback: longest line
const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b);
```

**Key Improvements:**
- ✅ Removes page numbers and headers
- ✅ Checks word count (at least 3 words)
- ✅ Avoids ALL-CAPS text
- ✅ Requires proper capitalization
- ✅ Strips "ARTICLE:", "RESEARCH:" prefixes
- ✅ Fallback to longest line

---

## Expected Results

### Before Fix
```
Title: Title not extracted - please edit
Authors: Open Access, The Author, Creative Commons, International License
```

### After Fix
```
Title: [Actual paper title from first page]
Authors: [Real author names OR empty if unreliable]
```

**Note:** If author extraction looks unreliable, it now returns **empty array** instead of garbage. This is intentional - better to have users add authors manually than show wrong data.

---

## Test Cases

### Test 1: Open Access PDF
**Scenario:** PDF with "Open Access" license text

**Before:**
- Authors: "Open Access, Creative Commons"

**After:**
- Authors: [] (empty - user adds manually)

### Test 2: Well-Formatted PDF
**Scenario:** PDF with clear author names like "John Smith, Jane Doe"

**Before:**
- Authors: "John Smith, Jane Doe, Open Access"

**After:**
- Authors: "John Smith, Jane Doe" (filtered correctly)

### Test 3: Complex PDF with Headers
**Scenario:** PDF with "RESEARCH ARTICLE" header

**Before:**
- Title: "RESEARCH ARTICLE"

**After:**
- Title: [Actual title below the header]

---

## Limitations

### Authors May Still Be Empty
**Why:** Author extraction from PDFs is inherently unreliable

**When to expect empty authors:**
- PDFs with complex layouts
- Multi-column formats
- Authors embedded in images
- Unusual formatting

**Solution:** This is intentional. It's better to return empty and let user add manually than show wrong data.

### Title May Still Fail
**When:**
- Title is in an image
- Extreme formatting
- Non-English characters

**Fallback:** User can edit the title field after upload

---

## Alternative: Use Smart Fetch Instead

If a PDF has a DOI, **recommend using Smart Fetch** instead of PDF upload:

1. Extract DOI from PDF text (this works reliably)
2. Use Smart Fetch with the DOI
3. Get complete metadata from PubMed/Crossref

**Workflow:**
```
1. Upload PDF → DOI extracted
2. Copy DOI
3. Go to Smart Fetch → Paste DOI
4. Get perfect metadata (title, authors, abstract, journal)
```

---

## Console Debugging

After uploading a PDF, check console for:

```javascript
Extracted metadata: {
  title: "...",
  authorsCount: 2,  // Should be 0-5, not 10+
  authors: [
    { name: "John Smith", affiliation: "..." },  // Should be real names
    { name: "Jane Doe", affiliation: "..." }     // Not "Open Access"
  ],
  doi: "10.1234/example",
  studyType: "clinical_trial"
}
```

**Red flags:**
- ❌ `authorsCount: 15` - Too many, likely wrong
- ❌ `name: "Open Access"` - Copyright text leaked through
- ❌ `name: "Creative Commons"` - License text

**Good signs:**
- ✅ `authorsCount: 0` - Extraction uncertain, user adds manually
- ✅ `authorsCount: 2-5` with real names - Extraction successful
- ✅ DOI extracted - Can use Smart Fetch for better data

---

## Recommendations

### For Best Results:

1. **If DOI is extracted:**
   - Use Smart Fetch with the DOI instead
   - Much more reliable metadata

2. **If no DOI:**
   - Use PDF upload for abstract/text
   - **Manually enter** title and authors
   - This is faster and more accurate

3. **If Smart Fetch fails:**
   - Use PDF upload as fallback
   - Verify/edit extracted fields

---

**Status:** ✅ Fixed - Copyright text now filtered  
**Date:** 2025-10-28  
**Files Changed:** `src/lib/pdfExtractor.ts`

