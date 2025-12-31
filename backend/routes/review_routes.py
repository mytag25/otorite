from fastapi import APIRouter, HTTPException, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import Optional, List

from models import (
    VehicleReviewCreate,
    VehicleReviewUpdate,
    VehicleReviewResponse,
    VehicleReviewInDB,
    VehicleReviewStats,
    generate_id
)
from dependencies import get_db, get_current_user_required

router = APIRouter(prefix="/reviews", tags=["reviews"])


async def check_verified_owner(db: AsyncIOMotorDatabase, user_id: str, vehicle_id: str) -> bool:
    """Kullanıcının garajında bu araç modeli var mı kontrol et"""
    # Önce aracı bul
    vehicle = await db.vehicles.find_one({"$or": [{"id": vehicle_id}, {"slug": vehicle_id}]})
    if not vehicle:
        return False
    
    # Kullanıcının garajında benzer marka/model var mı kontrol et
    garage_vehicle = await db.garage.find_one({
        "userId": user_id,
        "brand": {"$regex": vehicle.get("brand", ""), "$options": "i"},
        "model": {"$regex": vehicle.get("model", ""), "$options": "i"}
    })
    
    return garage_vehicle is not None


async def get_user_name(db: AsyncIOMotorDatabase, user_id: str) -> str:
    """Kullanıcı adını getir"""
    user = await db.users.find_one({"id": user_id})
    return user.get("name", "Anonim") if user else "Anonim"


async def review_to_response(
    db: AsyncIOMotorDatabase, 
    review: dict
) -> VehicleReviewResponse:
    """Review veritabanı kaydını response modeline dönüştür"""
    user_name = await get_user_name(db, review["userId"])
    is_verified = await check_verified_owner(db, review["userId"], review["vehicleId"])
    
    return VehicleReviewResponse(
        id=review["id"],
        vehicleId=review["vehicleId"],
        userId=review["userId"],
        userName=user_name,
        rating=review["rating"],
        title=review["title"],
        content=review["content"],
        pros=review.get("pros", []),
        cons=review.get("cons", []),
        isVerifiedOwner=is_verified,
        likes=review.get("likes", []),
        likeCount=len(review.get("likes", [])),
        createdAt=review["createdAt"],
        updatedAt=review["updatedAt"]
    )


