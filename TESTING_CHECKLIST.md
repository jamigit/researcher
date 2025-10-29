# ✅ Testing Checklist - ME/CFS Research Tracker

## Pre-Testing Setup

- [ ] Both servers running: `npm run dev:all`
- [ ] Proxy: http://localhost:3001/health returns `{"status":"ok"}`
- [ ] Vite: http://localhost:5173 loads
- [ ] Database cleared (use clear-db.html or DevTools)

---

## 1️⃣ Basic Functionality Tests

### Papers Management
- [ ] **Papers page loads** and shows 32 papers
- [ ] **Paper detail view** opens when clicking a paper
- [ ] **Add paper manually** works (test with DOI: `10.1128/CDLI.9.4.747-752.2002`)
- [ ] **Search papers** filters results
- [ ] **Sort papers** by date/title works
- [ ] **Tags and categories** can be added/removed

### Navigation
- [ ] **Mobile navigation** (< 768px) shows bottom bar
- [ ] **Tablet navigation** (768px-1024px) shows sidebar
- [ ] **Desktop navigation** (> 1024px) shows sidebar
- [ ] All navigation links work
- [ ] Active page is highlighted

---

## 2️⃣ Question & Answer System

### Ask a Question
- [ ] Navigate to Questions page
- [ ] Click "Ask a Research Question"
- [ ] Enter: "What immune abnormalities are found in ME/CFS?"
- [ ] Click "Ask Question"
- [ ] **Expected**: Processing indicators show
- [ ] **Expected**: Takes ~30-60 seconds
- [ ] **Expected**: Question appears with findings

### Verify Results
- [ ] Question shows status (answered/partial/unanswered)
- [ ] Findings are displayed with:
  - [ ] Conservative language (suggests, may, appears to)
  - [ ] Citations with paper titles
  - [ ] Confidence scores
  - [ ] Study types
- [ ] Can click citations to view papers
- [ ] Can add notes to findings

### Contradictions
- [ ] Yellow warning appears if contradictions detected
- [ ] Can expand contradiction details
- [ ] Shows conflicting findings
- [ ] Explains discrepancies

---

## 3️⃣ Question Refresh & Versioning

### Test Refresh
- [ ] Open existing question
- [ ] Add notes to 2-3 findings
- [ ] Click "Refresh Answer" button
- [ ] **Expected**: "Regenerating..." shows
- [ ] **Expected**: Takes ~30-60 seconds

### Verify After Refresh
- [ ] Notes are still attached to matching findings
- [ ] Orphaned notes (if any) show in blue box
- [ ] Version number increased (v1 → v2)
- [ ] "Version History" tab shows 2 versions

### Papers Contribution View
- [ ] Switch to "All Papers" tab
- [ ] See all 32 papers listed
- [ ] Papers show "Used" or "Not Used" badge
- [ ] Can click to see paper details

### Version Timeline
- [ ] Switch to "Version History" tab
- [ ] See timeline of versions
- [ ] Select 2 versions to compare
- [ ] Side-by-side comparison shows differences

---

## 4️⃣ Mechanism Explainers

### Create Explainer
- [ ] Navigate to Mechanism Explainers page
- [ ] Click "Create New Explainer"
- [ ] Enter mechanism: "mitochondrial dysfunction"
- [ ] Click "Generate Explanation"
- [ ] **Expected**: Both plain and technical explanations generate

### Verify Explainer
- [ ] Plain language explanation is readable
- [ ] Technical explanation has detail
- [ ] Related papers are linked
- [ ] Can edit and save changes
- [ ] Can delete explainer

---

## 5️⃣ Export Functionality

### Test Exports
- [ ] Open a question with findings
- [ ] Click export button
- [ ] Select "Doctor Summary"
- [ ] **Expected**: Markdown file downloads
- [ ] Open file and verify:
  - [ ] Proper markdown formatting
  - [ ] All findings included
  - [ ] Citations formatted correctly
  - [ ] Conservative language maintained

