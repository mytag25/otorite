from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from models import VehicleResponse
from dependencies import get_current_user_required

router = APIRouter(prefix="/favorites", tags=["Favorites"])


from database import get_database

def get_db():
    return get_database()


@router.get("", response_model=List[VehicleResponse])
async def get_favorites(current_user: dict = Depends(get_current_user_required)):
    """Get user's favorite vehicles"""
    db = get_db()
    
    # Get user's favorites list
    user = await db.users.find_one({"id": current_user["id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    favorites_ids = user.get("favorites", [])
    if not favorites_ids:
        return []
    
    # Get favorite vehicles
    cursor = db.vehicles.find({"id": {"$in": favorites_ids}})
    vehicles = await cursor.to_list(length=100)
    
    return [VehicleResponse(**v) for v in vehicles]


@router.post("/{vehicle_id}", status_code=status.HTTP_200_OK)
async def add_favorite(
    vehicle_id: str,
    current_user: dict = Depends(get_current_user_required)
):
    """Add vehicle to favorites"""
    db = get_db()
    
    # Check if vehicle exists
    vehicle = await db.vehicles.find_one({"id": vehicle_id})
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Add to favorites (using $addToSet to avoid duplicates)
    result = await db.users.update_one(
        {"id": current_user["id"]},
        {"$addToSet": {"favorites": vehicle_id}}
    )
    
    if result.modified_count == 0:
        # Either user not found or already in favorites
        user = await db.users.find_one({"id": current_user["id"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    
    # Return updated favorites list
    user = await db.users.find_one({"id": current_user["id"]})
    return {"favorites": user.get("favorites", [])}


@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
async def remove_favorite(
    vehicle_id: str,
    current_user: dict = Depends(get_current_user_required)
):
    """Remove vehicle from favorites"""
    db = get_db()
    
    # Remove from favorites
    result = await db.users.update_one(
        {"id": current_user["id"]},
        {"$pull": {"favorites": vehicle_id}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return updated favorites list
    user = await db.users.find_one({"id": current_user["id"]})
    return {"favorites": user.get("favorites", [])}
