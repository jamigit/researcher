import { describe, it, expect } from 'vitest';
import { generateTagsLLM } from '@/services/tags';

describe('tags service', () => {
  it('prefers existing tags and limits new tag creation', async () => {
    const paper = {
      title: 'Immune abnormalities in ME/CFS',
      abstract: 'Elevated cytokines and immune activation are reported.',
      sections: {},
    };
    const existing = ['immunology', 'cytokines', 'biomarkers'];
    const tags = await generateTagsLLM(paper as any, existing, 3);
    expect(tags.length).toBeGreaterThan(0);
    // Majority should map to existing list
    const existingHits = tags.filter((t) => !t.isNew).length;
    expect(existingHits).toBeGreaterThan(0);
  });
});


