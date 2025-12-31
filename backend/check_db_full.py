
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.otorite
    # Get all brands to see what's available
    brands = await db.vehicles.distinct("brand")
    print(f"Brands in DB: {brands}")
    
    # Get all vehicles to see the models
    vehicles = await db.vehicles.find({}).to_list(length=1000)
    print(f"Total vehicles: {len(vehicles)}")
    
    # Search for Tesla specifically
    tesla = await db.vehicles.find({"brand": {"$regex": "Tesla", "$options": "i"}}).to_list(length=100)
    print("Tesla Vehicles:")
    print(json.dumps([{ "brand": v.get("brand"), "model": v.get("model"), "slug": v.get("slug") } for v in tesla], indent=2))
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
