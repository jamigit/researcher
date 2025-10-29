/**
 * Abstract Screening Workflow
 * Evaluates paper relevance from abstract only
 * @ai-context Fast relevance checking for discovered papers
 */

import { callClaudeJSON } from '@/lib/claude';
import type {
  PaperCandidate,
  AbstractReviewResult,
  ScreeningCriteria,
} from '@/types/discovery';

/**
 * Default screening criteria for ME/CFS papers
 */
export function getDefaultCriteria(): ScreeningCriteria {
  return {
    keywords: [
      'ME/CFS',
      'chronic fatigue syndrome',
      'myalgic encephalomyelitis',
      'post-exertional malaise',
      'SEID',
    ],
    minRelevanceScore: 0.5,
    requirePeerReviewed: false,
    excludeReviews: false,
    minSampleSize: 10,
  };
}

/**
 * Create Claude prompt for abstract screening
 */
function createScreeningPrompt(
  paper: PaperCandidate,
  criteria: ScreeningCriteria
): string {
  return `You are a medical research analyst specializing in ME/CFS (Myalgic Encephalomyelitis / Chronic Fatigue Syndrome) research.

Task: Evaluate this paper's relevance to ME/CFS research based on the abstract.

Paper:
Title: ${paper.title}
Abstract: ${paper.abstract}
Keywords: ${paper.keywords?.join(', ') || 'None'}
Publication Date: ${paper.publicationDate || 'Unknown'}

Screening Criteria:
- Primary focus: ME/CFS, chronic fatigue syndrome, myalgic encephalomyelitis
- Study quality: Peer-reviewed, adequate methodology
- Relevance topics: pathophysiology, biomarkers, treatment, diagnosis, immunology
- Minimum sample size: ${criteria.minSampleSize} (if applicable)

Evaluate the paper and provide:
1. Is this paper relevant to ME/CFS research? (true/false)
2. Relevance score 0-1 (0=not relevant, 1=highly relevant)
3. Brief reasoning for your score
4. Suggested research categories (pathophysiology, treatment, diagnosis, etc.)
5. Should this paper proceed to full-text review? (recommend if score > 0.7)
6. Confidence in your assessment (0-1)

Output ONLY valid JSON (no explanations, no markdown):
{
  "relevant": true/false,
  "relevanceScore": 0-1,
  "reasoning": "brief explanation",
  "suggestedCategories": ["category1", "category2"],
  "keepForFullReview": true/false,
  "confidence": 0-1
}

IMPORTANT: Return ONLY the JSON object. Be conservative with relevance scores.`;
}

/**
 * Screen paper abstract for relevance
 */
export async function screenAbstract(
  paper: PaperCandidate,
  criteria: ScreeningCriteria
): Promise<AbstractReviewResult> {
  // Validate input
  if (!paper.abstract || paper.abstract.length < 50) {
    return {
      relevant: false,
      relevanceScore: 0,
      reasoning: 'Abstract missing or too short to evaluate',
      suggestedCategories: [],
      keepForFullReview: false,
      confidence: 1.0,
    };
  }
  
  try {
    const prompt = createScreeningPrompt(paper, criteria);
    
    const result = await callClaudeJSON<AbstractReviewResult>(prompt, {
      maxTokens: 1000,
      temperature: 0.3, // Low temperature for consistent evaluation
      systemPrompt: 'You are a conservative medical research evaluator. Be strict with relevance criteria.',
    });
    
    // Validate result
    if (typeof result.relevanceScore !== 'number' ||
        result.relevanceScore < 0 ||
        result.relevanceScore > 1) {
      throw new Error('Invalid relevance score from Claude');
    }
    
    return result;
  } catch (error) {
    console.error('Abstract screening failed:', error);
    
    // Fallback: simple keyword matching
    return fallbackScreening(paper, criteria);
  }
}

/**
 * Fallback screening using keyword matching
 * Used when AI screening fails
 */
function fallbackScreening(
  paper: PaperCandidate,
  criteria: ScreeningCriteria
): AbstractReviewResult {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  
  // Check for ME/CFS keywords
  const keywordMatches = criteria.keywords.filter(keyword =>
    text.includes(keyword.toLowerCase())
  );
  
  const relevanceScore = keywordMatches.length > 0
    ? Math.min(keywordMatches.length * 0.3, 0.6) // Max 0.6 for keyword matching
    : 0;
  
  return {
    relevant: relevanceScore >= criteria.minRelevanceScore,
    relevanceScore,
    reasoning: `Fallback keyword matching: found ${keywordMatches.length} ME/CFS keywords`,
    suggestedCategories: [],
    keepForFullReview: false, // Don't recommend full review for fallback
    confidence: 0.5, // Low confidence for fallback
  };
}

/**
 * Batch screen multiple papers
 * Processes in parallel for speed
 */
export async function batchScreenAbstracts(
  papers: PaperCandidate[],
  criteria: ScreeningCriteria
): Promise<Array<{ paper: PaperCandidate; result: AbstractReviewResult }>> {
  console.log(`Screening ${papers.length} papers in batch...`);
  
  const results = await Promise.all(
    papers.map(async (paper) => ({
      paper,
      result: await screenAbstract(paper, criteria),
    }))
  );
  
  const approved = results.filter(r => r.result.keepForFullReview).length;
  const rejected = results.length - approved;
  
  console.log(`Screening complete: ${approved} approved, ${rejected} rejected`);
  
  return results;
}

/**
 * Filter papers by relevance threshold
 */
export function filterByRelevance(
  screenedPapers: Array<{ paper: PaperCandidate; result: AbstractReviewResult }>,
  minScore: number
): PaperCandidate[] {
  return screenedPapers
    .filter(({ result }) => result.relevanceScore >= minScore)
    .map(({ paper }) => paper);
}

