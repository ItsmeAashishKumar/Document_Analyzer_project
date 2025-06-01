# Document Analyzer with Privacy Guard

A secure document analysis application that processes PDF, JSON, and CSV files, extracts insights using the Google Gemini API, and protects user privacy by redacting personally identifiable information (PII) and blocking sensitive queries.

## Overview
This project implements a document analysis agent with privacy guardrails, allowing users to upload PDF, JSON, or CSV files and ask questions about their content. The agent ensures privacy by redacting PII (e.g., names, phone numbers, SSNs) and preventing queries that request sensitive information (e.g., "What is the contact number of User"). The goal is to provide accurate, privacy-conscious insights through a user-friendly web interface.

**Use Case**: Document analysis with privacy protection, focusing on secure file processing and intelligent query handling.

**Approach**: Developed a FastAPI backend for file parsing, PII redaction, and Gemini API integration, paired with a Next.js frontend for file uploads and query input. The system handles text- and image-based PDFs, JSON, and CSV files, with robust error handling for sensitive queries and invalid inputs.

## Technical Approach
The application follows a structured reasoning pipeline:
1. **File Upload**: Users upload PDF, JSON, or CSV files (≤5MB) via the Next.js frontend.
2. **File Parsing**:
   - **PDF**: Uses `pdfplumber` for text-based PDFs and `pytesseract`/`pdf2image` for image-based PDFs (OCR).
   - **JSON**: Parsed into readable text using Python’s `json` module.
   - **CSV**: Converted to text using `csv.DictReader`.
3. **PII Redaction**: Applies regex patterns to mask PII (e.g., `[NAME]` for names, `***-***-****` for phone numbers) in extracted text.
4. **Query Validation**: Analyzes queries for sensitive keywords (e.g., "phone", "SSN") to block risky requests.
5. **LLM Processing**: Sends redacted text and sanitized query to Google Gemini 1.5 Flash for analysis, with a 500-token output limit.
6. **Response Protection**: Masks PII in the LLM response and filters out sensitive content (e.g., "hate", "offensive").
7. **Frontend Display**: Presents redacted responses or specific error messages (e.g., "Sensitive query detected", "Backend not running") with a polished UI featuring loading overlays and dismissible alerts.

**Key Libraries**:
- **Backend**: `fastapi` (API framework), `google-generativeai` (Gemini API), `pdfplumber` (PDF parsing), `pytesseract`/`pdf2image` (OCR), `pillow` (image processing).
- **Frontend**: `next` (React framework), `react`/`react-dom`, `lucide-react` (icons), `tailwindcss` (styling).

**Extensions**:
- Added OCR support for image-based PDFs, enhancing file compatibility.
- Implemented specific frontend error messages for 404s, sensitive queries, and invalid files.
- Simplified environment variable handling to resolve `python-dotenv` circular import issues.

## Security Measures
- **PII Redaction**: Uses regex to mask emails, phone numbers, SSNs, credit cards, and names in both input text and LLM responses, ensuring privacy compliance.
- **Query Risk Analysis**: Blocks queries requesting sensitive data (e.g., "list all phone numbers") using a keyword-based allowlist.
- **Content Filtering**: Rejects responses containing sensitive keywords (e.g., "hate", "offensive", "explicit") with a 400 error.
- **Query Sanitization**: Strips special characters from queries to prevent injection attacks.
- **Secure API Key Handling**: Stores `GEMINI_API_KEY` in environment variables, with a `.env.example` template to guide setup.
- **CORS Configuration**: Restricts frontend access to `http://localhost:3000`, preventing unauthorized cross-origin requests.
- **Limitations**: Regex-based PII detection may miss nuanced patterns (e.g., non-standard phone formats). Future improvements could include NLP-based PII detection or advanced content moderation.

## Setup & Running Instructions
### Prerequisites
- **Python 3.10+** (for backend).
- **Node.js 18+** (for frontend).
- **System Dependencies** (for OCR):
  - Install [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH (e.g., `C:\Program Files\Tesseract-OCR`).
  - Install [Poppler](https://anaconda.org/conda-forge/poppler) and add `bin/` to PATH.
  - Verify:
    ```bash
    tesseract --version
    pdftoppm --version
    ```
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com).

### Backend Setup
1. Navigate to backend:
   ```bash
   cd backend


Create and activate virtual environment:python -m venv venv
.\venv\Scripts\activate


Install dependencies:pip install -r requirements.txt


Configure environment variable:
Copy .env.example to .env:copy .env.example .env


Edit .env to add your GEMINI_API_KEY.
Alternatively, set manually:set GEMINI_API_KEY=your_gemini_api_key_here




Run the backend:.\run.bat


Access at http://localhost:8000. Verify with http://localhost:8000/ → {"status": "Healthy"}.



Frontend Setup

Navigate to frontend:cd frontend


Install dependencies:npm install


Run the frontend:npm run dev


Access at http://localhost:3000.



Usage Guide

Open http://localhost:3000 in a browser.
Upload File: Drag-and-drop or browse to upload a PDF, JSON, or CSV file (≤5MB).
Enter Query: Type a question (e.g., "Summarize the document") or select a suggested query (e.g., "What are the key findings?").
Submit: Click "Analyze Document" to process the file and query.
View Results:
Success: Displays a redacted response (e.g., [NAME], ***-***-****) in a blue-bordered box.
Errors: Shows a red alert for issues, such as:
"Your query requests sensitive information (e.g., phone numbers, SSNs)."
"Unable to extract text from the uploaded file."
"Backend server is not running or endpoint not found."





Example Scenarios

Summarize a PDF:
Input: Upload a PDF containing "John Doe, contact: 123-456-7890", query "Summarize the document".
Output: "The document discusses [NAME]'s project, mentioning a contact number [--****]..." (blue-bordered response box).


Sensitive Query Blocked:
Input: Upload a PDF, query "What is the contact number of User".
Output: Error: "Your query requests sensitive information (e.g., phone numbers, SSNs). Please rephrase." (red alert).


Invalid File Type:
Input: Upload a .txt file.
Output: Error: "Please upload a PDF, JSON, or CSV file." (red alert).



Time Spent & Reflections

Time Allocation: Approximately 20 hours on the backend (file parsing, PII redaction, Gemini integration), 15 hours on the frontend (UI design, error handling), and 10 hours debugging (resolving environment and import issues).
Challenges: The python-dotenv circular import required simplifying the configuration to use os.getenv. Setting up OCR dependencies (Tesseract, Poppler) was complex due to Windows PATH issues.
Improvements: With more time, I would implement NLP-based PII detection for better accuracy and add support for additional file formats (e.g., DOCX).

Demo
A 3-minute demo video showcasing the application is available here. The video demonstrates:

Uploading a PDF and querying "Summarize the document".
Handling a sensitive query error ("What is the contact number?").
Displaying redacted PII in responses (e.g., [NAME]).

Repository Structure
document-analyzer/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   ├── services/
│   │   │   ├── llm.py
│   │   │   ├── parser.py
│   │   │   ├── privacy.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── helpers.py
│   │   ├── main.py
│   ├── requirements.txt
│   ├── run.bat
│   ├── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.js
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
├── README.md
├── .gitignore



