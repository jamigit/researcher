# Documentation

Comprehensive documentation for the ME/CFS Research Tracker project.

## 📁 Directory Structure

```
docs/
├── PRD.md                      # Product Requirements Document
├── IMPLEMENTATION_PLAN.md      # Overall implementation roadmap
├── NEXT_STEPS.md              # Current action items
├── guides/                     # How-to guides and references
├── implementation-notes/       # Implementation summaries and notes
├── troubleshooting/           # Fixes, debugging, and issues
└── proposals/                 # Feature proposals and RFCs
```

## 📖 Core Documentation

### Planning & Requirements
- **[PRD.md](./PRD.md)** - Product Requirements Document with full feature specifications
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Detailed implementation phases and progress
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Current priorities and action items

## 📚 Guides (`guides/`)

User and developer guides for working with the system:

- **[DATABASE_GUIDE.md](./guides/DATABASE_GUIDE.md)** - Database schema, queries, and patterns
- **[PDF_EXTRACTION_GUIDE.md](./guides/PDF_EXTRACTION_GUIDE.md)** - PDF processing and metadata extraction

## 📝 Implementation Notes (`implementation-notes/`)

Summaries of completed implementations and major features:

- **[PAPER_FETCHER_SUMMARY.md](./implementation-notes/PAPER_FETCHER_SUMMARY.md)** - PaperFetcher tool implementation details
- **[PAPER_FETCHER_TESTS.md](./implementation-notes/PAPER_FETCHER_TESTS.md)** - Test coverage and strategy
- **[PDF_EXTRACTION_SUMMARY.md](./implementation-notes/PDF_EXTRACTION_SUMMARY.md)** - PDF extraction implementation
- **[DATABASE_ENHANCEMENT_SUMMARY.md](./implementation-notes/DATABASE_ENHANCEMENT_SUMMARY.md)** - Database improvements
- **[SPRINGER_IMPLEMENTATION.md](./implementation-notes/SPRINGER_IMPLEMENTATION.md)** - Springer API integration
- **[TEST_SUMMARY.md](./implementation-notes/TEST_SUMMARY.md)** - Testing infrastructure summary
- **[PHASE2_WEEK3_SUMMARY.md](./implementation-notes/PHASE2_WEEK3_SUMMARY.md)** - Weekly progress summary

## 🔧 Troubleshooting (`troubleshooting/`)

Debugging guides and common issue resolutions:

- **[AUTHOR_FIELD_DEBUG.md](./troubleshooting/AUTHOR_FIELD_DEBUG.md)** - Author field parsing issues
- **[CORS_FIX_GUIDE.md](./troubleshooting/CORS_FIX_GUIDE.md)** - CORS configuration and fixes
- **[PDF_EXTRACTION_FIX.md](./troubleshooting/PDF_EXTRACTION_FIX.md)** - PDF extraction bug fixes
- **[PDF_TROUBLESHOOTING.md](./troubleshooting/PDF_TROUBLESHOOTING.md)** - Common PDF processing issues

## 💡 Proposals (`proposals/`)

Feature proposals and architectural decisions:

- See [proposals/README.md](./proposals/README.md) for active proposals

## 🔍 Quick Navigation

### For New Contributors
1. Start with [PRD.md](./PRD.md) to understand the project vision
2. Review [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for current status
3. Check [NEXT_STEPS.md](./NEXT_STEPS.md) for immediate tasks

### For Development
- Database work → [guides/DATABASE_GUIDE.md](./guides/DATABASE_GUIDE.md)
- PDF processing → [guides/PDF_EXTRACTION_GUIDE.md](./guides/PDF_EXTRACTION_GUIDE.md)
- Issues/bugs → [troubleshooting/](./troubleshooting/)

### For Understanding Features
- Implementation details → [implementation-notes/](./implementation-notes/)
- Architecture decisions → [proposals/](./proposals/)

## 📌 Documentation Standards

When adding new documentation:

1. **Guides** - How-to documentation, reference materials
2. **Implementation Notes** - Post-completion summaries, what was built and how
3. **Troubleshooting** - Issue diagnosis, fixes, debugging guides
4. **Proposals** - Pre-implementation RFCs and design documents

Keep documentation:
- ✅ Up-to-date with code changes
- ✅ Clear and concise
- ✅ Well-organized with headers
- ✅ Cross-linked to related docs
- ✅ Tagged with dates for time-sensitive info

## 🔄 Maintenance

Review quarterly:
- Archive outdated implementation notes
- Update guides with new patterns
- Close resolved troubleshooting items
- Merge accepted proposals into main docs

