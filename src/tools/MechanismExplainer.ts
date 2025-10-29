/**
 * MechanismExplainer Tool
 * Generates plain language + technical explanations of biological mechanisms
 * @ai-context Plain language MUST be 10th grade reading level or below
 */

import type { ResearchPaper } from '@/types/paper';
import type {
  MechanismExplainer,
  PlainLanguageExplanation,
  TechnicalDetails,
} from '@/types/mechanism';
import { createMechanismExplainer, detectMechanismsInText } from '@/types/mechanism';

/**
 * Prompt template for generating mechanism explanations
 */
const createExplainerPrompt = (mechanism: string, papers: ResearchPaper[]): string => {
  const paperSummaries = papers
    .map((p, i) => {
      return `Paper ${i + 1}: ${p.title}
Authors: ${p.authors.map((a) => a.name).join(', ')}
Journal: ${p.journal || 'N/A'}
Year: ${p.publicationDate ? new Date(p.publicationDate).getFullYear() : 'N/A'}
Abstract: ${p.abstract.substring(0, 500)}...`;
    })
    .join('\n\n');

  return `You are explaining a biological mechanism to a patient with ME/CFS.

Mechanism: ${mechanism}

Papers that discuss this mechanism:
${paperSummaries}

Create a two-level explanation:

PLAIN LANGUAGE (10th grade reading level):
1. What is it? (1-2 sentences, simple definition - no jargon)
2. How does it work? (3-4 sentences, use simple analogies like comparing to everyday things)
3. Why does it matter for ME/CFS? (2-3 sentences, explain the relevance to symptoms)

Use analogies and metaphors. Avoid jargon. If you must use a technical term, define it immediately in simple words.

TECHNICAL DETAILS (for scientifically-minded users):
1. Biochemical process (specific pathways, proteins, enzymes, cellular processes)
2. Evidence from papers (cite specific findings from the papers above, including study types and sample sizes if mentioned)
3. Uncertainties or debates (what is still unknown or disputed)

Output as valid JSON with this structure:
{
  "plainLanguage": {
    "definition": "...",
    "howItWorks": "...",
    "relevance": "..."
  },
  "technicalDetails": {
    "biochemicalProcess": "...",
    "evidence": ["finding 1", "finding 2", ...],
    "uncertainties": ["uncertainty 1", "uncertainty 2", ...]
  }
}

CRITICAL: Plain language section must be readable by someone with a 10th grade education. No medical jargon without explanation.`;
};

/**
 * Generate a new mechanism explainer using Claude API
 */
export const generateExplainer = async (
  mechanism: string,
  papers: ResearchPaper[]
): Promise<MechanismExplainer> => {
  try {
    console.log('Generating explainer for:', mechanism);

    // Import Claude client
    const { callClaudeJSON, CONSERVATIVE_SYSTEM_PROMPT, isClaudeConfigured } =
      await import('@/lib/claude');

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      console.warn('Claude API not configured. Using placeholder explainer.');
      return createPlaceholderExplainer(mechanism, papers);
    }

    // Create prompt
    const prompt = createExplainerPrompt(mechanism, papers);

    // Call Claude API
    const response = await callClaudeJSON<{
      plainLanguage: PlainLanguageExplanation;
      technicalDetails: TechnicalDetails;
    }>(prompt, {
      systemPrompt: CONSERVATIVE_SYSTEM_PROMPT,
      maxTokens: 3000,
      temperature: 0.4, // Slightly higher for creative analogies
    });

    // Create explainer
    const explainer = createMechanismExplainer(
      mechanism,
      response.plainLanguage,
      response.technicalDetails,
      papers.map((p) => p.id)
    );

    console.log('Explainer generated successfully');
    return explainer;
  } catch (error) {
    console.error('Failed to generate explainer:', error);
    // Return placeholder on error
    return createPlaceholderExplainer(mechanism, papers);
  }
};

/**
 * Create a placeholder explainer when Claude is not available
 */
const createPlaceholderExplainer = (
  mechanism: string,
  papers: ResearchPaper[]
): MechanismExplainer => {
  return createMechanismExplainer(
    mechanism,
    {
      definition: `${mechanism} is a biological process that may be relevant to ME/CFS.`,
      howItWorks: `This mechanism involves complex biological processes. More research is needed to fully understand how it works in ME/CFS patients.`,
      relevance: `Understanding ${mechanism} may help explain some ME/CFS symptoms. ${papers.length} paper${papers.length !== 1 ? 's' : ''} in your collection discuss this mechanism.`,
    },
    {
      biochemicalProcess: 'Technical details require Claude API to be configured.',
      evidence: papers.map(
        (p) => `${p.title} (${p.authors[0]?.name || 'Unknown'}, ${new Date(p.publicationDate).getFullYear()})`
      ),
      uncertainties: ['Detailed analysis requires Claude API configuration.'],
    },
    papers.map((p) => p.id)
  );
};

/**
 * Update an existing explainer with new papers
 */
export const updateExplainerWithNewPapers = async (
  explainer: MechanismExplainer,
  newPapers: ResearchPaper[]
): Promise<MechanismExplainer> => {
  try {
    // For now, regenerate the entire explainer with all papers
    // Future: Could be optimized to append new evidence
    // Future: Would need to fetch existing papers and combine with new ones

    return await generateExplainer(explainer.mechanism, newPapers);
  } catch (error) {
    console.error('Failed to update explainer:', error);
    throw new Error('Failed to update explainer');
  }
};

/**
 * Detect mechanisms in text (finding descriptions, abstracts, etc.)
 * Returns list of detected mechanism names
 */
export const detectMechanisms = (text: string): string[] => {
  return detectMechanismsInText(text);
};

/**
 * Calculate readability score (Flesch-Kincaid grade level)
 * Target: 10 or below for plain language
 */
export const calculateReadabilityScore = (text: string): number => {
  // Simple approximation of Flesch-Kincaid grade level
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return Math.max(0, Math.round(score * 10) / 10);
};

/**
 * Count syllables in a word (simple approximation)
 */
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  // Adjust for silent 'e'
  if (word.endsWith('e')) {
    syllableCount--;
  }

  return Math.max(1, syllableCount);
};

