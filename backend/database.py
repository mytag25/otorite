from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

import certifi

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Database:
    client: AsyncIOMotorClient = None
    db_name: str = os.environ.get('DB_NAME', 'autorate')

    def connect(self):
        if not self.client:
            # SWITCHED TO LOCAL FILE DATABASE AS REQUESTED
            # This uses json_db.py adapter
            logging.info("USING LOCAL FILE DATABASE (json_db)")
            from json_db import AsyncJsonClient
            self.client = AsyncJsonClient()
            logging.info("Connected to Local JSON DB.")
            
            # Legacy MongoDB code kept for reference:
            # mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            # self.client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)

    def close(self):
        if self.client:
            logging.info("Closing MongoDB connection...")
            self.client.close()
            self.client = None
            logging.info("MongoDB connection closed.")

    def get_db(self):
        if not self.client:
            self.connect()
        return self.client[self.db_name]

# Singleton instance
db_instance = Database()

def get_database():
    return db_instance.get_db()
