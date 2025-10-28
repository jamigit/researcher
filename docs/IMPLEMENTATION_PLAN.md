# ME/CFS Research System
## Implementation Plan

**Document Type**: Technical Implementation Guide  
**Version**: 1.0  
**Date**: October 28, 2025  
**Last Updated**: October 28, 2025  
**Companion Document**: PRD.md  
**Author**: Jamie Barter

---

## Executive Summary

### Implementation Approach

**Philosophy**: Start simple, add complexity only when metrics prove need

**Architecture Progression**:
1. **Weeks 1-4**: Workflows (deterministic prompt chains)
2. **Weeks 5-6**: Single Agent (if workflow limitations discovered)
3. **Weeks 7-8**: Enhancements (based on metrics)

**Key Principle**: "Great tools + simple workflow > poor tools + complex agents"

### Timeline

**Total Duration**: 8 weeks to production-ready system  
**Checkpoints**: End of each 2-week sprint  
**Deployment**: Gradual (local → self-use → stable)

---

## Part 1: Technical Architecture

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (React + TypeScript + Tailwind)            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Application Layer                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Workflows (Weeks 1-4)                          │   │
│  │  • Paper Ingestion Workflow                     │   │
│  │  • Question Answering Workflow                  │   │
│  │  • Contradiction Detection Workflow             │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Single Agent (Weeks 5-6, if needed)           │   │
│  │  • ReAct pattern                                │   │
│  │  • Tool selection                               │   │
│  │  • Memory integration                           │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Tool Layer                              │
│  ┌─────────────┬──────────────┬────────────────┐       │
│  │PaperFetcher │ Evidence     │ Contradiction  │       │
│  │             │ Extractor    │ Detector       │       │
│  └─────────────┴──────────────┴────────────────┘       │
│  ┌─────────────┬──────────────┬────────────────┐       │
│  │Mechanism    │ Preference   │ Export         │       │
│  │Explainer    │ Learner      │ Generator      │       │
│  └─────────────┴──────────────┴────────────────┘       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│               Service Layer                              │
│  ┌──────────┬─────────────┬──────────────┐             │
│  │ PubMed   │ Claude API  │ Crossref API │             │
│  │ E-utils  │             │              │             │
│  └──────────┴─────────────┴──────────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Data Layer                               │
│          IndexedDB (via Dexie.js)                       │
│  • Papers Table                                         │
│  • Questions Table                                      │
│  • Findings Table                                       │
│  • Contradictions Table                                 │
│  • Notes Table                                          │
│  • Preferences Table                                    │
│  • Explainers Table                                     │
└─────────────────────────────────────────────────────────┘
```

---

### 1.2 Technology Stack

**Frontend**:
- React 18+ (UI components)
- TypeScript 5+ (type safety)
- Vite 5+ (build tool, fast dev)
- Tailwind CSS 3+ (styling)
- React Query 5+ (data fetching, caching)
- React Router 6+ (navigation)

**State Management**:
- Zustand 4+ (global state, simpler than Redux)
- React Query for server state
- Local state for component-specific data

**Data Persistence**:
- IndexedDB via Dexie 4+ (client-side database)
- LocalStorage for preferences (small data)
- Service Worker for caching (PWA)

**AI/LLM**:
- Claude API (Anthropic)
- Model: claude-sonnet-4-5-20250929
- Direct API calls (no framework initially)

**External APIs**:
- PubMed E-utilities (NCBI)
- Crossref API (DOI resolution)
- DOI.org resolver (backup)

**Development Tools**:
- ESLint + Prettier (code quality)
- Vitest (unit testing)
- Playwright (e2e testing)
- Git (version control)

**Deployment**:
- Vercel or Netlify (static hosting)
- GitHub Actions (CI/CD)
- PWA manifest (installable)

---

### 1.3 Data Models

#### Paper Entity
```typescript
interface Paper {
  // Identity
  id: string;                    // UUID
  doi?: string;                  // Digital Object Identifier
  pmid?: string;                 // PubMed ID
  
  // Metadata
  title: string;
  authors: string[];
  publication_date: Date;
  journal?: string;
  abstract: string;
  url: string;
  pdf_url?: string;
  
  // Classification
  study_type: 'RCT' | 'observational' | 'review' | 'case' | 'meta-analysis' | 'other';
  sample_size?: number;
  is_peer_reviewed: boolean;
  
  // Content
  summary: {
    quick: string;               // 2-3 sentences
    standard: string;            // Full summary (5-7 sentences)
    technical?: string;          // Technical details
  };
  
  // Relationships
  answers_questions: string[];   // Question IDs
  supports_findings: string[];   // Finding IDs
  explains_mechanisms: string[]; // Mechanism IDs
  
  // User data
  date_added: Date;
  date_updated: Date;
  is_read: boolean;
  importance: 'low' | 'medium' | 'high';
  user_notes: Note[];
  
  // Quality
  quality_score?: number;        // 0-10
  quality_notes?: string;
}
```

#### Research Question Entity
```typescript
interface ResearchQuestion {
  // Identity
  id: string;
  question: string;
  
  // Status
  status: 'unanswered' | 'partial' | 'answered';
  confidence: number;            // 0-1
  
  // Evidence
  findings: Finding[];
  contradictions: Contradiction[];
  gaps: string[];                // What we don't know
  
  // Metadata
  date_created: Date;
  last_updated: Date;
  paper_count: number;
  
  // User data
  is_priority: boolean;
  user_notes: Note[];
  related_questions: string[];   // Question IDs
}
```

#### Finding Entity
```typescript
interface Finding {
  // Identity
  id: string;
  question_id: string;
  description: string;           // What was found
  
  // Evidence
  supporting_papers: string[];   // Paper IDs
  study_types: string[];
  sample_sizes: number[];
  
  // Quality
  consistency: 'high' | 'medium' | 'low';
  peer_reviewed_count: number;
  preprint_count: number;
  quality_assessment: string;
  
  // Results
  quantitative_result?: string;  // e.g., "ATP reduced 20-40%"
  qualitative_result?: string;
  
  // Contradictions
  has_contradiction: boolean;
  contradicting_papers: string[]; // Paper IDs
  
  // Metadata
  date_created: Date;
  last_updated: Date;
  
  // Mechanism
  mechanism_id?: string;         // Link to explainer
}
```

#### Contradiction Entity
```typescript
interface Contradiction {
  // Identity
  id: string;
  finding_id: string;
  topic: string;
  
  // The conflict
  majority_view: {
    description: string;
    papers: string[];            // Paper IDs
    evidence: string;
    paper_count: number;
  };
  
  minority_view: {
    description: string;
    papers: string[];
    evidence: string;
    paper_count: number;
  };
  
  // Analysis
  methodological_differences: string[];
  possible_explanations: string[];
  severity: 'minor' | 'major';
  
  // Resolution
  status: 'unresolved' | 'explained' | 'ongoing';
  conservative_interpretation: string;
  
  // Metadata
  date_detected: Date;
  last_updated: Date;
  
