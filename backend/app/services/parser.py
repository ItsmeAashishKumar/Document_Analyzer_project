
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import json
import csv
from io import StringIO
import tempfile
import os
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from app.core.logging import setup_logging

logger = setup_logging()

class DocumentParser:
    """Parses PDF, JSON, and CSV files"""

    def _validate_file(self, file: UploadFile) -> None:
        """Validate file size and type"""
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes")
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF, JSON, or CSV files are allowed")

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber or pytesseract"""
        try:
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                if text.strip():
                    return text
        except Exception:
            logger.warning("pdfplumber failed, attempting OCR")

        try:
            images = convert_from_path(file_path)
            text = ""
            for image in images:
                page_text = pytesseract.image_to_string(image, lang='eng')
                text += page_text + "\n"
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

    def parse_json(self, content: bytes) -> str:
        """Parse JSON and convert to string"""
        try:
            json_data = json.loads(content.decode('utf-8'))
            return json.dumps(json_data, indent=2)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")

    def parse_csv(self, content: bytes) -> str:
        """Parse CSV and convert to readable format"""
        try:
            csv_content = content.decode('utf-8')
            csv_reader = csv.DictReader(StringIO(csv_content))
            text = ""
            for row in csv_reader:
                text += "\n".join(f"{key}: {value}" for key, value in row.items()) + "\n"
            return text
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid CSV format")

    def parse_file(self, file: UploadFile) -> str:
        """Parse file based on content type"""
        self._validate_file(file)
        content = file.file.read()

        if file.content_type == 'application/pdf':
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            try:
                temp_file.write(content)
                temp_file.close()
                return self.extract_text_from_pdf(temp_file.name)
            finally:
                if os.path.exists(temp_file.name):
                    os.remove(temp_file.name)
        elif file.content_type == 'application/json':
            return self.parse_json(content)
        elif file.content_type == 'text/csv':
            return self.parse_csv(content)
