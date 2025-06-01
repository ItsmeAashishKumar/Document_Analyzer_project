# Document Analyzer with Privacy Guard

A FastAPI backend for analyzing PDF, JSON, and CSV files with privacy protection, integrated with Google Gemini API.

## Features
- **File Types**: PDF (text- and image-based), JSON, CSV (≤5MB).
- **Privacy**: Redacts PII (e.g., emails, phone numbers) and blocks sensitive queries (e.g., SSNs, phone numbers).
- **OCR**: Extracts text from image-based PDFs using `pytesseract` and `pdf2image`.
- **API**: `/api/analyze` endpoint for frontend integration.

## Setup

1. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd backend