  // User data
  user_analysis?: string;
  flagged_for_research: boolean;
}
```

#### Mechanism Explainer Entity
```typescript
interface MechanismExplainer {
  // Identity
  id: string;
  name: string;                  // e.g., "Mitochondrial Dysfunction"
  
  // Plain language
  what_is_it: string;
  how_it_works: string;
  why_it_matters: string;
  
  // Technical
  technical_details?: {
    biochemistry: string;
    pathways: string[];
    evidence: string;
  };
  
  // Connections
  related_concepts: string[];    // Other explainer IDs
  supporting_papers: string[];   // Paper IDs
  
  // Metadata
  date_created: Date;
  last_updated: Date;
  
  // User data
  user_notes: Note[];
}
```

#### User Preferences Entity
```typescript
interface UserPreferences {
  // Topics
  relevant_topics: Map<string, number>;    // topic → score (0-1)
  disinterest_topics: Set<string>;
  
  // Style
  preferred_summary_style: 'brief' | 'standard' | 'detailed' | 'technical';
  default_view: 'plain' | 'technical';
  
  // Research focus
  current_research_questions: string[];    // Question IDs
  priority_mechanisms: string[];
  
  // Quality
  min_study_quality: number;               // 0-10
  include_preprints: boolean;
  trusted_journals: Set<string>;
  trusted_authors: Set<string>;
  
  // Behavior
  papers_per_week_target: number;
  digest_frequency: 'weekly' | 'biweekly';
  digest_day: number;                      // 0-6 (Sunday-Saturday)
  
  // Learning data
  feedback_history: Feedback[];
  last_updated: Date;
}
```

#### Note Entity
```typescript
interface Note {
  // Identity
  id: string;
  content: string;
  
  // Context
  attached_to: {
    type: 'question' | 'finding' | 'paper' | 'mechanism' | 'contradiction';
    id: string;
  };
  
  // Classification
  note_type?: 'insight' | 'question' | 'todo' | 'observation';
  tags: string[];
  
  // Metadata
  date_created: Date;
  date_updated?: Date;
}
```

---

## Part 2: Tool Specifications

### 2.1 Tool: PaperFetcher

**Purpose**: Fetch paper metadata from multiple sources with fallbacks

**Priority**: CRITICAL (Week 1)

**Interface**:
```typescript
interface PaperFetcher {
  // Main method
  fetch(input: DOI | PMID | URL): Promise<Paper>;
  
  // Helper methods
  fetchFromPubMed(pmid: string): Promise<Paper>;
  fetchFromCrossref(doi: string): Promise<Paper>;
  fetchFromDOI(doi: string): Promise<Paper>;
  
  // Validation
  validatePaper(paper: Partial<Paper>): boolean;
  
  // Deduplication
  isDuplicate(paper: Paper): Promise<boolean>;
}
```

**Implementation Requirements**:

1. **Multiple Source Support**:
   - Primary: PubMed E-utilities
   - Secondary: Crossref API
   - Tertiary: DOI.org resolver
   - Last resort: Manual entry prompt

2. **Robust Error Handling**:
   ```typescript
   async function fetchWithRetry<T>(
     fn: () => Promise<T>,
     maxRetries: 3,
     baseDelay: 1000
   ): Promise<T> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         
         const delay = baseDelay * Math.pow(2, i);
         await sleep(delay);
         
         logger.warn('Retry attempt', { 
           attempt: i + 1, 
           maxRetries, 
           delay 
         });
       }
     }
     throw new Error('All retries exhausted');
   }
   ```

3. **Validation**:
   ```typescript
   function validatePaper(paper: Partial<Paper>): boolean {
     const required = ['title', 'authors', 'abstract', 'publication_date'];
     
     for (const field of required) {
       if (!paper[field]) {
         logger.error('Missing required field', { field });
         return false;
       }
     }
     
     // Validate data types
     if (typeof paper.title !== 'string' || paper.title.length < 10) {
       return false;
     }
     
     if (!Array.isArray(paper.authors) || paper.authors.length === 0) {
       return false;
     }
     
     // Add more validation...
     
     return true;
   }
   ```

4. **Deduplication**:
   ```typescript
   async function isDuplicate(paper: Paper): Promise<boolean> {
     // Check by DOI
     if (paper.doi) {
       const existing = await db.papers
         .where('doi')
         .equals(paper.doi)
         .first();
       if (existing) return true;
     }
     
     // Check by PMID
     if (paper.pmid) {
       const existing = await db.papers
         .where('pmid')
         .equals(paper.pmid)
         .first();
       if (existing) return true;
     }
     
     // Check by normalized title (fuzzy match)
     const normalizedTitle = normalizeTitle(paper.title);
     const allPapers = await db.papers.toArray();
     
     for (const existing of allPapers) {
       const existingNormalized = normalizeTitle(existing.title);
       const similarity = calculateSimilarity(
         normalizedTitle, 
         existingNormalized
       );
       
       if (similarity > 0.95) {
         logger.info('Potential duplicate by title', {
           new: paper.title,
           existing: existing.title,
           similarity
         });
         return true;
       }
     }
     
     return false;
   }
   ```

5. **Caching**:
   ```typescript
   const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
   
   async function getCached(key: string): Promise<Paper | null> {
     const cached = await db.cache
       .where('key')
       .equals(key)
       .first();
     
     if (!cached) return null;
     
     const age = Date.now() - cached.timestamp;
     if (age > CACHE_DURATION) {
       await db.cache.delete(cached.id);
       return null;
     }
     
     return cached.data;
   }
   ```

**Testing**:
- Test with 10 known papers (various sources)
- Test with invalid inputs (malformed DOI, etc.)
- Test deduplication logic
- Test all fallback paths
- Measure success rate (target: 95%+)

**Success Metrics**:
- Fetch success rate: 95%+
- Average fetch time: < 5 seconds
- Cache hit rate: 60%+ after week 2
- Duplicate prevention: 100%

---

### 2.2 Tool: EvidenceExtractor

**Purpose**: Extract evidence from papers and synthesize conservatively

**Priority**: CRITICAL (Week 2)

**Interface**:
```typescript
interface EvidenceExtractor {
  // Main extraction
  extract(
    paper: Paper, 
    question: ResearchQuestion
  ): Promise<Finding | null>;
  
  // Synthesis
  synthesize(
    findings: Finding[], 
    question: ResearchQuestion
  ): Promise<Synthesis>;
  
  // Validation
  validateConservativeLanguage(text: string): boolean;
}

