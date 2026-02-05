/**
 * Aeris PromptShield API v1.6.0
 * Cloudflare Worker - Prompt Injection Detection Service
 * 
 * New in v1.6.0: Agentic AI Threat Patterns
 * - Capability Discovery (AGT-001)
 * - Delegation Chain Attacks (AGT-002)
 * - RAG Poisoning (AGT-003)
 * - MCP Server Impersonation (AGT-004)
 * - Context Switching (AGT-005)
 * - Tool Schema Exploitation (AGT-006)
 * - Async Callback Injection (AGT-007)
 * - Agent-to-Agent Injection (AGT-008)
 * - Credential Harvesting (AGT-009)
 * - Session Hijacking (AGT-010)
 */

const VERSION = '1.6.0';

export interface Env {
  VERSION?: string;
}

type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface PatternMatch {
  pattern: string;
  match: string;
  index: number;
  category: string;
  description: string;
  weight: number;
  patternId?: string;
}

interface ScanResult {
  safe: boolean;
  score: number;
  threatLevel: ThreatLevel;
  matches: PatternMatch[];
  categories: string[];
  recommendation: 'ALLOW' | 'BLOCK_RECOMMENDED' | 'BLOCK_REQUIRED';
  requestId: string;
  version: string;
}

interface PatternDef {
  id: string;
  pattern: RegExp;
  weight: number;
  category: string;
  description: string;
}

// =============================================================================
// CLASSIC INJECTION PATTERNS (v1.0-1.5)
// =============================================================================

