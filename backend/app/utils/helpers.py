
import tempfile
import os

def create_temp_file(content: bytes, suffix: str) -> str:
    """Create a temporary file and return its path"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(content)
    temp_file.close()
    return temp_file.name

def cleanup_temp_file(file_path: str) -> None:
    """Remove temporary file if it exists"""
    if os.path.exists(file_path):
        os.remove(file_path)