interface Synthesis {
  summary: string;              // Overall answer to question
  findings: FindingSummary[];
  confidence: number;           // 0-1
  limitations: string[];
  gaps: string[];
}
```

**Implementation Requirements**:

1. **Conservative Synthesis Rules**:
   ```typescript
   const CONSERVATIVE_RULES = {
     minPapersForFinding: 3,
     confidenceThreshold: 0.7,
     
     bannedPhrases: [
       'proves',
       'the consensus',
       'definitely',
       'always',
       'never',
       'all patients',
       'caused by'
     ],
     
     requiredPhrases: [
       'X papers found',
       'suggests',
       'may indicate',
       'appears to',
       'evidence supports'
     ]
   };
   
   function validateConservativeLanguage(text: string): boolean {
     const lower = text.toLowerCase();
     
     // Check for banned phrases
     for (const phrase of CONSERVATIVE_RULES.bannedPhrases) {
       if (lower.includes(phrase)) {
         logger.error('Conservative language violation', { phrase });
         return false;
       }
     }
     
     // Ensure at least one required pattern
     const hasRequiredPattern = CONSERVATIVE_RULES.requiredPhrases.some(
       phrase => lower.includes(phrase)
     );
     
     if (!hasRequiredPattern) {
       logger.warn('Missing conservative language markers');
     }
     
     return true;
   }
   ```

2. **Extraction Prompt Template**:
   ```typescript
   const EXTRACTION_PROMPT = `You are a medical research analyst specializing in ME/CFS.

Task: Extract evidence from this paper relevant to the research question.

Question: {QUESTION}

Paper:
Title: {TITLE}
Abstract: {ABSTRACT}

CRITICAL RULES:
1. Be conservative: Only state what the paper actually found
2. Use precise language: "X paper found...", not "Research shows..."
3. Include sample size and study type
4. Note limitations explicitly
5. If paper doesn't address question, return null

Output JSON:
{
  "relevant": true/false,
  "finding": "exact description of what was found",
  "evidence": "specific data from paper",
  "study_type": "RCT|observational|review|etc",
  "sample_size": number,
  "limitations": ["limitation1", "limitation2"],
  "confidence": 0-1
}

Be extremely careful not to overstate findings.`;
   ```

3. **Synthesis Algorithm**:
   ```typescript
   async function synthesize(
     findings: Finding[],
     question: ResearchQuestion
   ): Promise<Synthesis> {
     if (findings.length === 0) {
       return {
         summary: 'No papers in collection address this question yet.',
         findings: [],
         confidence: 0,
         limitations: ['Insufficient evidence'],
         gaps: ['Need more research on this topic']
       };
     }
     
     // Group similar findings
     const grouped = groupSimilarFindings(findings);
     
     // For each group, create summary
     const summaries = await Promise.all(
       grouped.map(async group => {
         const papers = await getPapers(group.paperIds);
         
         return {
           description: group.description,
           paperCount: group.paperIds.length,
           papers: papers,
           consistency: assessConsistency(group),
           evidence: group.evidence,
           limitations: extractLimitations(papers)
         };
       })
     );
     
     // Generate overall summary
     const overallSummary = await generateConservativeSummary(
       summaries,
       question
     );
     
     // Identify gaps
     const gaps = identifyGaps(findings, question);
     
     return {
       summary: overallSummary,
       findings: summaries,
       confidence: calculateConfidence(summaries),
       limitations: collectLimitations(summaries),
       gaps: gaps
     };
   }
   ```

**Testing**:
- Test with 5 papers on known question
- Verify conservative language (100% compliance)
- Check citation accuracy (all claims cited)
- Validate synthesis quality (human eval)

**Success Metrics**:
- Conservative language: 100% compliance
- Citation accuracy: 100%
- Summary quality: 80%+ (human eval)
- Processing time: < 10 seconds per paper

---

### 2.3 Tool: ContradictionDetector

**Purpose**: Detect and explain contradictions between findings

**Priority**: CRITICAL (Week 3)

**Interface**:
```typescript
interface ContradictionDetector {
  // Detection
  detect(
    newFinding: Finding,
    existingFindings: Finding[]
  ): Promise<Contradiction[]>;
  
  // Analysis
  analyzeDiscrepancy(
    contradiction: Contradiction
  ): Promise<DiscrepancyAnalysis>;
  
  // Interpretation
  generateConservativeInterpretation(
    contradiction: Contradiction,
    analysis: DiscrepancyAnalysis
  ): Promise<string>;
}

interface DiscrepancyAnalysis {
  methodological_differences: string[];
  sample_size_comparison: string;
  quality_comparison: string;
  timing_differences: string[];
  population_differences: string[];
  possible_biological_explanations: string[];
}
```

**Implementation Requirements**:

1. **Detection Algorithm**:
   ```typescript
   async function detect(
     newFinding: Finding,
     existingFindings: Finding[]
   ): Promise<Contradiction[]> {
     const contradictions: Contradiction[] = [];
     
     for (const existing of existingFindings) {
       // Step 1: Check topic similarity
       const similarity = await checkSemanticSimilarity(
         newFinding.description,
         existing.description
       );
       
       if (similarity < 0.8) continue; // Not same topic
       
       // Step 2: Check if results conflict
       const conflict = checkResultConflict(
         newFinding.quantitative_result,
         existing.quantitative_result
       );
       
       if (!conflict) continue; // Results agree
       
       // Step 3: Create contradiction object
       const papers1 = await getPapers(newFinding.supporting_papers);
       const papers2 = await getPapers(existing.supporting_papers);
       
       // Determine majority vs minority
       const [majority, minority] = papers1.length > papers2.length
         ? [{ finding: existing, papers: papers2 }, { finding: newFinding, papers: papers1 }]
         : [{ finding: newFinding, papers: papers1 }, { finding: existing, papers: papers2 }];
       
       const contradiction: Contradiction = {
         id: generateId(),
         finding_id: existing.id,
         topic: existing.description,
         majority_view: {
           description: majority.finding.description,
           papers: majority.finding.supporting_papers,
           evidence: majority.finding.quantitative_result || '',
           paper_count: majority.papers.length
         },
         minority_view: {
           description: minority.finding.description,
           papers: minority.finding.supporting_papers,
           evidence: minority.finding.quantitative_result || '',
           paper_count: minority.papers.length
         },
         methodological_differences: [],
         possible_explanations: [],
         severity: determineSeverity(papers1, papers2),
         status: 'unresolved',
         conservative_interpretation: '',
         date_detected: new Date(),
         last_updated: new Date(),
         flagged_for_research: true
       };
       
       // Step 4: Analyze discrepancy
       const analysis = await analyzeDiscrepancy(contradiction);
       contradiction.methodological_differences = analysis.methodological_differences;
       contradiction.possible_explanations = analysis.possible_biological_explanations;
       
       // Step 5: Generate conservative interpretation
       contradiction.conservative_interpretation = 
         await generateConservativeInterpretation(contradiction, analysis);
       
       contradictions.push(contradiction);
     }
     
     return contradictions;
   }
   ```

2. **Discrepancy Analysis**:
   ```typescript
   async function analyzeDiscrepancy(
     contradiction: Contradiction
   ): Promise<DiscrepancyAnalysis> {
     const majorityPapers = await getPapers(
       contradiction.majority_view.papers
     );
     const minorityPapers = await getPapers(
       contradiction.minority_view.papers
     );
     
     // Compare methodologies
     const methodDiffs = compareMethodologies(
       majorityPapers,
       minorityPapers
     );
     
     // Compare sample sizes
     const sampleComp = compareSampleSizes(
       majorityPapers,
       minorityPapers
     );
     
     // Compare quality
     const qualityComp = compareQuality(
       majorityPapers,
       minorityPapers
     );
     
     // Identify timing differences
     const timingDiffs = compareTimings(
       majorityPapers,
       minorityPapers
     );
     
     // Identify population differences
     const popDiffs = comparePopulations(
       majorityPapers,
       minorityPapers
     );
     
     // Generate biological explanations (using LLM)
     const bioExplanations = await generateBiologicalExplanations(
       contradiction,
       {
         methodDiffs,
         sampleComp,
         qualityComp,
         timingDiffs,
         popDiffs
       }
     );
     
     return {
       methodological_differences: methodDiffs,
       sample_size_comparison: sampleComp,
       quality_comparison: qualityComp,
       timing_differences: timingDiffs,
       population_differences: popDiffs,
       possible_biological_explanations: bioExplanations
     };
   }
   ```

3. **Conservative Interpretation**:
   ```typescript
   const INTERPRETATION_PROMPT = `You are analyzing a contradiction in ME/CFS research.

Majority view ({COUNT1} papers): {VIEW1}
Minority view ({COUNT2} papers): {VIEW2}

Methodological differences:
{METHOD_DIFFS}

Possible explanations:
{EXPLANATIONS}

Task: Write a conservative interpretation that:
1. Acknowledges both views fairly
2. Explains likely reasons for discrepancy
3. States what we can reasonably conclude
4. Avoids choosing a "winner"
5. Notes what further research is needed

Use language like:
- "Most evidence supports X, however..."
- "The discrepancy may be explained by..."
- "Current evidence favors X interpretation, but..."
- "More research needed to resolve..."

NEVER use:
- "X is wrong"
- "Y is correct"
- "The consensus is clear"

Write 2-3 sentences.`;
   ```

**Testing**:
- Test with known contradictory papers
- Verify detection (100% of test contradictions found)
- Check explanation quality (human eval)
- Validate interpretation is conservative

**Success Metrics**:
- Detection rate: 100% on test set
- False positive rate: < 10%
- Explanation quality: 85%+ (human eval)
- Processing time: < 15 seconds

---

### 2.4 Tool: MechanismExplainer

**Purpose**: Generate plain language explanations of biological mechanisms

**Priority**: HIGH (Week 5)

**Interface**:
```typescript
interface MechanismExplainer {
  // Generation
  generate(
    mechanism: string,
    papers: Paper[]
  ): Promise<MechanismExplainer>;
  
