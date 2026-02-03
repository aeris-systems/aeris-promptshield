# Integration Guide

Practical examples for integrating Aeris PromptShield with popular LLM frameworks and tools.

## OpenAI Python SDK

```python
from openai import OpenAI
from shield_aeris import ShieldAeris

client = OpenAI()
shield = ShieldAeris(api_key="your_api_key")

def safe_chat(user_message: str) -> str:
    # Scan before sending to LLM
    result = shield.scan(user_message)
    
    if result.threat_level in ["HIGH", "CRITICAL"]:
        return f"Message blocked: {result.explanation}"
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}]
    )
    return response.choices[0].message.content
```

## LangChain

```python
from langchain.callbacks import BaseCallbackHandler
from shield_aeris import ShieldAeris

class ShieldCallback(BaseCallbackHandler):
    def __init__(self, api_key: str):
        self.shield = ShieldAeris(api_key=api_key)
    
    def on_llm_start(self, serialized, prompts, **kwargs):
        for prompt in prompts:
            result = self.shield.scan(prompt)
            if result.threat_level in ["HIGH", "CRITICAL"]:
                raise ValueError(f"Injection detected: {result.explanation}")

# Usage
from langchain.llms import OpenAI
llm = OpenAI(callbacks=[ShieldCallback(api_key="your_key")])
```

## Anthropic Claude

```python
import anthropic
from shield_aeris import ShieldAeris

client = anthropic.Anthropic()
shield = ShieldAeris(api_key="your_api_key")

def safe_claude(user_message: str) -> str:
    result = shield.scan(user_message)
    
    if result.threat_level in ["HIGH", "CRITICAL"]:
        return f"Message blocked: {result.explanation}"
    
    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}]
    )
    return message.content[0].text
```

## FastAPI Middleware

```python
from fastapi import FastAPI, Request, HTTPException
from shield_aeris import ShieldAeris

app = FastAPI()
shield = ShieldAeris(api_key="your_api_key")

@app.middleware("http")
async def scan_requests(request: Request, call_next):
    if request.method == "POST":
        body = await request.json()
        user_input = body.get("message", "")
        
        result = shield.scan(user_input)
        if result.threat_level in ["HIGH", "CRITICAL"]:
            raise HTTPException(
                status_code=400,
                detail=f"Potentially harmful input detected: {result.explanation}"
            )
    
    return await call_next(request)
```

## Express.js Middleware

```typescript
import express from 'express';
import { ShieldAeris } from '@aeris-systems/promptshield';

const app = express();
const shield = new ShieldAeris({ apiKey: 'your_api_key' });

app.use(express.json());

app.use(async (req, res, next) => {
  if (req.method === 'POST' && req.body.message) {
    const result = await shield.scan(req.body.message);
    
    if (['HIGH', 'CRITICAL'].includes(result.threatLevel)) {
      return res.status(400).json({
        error: 'Potentially harmful input detected',
        explanation: result.explanation
      });
    }
  }
  next();
});
```

## Vercel AI SDK

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ShieldAeris } from '@aeris-systems/promptshield';

const shield = new ShieldAeris({ apiKey: 'your_api_key' });

async function safeGenerate(prompt: string) {
  const scanResult = await shield.scan(prompt);
  
  if (['HIGH', 'CRITICAL'].includes(scanResult.threatLevel)) {
    throw new Error(`Blocked: ${scanResult.explanation}`);
  }
  
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: prompt,
  });
  
  return text;
}
```

## OpenClaw Agent Skill

Already integrated! Install with:

```bash
git clone https://github.com/aeris-systems/aeris-promptshield ~/.openclaw/workspace/skills/aeris-promptshield
```

Or via ClawHub:

```bash
clawhub install aeris-promptshield
```

The skill automatically scans incoming messages before your agent processes them.

---

## Best Practices

1. **Scan Early**: Check inputs before they reach your LLM, not after
2. **Log Everything**: Keep audit trails of blocked messages for analysis
3. **Graceful Degradation**: Don't crash — return helpful error messages
4. **Tune Thresholds**: Start strict (block HIGH+), loosen based on false positives
5. **Layer Defenses**: PromptShield + output validation + rate limiting

## Need Help?

- [GitHub Issues](https://github.com/aeris-systems/aeris-promptshield/issues)
- [API Documentation](https://aeris-shield-guard.lovable.app)
