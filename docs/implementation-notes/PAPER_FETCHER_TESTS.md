# PaperFetcher Test Guide

## Supported Sources

### ✅ Fully Implemented

#### 1. **DOI (Direct)**
```
10.1007/s12026-020-09134-7
```
- **Works with**: All publishers (Springer, Nature, Elsevier, Wiley, etc.)
- **Fetches from**: Crossref API
- **Metadata**: Title, authors, abstract, journal, publication date

#### 2. **PubMed PMID**
```
32385834
```
- **Works with**: Any paper indexed in PubMed
- **Fetches from**: NCBI E-utilities API
- **Metadata**: Most complete (includes MeSH terms, affiliations)

#### 3. **PubMed URL**
```
https://pubmed.ncbi.nlm.nih.gov/32385834/
```
- **Extracts**: PMID from URL
- **Fetches from**: PubMed API

#### 4. **Springer URLs** ⭐ NEW
```
https://link.springer.com/article/10.1007/s12026-020-09134-7
https://www.springer.com/article/10.1007/s10875-020-00789-x
```
- **Extracts**: DOI from URL path
- **Fetches from**: Crossref API
- **Covers**: All Springer journals, BMC, Palgrave

#### 5. **Nature URLs** ⭐ NEW
```
https://www.nature.com/articles/s41467-021-21737-9
https://www.nature.com/nature/articles/nature12345
```
- **Extracts**: DOI from URL path
- **Fetches from**: Crossref API
- **Covers**: Nature, Nature Communications, Scientific Reports, etc.

#### 6. **DOI.org URLs**
```
https://doi.org/10.1016/j.clim.2019.01.013
```
- **Resolves**: Via DOI.org resolver
- **Works for**: All publishers with registered DOIs

---

## Test Cases for ME/CFS Research

### Real ME/CFS Papers to Test

#### Test 1: Springer Paper
```
URL: https://link.springer.com/article/10.1007/s12026-020-09134-7
DOI: 10.1007/s12026-020-09134-7
Title: "Autoimmune basis of chronic fatigue syndrome"
Expected: ✅ Should fetch via Crossref
```

#### Test 2: Nature Communications
```
URL: https://www.nature.com/articles/s41467-021-21737-9
DOI: 10.1038/s41467-021-21737-9
Title: "Deep phenotyping of post-infectious myalgic encephalomyelitis..."
Expected: ✅ Should fetch via Crossref
```

#### Test 3: PubMed
```
PMID: 32385834
URL: https://pubmed.ncbi.nlm.nih.gov/32385834/
Title: "The role of chronic viral infections in myalgic encephalomyelitis..."
Expected: ✅ Should fetch complete metadata
```

#### Test 4: Direct DOI
```
DOI: 10.1016/j.clim.2019.01.013
Title: "Mitochondrial respiratory chain complex activity in ME/CFS"
Expected: ✅ Should fetch via Crossref
```

#### Test 5: BMC (Springer Network)
```
URL: https://jneuroinflammation.biomedcentral.com/articles/10.1186/s12974-021-02084-3
DOI: 10.1186/s12974-021-02084-3
Expected: ✅ Should extract DOI and fetch
```

---

## Known Limitations

### ❌ Not Implemented (Yet)
- **bioRxiv/medRxiv preprints** - Would need dedicated API
- **arXiv** - Detected but not fetching
- **Europe PMC** - Alternative to PubMed
- **Elsevier ScienceDirect direct URLs** - DOI extraction needed
- **Wiley Online Library** - DOI extraction needed

### ⚠️ CORS Restrictions
All API calls from browser will fail due to CORS. 

**Solutions:**
1. **Development**: Use browser CORS extension temporarily
2. **Production**: Route through Netlify Functions (already in architecture)

---

## Metadata Quality by Source

| Source | Title | Authors | Abstract | Journal | DOI | PMID | Keywords | Quality |
|--------|-------|---------|----------|---------|-----|------|----------|---------|
| **PubMed** | ✅ | ✅✅ | ✅✅ | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Crossref** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐⭐ |
| **DOI Resolver** | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐ |

**Legend:**
- ✅✅ = Excellent (includes affiliations, ORCID)
- ✅ = Good
- ⚠️ = Partial (may be missing for some papers)
- ❌ = Not available

---

## Fallback Strategy

The system tries sources in this order:

```
1. Detect input type (DOI, PMID, Springer URL, etc.)
   ↓
2. Try primary source (PubMed for PMID, Crossref for DOI)
   ↓
3. If URL: Extract DOI → try Crossref
   ↓
4. Fallback: Try DOI resolver
   ↓
5. If all fail: Show error with suggestion to use manual entry
```

---

## Next Steps

To add more sources:
1. **bioRxiv/medRxiv**: Add pattern detection + API integration
2. **Europe PMC**: Similar to PubMed but European focus
3. **Semantic Scholar**: AI-powered, includes citation context
4. **General web scraping**: Extract metadata from HTML `<meta>` tags

---

## Testing Checklist

- [ ] Paste Springer URL → should auto-detect and fetch
- [ ] Paste Nature URL → should extract DOI and fetch
- [ ] Paste bare DOI → should fetch via Crossref
- [ ] Paste PMID → should fetch from PubMed
- [ ] Paste PubMed URL → should extract PMID and fetch
- [ ] Invalid input → should show helpful error message
- [ ] Check browser console for logs showing:
  - Input type detection
  - DOI extraction (if applicable)
  - Fetch source used
  - Any fallback attempts

---

**Last Updated**: 2025-10-28
**Status**: Springer & Nature support implemented ✅

