# Author Field Debugging Guide

## Issue: "Authors pulling through wrong field"

### What the Code Expects

The `Author` interface is defined as:
```typescript
interface Author {
  name: string;         // REQUIRED: Full author name
  affiliation?: string; // OPTIONAL: University/institution
  email?: string;       // OPTIONAL: Contact email
}
```

### How Authors Are Stored

**Database Type:** `Author[]` (array of objects)

**Example:**
```json
[
  { "name": "John Smith", "affiliation": "Harvard University" },
  { "name": "Jane Doe", "affiliation": "MIT" }
]
```

---

## 🔍 Where Authors Come From

### 1. PDF Upload
**Source:** `src/lib/pdfExtractor.ts` line 129

**Current Logic:**
```typescript
function extractAuthors(text: string): Author[] {
  // Looks for names near email addresses
  const emailMatches = text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b(?=.*?@)/g);
  
  if (emailMatches && emailMatches.length > 0) {
    return emailMatches.slice(0, 5).map(name => ({
      name: name.trim(),
      affiliation: 'Extracted from PDF - please verify',
    }));
  }
  
  return [];
}
```

**Result:** Returns `Author[]` with:
- `name`: Extracted from text
- `affiliation`: Set to "Extracted from PDF - please verify"

### 2. Smart Fetch (PubMed)
**Source:** `src/tools/PaperFetcher.ts` line 150

**Logic:**
```typescript
const authors: Author[] = Array.from(authorNodes)
  .map((node) => {
    const lastName = node.querySelector('LastName')?.textContent || '';
    const foreName = node.querySelector('ForeName')?.textContent || '';
    const affiliation = node.querySelector('Affiliation')?.textContent || undefined;
    
    return {
      name: foreName ? `${foreName} ${lastName}` : lastName,
      affiliation,
    };
  });
```

**Result:** Returns `Author[]` with:
- `name`: "FirstName LastName"
- `affiliation`: From PubMed XML (if available)

### 3. Smart Fetch (Crossref)
**Source:** `src/tools/PaperFetcher.ts` line 253

**Logic:**
```typescript
const authors: Author[] =
  work.author?.map((a) => ({
    name: `${a.given || ''} ${a.family || ''}`.trim(),
    affiliation: a.affiliation?.[0]?.name,
  })) || [];
```

**Result:** Returns `Author[]` with:
- `name`: "GivenName FamilyName"
- `affiliation`: From Crossref API (if available)

### 4. Manual Entry
**Source:** `src/components/papers/AddPaperForm.tsx` line 72

**Logic:**
```typescript
const authors = parseAuthors(formData.authors); // formData.authors is a string
```

**parseAuthors function:**
```typescript
export const parseAuthors = (authorsString: string): Array<{ name: string }> => {
  return authorsString
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ name }));
};
```

**Result:** Returns `Author[]` with:
- `name`: Each comma-separated name
- `affiliation`: Not set (undefined)

---

## 🐛 Common Issues

### Issue 1: Affiliation Showing as Name
**Symptom:** "Harvard University" shows up where author name should be

**Possible Causes:**
1. PubMed XML parsing swapped fields
2. PDF extraction grabbed wrong text

**Debug Steps:**
1. Open browser console
2. Look for "Extracted metadata" log
3. Check the `authors` array structure

**Expected:**
```javascript
authors: [
  { name: "John Smith", affiliation: "Harvard" }
]
```

**If Wrong:**
```javascript
authors: [
  { name: "Harvard", affiliation: "John Smith" }  // SWAPPED!
]
```

### Issue 2: Authors Not Saving
**Symptom:** Authors field is empty after saving

**Possible Causes:**
1. Empty array returned
2. Database type mismatch

**Debug:**
Check console for:
```
Extracted metadata: { authorsCount: 0 }
```

### Issue 3: Authors Displayed Wrong
**Symptom:** UI shows wrong data

**Check:** `src/utils/formatting.ts` line 58
```typescript
export const formatAuthors = (authors: Author[], maxAuthors = 3): string => {
  const authorNames = authors.map((author) => author.name);  // Uses .name
  // ...
}
```

**This function expects:** `authors` to be an array with `.name` property

---

## 🧪 Debug Steps

### Step 1: Check Console Logs

After uploading a PDF or fetching a paper, look for:

```javascript
// PDF Upload
Extracted metadata: {
  title: "...",
  authorsCount: 2,
  authors: [
    { name: "John Smith", affiliation: "..." },
    { name: "Jane Doe", affiliation: "..." }
  ]
}

// Smart Fetch
Fetching from PubMed: ...
// or
Fetching from Crossref: ...
```

### Step 2: Check What's Stored

After saving a paper:
1. Open browser DevTools
2. Go to Application tab
3. IndexedDB → researcher → papers
4. Find your paper
5. Check the `authors` field structure

**Should look like:**
```json
{
  "authors": [
    { "name": "John Smith", "affiliation": "Harvard" }
  ]
}
```

**Not like:**
```json
{
  "authors": "John Smith, Jane Doe"  // WRONG - string not array!
}
```

### Step 3: Check UI Display

**In Paper Card/Detail:**
- Uses `formatAuthors(paper.authors, X)`
- This calls `authors.map((author) => author.name)`

**Expected:** "John Smith, Jane Doe"
**If showing:** "Harvard, MIT" → Fields are swapped!

---

## 🔧 Quick Fixes

### Fix 1: PDF Extraction Returns Wrong Data

**Problem:** PDF authors are extracted incorrectly

**Temporary Fix:** Delete lines 138-139 in `src/lib/pdfExtractor.ts`:
```typescript
return emailMatches.slice(0, 5).map(name => ({
  name: name.trim(),
  affiliation: 'Extracted from PDF - please verify',  // ← Remove this line
}));
```

**Better:** Just return empty array and enter authors manually:
```typescript
return []; // Let user enter manually
```

### Fix 2: API Data Swapped

**Check:** In `src/tools/PaperFetcher.ts` line 253-256

If Crossref is returning swapped data:
```typescript
const authors: Author[] =
  work.author?.map((a) => ({
    name: `${a.family || ''} ${a.given || ''}`.trim(),  // Try swapping these
    affiliation: a.affiliation?.[0]?.name,
  })) || [];
```

---

## 📊 What to Share

If still broken, share these debug outputs:

1. **Console logs** showing "Extracted metadata"
2. **IndexedDB screenshot** of `authors` field
3. **What you entered** vs **what displays**
4. **Which method** (PDF/Smart Fetch/Manual)

Example:
```
Method: PDF Upload
Console shows: authors: [{ name: "Harvard", affiliation: "John Smith" }]
UI displays: "Harvard, MIT, Stanford"
Expected: "John Smith, Jane Doe, Bob Wilson"
```

---

## ✅ Verification Checklist

- [ ] Authors is an `Array`, not a string
- [ ] Each author has a `name` property
- [ ] `affiliation` is optional
- [ ] Console shows correct author structure
- [ ] IndexedDB shows correct structure
- [ ] UI displays author names (not affiliations)

---

**Updated:** 2025-10-28  
**Status:** Debug logging added to PDF extraction

