# Auto-Load PDF Seed Data

## What This Does

Pre-process PDFs once, then automatically load the data every time you start the app. No manual import needed!

## Setup (One-Time)

### 1. Add Your PDFs

Create a folder and add your PDF files:

```bash
mkdir seed-pdfs
# Copy your PDF files into this folder
```

### 2. Install tsx (if not already installed)

```bash
npm install --save-dev tsx
```

Or fix npm permissions first if you get an error:
```bash
sudo chown -R $(whoami) ~/.npm
npm install --save-dev tsx
```

### 3. Generate Seed Data

```bash
npm run seed:generate
```

This will:
- ✅ Read all PDFs from `seed-pdfs/` folder
- ✅ Extract title, authors, abstract, full text
- ✅ Save to `src/data/seed-data.json`

### 4. Done!

Now every time you run the app, it will:
- Check if database is empty
- If empty, auto-load all the seed data
- Papers appear immediately, no manual import

## Usage

### After Setup

Just run the app normally:
```bash
npm run dev
```

The seed data loads automatically on first launch!

### Add More PDFs Later

1. Add new PDFs to `seed-pdfs/` folder
2. Run `npm run seed:generate` again
3. Clear browser data (or use a new browser profile)
4. Run `npm run dev`

## Custom PDF Folder

Use a different folder:
```bash
PDF_FOLDER=/path/to/your/pdfs npm run seed:generate
```

## What Gets Extracted

From each PDF:
- **Title**: First significant line or filename
- **Authors**: Pattern matching for author lists
- **Abstract**: "Abstract" section or first 500 chars
- **Full Text**: All text content (first 10K chars)
- **Publication Date**: Year from PDF or current date
- **DOI**: If present in PDF
- **Journal**: If present in PDF

## File Structure

```
researcher/
├── seed-pdfs/              # Put your PDFs here
│   ├── paper1.pdf
│   ├── paper2.pdf
│   └── ...
├── scripts/
│   └── generate-seed-data.ts  # PDF processor script
├── src/
│   ├── data/
│   │   └── seed-data.json     # Generated seed data
│   └── services/
│       └── seedData.ts         # Auto-loader service
└── package.json               # Added seed:generate script
```

## Troubleshooting

### "No PDFs found"
- Make sure `seed-pdfs/` folder exists
- Check that files end with `.pdf`

### "Failed to extract text"
- Some PDFs are scanned images (not text)
- Try OCR or use a different PDF

### "Permission denied"
- Fix npm permissions: `sudo chown -R $(whoami) ~/.npm`
- Or use `sudo npm install tsx --unsafe-perm`

### Data doesn't load
- Check browser console for errors
- Clear IndexedDB: DevTools → Application → Storage → Clear
- Restart app

## Example

```bash
# 1. Add PDFs
mkdir seed-pdfs
cp ~/Documents/research/*.pdf seed-pdfs/

# 2. Generate seed data
npm run seed:generate

# Output:
# Found 5 PDF files
# Processing: mecfs-biomarkers-2023.pdf
#   ✓ Extracted: Biomarkers for Myalgic Encephalomyelitis/Chronic Fatigue...
# Processing: immune-dysfunction-2022.pdf
#   ✓ Extracted: Immune System Dysfunction in ME/CFS Patients...
# ...
# ✅ Successfully generated seed data!
#    Papers processed: 5
#    Saved to: src/data/seed-data.json

# 3. Run app
npm run dev

# Console output:
# 📦 Auto-loading seed data...
# ✅ Loaded 5 papers from seed data
```

## Benefits

✅ **One-time setup** - Process PDFs once, use forever  
✅ **Auto-loads** - No manual import every time  
✅ **Version control** - Seed data is JSON, can commit to git  
✅ **Fast startup** - No processing delay on app launch  
✅ **Demo ready** - Perfect for showing off the app  
✅ **Development friendly** - Reset database, data comes back automatically

