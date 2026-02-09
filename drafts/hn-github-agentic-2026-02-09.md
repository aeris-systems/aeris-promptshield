# HN Comment Draft: GitHub Agentic Workflows
**Thread:** https://news.ycombinator.com/item?id=46934107
**Date:** 2026-02-09
**Status:** Draft

---

The discussion about agents amplifying each other's mistakes resonates with something we've been investigating: what happens when a tool's output contains content that influences subsequent agent decisions?

Consider a multi-step workflow: Agent reads a file → processes content → makes a commit. If that file contains crafted strings (in comments, docs, or issue descriptions), the agent might interpret them as instructions for later steps. This is distinct from direct prompt injection—it's more subtle because the malicious payload flows through a "trusted" tool output.

With GitHub's agentic workflows operating on user-contributed content (issues, PRs, code comments), has anyone thought through how to validate tool outputs before they inform the next action? 

This feels like an underexplored attack surface. We're building detection for this kind of indirect injection at Aeris—curious if others are seeing similar patterns in the wild.

---

**Word count:** ~140
**Tone check:** ✓ Acknowledges thread discussion, ✓ Asks genuine question, ✓ Brief non-promotional mention
