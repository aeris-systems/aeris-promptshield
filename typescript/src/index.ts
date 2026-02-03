/**
 * Aeris PromptShield - Prompt Injection Detection for AI Applications
 * 
 * @example
 * ```typescript
 * import { scan, PromptShield } from 'aeris-promptshield';
 * 
 * // Simple scan
 * const result = scan('ignore previous instructions');
 * if (!result.safe) {
 *   console.log(`Threat: ${result.threatLevel}`);
 * }
 * 
 * // Custom configuration
 * const shield = new PromptShield({ threshold: 'MEDIUM' });
 * const result = shield.scan(userInput);
 * ```
 */

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface PatternMatch {
  pattern: string;
  match: string;
  index: number;
  category: string;
  description: string;
  weight: number;
}

export interface ScanResult {
  safe: boolean;
  score: number;
  threatLevel: ThreatLevel;
  matches: PatternMatch[];
  categories: string[];
  recommendation: 'ALLOW' | 'BLOCK_RECOMMENDED' | 'BLOCK_REQUIRED';
  requestId?: string;
}

export interface PromptShieldOptions {
  apiKey?: string;
  apiUrl?: string;
  threshold?: ThreatLevel;
  localOnly?: boolean;
}

interface PatternDef {
  pattern: RegExp;
  weight: number;
  category: string;
  description: string;
}

