# ✅ Switched to Claude Haiku 3.5

## Model Changed
- **From:** `claude-3-5-sonnet-20240620` (more capable, slower, $$$)
- **To:** `claude-3-5-haiku-20241022` (faster, cheaper, great for this use case)

## Why Haiku?

### Speed
- **Sonnet**: ~30-60 seconds for 32 papers
- **Haiku**: ~10-20 seconds for 32 papers (estimated)

### Cost
- **Haiku**: ~80% cheaper than Sonnet
- Perfect for high-volume extraction tasks

### Quality
- Haiku 3.5 is excellent for structured extraction
- More than sufficient for evidence extraction & citation
- Maintained by Anthropic's latest architecture

## Files Updated
1. ✅ `src/utils/constants.ts`
2. ✅ `server/proxy.js`

## Next Steps

1. **Refresh browser** (Cmd+R)
2. Try asking a question
3. Should see much faster processing! ⚡

---

## Performance Comparison (Expected)

| Task | Sonnet 3.5 | Haiku 3.5 |
|------|-----------|-----------|
| Extract 32 papers | 30-60s | 10-20s ⚡ |
| Cost per 1M tokens | $3.00 | $0.25 💰 |
| Quality | Excellent | Very Good ✅ |
| Best for | Complex reasoning | Fast extraction ✅ |

For this use case (evidence extraction with structured JSON output), **Haiku is perfect**.

---

**Proxy restarted. Refresh your browser (Cmd+R) and test!** 🚀

