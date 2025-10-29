# Claude API Troubleshooting Guide

## Issue: "Claude API Not Configured" Banner Appears

### Quick Fix (Most Common)

**The dev server needs to be restarted after adding the `.env` file:**

```bash
# Stop all running instances
lsof -ti:5173 -ti:5174 | xargs kill -9 2>/dev/null

# Restart
npm run dev
```

Then:
1. **Refresh browser** (Cmd+Shift+R or Ctrl+Shift+R)
2. Go to Questions page
3. Yellow banner should be gone ✅

---

## Verification Checklist

### 1. Check .env File Exists

```bash
ls -la .env
```

Should show: `.env` file in project root

### 2. Check API Key Format

```bash
cat .env | grep VITE_ANTHROPIC_API_KEY
```

Should show: `VITE_ANTHROPIC_API_KEY=sk-ant-...`

**Requirements:**
- ✅ Key starts with `sk-ant-`
- ✅ No spaces around the `=`
- ✅ No quotes needed
- ✅ File is named exactly `.env` (not `.env.local` or `.env.example`)

### 3. Verify Server Loaded Environment

Open browser console (F12) and run:

```javascript
console.log('API Key Loaded:', !!import.meta.env.VITE_ANTHROPIC_API_KEY);
console.log('Key starts with sk-ant:', import.meta.env.VITE_ANTHROPIC_API_KEY?.startsWith('sk-ant-'));
```

Should show:
```
API Key Loaded: true
Key starts with sk-ant: true
```

### 4. Test API Directly

Go to: http://localhost:5173/src/test-api.html

Click "Run API Test" button - should show:
- ✅ API key configured correctly
- ✅ API connection successful
- ✅ Conservative language verified
- 🎉 ALL TESTS PASSED

---

## Common Issues & Solutions

### Issue: API Key in .env but Banner Still Shows

**Cause:** Browser cached old version without API key

**Solution:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache and restart
3. Try incognito/private window

### Issue: "Authentication Failed" Error

**Cause:** Invalid or expired API key

**Solution:**
1. Go to https://console.anthropic.com/settings/keys
2. Check if key is valid
3. Verify billing is active
4. Generate new key if needed
5. Update `.env` file
6. Restart dev server

### Issue: "Rate Limit Exceeded"

**Cause:** Too many API calls in short time

**Solution:**
1. Wait 5-10 minutes
2. Check usage at https://console.anthropic.com/settings/usage
3. Consider upgrading plan if hitting limits frequently

### Issue: Network Errors

**Cause:** Firewall, VPN, or connection issues

**Solution:**
1. Check internet connection
2. Try disabling VPN temporarily
3. Check if api.anthropic.com is accessible:
   ```bash
   curl -I https://api.anthropic.com/v1/messages
   ```

### Issue: Yellow Banner Appears Only on Questions Page

**Cause:** `isClaudeConfigured()` check running on that page

**Solution:**
1. This is expected behavior if API not configured
2. If API IS configured but banner shows:
   - Check browser console for errors (F12)
   - Verify `src/lib/claude.ts` is being imported correctly
   - Hard refresh browser

---

## Manual Verification Steps

### Step 1: Confirm File Location

```bash
pwd  # Should be in project root
ls .env  # Should exist
```

### Step 2: Check File Contents

```bash
cat .env
```

Should contain:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
```

### Step 3: Kill ALL Node Processes

```bash
pkill -f node
pkill -f vite
```

### Step 4: Fresh Start

```bash
npm run dev
```

Wait for "ready in XXX ms" message.

### Step 5: Open Fresh Browser Tab

Go to: http://localhost:5173

Navigate to **Questions** page.

**Expected Result:** No yellow warning banner ✅

---

## Environment Variable Rules (Vite)

Vite has specific rules for environment variables:

1. **Must start with `VITE_`** to be exposed to client code
   - ✅ `VITE_ANTHROPIC_API_KEY`
   - ❌ `ANTHROPIC_API_KEY` (won't work)

2. **Loaded at build/dev start** - not hot-reloaded
   - Must restart dev server after changes

3. **Accessible via `import.meta.env`**
   - Not `process.env` (that's Node.js only)

4. **File must be in project root**
   - Same directory as `package.json`

---

## Debug Commands

Run these to diagnose issues:

```bash
# Check if .env exists and has correct key
cat .env | grep VITE_ANTHROPIC_API_KEY

# Check if key format is correct
cat .env | grep "sk-ant-"

# Verify no typos in filename
ls -la | grep "\.env"

# Check running processes
lsof -i :5173
lsof -i :5174

# Test API from command line
node test-api-quick.mjs
```

---

## Still Not Working?

1. **Check browser console** (F12 → Console tab)
   - Look for errors
   - Check if `import.meta.env.VITE_ANTHROPIC_API_KEY` is defined

2. **Verify Anthropic Console**
   - Go to https://console.anthropic.com/
   - Check API keys page
   - Verify billing is active
   - Check usage isn't at limit

3. **Try test page**
   - http://localhost:5173/src/test-api.html
   - Click "Run API Test"
   - Read error message details

4. **Check STATUS.md and README.md**
   - Verify setup instructions match your configuration

---

## Success Indicators

When API is working correctly:

✅ No yellow banner on Questions page
✅ Browser console shows API key is loaded
✅ Test page shows "ALL TESTS PASSED"
✅ Can ask questions and get AI responses
✅ Mechanism badges appear and work
✅ Export functionality works

---

## Quick Reference

**API Key Format:**
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Restart Server:**
```bash
npm run dev
```

**Hard Refresh Browser:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Test URL:**
http://localhost:5173/src/test-api.html

**Anthropic Console:**
https://console.anthropic.com/

---

**Last Updated:** October 28, 2025

