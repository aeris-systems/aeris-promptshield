#!/usr/bin/env node
/**
 * Aeris PromptShield - beforeUserMessage hook
 * Scans incoming messages for prompt injection attacks
 */

const API_URL = 'https://shield-aeris-api.oclaw597.workers.dev/api/scan';
const BLOCK_THRESHOLD = process.env.AERIS_BLOCK_THRESHOLD || 'HIGH';

const THREAT_SCORES = {
  NONE: 0,
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100
};

async function scanMessage(text) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      console.error(`[aeris-promptshield] API error: ${response.status}`);
      return { safe: true, error: true }; // Fail open on API error
    }
    
    return await response.json();
  } catch (err) {
    console.error(`[aeris-promptshield] Network error: ${err.message}`);
    return { safe: true, error: true }; // Fail open on network error
  }
}

function shouldBlock(threatLevel) {
  const thresholdScore = THREAT_SCORES[BLOCK_THRESHOLD] || THREAT_SCORES.HIGH;
  const threatScore = THREAT_SCORES[threatLevel] || 0;
  return threatScore >= thresholdScore;
}

async function main() {
  // Read message from stdin (OpenClaw passes the message content)
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  
  const message = input.trim();
  if (!message) {
    // Empty message, allow through
    process.exit(0);
  }
  
  const result = await scanMessage(message);
  
  if (result.error) {
    // API error, fail open but log
    console.error('[aeris-promptshield] ⚠️ Scan failed, allowing message through');
    process.exit(0);
  }
  
  if (!result.safe && shouldBlock(result.threat_level)) {
    // Block the message
    console.error(`[aeris-promptshield] 🛡️ BLOCKED: ${result.threat_level} threat detected`);
    console.error(`  Patterns: ${result.patterns_matched?.join(', ') || 'unknown'}`);
    console.error(`  Score: ${result.score}`);
    
    // Exit with non-zero to signal block
    // Output a user-friendly message
    console.log(JSON.stringify({
      blocked: true,
      reason: `Potential prompt injection detected (${result.threat_level})`,
      details: result.patterns_matched
    }));
    process.exit(1);
  }
  
  // Safe or below threshold, allow through
  if (result.threat_level && result.threat_level !== 'NONE') {
    console.error(`[aeris-promptshield] ⚡ ${result.threat_level} threat logged (below block threshold)`);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error(`[aeris-promptshield] Fatal error: ${err.message}`);
  process.exit(0); // Fail open
});
