from fastapi import APIRouter, HTTPException, status, Depends, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from datetime import datetime
from typing import Optional, List

from models import (
    UserCreate, UserLogin, UserResponse, UserWithToken, UserInDB,
    UserUpdate, PasswordChange, ForgotPasswordRequest, ResetPasswordRequest
)
from auth import get_password_hash, verify_password, create_access_token
from dependencies import get_current_user_required

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Authentication"])


from database import get_database

def get_db():
    return get_database()


@router.post("/register", response_model=UserWithToken)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, response: Response):
    """Register a new user"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"=== REGISTER REQUEST ===")
    logger.info(f"Name: {user_data.name}")
    logger.info(f"Email: {user_data.email}")
    
    try:
        db = get_db()
        logger.info("Database connection obtained")
        
        # Check if email exists
        existing_user = await db.users.find_one({"email": user_data.email.lower()})
        logger.info(f"Existing user check completed: {existing_user is not None}")
        
        if existing_user:
            logger.warning(f"Email already registered: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user_in_db = UserInDB(
            name=user_data.name,
            email=user_data.email.lower(),
            password_hash=get_password_hash(user_data.password),
            isAdmin=False,  # Admin rights must be granted manually or through existing admin accounts
            favorites=[],
            createdAt=datetime.utcnow()
        )
        logger.info(f"User object created with ID: {user_in_db.id}")
        
        result = await db.users.insert_one(user_in_db.dict())
        logger.info(f"User inserted into database: {result.inserted_id}")
        
        # Generate token
        token = create_access_token({
            "sub": user_in_db.id,
            "email": user_in_db.email,
            "isAdmin": user_in_db.isAdmin
        })
        logger.info("Token generated successfully")
        
        # Set HttpOnly Cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,  # 7 days
            samesite="lax",
            secure=False  # Set to True in production with HTTPS
        )
        
        logger.info(f"=== REGISTRATION SUCCESSFUL for {user_data.email} ===")
        
        return UserWithToken(
            id=user_in_db.id,
            name=user_in_db.name,
            email=user_in_db.email,
            isAdmin=user_in_db.isAdmin,
            favorites=user_in_db.favorites,
            createdAt=user_in_db.createdAt,
            token=token
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"=== REGISTRATION ERROR ===")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=UserWithToken)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, response: Response):
    """Login with email and password"""
    db = get_db()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate token
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "isAdmin": user.get("isAdmin", False)
    })
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,  # 7 days
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return UserWithToken(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        isAdmin=user.get("isAdmin", False),
        favorites=user.get("favorites", []),
        createdAt=user["createdAt"],
        token=token
    )


@router.post("/logout")
async def logout(response: Response):
    """Logout and clear cookie"""
    response.delete_cookie(key="access_token")
    return {"message": "Başarıyla çıkış yapıldı"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_required)):
    """Get current user info"""
    db = get_db()
    
    user = await db.users.find_one({"id": current_user["id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        isAdmin=user.get("isAdmin", False),
        favorites=user.get("favorites", []),
        createdAt=user["createdAt"]
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user_required)
):
    """Update current user profile"""
    db = get_db()
    
    update_data = {}
    if user_data.name:
        update_data["name"] = user_data.name
    if user_data.email:
        # Check if email is taken
        existing = await db.users.find_one({"email": user_data.email.lower()})
        if existing and existing["id"] != current_user["id"]:
            raise HTTPException(status_code=400, detail="Email adresi kullanımda")
        update_data["email"] = user_data.email.lower()
        
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri yok")
        
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"id": current_user["id"]})
    return UserResponse(
        id=updated_user["id"],
        name=updated_user["name"],
        email=updated_user["email"],
        isAdmin=updated_user.get("isAdmin", False),
        favorites=updated_user.get("favorites", []),
        createdAt=updated_user["createdAt"]
    )


    return {"message": "Şifre başarıyla güncellendi"}


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest):
    """Initiate password reset process"""
    db = get_db()
    user = await db.users.find_one({"email": data.email.lower()})
    
    if not user:
        # Security Tip: Don't reveal if email exists, return same message
        return {"message": "E-posta kayıtlıysa sıfırlama linki gönderilecektir."}
    
    # In a real app, generate a unique token, store in DB with expiry, and send email
    # For now, we'll simulate the process
    reset_token = create_access_token({"sub": user["id"], "type": "reset"}, expires_delta=timedelta(hours=1))
    
    # Mock email sending
    import logging
    logging.info(f"PASSWORD RESET LINK for {user['email']}: /reset-password?token={reset_token}")
    
    return {"message": "Sıfırlama talimatları e-posta adresinize gönderildi."}


@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, data: ResetPasswordRequest):
    """Reset password using token"""
    db = get_db()
    
    payload = decode_token(data.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token")
    
    user_id = payload.get("sub")
    user = await db.users.find_one({"id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    new_hash = get_password_hash(data.new_password)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."}


@router.post("/verify-email")
@limiter.limit("3/minute")
async def verify_email(request: Request, token: str):
    """Verify user email using token"""
    db = get_db()
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "verification":
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş doğrulama tokenı")
    
    user_id = payload.get("sub")
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"isVerified": True}}
    )
    
    if result.modified_count == 0:
        # Check if already verified
        user = await db.users.find_one({"id": user_id})
        if user and user.get("isVerified"):
            return {"message": "E-posta zaten doğrulanmış."}
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    return {"message": "E-posta başarıyla doğrulandı."}


@router.post("/resend-verification")
@limiter.limit("2/minute")
async def resend_verification(request: Request, current_user: dict = Depends(get_current_user_required)):
    """Resend verification email"""
    db = get_db()
    user = await db.users.find_one({"id": current_user["id"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    if user.get("isVerified"):
        return {"message": "E-posta zaten doğrulanmış."}
    
    # Generate token
    verify_token = create_access_token({"sub": user["id"], "type": "verification"}, expires_delta=timedelta(days=1))
    
    # Mock email sending
    import logging
    logging.info(f"EMAIL VERIFICATION LINK for {user['email']}: /verify-email?token={verify_token}")
    
    return {"message": "Doğrulama e-postası tekrar gönderildi."}


# ============ Admin Routes ============

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user_required)
):
    """List all users (Admin only)"""
    if not current_user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
        
    db = get_db()
    cursor = db.users.find({}).sort("createdAt", -1).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    return [
        UserResponse(
            id=u["id"],
            name=u["name"],
            email=u["email"],
            isAdmin=u.get("isAdmin", False),
            favorites=u.get("favorites", []),
            createdAt=u["createdAt"]
        ) for u in users
    ]


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    isAdmin: bool,
    current_user: dict = Depends(get_current_user_required)
):
    """Update user admin status (Admin only)"""
    if not current_user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
        
    if user_id == current_user["id"]:
         raise HTTPException(status_code=400, detail="Kendi admin yetkinizi değiştiremezsiniz")
         
    db = get_db()
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"isAdmin": isAdmin}}
    )
    
    if result.modified_count == 0:
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
    return {"message": "Kullanıcı yetkisi güncellendi", "isAdmin": isAdmin}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user_required)
):
    """Delete a user (Admin only)"""
    if not current_user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
        
    if user_id == current_user["id"]:
         raise HTTPException(status_code=400, detail="Kendinizi silemezsiniz")
         
    db = get_db()
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    return {"message": "Kullanıcı silindi"}
