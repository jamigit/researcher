# Documentation

This directory contains the complete documentation for the ME/CFS Research System.

## 📖 Primary Documents

### For Understanding the System

**[`PRD.md`](./PRD.md)** - Product Requirements Document ⭐ **START HERE**
- Complete product vision and requirements
- Core principles (conservative evidence, contradictions, plain language)
- Feature specifications with success metrics
- User interface specifications
- Non-functional requirements

**[`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)** - Technical Implementation Plan
- 8-week phase-by-phase implementation
- Technical architecture (5-layer: UI → Application → Tool → Service → Data)
- Data models (Paper, Question, Finding, Contradiction, etc.)
- Tool specifications (PaperFetcher, EvidenceExtractor, ContradictionDetector, etc.)
- Testing strategy and deployment plan
- Success metrics and checkpoints

### For Developers

**Development Context**: See [`.cursor/`](../.cursor/) directory
- `architecture.mdc` - System architecture and design decisions
- `instructions.mdc` - Development workflow and setup
- `rules/` - Code standards and patterns
- `agents/` - Specialized AI agent configurations

**Project Status**: See [`STATUS.md`](../STATUS.md) in root
- Current implementation phase
- Completed milestones
- Active work and next steps

## Directory Structure

```
docs/
├── README.md                    ← You are here
├── PRD.md                       ← Product vision and requirements
├── IMPLEMENTATION_PLAN.md       ← Technical implementation guide
└── planned-features/            ← Future enhancements and proposals
    └── README.md
```

## Core Principles (from PRD)

1. **Conservative Evidence Presentation** - Never claim more than evidence supports
2. **Contradictions VERY Prominent** - Yellow warnings, unmissable
3. **Plain Language First** - Progressive disclosure to technical details
4. **Tool Quality Over Agent Complexity** - Great tools + simple workflows
5. **Privacy First** - Local storage, no cloud by default

## Quick Navigation

### For Product Understanding
- **What are we building?** → [`PRD.md`](./PRD.md) - Executive Summary
- **Why this approach?** → [`PRD.md`](./PRD.md) - Core Principles (Part 2)
- **What features?** → [`PRD.md`](./PRD.md) - Features & Requirements (Part 3)

### For Development
- **How to build it?** → [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Part 4: Phase-by-Phase
- **What tools to build?** → [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Part 2: Tool Specifications
- **What's the architecture?** → [`.cursor/architecture.mdc`](../.cursor/architecture.mdc)
- **How to get started?** → [`.cursor/instructions.mdc`](../.cursor/instructions.mdc)

### For Progress Tracking
- **Where are we now?** → [`STATUS.md`](../STATUS.md)
- **What's next?** → [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Current phase section

## Document Hierarchy

```
┌─────────────────────────────────────────┐
│          For Everyone                    │
│  README.md (root) - Project overview     │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼──────┐   ┌──────▼────────┐
│   Product   │   │  Development  │
│             │   │               │
│ PRD.md      │   │ IMPL PLAN     │
│ (Vision &   │   │ (How to       │
│  Features)  │   │  build it)    │
└─────────────┘   └───────┬───────┘
                          │
                  ┌───────▼────────┐
                  │  Architecture   │
                  │  Instructions   │
                  │  (.cursor/)     │
                  └─────────────────┘
```

## Related Documentation

- **Root README**: [`../README.md`](../README.md) - Quick start and overview
- **AI Context**: [`../.cursor/README.md`](../.cursor/README.md) - AI-optimized docs
- **Status**: [`../STATUS.md`](../STATUS.md) - Implementation progress

