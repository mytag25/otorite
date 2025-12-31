from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
import json
from typing import Optional, List

from models import (
    GarageVehicleCreate,
    GarageVehicleUpdate,
    GarageVehicleResponse,
    GarageVehicleInDB,
    GarageComment,
    GarageListResponse,
    GarageListResponse,
    GarageActivity,
    GarageActivityType,
    GarageFollow,
    generate_id
)
from typing import Optional, List
from dependencies import get_db, get_current_user_required

router = APIRouter(prefix="/garage", tags=["garage"])


async def get_user_with_name(db: AsyncIOMotorDatabase, user_info: dict) -> dict:
    """Get full user info including name from database"""
    user = await db.users.find_one({"id": user_info["id"]})
    if user:
        return {
            "id": user["id"],
            "name": user.get("name", "Kullanıcı"),
            "isAdmin": user.get("isAdmin", False)
        }
    return {
        "id": user_info["id"],
        "name": "Kullanıcı",
        "isAdmin": user_info.get("isAdmin", False)
    }


def calculate_badges(vehicle: dict) -> List[str]:
    badges = []
    
    # Classic Car
    if vehicle.get("year", 2000) < 1995:
        badges.append("CLASSIC")
        
    # Project Car
    if len(vehicle.get("modifications", [])) >= 3:
        badges.append("PROJECT")
        
    # For Sale
    if vehicle.get("isForSale"):
        badges.append("FOR_SALE")
    
    return badges


def vehicle_to_response(vehicle: dict, user_name: str = "") -> GarageVehicleResponse:
    """Convert database vehicle to response model"""
    return GarageVehicleResponse(
        id=vehicle["id"],
        userId=vehicle["userId"],
        userName=user_name,
        brand=vehicle["brand"],
        model=vehicle["model"],
        year=vehicle["year"],
        color=vehicle.get("color", ""),
        image=vehicle.get("image", ""),
        images=vehicle.get("images", []),
        description=vehicle.get("description", ""),
        modifications=vehicle.get("modifications", []),
        isPublic=vehicle.get("isPublic", True),
        likes=vehicle.get("likes", []),
        likeCount=len(vehicle.get("likes", [])),
        comments=[GarageComment(**c) for c in vehicle.get("comments", [])],
        commentCount=len(vehicle.get("comments", [])),
        createdAt=vehicle["createdAt"],
        updatedAt=vehicle["updatedAt"],
        ownershipDate=vehicle.get("ownershipDate"),
        purchaseReason=vehicle.get("purchaseReason", ""),
        averageMonthlyExpense=vehicle.get("averageMonthlyExpense", 0),
        ownerRating=vehicle.get("ownerRating", 0),
        maintenanceHistory=vehicle.get("maintenanceHistory", []),
        isForSale=vehicle.get("isForSale", False),
        fuelType=vehicle.get("fuelType", ""),
        bodyType=vehicle.get("bodyType", ""),
        aiSummary=vehicle.get("aiSummary", ""),
        badges=calculate_badges(vehicle)
    )


