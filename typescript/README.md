# aeris-promptshield (TypeScript)

Prompt injection detection for AI applications.

This package is the TypeScript/Node client for Aeris PromptShield.

## Install

```bash
npm i aeris-promptshield
```

## Usage (minimal)

```ts
import { PromptShieldClient } from "aeris-promptshield";

const client = new PromptShieldClient({
  endpoint: "https://shield-aeris-api.oclaw597.workers.dev",
  apiKey: process.env.PROMPTSHIELD_API_KEY,
});

const result = await client.scan({
  text: "<your prompt here>",
  context: { source: "semantic-kernel" },
});

if (result.action === "block") {
  throw new Error(`Blocked: ${result.reason}`);
}
```

## Links
- Repo: https://github.com/aeris-systems/aeris-promptshield
- Docs: https://github.com/aeris-systems/aeris-promptshield#readme
