/**
 * EvidenceExtractor Tool
 * Extracts evidence from papers and synthesizes conservative answers
 * @ai-context CRITICAL: 100% conservative language compliance required
 */

import type { ResearchPaper } from '@/types/paper';
import type { Finding } from '@/types/finding';
import type { ExtractionResult } from '@/types/finding';
import type { EvidenceSynthesis, FindingSummary } from '@/types/question';
import { Consistency } from '@/types/finding';

/**
 * Conservative language rules
 * CRITICAL: These enforce evidence-based presentation
 */
export const CONSERVATIVE_RULES = {
  minPapersForFinding: 3,
  confidenceThreshold: 0.7,

  // Phrases that indicate overstatement
  bannedPhrases: [
    'proves',
    'the consensus',
    'definitely',
    'always',
    'never',
    'all patients',
    'caused by',
    'establishes',
    'confirms',
    'demonstrates conclusively',
  ],

  // Phrases that indicate conservative presentation
  requiredPatterns: [
    'paper',
    'papers',
    'study',
    'studies',
    'found',
    'suggests',
    'may indicate',
    'appears to',
    'evidence supports',
    'research shows',
  ],
} as const;

/**
 * Validate conservative language compliance
 * Returns true if text follows conservative principles
 */
export const validateConservativeLanguage = (text: string): boolean => {
  const lower = text.toLowerCase();

  // Check for banned phrases
  for (const phrase of CONSERVATIVE_RULES.bannedPhrases) {
    if (lower.includes(phrase)) {
      console.error('Conservative language violation:', phrase);
      return false;
    }
  }

  // Ensure at least one required pattern
  const hasRequiredPattern = CONSERVATIVE_RULES.requiredPatterns.some(
    (phrase) => lower.includes(phrase)
  );

  if (!hasRequiredPattern) {
    console.warn('Missing conservative language markers in:', text);
    return false;
  }

  return true;
};

/**
 * Extraction prompt template for Claude API
 * CRITICAL: This prompt enforces conservative evidence extraction
 */
export const createExtractionPrompt = (
  paper: ResearchPaper,
  question: string
): string => {
  return `You are a medical research analyst specializing in ME/CFS research.

Task: Extract evidence from this paper relevant to the research question.

Question: ${question}

Paper:
Title: ${paper.title}
Authors: ${paper.authors.map((a) => a.name).join(', ')}
Publication Date: ${paper.publicationDate}
Abstract: ${paper.abstract}

CRITICAL RULES FOR CONSERVATIVE EVIDENCE EXTRACTION:
1. Be conservative: Only state what the paper actually found
2. Use precise language: "This paper found...", not "Research shows..."
3. Include sample size and study type if mentioned
4. Note limitations explicitly
5. If paper doesn't address question, return null
6. Never use words like "proves", "confirms", "always", "never"
7. Always use tentative language: "suggests", "may indicate", "appears to"

Output JSON format:
{
  "relevant": true/false,
  "finding": "exact description of what was found (if relevant)",
  "evidence": "specific data from paper (if relevant)",
  "studyType": "clinical_trial|observational|review|meta_analysis|case_study|laboratory|other",
  "sampleSize": number (if mentioned),
  "limitations": ["limitation1", "limitation2"],
  "confidence": 0-1 (how confident in this extraction)
}

Be extremely careful not to overstate findings. When in doubt, be more conservative.`;
};

/**
 * Extract evidence from a single paper
 * Uses Claude API to extract relevant findings
 */
