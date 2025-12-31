import asyncio
import os
import sys
from unittest.mock import MagicMock
sys.modules['httpx'] = MagicMock()
sys.modules['fastapi'] = MagicMock()
sys.modules['motor'] = MagicMock()
sys.modules['motor.motor_asyncio'] = MagicMock()
sys.modules['pydantic'] = MagicMock()

sys.path.append(os.getcwd())
from routes.ai_routes import find_vehicle_in_db
from database import get_database

async def test_matching():
    db = get_database()
    
    test_cases = [
        ("BMW", "320i Sedan"),
        ("BMW", "3 Series G20"),
        ("Volkswagen", "Golf 1.5 eTSI"),
        ("Mercedes", "C200 d"),
        ("bmw", "320")
    ]
    
    print("--- STARTING MATCHING TESTS ---")
    for brand, model in test_cases:
        match = await find_vehicle_in_db(brand, model, db)
        if match:
            print(f"✅ MATCH FOUND: '{brand} {model}' -> '{match.get('brand')} {match.get('model')}' (Slug: {match.get('slug')})")
        else:
            print(f"❌ NO MATCH: '{brand} {model}'")
    print("--- TESTS COMPLETED ---")

if __name__ == "__main__":
    asyncio.run(test_matching())
