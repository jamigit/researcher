# Claude API CORS Fix

## Problem
Browsers block direct calls to the Anthropic API due to CORS (Cross-Origin Resource Sharing) policy.

## Solution
Created a local proxy server that handles Claude API calls server-side, avoiding CORS issues.

## How to Start the App (Updated)

### Quick Start - Both Servers Together
```bash
npm run dev:all
```

This starts:
- **Proxy Server** on port 3001 (handles Claude API)
- **Vite Dev Server** on port 5173 (your app)

### Separate Commands (if needed)
```bash
# Terminal 1: Start proxy server
npm run dev:proxy

# Terminal 2: Start Vite
npm run dev
```

## What Changed

### 1. Created Proxy Server (`server/proxy.js`)
- Handles Claude API calls server-side
- Keeps API key secure (not exposed in browser)
- Enables CORS for localhost

### 2. Updated Claude Client (`src/lib/claude.ts`)
- **Development**: Routes through proxy (`http://localhost:3001/api/claude`)
- **Production**: Direct API calls (when deployed)

### 3. Added npm Scripts
```json
{
  "dev:proxy": "node server/proxy.js",
  "dev:all": "concurrently \"npm run dev:proxy\" \"npm run dev\""
}
```

## Verify It's Working

1. Start the servers:
   ```bash
   npm run dev:all
   ```

2. Check proxy health:
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. Open app:
   ```
   http://localhost:5173
   ```

4. Try asking a question - no more CORS errors!

## How It Works

### Before (CORS Error ❌)
```
Browser → Anthropic API
         ❌ CORS policy blocks request
```

### After (Working ✅)
```
Browser → Proxy Server → Anthropic API
         ✅ CORS allowed    ✅ API call succeeds
```

##Production Deployment

For production, you'll need:
- Netlify Functions (or similar serverless functions)
- OR deploy the proxy server alongside your app

The code automatically detects environment:
- `import.meta.env.DEV` is `true` → Uses proxy
- Production → Direct API (configure in deployment)

## Troubleshooting

### Proxy won't start
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart
npm run dev:all
```

### Still getting CORS errors
- Make sure proxy server is running (check port 3001)
- Check browser console for proxy connection errors
- Verify `.env` file has `VITE_ANTHROPIC_API_KEY`

### API key not found
- Create `.env` file in project root
- Add: `VITE_ANTHROPIC_API_KEY=your-api-key-here`
- Restart both servers

## Files Changed
- ✅ Created `server/proxy.js` - Proxy server
- ✅ Updated `src/lib/claude.ts` - Routes through proxy
- ✅ Updated `package.json` - Added dev:all script
- ✅ Installed `express`, `cors`, `concurrently`

