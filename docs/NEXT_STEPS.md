# Next Steps - Phase 2 Q&A System

## Immediate Actions (Next Session)

### 1. Create Questions Page (30-60 minutes)

Create `src/pages/Questions.tsx`:

```typescript
import { QuestionList } from '@/components/questions/QuestionList';
import { AddQuestionForm } from '@/components/questions/AddQuestionForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';

export const Questions = () => {
  const questions = useLiveQuery(() => db.questions.toArray()) || [];
  const [showAddForm, setShowAddForm] = useState(false);
  
  return showAddForm ? (
    <AddQuestionForm 
      onQuestionAdded={() => setShowAddForm(false)}
      onCancel={() => setShowAddForm(false)}
    />
  ) : (
    <QuestionList 
      questions={questions}
      onAddQuestion={() => setShowAddForm(true)}
      onQuestionClick={(q) => navigate(`/questions/${q.id}`)}
    />
  );
};
```

### 2. Add Navigation Links (10 minutes)

Update `src/components/layout/Navigation.tsx`:
- Add "Questions" link to main nav
- Make it prominent (this is the new main feature)

### 3. Claude API Integration (2-3 hours)

Create `src/lib/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });
  
  return message.content[0].text;
}
```

Then update `EvidenceExtractor.ts`:
- Replace mock extraction with real Claude API calls
- Parse JSON responses
- Validate conservative language in responses

### 4. Test End-to-End Workflow (1-2 hours)

**Test Scenario 1: Basic Q&A**
1. Start dev server: `npm run dev`
2. Add 3-5 papers on a specific topic
3. Ask a question about that topic
4. Verify evidence extraction works
5. Check conservative language in synthesis

**Test Scenario 2: Contradiction Detection**
1. Add papers with conflicting results
2. Ask question that triggers both
3. Verify yellow warning box appears
4. Check side-by-side comparison
5. Validate conservative interpretation

---

## Week 4 Remaining Tasks

### Day 24-25: Contradiction Integration

**Tasks**:
1. Integrate `detectContradictions()` into question answering workflow
2. Auto-detect contradictions when new findings added
3. Store contradictions in database
4. Test with known contradictory papers

**Test Papers** (Find contradictions):
- PEM mechanism papers (different proposed mechanisms)
- Biomarker papers (conflicting results)
- Treatment papers (varying efficacy)

### Day 26-27: Polish & Features

**Notes Functionality**:
1. Add note input to QuestionDetail
2. Store notes in database
3. Display notes with timestamp
4. Support markdown formatting

**Citation Improvements**:
1. Link paper citations to PaperDetail view
2. Add hover preview for paper info
3. Format citations consistently
4. Add copy citation button

**Search Enhancement**:
1. Add search to QuestionList
2. Filter by keywords in question text
3. Highlight search terms
4. Sort by relevance

### Day 28: Checkpoint Evaluation

**Test Questions** (Use real ME/CFS questions):
1. "What causes post-exertional malaise?"
2. "What biomarkers are associated with ME/CFS?"
3. "What is the role of mitochondrial dysfunction?"

**Evaluation Criteria**:
- [ ] All 3 questions get answers?
- [ ] Conservative language 100% compliant?
- [ ] Contradictions detected if present?
- [ ] Yellow warning boxes prominent?
- [ ] System helpful for research?

---

## API Keys Needed

Create `.env` file:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_NCBI_EMAIL=your@email.com
VITE_NCBI_API_KEY=xxx  # Optional
```

Get Anthropic API key: https://console.anthropic.com/

---

## Development Commands

```bash
# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (will have PWA warning, ignore)
npm run build

# Preview production
npm run preview
```

---

## Quick Wins to Try

1. **Ask your first question** through the UI
2. **See the yellow warning box** with test data
3. **Test conservative language** validation with banned phrases
4. **Add real papers** from your research
5. **Iterate on prompts** for better extraction

---

## If Issues Arise

**Conservative Language Failing**:
- Check `CONSERVATIVE_RULES` in EvidenceExtractor
- Add more banned phrases as needed
- Test with `validateConservativeLanguage()`

**Contradiction Not Detected**:
- Check semantic similarity threshold (currently 0.6)
- Verify `checkResultConflict()` catches opposing terms
- Add more opposing pairs if needed

**UI Issues**:
- Check Tailwind classes compile
- Verify Button variants defined
- Test responsive breakpoints

---

## Phase 2 Success Criteria

By end of Week 4, you should be able to:

1. ✅ Ask a research question via UI
2. ✅ See evidence extracted from your papers
3. ✅ View contradiction warnings prominently
4. ✅ Read conservative interpretations
5. ✅ Use system for actual ME/CFS research

**If YES to all 5**: Phase 2 is ready to ship! 🚀

---

## Looking Ahead to Phase 3

**Week 5-6: Mechanism Explainers**
- Plain language biology explanations
- Progressive disclosure (simple → technical)
- Export for doctor visits
- Enhanced search

This will build on Phase 2 foundation you just created!

