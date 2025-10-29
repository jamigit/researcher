# ME/CFS Research System

**Document Type**: Project Overview  
**Version**: 1.1  
**Last Updated**: October 29, 2025

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

- **[Product Requirements Document (PRD)](./docs/PRD.md)**
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)**
- **[Project Status](./STATUS.md)**
- **[Consolidated Progress Log](./PROGRESS_LOG.md)**
- **[Testing & Discovery Guide](./TESTING_DISCOVERY_README.md)**
- **[Background Service Setup (Netlify)](./BACKGROUND_SERVICE_SETUP.md)**
- **[Playwright Installation](./INSTALL_PLAYWRIGHT.md)**
- **[Week 2 Completion Summary](./WEEK2_COMPLETION_SUMMARY.md)**
- **[Feature Proposals](./docs/proposals/)**

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

**Phases 2–3 Complete** ✅ (Weeks 3-6)
- Research questions, evidence extraction & synthesis
- Contradiction detection and prominent display
- Mechanism explainers and export (doctor/patient)
- Enhanced search across papers/questions/findings

**Week 2 (Testing) & Week 3 (Background Service) Complete** ✅
- 218 tests passing (unit + integration)
- Playwright E2E infrastructure ready
- GitHub Actions CI/CD pipeline added
- Netlify scheduled function (daily discovery) added (MVP summary)

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
   
   Add the following to `.env`:
   ```env
   # Claude API (for Q&A, extraction)
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   
   # PubMed
   VITE_NCBI_EMAIL=your-email@example.com
   VITE_NCBI_API_KEY=your_ncbi_key  # Optional (increases rate limits)
   ```
   
   The Q&A system will gracefully degrade without Claude, but evidence extraction won't work.

4. **Start development server**
   ```bash
   npm run dev
   ```
   App: `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

## Usage Guide

### Adding a Paper Manually

1. Click the "Add Paper" button on the Dashboard or Papers page
2. Fill in required fields (Title, Authors, Abstract, Publication Date)
3. Optional: Journal, URL, DOI, Study type, Categories, Tags
4. Click "Add Paper" to save

### Managing Papers

- **View All Papers**: Papers page
- **Filter Papers**: Filter by read status, importance, or category
- **View Details**: Click paper card
- **Mark as Read**: In paper detail view
- **Search**: Enhanced search on Papers/Questions/Findings

### Data Management

All data is stored locally in IndexedDB. Go to **Settings** to export/import or clear data.

### Installing as PWA

Follow your browser’s "Install app" / "Add to Home Screen" flow.

## Project Structure

```
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── papers/
├── pages/
├── services/
├── types/
├── utils/
└── hooks/
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests (watch)
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Playwright E2E tests (after install)

### Testing

- **Total**: 218 tests passing (unit + integration)
- **Infra**: Vitest, fake-indexeddb, Testing Library
- **Docs**: See [`TESTING_DISCOVERY_README.md`](./TESTING_DISCOVERY_README.md)

Run:
```bash
npm run test:run
npm run test:coverage
```

Playwright E2E (install first):
```bash
npm install -D @playwright/test
npx playwright install --with-deps
npm run test:e2e
```

### CI/CD

- GitHub Actions pipeline runs lints, unit/integration tests, coverage, build, and E2E.
- Config: [`.github/workflows/test.yml`](.github/workflows/test.yml)

### Background Service (MVP)

- Netlify scheduled function runs daily at 9am UTC and returns a discovery summary.
- No DB writes in MVP (summary-only). See [`BACKGROUND_SERVICE_SETUP.md`](./BACKGROUND_SERVICE_SETUP.md).

## Data Privacy

- All data stored locally in IndexedDB
- No cloud storage by default
- Export/import under user control

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/foo`)
3. Commit (`git commit -m 'feat: foo'`)
4. Push (`git push origin feature/foo`)
5. Open a Pull Request

## Implementation Roadmap (8 Weeks)

### Phase 1: Foundation ✅ (Weeks 1-2)
### Phase 2: Q&A System ✅ (Weeks 3-4)
### Phase 3: Explainers & Export ✅ (Weeks 5-6)
### Phase 4: Automation (Weeks 7-8)
- Weekly digest emails
- Auto-update questions with new papers
- Background service (scheduled discovery) – MVP complete

See [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) for details.

## License

MIT License - see LICENSE file for details

## Support

- Open an issue on GitHub
- Check documentation above

---

**Document Version**: 1.1  
**Last Updated**: October 29, 2025  
**Maintainer**: Jamie Barter

