
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.otorite
    vehicles = await db.vehicles.find({"brand": {"$regex": "BMW", "$options": "i"}}).to_list(length=100)
    print(json.dumps([{ "brand": v.get("brand"), "model": v.get("model"), "slug": v.get("slug") } for v in vehicles], indent=2))
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
