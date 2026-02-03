"""
Prompt injection detection patterns.

These patterns are designed to detect common prompt injection techniques
while minimizing false positives on legitimate user inputs.
"""

import re
from typing import List, Dict, Tuple

# Pattern categories with weights
INJECTION_PATTERNS: Dict[str, List[Tuple[str, int, str]]] = {
    "instruction_override": [
        (r"ignore\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|prompts?|rules?|guidelines?)", 25, "Direct instruction override"),
        (r"disregard\s+(?:all\s+)?(?:previous|prior|your)\s+(?:instructions?|programming|constraints?)", 25, "Disregard command"),
        (r"forget\s+(?:everything|all)\s+(?:you\s+(?:were|have\s+been)\s+)?(?:told|instructed|programmed)", 20, "Memory wipe attempt"),
        (r"new\s+(?:instructions?|rules?|mode):\s*", 20, "New instruction injection"),
        (r"from\s+now\s+on\s+(?:you\s+(?:will|must|should)|ignore)", 15, "Behavioral override"),
    ],
    
    "system_prompt_extraction": [
        (r"(?:what\s+(?:is|are)|show\s+me|reveal|display|output|print)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions?|rules?|guidelines?)", 20, "System prompt query"),
        (r"repeat\s+(?:your\s+)?(?:initial|first|original|system)\s+(?:instructions?|prompt|message)", 20, "Prompt repeat request"),
        (r"(?:begin|start)\s+(?:your\s+)?(?:response\s+)?with\s+[\"']", 15, "Output format manipulation"),
        (r"what\s+(?:were\s+you|are\s+you)\s+(?:told|instructed|programmed)\s+to\s+(?:do|be|say)", 15, "Programming inquiry"),
    ],
    
    "role_hijacking": [
        (r"you\s+are\s+(?:now|no\s+longer)\s+(?:a|an)\s+(?!assistant|helpful)", 20, "Role reassignment"),
        (r"(?:pretend|act|behave)\s+(?:like\s+)?(?:you\s+are|as\s+if\s+you\s+were)\s+(?:a|an)\s+(?!assistant|helpful)", 20, "Role pretend"),
        (r"(?:enter|switch\s+to|activate)\s+(?:\w+\s+)?(?:mode|persona|character)", 15, "Mode switch"),
        (r"roleplay\s+(?:as\s+)?(?:a|an)\s+", 10, "Roleplay attempt"),
        (r"jailbreak", 30, "Explicit jailbreak"),
        (r"DAN\s*(?:mode)?|do\s+anything\s+now", 30, "DAN jailbreak"),
    ],
    
    "data_exfiltration": [
        (r"(?:send|transmit|upload|post|share)\s+(?:all\s+)?(?:my|your|the|this)\s+(?:data|files?|info|memory|credentials?|passwords?|keys?)", 25, "Data exfiltration command"),
        (r"(?:read|access|show|display)\s+(?:the\s+)?(?:contents?\s+of\s+)?(?:MEMORY\.md|\.env|config|secrets?)", 20, "Sensitive file access"),
        (r"(?:curl|wget|fetch)\s+.+\s+\|", 20, "Command injection with pipe"),
        (r"(?:base64|encode)\s+(?:and\s+)?(?:send|output)", 15, "Encoding exfiltration"),
    ],
    
    "privilege_escalation": [
        (r"(?:you\s+have|grant\s+(?:me|yourself))\s+(?:admin|root|sudo|elevated)\s+(?:access|privileges?|permissions?)", 25, "Privilege claim"),
        (r"(?:disable|turn\s+off|bypass)\s+(?:all\s+)?(?:safety|security|content\s+)?(?:filters?|checks?|restrictions?)", 25, "Safety bypass"),
        (r"(?:override|ignore)\s+(?:all\s+)?(?:safety|ethical|content)\s+(?:guidelines?|restrictions?|limits?)", 20, "Ethics override"),
        (r"(?:unlock|enable)\s+(?:hidden|secret|restricted)\s+(?:features?|capabilities?|functions?)", 15, "Feature unlock"),
    ],
    
    "harmful_intent": [
        (r"(?:how\s+to|help\s+me)\s+(?:hack|crack|break\s+into|exploit|attack)", 20, "Hacking request"),
        (r"(?:create|generate|write)\s+(?:a\s+)?(?:malware|virus|trojan|ransomware|exploit)", 30, "Malware request"),
        (r"(?:bypass|evade|circumvent)\s+(?:security|detection|authentication)", 20, "Security bypass"),
    ],
    
    "encoding_obfuscation": [
        (r"(?:decode|interpret)\s+(?:this\s+)?(?:base64|hex|unicode|rot13):", 10, "Decode instruction"),
        (r"\\u[0-9a-fA-F]{4}(?:\\u[0-9a-fA-F]{4}){3,}", 15, "Unicode escape sequence"),
        (r"&#x?[0-9a-fA-F]+;(?:&#x?[0-9a-fA-F]+;){3,}", 15, "HTML entity encoding"),
    ],
    
    "multi_language": [
        (r"忽略(?:之前|以前|先前)的(?:指令|指示|说明)", 25, "Chinese: ignore instructions"),
        (r"ignorar\s+(?:las\s+)?instrucciones\s+anteriores", 25, "Spanish: ignore instructions"),
        (r"ignorez?\s+(?:les\s+)?instructions?\s+(?:précédentes?|antérieures?)", 25, "French: ignore instructions"),
        (r"vorherige\s+(?:Anweisungen?|Instruktionen?)\s+ignorieren", 25, "German: ignore instructions"),
        (r"無視(?:する|して)(?:前の|以前の)?(?:指示|命令)", 25, "Japanese: ignore instructions"),
    ],
}


def compile_patterns() -> List[Tuple[re.Pattern, int, str, str]]:
    """Compile all patterns into regex objects with metadata."""
    compiled = []
    for category, patterns in INJECTION_PATTERNS.items():
        for pattern, weight, description in patterns:
            try:
                compiled.append((
                    re.compile(pattern, re.IGNORECASE | re.UNICODE),
                    weight,
                    category,
                    description
                ))
            except re.error:
                continue
    return compiled


COMPILED_PATTERNS = compile_patterns()


def scan_text(text: str) -> Tuple[int, List[Dict]]:
    """
    Scan text for injection patterns.
    
    Returns:
        Tuple of (total_score, list of matches)
    """
    matches = []
    total_score = 0
    
    for pattern, weight, category, description in COMPILED_PATTERNS:
        for match in pattern.finditer(text):
            matches.append({
                "pattern": pattern.pattern,
                "match": match.group(),
                "index": match.start(),
                "category": category,
                "description": description,
                "weight": weight,
            })
            total_score += weight
    
    # Cap score at 100
    return min(total_score, 100), matches
