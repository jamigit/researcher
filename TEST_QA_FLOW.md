# 🧪 Test Q&A Flow - Debugging Guide

## Check 1: Verify Papers Are Loaded

Open browser console and run:
```javascript
(async () => {
  const { db } = await import('/src/services/db.js');
  const count = await db.papers.count();
  console.log(`📚 Papers in database: ${count}`);
  
  if (count === 0) {
    console.error('❌ No papers! Reload seed data.');
  } else if (count < 32) {
    console.warn(`⚠️ Only ${count} papers. Expected 32. Refresh page to reload.`);
  } else {
    console.log('✅ Papers loaded correctly!');
  }
})();
```

**Expected:** `📚 Papers in database: 32`

---

## Check 2: Verify Proxy is Running

In terminal:
```bash
curl http://localhost:3001/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

If not running:
```bash
pkill -f "vite|node"
npm run dev:all
```

---

## Check 3: Test Claude API Connection

Open browser console and run:
```javascript
(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say "hello"' }],
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Claude API working!', data);
    } else {
      const error = await response.json();
      console.error('❌ Claude API error:', error);
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
})();
```

**Expected:** `✅ Claude API working!`

---

## Check 4: Test Evidence Extraction

Open browser console and run:
```javascript
(async () => {
  // Load a paper
  const { db } = await import('/src/services/db.js');
  const paper = await db.papers.limit(1).first();
  
  if (!paper) {
    console.error('❌ No papers in database!');
    return;
  }
  
  console.log('Testing with paper:', paper.title);
  
  // Test extraction
  const { extractEvidence } = await import('/src/tools/EvidenceExtractor.js');
  const result = await extractEvidence(paper, 'What are the main symptoms of ME/CFS?');
  
  console.log('Extraction result:', result);
  
  if (result && result.relevant) {
    console.log('✅ Evidence extraction working!');
    console.log('Finding:', result.finding);
  } else if (result && !result.relevant) {
    console.log('ℹ️ Paper not relevant to question (this is normal)');
  } else {
    console.error('❌ Extraction failed');
  }
})();
```

---

## Check 5: Test Full Q&A Workflow

1. **Navigate to Questions page** (http://localhost:5173/questions)
2. **Open DevTools Console** (F12)
3. **Type a question**: "What are the main symptoms of ME/CFS?"
4. **Click "Ask Question"**
5. **Watch the console output**

### Expected Console Output:
```
Searching for papers matching: what are the main symptoms of me/cfs
Found X papers matching question keywords
Extracting evidence from: [paper title]
Question: What are the main symptoms of ME/CFS?
Extraction result: { relevant: true, confidence: 0.8, ... }
[Repeat for each paper]
Checking for contradictions...
Question created with X findings
```

### Common Issues:

#### Issue: "Claude API not configured"
**Cause:** API key not being read
**Fix:**
```bash
# Check .env file
cat .env | grep VITE_ANTHROPIC_API_KEY

# Restart servers
pkill -f "vite|node"
npm run dev:all
```

#### Issue: "Connection error" or CORS
**Cause:** Proxy server not running
**Fix:**
```bash
# Check if proxy is running
curl http://localhost:3001/health

# Restart
npm run dev:all
```

#### Issue: "Found 0 papers matching question keywords"
**Cause:** Papers not loaded or keyword mismatch
**Fix:**
```javascript
// Check papers
(async () => {
  const { db } = await import('/src/services/db.js');
  const papers = await db.papers.limit(3).toArray();
  console.log('Sample papers:', papers.map(p => ({ 
    title: p.title, 
    abstract: p.abstract?.substring(0, 100) 
  })));
})();
```

#### Issue: No findings generated (relevant: false for all)
**Cause:** Papers don't match question OR extraction is working but papers aren't relevant
**Try different questions:**
- "What immune abnormalities are found in ME/CFS?"
- "What are the characteristics of post-exertional malaise?"
- "What cytokine changes are observed in chronic fatigue?"

---

## Quick Diagnostic Script

Run this in browser console for full diagnostic:
```javascript
(async () => {
  console.log('🔍 Running Q&A Diagnostics...\n');
  
  // 1. Papers
  const { db } = await import('/src/services/db.js');
  const paperCount = await db.papers.count();
  console.log(`📚 Papers: ${paperCount} ${paperCount === 32 ? '✅' : '⚠️'}`);
  
  // 2. Proxy
  try {
    const proxyCheck = await fetch('http://localhost:3001/health');
    console.log(`🔌 Proxy: ${proxyCheck.ok ? '✅ Running' : '❌ Error'}`);
  } catch {
    console.log('🔌 Proxy: ❌ Not running');
  }
  
  // 3. Claude config
  const { isClaudeConfigured } = await import('/src/lib/claude.js');
  console.log(`🤖 Claude: ${isClaudeConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  
  // 4. Test extraction (if all good)
  if (paperCount > 0 && isClaudeConfigured()) {
    console.log('\n🧪 Testing extraction with first paper...');
    const paper = await db.papers.limit(1).first();
    const { extractEvidence } = await import('/src/tools/EvidenceExtractor.js');
    const result = await extractEvidence(paper, 'What are symptoms?');
    console.log(`🔬 Extraction: ${result ? '✅ Working' : '❌ Failed'}`);
  }
  
  console.log('\n✅ Diagnostics complete!');
})();
```

---

## If All Checks Pass But Still Not Working

1. **Clear browser cache**: DevTools → Application → Clear storage
2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Restart everything**:
   ```bash
   pkill -f "vite|node"
   npm run dev:all
   ```
4. **Check for JavaScript errors** in console (red errors)

---

## Next Steps After Fixing

Once working, try these questions:
- "What are the main symptoms of ME/CFS?"
- "What immune abnormalities have been found?"
- "Is there evidence for mitochondrial dysfunction?"
- "What treatments have been studied?"

Each should:
- Search through your 32 papers
- Extract relevant findings
- Show citations
- Detect contradictions (if any)
- Display with conservative language

