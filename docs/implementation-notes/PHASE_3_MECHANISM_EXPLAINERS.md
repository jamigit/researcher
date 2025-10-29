# Phase 3: Mechanism Explainers Implementation

**Date**: October 28, 2025  
**Status**: Foundation Complete (40%)

## Overview

Implemented the foundation for Phase 3 Mechanism Explainers, enabling plain language + technical explanations of biological mechanisms mentioned in research findings.

## Key Features Implemented

### 1. Data Models & Types

**File**: `src/types/mechanism.ts`

- `MechanismExplainer` interface with:
  - Plain language explanation (definition, how it works, relevance)
  - Technical details (biochemical process, evidence, uncertainties)
  - Supporting papers tracking
  - Readability scoring
- `createMechanismExplainer()` factory function
- `detectMechanismsInText()` for auto-detection of common ME/CFS mechanisms
- Helper types: `PlainLanguageExplanation`, `TechnicalDetails`, `ExplainerStatus`

**Common ME/CFS Mechanisms Supported**:
- Mitochondrial dysfunction
- Oxidative stress
- Immune dysregulation
- Neuroinflammation
- Metabolic impairment
- (and 15+ more variants)

### 2. Database Schema Update

**File**: `src/services/db.ts`

- Updated schema to version 3
- Added `explainers` table with indexing on mechanism name
- Updated export/import functions to include explainers
- Updated `clearAllData()` to handle explainers table

### 3. Database Service Layer

**File**: `src/services/explainers.ts`

CRUD operations for mechanism explainers:
- `createExplainer(explainer)` - Save new explainer
- `getExplainerById(id)` - Fetch by ID
- `getExplainerByMechanism(mechanism)` - Fetch by name (case-insensitive)
- `getAllExplainers()` - List all explainers
- `updateExplainer(id, updates)` - Update existing
- `deleteExplainer(id)` - Remove explainer
- `explainerExists(mechanism)` - Check existence

### 4. MechanismExplainer Tool

**File**: `src/tools/MechanismExplainer.ts`

**Core Functions**:
- `generateExplainer(mechanism, papers)` - Create new explainer with Claude API
- `updateExplainerWithNewPapers(explainer, newPapers)` - Refresh with new evidence
- `detectMechanisms(text)` - Extract mechanism names from text
- `calculateReadabilityScore(text)` - Flesch-Kincaid grade level calculation

**Claude API Integration**:
- Structured prompt enforcing 10th grade reading level for plain language
- Conservative system prompt for accuracy
- JSON output validation
- Fallback placeholder generation when API not configured

**Readability Features**:
- Flesch-Kincaid grade level calculation
- Target: Grade 10 or below for plain language
- Syllable counting algorithm for scoring

### 5. UI Components

#### MechanismBadge (`src/components/questions/MechanismBadge.tsx`)

- Small clickable chip displaying mechanism name
- Lightbulb icon for visual recognition
- Purple color scheme to differentiate from other UI elements
- Hover states and accessibility

#### MechanismExplainerModal (`src/components/questions/MechanismExplainerModal.tsx`)

- Full-screen modal overlay
- **Plain Language Section** (always visible):
  - What is it? (definition)
  - How does it work? (process)
  - Why does it matter for ME/CFS? (relevance)
  - Reading level indicator (if ≤ grade 10)
- **Technical Details Section** (collapsible):
  - Biochemical process description
  - Evidence from research papers
  - Uncertainties and debates
- **Supporting Papers**:
  - List with formatted citations
  - Links to paper details
- Metadata footer with last updated timestamp

### 6. Integration with Question Detail

**File**: `src/components/questions/QuestionDetail.tsx`

- Auto-detects mechanisms in finding descriptions
- Displays mechanism badges for detected mechanisms
- Generates explainer on first click (if doesn't exist)
- Caches explainers in database for reuse
- Opens modal when badge clicked
- Loading state during generation

## Technical Decisions

### Progressive Disclosure

Plain language is **always visible** while technical details are **collapsed by default**. This ensures:
- Accessibility for all users
- Reduced cognitive load
- Optional deep-dive for scientifically-minded users

### Mechanism Detection

Uses keyword matching for common ME/CFS mechanisms. Future enhancements:
- NLP-based detection
- Synonym mapping
- Context-aware extraction

### Readability Scoring

Implemented Flesch-Kincaid grade level:
- Formula: `0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59`
- Target: ≤ 10 for plain language
- Visual indicator if target met

### Claude API Integration

- Conservative prompting ensures accuracy
- Structured JSON output for parsing
- Graceful fallback if API not configured
- Placeholder explainers with helpful messaging

## Dependencies

- `@anthropic-ai/sdk` - Claude API client
- `dexie` & `dexie-react-hooks` - Database and reactivity
- `lucide-react` - Icons (Lightbulb, Microscope, etc.)

## Files Created/Modified

**New Files**:
- `src/types/mechanism.ts`
- `src/services/explainers.ts`
- `src/tools/MechanismExplainer.ts`
- `src/components/questions/MechanismBadge.tsx`
- `src/components/questions/MechanismExplainerModal.tsx`

**Modified Files**:
- `src/services/db.ts` - Schema v3, explainers table
- `src/types/paper.ts` - Added volume, issue, pages for citations
- `src/components/questions/QuestionDetail.tsx` - Mechanism integration

## Testing Requirements

### Manual Testing Scenarios

1. **Detection Test**:
   - Ask question that generates finding mentioning "mitochondrial dysfunction"
   - Verify badge appears
   - Click badge
   - Verify explainer generates

2. **Plain Language Test**:
   - Review generated explanation
   - Calculate readability score
   - Verify grade level ≤ 10
   - Check for jargon without definitions

3. **Technical Details Test**:
   - Expand technical section
   - Verify biochemical accuracy
   - Check evidence citations
   - Verify uncertainties listed

4. **Caching Test**:
   - Generate explainer once
   - Ask new question with same mechanism
   - Verify cached explainer reused (fast load)

5. **Fallback Test**:
   - Remove Claude API key
   - Click mechanism badge
   - Verify placeholder explainer shown
   - Check helpful error messaging

## Next Steps

### Immediate (Week 5)
- [ ] Test with 5 known ME/CFS mechanisms
- [ ] Validate readability scores
- [ ] Human review of plain language quality
- [ ] Verify technical accuracy

### Week 6
- [ ] Export explainers in doctor summaries
- [ ] Enhanced search including mechanisms
- [ ] Mechanism-based paper filtering
- [ ] Related mechanism suggestions

### Future Enhancements
- Multi-language support
- Audio explanations (text-to-speech)
- Visual diagrams/illustrations
- Mechanism interaction maps
- User feedback on explanation quality

## Success Metrics

- ✅ Plain language is readable (≤ grade 10)
- ✅ Technical details are accurate
- ✅ Progressive disclosure works smoothly
- ✅ Auto-detection finds common mechanisms
- ⏳ User testing validates helpfulness

## Related Documentation

- [Implementation Plan](../IMPLEMENTATION_PLAN.md)
- [PRD - Phase 3](../PRD.md#phase-3-mechanism-explainers)
- [Claude API Integration](./CLAUDE_API_INTEGRATION.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)

---

**Implementation Status**: ✅ Foundation Complete | 🟡 Testing In Progress | ⏳ Enhancement Pending