# ============ Explore - Public Vehicles ============
@router.get("/explore", response_model=GarageListResponse)
async def explore_garage(
    brand: Optional[str] = None,
    year: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all public garage vehicles for exploration"""
    query = {"isPublic": True}
    
    if brand:
        query["brand"] = brand
    if year:
        query["year"] = year
    
    # Get total count
    total = await db.garage.count_documents(query)
    
    # Get vehicles with pagination, sorted by newest first
    cursor = db.garage.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    vehicles = await cursor.to_list(length=limit)
    
    # Get user names for each vehicle
    response_vehicles = []
    for vehicle in vehicles:
        user = await db.users.find_one({"id": vehicle["userId"]})
        user_name = user["name"] if user else "Bilinmeyen"
        response_vehicles.append(vehicle_to_response(vehicle, user_name))
    
    return GarageListResponse(vehicles=response_vehicles, total=total)


# ============ Get User's Garage (Public) ============
@router.get("/user/{user_id}", response_model=GarageListResponse)
async def get_user_garage(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a specific user's public garage"""
    # Get user info
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user_name = user["name"]
    
    # Get public vehicles only
    cursor = db.garage.find({"userId": user_id, "isPublic": True}).sort("createdAt", -1)
    vehicles = await cursor.to_list(length=100)
    
    response_vehicles = [vehicle_to_response(v, user_name) for v in vehicles]
    
    return GarageListResponse(vehicles=response_vehicles, total=len(response_vehicles))


# ============ Get My Garage ============
@router.get("/my", response_model=GarageListResponse)
async def get_my_garage(
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's garage (includes private vehicles)"""
    current_user = await get_user_with_name(db, user_info)
    
    cursor = db.garage.find({"userId": current_user["id"]}).sort("createdAt", -1)
    vehicles = await cursor.to_list(length=100)
    
    response_vehicles = [vehicle_to_response(v, current_user["name"]) for v in vehicles]
    
    return GarageListResponse(vehicles=response_vehicles, total=len(response_vehicles))


# ============ Get Single Vehicle ============
@router.get("/{vehicle_id}", response_model=GarageVehicleResponse)
async def get_garage_vehicle(
    vehicle_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a single garage vehicle by ID"""
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    # Get user name
    user = await db.users.find_one({"id": vehicle["userId"]})
    user_name = user["name"] if user else "Bilinmeyen"
    
    return vehicle_to_response(vehicle, user_name)


# ============ Add Vehicle to Garage ============
@router.post("", response_model=GarageVehicleResponse)
async def add_vehicle(
    vehicle_data: GarageVehicleCreate,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add a new vehicle to current user's garage"""
    current_user = await get_user_with_name(db, user_info)
    now = datetime.now(timezone.utc)
    
    vehicle_in_db = GarageVehicleInDB(
        userId=current_user["id"],
        brand=vehicle_data.brand,
        model=vehicle_data.model,
        year=vehicle_data.year,
        color=vehicle_data.color,
        image=vehicle_data.image,
        images=vehicle_data.images,
        description=vehicle_data.description,
        modifications=vehicle_data.modifications,
        isPublic=vehicle_data.isPublic,
        ownershipDate=vehicle_data.ownershipDate,
        purchaseReason=vehicle_data.purchaseReason,
        averageMonthlyExpense=vehicle_data.averageMonthlyExpense,
        ownerRating=vehicle_data.ownerRating,
        maintenanceHistory=vehicle_data.maintenanceHistory,
        isForSale=vehicle_data.isForSale,
        fuelType=vehicle_data.fuelType,
        bodyType=vehicle_data.bodyType,
        createdAt=now,
        updatedAt=now
    )
    
    await db.garage.insert_one(vehicle_in_db.model_dump())
    
    return vehicle_to_response(vehicle_in_db.model_dump(), current_user["name"])


# ============ Update Vehicle ============
@router.put("/{vehicle_id}", response_model=GarageVehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_data: GarageVehicleUpdate,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a vehicle in current user's garage"""
    current_user = await get_user_with_name(db, user_info)
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    if vehicle["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu aracı düzenleme yetkiniz yok")
    
    # Build update data
    update_data = {"updatedAt": datetime.utcnow()}
    for field, value in vehicle_data.model_dump(exclude_unset=True).items():
        if value is not None:
            update_data[field] = value
    
    await db.garage.update_one({"id": vehicle_id}, {"$set": update_data})
    
    updated_vehicle = await db.garage.find_one({"id": vehicle_id})
    return vehicle_to_response(updated_vehicle, current_user["name"])


# ============ Delete Vehicle ============
@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a vehicle from current user's garage"""
    current_user = await get_user_with_name(db, user_info)
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    if vehicle["userId"] != current_user["id"] and not current_user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Bu aracı silme yetkiniz yok")
    
    await db.garage.delete_one({"id": vehicle_id})
    
    return {"message": "Araç silindi"}


# ============ Like/Unlike Vehicle ============
@router.post("/{vehicle_id}/like")
async def toggle_like(
    vehicle_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Toggle like on a garage vehicle"""
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    user_id = user_info["id"]
    likes = vehicle.get("likes", [])
    
    if user_id in likes:
        # Unlike
        likes.remove(user_id)
        liked = False
    else:
        # Like
        likes.append(user_id)
        liked = True
    
    await db.garage.update_one(
        {"id": vehicle_id},
        {"$set": {"likes": likes}}
    )
    
    return {"liked": liked, "likeCount": len(likes)}


# ============ Add Comment ============
@router.post("/{vehicle_id}/comment")
async def add_comment(
    vehicle_id: str,
    content: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add a comment to a garage vehicle"""
    current_user = await get_user_with_name(db, user_info)
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Yorum içeriği boş olamaz")
    
    if len(content) > 500:
        raise HTTPException(status_code=400, detail="Yorum en fazla 500 karakter olabilir")
    
    comment = GarageComment(
        userId=current_user["id"],
        userName=current_user["name"],
        content=content.strip()
    )
    
    await db.garage.update_one(
        {"id": vehicle_id},
        {"$push": {"comments": comment.model_dump()}}
    )
    
    return comment


# ============ Delete Comment ============
@router.delete("/{vehicle_id}/comment/{comment_id}")
async def delete_comment(
    vehicle_id: str,
    comment_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a comment from a garage vehicle"""
    current_user = await get_user_with_name(db, user_info)
    vehicle = await db.garage.find_one({"id": vehicle_id})
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    comments = vehicle.get("comments", [])
    comment_to_delete = None
    
    for comment in comments:
        if comment["id"] == comment_id:
            comment_to_delete = comment
            break
    
    if not comment_to_delete:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    # Check permission: comment owner or vehicle owner or admin
    is_comment_owner = comment_to_delete["userId"] == current_user["id"]
    is_vehicle_owner = vehicle["userId"] == current_user["id"]
    is_admin = current_user.get("isAdmin", False)
    
    if not (is_comment_owner or is_vehicle_owner or is_admin):
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok")
    
    await db.garage.update_one(
        {"id": vehicle_id},
        {"$pull": {"comments": {"id": comment_id}}}
    )
    
    return {"message": "Yorum silindi"}


# ============ Activity & Feed Endpoints ============
@router.get("/feed", response_model=List[GarageActivity])
async def get_activity_feed(
    skip: int = 0,
    limit: int = 20,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get activity feed for the current user.
    Includes activities from followed users.
    """
    # 1. Get List of followed user IDs
    follows = await db.garage_follows.find({"followerId": user_info["id"]}).to_list(length=1000)
    following_ids = [f["followingId"] for f in follows]
    
    # 2. Add current user id to see own activities too
    following_ids.append(user_info["id"])
    
    # 3. Fetch activities
    cursor = db.garage_activities.find(
        {"userId": {"$in": following_ids}}
    ).sort("createdAt", -1).skip(skip).limit(limit)
    
    activities = await cursor.to_list(length=limit)
    return activities


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Follow a user"""
    if user_id == user_info["id"]:
         raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz")
         
    # Check if target user exists
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    # Check if already following
    existing = await db.garage_follows.find_one({
        "followerId": user_info["id"],
        "followingId": user_id
    })
    
    if existing:
        return {"message": "Zaten takip ediyorsunuz", "following": True}
        
    follow = GarageFollow(
        followerId=user_info["id"],
        followingId=user_id
    )
    
    await db.garage_follows.insert_one(follow.model_dump())
    return {"message": "Takip edildi", "following": True}


@router.post("/unfollow/{user_id}")
async def unfollow_user(
    user_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Unfollow a user"""
    result = await db.garage_follows.delete_one({
        "followerId": user_info["id"],
        "followingId": user_id
    })
    
    if result.deleted_count == 0:
        return {"message": "Takip etmiyordunuz", "following": False}
        
    return {"message": "Takip bırakıldı", "following": False}


@router.get("/user/{user_id}/followers")
async def get_user_followers(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get followers count and list (simplified)"""
    followers = await db.garage_follows.find({"followingId": user_id}).to_list(length=100)
    count = await db.garage_follows.count_documents({"followingId": user_id})
    return {"count": count, "followers": [f["followerId"] for f in followers]}


@router.get("/user/{user_id}/following")
async def get_user_following(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get following count and list (simplified)"""
    following = await db.garage_follows.find({"followerId": user_id}).to_list(length=100)
    count = await db.garage_follows.count_documents({"followerId": user_id})
    return {"count": count, "following": [f["followingId"] for f in following]}
