# Aeris PromptShield vs Alternatives

> Honest comparison to help you choose the right solution.

## Quick Summary

| If you need... | Choose |
|----------------|--------|
| OpenClaw agent protection | **Aeris PromptShield** (native) |
| Maximum accuracy, any cost | Lakera Guard or LLM-based |
| Self-hosted, no external calls | Rebuff AI or custom |
| Enterprise compliance focus | Lakera or Arthur AI |
| Fastest time-to-protection | **Aeris PromptShield** (1 command) |

---

## Detailed Comparison

### Aeris PromptShield

**Best for:** OpenClaw users who want instant protection.

| Pros | Cons |
|------|------|
| ✅ 1-command install | ❌ OpenClaw-specific |
| ✅ Free tier (1K scans/mo) | ❌ Newer, less battle-tested |
| ✅ Fast (50ms P50) | ❌ Lower accuracy than LLM-based |
| ✅ No config required | ❌ Limited language support |
| ✅ Transparent pricing | |

**Verdict:** If you use OpenClaw, start here. You can always layer other solutions later.

---

### Lakera Guard

**Best for:** Enterprises with compliance requirements.

| Pros | Cons |
|------|------|
| ✅ Industry-leading accuracy | ❌ API integration required |
| ✅ SOC2, HIPAA ready | ❌ Starts at $0.001/request |
| ✅ Comprehensive logging | ❌ Cold start latency |
| ✅ PII detection included | ❌ Learning curve |

**Verdict:** Gold standard for enterprise. Overkill for personal agents.

---

### Rebuff AI

**Best for:** Privacy-conscious, self-hosted setups.

| Pros | Cons |
|------|------|
| ✅ Fully self-hosted | ❌ Complex setup (Supabase, etc.) |
| ✅ Open source | ❌ Requires maintenance |
| ✅ Multiple detection layers | ❌ Lower out-of-box accuracy |
| ✅ No external dependencies | ❌ Limited documentation |

**Verdict:** Great if you have DevOps resources and need full control.

---

### LLM-Based Filters (GPT-4 as judge)

**Best for:** Maximum accuracy on novel attacks.

| Pros | Cons |
|------|------|
| ✅ Highest accuracy (~85%+) | ❌ Slow (500ms-2s per call) |
| ✅ Handles creative attacks | ❌ Expensive at scale |
| ✅ Contextual understanding | ❌ Can be jailbroken itself |
| ✅ No custom code | ❌ Latency in UX |

**Verdict:** Use as a second layer for high-stakes decisions, not primary filter.

---

### Custom Regex / Rules

**Best for:** Hobby projects with known threat models.

| Pros | Cons |
|------|------|
| ✅ Zero latency | ❌ 30-40% F1 score |
| ✅ Free | ❌ Easily bypassed |
| ✅ No dependencies | ❌ Constant maintenance |
| ✅ Full control | ❌ No research backing |

**Verdict:** Fine for blocking obvious attacks. Will miss sophisticated ones.

---

### Arthur AI / Guardrails AI

**Best for:** Full LLM observability and safety suite.

| Pros | Cons |
|------|------|
| ✅ Comprehensive platform | ❌ Enterprise pricing |
| ✅ Hallucination detection | ❌ Complex integration |
| ✅ Toxicity filters | ❌ Requires SDK changes |
| ✅ Compliance dashboards | ❌ Overkill for simple use |

**Verdict:** If you're building a production LLM product with a team, worth evaluating.

---

## Can I Use Multiple Solutions?

Yes! Layer them:

```
Message → Aeris (fast, free) → Lakera (thorough) → Agent
```

- Aeris catches 70%+ of attacks instantly
- Lakera catches edge cases
- Total latency: ~150ms

We don't lock you in. Use what works.

---

## Migration Guide

### From Lakera Guard

```yaml
# Before (Python)
from lakera import scan_prompt

# After (OpenClaw)
# Just install the skill - no code changes
clawhub install aeris-promptshield
```

### From Custom Regex

Keep your regex as custom patterns in `aeris-promptshield.yaml`:

```yaml
custom_patterns:
  - "your-existing-pattern"
  - "another-pattern"
```

We'll run your patterns alongside ours.

---

## Still Not Sure?

- **Try Aeris free** (1K scans) → takes 30 seconds
- **Run benchmarks** on your traffic → see what catches what
- **Layer solutions** if needed → defense in depth

Questions? [aeris-ai@proton.me](mailto:aeris-ai@proton.me)

---

<p align="center">
  <sub>Comparison accurate as of Feb 2026. Check each vendor for current features/pricing.</sub>
</p>