export const extractEvidence = async (
  paper: ResearchPaper,
  question: string
): Promise<ExtractionResult | null> => {
  try {
    console.log('Extracting evidence from:', paper.title);
    console.log('Question:', question);

    // Import Claude client
    const { callClaudeJSON, CONSERVATIVE_SYSTEM_PROMPT, isClaudeConfigured } = await import('@/lib/claude');

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      console.warn('Claude API not configured. Skipping extraction for:', paper.title);
      return {
        relevant: false,
        limitations: ['Claude API not configured'],
        confidence: 0,
      };
    }

    // Create extraction prompt
    const prompt = createExtractionPrompt(paper, question);

    // Call Claude API
    const result = await callClaudeJSON<ExtractionResult>(prompt, {
      systemPrompt: CONSERVATIVE_SYSTEM_PROMPT,
      maxTokens: 2000,
      temperature: 0.3,
    });

    // Validate conservative language in finding (if relevant)
    if (result.relevant && result.finding) {
      if (!validateConservativeLanguage(result.finding)) {
        console.error('Conservative language violation in extracted finding');
        // Still return result but log the violation
      }
    }

    console.log('Extraction result:', {
      relevant: result.relevant,
      confidence: result.confidence,
      studyType: result.studyType,
    });

    return result;
  } catch (error) {
    console.error('Failed to extract evidence:', error);
    // Return null to skip this paper (don't block the entire workflow)
    return null;
  }
};

/**
 * Group similar findings together
 * Groups findings that describe the same phenomenon
 */
export const groupSimilarFindings = (findings: Finding[]): Finding[][] => {
  // Simple grouping by description similarity
  // @ai-technical-debt(medium, 3-4 hours, medium) - Implement semantic similarity
  const groups: Finding[][] = [];

  for (const finding of findings) {
    let added = false;

    // Try to add to existing group
    for (const group of groups) {
      const firstInGroup = group[0];
      // Simple string similarity for now
      if (
        isSimilarDescription(finding.description, firstInGroup.description)
      ) {
        group.push(finding);
        added = true;
        break;
      }
    }

    // Create new group if not added
    if (!added) {
      groups.push([finding]);
    }
  }

  return groups;
};

/**
 * Simple string similarity check
 * Returns true if descriptions are similar enough to group
 */
const isSimilarDescription = (desc1: string, desc2: string): boolean => {
  const lower1 = desc1.toLowerCase();
  const lower2 = desc2.toLowerCase();

  // Extract key words (simple approach)
  const words1 = lower1.split(/\s+/).filter((w) => w.length > 4);
  const words2 = lower2.split(/\s+/).filter((w) => w.length > 4);

  // Count overlapping words
  const overlap = words1.filter((w) => words2.includes(w)).length;
  const minLength = Math.min(words1.length, words2.length);

  // Similar if >60% overlap
  return overlap / minLength > 0.6;
};

/**
 * Assess consistency across findings
 */
export const assessConsistency = (findings: Finding[]): Consistency => {
  if (findings.length === 1) return Consistency.HIGH;

  // Check if all findings have the same qualitative direction
  const hasContradictions = findings.some((f) => f.hasContradiction);
  if (hasContradictions) return Consistency.LOW;

  // Check study quality consistency
  const peerReviewedRatio =
    findings.reduce((sum, f) => sum + f.peerReviewedCount, 0) /
    findings.reduce((sum, f) => sum + f.supportingPapers.length, 0);

  if (peerReviewedRatio > 0.8) return Consistency.HIGH;
  if (peerReviewedRatio > 0.5) return Consistency.MEDIUM;
  return Consistency.LOW;
};

/**
 * Synthesize evidence across multiple findings
 * Generates conservative summary of what we know
 */
export const synthesizeEvidence = async (
  findings: Finding[],
  question: string
): Promise<EvidenceSynthesis> => {
  if (findings.length === 0) {
    return {
      summary: 'No papers in collection address this question yet.',
      findings: [],
      confidence: 0,
      limitations: ['Insufficient evidence'],
      gaps: ['Need more research on this topic'],
    };
  }

  // Group similar findings
  const grouped = groupSimilarFindings(findings);

  // Create summaries for each group
  const findingSummaries: FindingSummary[] = grouped.map((group) => {
    const allPaperIds = new Set<string>();
    group.forEach((f) => {
      f.supportingPapers.forEach((id) => allPaperIds.add(id));
    });

    const consistency = assessConsistency(group);

    return {
      description: group[0].description,
      paperCount: allPaperIds.size,
      papers: Array.from(allPaperIds),
      consistency,
      evidence: group[0].quantitativeResult || group[0].qualitativeResult || '',
      limitations: Array.from(
        new Set(group.flatMap((f) => extractLimitations(f)))
      ),
    };
  });

  // Generate overall summary
  const summary = generateConservativeSummary(findingSummaries, question);

  // Calculate overall confidence
  const confidence = calculateConfidence(findingSummaries);

  // Collect limitations
  const limitations = collectLimitations(findingSummaries);

  // Identify gaps
  const gaps = identifyGaps(findings, question);

  return {
    summary,
    findings: findingSummaries,
    confidence,
    limitations,
    gaps,
  };
};

