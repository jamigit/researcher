# PDF Text Extraction Troubleshooting Guide

## Issue: "Text not extracting"

### ✅ Changes Made

#### 1. Fixed Worker Configuration
```typescript
// Before: jsdelivr with .mjs
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// After: unpkg with .js (better compatibility)
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
```

#### 2. Added Detailed Console Logging
Now you'll see step-by-step progress:
```
Starting PDF text extraction...
ArrayBuffer created, size: 1234567
PDF loading task created
PDF loaded successfully, pages: 12
Extracting text from page 1...
Page 1 extracted, length: 2345
...
Total text extracted, length: 25678
```

---

## 🔍 How to Debug

### Step 1: Open Browser Console
```
Right-click → Inspect → Console tab
```

### Step 2: Try Uploading a PDF

You should see one of these outcomes:

#### ✅ Success
```
Starting PDF text extraction...
ArrayBuffer created, size: 1234567
PDF loading task created
PDF loaded successfully, pages: 12
Extracting text from page 1...
Page 1 extracted, length: 2345
Page 2 extracted, length: 1890
...
Total text extracted, length: 25678
Extracted text length: 25678
```
**Result:** Text extraction working!

#### ❌ Worker Loading Error
```
PDF text extraction error: ...
Error details: Setting up fake worker failed: ...
```

**Solution:** Worker CDN issue. Try one of these fixes:

**Option A: Use different CDN**
```typescript
// In src/lib/pdfExtractor.ts line 11
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';
```

**Option B: Bundle worker locally**
```bash
npm install pdfjs-dist
# Copy worker to public folder
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

Then update:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

#### ❌ CORS Error
```
Access to fetch at 'https://unpkg.com/...' blocked by CORS
```

**Solution:** Use local worker (Option B above)

#### ❌ PDF Parsing Error
```
PDF text extraction error: ...
Error details: Invalid PDF structure
```

**Solution:** PDF might be:
- Corrupted
- Password-protected
- Scanned (image-based)

Try a different PDF or use manual entry.

---

## 🧪 Test Cases

### Test 1: Simple Text-Based PDF
**Expected:**
- ✅ ArrayBuffer created
- ✅ PDF loaded successfully
- ✅ Text extracted from all pages
- ✅ Length > 0

### Test 2: Scanned PDF (Images)
**Expected:**
- ✅ PDF loads
- ⚠️ Text length = 0 or very small
- **This is normal** - scanned PDFs need OCR

### Test 3: Password-Protected PDF
**Expected:**
- ❌ PDF loading fails
- Error: "Password required"

---

## 🔧 Quick Fixes

### Fix 1: Network Issues (Worker won't load)
```bash
# Check if CDN is accessible
curl https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js

# If fails, use local worker
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

Then update `src/lib/pdfExtractor.ts`:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

### Fix 2: PDF Format Issues
**If text extraction returns empty:**
1. **Check console** for "Page X extracted, length: 0"
2. **Likely cause:** PDF is scanned/image-based
3. **Solution:** Use manual entry or add OCR library

### Fix 3: Large PDFs Slow
**If processing takes > 10 seconds:**
- Reduce page limit from 10 to 5:
```typescript
const numPages = Math.min(pdf.numPages, 5); // Only first 5 pages
```

---

## 📊 What Each Console Message Means

| Message | Meaning | Next |
|---------|---------|------|
| `Starting PDF text extraction...` | Function called | ✅ |
| `ArrayBuffer created, size: X` | File read successfully | ✅ |
| `PDF loading task created` | PDF.js initialized | ✅ |
| `PDF loaded successfully, pages: N` | PDF parsed | ✅ |
| `Extracting text from page X...` | Processing page X | ✅ |
| `Page X extracted, length: Y` | Page text extracted | ✅ |
| `Total text extracted, length: Z` | Completed | ✅ |
| `PDF text extraction error: ...` | **Failed** | ❌ Check error details |
| `Error details: ...` | Specific error | ❌ See fixes above |

---

## ✅ Verification Steps

### Step 1: Upload a Known-Good PDF
Download this test PDF:
```
https://arxiv.org/pdf/2301.00001.pdf
```
(arXiv papers are text-based and work well)

### Step 2: Watch Console
You should see:
1. "Starting PDF text extraction..."
2. "PDF loaded successfully, pages: X"
3. "Page 1 extracted, length: XXXX"
4. "Total text extracted, length: XXXXX"

### Step 3: Verify UI
Green success box should show:
- Title extracted
- Abstract extracted
- Text length > 1000

### Step 4: Check Extracted Data
Click into the paper after saving - verify:
- Title makes sense
- Abstract is present
- Categories were inferred

---

## 🚨 Common Errors & Solutions

### Error: "Setting up fake worker failed"
**Cause:** Worker script couldn't load from CDN  
**Fix:** Use local worker (see Fix 1 above)

### Error: "Invalid PDF structure"
**Cause:** Corrupted or non-standard PDF  
**Fix:** Try different PDF or use manual entry

### Error: "getDocument is not a function"
**Cause:** pdfjs-dist not installed correctly  
**Fix:**
```bash
npm install pdfjs-dist --legacy-peer-deps
```

### No Error, But Text Length = 0
**Cause:** PDF is scanned (image-based)  
**Fix:** PDF doesn't contain extractable text - use manual entry

### Worker Loads But No Text Extracted
**Cause:** PDF has text in images/annotations only  
**Fix:** PDF text is embedded as images - use manual entry

---

## 📝 Debug Checklist

Copy this and check off as you debug:

- [ ] Open browser console
- [ ] Upload a PDF
- [ ] See "Starting PDF text extraction..."
- [ ] See "ArrayBuffer created"
- [ ] See "PDF loaded successfully"
- [ ] See "Page X extracted" for each page
- [ ] See "Total text extracted, length: XXXX"
- [ ] Length > 0
- [ ] Green success box appears
- [ ] Title is NOT "Title not extracted"
- [ ] Abstract is NOT "Abstract not found"

If ALL checked → **Working!**  
If ANY fail → **See error message in console**

---

## 🔍 What to Check First

1. **Console for errors** - Most issues show clear error messages
2. **Network tab** - Check if worker.js loads (should see 200 status)
3. **Text length** - If 0, PDF is likely scanned
4. **PDF source** - Try different PDF to rule out file issue

---

## 💡 Pro Tips

### Tip 1: Test with arXiv Papers
```
https://arxiv.org/abs/XXXX → Download PDF button
```
These are always text-based and work perfectly

### Tip 2: Check First Page Only
If full extraction is slow, modify code to extract page 1 only:
```typescript
const numPages = 1; // Just first page for testing
```

### Tip 3: Use Browser Dev Tools Network Tab
Filter by "pdf.worker" to see if worker loads:
- ✅ Status 200 → Worker loaded
- ❌ Status 404/CORS → Worker failed

---

## 🆘 Still Not Working?

Share these details:

1. **Console error messages** (full text)
2. **PDF source** (where did you get the PDF?)
3. **Browser** (Chrome, Firefox, Safari?)
4. **Network tab** screenshot showing worker.js request
5. **Text length** from console ("Total text extracted, length: X")

---

**Updated:** 2025-10-28  
**Status:** Enhanced with detailed logging + better worker CDN