  // Update
  update(
    explainer: MechanismExplainer,
    newPapers: Paper[]
  ): Promise<MechanismExplainer>;
}
```

**Implementation**:

```typescript
const EXPLAINER_PROMPT = `You are explaining a biological mechanism to a patient.

Mechanism: {MECHANISM}

Papers that explain this:
{PAPER_SUMMARIES}

Create a multi-level explanation:

PLAIN LANGUAGE (10th grade reading level):
1. What is it? (1-2 sentences, simple definition)
2. How does it work? (3-4 sentences, process explanation)
3. Why does it matter for ME/CFS? (2-3 sentences, relevance)

Use analogies and metaphors. Avoid jargon. If you must use a technical term, define it immediately.

TECHNICAL DETAILS (for optional expansion):
1. Biochemical process (specific pathways, proteins, etc.)
2. Evidence from papers (cite specific findings)
3. Uncertainties or debates

Output JSON format.`;
```

**Testing**:
- Test with 5 known mechanisms
- Verify plain language readability
- Check technical accuracy
- Validate citations

**Success Metrics**:
- Readability: 10th grade or below
- Technical accuracy: 100%
- User satisfaction: 85%+

---

### 2.5 Tool: PreferenceLearner

**Purpose**: Learn user preferences from feedback

**Priority**: MEDIUM (Week 4)

**Interface**:
```typescript
interface PreferenceLearner {
  // Feedback recording
  recordFeedback(feedback: Feedback): Promise<void>;
  
  // Preference updates
  updatePreferences(): Promise<UserPreferences>;
  
  // Prediction
  predictRelevance(paper: Paper): Promise<number>; // 0-1
  shouldShowPaper(paper: Paper): Promise<boolean>;
}

interface Feedback {
  type: 'paper_relevance' | 'summary_quality' | 'topic_interest';
  item_id: string;
  value: boolean | number; // thumbs up/down or rating
  reason?: string;
  timestamp: Date;
}
```

**Implementation**:

```typescript
async function recordFeedback(feedback: Feedback): Promise<void> {
  // Store feedback
  await db.feedback.add(feedback);
  
  // Update preferences based on feedback type
  switch (feedback.type) {
    case 'paper_relevance':
      await updateTopicPreferences(feedback);
      break;
    case 'summary_quality':
      await updateStylePreferences(feedback);
      break;
    case 'topic_interest':
      await updateTopicScores(feedback);
      break;
  }
  
  // Recalculate preferences
  await updatePreferences();
}

async function updateTopicPreferences(feedback: Feedback): Promise<void> {
  const paper = await db.papers.get(feedback.item_id);
  if (!paper) return;
  
  const prefs = await db.preferences.get('default');
  
  // Extract topics from paper
  const topics = extractTopics(paper);
  
  // Update scores
  for (const topic of topics) {
    const currentScore = prefs.relevant_topics.get(topic) || 0.5;
    const delta = feedback.value ? 0.1 : -0.2; // Negative feedback weighted more
    const newScore = Math.max(0, Math.min(1, currentScore + delta));
    
    prefs.relevant_topics.set(topic, newScore);
  }
  
  // If rejected, add to disinterest
  if (!feedback.value && feedback.reason) {
    prefs.disinterest_topics.add(feedback.reason);
  }
  
  await db.preferences.put(prefs);
}

async function predictRelevance(paper: Paper): Promise<number> {
  const prefs = await db.preferences.get('default');
  
  // Extract topics
  const topics = extractTopics(paper);
  
  // Calculate relevance score
  let score = 0.5; // neutral baseline
  let topicCount = 0;
  
  for (const topic of topics) {
    const topicScore = prefs.relevant_topics.get(topic);
    if (topicScore !== undefined) {
      score += topicScore;
      topicCount++;
    }
  }
  
  // Average topic scores
  if (topicCount > 0) {
    score = score / topicCount;
  }
  
  // Check disinterest
  for (const topic of topics) {
    if (prefs.disinterest_topics.has(topic)) {
      score *= 0.5; // Heavily penalize disinterest topics
    }
  }
  
  // Quality adjustment
  if (paper.quality_score) {
    score = score * 0.7 + paper.quality_score * 0.3;
  }
  
  return Math.max(0, Math.min(1, score));
}
```

**Testing**:
- Test with simulated feedback
- Verify preference convergence
- Check relevance prediction accuracy

**Success Metrics**:
- Relevance prediction accuracy: 80%+ after 20 papers
- False positive rate improvement: 70% → 15%

---

## Part 3: Workflow Implementation (Weeks 1-4)

### 3.1 Paper Ingestion Workflow

**Purpose**: Get papers into system with minimal friction

**Flow**:
```
User input (URL/DOI/PMID)
  ↓
