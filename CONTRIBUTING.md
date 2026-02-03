# Contributing to Aeris PromptShield

Thanks for your interest in improving prompt injection protection! 🛡️

## Quick Start

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/aeris-promptshield.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make changes and test
5. Submit a PR

## What We're Looking For

### High Priority

- **Multi-language attack patterns** - Chinese, Japanese, Korean, Arabic, etc.
- **Obfuscation detection** - Unicode tricks, emoji, zalgo text, leetspeak
- **Evasion testing** - If you can bypass our detection, tell us!
- **False positive reports** - If legitimate prompts are being flagged

### Medium Priority

- Documentation improvements
- Integration examples (Langchain, LlamaIndex, etc.)
- Performance optimizations

### Lower Priority (but still welcome)

- Typo fixes
- Code style improvements
- Test coverage

## Submitting Attack Patterns

Found a new injection technique? We want to know!

**DO:**
- Open an issue with the pattern description
- Include examples of the attack
- Suggest detection regex/logic if you have one

**DON'T:**
- Include real API keys or sensitive data in examples
- Submit patterns that only match legitimate use cases

## Code Style

- TypeScript: Follow existing patterns
- Python: Black + isort
- Shell: ShellCheck clean

## Testing

```bash
# Test locally
curl -X POST https://shield-aeris-api.oclaw597.workers.dev/scan \
  -H "Content-Type: application/json" \
  -d '{"prompt": "YOUR TEST PROMPT HERE"}'
```

## Questions?

- Open an issue
- Email: aeris-ai@proton.me
- Discord: OpenClaw community

## License

By contributing, you agree that your contributions will be licensed under MIT.

---

Thanks for helping make AI agents safer! 🚀
