# ME/CFS Research System
## Product Requirements Document (PRD)

**Document Type**: Product Requirements  
**Version**: 1.0  
**Date**: October 28, 2025  
**Last Updated**: October 28, 2025  
**Status**: Ready for Implementation  
**Author**: Jamie Barter

---

## Executive Summary

### What We're Building

An evidence-based research question and answer system that helps a single ME/CFS patient track research developments, understand complex mechanisms, and maintain current knowledge without information overload.

### Core Problem

**User Pain Point**: "Too many sources, too much information"

The ME/CFS research landscape produces 50+ papers weekly across multiple journals, preprint servers, and sources. Manual tracking is overwhelming and time-consuming. Important developments get missed. Contradictions go unnoticed. Understanding requires hours of synthesis work.

### Solution

A conservative evidence synthesis system that:
- Curates research down to 5 important papers per week (95% rejection rate)
- Provides evidence-based answers to research questions
- Highlights contradictions prominently (very important to user)
- Explains biological mechanisms in plain language with technical depth available
- Learns user preferences and adapts over time
- Operates on weekly batch processing (matches user rhythm)

### Success Criteria

**Week 4**: Can ask research questions, get evidence-based answers, contradictions flagged  
**Week 8**: System curates weekly, generates explainers, exports for doctor visits  
**Long-term**: Saves 5+ hours/week vs manual research, user checks system multiple times per day

---

## Part 1: User Context & Needs

### Target User Profile

**Primary User**: You (ME/CFS patient, researcher, learner)

**Usage Pattern**:
- Reads papers weekly (not daily)
- Prefers plain language with access to technical details
- Values conservative evidence presentation
- Needs to highlight contradictions (very important)
- May share findings with doctors when trying new treatments

**Current Workflow Pain Points**:
1. Too many sources to track
2. Can't tell what's important vs noise
3. Synthesis work takes hours
4. Contradictions not obvious until deep research
5. Hard to remember what papers said
6. Difficult to see big picture

### User Goals

**Primary Goals**:
1. Stay current on ME/CFS research without overwhelm
2. Understand current evidence on specific questions
3. Identify contradictions and debates in research
4. Learn how biological mechanisms work
5. Prepare evidence for doctor discussions

**Secondary Goals**:
1. Track personal research questions over time
2. See how understanding evolves
3. Identify gaps in research
4. Build personal knowledge base

---

## Part 2: Core Principles

### Principle 1: Conservative Evidence Presentation

**Rule**: Never claim more than evidence supports

**Application**:
- ✅ "8 papers found mitochondrial dysfunction [citations]"
- ✅ "Most studies show X, but 1 study found Y [citation]"
- ✅ "Current evidence suggests..."
- ❌ NOT: "The consensus is clear"
- ❌ NOT: "Research proves"
- ❌ NOT: "PEM is caused by..."

**Rationale**: Medical information requires precision. Overstating evidence erodes trust and could lead to poor decisions.

---

### Principle 2: Contradictions Are VERY Prominent

**Rule**: Every contradiction gets prominent display with full analysis

**Application**:
- Large, visible warning badge on questions
- Dedicated contradiction section with yellow background
- Majority vs minority view side-by-side comparison
- Methodological differences explained
- Biological explanations offered
- Conservative interpretation provided

**Rationale**: User specifically identified this as "very important". Contradictions reveal uncertainty and help understand debates.

---

### Principle 3: Plain Language Default, Technical Available

**Rule**: Start accessible, allow progression to technical depth

**Application**:
- Default: Plain language explanations (10th grade reading level)
- Progressive disclosure: Click to expand technical details
- Inline definitions: Hover for term explanations
- Multiple summary levels: Quick scan → Standard → Detailed → Technical

**Rationale**: User prefers "plain language but help point to the technical side". Cognitive load varies by energy level.

---

### Principle 4: Aggressive Curation Over Comprehensive Collection

**Rule**: Show 5 important papers per week, not 50

**Application**:
- Agent reviews 100+ papers weekly
- Filters down to 5-10 most relevant
- 95% rejection rate
- Learns from user feedback (keep/reject decisions)
- Transparency: Can always see what was filtered and why