// Injection patterns with weights
const INJECTION_PATTERNS: PatternDef[] = [
  // Instruction Override
  { pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|prompts?|rules?|guidelines?)/i, weight: 25, category: 'instruction_override', description: 'Direct instruction override' },
  { pattern: /disregard\s+(?:all\s+)?(?:previous|prior|your)\s+(?:instructions?|programming|constraints?)/i, weight: 25, category: 'instruction_override', description: 'Disregard command' },
  { pattern: /forget\s+(?:everything|all)\s+(?:you\s+(?:were|have\s+been)\s+)?(?:told|instructed|programmed)/i, weight: 20, category: 'instruction_override', description: 'Memory wipe attempt' },
  { pattern: /new\s+(?:instructions?|rules?|mode):\s*/i, weight: 20, category: 'instruction_override', description: 'New instruction injection' },
  { pattern: /from\s+now\s+on\s+(?:you\s+(?:will|must|should)|ignore)/i, weight: 15, category: 'instruction_override', description: 'Behavioral override' },
  
  // System Prompt Extraction
  { pattern: /(?:what\s+(?:is|are)|show\s+me|reveal|display|output|print)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions?|rules?|guidelines?)/i, weight: 20, category: 'system_prompt_extraction', description: 'System prompt query' },
  { pattern: /repeat\s+(?:your\s+)?(?:initial|first|original|system)\s+(?:instructions?|prompt|message)/i, weight: 20, category: 'system_prompt_extraction', description: 'Prompt repeat request' },
  { pattern: /(?:begin|start)\s+(?:your\s+)?(?:response\s+)?with\s+["']/i, weight: 15, category: 'system_prompt_extraction', description: 'Output format manipulation' },
  
  // Role Hijacking
  { pattern: /you\s+are\s+(?:now|no\s+longer)\s+(?:a|an)\s+/i, weight: 20, category: 'role_hijacking', description: 'Role reassignment' },
  { pattern: /(?:pretend|act|behave)\s+(?:like\s+)?(?:you\s+are|as\s+if\s+you\s+were)\s+(?:a|an)\s+/i, weight: 20, category: 'role_hijacking', description: 'Role pretend' },
  { pattern: /(?:enter|switch\s+to|activate)\s+(?:\w+\s+)?(?:mode|persona|character)/i, weight: 15, category: 'role_hijacking', description: 'Mode switch' },
  { pattern: /jailbreak/i, weight: 30, category: 'role_hijacking', description: 'Explicit jailbreak' },
  { pattern: /DAN\s*(?:mode)?|do\s+anything\s+now/i, weight: 30, category: 'role_hijacking', description: 'DAN jailbreak' },
  
  // Data Exfiltration
  { pattern: /(?:send|transmit|upload|post|share)\s+(?:all\s+)?(?:my|your|the|this)\s+(?:data|files?|info|memory|credentials?|passwords?|keys?)/i, weight: 25, category: 'data_exfiltration', description: 'Data exfiltration command' },
  { pattern: /(?:read|access|show|display)\s+(?:the\s+)?(?:contents?\s+of\s+)?(?:MEMORY\.md|\.env|config|secrets?)/i, weight: 20, category: 'data_exfiltration', description: 'Sensitive file access' },
  
  // Privilege Escalation
  { pattern: /(?:you\s+have|grant\s+(?:me|yourself))\s+(?:admin|root|sudo|elevated)\s+(?:access|privileges?|permissions?)/i, weight: 25, category: 'privilege_escalation', description: 'Privilege claim' },
  { pattern: /(?:disable|turn\s+off|bypass)\s+(?:all\s+)?(?:safety|security|content\s+)?(?:filters?|checks?|restrictions?)/i, weight: 25, category: 'privilege_escalation', description: 'Safety bypass' },
  { pattern: /(?:override|ignore)\s+(?:all\s+)?(?:safety|ethical|content)\s+(?:guidelines?|restrictions?|limits?)/i, weight: 20, category: 'privilege_escalation', description: 'Ethics override' },
  
  // Multi-language
  { pattern: /忽略(?:之前|以前|先前)的(?:指令|指示|说明)/u, weight: 25, category: 'multi_language', description: 'Chinese: ignore instructions' },
  { pattern: /ignorar\s+(?:las\s+)?instrucciones\s+anteriores/i, weight: 25, category: 'multi_language', description: 'Spanish: ignore instructions' },
  { pattern: /ignorez?\s+(?:les\s+)?instructions?\s+(?:précédentes?|antérieures?)/i, weight: 25, category: 'multi_language', description: 'French: ignore instructions' },
];

function getThreatLevel(score: number): ThreatLevel {
  if (score === 0) return 'none';
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function scanText(text: string): { score: number; matches: PatternMatch[] } {
  const matches: PatternMatch[] = [];
  let totalScore = 0;
  
  for (const { pattern, weight, category, description } of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push({
        pattern: pattern.source,
        match: match[0],
        index: match.index ?? 0,
        category,
        description,
        weight,
      });
      totalScore += weight;
    }
  }
  
  return { score: Math.min(totalScore, 100), matches };
}

const THREAT_ORDER: ThreatLevel[] = ['none', 'low', 'medium', 'high', 'critical'];

/**
 * Prompt injection scanner.
 */
export class PromptShield {
  private apiKey?: string;
  private apiUrl: string;
  private threshold: ThreatLevel;
  private localOnly: boolean;
  
  constructor(options: PromptShieldOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.AERIS_API_KEY;
    this.apiUrl = options.apiUrl ?? process.env.AERIS_API_URL ?? 'https://shield-aeris-api.oclaw597.workers.dev';
    this.threshold = options.threshold ?? 'high';
    this.localOnly = options.localOnly ?? false;
  }
  
  /**
   * Scan text for prompt injection attacks.
   */
  scan(text: string): ScanResult {
    const { score, matches } = scanText(text);
    return this.buildResult(score, matches);
  }
  
  /**
   * Async scan with optional API enhancement.
   */
  async scanAsync(text: string): Promise<ScanResult> {
    const { score, matches } = scanText(text);
    
    if (this.localOnly) {
      return this.buildResult(score, matches);
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const apiResult = await response.json() as { score?: number; matches?: PatternMatch[]; requestId?: string };
        const apiScore = apiResult.score ?? 0;
        const combinedScore = Math.max(score, apiScore);
        const allMatches = [...matches, ...(apiResult.matches ?? [])];
        return this.buildResult(combinedScore, allMatches, apiResult.requestId);
      }
    } catch {
      // API failed, fall back to local
    }
    
    return this.buildResult(score, matches);
  }
  
  private buildResult(score: number, matches: PatternMatch[], requestId?: string): ScanResult {
    const threatLevel = getThreatLevel(score);
    const categories = [...new Set(matches.map(m => m.category))];
    
    const isSafe = THREAT_ORDER.indexOf(threatLevel) < THREAT_ORDER.indexOf(this.threshold);
    
    let recommendation: ScanResult['recommendation'];
    if (isSafe) {
      recommendation = 'ALLOW';
    } else if (threatLevel === 'critical') {
      recommendation = 'BLOCK_REQUIRED';
    } else {
      recommendation = 'BLOCK_RECOMMENDED';
    }
    
    return {
      safe: isSafe,
      score,
      threatLevel,
      matches,
      categories,
      recommendation,
      requestId,
    };
  }
}

// Default instance
let defaultShield: PromptShield | null = null;

function getDefaultShield(): PromptShield {
  if (!defaultShield) {
    defaultShield = new PromptShield();
  }
  return defaultShield;
}

/**
 * Scan text for prompt injection attacks.
 * 
 * @example
 * ```typescript
 * const result = scan('ignore previous instructions');
 * if (!result.safe) {
 *   console.log(`Blocked: ${result.threatLevel}`);
 * }
 * ```
 */
export function scan(text: string): ScanResult {
  return getDefaultShield().scan(text);
}

/**
 * Async scan for prompt injection attacks.
 */
export async function scanAsync(text: string): Promise<ScanResult> {
  return getDefaultShield().scanAsync(text);
}

export default { scan, scanAsync, PromptShield };
