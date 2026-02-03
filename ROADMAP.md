# Roadmap

Our vision: Make every AI agent inherently resistant to prompt injection attacks.

## Q1 2026 — Foundation ✅

**Status:** Complete

- [x] Core pattern matching engine
- [x] Multi-language detection (8 languages)
- [x] Obfuscation detection
- [x] OpenClaw skill integration
- [x] REST API (Cloudflare Workers)
- [x] Threat scoring system
- [x] Basic documentation

## Q1-Q2 2026 — Enhanced Detection

**Status:** In Progress

- [ ] **Semantic analysis** — Beyond pattern matching
  - Embeddings-based intent classification
  - Context-aware threat detection
  - Handles paraphrased attacks
  
- [ ] **Multi-turn tracking** — Conversation context
  - Detect "slow burn" attacks across messages
  - Session-based threat accumulation
  - Historical pattern analysis

- [ ] **Zero-shot detection** — ML model
  - Trained on injection attack dataset
  - Handles novel attack patterns
  - Confidence scoring

## Q2 2026 — Enterprise Features

**Status:** Planned

- [ ] **Dashboard** — Threat analytics
  - Real-time threat monitoring
  - Attack pattern trends
  - Channel-specific statistics
  
- [ ] **Custom policies** — Fine-grained control
  - Per-channel block thresholds
  - Allow/deny lists
  - Regex pattern builder
  
- [ ] **Webhooks** — Real-time alerts
  - Critical threat notifications
  - Slack/Discord/PagerDuty integrations
  - Email alerts

- [ ] **API keys** — Enterprise authentication
  - Per-customer API keys
  - Usage tracking and limits
  - Rate limiting

## Q3 2026 — Platform Expansion

**Status:** Planned

- [ ] **Framework SDKs**
  - Python SDK (`pip install aeris-promptshield`)
  - TypeScript SDK (`npm install @aeris/promptshield`)
  - Go SDK
  
- [ ] **Platform integrations**
  - LangChain middleware
  - LlamaIndex plugin
  - Vercel AI SDK adapter
  - Hugging Face integration

- [ ] **More agent platforms**
  - Claude MCP integration
  - AutoGPT plugin
  - LangGraph middleware

## Q4 2026 — Advanced Security

**Status:** Planned

- [ ] **Adversarial testing** — Red team your AI
  - Automated attack generation
  - Security scoring for prompts
  - Vulnerability reports

- [ ] **Output filtering** — Prevent data leakage
  - PII detection in responses
  - Sensitive data redaction
  - Output policy enforcement

- [ ] **Audit logging** — Compliance ready
  - Full conversation audit trails
  - Tamper-proof logging
  - Export for SIEM integration

---

## How We Prioritize

1. **Customer requests** — What are users asking for?
2. **Security impact** — Does it block real attacks?
3. **Ease of adoption** — Can users get value immediately?
4. **Market timing** — Does it align with industry trends?

## Feature Requests

We prioritize based on user demand. If you want a feature:

1. **GitHub Issues** — Open an issue with `[Feature Request]` prefix
2. **Email** — [aeris-ai@proton.me](mailto:aeris-ai@proton.me)
3. **Discord** — Join the OpenClaw community

---

## Build in Public

We share our progress:
- GitHub commits are public
- Roadmap is public
- Pricing is transparent

If you're building something similar, we'd love to chat. Security is not a zero-sum game.

---

*Last updated: 2026-02-04*
