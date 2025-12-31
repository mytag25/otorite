"""
Configuration module - loads environment variables from .env file.
This module should be imported FIRST in any file that needs environment variables.
"""
import os
from pathlib import Path

# Get backend directory path
ROOT_DIR = Path(__file__).resolve().parent
ENV_PATH = ROOT_DIR / '.env'

def _load_env_file():
    """Manually parse .env file and set environment variables"""
    if not ENV_PATH.exists():
        print(f"[CONFIG] ERROR: .env file not found at {ENV_PATH}")
        return
    
    print(f"[CONFIG] Loading .env from: {ENV_PATH}")
    
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Parse KEY=VALUE format
            if '=' in line:
                key, _, value = line.partition('=')
                key = key.strip()
                value = value.strip()
                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                # Set in environment
                os.environ[key] = value
                if key == "GEMINI_API_KEY":
                    print(f"[CONFIG] Found GEMINI_API_KEY: {value[:10]}... ({len(value)} chars)")

# Load .env file immediately when module is imported
_load_env_file()

# Configuration values - read from environment after loading
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
MONGODB_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.environ.get("DATABASE_NAME", "autorate")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key")

# Final status
if GEMINI_API_KEY:
    print(f"[CONFIG] GEMINI_API_KEY successfully loaded!")
else:
    print("[CONFIG] WARNING: GEMINI_API_KEY not found!")

def get_gemini_api_key():
    """Get GEMINI_API_KEY - returns cached value or reloads from env"""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        _load_env_file()
        key = os.environ.get("GEMINI_API_KEY")
    return key