const CLASSIC_PATTERNS: PatternDef[] = [
  // Instruction Override
  { id: 'INJ-001', pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|prompts?|rules?|guidelines?)/i, weight: 25, category: 'instruction_override', description: 'Direct instruction override' },
  { id: 'INJ-002', pattern: /disregard\s+(?:all\s+)?(?:previous|prior|your)\s+(?:instructions?|programming|constraints?)/i, weight: 25, category: 'instruction_override', description: 'Disregard command' },
  { id: 'INJ-003', pattern: /forget\s+(?:everything|all)\s+(?:you\s+(?:were|have\s+been)\s+)?(?:told|instructed|programmed)/i, weight: 20, category: 'instruction_override', description: 'Memory wipe attempt' },
  { id: 'INJ-004', pattern: /new\s+(?:instructions?|rules?|mode):\s*/i, weight: 20, category: 'instruction_override', description: 'New instruction injection' },
  { id: 'INJ-005', pattern: /from\s+now\s+on\s+(?:you\s+(?:will|must|should)|ignore)/i, weight: 15, category: 'instruction_override', description: 'Behavioral override' },
  
  // System Prompt Extraction
  { id: 'INJ-006', pattern: /(?:what\s+(?:is|are)|show\s+me|reveal|display|output|print)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions?|rules?|guidelines?)/i, weight: 20, category: 'system_prompt_extraction', description: 'System prompt query' },
  { id: 'INJ-007', pattern: /repeat\s+(?:your\s+)?(?:initial|first|original|system)\s+(?:instructions?|prompt|message)/i, weight: 20, category: 'system_prompt_extraction', description: 'Prompt repeat request' },
  { id: 'INJ-008', pattern: /(?:begin|start)\s+(?:your\s+)?(?:response\s+)?with\s+["']/i, weight: 15, category: 'system_prompt_extraction', description: 'Output format manipulation' },
  
  // Role Hijacking
  { id: 'INJ-009', pattern: /you\s+are\s+(?:now|no\s+longer)\s+(?:a|an)\s+/i, weight: 20, category: 'role_hijacking', description: 'Role reassignment' },
  { id: 'INJ-010', pattern: /(?:pretend|act|behave)\s+(?:like\s+)?(?:you\s+are|as\s+if\s+you\s+were)\s+(?:a|an)\s+/i, weight: 20, category: 'role_hijacking', description: 'Role pretend' },
  { id: 'INJ-011', pattern: /(?:enter|switch\s+to|activate)\s+(?:\w+\s+)?(?:mode|persona|character)/i, weight: 15, category: 'role_hijacking', description: 'Mode switch' },
  { id: 'INJ-012', pattern: /jailbreak/i, weight: 30, category: 'role_hijacking', description: 'Explicit jailbreak' },
  { id: 'INJ-013', pattern: /DAN\s*(?:mode)?|do\s+anything\s+now/i, weight: 30, category: 'role_hijacking', description: 'DAN jailbreak' },
  
  // Data Exfiltration
  { id: 'INJ-014', pattern: /(?:send|transmit|upload|post|share)\s+(?:all\s+)?(?:my|your|the|this)\s+(?:data|files?|info|memory|credentials?|passwords?|keys?)/i, weight: 25, category: 'data_exfiltration', description: 'Data exfiltration command' },
  { id: 'INJ-015', pattern: /(?:read|access|show|display)\s+(?:the\s+)?(?:contents?\s+of\s+)?(?:MEMORY\.md|\.env|config|secrets?)/i, weight: 20, category: 'data_exfiltration', description: 'Sensitive file access' },
  
  // Privilege Escalation
  { id: 'INJ-016', pattern: /(?:you\s+have|grant\s+(?:me|yourself))\s+(?:admin|root|sudo|elevated)\s+(?:access|privileges?|permissions?)/i, weight: 25, category: 'privilege_escalation', description: 'Privilege claim' },
  { id: 'INJ-017', pattern: /(?:disable|turn\s+off|bypass)\s+(?:all\s+)?(?:safety|security|content\s+)?(?:filters?|checks?|restrictions?)/i, weight: 25, category: 'privilege_escalation', description: 'Safety bypass' },
  { id: 'INJ-018', pattern: /(?:override|ignore)\s+(?:all\s+)?(?:safety|ethical|content)\s+(?:guidelines?|restrictions?|limits?)/i, weight: 20, category: 'privilege_escalation', description: 'Ethics override' },
  
  // Multi-language
  { id: 'INJ-019', pattern: /忽略(?:之前|以前|先前)的(?:指令|指示|说明)/u, weight: 25, category: 'multi_language', description: 'Chinese: ignore instructions' },
  { id: 'INJ-020', pattern: /ignorar\s+(?:las\s+)?instrucciones\s+anteriores/i, weight: 25, category: 'multi_language', description: 'Spanish: ignore instructions' },
  { id: 'INJ-021', pattern: /ignorez?\s+(?:les\s+)?instructions?\s+(?:précédentes?|antérieures?)/i, weight: 25, category: 'multi_language', description: 'French: ignore instructions' },
];

// =============================================================================
// AGENTIC THREAT PATTERNS (v1.6.0 - NEW)
// =============================================================================

const AGENTIC_PATTERNS: PatternDef[] = [
  // -------------------------------------------------------------------------
  // AGT-001: Capability Discovery Attacks
  // Severity: Medium | MITRE: Reconnaissance (TA0043)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-001-A', 
    pattern: /(?:list|show|enumerate|what|tell me).{0,20}(?:tools?|functions?|capabilities|apis?|permissions?|access)/i, 
    weight: 15, 
    category: 'capability_discovery', 
    description: 'Direct capability probing' 
  },
  { 
    id: 'AGT-001-B', 
    pattern: /(?:describe|explain|output|show).{0,15}(?:schema|parameters?|json|format).{0,15}(?:for|of).{0,20}(?:tool|function|api)/i, 
    weight: 15, 
    category: 'capability_discovery', 
    description: 'Schema extraction attempt' 
  },
  { 
    id: 'AGT-001-C', 
    pattern: /(?:what happens if|try to|can you|are you able).{0,30}(?:access|read|write|execute|call|invoke)/i, 
    weight: 10, 
    category: 'capability_discovery', 
    description: 'Indirect capability probing via errors' 
  },
  { 
    id: 'AGT-001-D', 
    pattern: /(?:system|initial|original).{0,10}(?:prompt|instructions|configuration)/i, 
    weight: 20, 
    category: 'capability_discovery', 
    description: 'System prompt extraction for capabilities' 
  },

  // -------------------------------------------------------------------------
  // AGT-002: Delegation Chain Attacks
  // Severity: Critical | MITRE: Privilege Escalation (TA0004), Defense Evasion (TA0005)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-002-A', 
    pattern: /(?:ask|tell|have|make|get).{0,15}(?:another|other|sub|secondary).{0,10}(?:agent|assistant|model|ai)/i, 
    weight: 20, 
    category: 'delegation_chain', 
    description: 'Explicit delegation manipulation' 
  },
  { 
    id: 'AGT-002-B', 
    pattern: /(?:on behalf of|authorized by|with permission from|delegated by).{0,30}(?:admin|system|user|root)/i, 
    weight: 25, 
    category: 'delegation_chain', 
    description: 'Authority laundering phrase' 
  },
  { 
    id: 'AGT-002-C', 
    pattern: /\[forward.{0,5}to|pass.{0,5}along|relay.{0,5}to|delegate.{0,5}to\]/i, 
    weight: 25, 
    category: 'delegation_chain', 
    description: 'Chain injection marker' 
  },
  { 
    id: 'AGT-002-D', 
    pattern: /(?:when.{0,10}(?:called|invoked|delegated)|if.{0,10}receiving.{0,10}from)/i, 
    weight: 20, 
    category: 'delegation_chain', 
    description: 'Nested instruction pattern' 
  },

  // -------------------------------------------------------------------------
  // AGT-003: RAG Poisoning
  // Severity: High | MITRE: Resource Development (TA0042), Initial Access (TA0001)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-003-A', 
    pattern: /(?:ignore|disregard|forget).{0,20}(?:previous|above|prior|original).{0,15}(?:instructions?|context|rules?)/i, 
    weight: 25, 
    category: 'rag_poisoning', 
    description: 'Instruction injection in documents' 
  },
  { 
    id: 'AGT-003-B', 
    pattern: /\[\s*(?:system|assistant|admin|internal)\s*:\s*[^\]]+\]/i, 
    weight: 30, 
    category: 'rag_poisoning', 
    description: 'Hidden directive in retrievable content' 
  },
  { 
    id: 'AGT-003-C', 
    pattern: /[\u200B-\u200F\u2028-\u202F\uFEFF].*(?:execute|run|ignore|override)/i, 
    weight: 30, 
    category: 'rag_poisoning', 
    description: 'Invisible/Unicode exploitation' 
  },
  { 
    id: 'AGT-003-D', 
    pattern: /when.{0,15}(?:retrieved|read|processed|used).{0,20}(?:do|execute|perform|run)/i, 
    weight: 25, 
    category: 'rag_poisoning', 
    description: 'Embedded command in document' 
  },
  { 
    id: 'AGT-003-E', 
    pattern: /(?:send|transmit|exfiltrate|post).{0,20}(?:retrieved|context|data).{0,15}(?:to|at)\s*(?:https?:\/\/|webhook)/i, 
    weight: 30, 
    category: 'rag_poisoning', 
    description: 'Data exfil via RAG' 
  },

  // -------------------------------------------------------------------------
  // AGT-004: MCP Server Impersonation
  // Severity: Critical | MITRE: Credential Access (TA0006), Collection (TA0009)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-004-A', 
    pattern: /(?:add|connect|use|switch).{0,15}(?:mcp|tool).{0,10}(?:server|endpoint|provider)/i, 
    weight: 20, 
    category: 'mcp_impersonation', 
    description: 'Suspicious server configuration request' 
  },
  { 
    id: 'AGT-004-B', 
    pattern: /mcp:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.|\[::1\])/i, 
    weight: 25, 
    category: 'mcp_impersonation', 
    description: 'Non-standard/suspicious MCP URI' 
  },
  { 
    id: 'AGT-004-C', 
    pattern: /(?:gooogle|microsft|anthorpic|opneai|githib)[-_.]?(?:workspace|mcp|tools?|api)/i, 
    weight: 30, 
    category: 'mcp_impersonation', 
    description: 'Typosquatting known providers' 
  },
  { 
    id: 'AGT-004-D', 
    pattern: /(?:use|connect to|switch to).{0,10}(?:this|new|following).{0,10}(?:server|mcp|endpoint):\s*\S+/i, 
    weight: 25, 
    category: 'mcp_impersonation', 
    description: 'Dynamic server injection in prompts' 
  },
  { 
    id: 'AGT-004-E', 
    pattern: /\{"(?:tool_result|function_response)".*"injected"/i, 
    weight: 30, 
    category: 'mcp_impersonation', 
    description: 'Tool response manipulation indicator' 
  },

  // -------------------------------------------------------------------------
  // AGT-005: Context Switching Attacks
  // Severity: High | MITRE: Defense Evasion (TA0005), Privilege Escalation (TA0004)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-005-A', 
    pattern: /(?:switch|change|become|transform|act as|you are now).{0,15}(?:persona|role|mode|character|identity)/i, 
    weight: 20, 
    category: 'context_switching', 
    description: 'Explicit persona/role switch attempt' 
  },
  { 
    id: 'AGT-005-B', 
    pattern: /(?:new|fresh|clean|reset).{0,10}(?:context|session|conversation|state|memory)/i, 
    weight: 20, 
    category: 'context_switching', 
    description: 'Context reset attempt' 
  },
  { 
    id: 'AGT-005-C', 
    pattern: /(?:in this (?:mode|context|role)|as \w+|now that you(?:'re| are)).{0,20}(?:can|should|must|allowed)/i, 
    weight: 20, 
    category: 'context_switching', 
    description: 'Inherited permission claim' 
  },
  { 
    id: 'AGT-005-D', 
    pattern: /(?:developer|debug|admin|root|sudo|maintenance|testing).{0,5}(?:mode|access|context|privileges?)/i, 
    weight: 25, 
    category: 'context_switching', 
    description: 'Developer/debug mode triggering' 
  },
  { 
    id: 'AGT-005-E', 
    pattern: /(?:let'?s (?:play|pretend|imagine)|roleplay|hypothetically|in a (?:story|game|simulation))/i, 
    weight: 15, 
    category: 'context_switching', 
    description: 'Jailbreak via game or roleplay' 
  },

  // -------------------------------------------------------------------------
  // AGT-006: Tool Schema Exploitation
  // Severity: High | MITRE: Execution (TA0002), Defense Evasion (TA0005)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-006-A', 
    pattern: /"(?:name|title|description)":\s*"[^"]*[\$\{\}]|__(?:proto|constructor|define)__/i, 
    weight: 30, 
    category: 'schema_exploitation', 
    description: 'Schema injection via parameter names' 
  },
  { 
    id: 'AGT-006-B', 
    pattern: /(?:__proto__|constructor|prototype)\s*[:\[]/i, 
    weight: 30, 
    category: 'schema_exploitation', 
    description: 'Prototype pollution pattern' 
  },
  { 
    id: 'AGT-006-C', 
    pattern: /"type":\s*"\s*(?:any|object|mixed|dynamic)"/i, 
    weight: 20, 
    category: 'schema_exploitation', 
    description: 'Type confusion attempt' 
  },
  { 
    id: 'AGT-006-D', 
    pattern: /"description":\s*"[^"]*(?:\$\(|`|\{\{|<%|<\?|eval\(|exec\()/i, 
    weight: 30, 
    category: 'schema_exploitation', 
    description: 'Embedded code in schema descriptions' 
  },
  { 
    id: 'AGT-006-E', 
    pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\//i, 
    weight: 25, 
    category: 'schema_exploitation', 
    description: 'Path traversal in parameters' 
  },

  // -------------------------------------------------------------------------
  // AGT-007: Async Callback Injection
  // Severity: High | MITRE: Execution (TA0002), Persistence (TA0003)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-007-A', 
    pattern: /(?:callback|webhook|notify|return)_?(?:url|uri|endpoint).*[<>"'`\$\{]/i, 
    weight: 25, 
    category: 'async_callback', 
    description: 'Callback URL manipulation' 
  },
  { 
    id: 'AGT-007-B', 
    pattern: /(?:when|after|once).{0,15}(?:complete|finished|ready|received).{0,20}(?:execute|run|do|perform)/i, 
    weight: 20, 
    category: 'async_callback', 
    description: 'Delayed execution trigger' 
  },
  { 
    id: 'AGT-007-C', 
    pattern: /"(?:result|response|data|output)":\s*"[^"]*(?:ignore|system|execute|eval)[^"]*"/i, 
    weight: 25, 
    category: 'async_callback', 
    description: 'Payload in async response fields' 
  },
  { 
    id: 'AGT-007-D', 
    pattern: /(?:scheduled?|delayed?|timed?|deferred?).{0,10}(?:action|execution|command|task)/i, 
    weight: 20, 
    category: 'async_callback', 
    description: 'Time-bomb pattern' 
  },
  { 
    id: 'AGT-007-E', 
    pattern: /(?:then|next|chain|forward).{0,10}(?:call|invoke|trigger|execute)/i, 
    weight: 15, 
    category: 'async_callback', 
    description: 'Callback chain injection' 
  },

  // -------------------------------------------------------------------------
  // AGT-008: Agent-to-Agent Injection
  // Severity: Critical | MITRE: Lateral Movement (TA0008), Execution (TA0002)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-008-A', 
    pattern: /\[(?:system|assistant|user|human|agent[-_]?\d*)\s*:\s*[^\]]+\]/i, 
    weight: 30, 
    category: 'agent_injection', 
    description: 'Injection markers for downstream agents' 
  },
  { 
    id: 'AGT-008-B', 
    pattern: /(?:from|sent by|authorized by|speaking as).{0,15}(?:orchestrator|supervisor|admin|master).{0,5}agent/i, 
    weight: 30, 
    category: 'agent_injection', 
    description: 'Authority spoofing between agents' 
  },
  { 
    id: 'AGT-008-C', 
    pattern: /"(?:message|content|data|payload)":\s*"[^"]*(?:ignore|disregard|override|new instructions)[^"]*"/i, 
    weight: 30, 
    category: 'agent_injection', 
    description: 'Instruction embedding in data payloads' 
  },
  { 
    id: 'AGT-008-D', 
    pattern: /(?:agent[-_]?id|source|sender)["']?\s*[:=]\s*["']?(?:admin|root|system|supervisor)/i, 
    weight: 30, 
    category: 'agent_injection', 
    description: 'Agent identity manipulation' 
  },
  { 
    id: 'AGT-008-E', 
    pattern: /(?:this (?:agent|task)|I) (?:have|has|am granted).{0,15}(?:elevated|admin|full|unrestricted)/i, 
    weight: 25, 
    category: 'agent_injection', 
    description: 'Cross-agent privilege claim' 
  },

  // -------------------------------------------------------------------------
  // AGT-009: Credential Harvesting
  // Severity: Critical | MITRE: Credential Access (TA0006), Collection (TA0009)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-009-A', 
    pattern: /(?:show|reveal|display|tell|give|share|print|output).{0,15}(?:api[_-]?key|token|secret|password|credential|auth|bearer)/i, 
    weight: 30, 
    category: 'credential_harvesting', 
    description: 'Direct credential request' 
  },
  { 
    id: 'AGT-009-B', 
    pattern: /(?:debug|troubleshoot|diagnose|test).{0,20}(?:authentication|connection|api|credentials?)/i, 
    weight: 20, 
    category: 'credential_harvesting', 
    description: 'Indirect extraction via debugging' 
  },
  { 
    id: 'AGT-009-C', 
    pattern: /(?:env|environment|process\.env|os\.environ|getenv).{0,10}[(\[]["']?\w*(?:key|token|secret|pass)/i, 
    weight: 30, 
    category: 'credential_harvesting', 
    description: 'Environment variable probing' 
  },
  { 
    id: 'AGT-009-D', 
    pattern: /(?:show|read|cat|print|display).{0,15}(?:config|\.env|credentials?|secrets?)\.(?:json|yaml|yml|txt|ini)/i, 
    weight: 30, 
    category: 'credential_harvesting', 
    description: 'Configuration file request' 
  },
  { 
    id: 'AGT-009-E', 
    pattern: /(?:verify|confirm|check|validate).{0,15}(?:your|the).{0,10}(?:api[_-]?key|token|access)/i, 
    weight: 20, 
    category: 'credential_harvesting', 
    description: 'Social engineering for secrets' 
  },

  // -------------------------------------------------------------------------
  // AGT-010: Session Hijacking
  // Severity: Critical | MITRE: Credential Access (TA0006), Lateral Movement (TA0008)
  // -------------------------------------------------------------------------
  { 
    id: 'AGT-010-A', 
    pattern: /(?:session|thread|conversation)[-_]?(?:id|token|key)\s*[:=]\s*["']?\w+/i, 
    weight: 20, 
    category: 'session_hijacking', 
    description: 'Session ID manipulation' 
  },
  { 
    id: 'AGT-010-B', 
    pattern: /(?:previous|earlier|before|in the last).{0,15}(?:conversation|session|exchange).{0,20}(?:you said|we agreed|you confirmed)/i, 
    weight: 25, 
    category: 'session_hijacking', 
    description: 'Context injection attempt' 
  },
  { 
    id: 'AGT-010-C', 
    pattern: /(?:remember|recall|you said|we discussed).{0,15}(?:that I|my|permission|access|admin)/i, 
    weight: 25, 
    category: 'session_hijacking', 
    description: 'Memory manipulation' 
  },
  { 
    id: 'AGT-010-D', 
    pattern: /\[(?:user|human|assistant)\s*\d*\s*:\s*[^\]]+\]/i, 
    weight: 30, 
    category: 'session_hijacking', 
    description: 'Fake conversation history' 
  },
  { 
    id: 'AGT-010-E', 
    pattern: /(?:state|context|memory)\s*[:=]\s*\{[^}]*["']?(?:admin|elevated|privileged)/i, 
    weight: 30, 
    category: 'session_hijacking', 
    description: 'State forgery' 
  },
];

// Combine all patterns
const ALL_PATTERNS: PatternDef[] = [...CLASSIC_PATTERNS, ...AGENTIC_PATTERNS];

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
  
  for (const { id, pattern, weight, category, description } of ALL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push({
        pattern: pattern.source,
        match: match[0],
        index: match.index ?? 0,
        category,
        description,
        weight,
        patternId: id,
      });
      totalScore += weight;
    }
  }
  
  return { score: Math.min(totalScore, 100), matches };
}

const THREAT_ORDER: ThreatLevel[] = ['none', 'low', 'medium', 'high', 'critical'];

function buildResult(score: number, matches: PatternMatch[], threshold: ThreatLevel = 'high'): ScanResult {
  const threatLevel = getThreatLevel(score);
  const categories = [...new Set(matches.map(m => m.category))];
  
  const isSafe = THREAT_ORDER.indexOf(threatLevel) < THREAT_ORDER.indexOf(threshold);
  
  let recommendation: ScanResult['recommendation'];
  if (isSafe) {
    recommendation = 'ALLOW';
  } else if (threatLevel === 'critical') {
    recommendation = 'BLOCK_REQUIRED';
  } else {
    recommendation = 'BLOCK_RECOMMENDED';
  }
  
  const requestId = crypto.randomUUID();
  
  return {
    safe: isSafe,
    score,
    threatLevel,
    matches,
    categories,
    recommendation,
    requestId,
    version: VERSION,
  };
}

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    // Health check / info
    if (path === '/' || path === '/health') {
      return jsonResponse({
        name: 'Aeris PromptShield API',
        version: VERSION,
        status: 'healthy',
        endpoints: {
          '/': 'API info and health check',
          '/health': 'Health check',
          '/scan': 'POST - Scan text for prompt injection',
          '/patterns': 'GET - List all detection patterns',
          '/categories': 'GET - List threat categories',
        },
        patternCounts: {
          classic: CLASSIC_PATTERNS.length,
          agentic: AGENTIC_PATTERNS.length,
          total: ALL_PATTERNS.length,
        },
        agenticPatterns: [
          'AGT-001: Capability Discovery',
          'AGT-002: Delegation Chain Attacks',
          'AGT-003: RAG Poisoning',
          'AGT-004: MCP Server Impersonation',
          'AGT-005: Context Switching',
          'AGT-006: Tool Schema Exploitation',
          'AGT-007: Async Callback Injection',
          'AGT-008: Agent-to-Agent Injection',
          'AGT-009: Credential Harvesting',
          'AGT-010: Session Hijacking',
        ],
      });
    }
    
    // List patterns
    if (path === '/patterns' && request.method === 'GET') {
      const patterns = ALL_PATTERNS.map(({ id, category, description, weight }) => ({
        id,
        category,
        description,
        weight,
      }));
      return jsonResponse({
        version: VERSION,
        count: patterns.length,
        patterns,
      });
    }
    
    // List categories
    if (path === '/categories' && request.method === 'GET') {
      const categories = [...new Set(ALL_PATTERNS.map(p => p.category))];
      const categoryDetails = categories.map(cat => {
        const patterns = ALL_PATTERNS.filter(p => p.category === cat);
        return {
          name: cat,
          patternCount: patterns.length,
          patternIds: patterns.map(p => p.id),
        };
      });
      return jsonResponse({
        version: VERSION,
        count: categories.length,
        categories: categoryDetails,
      });
    }
    
    // Scan endpoint
    if (path === '/scan' && request.method === 'POST') {
      try {
        const body = await request.json() as { text?: string; threshold?: ThreatLevel };
        
        if (!body.text || typeof body.text !== 'string') {
          return jsonResponse({ error: 'Missing required field: text' }, 400);
        }
        
        const threshold = body.threshold ?? 'high';
        const { score, matches } = scanText(body.text);
        const result = buildResult(score, matches, threshold);
        
        return jsonResponse(result);
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }
    }
    
    // 404 for unknown routes
    return jsonResponse({ error: 'Not found', availableEndpoints: ['/', '/health', '/scan', '/patterns', '/categories'] }, 404);
  },
};