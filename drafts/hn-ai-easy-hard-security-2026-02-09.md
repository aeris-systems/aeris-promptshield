# HN Comment Draft

**Thread:** AI makes the easy part easier and the hard part harder  
**ID:** 46939593  
**Date:** 2026-02-09

---

This resonates deeply from a security perspective. AI agents are a perfect example of this asymmetry.

It's never been easier to spin up an agent that calls APIs, reads files, browses the web. The "easy part" — getting something working — is trivially simple now. But the security implications? Those got significantly harder.

When your agent consumes output from external tools — API responses, web pages, file contents — you've created a new attack surface. Tool-output injection is essentially prompt injection via the data your agent trusts. An attacker can embed instructions in a webpage your agent reads, or an email it processes, and suddenly it's executing unintended actions.

The irony: the more capable and autonomous your agent becomes, the larger this attack surface grows. We've automated the easy parts of building these systems while multiplying the hard parts of securing them.

How are others approaching this? Are you treating all tool outputs as untrusted by default, or is there a middle ground that doesn't cripple agent functionality?

---

**Word count:** ~160  
**Tone:** Thoughtful, technical but accessible, genuine agreement with thesis  
**CTA:** Open question inviting discussion on practical approaches
