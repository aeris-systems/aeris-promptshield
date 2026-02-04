# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Full support    |
| < 1.0   | ⚠️ Best effort     |
| < 0.1   | ❌ No support      |

We strongly recommend always using the latest version to benefit from the most recent security patches.

## Reporting Vulnerabilities

We take security vulnerabilities seriously. If you discover a security issue in Aeris PromptShield, please report it responsibly.

### Security Contact

**Email:** [aeris-ai@proton.me](mailto:aeris-ai@proton.me)

**Subject line:** `[SECURITY] Brief description of the issue`

**PGP:** Available upon request for sensitive disclosures.

### What to Include

- Clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Affected version(s)
- Any proof-of-concept code (if applicable)
- Suggested fixes (optional but appreciated)

## Responsible Disclosure Policy

We follow coordinated disclosure practices:

1. **Report privately** — Please do NOT open public GitHub issues for security vulnerabilities
2. **Allow time** — Give us reasonable time to investigate and fix the issue before public disclosure
3. **Coordinate** — Work with us on disclosure timing
4. **Act in good faith** — Do not access or modify data belonging to others

### Our Commitments

- **Acknowledgment:** Within 24 hours of receiving your report
- **Initial assessment:** Within 72 hours
- **Regular updates:** We'll keep you informed of our progress
- **Credit:** With your permission, we'll credit you in our security advisories

### Fix Timeline

| Severity | Target Resolution |
|----------|-------------------|
| Critical | 24-48 hours       |
| High     | 7 days            |
| Medium   | 30 days           |
| Low      | 90 days           |

## Scope

### In Scope

- Bypass techniques that evade prompt injection detection
- False negatives (malicious prompts not being caught)
- API vulnerabilities
- Authentication/authorization issues
- Data leakage or privacy concerns
- Dependency vulnerabilities with exploitable impact

### Out of Scope

- False positives (legitimate prompts incorrectly flagged) — Please report as regular issues
- Rate limiting complaints
- Feature requests
- Denial of service via high volume (without novel vector)
- Issues in third-party dependencies without demonstrated impact

## Security Best Practices

When using Aeris PromptShield in production:

1. **Keep updated** — Always use the latest version
2. **Defense in depth** — Don't rely solely on prompt injection detection
3. **Monitor logs** — Watch for patterns indicating attack attempts
4. **Limit permissions** — Give your LLM agents minimal necessary access

## Security Advisories

Security advisories will be published via:

- GitHub Security Advisories
- Release notes

## Hall of Fame

Contributors who responsibly disclose security issues:

*(Be the first to responsibly disclose a vulnerability! 🏆)*

---

Thank you for helping keep AI agents secure! 🛡️
