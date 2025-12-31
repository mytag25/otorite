
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
print(f"Testing connection to: {mongo_url}")

async def test_connection():
    try:
        client = AsyncIOMotorClient(mongo_url, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        print("Client created...")
        info = await client.server_info()
        print("Connected successfully!")
        print(f"Server info: {info.get('version')}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