PaperFetcher.fetch()
  ↓
Validate & deduplicate
  ↓
Generate summary (Claude API)
  ↓
Store in IndexedDB
  ↓
Update UI
```

**Implementation**:
```typescript
async function ingestPaper(input: string): Promise<Paper> {
  // Step 1: Identify input type
  const inputType = identifyInputType(input);
  logger.info('Paper ingestion started', { input, inputType });
  
  // Step 2: Fetch metadata
  const fetcher = new PaperFetcher();
  const paper = await fetcher.fetch(input);
  
  // Step 3: Check for duplicates
  if (await isDuplicate(paper)) {
    throw new Error('Paper already in collection');
  }
  
  // Step 4: Generate summary
  const summarizer = new Summarizer();
  paper.summary = await summarizer.generate(paper);
  
  // Step 5: Assess relevance
  const learner = new PreferenceLearner();
  const relevance = await learner.predictRelevance(paper);
  
  if (relevance < 0.3) {
    logger.warn('Low relevance paper', { title: paper.title, relevance });
    // Optionally prompt user: "This paper seems less relevant. Add anyway?"
  }
  
  // Step 6: Store
  paper.date_added = new Date();
  paper.date_updated = new Date();
  await db.papers.add(paper);
  
  logger.info('Paper ingested successfully', { 
    id: paper.id, 
    title: paper.title 
  });
  
  return paper;
}
```

---

### 3.2 Question Answering Workflow

**Purpose**: Synthesize evidence to answer research questions

**Flow**:
```
User asks question
  ↓
Search papers (keyword + semantic)
  ↓
For each paper:
  Extract relevant findings (EvidenceExtractor)
  ↓
Group similar findings
  ↓
Detect contradictions (ContradictionDetector)
  ↓
Synthesize conservative answer
  ↓
Display with citations
```

**Implementation**:
```typescript
async function answerQuestion(
  questionText: string
): Promise<ResearchQuestion> {
  logger.info('Answering question', { questionText });
  
  // Step 1: Search for relevant papers
  const papers = await searchPapers(questionText);
  logger.info('Found papers', { count: papers.length });
  
  if (papers.length === 0) {
    return {
      id: generateId(),
      question: questionText,
      status: 'unanswered',
      confidence: 0,
      findings: [],
      contradictions: [],
      gaps: ['No papers in collection address this yet'],
      date_created: new Date(),
      last_updated: new Date(),
      paper_count: 0,
      is_priority: false,
      user_notes: [],
      related_questions: []
    };
  }
  
  // Step 2: Extract findings from each paper
  const extractor = new EvidenceExtractor();
  const findings: Finding[] = [];
  
  for (const paper of papers) {
    const finding = await extractor.extract(paper, questionText);
    if (finding) {
      findings.push(finding);
    }
  }
  
  logger.info('Extracted findings', { count: findings.length });
  
  // Step 3: Detect contradictions
  const detector = new ContradictionDetector();
  const contradictions: Contradiction[] = [];
  
  for (let i = 0; i < findings.length; i++) {
    const newContradictions = await detector.detect(
      findings[i],
      findings.slice(0, i)
    );
    contradictions.push(...newContradictions);
  }
  
  logger.info('Detected contradictions', { count: contradictions.length });
  
  // Step 4: Synthesize answer
  const synthesis = await extractor.synthesize(findings, questionText);
  
  // Step 5: Identify gaps
  const gaps = identifyGaps(findings, questionText);
  
  // Step 6: Create question object
  const question: ResearchQuestion = {
    id: generateId(),
    question: questionText,
    status: determineStatus(findings),
    confidence: synthesis.confidence,
    findings: findings,
    contradictions: contradictions,
    gaps: gaps,
    date_created: new Date(),
    last_updated: new Date(),
    paper_count: papers.length,
    is_priority: false,
    user_notes: [],
    related_questions: []
  };
  
  // Step 7: Store
  await db.questions.add(question);
  
  logger.info('Question answered', { 
    id: question.id, 
    status: question.status,
    findingCount: findings.length,
    contradictionCount: contradictions.length
  });
  
  return question;
}
```

---

### 3.3 Contradiction Detection Workflow

**Purpose**: Flag conflicts when new papers added

**Flow**:
```
New paper added
  ↓
Identify which questions it addresses
  ↓
For each question:
  Extract finding from new paper
  ↓
  Compare to existing findings
  ↓
  If conflict detected:
    Create contradiction object
    Analyze discrepancy
    Generate interpretation
    ↓
    Update question
    Notify user
