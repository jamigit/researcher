# Next Steps - Phase 2 Q&A System

**Last Updated**: October 28, 2025  
**Current Status**: Phase 2 core implementation complete (85%), testing phase starting

---

## ✅ Recently Completed (October 28, 2025)

### 1. Questions Page ✅
- Created `src/pages/QuestionsPage.tsx` with full functionality
- QuestionList component with navigation
- AddQuestionForm component with workflow
- Claude API status banner integration

### 2. Navigation Links ✅
- Updated `src/components/layout/Navigation.tsx`
- Added "Questions" link to main navigation
- Added quick action button on Dashboard

### 3. Claude API Integration ✅
- Created `src/lib/claude.ts` with full client
- Integrated EvidenceExtractor with real Claude API
- Integrated ContradictionDetector with real Claude API
- Conservative language enforcement via system prompt
- Graceful degradation when API not configured
- Comprehensive error handling

### 4. Documentation ✅
- Created `docs/guides/ENVIRONMENT_SETUP.md`
- Created `docs/implementation-notes/CLAUDE_API_INTEGRATION.md`
- Created `docs/implementation-notes/SESSION_2025-10-28.md`
- Updated `README.md` with setup instructions
- Updated `STATUS.md` with progress

---

## 🔄 Immediate Actions (Current Session)

### 1. Test End-to-End Q&A Workflow (1-2 hours) 🔴 HIGH PRIORITY

