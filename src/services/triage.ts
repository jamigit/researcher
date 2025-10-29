import type { ResearchPaper } from '@/types/paper';
import { splitIntoSections } from '@/utils/chunking';

/**
 * Summarize based on abstract and key metadata for stage-1 triage.
 */
export async function summarizeAbstract(paper: ResearchPaper): Promise<{ summary: string }> {
  const abstract = paper.abstract || '';
  const metaLine = `${paper.title} — ${paper.authors.map((a) => a.name).join(', ')} (${paper.publicationDate?.slice(0, 4)})`;

  // Prefer Claude JSON if available for higher quality
  try {
    const { callClaudeJSON, CONSERVATIVE_SYSTEM_PROMPT, isClaudeConfigured } = await import('@/lib/claude');
    if (isClaudeConfigured()) {
      const prompt = `Summarize conservatively for triage. Title: ${paper.title}\nAbstract: ${abstract}`;
      const res = await callClaudeJSON<{ summary: string }>(prompt, {
        systemPrompt: CONSERVATIVE_SYSTEM_PROMPT,
        maxTokens: 600,
        temperature: 0.2,
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


