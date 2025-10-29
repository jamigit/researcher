import { describe, it, expect } from 'vitest';
import { splitIntoSections, chunkSection } from '@/utils/chunking';

const sample = `Abstract\nMitochondrial dysfunction is implicated.\n\nIntroduction\nBackground text.\n\nMethods\nWe conducted a study.\n\nResults\nWe found effects.\n\nDiscussion\nImplications.`;

describe('chunking utils', () => {
  it('splits into sections using common headings', () => {
    const sections = splitIntoSections(sample);
    expect(Object.keys(sections)).toContain('abstract');
    expect(Object.keys(sections)).toContain('introduction');
    expect(Object.keys(sections)).toContain('methods');
    expect(Object.keys(sections)).toContain('results');
    expect(Object.keys(sections)).toContain('discussion');
  });

  it('chunks section text into sentence-aware chunks', () => {
    const chunks = chunkSection('Sentence one. Sentence two. Sentence three.', 'results', 3);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].section).toBe('results');
    expect(chunks[0].text.length).toBeGreaterThan(0);
  });
});