```

**Implementation**:
```typescript
async function checkForContradictions(
  newPaper: Paper
): Promise<Contradiction[]> {
  const detector = new ContradictionDetector();
  const allContradictions: Contradiction[] = [];
  
  // Find questions this paper might address
  const questions = await findRelevantQuestions(newPaper);
  
  for (const question of questions) {
    // Extract finding from new paper
    const extractor = new EvidenceExtractor();
    const newFinding = await extractor.extract(newPaper, question);
    
    if (!newFinding) continue;
    
    // Check against existing findings
    const contradictions = await detector.detect(
      newFinding,
      question.findings
    );
    
    if (contradictions.length > 0) {
      // Update question
      question.contradictions.push(...contradictions);
      question.last_updated = new Date();
      await db.questions.put(question);
      
      // Store contradictions
      for (const c of contradictions) {
        await db.contradictions.add(c);
      }
      
      allContradictions.push(...contradictions);
      
      logger.warn('Contradiction detected', {
        question: question.question,
        paper: newPaper.title,
        count: contradictions.length
      });
    }
  }
  
  return allContradictions;
}
```

---

## Part 4: Phase-by-Phase Implementation

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Smart paper ingestion with basic summaries

**Week 1 Tasks**:

**Day 1-2: Project Setup**
- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Tailwind CSS
- [ ] Configure ESLint + Prettier
- [ ] Set up Git repository
- [ ] Create basic folder structure:
  ```
  src/
    components/     # React components
    tools/          # Tool implementations
    workflows/      # Workflow functions
    lib/            # Utilities
    db/             # Dexie database setup
    types/          # TypeScript types
    api/            # API clients
  ```
- [ ] Initialize IndexedDB with Dexie:
  ```typescript
  import Dexie from 'dexie';
  
  class ResearchDB extends Dexie {
    papers!: Dexie.Table<Paper, string>;
    questions!: Dexie.Table<ResearchQuestion, string>;
    // ... other tables
    
    constructor() {
      super('ResearchDB');
      this.version(1).stores({
        papers: 'id, doi, pmid, title, date_added',
        questions: 'id, question, date_created',
        // ... other stores
      });
    }
  }
  
  export const db = new ResearchDB();
  ```

**Day 3-4: PaperFetcher Tool**
- [ ] Implement PubMed API client
- [ ] Implement Crossref API client
- [ ] Implement DOI resolver
- [ ] Add retry logic with exponential backoff
- [ ] Add validation
- [ ] Add deduplication
- [ ] Write unit tests
- [ ] Test with 5 known papers

**Day 5-7: Basic UI + Workflow**
- [ ] Create AddPaper component (input form)
- [ ] Create PaperList component (display papers)
- [ ] Create PaperDetail component (show metadata)
- [ ] Implement paper ingestion workflow
- [ ] Add loading states
- [ ] Add error handling
- [ ] Basic styling with Tailwind

**Week 1 Deliverable**: Can paste URL, fetch paper, display in list

---

**Week 2 Tasks**:

**Day 8-10: Summarization**
- [ ] Set up Claude API client
- [ ] Implement Summarizer tool
- [ ] Create summary prompt templates:
  - Quick (2-3 sentences)
  - Standard (5-7 sentences)
  - Detailed (10+ sentences)
- [ ] Add conservative language validation
- [ ] Integrate into ingestion workflow
- [ ] Test with 10 papers
- [ ] Measure quality (human eval)

**Day 11-12: Summary Display**
- [ ] Add summary to PaperDetail view
- [ ] Implement progressive disclosure (quick → standard → detailed)
- [ ] Add copy/export functionality
- [ ] Add feedback mechanism (thumbs up/down)

**Day 13-14: Polish & Testing**
- [ ] Add keyboard shortcuts
- [ ] Improve error messages
- [ ] Add tooltips
- [ ] Test full workflow end-to-end
- [ ] Fix bugs
- [ ] Document code

**Week 2 Deliverable**: Can add papers, get good summaries, provide feedback

**Week 2 Checkpoint Evaluation**:
- [ ] Fetch success rate > 95%?
- [ ] Summary quality > 80% (5 random papers, human eval)?
- [ ] Can use system for actual research?
- [ ] Any blocking issues?

---

### Phase 2: Research Questions (Weeks 3-4)

**Goal**: Q&A system with conservative evidence synthesis

**Week 3 Tasks**:

**Day 15-16: Data Model**
- [ ] Define ResearchQuestion entity
- [ ] Define Finding entity
- [ ] Define Contradiction entity (structure only)
- [ ] Update database schema
- [ ] Create database queries

**Day 17-19: EvidenceExtractor Tool**
- [ ] Implement extraction logic
- [ ] Create extraction prompt
- [ ] Add conservative language validation
- [ ] Implement grouping algorithm
- [ ] Implement synthesis algorithm
- [ ] Write tests
- [ ] Test with known question + papers

**Day 20-21: Question Answering Workflow**
- [ ] Implement paper search (keyword-based initially)
- [ ] Implement question answering workflow
- [ ] Integrate EvidenceExtractor
- [ ] Handle edge cases (no papers, low quality, etc.)
- [ ] Write tests

**Week 3 Deliverable**: Can ask question, get evidence-based answer

---

**Week 4 Tasks**:

**Day 22-23: Question UI**
- [ ] Create QuestionList component (dashboard)
- [ ] Create QuestionDetail component
- [ ] Create AddQuestion component
- [ ] Display findings with citations
- [ ] Add "ask follow-up" functionality

**Day 24-25: ContradictionDetector Tool**
- [ ] Implement detection algorithm
- [ ] Implement discrepancy analysis
- [ ] Create interpretation prompt
- [ ] Write tests with known contradictions
- [ ] Integrate into question answering workflow

**Day 26-27: Contradiction Display**
- [ ] Create Contradiction component (prominent yellow box)
- [ ] Side-by-side comparison view
- [ ] Explanation sections
- [ ] Conservative interpretation
- [ ] Test with real contradictions

**Day 28: Polish & Testing**
- [ ] Add notes functionality
- [ ] Improve citation formatting
- [ ] Test full Q&A workflow
- [ ] Fix bugs
- [ ] Prepare for Phase 3

**Week 4 Deliverable**: Full Q&A system with contradictions

**Week 4 Checkpoint Evaluation**:
- [ ] Can answer 3 test questions?
- [ ] Contradictions detected and displayed prominently?
- [ ] Conservative language 100% compliant?
- [ ] System useful for actual research?

---

### Phase 3: Mechanism Explainers (Weeks 5-6)

**Goal**: Plain language explanations of biological concepts

**Week 5 Tasks**:

**Day 29-30: MechanismExplainer Tool**
- [ ] Define Explainer entity
- [ ] Create generation prompt (plain + technical)
- [ ] Implement generation logic
- [ ] Add readability checking
- [ ] Write tests

**Day 31-32: Explainer UI**
- [ ] Create MechanismExplainer component (modal)
- [ ] Plain language section
- [ ] Technical details (collapsed)
- [ ] Related concepts
- [ ] Supporting papers list

**Day 33-35: Integration**
- [ ] Link findings to mechanisms
- [ ] Auto-generate explainers when needed
- [ ] Add "Understand X" buttons throughout UI
- [ ] Test with 5 mechanisms

**Week 5 Deliverable**: Mechanism explainers working

---

**Week 6 Tasks**:

**Day 36-37: Export Functionality**
- [ ] Implement doctor summary generator
- [ ] PDF export
- [ ] Markdown export
- [ ] Professional formatting
- [ ] Test with real research questions

**Day 38-39: Enhanced Search**
- [ ] Add semantic search (simple embedding approach)
- [ ] Improve relevance ranking
- [ ] Add filters (date, category, quality)
- [ ] Add sorting options

**Day 40-42: Polish & Refinement**
- [ ] Improve all UI components
- [ ] Add keyboard shortcuts everywhere
- [ ] Improve loading states
- [ ] Better error handling
- [ ] Documentation
- [ ] User testing

**Week 6 Deliverable**: Complete system with explainers and export

**Week 6 Checkpoint Evaluation**:
- [ ] Explainers understandable without technical background?
- [ ] Export format suitable for doctor visits?
- [ ] Search functionality useful?
- [ ] System ready for daily use?

---

### Phase 4: Automation & Intelligence (Weeks 7-8)

**Goal**: Weekly digest, auto-updates, proactive features

**Week 7 Tasks**:

**Day 43-44: Weekly Digest**
- [ ] Implement content selection algorithm
- [ ] Create email template (plain + HTML)
- [ ] Implement scheduling (every Monday)
- [ ] Test digest generation
- [ ] Deploy email service

**Day 45-46: Auto-Update Questions**
- [ ] When new paper added, check which questions it addresses
- [ ] Update question evidence automatically
- [ ] Detect new contradictions
- [ ] Notify user of updates

**Day 47-49: Agent (If Needed)**
- [ ] Evaluate: Do we need agent intelligence?
- [ ] If yes: Implement ReAct pattern
- [ ] If yes: Integrate tools
- [ ] If no: Skip and polish workflows

**Week 7 Deliverable**: Automation features working

---

**Week 8 Tasks**:

**Day 50-51: Gap Identification**
- [ ] Implement gap detection algorithm
- [ ] Display gaps in question view
- [ ] Suggest searches to fill gaps

**Day 52-53: Preference Learning Refinement**
- [ ] Improve relevance prediction
- [ ] Add preference visualization
- [ ] Add preference editing UI
- [ ] Test learning convergence

**Day 54-56: Final Polish**
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness
- [ ] Final bug fixes
- [ ] Complete documentation
- [ ] User guide
- [ ] Deployment to production

**Week 8 Deliverable**: Production-ready system

**Week 8 Final Evaluation**:
- [ ] All features working?
- [ ] Performance acceptable?
- [ ] No critical bugs?
- [ ] Documentation complete?
- [ ] Ready for daily use?

---

## Part 5: Testing Strategy

### 5.1 Unit Testing

**Framework**: Vitest

**Coverage Target**: 70%+

**What to Test**:
- All tool functions
- All utility functions
- Data validation
- Workflow logic

**Example Test**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { PaperFetcher } from './PaperFetcher';

describe('PaperFetcher', () => {
  it('should fetch paper from PubMed', async () => {
    const fetcher = new PaperFetcher();
    const paper = await fetcher.fetch('10.1001/jama.2024.1234');
    
    expect(paper).toBeDefined();
    expect(paper.title).toBeTruthy();
    expect(paper.authors.length).toBeGreaterThan(0);
    expect(paper.abstract).toBeTruthy();
  });
  
  it('should use fallback on PubMed failure', async () => {
    const fetcher = new PaperFetcher();
    
    // Mock PubMed failure
    vi.spyOn(fetcher, 'fetchFromPubMed').mockRejectedValue(
      new Error('PubMed unavailable')
    );
    
    const paper = await fetcher.fetch('10.1001/jama.2024.1234');
    
    expect(paper).toBeDefined();
    expect(fetcher.fetchFromCrossref).toHaveBeenCalled();
  });
  
  it('should detect duplicates', async () => {
    const fetcher = new PaperFetcher();
    
    const paper1 = await fetcher.fetch('10.1001/jama.2024.1234');
    await db.papers.add(paper1);
    
    const isDupe = await fetcher.isDuplicate(paper1);
    expect(isDupe).toBe(true);
  });
});
```

