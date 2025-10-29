/**
 * Section-aware chunking utilities for paper full text
 */

export interface Chunk {
  index: number;
  section: string;
  text: string;
}

/**
 * Split raw text into common scientific sections using regex heuristics.
 */
export function splitIntoSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const markers = [
    { key: 'abstract', pattern: /\babstract\b/i },
    { key: 'introduction', pattern: /\bintroduction\b/i },
    { key: 'methods', pattern: /\bmaterials and methods\b|\bmethods\b|\bmethodology\b/i },
    { key: 'results', pattern: /\bresults\b/i },
    { key: 'discussion', pattern: /\bdiscussion\b|\bconclusion\b|\bconclusions\b/i },
  ];

  // Build index map of section starts
  const indices: Array<{ key: string; start: number }> = [];
  for (const m of markers) {
    const match = text.search(m.pattern);
    if (match !== -1) indices.push({ key: m.key, start: match });
  }

  if (indices.length === 0) {
    return { body: text };
  }

  indices.sort((a, b) => a.start - b.start);

  for (let i = 0; i < indices.length; i++) {
    const cur = indices[i];
    const next = indices[i + 1];
    const slice = text.substring(cur.start, next ? next.start : text.length);
    sections[cur.key] = slice.trim();
  }

  return sections;
}

/**
 * Chunk a section into ~targetWords-length chunks, sentence-aware.
 */
export function chunkSection(sectionText: string, sectionName: string, targetWords = 300): Chunk[] {
  const sentences = sectionText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let wordCount = 0;
  let index = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    chunks.push({ index: index++, section: sectionName, text: buffer.join(' ').trim() });
    buffer = [];
    wordCount = 0;
  };

  for (const s of sentences) {
    const words = s.trim().split(/\s+/).length;
    if (wordCount + words > targetWords * 1.2 && buffer.length > 0) {
      flush();
    }
    buffer.push(s.trim());
    wordCount += words;
    if (wordCount >= targetWords * 0.8) {
      flush();
    }
  }

  flush();
  return chunks;
}

/**
 * Chunk all sections and return a flat list of chunks.
 */
export function chunkAllSections(sections: Record<string, string>, targetWords = 300): Chunk[] {
  const out: Chunk[] = [];
  for (const [section, text] of Object.entries(sections)) {
    out.push(...chunkSection(text, section, targetWords));
  }
  return out;
}


