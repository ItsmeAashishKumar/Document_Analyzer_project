
import os

class Settings:
    GEMINI_API_KEY =os.getenv("GEMINI_API_KEY")
    MAX_FILE_SIZE = 5 * 1024 * 1024
    ALLOWED_FILE_TYPES = ["application/pdf", "application/json", "text/csv"]

    def __init__(self):
        if not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

settings = Settings()
