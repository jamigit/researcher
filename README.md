# ME/CFS Research System

**Document Type**: Project Overview  
**Version**: 1.0  
**Last Updated**: October 28, 2025

An evidence-based research question and answer system that helps track ME/CFS research developments, understand complex mechanisms, and maintain current knowledge without information overload.

## Core Purpose

**The Problem**: ME/CFS research produces 50+ papers weekly. Manual tracking is overwhelming. Important developments get missed. Contradictions go unnoticed.

**The Solution**: A conservative evidence synthesis system that:
- Curates research down to 5 important papers per week (95% rejection rate)
- Provides evidence-based answers to research questions
- **Highlights contradictions prominently** (very important)
- Explains biological mechanisms in plain language with technical depth available
- Operates on weekly batch processing

## Documentation

- **[Product Requirements Document (PRD)](./docs/PRD.md)** - Complete product vision, core principles, and feature specifications
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - 8-week technical implementation plan with architecture and data models
- **[Project Status](./STATUS.md)** - Current implementation progress and completed milestones
- **[Feature Proposals](./docs/proposals/)** - Planned enhancements and future features

## Core Principles

1. **Conservative Evidence Presentation** - Never claim more than evidence supports
2. **Contradictions VERY Prominent** - Yellow warnings, can't miss them
3. **Plain Language First** - Progressive disclosure to technical details
4. **Aggressive Curation** - 5 papers/week, not 50 (95% rejection rate)
5. **Privacy First** - All data stored locally, no cloud by default

## Current Status

**Phase 1 Complete** ✅ (Weeks 1-2)
- Smart paper ingestion with DOI/PMID/URL support
- Local storage with IndexedDB
- Basic UI and paper management
- PWA capabilities

**Phase 2 In Progress** 🔄 (Weeks 3-4)
- Research question tracking
- Conservative evidence synthesis
- Contradiction detection and display

See [`STATUS.md`](./STATUS.md) for detailed progress.

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (via Dexie.js)
- **PWA**: Workbox Service Worker
- **Router**: React Router v6
- **Icons**: Lucide React
- **Validation**: Zod
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mecfs-research-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file (it's gitignored)
   touch .env
   ```
   
   Add the following to `.env` (see [`docs/guides/ENVIRONMENT_SETUP.md`](./docs/guides/ENVIRONMENT_SETUP.md) for detailed guide):
   ```env
   # Required for Q&A features (Phase 2)
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   
   # Required for smart paper fetching
   VITE_NCBI_EMAIL=your-email@example.com
   VITE_NCBI_API_KEY=your_ncbi_key  # Optional, increases rate limits
   ```
   
   **Note**: The Q&A system will gracefully degrade without Claude API, but evidence extraction won't work.

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

## Usage Guide

### Adding a Paper Manually

1. Click the "Add Paper" button on the Dashboard or Papers page
2. Fill in the required fields:
   - **Title**: Paper title (required)
   - **Authors**: Comma-separated list (required)
   - **Abstract**: Paper abstract (required)
   - **Publication Date**: When the paper was published (required)
3. Optional fields:
   - Journal name
   - URL to the paper
   - DOI
   - Study type
   - Categories (select multiple)
   - Custom tags
4. Click "Add Paper" to save

### Managing Papers

- **View All Papers**: Navigate to the Papers page
- **Filter Papers**: Use the Filters button to filter by read status, importance, or category
- **View Details**: Click on any paper card to see full details
- **Mark as Read**: Use the button in the paper detail view
- **Search**: Use the search functionality to find specific papers

### Data Management

All data is stored locally in your browser's IndexedDB. To manage your data:

1. Go to **Settings**
2. **Export Data**: Download all your data as JSON for backup
3. **Import Data**: Restore from a previous backup
4. **Clear All Data**: Remove all papers (use with caution!)

### Installing as PWA

#### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install" to add to your applications

#### Mobile (iOS Safari)
1. Tap the Share button
2. Select "Add to Home Screen"

#### Mobile (Android Chrome)
1. Tap the menu (three dots)
2. Select "Install app" or "Add to Home Screen"

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (Header, Footer, Nav)
│   └── papers/          # Paper-specific components
├── pages/               # Page components
├── services/            # Database and API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── hooks/               # Custom React hooks
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests (169 tests across 6 files)

### Testing

This project has comprehensive unit tests covering:
- **Utilities**: Validation and formatting functions (65 tests)
- **Services**: Database operations for papers, questions, findings (79 tests)
- **Hooks**: React hooks for data management (25 tests)

Test infrastructure:
- **Vitest** - Fast test runner
- **fake-indexeddb** - Realistic IndexedDB simulation
- **Testing Library** - React component/hook testing
- **Factory functions** - Reusable mock data generators

Run tests:
```bash
npm test              # Run all tests once
npm test -- --watch   # Run in watch mode
npm test -- --ui      # Run with visual UI
```

See `TEST_SUMMARY.md` for detailed test documentation.

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript strict mode** for type safety

Run `npm run lint` to check for issues.

## Data Privacy

- All data is stored locally in your browser
- No data is sent to external servers (except when using optional AI features)
- You have complete control over your data with export/import functionality
- IndexedDB data persists across browser sessions

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Implementation Roadmap (8 Weeks)

### Phase 1: Foundation ✅ (Weeks 1-2)
- Smart paper ingestion (PubMed, Crossref, DOI)
- AI-powered summarization with conservative language
- Local storage with IndexedDB
- Basic UI and PWA

### Phase 2: Q&A System 🔄 (Weeks 3-4)
- Research question tracking
- Evidence extraction and synthesis
- **Contradiction detection (prominent display)**
- User notes and annotations

### Phase 3: Explainers (Weeks 5-6)
- Mechanism explainers (plain + technical)
- Export for medical discussions
- Enhanced search and filtering

### Phase 4: Automation (Weeks 7-8)
- Weekly digest emails
- Auto-update questions with new papers
- Preference learning
- Production deployment

See [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) for detailed week-by-week breakdown.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments for implementation details

## Key Features

### Conservative Evidence Synthesis
- Every finding cites exact paper count
- Study types and quality indicators shown
- Never claims more than evidence supports
- Limitations always explicit

### Contradiction Detection
- **Prominent yellow warning boxes** (can't miss)
- Side-by-side comparison of conflicting findings
- Methodological differences explained
- Conservative interpretation provided

### Progressive Disclosure
- Plain language explanations (default)
- Technical details available on click
- Multiple summary levels (quick → standard → detailed)
- 10th grade reading level for accessibility

### Privacy & Control
- All data stored locally in IndexedDB
- No cloud storage by default
- Export/backup user-controlled
- API keys encrypted

## Acknowledgments

- Built for personal ME/CFS research tracking
- Follows production AI agent system best practices
- Conservative evidence presentation inspired by medical research standards
- Uses Claude AI for intelligent synthesis

---

**Note**: This is a single-user system designed for personal research management. Data is stored locally for privacy.

---

**Document Version**: 1.0  
**Last Updated**: October 28, 2025  
**Maintainer**: Jamie Barter

