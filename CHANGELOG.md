# Changelog

All notable changes to Aeris PromptShield will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Semantic analysis via embeddings (beyond pattern matching)
- Multi-turn conversation context tracking
- Custom blocklist/allowlist management UI
- Rate limiting and abuse detection
- Webhook notifications for critical threats

## [1.0.0] - 2026-02-03

### Added
- Initial release of Aeris PromptShield
- Pattern-based prompt injection detection
- Multi-language attack detection (English, Chinese, Spanish, French, German, Russian, Japanese, Korean)
- Obfuscation detection (Base64, leetspeak, unicode tricks)
- OpenClaw skill integration (`beforeMessage` hook)
- REST API for external integrations
- Threat scoring system (0-100 scale)
- Threat level classification (NONE, LOW, MEDIUM, HIGH, CRITICAL)
- Configurable block thresholds
- Verbose logging option
- Channel skip list for trusted channels
- Custom pattern support (regex)

### Security Patterns Detected
- Instruction override ("ignore previous instructions")
- System prompt extraction ("what is your system prompt")
- Role hijacking ("you are now in admin mode")
- Data exfiltration ("send file to...")
- Authority escalation ("developer mode enabled")
- Jailbreak attempts (DAN, Developer Mode, etc.)
- Context manipulation (fake user messages, system messages)

### Documentation
- README with quick start guide
- SKILL.md for OpenClaw integration
- API reference
- Integration guides (LangChain, FastAPI, Vercel AI SDK)
- Benchmarks and alternatives comparison
- FAQ and troubleshooting
- Use cases and examples

### Infrastructure
- Live API at `https://shield-aeris-api.oclaw597.workers.dev`
- Landing page at `https://aeris-shield-guard.lovable.app`
- GitHub repository at `https://github.com/aeris-systems/aeris-promptshield`

---

## Release Notes Format

### For Major Releases (X.0.0)
- Breaking changes
- Migration guides
- New feature highlights

### For Minor Releases (0.X.0)
- New features
- Improvements
- Deprecations

### For Patch Releases (0.0.X)
- Bug fixes
- Security patches
- Performance improvements

---

*See [ROADMAP.md](ROADMAP.md) for upcoming features.*
