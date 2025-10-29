# ✅ Fixed JSON Parsing Error

## The Problem
Claude Haiku was returning JSON **wrapped in explanatory text**:

```
After carefully reviewing the abstract, I'll extract the evidence:

{
  "relevant": true,
  "finding": "..."
}

Key conservative notes:
- Used "may have" to reflect tentative finding
```

The parser expected **pure JSON only**.

---

## The Solution

### 1. **Smarter JSON Extraction** (claude.ts)
Now tries 4 strategies in order:
1. Extract from ```json code blocks
2. Extract from ``` code blocks
3. **Find first valid JSON object** (new! handles embedded JSON)
4. Parse entire response as JSON

### 2. **Explicit Prompt Instructions** (EvidenceExtractor.ts)
Updated prompt to be crystal clear:
```
Output ONLY valid JSON (no explanations, no markdown, no additional text)
...
IMPORTANT: Return ONLY the JSON object above. 
Do not include any explanatory text before or after the JSON.
```

---

## What This Fixes

**Before:**
```
❌ Failed to extract evidence: Claude returned invalid JSON
```

**After:**
```
✅ Extracting evidence from: paper title
✅ Question: What immune abnormalities...
✅ {relevant: true, finding: "...", confidence: 0.7}
```

---

## Test It Now

1. **Hard refresh browser**: Cmd+Shift+R (clears cache)
2. Try the refresh button again
3. Should now successfully extract from all 32 papers

---

## Technical Details

The JSON extraction now uses brace-matching to find the complete JSON object even when surrounded by text:

```typescript
// Find the matching closing brace for the first opening brace
let depth = 0;
for (let i = 0; i < jsonStr.length; i++) {
  if (jsonStr[i] === '{') depth++;
  if (jsonStr[i] === '}') {
    depth--;
    if (depth === 0) {
      // Found complete JSON object
      break;
    }
  }
}
```

This handles Claude's tendency to add helpful context around the JSON response.

---

**Hard refresh (Cmd+Shift+R) and try again!** 🚀

