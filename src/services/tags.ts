import type { ResearchPaper, AutoTag } from '@/types/paper';

function normalizeTag(t: string): string {
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
}

function jaccard(a: string, b: string): number {
  const as = new Set(a.split(' '));
  const bs = new Set(b.split(' '));
  const inter = new Set([...as].filter((x) => bs.has(x))).size;
  const union = new Set([...as, ...bs]).size;
  return union === 0 ? 0 : inter / union;
}

/**
 * Generate tags preferring an existing vocabulary; propose new tags only when
 * no existing tag is similar (>= 0.8 Jaccard) to the candidate.
 */
export async function generateTagsLLM(
  paper: Pick<ResearchPaper, 'title' | 'abstract' | 'sections'>,
  existingTags: string[],
  topN = 6
): Promise<AutoTag[]> {
  const uniqExisting = Array.from(new Set(existingTags.map(normalizeTag)));
  const existingNorm = uniqExisting;
  const baseContext = [paper.title, paper.abstract, Object.values(paper.sections || {}).join(' ')].join('\n').slice(0, 8000);

  // Try Claude for suggestions
  try {
    const { callClaudeJSON, isClaudeConfigured } = await import('@/lib/claude');
    if (isClaudeConfigured()) {
      const prompt = `You assign tags to biomedical papers. Prefer existing tags; only create a new tag when no existing tag is suitable. Return JSON { tags: [{ tag, confidence }] }.\nExisting tags: ${existingTags.join(', ')}\nTitle: ${paper.title}\nAbstract/Sections: ${baseContext.slice(0, 3000)}`;
      const res = await callClaudeJSON<{ tags: Array<{ tag: string; confidence: number }> }>(prompt, {
        maxTokens: 400,
        temperature: 0.2,
      });
      const raw = res?.tags || [];
      const mapped: AutoTag[] = raw.slice(0, topN).map((t) => ({ tag: t.tag, confidence: t.confidence, source: 'llm' }));

      // Enforce existing-vocab preference
      const preferred = mapped.map((t) => {
        const n = normalizeTag(t.tag);
        const maxSim = Math.max(0, ...existingNorm.map((e) => jaccard(n, e)));
        return { ...t, isNew: maxSim < 0.8 };
      });
      // Snap close matches to exact existing tag label to minimize new tag creation
      return preferred.map((t) => {
        if (t.isNew) return t;
        const n = normalizeTag(t.tag);
        let best = n;
        let bestSim = 0;
        for (const e of existingNorm) {
          const sim = jaccard(n, e);
          if (sim > bestSim) {
            bestSim = sim;
            best = e;
          }
        }
        // Map back to original casing of existing tag
        const original = uniqExisting.find((e) => e === best);
        return { ...t, tag: original || t.tag };
      });
    }
  } catch (_) {
    // fall back below
  }

  // Heuristic fallback: extract top keywords from title/abstract
  const text = baseContext.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = text.split(/\s+/).filter((w) => w.length > 3);
  const stop = new Set(['with', 'that', 'this', 'from', 'were', 'have', 'been', 'between', 'into', 'about', 'over', 'under', 'such']);
  const freq = new Map<string, number>();
  for (const w of words) if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  const candidates = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN * 2)
    .map(([w]) => w);

  const out: AutoTag[] = [];
  for (const c of candidates) {
    const n = normalizeTag(c);
    if (out.find((t) => normalizeTag(t.tag) === n)) continue;
    const maxSim = Math.max(0, ...existingNorm.map((e) => jaccard(n, e)));
    const isNew = maxSim < 0.8;
    const chosen = isNew ? c : existingTags[existingNorm.findIndex((e) => jaccard(n, e) === maxSim)] || c;
    out.push({ tag: chosen, confidence: 0.5 + Math.min(0.4, (freq.get(c) || 1) / 20), source: 'rule', isNew });
    if (out.length >= topN) break;
  }
  return out;
}


