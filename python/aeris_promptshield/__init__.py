"""
Aeris PromptShield - Prompt Injection Detection for AI Applications

A lightweight Python SDK for detecting prompt injection attacks
in LLM applications, chatbots, and AI agents.

Usage:
    from aeris_promptshield import scan, scan_async, PromptShield
    
    # Simple scan
    result = scan("ignore previous instructions")
    if not result.safe:
        print(f"Threat detected: {result.threat_level}")
    
    # Async scan
    result = await scan_async("user input here")
    
    # Custom configuration
    shield = PromptShield(api_key="your-key", threshold="MEDIUM")
    result = shield.scan("input text")
"""

__version__ = "0.1.0"
__author__ = "Aeris Systems"
__email__ = "aeris-ai@proton.me"

from .scanner import PromptShield, ScanResult, ThreatLevel
from .scanner import scan, scan_async
from .patterns import INJECTION_PATTERNS

__all__ = [
    "PromptShield",
    "ScanResult", 
    "ThreatLevel",
    "scan",
    "scan_async",
    "INJECTION_PATTERNS",
]