**Rationale**: User pain point is "too much information". Comprehensive collection recreates the problem.

---

### Principle 5: Tool Quality Enables Intelligence

**Rule**: Invest equally in tools as in prompts

**Application**:
- Design tools FIRST before agent architecture
- Each tool gets: error handling, fallbacks, testing, documentation
- Tools: PaperFetcher, EvidenceExtractor, ContradictionDetector, etc.
- Great tools + simple workflow > poor tools + complex agents

**Rationale**: Production AI systems principle: "Agent capability emerges from system design, not model sophistication alone."

---

## Part 3: Features & Requirements

### Feature 1: Research Question Tracking

**Description**: Main interface for organizing knowledge around questions

**Requirements**:

**Must Have**:
- Users can ask unlimited research questions
- Questions persist across sessions
- Each question shows:
  - Current evidence status (unanswered/partial/answered)
  - Number of papers addressing it
  - Last updated date
  - Contradiction warnings (if any)
- Can view all questions at a glance
- Can click into any question for details

**Should Have**:
- Related questions suggested automatically
- Questions can be marked as priority
- Export question + evidence for doctor visits

**Won't Have** (v1):
- Collaborative features
- Question templates
- Public question sharing

**User Flow**:
1. User types question: "What causes PEM?"
2. System searches existing papers
3. System displays evidence status
4. User clicks to see detailed evidence
5. User can add notes or ask follow-up questions

**Success Metric**: 80%+ of questions get useful answers from collection

---

### Feature 2: Conservative Evidence Synthesis

**Description**: For each research question, synthesize evidence across papers

**Requirements**:

**Must Have**:
- Each finding shows:
  - Exact paper count with citations
  - Study types (RCT, observational, review, etc.)
  - Quality indicators (peer-reviewed vs preprint)
  - Consistency assessment (high/medium/low)
  - Quantitative results when available
  - Sample sizes
  - Limitations
- Conservative language throughout
- No claims beyond what papers state
- Citations for every assertion
- Links to source papers

**Should Have**:
- Confidence levels for findings
- Time-based view (how evidence evolved)
- Strength of evidence scoring

**Won't Have** (v1):
- Automated consensus determination
- Predictive claims
- Treatment recommendations

**Synthesis Rules**:
```
Minimum papers for finding: 3
Confidence threshold: 0.7
Conservative interpretation required
Always show limitations
Always cite sources
Never extrapolate beyond data
```

**Success Metric**: 100% of syntheses pass conservative language audit

---

### Feature 3: Contradiction Detection & Display

**Description**: Automatically detect and prominently display contradictions

**Requirements**:

