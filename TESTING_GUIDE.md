# Testing Guide - ME/CFS Research Tracker

**Date**: October 28, 2025  
**Server**: http://localhost:5173  
**Status**: ✅ Claude API Configured

---

## Pre-Testing Checklist

- [x] Claude API key in `.env` file
- [x] Dev server running
- [x] Phase 2 features implemented
- [x] Phase 3 features (70%) implemented

---

## Test 1: Add Research Papers (Prerequisite)

Before testing Q&A, you need papers in your collection.

### Option A: Quick Test with Manual Entry

1. Go to **Papers** page
2. Click **"Add Paper Manually"**
3. Fill in test data:
   ```
   Title: Mitochondrial dysfunction in ME/CFS patients
   Authors: Smith J, Jones A
   Abstract: This study examines mitochondrial function in 50 ME/CFS patients compared to healthy controls. Results showed significantly reduced ATP production and increased oxidative stress markers. Findings suggest mitochondrial impairment may contribute to fatigue symptoms.
   Publication Date: 2023-01-15
   Journal: Journal of Chronic Fatigue Research
   ```
4. Add 2-3 more papers with similar topics

### Option B: Smart Fetch (Recommended)

1. Go to **Papers** page
2. Click **"Smart Fetch"** button
3. Try one of these:
   - **PubMed ID**: `34567890` (example)
   - **DOI**: `10.1016/j.jcfs.2023.01.001` (example)
   - **URL**: Paste a PubMed or Springer URL
   - **PDF**: Upload a research paper PDF

---

## Test 2: Q&A System with AI Evidence Extraction

### 2.1 Ask Your First Question

1. Navigate to **Questions** page (from nav menu)
2. Verify **no yellow warning banner** appears
   - ✅ If no banner = Claude API configured correctly
   - ⚠️ If yellow banner = API key not loading (restart server)

3. Click **"Ask a Question"** button

4. Enter a test question:
   ```
   What role does mitochondrial dysfunction play in ME/CFS?
   ```

5. Click **"Submit Question"**

### 2.2 Observe AI Processing

You should see:
- ✅ Loading spinner appears
- ✅ Progress indicators:
  - "Searching papers..." (animated)
  - "Extracting evidence..." (animated)
  - "Detecting contradictions..." (animated)
  - "Synthesizing answer..." (animated)
- ⏱️ Processing time: 10-30 seconds depending on paper count

### 2.3 Review Results

Once complete, verify:

**Question Detail Page Shows:**
- ✅ Question title and metadata (date, paper count, findings count)
- ✅ Confidence score (0-100%)
- ✅ Status badge (Answered, Partial, etc.)

**Findings Section:**
- ✅ At least 1 finding extracted from papers
- ✅ Each finding has:
  - Description (what was found)
  - Evidence (quantitative or qualitative results)
  - Consistency level (high/medium/low)
  - Supporting papers count
  - Study details (peer-reviewed count, sample sizes)

**Conservative Language Check:**
- ✅ Should use: "suggests", "may indicate", "appears to", "evidence shows"
- ❌ Should NEVER use: "proves", "confirms", "definitely", "always", "caused by"

---

## Test 3: Contradiction Detection

### 3.1 Trigger Contradiction Detection

For contradictions to appear, you need papers with conflicting findings.

**Manual Test:**
1. Add 2+ papers with opposing results on the same topic
2. Ask a question that relates to both papers
3. Wait for AI processing

### 3.2 Verify Contradiction Display

If contradictions detected:
- ✅ **Yellow warning box** appears (very prominent)
- ✅ Shows conflicting sides clearly
- ✅ Topic/mechanism being debated
- ✅ Severity indicator (high/medium/low)
- ✅ Conservative interpretation provided
- ✅ Possible biological explanations listed
- ✅ Study quality comparison

**Test Prompt:**
```
The conservative interpretation should NOT take sides. 
It should say things like:
"Current evidence is mixed. Further research needed to resolve this discrepancy."
```

---

## Test 4: Notes Capability

### 4.1 Add a Personal Note

1. On question detail page, find a finding
2. Click **"Add personal note"** button (below finding)
3. Type a note (e.g., "Relevant to my symptoms - need to discuss with doctor")
4. Wait 3 seconds → should auto-save
5. Verify "Saving..." then "Saved!" message appears

### 4.2 Test Auto-Save

1. Start typing a note
2. Stop typing mid-sentence
3. Wait 3 seconds
4. Verify auto-save triggers
5. Refresh page
6. Verify note persisted

### 4.3 Edit and Delete

1. Click note to edit
2. Modify text
3. Auto-save should trigger again
4. Click delete icon (trash)
5. Confirm deletion
6. Verify note removed

---

## Test 5: Citation Formatting

### 5.1 View Citations

1. On question detail page, scroll to a finding
2. Click **"Show Citations"** or expand citations section
3. Verify APA format:
   ```
   Smith, J., Jones, A. (2023). Mitochondrial dysfunction in ME/CFS patients. 
   Journal of Chronic Fatigue Research, 15(3), 45-67. 
   https://doi.org/10.1016/j.jcfs.2023.01.001
   ```

### 5.2 Copy to Clipboard

1. Click **copy icon** next to citation
2. Verify "Copied!" confirmation appears
3. Paste into a text editor (Cmd+V)
4. Verify citation text is correct

### 5.3 Paper Links

1. Click paper title or "View Paper" link
2. Should open:
   - DOI link (if available)
   - PubMed URL (if available)
   - Paper detail page (if in collection)

---

## Test 6: Mechanism Explainers (NEW!)

### 6.1 Trigger Mechanism Detection

