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
 * In development, routes through proxy to avoid CORS issues
 */
const USE_PROXY = import.meta.env.DEV; // true in development
const PROXY_URL = 'http://localhost:3001/api/claude';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  // @ts-ignore - needed for browser usage when not using proxy
  dangerouslyAllowBrowser: !USE_PROXY,
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
    signal?: AbortSignal;
  } = {}
): Promise<string> {
  try {
    const {
      maxTokens = API_CONFIG.CLAUDE_MAX_TOKENS,
      temperature = 0.3, // Low temperature for conservative, consistent outputs
      systemPrompt,
      signal,
    } = options;

    let message;

    if (USE_PROXY) {
      // Use proxy server in development to avoid CORS
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          system: systemPrompt,
          model: API_CONFIG.CLAUDE_MODEL,
          max_tokens: maxTokens,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Proxy request failed with status ${response.status}`);
      }

      message = await response.json();
    } else {
      // Direct API call (production)
      message = await client.messages.create({
        model: API_CONFIG.CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
    }

    // Extract text from response
    const textContent = message.content.find((block: any) => block.type === 'text');
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
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const response = await callClaude(prompt, options);

  try {
    // Try multiple extraction strategies
    
    // Strategy 1: Extract from ```json code blocks
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      return JSON.parse(jsonBlockMatch[1]) as T;
    }
    
    // Strategy 2: Extract from ``` code blocks (no language specified)
    const codeBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const content = codeBlockMatch[1].trim();
      if (content.startsWith('{') || content.startsWith('[')) {
        return JSON.parse(content) as T;
      }
    }
    
    // Strategy 3: Find first JSON object in response (handles plain text with embedded JSON)
    const jsonObjectMatch = response.match(/(\{[\s\S]*\})/);
    if (jsonObjectMatch) {
      // Try to parse the largest valid JSON object
      let jsonStr = jsonObjectMatch[1];
      
      // Find the matching closing brace for the first opening brace
      let depth = 0;
      let endIndex = -1;
      for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') depth++;
        if (jsonStr[i] === '}') {
          depth--;
          if (depth === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      if (endIndex > 0) {
        jsonStr = jsonStr.substring(0, endIndex);
        return JSON.parse(jsonStr) as T;
      }
    }
    
    // Strategy 4: Try parsing the entire response as JSON
    return JSON.parse(response.trim()) as T;
    
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

/**
 * Simple resiliency wrapper: timeout, retries with jitter, tiny circuit breaker,
 * and optional JSON validation via predicate.
 */
let __failCount = 0;
let __breakerUntil = 0;

function breakerOpen(): boolean {
  return Date.now() < __breakerUntil;
}
function onSuccess(): void {
  __failCount = 0;
}
function onFailure(): void {
  __failCount += 1;
  if (__failCount >= 5) {
    __breakerUntil = Date.now() + 60_000; // 60s open
  }
}

function isTransient(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err ?? '');
  return /timeout|network|502|503|504|429|ECONNREFUSED|ENOTFOUND/i.test(msg);
}

export async function callLLMResilient<T>(
  prompt: string,
  opts: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    validate?: (obj: any) => obj is T;
    reaskPrompt?: (original: string) => string; // for a single re-ask on parse failure
  } = {}
): Promise<T> {
  if (breakerOpen()) {
    throw new Error('LLM service temporarily unavailable (circuit open)');
  }

  const attempts = 3;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const start = performance.now?.() ?? Date.now();

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const raw = await callClaudeJSON<any>(prompt, {
        systemPrompt: opts.systemPrompt ?? CONSERVATIVE_SYSTEM_PROMPT,
        maxTokens: opts.maxTokens,
        temperature: opts.temperature ?? 0.2,
        signal: controller.signal,
      });

      // Optional validation
      if (opts.validate && !opts.validate(raw)) {
        // Single re-ask demanding strict JSON
        if (opts.reaskPrompt) {
          const strictPrompt = opts.reaskPrompt(prompt);
          const raw2 = await callClaudeJSON<any>(strictPrompt, {
            systemPrompt: opts.systemPrompt ?? CONSERVATIVE_SYSTEM_PROMPT,
            maxTokens: opts.maxTokens,
            temperature: opts.temperature ?? 0.2,
            signal: controller.signal,
          });
          if (opts.validate(raw2)) {
            onSuccess();
            return raw2 as T;
          }
        }
        throw new Error('LLM JSON validation failed');
      }

      onSuccess();
      return (opts.validate ? (raw as T) : (raw as T));
    } catch (err) {
      if (isTransient(err) && i < attempts - 1) {
        const backoff = 250 * Math.pow(3, i) + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      onFailure();
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      clearTimeout(timer);
      const dur = (performance.now?.() ?? Date.now()) - start;
      console.debug('[LLM]', { attempts: i + 1, durationMs: Math.round(dur) });
    }
  }

  // Unreachable due to throw, but TS appeasement
  throw new Error('LLM call failed');
}