- [ ] Export "Patient Summary"
- [ ] **Expected**: Simpler language, more context

---

## 6️⃣ Enhanced Search

### Test Search
- [ ] Use search bar in header
- [ ] Search for: "immune"
- [ ] **Expected**: Results from:
  - [ ] Papers (titles, abstracts)
  - [ ] Questions (question text)
  - [ ] Findings (finding text)

### Verify Search Results
- [ ] Results show source type (paper/question/finding)
- [ ] Clicking result navigates to correct page
- [ ] Search highlights matched terms
- [ ] Can filter by source type

---

## 7️⃣ Edge Cases & Error Handling

### No Papers
- [ ] Clear database completely
- [ ] Try asking question
- [ ] **Expected**: "No papers found" message

### API Failure
- [ ] Stop proxy server
- [ ] Try asking question
- [ ] **Expected**: Error message, not crash
- [ ] Restart proxy
- [ ] Retry should work

### Large Question
- [ ] Ask very long question (200+ words)
- [ ] **Expected**: Handled gracefully

### Invalid DOI
- [ ] Try adding paper with DOI: "invalid"
- [ ] **Expected**: Error message shown

---

## 8️⃣ Performance Tests

### Load Time
- [ ] Measure initial page load
- [ ] **Target**: < 2 seconds
- [ ] **Current**: ?

### Question Processing
- [ ] Time question answering with 32 papers
- [ ] **Expected**: 30-60 seconds
- [ ] **Current**: ?

### Database Operations
- [ ] Add 100+ papers (stress test)
- [ ] Search with 100+ papers
- [ ] **Expected**: No lag

---

## 9️⃣ Browser Compatibility

### Desktop Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Mobile Browsers
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

### Features to Check
- [ ] IndexedDB works
- [ ] Service Worker registers
- [ ] Responsive layout adapts
- [ ] Touch interactions work

---

## 🔟 Accessibility

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Esc closes modals
- [ ] Focus indicators visible

### Screen Reader
- [ ] Headings are logical
- [ ] Form labels present
- [ ] Error messages announced
- [ ] Loading states announced

### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Links distinguishable
- [ ] Status indicators clear

---

## 🐛 Bug Report Template

When you find a bug, document:

```markdown
## Bug: [Short Description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Console Errors:**


**Environment:**
- Browser: 
- OS: 
- Version: 

**Severity:** Critical / High / Medium / Low

**Status:** New / In Progress / Fixed
```

---

## ✅ Test Completion Checklist

### Must Pass (Critical)
- [ ] Papers load automatically
- [ ] Can ask questions
- [ ] Findings generate with citations
- [ ] Can add notes
- [ ] Export works
- [ ] No data loss on refresh

### Should Pass (Important)
- [ ] Question refresh preserves notes
- [ ] Version history works
- [ ] Search returns results
- [ ] Contradictions detected
- [ ] Mechanism explainers generate

### Nice to Have (Enhancement)
- [ ] Fast performance (< 30s questions)
- [ ] Mobile optimized
- [ ] Keyboard shortcuts work
- [ ] PWA installable

---

## 📝 Test Results Log

Date: _______________
Tester: _______________

| Test Category | Pass | Fail | Notes |
|---------------|------|------|-------|
| Papers Management | ☐ | ☐ | |
| Q&A System | ☐ | ☐ | |
| Question Refresh | ☐ | ☐ | |
| Mechanism Explainers | ☐ | ☐ | |
| Export | ☐ | ☐ | |
| Search | ☐ | ☐ | |
| Error Handling | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Browser Compat | ☐ | ☐ | |
| Accessibility | ☐ | ☐ | |

**Overall Status:** Pass / Fail / Partial

**Critical Issues Found:**
1. 
2. 
3. 

**Next Steps:**
- 
- 
- 

---

Last Updated: October 29, 2024

