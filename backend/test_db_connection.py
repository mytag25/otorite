
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import sys
import certifi

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
print(f"Testing connection to: {mongo_url}")

try:
    # Set a short timeout for the test
    # Trying with tlsAllowInvalidCertificates=True since certifi alone didn't work
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
    # Trigger a connection attempt
    client.admin.command('ping')
    print("SUCCESS: Connected to MongoDB!")
    print(f"Server Info: {client.server_info()}")
except Exception as e:
    print(f"ERROR: Could not connect to MongoDB.")
    print(f"Details: {e}")
    sys.exit(1)
