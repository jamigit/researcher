# 🚀 How to Start the ME/CFS Research Tracker

## Quick Start (Development)

### 1. Start Both Servers
```bash
npm run dev:all
```

This starts:
- ✅ **Claude API Proxy** (port 3001) - handles AI requests without CORS
- ✅ **Vite Dev Server** (port 5173) - your React app

### 2. Open the App
```
http://localhost:5173
```

### 3. Verify Papers Loaded
Open browser DevTools (F12 or Cmd+Option+I) and check console:
- First time: `✅ Loaded 32 papers from seed data`
- Subsequent times: `Database already has 32 papers`

---

## What You Get Out of the Box

### 📦 **32 Pre-loaded ME/CFS Papers**
- Automatically imported from PDFs in `src/test/fixtures/pdfs/`
- Stored in browser's IndexedDB (persists across sessions)
- Includes full text, abstracts, DOIs, metadata

### 🤖 **Claude AI Integration**
- Evidence extraction from papers
- Question answering with citations  
- Contradiction detection
- Mechanism explanations

### ⚡ **Offline-First**
- All data stored locally
- Works without internet (except AI features)
- PWA-ready (installable app)

---

## Alternative: Start Servers Separately

### Terminal 1: Start Proxy
```bash
npm run dev:proxy
```

### Terminal 2: Start Vite
```bash
npm run dev
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| **App (Vite)** | 5173 | http://localhost:5173 |
| **Claude Proxy** | 3001 | http://localhost:3001 |

---

## Troubleshooting

### "Port already in use"
```bash
# Kill existing processes
pkill -f "vite|node"

# Restart
npm run dev:all
```

### "Papers not showing"
See `VERIFY_PAPERS_LOADED.md` for detailed checks.

### "CORS error" when asking questions
Make sure both servers are running:
```bash
# Check proxy
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}

# Check Vite
curl http://localhost:5173
# Should return HTML
```

### "Claude API key not configured"
Create `.env` file in project root:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...your-key-here
```

Then restart servers.

---

## First-Time Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add API key** (for AI features)
   Create `.env`:
   ```env
   VITE_ANTHROPIC_API_KEY=your-key-here
   ```

3. **Start development**
   ```bash
   npm run dev:all
   ```

4. **Open app**
   ```
   http://localhost:5173
   ```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start both proxy + Vite (recommended) |
| `npm run dev` | Start Vite only |
| `npm run dev:proxy` | Start Claude proxy only |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run seed:generate` | Regenerate seed data from PDFs |

---

## Next Steps

1. ✅ Navigate to **Papers** → See your 32 loaded papers
2. ✅ Navigate to **Questions** → Ask about ME/CFS
3. ✅ Try the **Search** → Find papers and findings
4. ✅ Export summaries → Get doctor/patient versions

For more details, see:
- `README.md` - Project overview
- `docs/PRD.md` - Product requirements
- `docs/IMPLEMENTATION_PLAN.md` - Development roadmap

