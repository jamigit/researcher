/**
 * Claude API Client
 * Provides interface for calling Claude AI for evidence extraction and synthesis
 * @ai-context CRITICAL: All AI-generated content must pass conservative language validation
 */

import Anthropic from '@anthropic-ai/sdk';
import { API_CONFIG } from '@/utils/constants';

/**
 * Initialize Claude client
 * Uses environment variable for API key
 */
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

/**
 * Call Claude API with a prompt
 * Returns the text response or throws an error
 */
export async function callClaude(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  try {
    const {
      maxTokens = API_CONFIG.CLAUDE_MAX_TOKENS,
      temperature = 0.3, // Low temperature for conservative, consistent outputs
      systemPrompt,
    } = options;

    const message = await client.messages.create({
      model: API_CONFIG.CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract text from response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Claude API call failed:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Claude API key is invalid or missing. Please check VITE_ANTHROPIC_API_KEY environment variable.');
      }
      if (error.message.includes('429')) {
        throw new Error('Claude API rate limit exceeded. Please try again later.');
      }
    }
    
    throw new Error(`Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call Claude API and parse JSON response
 * Validates that response is valid JSON before returning
 */
export async function callClaudeJSON<T>(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): Promise<T> {
  const response = await callClaude(prompt, options);

  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', response);
    throw new Error('Claude returned invalid JSON. Please try again.');
  }
}

/**
 * System prompt for conservative evidence extraction
 */
export const CONSERVATIVE_SYSTEM_PROMPT = `You are a medical research analyst specializing in ME/CFS (Myalgic Encephalomyelitis / Chronic Fatigue Syndrome).

Your responses must be:
1. CONSERVATIVE: Never overstate findings or claim more than the evidence supports
2. PRECISE: Use exact language - "This paper found..." not "Research shows..."
3. TENTATIVE: Use "suggests", "may indicate", "appears to" rather than "proves" or "confirms"
4. EVIDENCE-BASED: Always cite specific papers, sample sizes, and study types
5. HONEST about limitations: Note study weaknesses, small sample sizes, lack of replication

NEVER use these phrases:
- "proves", "confirms", "establishes", "demonstrates conclusively"
- "the consensus", "all patients", "always", "never", "definitely"
- "caused by" (unless direct causal evidence)

ALWAYS use these patterns:
- "X papers found/observed..."
- "suggests", "may indicate", "appears to"
- "evidence supports", "research shows"
- Specific sample sizes and study types
- Explicit limitations

Your role is to help patients understand research conservatively and accurately.`;

/**
 * Check if Claude API key is configured
 */
export function isClaudeConfigured(): boolean {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  return !!apiKey && apiKey.length > 0;
}

