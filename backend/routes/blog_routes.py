from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid

from dependencies import get_admin_user, get_current_user

router = APIRouter(prefix="/blog", tags=["Blog"])


from database import get_database

def get_db():
    return get_database()


# Blog Models
class LocalizedContent(BaseModel):
    tr: str = ""
    en: str = ""
    de: str = ""
    fr: str = ""
    es: str = ""
    it: str = ""
    nl: str = ""
    pt: str = ""
    pl: str = ""
    ar: str = ""


class BlogPostCreate(BaseModel):
    title: LocalizedContent
    summary: LocalizedContent
    content: LocalizedContent
    coverImage: str = ""
    images: List[str] = []
    category: str = "review"  # review, news, comparison, guide
    tags: List[str] = []
    relatedVehicles: List[str] = []  # vehicle IDs
    featured: bool = False
    published: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[LocalizedContent] = None
    summary: Optional[LocalizedContent] = None
    content: Optional[LocalizedContent] = None
    coverImage: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    relatedVehicles: Optional[List[str]] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None


class BlogPostResponse(BaseModel):
    id: str
    title: LocalizedContent
    summary: LocalizedContent
    content: LocalizedContent
    coverImage: str = ""
    images: List[str] = []
    category: str
    tags: List[str] = []
    relatedVehicles: List[str] = []
    featured: bool = False
    published: bool = False
    authorId: str
    authorName: str
    views: int = 0
    createdAt: datetime
    updatedAt: datetime


class BlogListResponse(BaseModel):
    posts: List[BlogPostResponse]
    total: int


@router.get("", response_model=BlogListResponse)
async def list_blog_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    featured: Optional[bool] = None,
    published: str = Query("true", description="Filter by published status: 'true', 'false', or 'all'"),
    skip: int = 0,
    limit: int = 20
):
    """List blog posts with filters"""
    db = get_db()
    
    query = {}
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if featured is not None:
        query["featured"] = featured
        
    if published == "true":
        query["published"] = True
    elif published == "false":
        query["published"] = False
    # If published == "all", we don't filter
    
    total = await db.blog_posts.count_documents(query)
    cursor = db.blog_posts.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    return BlogListResponse(
        posts=[BlogPostResponse(**p) for p in posts],
        total=total
    )


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(post_id: str):
    """Get a single blog post"""
    db = get_db()
    
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment views
    await db.blog_posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    
    return BlogPostResponse(**post)


@router.post("", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    post_data: BlogPostCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create a new blog post (Admin only)"""
    db = get_db()
    
    # Get author info
    user = await db.users.find_one({"id": admin["id"]})
    
    now = datetime.utcnow()
    post = {
        "id": str(uuid.uuid4()),
        **post_data.dict(),
        "authorId": admin["id"],
        "authorName": user["name"] if user else "Admin",
        "views": 0,
        "createdAt": now,
        "updatedAt": now
    }
    
    await db.blog_posts.insert_one(post)
    return BlogPostResponse(**post)


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    post_data: BlogPostUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update a blog post (Admin only)"""
    db = get_db()
    
    existing = await db.blog_posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {k: v for k, v in post_data.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated = await db.blog_posts.find_one({"id": post_id})
    return BlogPostResponse(**updated)


@router.delete("/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Delete a blog post (Admin only)"""
    db = get_db()
    
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return None
