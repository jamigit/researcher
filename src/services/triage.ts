import type { ResearchPaper } from '@/types/paper';
import { splitIntoSections } from '@/utils/chunking';
import { callLLMResilient, CONSERVATIVE_SYSTEM_PROMPT, isClaudeConfigured } from '@/lib/claude';

/**
 * Summarize based on abstract and key metadata for stage-1 triage.
 */
export async function summarizeAbstract(paper: ResearchPaper): Promise<{ summary: string }> {
  const abstract = paper.abstract || '';
  const metaLine = `${paper.title} — ${paper.authors.map((a) => a.name).join(', ')} (${paper.publicationDate?.slice(0, 4)})`;

  // Prefer Claude JSON if available for higher quality
  try {
    if (isClaudeConfigured()) {
      const prompt = `Return ONLY JSON: { "summary": string }\nSummarize conservatively for triage.\nTitle: ${paper.title}\nAbstract: ${abstract}`;
      const res = await callLLMResilient<{ summary: string }>(prompt, {
        systemPrompt: CONSERVATIVE_SYSTEM_PROMPT,
        maxTokens: 600,
        temperature: 0.2,
        timeoutMs: 10000,
        validate: (o: any): o is { summary: string } => !!o && typeof o.summary === 'string' && o.summary.length > 0,
        reaskPrompt: (orig) => `Return ONLY valid minified JSON matching { "summary": string }.\n${orig}`,
      });
      if (res?.summary) return { summary: `${metaLine}\n${res.summary}` };
    }
  } catch (_) {
    // fall through to heuristic summary
  }

  // Heuristic fallback (first 2 sentences)
  const sentences = abstract.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
  return { summary: `${metaLine}\n${sentences}` };
}

/**
 * Analyze full text on demand for stage-2 triage. Ensures sections parsed.
 */
export async function analyzeFullText(paper: ResearchPaper): Promise<{
  sections: Record<string, string>;
  notes?: string;
}> {
  let sections = paper.sections || {};
  if ((!sections || Object.keys(sections).length === 0) && paper.fullText) {
    sections = splitIntoSections(paper.fullText);
  }

  // Optionally call LLM to extract methodology and key findings later
  return { sections };
}

export interface ReReviewOptions {
  analyzeFullText?: boolean;
  generateTags?: boolean;
}

/**
 * Batch re-review of all existing papers: parse sections and/or generate tags.
 */
export async function reReviewAllPapers(options: ReReviewOptions = {}): Promise<{
  processed: number;
}> {
  const { db } = await import('@/services/db');
  const { generateTagsLLM } = await import('@/services/tags');

  const papers = await db.papers.toArray();
  let processed = 0;
  // Build existing tag vocabulary once
  const vocab = Array.from(new Set(papers.flatMap((p) => p.tags || [])));

  for (const paper of papers) {
    const updates: Partial<ResearchPaper> = {} as any;

    if (options.analyzeFullText) {
      const res = await analyzeFullText(paper as ResearchPaper);
      if (res.sections && Object.keys(res.sections).length > 0) (updates as any).sections = res.sections;
    }

    if (options.generateTags) {
      const suggestions = await generateTagsLLM(
        { title: paper.title, abstract: paper.abstract, sections: (paper as any).sections },
        vocab
      );
      const nextTags = Array.from(new Set([...(paper.tags || []), ...suggestions.map((t) => t.tag)]));
      (updates as any).tags = nextTags;
      (updates as any).autoTags = suggestions;
    }

    if (Object.keys(updates).length > 0) {
      await db.papers.update(paper.id, updates);
      processed++;
    }
  }

  return { processed };
}