1. Ask a question that mentions a mechanism:
   ```
   How does oxidative stress affect ME/CFS symptoms?
   ```
   OR
   ```
   What is the role of immune dysregulation in ME/CFS?
   ```

2. Wait for AI processing
3. Look for **purple badges** with lightbulb icons on findings

### 6.2 View Mechanism Explainer

1. Click any **purple mechanism badge** (e.g., "Mitochondrial Dysfunction")
2. Modal should open with:

**Plain Language Section (Always Visible):**
- ✅ "What is it?" - Simple 1-2 sentence definition
- ✅ "How does it work?" - 3-4 sentences with analogies
- ✅ "Why does it matter for ME/CFS?" - 2-3 sentences on relevance
- ✅ Reading level indicator (should show ≤ Grade 10)

**Technical Details Section (Collapsed by Default):**
- Click "Show technical details" to expand
- ✅ Biochemical process description
- ✅ Evidence from research papers (bullet list)
- ✅ Uncertainties and debates section

**Supporting Papers:**
- ✅ List of papers used to generate explainer
- ✅ Formatted citations with links

### 6.3 Test Readability

Read the plain language explanation out loud:
- ✅ Should be understandable without medical training
- ✅ No unexplained jargon
- ✅ Uses everyday analogies (e.g., "like a car engine running out of fuel")
- ✅ Short sentences

### 6.4 Test Caching

1. Close the explainer modal
2. Click the same mechanism badge again
3. Should open **instantly** (no loading) - it's cached!

---

## Test 7: Export Functionality (NEW!)

### 7.1 Export as Markdown (Doctor Version)

1. On question detail page, look for **"Export"** button (top right)
2. Click to open export menu
3. Select **"Markdown (Doctor)"**
4. File should download: `research-summary-[timestamp].md`
5. Open the `.md` file in a text editor

**Verify Contents:**
- ✅ Professional medical language
- ✅ Full citations in APA format
- ✅ Evidence strength indicators (weak/moderate/strong)
- ✅ Clinical relevance section
- ✅ Contradictions highlighted with ⚠️
- ✅ Mechanism explanations included
- ✅ Conservative language throughout

### 7.2 Export as Markdown (Plain Language)

1. Click **"Export"** again
2. Select **"Markdown (Plain Language)"**
3. Open downloaded file

**Verify:**
- ✅ Simpler language than doctor version
- ✅ Technical terms explained
- ✅ Still includes citations
- ✅ Patient-friendly tone

---

## Test 8: Edge Cases & Error Handling

### 8.1 No Papers in Collection

1. Delete all papers (or use fresh database)
2. Try to ask a question
3. Should show friendly message: "No papers in your collection yet"

### 8.2 API Key Removed

1. Remove `VITE_ANTHROPIC_API_KEY` from `.env`
2. Restart dev server
3. Go to Questions page
4. Should show **yellow warning banner**
5. Try to ask question
6. Should gracefully fail with: "Claude API not configured. Using placeholder responses."

### 8.3 Network Failure

1. Disconnect internet
2. Try to ask a question
3. Should show error message
4. Reconnect and retry

### 8.4 Very Long Question

1. Ask a question with 500+ characters
2. Should handle gracefully (no character limit)
3. Processing may take longer

---

## Test 9: Mobile Responsiveness (Quick Check)

1. Resize browser window to mobile size (375px width)
2. Navigate through:
   - Papers list
   - Question detail page
   - Mechanism explainer modal
   - Export menu
3. Verify:
   - ✅ No horizontal scroll
   - ✅ Buttons are tappable (not too small)
   - ✅ Text is readable
   - ✅ Modal fits screen

---

## Test 10: Performance

### 10.1 Large Dataset

1. Add 20+ papers to collection
2. Ask a broad question
3. Should complete in < 60 seconds
4. UI should remain responsive during processing

### 10.2 Multiple Questions

1. Ask 3-5 questions in succession
2. Verify each processes correctly
3. No memory leaks or slowdown
4. Question list displays all questions

---

## Known Mechanisms to Test

Try questions with these mechanisms to test auto-detection:

- Mitochondrial dysfunction
- Oxidative stress
- Immune dysregulation / immune dysfunction
- Neuroinflammation
- Metabolic impairment
- Autonomic dysfunction
- Viral reactivation
- Chronic inflammation
- Energy metabolism
- Cellular respiration
- ATP production
- Cytokine production

---

## Expected Conservative Language Examples

### ✅ GOOD (Conservative):
- "The evidence *suggests* that..."
- "Some studies *indicate* a possible link..."
- "*May contribute* to symptom severity..."
- "Research *shows* a correlation between..."
- "*Appears to* affect mitochondrial function..."

### ❌ BAD (Too Definitive):
- "This *proves* that..."
- "The cause *is definitely*..."
- "*All* ME/CFS patients have..."
- "This *confirms* the mechanism..."
- "Research *establishes* a causal relationship..."

---

## Reporting Issues

If you find problems:

1. **Check browser console** (F12 → Console tab)
2. **Note the error message**
3. **Document steps to reproduce**
4. **Screenshot if UI issue**

Common issues:
- TypeScript errors → Need to fix types
- API failures → Check key and credits
- UI bugs → Check responsive design
- Conservative language violations → Update prompts

---

## Success Metrics

### Phase 2 Complete:
- ✅ Can add notes to findings
- ✅ Citations format correctly (APA)
- ✅ Copy to clipboard works
- ✅ Loading states are smooth

### Phase 3 (70% Complete):
- ✅ Mechanism explainers generate
- ✅ Plain language is readable
- ✅ Progressive disclosure works
- ✅ Auto-detection finds mechanisms
- ✅ Export to Markdown works

---

**Next**: Once manual testing is complete, we can move to Phase 3 completion (enhanced search) and Phase 4 (automation).