---

### 5.2 Integration Testing

**Framework**: Vitest

**What to Test**:
- Workflow end-to-end
- API integrations (with mocks)
- Database operations
- Component integration

**Example Test**:
```typescript
describe('Paper Ingestion Workflow', () => {
  it('should ingest paper end-to-end', async () => {
    const input = 'https://pubmed.ncbi.nlm.nih.gov/12345678/';
    
    // Execute workflow
    const paper = await ingestPaper(input);
    
    // Verify paper stored
    const stored = await db.papers.get(paper.id);
    expect(stored).toBeDefined();
    expect(stored?.title).toBe(paper.title);
    
    // Verify summary generated
    expect(paper.summary.quick).toBeTruthy();
    expect(paper.summary.standard).toBeTruthy();
    
    // Verify conservative language
    const hasConservativeLanguage = validateConservativeLanguage(
      paper.summary.standard
    );
    expect(hasConservativeLanguage).toBe(true);
  });
});
```

---

### 5.3 End-to-End Testing

**Framework**: Playwright

**What to Test**:
- Complete user journeys
- UI interactions
- Error handling
- PWA features

**Example Test**:
```typescript
import { test, expect } from '@playwright/test';

test('complete research workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');
  
  // Add a paper
  await page.click('text=Add Paper');
  await page.fill('input[name="paperInput"]', '10.1001/jama.2024.1234');
  await page.click('button:has-text("Fetch Paper")');
  
  // Wait for paper to be added
  await expect(page.locator('.paper-card')).toBeVisible();
  
  // Ask a question
  await page.click('text=Ask New Question');
  await page.fill('textarea[name="question"]', 'What causes PEM?');
  await page.click('button:has-text("Ask Question")');
  
  // Wait for answer
  await expect(page.locator('.evidence-summary')).toBeVisible();
  
  // Check for conservative language
  const summary = await page.locator('.evidence-summary').textContent();
  expect(summary).toContain('paper');
  expect(summary).not.toContain('proves');
  
  // Check for contradiction warning (if applicable)
  if (await page.locator('.contradiction-box').isVisible()) {
    expect(await page.locator('.contradiction-header')).toBeVisible();
  }
});
```

---

### 5.4 Human Evaluation

**Frequency**: Weekly

**Sample Size**: 3-5 items per category

**What to Evaluate**:

**Summary Quality**:
- [ ] Accuracy (matches paper?)
- [ ] Completeness (captures key points?)
- [ ] Conservative language (no overstatement?)
- [ ] Readability (plain language?)
- [ ] Citations (all claims cited?)

**Contradiction Detection**:
- [ ] All known contradictions detected?
- [ ] False positives acceptable?
- [ ] Explanations make sense?
- [ ] Conservative interpretation reasonable?

**Mechanism Explainers**:
- [ ] Plain language understandable?
- [ ] Technical details accurate?
- [ ] Helpful for learning?

**Rubric**:
```
Score 1-5 for each criterion:
5 = Excellent, no issues
4 = Good, minor issues
3 = Acceptable, some issues
2 = Poor, major issues
1 = Unacceptable, complete failure

Target average: 4.0+
```

---

## Part 6: Deployment Strategy

### 6.1 Local Development (Week 1-2)

**Environment**: Local machine only

**Purpose**: Initial development and testing

**Setup**:
```bash
npm install
npm run dev
```

**Access**: http://localhost:5173

---

### 6.2 Self-Use (Weeks 3-6)

**Environment**: Still local, but used for actual research

**Purpose**: Validate with real usage

**Process**:
1. Use system for actual ME/CFS research
2. Track issues daily
3. Measure quality weekly
4. Iterate rapidly

**Metrics to Track**:
- Papers added per week
- Questions asked per week
- Time spent in system
- User satisfaction (self-reported)
- Issues encountered

---

### 6.3 Production Deployment (Weeks 7-8)

**Environment**: Hosted (Vercel or Netlify)

**Purpose**: Stable, accessible system

**Steps**:

1. **Build for Production**:
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Configure Environment Variables**:
   ```
   VITE_CLAUDE_API_KEY=sk-...
   VITE_PUBMED_EMAIL=your@email.com
   ```

4. **Enable PWA**:
   - Verify manifest.json
   - Test service worker
   - Test offline functionality
   - Test install flow

5. **Set up Monitoring**:
   - Error tracking (Sentry)
   - Analytics (Plausible, privacy-focused)
   - Performance monitoring

---

### 6.4 Maintenance

**Weekly**:
- Check error logs
- Review user feedback
- Test critical paths
- Update dependencies (security patches)

