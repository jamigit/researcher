# ✅ Verify Papers Are Loaded

## 1. Open the App
```
http://localhost:5173
```

## 2. Check Browser Console
**Press F12 or Cmd+Option+I** to open DevTools

Look for one of these messages:

### ✅ Papers Were Auto-Loaded (First Time):
```
Database initialized successfully
📦 Auto-loading seed data...
Loading seed data...
✅ Loaded 32 papers from seed data (generated 10/28/2025)
```

### ✅ Papers Already in Database:
```
Database initialized successfully  
Database already has 32 papers. Skipping seed.
```

## 3. View Papers
Click "Papers" in the navigation → You should see **32 papers**

---

## 🔧 Troubleshooting

### Issue: "Database already has 0 papers"
This means the JSON import failed.

**Quick Fix:**
```bash
# Restart the dev server
pkill -f "vite|node"
npm run dev:all
```

Then refresh browser (Cmd+R or Ctrl+R)

### Issue: No papers showing on Papers page
1. Open DevTools Console
2. Run this:
```javascript
// Check paper count
navigator.storage && navigator.storage.estimate().then(estimate => {
  console.log('Storage used:', Math.round(estimate.usage / 1024), 'KB');
});

// List first 3 papers
(async () => {
  const { db } = await import('/src/services/db.js');
  const papers = await db.papers.limit(3).toArray();
  console.log('First 3 papers:', papers.map(p => ({ id: p.id, title: p.title })));
})();
```

### Issue: Import error or module not found
Clear browser cache:
1. DevTools → Application tab
2. Clear storage → Clear site data
3. Refresh page

---

## 📊 Expected Result

After startup, you should see:
- **Dashboard**: Shows "32 papers" in collection
- **Papers page**: List of 32 papers with titles and metadata
- **Console**: Success messages about seed data loading

The papers will **persist** in IndexedDB - they only load once on first startup, then stay in your browser's database.

---

## 🧹 Reset Database (If Needed)

To clear and reload seed data:

1. DevTools → Application → Storage → IndexedDB
2. Right-click "ResearchTrackerDB" → Delete database  
3. Refresh page (Cmd+R)
4. Seed data will auto-load again

OR run in console:
```javascript
(async () => {
  const { clearAllData } = await import('/src/services/db.js');
  await clearAllData();
  console.log('Database cleared! Refresh page to reload seed data.');
})();
```

Then refresh the page.