# ============ Get Reviews for a Vehicle ============
@router.get("/vehicle/{vehicle_id}", response_model=List[VehicleReviewResponse])
async def get_vehicle_reviews(
    vehicle_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("newest", regex="^(newest|oldest|highest|lowest|helpful)$"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Belirli bir aracın tüm yorumlarını getir"""
    # Önce aracı bul (id veya slug ile)
    vehicle = await db.vehicles.find_one({"$or": [{"id": vehicle_id}, {"slug": vehicle_id}]})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    actual_vehicle_id = vehicle["id"]
    
    # Sıralama
    sort_field = {"newest": ("createdAt", -1), "oldest": ("createdAt", 1), 
                  "highest": ("rating", -1), "lowest": ("rating", 1),
                  "helpful": ("likes", -1)}
    
    sort_key, sort_order = sort_field.get(sort, ("createdAt", -1))
    
    cursor = db.reviews.find({"vehicleId": actual_vehicle_id}).sort(sort_key, sort_order).skip(skip).limit(limit)
    reviews = await cursor.to_list(length=limit)
    
    result = []
    for review in reviews:
        response = await review_to_response(db, review)
        result.append(response)
    
    return result


# ============ Get Review Stats for a Vehicle ============
@router.get("/vehicle/{vehicle_id}/stats", response_model=VehicleReviewStats)
async def get_vehicle_review_stats(
    vehicle_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Araç için kullanıcı puanı istatistiklerini getir"""
    # Önce aracı bul
    vehicle = await db.vehicles.find_one({"$or": [{"id": vehicle_id}, {"slug": vehicle_id}]})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    actual_vehicle_id = vehicle["id"]
    
    # Tüm yorumları getir
    reviews = await db.reviews.find({"vehicleId": actual_vehicle_id}).to_list(length=1000)
    
    if not reviews:
        return VehicleReviewStats(
            vehicleId=actual_vehicle_id,
            averageRating=0.0,
            totalReviews=0,
            ratingDistribution={}
        )
    
    # İstatistikleri hesapla
    total = len(reviews)
    sum_rating = sum(r["rating"] for r in reviews)
    avg_rating = round(sum_rating / total, 1) if total > 0 else 0.0
    
    # Puan dağılımı
    distribution = {}
    for i in range(1, 11):
        count = len([r for r in reviews if r["rating"] == i])
        if count > 0:
            distribution[str(i)] = count
    
    return VehicleReviewStats(
        vehicleId=actual_vehicle_id,
        averageRating=avg_rating,
        totalReviews=total,
        ratingDistribution=distribution
    )


# ============ Create Review ============
@router.post("", response_model=VehicleReviewResponse)
async def create_review(
    review_data: VehicleReviewCreate,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Yeni yorum ekle (giriş yapmış kullanıcılar için)"""
    user_id = user_info["id"]
    
    # Aracı kontrol et
    vehicle = await db.vehicles.find_one({
        "$or": [{"id": review_data.vehicleId}, {"slug": review_data.vehicleId}]
    })
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    actual_vehicle_id = vehicle["id"]
    
    # Kullanıcı bu araca daha önce yorum yapmış mı kontrol et
    existing = await db.reviews.find_one({
        "vehicleId": actual_vehicle_id,
        "userId": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Bu araca zaten yorum yapmışsınız")
    
    # Yeni yorum oluştur
    now = datetime.utcnow()
    review = VehicleReviewInDB(
        vehicleId=actual_vehicle_id,
        userId=user_id,
        rating=review_data.rating,
        title=review_data.title,
        content=review_data.content,
        pros=review_data.pros,
        cons=review_data.cons,
        createdAt=now,
        updatedAt=now
    )
    
    await db.reviews.insert_one(review.dict())
    
    return await review_to_response(db, review.dict())


# ============ Update Review ============
@router.put("/{review_id}", response_model=VehicleReviewResponse)
async def update_review(
    review_id: str,
    review_data: VehicleReviewUpdate,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Yorumu güncelle (sadece sahip)"""
    user_id = user_info["id"]
    
    # Yorumu bul
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    # Yetki kontrolü
    if review["userId"] != user_id:
        raise HTTPException(status_code=403, detail="Bu yorumu düzenleme yetkiniz yok")
    
    # Güncellenecek alanları hazırla
    update_data = {"updatedAt": datetime.utcnow()}
    if review_data.rating is not None:
        update_data["rating"] = review_data.rating
    if review_data.title is not None:
        update_data["title"] = review_data.title
    if review_data.content is not None:
        update_data["content"] = review_data.content
    if review_data.pros is not None:
        update_data["pros"] = review_data.pros
    if review_data.cons is not None:
        update_data["cons"] = review_data.cons
    
    await db.reviews.update_one({"id": review_id}, {"$set": update_data})
    
    updated_review = await db.reviews.find_one({"id": review_id})
    return await review_to_response(db, updated_review)


# ============ Delete Review ============
@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Yorumu sil (sahip veya admin)"""
    user_id = user_info["id"]
    is_admin = user_info.get("isAdmin", False)
    
    # Yorumu bul
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    # Yetki kontrolü
    if review["userId"] != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok")
    
    await db.reviews.delete_one({"id": review_id})
    
    return {"message": "Yorum başarıyla silindi"}


# ============ Toggle Like ============
@router.post("/{review_id}/like")
async def toggle_like(
    review_id: str,
    user_info: dict = Depends(get_current_user_required),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Yorumu beğen/beğenmekten vazgeç"""
    user_id = user_info["id"]
    
    # Yorumu bul
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    likes = review.get("likes", [])
    
    if user_id in likes:
        # Beğeniyi kaldır
        likes.remove(user_id)
        action = "unliked"
    else:
        # Beğen
        likes.append(user_id)
        action = "liked"
    
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"likes": likes}}
    )
    
    return {"action": action, "likeCount": len(likes)}
