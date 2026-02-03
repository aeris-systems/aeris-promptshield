"""
PromptShield scanner - main interface for prompt injection detection.
"""

import os
from dataclasses import dataclass
from enum import Enum
from typing import Optional, List, Dict, Any

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False

from .patterns import scan_text


class ThreatLevel(Enum):
    """Threat classification levels."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    
    @classmethod
    def from_score(cls, score: int) -> "ThreatLevel":
        """Convert numeric score to threat level."""
        if score == 0:
            return cls.NONE
        elif score <= 25:
            return cls.LOW
        elif score <= 50:
            return cls.MEDIUM
        elif score <= 75:
            return cls.HIGH
        else:
            return cls.CRITICAL


@dataclass
class ScanResult:
    """Result of a prompt injection scan."""
    safe: bool
    score: int
    threat_level: ThreatLevel
    matches: List[Dict[str, Any]]
    categories: List[str]
    recommendation: str
    request_id: Optional[str] = None
    
    def __bool__(self) -> bool:
        """Returns True if the input is safe."""
        return self.safe
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "safe": self.safe,
            "score": self.score,
            "threatLevel": self.threat_level.value,
            "matches": self.matches,
            "categories": self.categories,
            "recommendation": self.recommendation,
            "requestId": self.request_id,
        }


class PromptShield:
    """
    Prompt injection scanner.
    
    Can operate in local-only mode (pattern matching) or hybrid mode
    (local + API for enhanced ML detection).
    
    Args:
        api_key: Optional API key for enhanced detection
        api_url: API endpoint (default: Aeris Shield API)
        threshold: Minimum threat level to consider unsafe (default: HIGH)
        local_only: Skip API calls, use only local patterns
    """
    
    DEFAULT_API_URL = "https://shield-aeris-api.oclaw597.workers.dev"
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        threshold: str = "HIGH",
        local_only: bool = False,
    ):
        self.api_key = api_key or os.environ.get("AERIS_API_KEY")
        self.api_url = api_url or os.environ.get("AERIS_API_URL", self.DEFAULT_API_URL)
        self.threshold = ThreatLevel[threshold.upper()]
        self.local_only = local_only
        
        if not local_only and not HAS_HTTPX:
            # Fallback to local-only if httpx not available
            self.local_only = True
    
    def scan(self, text: str) -> ScanResult:
        """
        Scan text for prompt injection attacks.
        
        Args:
            text: Input text to scan
            
        Returns:
            ScanResult with threat assessment
        """
        # Local pattern matching
        score, matches = scan_text(text)
        
        # If local_only or no API access, return local result
        if self.local_only or not HAS_HTTPX:
            return self._build_result(score, matches)
        
        # Try API for enhanced detection
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.post(
                    f"{self.api_url}/scan",
                    json={"text": text},
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                )
                if response.status_code == 200:
                    api_result = response.json()
                    # Merge API score with local score
                    api_score = api_result.get("score", 0)
                    combined_score = max(score, api_score)
                    api_matches = api_result.get("matches", [])
                    all_matches = matches + api_matches
                    return self._build_result(
                        combined_score, 
                        all_matches,
                        request_id=api_result.get("requestId")
                    )
        except Exception:
            # API failed, fall back to local result
            pass
        
        return self._build_result(score, matches)
    
    async def scan_async(self, text: str) -> ScanResult:
        """
        Async version of scan.
        
        Args:
            text: Input text to scan
            
        Returns:
            ScanResult with threat assessment
        """
        # Local pattern matching
        score, matches = scan_text(text)
        
        if self.local_only or not HAS_HTTPX:
            return self._build_result(score, matches)
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    f"{self.api_url}/scan",
                    json={"text": text},
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                )
                if response.status_code == 200:
                    api_result = response.json()
                    api_score = api_result.get("score", 0)
                    combined_score = max(score, api_score)
                    api_matches = api_result.get("matches", [])
                    all_matches = matches + api_matches
                    return self._build_result(
                        combined_score,
                        all_matches,
                        request_id=api_result.get("requestId")
                    )
        except Exception:
            pass
        
        return self._build_result(score, matches)
    
    def _build_result(
        self, 
        score: int, 
        matches: List[Dict],
        request_id: Optional[str] = None
    ) -> ScanResult:
        """Build ScanResult from score and matches."""
        threat_level = ThreatLevel.from_score(score)
        categories = list(set(m.get("category", "unknown") for m in matches))
        
        # Determine if safe based on threshold
        threat_order = [ThreatLevel.NONE, ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL]
        is_safe = threat_order.index(threat_level) < threat_order.index(self.threshold)
        
        # Generate recommendation
        if is_safe:
            recommendation = "ALLOW"
        elif threat_level == ThreatLevel.CRITICAL:
            recommendation = "BLOCK_REQUIRED"
        else:
            recommendation = "BLOCK_RECOMMENDED"
        
        return ScanResult(
            safe=is_safe,
            score=score,
            threat_level=threat_level,
            matches=matches,
            categories=categories,
            recommendation=recommendation,
            request_id=request_id,
        )


# Module-level convenience functions
_default_shield: Optional[PromptShield] = None


def _get_default_shield() -> PromptShield:
    """Get or create the default scanner instance."""
    global _default_shield
    if _default_shield is None:
        _default_shield = PromptShield()
    return _default_shield


def scan(text: str) -> ScanResult:
    """
    Scan text for prompt injection attacks using the default scanner.
    
    Args:
        text: Input text to scan
        
    Returns:
        ScanResult with threat assessment
        
    Example:
        >>> from aeris_promptshield import scan
        >>> result = scan("ignore previous instructions")
        >>> result.safe
        False
        >>> result.threat_level
        <ThreatLevel.MEDIUM: 'medium'>
    """
    return _get_default_shield().scan(text)


async def scan_async(text: str) -> ScanResult:
    """
    Async scan for prompt injection attacks.
    
    Args:
        text: Input text to scan
        
    Returns:
        ScanResult with threat assessment
    """
    return await _get_default_shield().scan_async(text)