**Prerequisites**:
1. Add Claude API key to `.env`:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   VITE_NCBI_EMAIL=your-email@example.com
   ```
2. Restart dev server: `npm run dev`

**Test Scenario 1: Basic Q&A**
1. Navigate to Papers page
2. Add 3-5 ME/CFS papers on mitochondrial dysfunction:
   - PMID: 36411397 (mitochondrial dysfunction review)
   - PMID: 34234567 (example - use real papers)
   - Or upload PDFs
3. Navigate to Questions page
4. Click "Ask Question"
5. Enter: "What evidence is there for mitochondrial dysfunction in ME/CFS?"
6. Submit and wait for processing
7. **Verify**:
   - Papers are analyzed (check console)
   - Findings extracted
   - Conservative language used
   - Citations included
   - Answer makes sense

**Test Scenario 2: Contradiction Detection**
1. Add papers with potentially conflicting results on a topic
2. Ask question that covers both perspectives
3. **Verify**:
   - Yellow contradiction box appears
   - Majority vs minority views shown
   - Paper counts correct
   - Explanations reasonable
   - Conservative interpretation balanced

**Test Scenario 3: No API Key**
1. Remove `VITE_ANTHROPIC_API_KEY` from `.env`
2. Restart dev server
3. Navigate to Questions page
4. **Verify**:
   - Yellow status banner appears
   - Setup instructions clear
   - Can still create questions
   - Graceful error messages
   - No hard failures

**Test Scenario 4: Error Handling**
1. Use invalid API key
2. Try to ask a question
3. **Verify**:
   - Helpful error message
   - User informed of issue
   - Can recover gracefully

**Success Criteria**:
- [ ] All scenarios pass
- [ ] Conservative language verified
- [ ] No crashes or blocking errors
- [ ] UI responsive and clear
- [ ] Contradictions highly visible (yellow)

---

### 2. Add Notes Capability (2-3 hours) 🟡 MEDIUM PRIORITY

**Goal**: Allow users to annotate findings with their own notes

**Implementation**:

1. **Update Finding interface** (`src/types/finding.ts`):
   ```typescript
   export interface Finding {
     // ... existing fields
     userNotes?: string; // User's personal notes on this finding
     notesLastUpdated?: string; // ISO 8601 timestamp
   }
   ```

2. **Create NotesEditor component** (`src/components/questions/NotesEditor.tsx`):
   ```typescript
   interface NotesEditorProps {
     finding: Finding;
     onSave: (notes: string) => Promise<void>;
   }
   
   export const NotesEditor: React.FC<NotesEditorProps> = ({ finding, onSave }) => {
     // Textarea with save/cancel
     // Auto-save after 3 seconds of inactivity
     // Character count
     // Last updated timestamp
   };
   ```

3. **Update QuestionDetail component**:
   - Add "Add Note" button to each finding
   - Show existing notes if present
   - Allow editing/deleting notes
   - Show last updated timestamp

4. **Update database service** (`src/services/questions.ts`):
   ```typescript
   export async function updateFindingNotes(
     findingId: string,
     notes: string
   ): Promise<void> {
     await db.findings.update(findingId, {
       userNotes: notes,
       notesLastUpdated: new Date().toISOString(),
     });
   }
   ```

**UI/UX Considerations**:
- Notes should be clearly personal (different styling)
- Save automatically (with indicator)
- Show character count (suggest 500 char limit)
- Allow markdown formatting (optional)

**Success Criteria**:
- [ ] Can add notes to any finding
- [ ] Notes persist across sessions
- [ ] Can edit/delete notes
- [ ] Auto-save works reliably
- [ ] UI clear and intuitive

---

### 3. Improve Citation Formatting (1-2 hours) 🟡 MEDIUM PRIORITY

**Goal**: Better display and copying of paper citations

**Implementation**:

1. **Create Citation component** (`src/components/papers/Citation.tsx`):
   ```typescript
   interface CitationProps {
     paper: ResearchPaper;
     format?: 'apa' | 'mla' | 'chicago' | 'vancouver';
     copyable?: boolean;
   }
   
   export const Citation: React.FC<CitationProps> = ({ 
     paper, 
     format = 'apa',
     copyable = true 
   }) => {
     // Format citation according to style
     // Show copy button if copyable
     // Link to paper if URL/DOI available
   };
   ```

2. **Add citation utilities** (`src/utils/citations.ts`):
   ```typescript
   export function formatCitation(
     paper: ResearchPaper,
     style: 'apa' | 'mla' | 'chicago' | 'vancouver'
   ): string {
     switch (style) {
       case 'apa':
         return formatAPA(paper);
       // ... other formats
     }
   }
   
   function formatAPA(paper: ResearchPaper): string {
     // Author, A. A. (Year). Title. Journal, Volume(Issue), Pages. DOI
   }
   ```

3. **Update FindingCard in QuestionDetail**:
   - Show formatted citations for supporting papers
   - Add "Copy Citation" button
   - Show DOI/PMID links
   - Indicate if paper is in user's collection

**Features**:
- Multiple citation formats (start with APA)
- One-click copy to clipboard
- Direct links to papers
- Highlight papers in user's collection

**Success Criteria**:
- [ ] Citations properly formatted (APA)
- [ ] Copy to clipboard works
- [ ] Links to papers work
- [ ] UI clean and professional
- [ ] Easy to cite in other documents

---

## 📋 Short-Term Goals (This Week)

### 4. Conservative Language Evaluation (2-3 hours)

**Goal**: Human evaluation of AI-generated responses

**Process**:
1. Generate 10 answers to real ME/CFS questions
2. Manually review each for:
   - Conservative language (no overstatements)
   - Proper citations (paper counts)
   - Tentative phrasing ("suggests", "may")
   - Honest limitations
3. Document violations
4. Refine prompts if needed
5. Re-test

**Evaluation Criteria**:
- [ ] No banned phrases ("proves", "confirms", etc.)
- [ ] Always cites specific papers
- [ ] Includes sample sizes when relevant
- [ ] Notes limitations explicitly
- [ ] Uses tentative language throughout
- [ ] Never claims causation without evidence

**Target**: 95%+ compliance rate

---

### 5. Performance Benchmarking (1-2 hours)

**Goal**: Measure and optimize system performance

**Metrics to Track**:
1. Evidence extraction time per paper
2. Total question answering time
3. Database query performance
4. UI responsiveness
5. Memory usage
6. API token consumption

**Tools**:
- Browser DevTools Performance tab
- Console timing logs
- Claude API dashboard (token usage)
- Custom performance tracking

**Targets**:
- Question answer: <10 seconds
- Evidence per paper: 2-5 seconds
- Database queries: <50ms
- UI interactions: <100ms

**Success Criteria**:
- [ ] All metrics measured
- [ ] Bottlenecks identified
- [ ] Optimization plan created
- [ ] User experience smooth

---

### 6. Bug Fixes & Polish (1-2 hours)

**Known Issues**:
- None currently identified (will emerge during testing)

**Polish Tasks**:
- [ ] Loading states for API calls
- [ ] Better error messages
- [ ] Empty states (no questions yet)
- [ ] Keyboard shortcuts
- [ ] Mobile responsiveness check
- [ ] Accessibility audit

---

## 🎯 Medium-Term Goals (Next Week)

### 7. Mechanism Explainers (Phase 3 Preview) (3-4 hours)

**Goal**: Generate plain language explanations of biological mechanisms

**When Needed**: When a finding mentions a mechanism (e.g., "mitochondrial dysfunction", "oxidative stress")

**Implementation** (from IMPLEMENTATION_PLAN.md):
1. Detect mechanism mentions in findings
2. Generate two-level explanations:
   - Plain language (10th grade reading level)
   - Technical details (for interested users)
3. Link findings to mechanism explainers
4. Store explainers in database

**See**: `docs/IMPLEMENTATION_PLAN.md` section 2.5 for full spec

---

### 8. Export Functionality (2-3 hours)

**Goal**: Export question summaries for doctor visits

**Formats**:
1. **Markdown** - Plain text, portable
2. **PDF** - Professional, printable
3. **Doctor Summary** - Medical language, concise

**Features**:
- One-click export
- Include citations
- Professional formatting
- HIPAA-compliant language

---

### 9. Enhanced Search (2-3 hours)

**Goal**: Better paper search when answering questions

**Current**: Simple keyword matching  
**Target**: Semantic search with relevance ranking

**Implementation**:
- Use text embeddings for semantic similarity
- Rank papers by relevance to question
- Filter by date, quality, study type
- Sort options (relevance, date, citations)

---

## 🔮 Long-Term Goals (Weeks 5-8)

### Phase 3: Explainers (Weeks 5-6)
- Mechanism explainers (plain + technical)
- Export functionality
- Enhanced search
- UI polish

### Phase 4: Automation (Weeks 7-8)
- Weekly digest email
- Auto-update questions with new papers
- Preference learning
- Production deployment

**See**: `STATUS.md` and `docs/IMPLEMENTATION_PLAN.md` for full roadmap

---

## 📝 Testing Checklist

### Before Moving to Phase 3
- [ ] End-to-end Q&A workflow tested
- [ ] Conservative language validated
- [ ] Contradiction detection verified
- [ ] Notes functionality working
- [ ] Citations properly formatted
- [ ] Performance acceptable
- [ ] No critical bugs
- [ ] Documentation complete

### Phase 2 Completion Criteria
- [ ] Can ask questions and get answers ✅
- [ ] Contradictions detected and displayed ✅
- [ ] Conservative language 95%+ compliant 🔄
- [ ] Answer quality >85% (human eval) 🔄
- [ ] System ready for real research use 🔄

---

## 🔧 Technical Debt to Address

### High Priority
1. **Unit tests for Claude integration** (3-4 hours)
   - Mock API calls
   - Test error handling
   - Test conservative validation

2. **Response caching** (2-3 hours)
   - Cache API responses
   - LRU cache implementation
   - Significant cost savings

### Medium Priority
3. **Semantic similarity** (4-5 hours)
   - Replace word overlap with embeddings
   - Better contradiction detection
   - Improved finding grouping

4. **Rate limiting** (2 hours)
   - Request queue implementation
   - Prevent API abuse
   - Better error handling

---

## 📚 Resources & References

### Documentation
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Full technical plan
- [PRD.md](../PRD.md) - Product requirements
- [STATUS.md](../../STATUS.md) - Current progress
- [ENVIRONMENT_SETUP.md](../guides/ENVIRONMENT_SETUP.md) - Setup guide

### APIs & Services
- [Anthropic Console](https://console.anthropic.com/) - Claude API dashboard
- [Claude API Docs](https://docs.anthropic.com/) - API documentation
- [NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/) - PubMed API

### Testing Resources
- Test papers in `src/test/fixtures/pdfs/`
- Test URLs in `src/test/fixtures/test-urls.json`
- Mock data in `src/test/helpers.ts`

---

## 🚀 Quick Start for Next Session

1. **Set up environment**:
   ```bash
   cd /Users/jamiebarter/Documents/myrepos/researcher
   
   # Add API key to .env (create if doesn't exist)
   echo "VITE_ANTHROPIC_API_KEY=sk-ant-your-key" >> .env
   echo "VITE_NCBI_EMAIL=your@email.com" >> .env
   
   # Start dev server
   npm run dev
   ```

2. **Open in browser**: http://localhost:5173

3. **Test workflow**:
   - Add papers (Papers → Add Paper)
   - Ask question (Questions → Ask Question)
   - Review answer
   - Check conservative language
   - Look for contradictions

4. **Document findings**: Add notes to this file or create new session summary

---

**Priority Order**:
1. 🔴 Test Q&A workflow (CRITICAL)
2. 🟡 Add notes capability
3. 🟡 Improve citations
4. 🟢 Evaluate conservative language
5. 🟢 Performance benchmarking

**Status**: Ready to begin testing phase  
**Blocking Issues**: None (need API key for testing)  
**Estimated Time**: 6-8 hours to complete all immediate actions
