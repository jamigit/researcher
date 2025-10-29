# Testing Seed Data Load

Open browser console at http://localhost:5173 and check for these messages:

## Expected Console Output

```
Database initialized successfully
📦 Auto-loading seed data...
Loading seed data...
✅ Loaded 32 papers from seed data (generated 10/28/2025)
```

## If You Don't See Papers

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Check for errors**

### Common Issues:

#### Issue: "Failed to import module"
**Fix**: JSON import issue
```bash
# The vite config needs to be updated
# Already fixed in latest code
```

#### Issue: Database is not empty
**Fix**: Clear IndexedDB
1. DevTools → Application tab
2. Storage → IndexedDB
3. Right-click "ResearchTrackerDB" → Delete
4. Refresh page (Cmd+R)

#### Issue: Papers load but don't show
**Fix**: Navigate to Papers page
- Click "Papers" in the navigation

## Manual Check

Open browser console and run:
```javascript
// Check if database has papers
const db = await import('./src/services/db.js').then(m => m.db);
const count = await db.papers.count();
console.log(`Papers in database: ${count}`);

// List all papers
const papers = await db.papers.toArray();
console.log('Papers:', papers);
```

## Force Reload Seed Data

If you want to reload the seed data:

1. Clear database (see above)
2. Refresh page
3. Seed data will auto-load

OR manually in console:
```javascript
const { autoSeedIfNeeded } = await import('./src/services/seedData.js');
await autoSeedIfNeeded();
```