/**
 * Extract limitations from a finding
 */
const extractLimitations = (finding: Finding): string[] => {
  const limitations: string[] = [];

  if (finding.preprintCount > 0) {
    limitations.push(
      `${finding.preprintCount} preprint(s) not yet peer-reviewed`
    );
  }

  if (finding.consistency === Consistency.LOW) {
    limitations.push('Low consistency across studies');
  }

  if (finding.sampleSizes.length > 0) {
    const avgSampleSize =
      finding.sampleSizes.reduce((a, b) => a + b, 0) /
      finding.sampleSizes.length;
    if (avgSampleSize < 30) {
      limitations.push('Small sample sizes');
    }
  }

  return limitations;
};

/**
 * Generate conservative summary of findings
 * CRITICAL: Must pass conservative language validation
 */
const generateConservativeSummary = (
  findings: FindingSummary[],
  _question: string
): string => {
  if (findings.length === 0) {
    return 'No papers in collection address this question yet.';
  }

  const totalPapers = findings.reduce((sum, f) => sum + f.paperCount, 0);

  let summary = `Based on ${totalPapers} paper${totalPapers > 1 ? 's' : ''}, `;

  if (findings.length === 1) {
    const finding = findings[0];
    summary += `research suggests ${finding.description.toLowerCase()}`;
  } else {
    summary += `evidence indicates multiple findings: `;
    summary += findings
      .map(
        (f, i) =>
          `(${i + 1}) ${f.paperCount} paper${f.paperCount > 1 ? 's' : ''} found ${f.description.toLowerCase()}`
      )
      .join('; ');
  }

  summary += '.';

  // Validate conservative language
  if (!validateConservativeLanguage(summary)) {
    console.error('Generated summary failed conservative language check');
    return 'Evidence extraction pending review.';
  }

  return summary;
};

/**
 * Calculate overall confidence in synthesis
 */
const calculateConfidence = (findings: FindingSummary[]): number => {
  if (findings.length === 0) return 0;

  const scores = findings.map((f) => {
    let score = 0.5; // baseline

    // More papers = higher confidence
    if (f.paperCount >= 5) score += 0.2;
    else if (f.paperCount >= 3) score += 0.1;

    // High consistency = higher confidence
    if (f.consistency === 'high') score += 0.2;
    else if (f.consistency === 'medium') score += 0.1;

    return Math.min(0.9, score); // Cap at 0.9
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

/**
 * Collect all limitations across findings
 */
const collectLimitations = (findings: FindingSummary[]): string[] => {
  const allLimitations = new Set<string>();
  findings.forEach((f) => {
    f.limitations.forEach((l) => allLimitations.add(l));
  });
  return Array.from(allLimitations);
};

/**
 * Identify knowledge gaps
 */
const identifyGaps = (findings: Finding[], _question: string): string[] => {
  const gaps: string[] = [];

  if (findings.length < 3) {
    gaps.push('Limited number of studies on this topic');
  }

  const hasRCT = findings.some((f) =>
    f.studyTypes.includes('clinical_trial')
  );
  if (!hasRCT) {
    gaps.push('No randomized controlled trials found');
  }

  const hasLarge = findings.some((f) =>
    f.sampleSizes.some((s) => s > 100)
  );
  if (!hasLarge) {
    gaps.push('No large-scale studies (>100 participants) found');
  }

  return gaps;
};

