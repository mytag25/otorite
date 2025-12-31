
import asyncio
from database import db_instance
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

async def check_db():
    try:
        logging.info("Starting connection check...")
        db_instance.connect()
        db = db_instance.get_db()
        # Perform a simple command
        status = await db.command("ping")
        logging.info(f"Database Ping Result: {status}")
        
        # Check a collection
        count = await db.vehicles.count_documents({})
        logging.info(f"Vehicle count: {count}")
        
        print("FINAL_RESULT: SUCCESS")
    except Exception as e:
        logging.error(f"Connection failed: {e}")
        print("FINAL_RESULT: FAILURE")
    finally:
        db_instance.close()

if __name__ == "__main__":
    asyncio.run(check_db())
