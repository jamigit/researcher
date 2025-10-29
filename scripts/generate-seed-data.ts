/**
 * One-time script to process PDFs and generate seed data
 * Run with: npm run seed:generate
 * 
 * This script:
 * 1. Reads all PDFs from a specified folder
 * 2. Extracts metadata and text
 * 3. Saves as JSON seed data
 * 4. App will auto-load this data on first run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure PDF.js
const PDFJS_WORKER_SRC = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');

interface SeedPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  fullText: string;
  publicationDate: string;
  journal?: string;
  doi?: string;
  pubmedId?: string;
  pdfUrl?: string;
  categories: string[];
  tags: string[];
  dateAdded: string;
  readStatus: 'unread' | 'reading' | 'read';
  importance: 'low' | 'medium' | 'high';
}

/**
 * Extract text from PDF buffer
 */
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

/**
 * Extract metadata from PDF text
 */
function extractMetadata(text: string, filename: string): Partial<SeedPaper> {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract title (usually first significant line)
  const title = lines.find(line => line.length > 20 && line.length < 200) 
    || filename.replace('.pdf', '').replace(/_/g, ' ');

  // Extract authors (look for common patterns)
  const authorsMatch = text.match(/Authors?:\s*([^\n]+)/i) 
    || text.match(/By\s+([^\n]+)/i);
  const authors = authorsMatch 
    ? authorsMatch[1].split(/,|and/).map(a => a.trim()).filter(a => a.length > 2 && a.length < 50)
    : ['Unknown Author'];

  // Extract abstract (look for "Abstract" section)
  const abstractMatch = text.match(/Abstract[\s:]+([^\n]+(?:\n[^\n]+){0,10})/i);
  const abstract = abstractMatch 
    ? abstractMatch[1].trim().substring(0, 500)
    : text.substring(0, 500);

  // Extract publication date
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  const publicationDate = yearMatch 
    ? `${yearMatch[0]}-01-01`
    : new Date().toISOString().split('T')[0];

  // Extract DOI
  const doiMatch = text.match(/DOI:\s*(10\.\d{4,}\/[^\s]+)/i) 
    || text.match(/doi\.org\/(10\.\d{4,}\/[^\s]+)/i);
  const doi = doiMatch ? doiMatch[1] : undefined;

  // Extract journal name
  const journalMatch = text.match(/(?:Published in|Journal of|Journal:)\s*([^\n]+)/i);
  const journal = journalMatch ? journalMatch[1].trim() : undefined;

  return {
    title,
    authors,
    abstract,
    publicationDate,
    doi,
    journal,
  };
}

/**
 * Process all PDFs in a folder
 */
async function processPDFFolder(folderPath: string): Promise<SeedPaper[]> {
  const papers: SeedPaper[] = [];
  
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    console.log('Please create the folder and add PDF files, or update the path in this script.');
    return papers;
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => file.toLowerCase().endsWith('.pdf'));

  console.log(`Found ${files.length} PDF files`);

  for (const file of files) {
    console.log(`Processing: ${file}`);
    
    try {
      const filePath = path.join(folderPath, file);
      const pdfBuffer = fs.readFileSync(filePath);
      
      // Extract text
      const fullText = await extractTextFromPDF(pdfBuffer);
      
      // Extract metadata
      const metadata = extractMetadata(fullText, file);
      
      // Create paper object
      const paper: SeedPaper = {
        id: `seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: metadata.title || file.replace('.pdf', ''),
        authors: metadata.authors || ['Unknown Author'],
        abstract: metadata.abstract || fullText.substring(0, 500),
        fullText: fullText.substring(0, 10000), // Limit to first 10k chars
        publicationDate: metadata.publicationDate || new Date().toISOString().split('T')[0],
        journal: metadata.journal,
        doi: metadata.doi,
        categories: ['ME/CFS'], // Default category
        tags: ['auto-imported'],
        dateAdded: new Date().toISOString(),
        readStatus: 'unread',
        importance: 'medium',
      };
      
      papers.push(paper);
      console.log(`  ✓ Extracted: ${paper.title.substring(0, 60)}...`);
      
    } catch (error) {
      console.error(`  ✗ Failed to process ${file}:`, error);
    }
  }

  return papers;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== PDF Seed Data Generator ===\n');
  
  // Configure the PDF folder path here
  // Default to test fixtures if they exist, otherwise seed-pdfs
  const testFixturesPath = path.join(__dirname, '../src/test/fixtures/pdfs');
  const seedPdfsPath = path.join(__dirname, '../seed-pdfs');
  
  let pdfFolderPath = process.env.PDF_FOLDER;
  if (!pdfFolderPath) {
    if (fs.existsSync(testFixturesPath)) {
      pdfFolderPath = testFixturesPath;
      console.log('Using test fixtures PDFs');
    } else {
      pdfFolderPath = seedPdfsPath;
    }
  }
  
  console.log(`Looking for PDFs in: ${pdfFolderPath}\n`);
  
  // Process PDFs
  const papers = await processPDFFolder(pdfFolderPath);
  
  if (papers.length === 0) {
    console.log('\n⚠️  No papers were processed.');
    console.log('\nTo use this script:');
    console.log('1. Create a folder: researcher/seed-pdfs/');
    console.log('2. Add your PDF files to that folder');
    console.log('3. Run: npm run seed:generate');
    console.log('\nOr set PDF_FOLDER environment variable to use a different folder.');
    return;
  }
  
  // Save seed data
  const seedData = {
    papers,
    generated: new Date().toISOString(),
    count: papers.length,
  };
  
  const outputPath = path.join(__dirname, '../src/data/seed-data.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  
  console.log(`\n✅ Successfully generated seed data!`);
  console.log(`   Papers processed: ${papers.length}`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\n🚀 Seed data will auto-load when you start the app.`);
}

// Run the script
main().catch(console.error);