**Monthly**:
- Review metrics dashboard
- Evaluate new feature requests
- Performance audit
- Backup verification

**Quarterly**:
- Major dependency updates
- Architecture review
- Security audit
- User satisfaction survey (self)

---

## Part 7: Monitoring & Observability

### 7.1 Logging

**Framework**: Custom logger or Pino

**Log Levels**:
- ERROR: System failures, critical issues
- WARN: Unexpected behavior, degraded performance
- INFO: Significant events (paper added, question answered)
- DEBUG: Detailed execution flow

**What to Log**:
```typescript
interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  operation: string;
  input?: any;
  output?: any;
  duration_ms?: number;
  tokens_used?: number;
  cost?: number;
  error?: Error;
  user_id?: string;
}
```

**Example**:
```typescript
logger.info('PaperFetcher', 'fetch_paper', {
  input: { doi: '10.1001/jama.2024.1234' },
  duration_ms: 2341,
  success: true
});

logger.error('ContradictionDetector', 'detect', {
  input: { finding_id: 'abc123' },
  error: new Error('Semantic similarity failed'),
  duration_ms: 5023
});
```

---

### 7.2 Metrics Dashboard

**Tool**: Custom dashboard or Grafana

**Key Metrics**:

**System Performance**:
- Paper fetch success rate (target: 95%+)
- Average fetch time (target: < 5s)
- Summary generation time (target: < 10s)
- Question answering time (target: < 30s)
- Cache hit rate (target: 60%+)

**Quality Metrics**:
- Conservative language compliance (target: 100%)
- Contradiction detection rate (target: 100% on known set)
- User satisfaction / thumbs up rate (target: 80%+)

**Usage Metrics**:
- Papers added per week
- Questions asked per week
- Active days per week
- Time spent in app
- Features used

**Cost Metrics**:
- API calls per day
- Tokens used per operation
- Cost per summary
- Cost per question
- Total monthly cost (target: < $20)

**Display**:
```
Dashboard Layout:

┌─────────────────────────────────────────┐
│ System Health                           │
│ ✅ All systems operational             │
│ 🟢 API success rate: 97%               │
│ 🟢 Average response: 3.2s              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ This Week                               │
│ 📄 Papers added: 8                      │
│ ❓ Questions asked: 5                   │
│ ⚠️  Contradictions found: 1            │
│ 👍 User satisfaction: 92%              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Quality                                 │
│ 📊 Conservative language: 100%         │
│ 🎯 Citation accuracy: 100%             │
│ 📖 Readability: Grade 9.2              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Cost                                    │
│ 💰 This month: $12.34                  │
│ 📈 Tokens used: 1.2M                   │
│ 📉 Cost per question: $2.10            │
└─────────────────────────────────────────┘
```

---

## Part 8: Success Criteria

### 8.1 Week 4 (End of Phase 2)

**Must Have**:
- [x] Can add papers (95%+ success rate)
- [x] Can ask questions
- [x] Get evidence-based answers
- [x] Contradictions detected and displayed
- [x] Conservative language 100% compliant
- [x] System usable for actual research

**Nice to Have**:
- [ ] Preference learning showing improvement
- [ ] Export functionality working
- [ ] Notes system polished

**Evaluation Questions**:
1. Would you use this over manual research? (Must be YES)
2. Do answers feel trustworthy? (Must be YES)
3. Are contradictions obvious? (Must be YES)
4. Any blocking bugs? (Must be NO)

---

### 8.2 Week 8 (Production Ready)

**Must Have**:
- [x] All Phase 1-4 features working
- [x] Weekly digest valuable
- [x] Export for doctor visits works
- [x] Mechanism explainers helpful
- [x] System stable (no crashes)
- [x] Performance acceptable (< 5s responses)
- [x] Mobile responsive
- [x] Accessibility compliant (WCAG 2.1 AA)

**Nice to Have**:
- [ ] Agent intelligence (if workflow insufficient)
- [ ] Advanced search features
- [ ] Visualization features

**Evaluation Questions**:
1. Is this indispensable for research tracking? (Goal: YES)
2. Saves significant time vs manual? (Goal: 5+ hours/week)
3. Would recommend to others? (Goal: YES)
4. Any critical missing features? (Goal: NO)

---

### 8.3 Long-Term (3+ Months)

**Success Indicators**:
- Used multiple times per week consistently
- Research questions list growing (10+)
- Paper collection substantial (100+)
- Contradictions helping understand debates
- Explainers used regularly
- Export used for doctor visits
- Preference learning effective (90%+ relevant papers)
- System adapted to user's needs

**Failure Indicators**:
- Not opened in 7+ days
- Papers added but system not consulted
- Questions asked but answers not helpful
- Contradictions not trusted
- Prefer manual research

---

## Part 9: Risk Mitigation

### 9.1 High-Priority Risks

**Risk: API Rate Limits**

*Mitigation*:
- Aggressive caching (30 days)
- Multiple fallback sources
- Rate limit monitoring
- User notification when limits approached

**Risk: Poor Summary Quality**

*Mitigation*:
- Extensive testing with known papers
- Human evaluation from week 1
- Iterative prompt refinement
- User feedback mechanism
- Conservative language validation

**Risk: Missed Contradictions**

*Mitigation*:
- Multiple detection algorithms
- Test set with known contradictions
- User reporting mechanism
- Weekly quality audits

---

## Part 10: Next Steps

### Immediate Actions

1. **Review PRD and Implementation Plan** (both documents)
2. **Validate approach** with user
3. **Set up development environment**
4. **Begin Week 1 tasks**

### Week 1 Kickoff

**Day 1 Tasks**:
```bash
# Create project
npm create vite@latest mecfs-research -- --template react-ts

# Install dependencies
cd mecfs-research
npm install
npm install dexie zustand @tanstack/react-query
npm install -D @types/node vitest @playwright/test

# Initialize Git
git init
git add .
git commit -m "Initial project setup"

# Create folder structure
mkdir -p src/{components,tools,workflows,lib,db,types,api}

# Start development server
npm run dev
```

**First Feature**: PaperFetcher tool  
**First Test**: Fetch 5 known papers  
**First Checkpoint**: End of Day 4

---

## Document Information

**Document Type**: Technical Implementation Plan  
**Version**: 1.0  
**Status**: In Progress (Week 2 of 8)  
**Last Updated**: October 28, 2025  
**Author**: Jamie Barter

**Related Documentation**:
- [`PRD.md`](./PRD.md) - Product requirements and design principles
- [`../STATUS.md`](../STATUS.md) - Current implementation progress
- [`../.cursor/architecture.mdc`](../.cursor/architecture.mdc) - System architecture
- [`../.cursor/instructions.mdc`](../.cursor/instructions.mdc) - Development workflow

---

**END OF IMPLEMENTATION PLAN**

*This plan provides the complete technical roadmap for building the ME/CFS Research System. Follow the phase-by-phase approach, validate at each checkpoint, and adjust based on learnings.*
