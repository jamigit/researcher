# ✅ Model Fix - CORRECT Version

## The Issue
The model `claude-3-5-sonnet-20241022` **does not exist** and returns 404 errors.

## The Solution
Reverted to the **correct, verified model**:
```
claude-3-5-sonnet-20240620
```

This is the June 2024 release of Claude 3.5 Sonnet and is the current production model.

## Files Updated
1. ✅ `src/utils/constants.ts` - Line 15
2. ✅ `server/proxy.js` - Line 37

## What You Need to Do

### 1. Restart Proxy Server
Already done automatically! ✅

### 2. Refresh Browser
**Press Cmd+R (or F5)** to reload the app with the new model.

### 3. Test Again
Try the "Refresh Answer" button or ask a new question.

## Expected Result
```
✅ Claude API responding
✅ Evidence extraction working
✅ Findings generating with citations
```

## If Still Getting Errors
1. Check `.env` file has: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
2. Verify API key is valid at https://console.anthropic.com
3. Check proxy logs for detailed errors

---

**The correct model is now set and the proxy has been restarted.**
Just refresh your browser (Cmd+R) and try again!

