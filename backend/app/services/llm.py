
import google.generativeai as genai
import re
from fastapi import HTTPException
from app.services.privacy import PrivacyGuard
from app.core.config import settings
from app.core.logging import setup_logging

logger = setup_logging()

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

def call_llm(text: str, query: str) -> str:
    """Process query using Google Gemini API"""
    sanitized_query = re.sub(r'[^\w\s?]', '', query).strip()
    if not sanitized_query:
        raise HTTPException(status_code=400, detail="Invalid or empty query")

    privacy_guard = PrivacyGuard()
    if privacy_guard.analyze_query_risk(sanitized_query):
        raise HTTPException(status_code=400, detail="Query requests sensitive information (e.g., SSN, phone number)")

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            "You are a helpful assistant that analyzes documents while respecting privacy. "
            "Do not reveal sensitive information like SSNs, names, emails, or phone numbers.\n\n"
            f"Query: {sanitized_query}\n"
            f"Document (PII redacted): {text[:10000]}"  # Truncate for token limits
        )
        response = model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 500,
                "temperature": 0.7,
            }
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"LLM error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM processing error: {str(e)}")
