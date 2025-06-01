
import re
from typing import List, Dict, Any
from app.models.pii import PIIPattern
from fastapi import HTTPException
from app.core.logging import setup_logging

logger = setup_logging()

class PIIDetector:
    """Detects and masks PII"""

    def __init__(self):
        self.patterns = [
            PIIPattern(
                name="email",
                pattern=r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                replacement=lambda m: f"{m.group()[:2]}***@{m.group().split('@')[1]}",
                description="Email addresses"
            ),
            PIIPattern(
                name="phone",
                pattern=r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
                replacement="***-***-****",
                description="Phone numbers"
            ),
            PIIPattern(
                name="ssn",
                pattern=r'\b\d{3}-\d{2}-\d{4}\b',
                replacement="***-**-****",
                description="Social Security Numbers"
            ),
            PIIPattern(
                name="credit_card",
                pattern=r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
                replacement="****-****-****-****",
                description="Credit card numbers"
            ),
            PIIPattern(
                name="name",
                pattern=r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
                replacement="[NAME]",
                description="Full names"
            )
        ]

    def detect_pii(self, text: str) -> List[Dict[str, Any]]:
        """Detect PII in text"""
        findings = []
        for pattern in self.patterns:
            matches = re.finditer(pattern.pattern, text)
            for match in matches:
                findings.append({
                    'type': pattern.name,
                    'value': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'description': pattern.description
                })
        return findings

    def mask_pii(self, text: str) -> str:
        """Mask PII in text"""
        masked_text = text
        for pattern in self.patterns:
            if callable(pattern.replacement):
                masked_text = re.sub(pattern.pattern, pattern.replacement, masked_text)
            else:
                masked_text = re.sub(pattern.pattern, pattern.replacement, masked_text)
        return masked_text

class PrivacyGuard:
    """Manages privacy protection"""

    def __init__(self):
        self.pii_detector = PIIDetector()
        self.sensitive_queries = [
            "list all emails", "show me names", "give me phone numbers",
            "extract personal info", "show sensitive data", "ssn", "social security",
            "credit card", "password", "phone", "contact number"
        ]

    def analyze_query_risk(self, query: str) -> bool:
        """Check if query requests sensitive information"""
        query_lower = query.lower()
        return any(sensitive_query in query_lower for sensitive_query in self.sensitive_queries)

    def protect_response(self, response: str, document_content: str) -> str:
        """Apply privacy protection to response"""
        response_pii = self.pii_detector.detect_pii(response)
        if response_pii:
            logger.info(f"Found {len(response_pii)} PII instances in response, masking...")
            protected_response = self.pii_detector.mask_pii(response)
            protected_response += "\n\n[Privacy Notice: Sensitive information has been masked for security.]"
            return protected_response
        return response
