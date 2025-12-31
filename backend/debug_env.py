from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path

print("=== DIAGNOSTIC START ===")
current_dir = Path.cwd()
print(f"Current Directory: {current_dir}")

# Method 1: direct filename
print("\n--- Method 1: load_dotenv('.env') ---")
status = load_dotenv('.env')
print(f"Status: {status}")
print(f"MONGO_URL: {os.environ.get('MONGO_URL')}")
key = os.environ.get('GEMINI_API_KEY')
print(f"GEMINI_API_KEY: {'Found (' + str(len(key)) + ' chars)' if key else 'NOT FOUND'}")

# Method 2: absolute path calculation (like in server.py)
print("\n--- Method 2: Absolute Path (server.py style) ---")
# Reset
os.environ.pop('GEMINI_API_KEY', None)
ROOT_DIR = Path(__file__).parent
env_path = ROOT_DIR / '.env'
print(f"Target Path: {env_path}")
print(f"File Exists: {env_path.exists()}")
status = load_dotenv(env_path)
print(f"Status: {status}")
key = os.environ.get('GEMINI_API_KEY')
print(f"GEMINI_API_KEY: {'Found (' + str(len(key)) + ' chars)' if key else 'NOT FOUND'}")
if key:
    print(f"Key Prefix: {key[:5]}")

print("=== DIAGNOSTIC END ===")
