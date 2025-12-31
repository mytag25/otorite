from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import Optional, List
import re

from models import (
    VehicleCreate, VehicleUpdate, VehicleResponse, VehicleInDB, VehicleListResponse
)
from dependencies import get_admin_user, get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


from database import get_database

def get_db():
    return get_database()


def slugify(text: str) -> str:
    # Basic slugify
    text = text.lower()
    # Replace non-alphanumeric with hyphen
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Remove leading/trailing hyphens
    return text.strip('-')


async def get_unique_slug(db, brand: str, model: str, year: int, current_id: str = None) -> str:
    base_slug = slugify(f"{brand}-{model}-{year}")
    slug = base_slug
    counter = 1
    
    while True:
        query = {"slug": slug}
        if current_id:
            query["id"] = {"$ne": current_id}
            
        existing = await db.vehicles.find_one(query)
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


@router.get("", response_model=VehicleListResponse)
async def list_vehicles(
    brand: Optional[str] = Query(None, description="Filter by brand ID"),
    segment: Optional[str] = Query(None, description="Filter by segment ID"),
    year: Optional[int] = Query(None, description="Filter by year"),
    minScore: Optional[float] = Query(None, ge=0, le=10, description="Minimum overall score"),
    search: Optional[str] = Query(None, description="Search in brand/model"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """List vehicles with optional filters"""
    db = get_db()
    
    # Build query
    query = {}
    
    if brand:
        query["brand"] = brand
    
    if segment:
        query["segment"] = segment
    
    if year:
        query["year"] = year
    
    if minScore is not None:
        query["scores.overall.score"] = {"$gte": minScore}
    
    if search:
        # Search in model field (brand is ID, we search model name)
        query["$or"] = [
            {"model": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.vehicles.count_documents(query)
    
    # Get vehicles
    cursor = db.vehicles.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    vehicles = await cursor.to_list(length=limit)
    
    return VehicleListResponse(
        vehicles=[VehicleResponse(**v) for v in vehicles],
        total=total
    )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str):
    """Get a single vehicle by ID or slug"""
    db = get_db()
    
    vehicle = await db.vehicles.find_one({
        "$or": [
            {"id": vehicle_id},
            {"slug": vehicle_id}
        ]
    })
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    return VehicleResponse(**vehicle)


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create a new vehicle (Admin only)"""
    db = get_db()
    
    # Check if vehicle already exists
    existing = await db.vehicles.find_one({
        "brand": vehicle_data.brand,
        "model": vehicle_data.model,
        "year": vehicle_data.year
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle already exists"
        )
    
    # Create vehicle
    now = datetime.utcnow()
    
    # Generate slug if not provided
    slug = vehicle_data.slug
    if not slug:
        slug = await get_unique_slug(db, vehicle_data.brand, vehicle_data.model, vehicle_data.year)
    
    vehicle_dict = vehicle_data.dict()
    vehicle_dict["slug"] = slug
    
    vehicle_in_db = VehicleInDB(
        **vehicle_dict,
        createdAt=now,
        updatedAt=now
    )
    
    await db.vehicles.insert_one(vehicle_in_db.dict())
    
    return VehicleResponse(**vehicle_in_db.dict())


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update a vehicle (Admin only)"""
    db = get_db()
    
    # Check if vehicle exists
    existing = await db.vehicles.find_one({"id": vehicle_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Build update dict (only non-None fields)
    update_data = {k: v for k, v in vehicle_data.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Handle slug updates or generation
    if "brand" in update_data or "model" in update_data or "year" in update_data:
        if not update_data.get("slug"):
            # Regenerate slug if brand/model/year changed and slug not provided
            brand = update_data.get("brand", existing["brand"])
            model = update_data.get("model", existing["model"])
            year = update_data.get("year", existing["year"])
            update_data["slug"] = await get_unique_slug(db, brand, model, year, current_id=vehicle_id)
    
    # Update
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": update_data}
    )
    
    # Return updated vehicle
    updated = await db.vehicles.find_one({"id": vehicle_id})
    return VehicleResponse(**updated)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Delete a vehicle (Admin only)"""
    db = get_db()
    
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    return None
