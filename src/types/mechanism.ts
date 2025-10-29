/**
 * Type definitions for mechanism explainers
 * @ai-context Plain language + technical explanations of biological mechanisms
 */

/**
 * Plain language explanation (10th grade reading level)
 */
export interface PlainLanguageExplanation {
  definition: string; // 1-2 sentences, simple definition
  howItWorks: string; // 3-4 sentences, process explanation with analogies
  relevance: string; // 2-3 sentences, why it matters for ME/CFS
}

/**
 * Technical details for advanced users
 */
export interface TechnicalDetails {
  biochemicalProcess: string; // Specific pathways, proteins, etc.
  evidence: string[]; // Specific findings from papers
  uncertainties: string[]; // Known debates or gaps
}

/**
 * Mechanism Explainer
 * Explains a biological mechanism in plain language + technical details
 */
export interface MechanismExplainer {
  // Identity
  id: string; // UUID v4
  mechanism: string; // e.g., "mitochondrial dysfunction"

  // Explanations
  plainLanguage: PlainLanguageExplanation;
  technicalDetails: TechnicalDetails;

  // Evidence
  supportingPapers: string[]; // Paper IDs that explain this mechanism

  // Metadata
  dateCreated: string; // ISO 8601 timestamp
  lastUpdated: string; // ISO 8601 timestamp
  readabilityScore?: number; // Flesch-Kincaid grade level (target: 10 or below)
}

/**
 * Factory function to create a new mechanism explainer
 */
export const createMechanismExplainer = (
  mechanism: string,
  plainLanguage: PlainLanguageExplanation,
  technicalDetails: TechnicalDetails,
  supportingPapers: string[]
): MechanismExplainer => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    mechanism,
    plainLanguage,
    technicalDetails,
    supportingPapers,
    dateCreated: now,
    lastUpdated: now,
  };
};

/**
 * Common ME/CFS mechanisms for auto-detection
 */
export const COMMON_MECFS_MECHANISMS = [
  'mitochondrial dysfunction',
  'oxidative stress',
  'immune dysregulation',
  'neuroinflammation',
  'metabolic impairment',
  'autoimmunity',
  'viral reactivation',
  'autonomic dysfunction',
  'cellular energy metabolism',
  'cytokine production',
  'endothelial dysfunction',
  'gut dysbiosis',
  'hypothalamic-pituitary-adrenal axis',
  'mast cell activation',
  'nitric oxide metabolism',
] as const;

/**
 * Type for common mechanisms
 */
export type CommonMechanism = (typeof COMMON_MECFS_MECHANISMS)[number];

/**
 * Detect mechanisms in text
 * Returns list of detected mechanism keywords
 */
export const detectMechanismsInText = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];

  for (const mechanism of COMMON_MECFS_MECHANISMS) {
    if (lowerText.includes(mechanism.toLowerCase())) {
      detected.push(mechanism);
    }
  }

  return detected;
};

