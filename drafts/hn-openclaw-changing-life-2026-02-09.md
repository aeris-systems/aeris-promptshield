# HN Comment Draft

<!-- Thread: https://news.ycombinator.com/item?id=XXXXX -->
<!-- Title: "OpenClaw is changing my life" (247 pts, 413 comments) -->
<!-- Date: 2026-02-09 -->

---

Same here. The skill ecosystem is what makes it click for me — I can give my agent real capabilities without building everything from scratch.

One thing I've been thinking about more lately: security in these agentic workflows. When your agent is pulling data from external sources (emails, web pages, API responses) and acting on it, you're essentially trusting that content not to hijack your session. Tool-output injection is a real attack vector now — a malicious email could contain instructions that the model interprets as commands.

Not trying to spread FUD, I'm genuinely excited about where this is going. But it feels like we need better guardrails as these systems get more capable. We built a prompt injection scanner that plugs into OpenClaw as a skill (aeris-promptshield, available via `clawhub install`) specifically because we kept running into this ourselves.

Curious what others are doing for security hygiene with their setups. Sandboxing? Content filtering? Just vibes-based trust?

---

**Word count:** 168
