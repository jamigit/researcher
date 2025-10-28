# Environment Setup Guide

This guide covers setting up the required environment variables for the ME/CFS Research Tracker.

## Required Environment Variables

The application uses environment variables for API keys and configuration. These should be stored in a `.env` file in the project root.

### 1. Claude AI API Key (Phase 2+)

**Purpose**: Powers AI features including evidence extraction, contradiction detection, and answer synthesis.

**Required for**:
- Q&A system (asking research questions)
- Evidence extraction from papers
- Contradiction detection and analysis

**Setup**:
1. Create an account at [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Add to `.env`:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

**Rate Limits**: See [Anthropic pricing](https://www.anthropic.com/pricing) for current limits.

**Fallback**: If not configured, the Q&A system will gracefully degrade:
- Evidence extraction will be skipped with a warning
- Contradiction analysis will use template-based fallbacks
- Papers can still be added and browsed normally

### 2. NCBI/PubMed API Configuration

**Purpose**: Enables smart paper fetching from PubMed database.

**Required for**:
- Fetching papers by PMID
- Fetching papers by PubMed URL
- Enriching paper metadata

**Setup**:
1. Email is required (no account needed):
   ```env
   VITE_NCBI_EMAIL=your-email@example.com
   ```
2. (Optional) API key for higher rate limits:
   - Register at [NCBI Account](https://www.ncbi.nlm.nih.gov/account/)
   - Generate an API key
   - Add to `.env`:
     ```env
     VITE_NCBI_API_KEY=your_api_key_here
     ```

**Rate Limits**:
- Without API key: 3 requests/second
- With API key: 10 requests/second

### 3. Application Name

**Purpose**: Sets the display name for the application.

**Default**: "ME/CFS Research Tracker"

**Setup** (optional):
```env
VITE_APP_NAME=My Custom Name
```

## Creating Your .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`

3. **NEVER commit `.env` to git** - it's already in `.gitignore`

## Example .env File

```env
# Claude AI (Required for Q&A features)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# PubMed (Required for smart paper fetching)
VITE_NCBI_EMAIL=researcher@university.edu
VITE_NCBI_API_KEY=your_ncbi_key  # Optional

# Application
VITE_APP_NAME=ME/CFS Research Tracker
```

## Verifying Setup

After setting up your `.env` file:

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Check browser console for any API key warnings

3. Test features:
   - Try adding a paper by PMID (tests NCBI setup)
   - Try asking a question (tests Claude setup)

## Troubleshooting

### "Claude API not configured" Warning

**Symptom**: Q&A features show warnings about Claude not being configured.

**Solution**:
1. Verify `.env` file exists in project root
2. Check `VITE_ANTHROPIC_API_KEY` is set
3. Restart dev server after changing `.env`

### "PubMed fetch failed" Errors

**Symptom**: Cannot fetch papers by PMID or PubMed URL.

**Solution**:
1. Verify `VITE_NCBI_EMAIL` is set in `.env`
2. Check network connection
3. Verify PMID is correct
4. Check NCBI E-utilities status at [https://www.ncbi.nlm.nih.gov/](https://www.ncbi.nlm.nih.gov/)

### API Key Not Loading

**Symptom**: Environment variables are undefined at runtime.

**Common causes**:
1. `.env` file not in project root
2. Variable name doesn't start with `VITE_`
3. Dev server not restarted after changing `.env`

**Solution**:
1. Ensure file is named exactly `.env` (not `.env.local` or `.env.txt`)
2. Verify all variable names start with `VITE_`
3. Restart dev server: `npm run dev`

## Security Notes

1. **Never commit `.env` to git** - it contains sensitive API keys
2. **Never expose keys in client code** - all keys should be in `.env`
3. **Use separate keys for development and production**
4. **Rotate keys periodically** for security
5. **Consider rate limits** when setting up automation

## Production Deployment

For production deployments (Netlify, Vercel, etc.):

1. Add environment variables in the hosting platform's dashboard
2. Use the same variable names (with `VITE_` prefix)
3. Never commit production keys to git
4. Set up separate keys for staging/production environments

### Netlify Example

1. Go to Site Settings → Environment Variables
2. Add each variable:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: `your-production-key`
3. Redeploy site to pick up new variables

## Cost Estimates

### Claude API (Anthropic)

Based on typical usage patterns:

- **Evidence extraction**: ~500-1000 tokens per paper
- **Contradiction analysis**: ~1000-2000 tokens per contradiction
- **Question synthesis**: ~2000-3000 tokens per question

**Estimated costs** (as of 2024):
- Testing/development: $5-10/month
- Active research (10 questions/week): $20-30/month
- Heavy use (daily research): $50-100/month

See [Anthropic pricing](https://www.anthropic.com/pricing) for current rates.

### NCBI E-utilities

**Cost**: Free for all use (academic and commercial)

**Limits**: 
- 3 req/sec without key
- 10 req/sec with free API key

## Further Reading

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [NCBI E-utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25501/)

