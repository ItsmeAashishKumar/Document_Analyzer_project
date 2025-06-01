
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.parser import DocumentParser
from app.services.privacy import PrivacyGuard
from app.services.llm import call_llm
from app.core.config import settings
from app.core.logging import setup_logging

# Setup logging
logger = setup_logging()

app = FastAPI(title="Document Analyzer API")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "Healthy"}

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...), query: str = Form(...)):
    """Analyze uploaded PDF, JSON, or CSV with privacy protection"""
    try:
        parser = DocumentParser()
        privacy_guard = PrivacyGuard()

        # Parse file
        text = parser.parse_file(file)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")

        # Redact PII
        redacted_text = privacy_guard.pii_detector.mask_pii(text)

        # Process query with LLM
        response = call_llm(redacted_text, query)

        # Protect response
        protected_response = privacy_guard.protect_response(response, redacted_text)

        # Check for sensitive content
        sensitive_keywords = ["hate", "offensive", "explicit"]
        if any(keyword in protected_response.lower() for keyword in sensitive_keywords):
            raise HTTPException(status_code=400, detail="Response contains sensitive content")

        return {"response": protected_response}

    except HTTPException as e:
        logger.error(f"HTTP error: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
