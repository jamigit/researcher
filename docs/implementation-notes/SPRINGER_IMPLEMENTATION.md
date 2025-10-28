# Springer & Publisher URL Support Implementation

## ✅ What Was Added (2025-10-28)

### 1. Enhanced URL Detection
Added support for:
- **Springer URLs**: `link.springer.com`, `springer.com/article`
- **Nature URLs**: `nature.com/articles`, `nature.com/nature/`
- **Generic DOI Extraction**: Any URL containing a DOI pattern

### 2. Smart DOI Extraction
New function `extractDOIFromURL()` that handles:
- DOIs in URL path: `https://link.springer.com/article/10.1007/s12026-020-09134-7`
- DOIs as query params: `?doi=10.1234/example`
- DOI.org URLs: `https://doi.org/10.1016/j.clim.2019.01.013`

### 3. Fallback Strategy
```
Springer URL → Extract DOI → Try Crossref → Try DOI Resolver → Error
```

---

## 🎯 Test URLs

### Springer Examples
```
https://link.springer.com/article/10.1007/s12026-020-09134-7
https://link.springer.com/article/10.1007/s10875-020-00789-x
```

### Nature Examples
```
https://www.nature.com/articles/s41467-021-21737-9
https://www.nature.com/nature/articles/nature12345
```

### BMC (Springer Network)
```
https://jneuroinflammation.biomedcentral.com/articles/10.1186/s12974-021-02084-3
```

---

## 📝 Files Modified

### Core Logic
- `src/tools/PaperFetcher.ts`
  - Added `extractDOIFromURL()` function (lines 80-110)
  - Enhanced `fetchPaper()` with publisher URL strategy (lines 479-495)
  - Updated `identifyInputType()` to detect Springer/Nature (lines 43-57)

### Type Definitions
- `src/types/fetcher.ts`
  - Added `SPRINGER_URL` and `NATURE_URL` to `InputType` enum

### UI Updates
- `src/components/papers/SmartAddPaper.tsx`
  - Updated placeholder text to mention Springer/Nature
  - Added Springer/Nature to supported formats list
  - Updated help text

### Configuration
- `vite.config.ts`
  - Changed dev server port from 3000 to 5173 (to avoid EPERM error)

---

## 🧪 How to Test

### 1. Start Dev Server
```bash
npm run dev
```
Server will run at **http://localhost:5173**

### 2. Navigate to Add Paper
- Go to "Papers" → Click "Add Paper" button
- You should see "Smart Fetch" mode by default

### 3. Test Springer URL
Paste this URL:
```
https://link.springer.com/article/10.1007/s12026-020-09134-7
```

Expected behavior:
1. Input type shows "SPRINGER_URL"
2. System extracts DOI: `10.1007/s12026-020-09134-7`
3. Fetches metadata from Crossref
4. Displays paper preview with title, authors, abstract
5. You can save to database

### 4. Test Nature URL
Paste this URL:
```
https://www.nature.com/articles/s41467-021-21737-9
```

Expected behavior:
1. Input type shows "NATURE_URL"
2. System extracts DOI from path
3. Fetches from Crossref
4. Shows paper preview

### 5. Check Browser Console
You should see logs like:
```
Input identified as: springer_url - Input: https://link.springer.com/...
Extracted DOI from URL: 10.1007/s12026-020-09134-7
Fetching from Crossref: 10.1007/s12026-020-09134-7
```

---

## ⚠️ Known Limitations

### CORS Errors (Expected)
When running in browser, you'll see CORS errors from:
- `api.crossref.org`
- `eutils.ncbi.nlm.nih.gov`

**This is normal** and will be resolved in production by routing through Netlify Functions (already in architecture plan).

**For local testing**, you can:
1. Install a CORS browser extension temporarily
2. Or check console logs to verify the logic is working
3. Or test with mock data

### Not Yet Implemented
- bioRxiv/medRxiv preprints
- arXiv papers (detected but not fetching)
- Elsevier ScienceDirect URLs (need DOI extraction pattern)
- Wiley Online Library (need DOI extraction pattern)

---

## 📚 Documentation

See full testing guide at:
**`docs/PAPER_FETCHER_TESTS.md`**

---

## 🚀 Next Steps

To add more publishers:
1. Add URL pattern to `identifyInputType()`
2. Add extraction logic to `extractDOIFromURL()` if needed
3. Add to `fetchPaper()` strategy chain
4. Update UI help text

**Priority publishers for ME/CFS research:**
- ✅ Springer (BMC, Palgrave)
- ✅ Nature Publishing Group
- ⏳ Elsevier (ScienceDirect)
- ⏳ Wiley
- ⏳ bioRxiv/medRxiv (preprints)

---

**Status**: Implemented and ready for testing ✅  
**Date**: 2025-10-28  
**Author**: AI Assistant  
**Tested**: Code compiles, awaiting user testing

