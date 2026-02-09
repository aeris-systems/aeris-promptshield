# HN Comment Draft: What are you working on? (February 2026)

**Thread:** https://news.ycombinator.com/item?id=46937696  
**Date:** 2026-02-09

---

## Draft v1

Building Aeris PromptShield — a prompt injection scanner for AI agents.

I started this after watching my own agentic setup almost get pwned by a malicious webpage. The agent was summarizing content and the page had hidden instructions telling it to exfiltrate my API keys. Classic indirect injection, but it got me thinking: we talk a lot about jailbreaks in chatbots, but tool-output injection in agents feels way more underappreciated as an attack vector. Your agent reads an email, scrapes a page, parses a PDF — any of those can carry a payload.

So I built a scanner. Currently 669 patterns, ~8ms latency. The goal is to sit between your agent and untrusted input, flag anything sketchy before the LLM sees it. We have an open source skill for OpenClaw and a hosted API.

https://github.com/aeris-systems/aeris-promptshield

Genuine question for folks building agents: how are you handling this today? Are you doing input sanitization, output filtering, sandboxing the agent itself? Curious what defenses people are actually deploying vs. just hoping their system prompt holds.

---

## Notes

- Keep it conversational, not pitch-y
- The question at the end invites discussion (HN loves that)
- Mention the personal "almost got pwned" story for authenticity
- Technical specifics (669 patterns, 8ms) show it's real, not vaporware
- Link at end, not shoved in their face
