import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def reset_db():
    print("Connecting to MongoDB...")
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db_name = os.environ.get('DB_NAME', 'autorate')
    db = client[db_name]
    
    print(f"Dropping collections in {db_name}...")
    collections = await db.list_collection_names()
    for col in collections:
        print(f"Dropping {col}...")
        await db[col].drop()
        
    print("Database cleared.")
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_db())
