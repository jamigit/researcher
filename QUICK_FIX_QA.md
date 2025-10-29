# ⚡ Quick Fix: Q&A Not Working

## Most Common Issues (Check These First)

### 1. ❌ Only 8 Papers Loaded (Not 32)
**Symptom:** Console shows `Database already has 8 papers`

**Fix:** Refresh the browser (Cmd+R)
- The updated code will auto-detect and reload 32 papers

---

### 2. ❌ Proxy Server Not Running
**Symptom:** CORS errors or "Connection error"

**Check:**
```bash
curl http://localhost:3001/health
```

**Fix:**
```bash
pkill -f "vite|node"
npm run dev:all
```

---

### 3. ❌ No Papers Match Question
**Symptom:** "Found 0 papers matching question keywords"

**Why:** Keyword search is basic - needs ME/CFS terms

**Fix:** Try these questions that match your papers:
- "What immune abnormalities are found?"
- "What are CD4 and CD8 cell changes?"
- "What cytokine levels are observed?"
- "What lymphocyte changes occur?"

**Or check what papers you have:**
```javascript
(async () => {
  const { db } = await import('/src/services/db.js');
  const papers = await db.papers.limit(5).toArray();
  console.log('Papers:', papers.map(p => p.title));
})();
```

---

### 4. ❌ API Timeout or Rate Limit
**Symptom:** Long processing then error

**Fix:** The workflow processes papers sequentially which can be slow.

**Workaround for testing:** Add fewer papers initially or ask more specific questions.

---

## Step-by-Step Debugging

### Step 1: Verify Everything Is Running

```bash
# Terminal: Check both servers
curl http://localhost:3001/health    # Should return {"status":"ok"}
curl http://localhost:5173           # Should return HTML
```

### Step 2: Check Papers in Browser

Open http://localhost:5173 → Console (F12):
```javascript
(async () => {
  const { db } = await import('/src/services/db.js');
  console.log('Papers:', await db.papers.count());
})();
```

Should show: `Papers: 32`

If not 32:
- Refresh browser (Cmd+R) - auto-reload will trigger
- Or manually clear and reload (see FORCE_RELOAD_PAPERS.md)

### Step 3: Test a Simple Question

1. Go to http://localhost:5173/questions
2. Ask: "What immune changes occur?"
3. Watch browser console for:
   ```
   Answering question: What immune changes occur?
   Found X papers matching question keywords
   Extracting evidence from: [paper title]
   ```

---

## Expected Behavior

### Normal Flow:
1. User asks question
2. App searches papers by keywords
3. For each relevant paper:
   - Calls Claude API via proxy
   - Extracts findings
4. Detects contradictions
5. Shows answer with citations

### Expected Time:
- **32 papers**: ~30-60 seconds (1-2 sec per paper)
- **Progress shows**: "Extracting evidence..."

---

## If Still Not Working

### Run Full Diagnostic:
```
http://localhost:5173/test-qa.html
```

Click "Run All Tests" and **screenshot the results** - this will show exactly what's broken.

### Or paste console output showing:
- What you typed as question
- Full console logs
- Any red errors

---

## Quick Test Question

Copy/paste this exact question (known to work with ME/CFS papers):

```
What are the CD4 and CD8 T cell abnormalities observed in chronic fatigue syndrome?
```

This should:
- Match multiple papers (they discuss immune cells)
- Extract relevant findings
- Show citations
- Complete in ~30-60 seconds

If this doesn't work, something is broken in the workflow.