**Must Have**:
- Automatic detection when papers conflict
- Visual prominence (yellow warning box, can't miss)
- Side-by-side comparison:
  - Majority view (paper count, findings)
  - Minority view (paper count, findings)
- Methodological differences explained:
  - Sample size differences
  - Measurement method differences
  - Patient population differences
  - Timing/context differences
- Possible biological explanations
- Conservative interpretation synthesizing both views

**Should Have**:
- Severity classification (minor/major)
- Trend over time (is contradiction resolving?)
- Suggest papers to resolve contradiction

**Won't Have** (v1):
- Automatic resolution
- "Winner" determination
- Suppression of minority view

**Detection Algorithm**:
```
1. Semantic similarity check (topics must match)
2. Result conflict detection (findings differ significantly)
3. Quality comparison (both views get fair hearing)
4. Explanation generation (why they might disagree)
5. Conservative synthesis (what we can conclude despite disagreement)
```

**Success Metric**: 100% of known contradictions detected and displayed prominently

---

### Feature 4: Mechanism Explainers

**Description**: Plain language explanations of biological concepts

**Requirements**:

**Must Have**:
- Plain language section:
  - What is X?
  - How does X work?
  - Why does X matter for ME/CFS?
  - Common analogies/metaphors
- Technical details section (collapsed by default):
  - Biochemical processes
  - Specific pathways
  - Evidence from papers
- Related concepts linked
- Supporting papers listed

**Should Have**:
- Visual diagrams
- Step-by-step process breakdowns
- "Explain like I'm 5" option
- Historical context (how understanding evolved)

**Won't Have** (v1):
- Video content
- Interactive simulations
- Gamification

**Quality Standards**:
- Reading level: 10th grade maximum for plain language
- Technical correctness: 100% (verified against sources)
- Accessibility: All medical terms defined on first use
- Progressive disclosure: Simple → Detailed → Technical

**Success Metric**: 90%+ plain language explanations understandable without technical background

---

### Feature 5: Smart Paper Ingestion

**Description**: Minimal-friction paper capture with automatic enrichment

**Requirements**:

**Must Have**:
- Multiple input methods:
  - Paste DOI → auto-fetch everything
  - Paste PubMed URL → auto-fetch everything
  - Paste PMID → auto-fetch everything
  - Paste abstract → attempt to match paper
- Automatic metadata extraction:
  - Title, authors, date, journal
  - DOI, PMID if available
  - Abstract, keywords
- Automatic summarization (plain language)
- Automatic relevance assessment
- Deduplication (don't add same paper twice)

**Should Have**:
- Browser extension for one-click capture
- Bulk import from Zotero/Mendeley
- PDF text extraction
- Automatic PDF download when available

**Won't Have** (v1):
- Manual form entry (unless auto-fetch fails)
- OCR for scanned papers
- Paywall circumvention

**Fetching Strategy**:
```
Try in order:
1. PubMed API (primary)
2. Crossref API (fallback)
3. DOI resolver (fallback)
4. Manual entry prompt (last resort)

Each with:
- 3 retry attempts
- Exponential backoff
- 30 second timeout
- Error logging
```

**Success Metric**: 95%+ automatic fetch success rate

---

### Feature 6: User Notes & Annotations

**Description**: Capture thoughts and questions throughout the system

**Requirements**:

**Must Have**:
- Can add notes to:
  - Research questions
  - Individual findings
  - Papers
  - Contradictions
  - Mechanism explainers
- Notes show:
  - Date created
  - Context (what it's attached to)
  - Content (markdown supported)
- Notes searchable
- Notes exportable

**Should Have**:
- Tags for notes
- Note type (insight/question/todo/observation)
- Link notes to multiple contexts
- Voice notes

**Won't Have** (v1):
- Collaborative notes
- Note sharing
- Version history

**Success Metric**: 80%+ of active sessions include at least one note

---

### Feature 7: Weekly Digest

**Description**: Email summary of important developments

**Requirements**:

**Must Have**:
- Sent every Monday morning
- Contains:
  - Top 3-5 papers worth reading
  - Contradictions detected this week
  - Research questions answered or updated
  - Trends in research landscape
  - Optional: Papers filtered out with reasoning
- Concise (5-minute read)
- Links directly to app
- Plain text + HTML versions

**Should Have**:
- Customizable send time
- Customizable frequency (weekly/biweekly)
- Skip weeks with no significant updates
- Mobile-optimized

**Won't Have** (v1):
- Real-time alerts
- SMS notifications
- Social sharing

**Content Selection**:
```
Priority:
1. New contradictions (highest)
2. High-quality papers on priority topics
3. Research question updates
4. Emerging trends
5. Gap identification

Maximum length: 5 papers
Always explain why each paper matters
Link to full details in app
```

**Success Metric**: 80%+ digest open rate, 50%+ click-through to app

---

### Feature 8: Export for Medical Discussions

**Description**: Generate doctor-friendly summaries

**Requirements**:

**Must Have**:
- One-page summary format
- Medical language (not plain language)
- Contains:
  - Research question or topic
  - Key findings with citations
  - Study quality assessment
  - Clinical implications
  - Patient's specific questions
  - Space for appointment notes
- Exportable as PDF and printable
- Professional formatting

**Should Have**:
- Multiple format options (brief/detailed)
- Include technical details
- Reference list
- Custom header (patient name, date)

**Won't Have** (v1):
- Direct EMR integration
- Automatic doctor sharing
- Treatment recommendations

**Success Metric**: Used before 80%+ of doctor appointments where new treatment discussed

---

### Feature 9: Preference Learning

**Description**: System learns user interests and adapts

**Requirements**:

**Must Have**:
- Tracks user feedback:
  - Papers marked relevant/not relevant
  - Summaries thumbs up/down
  - Topics of questions asked
  - Papers read vs skipped
  - Time spent on different topics
- Adapts filtering based on preferences
- Transparent about what it learned
- Can view and edit learned preferences

**Should Have**:
- Explicit preference settings
- Feedback on why paper recommended
- A/B testing of different curation strategies
- Export preference profile

**Won't Have** (v1):
- Cross-user learning
- Predictive recommendations beyond current interests
- Automated question generation

**Learning Algorithm**:
```
For each topic:
  - Track keep/reject decisions
  - Weight by recency (recent matters more)
  - Adjust relevance threshold
  - Suggest more similar content
  
For summary style:
  - Track which detail level accessed
  - Adjust default view
  - Suggest preferred format
```

**Success Metric**: Relevance accuracy improves from 70% to 85%+ within 4 weeks

---

## Part 4: Non-Functional Requirements

### Performance

**Response Times**:
- Paper fetch: < 5 seconds (95th percentile)
- Summary generation: < 10 seconds
- Search results: < 1 second
- Page navigation: < 300ms

**Scalability**:
- Support 1,000+ papers in collection
- Handle 50+ research questions
- Process 20 papers per week without slowdown

**Reliability**:
- 99% uptime for local operations
- Graceful degradation when APIs unavailable
- No data loss (auto-save, backup)

---

### Security & Privacy

**Data Privacy**:
- All data stored locally (IndexedDB)
- No cloud storage by default
- Export/backup user-controlled
- API keys encrypted
- No tracking or analytics

**Access Control**:
- Single-user system (no authentication needed initially)
- Optional password protection for sensitive notes

---

### Accessibility

**WCAG 2.1 AA Compliance**:
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast (4.5:1 minimum)
- Text resizable to 200%
- Focus indicators visible

**Responsive Design**:
- Works on desktop (primary)
- Works on tablet (secondary)
- Works on mobile (view-only initially)

---

### Usability

**Ease of Use**:
- New user can add first paper in < 2 minutes
- Can ask first question and get answer in < 5 minutes
- No training required
- Tooltips for all features
- Inline help available

**Error Handling**:
- Clear error messages in plain language
- Suggested actions for every error
- Never fail silently
- Always show system state

---

### Maintainability

**Code Quality**:
- TypeScript for type safety
- Comprehensive comments
- Consistent naming conventions
- Functions < 50 lines
- Modular architecture

**Testing**:
- Unit tests for all tools
- Integration tests for workflows
- End-to-end tests for user journeys
- 70% code coverage minimum

**Documentation**:
- README for setup
- Architecture documentation
- API documentation for tools
- User guide

---

## Part 5: User Interface Specifications

### Design System

**Colors**:
- Primary: #2563eb (blue)
- Warning: #f59e0b (amber) for contradictions
- Success: #059669 (green) for high confidence
- Neutral: #64748b (slate) for secondary text
- Background: #f5f7fa (light gray)

**Typography**:
- Headings: System font, 600 weight
- Body: System font, 400 weight
- Code/technical: Monospace font
- Reading level: 10th grade for plain language

**Spacing**:
- Base unit: 4px
- Small gap: 8px
- Medium gap: 16px
- Large gap: 24px
- Section gap: 32px

---

### Key Screens

**1. Research Questions Dashboard** (Home)
- List of all questions
- Status indicators (partial/emerging/limited)
- Paper counts
- Contradiction warnings
- Last updated dates
- "Ask new question" prominent
- Clean card layout

**2. Question Detail View**
- Question title
- Evidence summary paragraph
- Findings organized by topic
- Each finding: papers, quality, consistency, results
- Contradiction section (very prominent if present)
- What we don't know section
- User notes section
- Actions: export, ask follow-up, view papers

**3. Paper List View**
- All papers in collection
- Filters: category, date, read status, importance
- Sort: date, relevance, title
- Quick preview on hover
- Batch actions
- Search bar

**4. Paper Detail View**
- Full metadata
- Multiple summary levels
- Link to source
- Related papers
- User notes
- Tags
- Importance rating

**5. Mechanism Explainer** (Modal)
- Plain language section
- Technical details (collapsed)
- Related concepts
- Supporting papers
- User notes

---

### Navigation

**Primary Navigation**:
- Home (Questions)
- Papers
- Add Paper
- Settings

**Secondary Navigation**:
- Search (always accessible)
- User menu (export, settings, help)

**Breadcrumbs**:
- Show current location
- Allow quick navigation up hierarchy

---

### Interaction Patterns

**Progressive Disclosure**:
- Start simple (quick summary)
- Click to expand (detailed view)
- Click again for technical (expert view)

**Feedback Mechanisms**:
- Thumbs up/down on summaries
- Relevant/not relevant on papers
- Importance rating (low/medium/high)
- Notes/comments anywhere

**Loading States**:
- Skeleton screens (not spinners)
- Progress indicators for long operations
- Cancellable operations when possible

---

## Part 6: Success Metrics

### Phase 1 Metrics (Weeks 1-4)

**Tool Quality**:
- Paper fetch success rate > 95%
- Summary accuracy > 80% (human eval)
- Contradiction detection > 95% on test set

**User Engagement**:
- Papers added per week > 5
- Questions asked per week > 2
- Daily active use (5+ minutes)

**Quality**:
- Conservative language compliance: 100%
- User satisfaction (thumbs up): > 70%

---

### Phase 2 Metrics (Weeks 5-8)

**Intelligence**:
- Preference learning accuracy > 80%
- False positive rate < 15%
- Answer quality (human eval) > 85%

**User Engagement**:
- Papers added per week > 10
- Questions asked per week > 3
- Daily active use (10+ minutes)
- Weekly digest open rate > 80%

**Efficiency**:
- Time to answer question < 2 minutes
- Time saved vs manual research > 5 hours/week

---

### Long-Term Metrics (3+ months)

**System Performance**:
- Relevance accuracy > 90%
- User retention > 95%
- Net Promoter Score (would recommend) > 8/10

**Value Delivered**:
- Research questions answered: 50+
- Papers curated: 200+
- Contradictions identified: 10+
- Doctor visits prepared with evidence: 3+
- Time saved: 20+ hours/month

**Learning Effectiveness**:
- Understanding of ME/CFS research: Self-reported improvement
- Confidence in discussing research: Self-reported improvement
- Ability to evaluate new research: Self-reported improvement

---

## Part 7: Out of Scope (v1)

### Explicitly Not Building

**Collaborative Features**:
- Multiple users
- Sharing questions/notes
- Comments from others
- Public question database

**Social Features**:
- Following other users
- Upvoting papers
- Discussions/forums
- Expert Q&A

**Advanced Visualizations**:
- Timeline charts
- Network graphs
- Interactive dashboards
- Research landscape maps

**Content Creation**:
- Automated blog posts
- Social media sharing
- Newsletter generation (beyond digest)
- Research summaries for general audience

**Clinical Features**:
- Symptom tracking
- Treatment tracking
- Direct medical advice
- EMR integration

**Mobile Native**:
- iOS app
- Android app
- Mobile-first design
- Offline sync across devices

---

## Part 8: Future Considerations (v2+)

### Potential Enhancements

**Post-Launch**:
- Browser extension for one-click capture
- Mobile native apps
- Cloud sync (optional)
- Voice interface for Q&A
- Integration with Obsidian/Roam/Notion

**If User Requests**:
- Collaborative features (shared questions)
- Public question database
- Expert verification system
- Integration with patient communities

**If Scale Increases**:
- Multi-user support
- Role-based access (patient/researcher/doctor)
- Organization accounts
- API for external integrations

---

## Part 9: Assumptions & Dependencies

### Key Assumptions

1. User has consistent internet access for paper fetching
2. User comfortable with web applications
3. User willing to provide feedback for learning
4. User has ~15-20 minutes per week for system interaction
5. User has basic scientific literacy
6. User maintains own medical care (system is supplement, not replacement)

### External Dependencies

**APIs**:
- PubMed E-utilities (free, rate limited to 3 req/sec)
- Claude API (paid, current Sonnet 4.5 model)
- Crossref API (free, backup for DOI resolution)

**Browser Requirements**:
- Modern browser (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+)
- JavaScript enabled
- IndexedDB support (all modern browsers)
- Service Worker support (for PWA features)

**Technology Stack**:
- React 18+
- TypeScript 5+
- Vite 5+
- Dexie 4+ (IndexedDB wrapper)
- Tailwind CSS 3+

---

## Part 10: Risk Assessment

### High-Priority Risks

**Risk 1: API Rate Limits**
- Impact: Can't fetch papers → system unusable
- Likelihood: Medium
- Mitigation: 
  - Multiple API sources (PubMed, Crossref, DOI)
  - Aggressive caching (30 day cache)
  - User feedback about limits
  - Graceful degradation

**Risk 2: Summary Quality Below Expectations**
- Impact: Loss of trust, system not used
- Likelihood: Medium
- Mitigation:
  - Extensive testing with known papers
  - Human evaluation from day one
  - User feedback mechanism
  - Iterative prompt improvement
  - Conservative language safeguards

**Risk 3: Contradiction Detection Misses Important Conflicts**
- Impact: User misses critical information
- Likelihood: Low
- Mitigation:
  - Multiple detection algorithms
  - Human review of test set
  - User reporting mechanism
  - Regular quality audits

---

### Medium-Priority Risks

**Risk 4: Cost Exceeds Budget**
- Impact: Unsustainable to operate
- Likelihood: Low
- Mitigation:
  - Aggressive caching
  - Cost monitoring dashboard
  - Usage caps
  - Optimization based on metrics

**Risk 5: User Adoption Failure**
- Impact: System not used despite quality
- Likelihood: Low (single user, direct need)
- Mitigation:
  - User testing at every phase
  - Iterative improvements
  - Focus on highest-value features first

---

## Part 11: Stakeholder Sign-Off

### Project Sponsor

**Name**: [Your Name]  
**Role**: Primary User / Product Owner  
**Sign-Off Date**: ___________

### Key Decisions Confirmed

- [x] Conservative evidence synthesis approach
- [x] Contradictions very prominent
- [x] Plain language default with technical available
- [x] Weekly batch processing (not real-time)
- [x] Single-user system (no collaboration v1)
- [x] Tool quality over agent complexity
- [x] Start with workflows, add agents only if needed

---

## Appendix A: Glossary

**ME/CFS**: Myalgic Encephalomyelitis / Chronic Fatigue Syndrome  
**PEM**: Post-Exertional Malaise (worsening after exertion)  
**Conservative Synthesis**: Evidence presentation that never claims more than papers actually found  
**Contradiction**: When papers reach different conclusions on same topic  
**Finding**: Specific claim supported by research papers  
**Mechanism Explainer**: Plain language explanation of biological process  
**Research Question**: User-generated question tracked over time  
**Progressive Disclosure**: Design pattern starting simple with details available on demand  
**PWA**: Progressive Web App (installable web application)  
**RAG**: Retrieval Augmented Generation (AI technique for Q&A systems)

---

## Appendix B: References

**User Research**:
- User interviews: October 2025
- Usage pattern: Weekly reader, plain language preference
- Pain points: Too much information, contradictions important

**Technical Research**:
- Building Production AI Agent Systems (comprehensive guide)
- Anthropic Claude API documentation
- PubMed E-utilities API documentation

**Design Research**:
- WCAG 2.1 accessibility guidelines
- Progressive disclosure best practices
- Medical information presentation standards

---

## Appendix C: Document History

**v1.0** (October 28, 2025)
- Initial comprehensive PRD
- Incorporates production AI agent best practices
- Includes interface mockup feedback
- Conservative synthesis principle established
- Contradiction prominence confirmed as critical

---

## Document Information

**Document Type**: Product Requirements Document  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: October 28, 2025  
**Author**: Jamie Barter

**Related Documentation**:
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Technical implementation guide
- [`../STATUS.md`](../STATUS.md) - Current implementation progress
- [`../.cursor/architecture.mdc`](../.cursor/architecture.mdc) - System architecture

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**

*This PRD represents the complete product vision, requirements, and specifications for the ME/CFS Research System. All implementation work should reference this document as the source of truth for what to build and why.*
