from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


def generate_id():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)


# ============ User Models ============
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    isAdmin: bool = False
    favorites: List[str] = []
    isVerified: bool = False
    createdAt: datetime


class UserWithToken(UserResponse):
    token: str


class UserInDB(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    email: str
    password_hash: str
    isAdmin: bool = False
    isVerified: bool = False
    favorites: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ============ Vehicle Score Models ============
class ScoreJustification(BaseModel):
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


class ScoreItem(BaseModel):
    score: float = Field(..., ge=1, le=10)
    justification: ScoreJustification = ScoreJustification()


class VehicleScores(BaseModel):
    reliability: Optional[ScoreItem] = None
    buildQuality: Optional[ScoreItem] = None
    performance: Optional[ScoreItem] = None
    drivingExperience: Optional[ScoreItem] = None
    technology: Optional[ScoreItem] = None
    safety: Optional[ScoreItem] = None
    costOfOwnership: Optional[ScoreItem] = None
    design: Optional[ScoreItem] = None
    valueForMoney: Optional[ScoreItem] = None
    overall: Optional[ScoreItem] = None


# ============ Vehicle Specs Models ============
class VehicleSpecs(BaseModel):
    engine: str = ""
    power: str = ""
    torque: str = ""
    acceleration: str = ""
    topSpeed: str = ""


# ============ Localized Text Models ============
class LocalizedTextList(BaseModel):
    tr: List[str] = []
    en: List[str] = []
    de: List[str] = []
    fr: List[str] = []
    es: List[str] = []
    it: List[str] = []
    nl: List[str] = []
    pt: List[str] = []
    pl: List[str] = []
    ar: List[str] = []


class LocalizedText(BaseModel):
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


# ============ Reliability Details Models ============
class ReliabilityDetails(BaseModel):
    engine: LocalizedText = LocalizedText()
    transmission: LocalizedText = LocalizedText()
    electronics: LocalizedText = LocalizedText()
    materials: LocalizedText = LocalizedText()
    editor_note: LocalizedText = LocalizedText()


# ============ Vehicle Models ============
class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int = Field(..., ge=2005, le=2025)
    segment: str
    image: str = ""
    images: List[str] = []
    specs: VehicleSpecs = VehicleSpecs()
    scores: VehicleScores = VehicleScores()
    strengths: LocalizedTextList = LocalizedTextList()
    weaknesses: LocalizedTextList = LocalizedTextList()
    bestFor: LocalizedText = LocalizedText()
    # Reliability and long-term quality
    reliability_details: ReliabilityDetails = ReliabilityDetails()
    # Editorial content - Top Gear style
    editorial: Optional[Dict[str, Any]] = None
    rivals: List[str] = []  # Vehicle IDs of rival cars
    slug: str = ""


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    segment: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    specs: Optional[VehicleSpecs] = None
    scores: Optional[VehicleScores] = None
    strengths: Optional[LocalizedTextList] = None
    weaknesses: Optional[LocalizedTextList] = None
    bestFor: Optional[LocalizedText] = None
    reliability_details: Optional[ReliabilityDetails] = None
    editorial: Optional[Dict[str, Any]] = None
    rivals: Optional[List[str]] = None
    slug: Optional[str] = None


class VehicleResponse(BaseModel):
    id: str
    brand: str
    model: str
    year: int
    segment: str
    image: str = ""
    images: List[str] = []
    specs: VehicleSpecs = VehicleSpecs()
    scores: VehicleScores = VehicleScores()
    strengths: LocalizedTextList = LocalizedTextList()
    weaknesses: LocalizedTextList = LocalizedTextList()
    bestFor: LocalizedText = LocalizedText()
    reliability_details: ReliabilityDetails = ReliabilityDetails()
    editorial: Optional[Dict[str, Any]] = None
    rivals: List[str] = []
    slug: str = ""
    createdAt: datetime
    updatedAt: datetime


class VehicleInDB(BaseModel):
    id: str = Field(default_factory=generate_id)
    brand: str
    model: str
    year: int
    segment: str
    image: str = ""
    images: List[str] = []
    specs: VehicleSpecs = VehicleSpecs()
    scores: VehicleScores = VehicleScores()
    strengths: LocalizedTextList = LocalizedTextList()
    weaknesses: LocalizedTextList = LocalizedTextList()
    bestFor: LocalizedText = LocalizedText()
    reliability_details: ReliabilityDetails = ReliabilityDetails()
    editorial: Optional[Dict[str, Any]] = None
    rivals: List[str] = []
    slug: str = ""
    createdAt: datetime = Field(default_factory=utc_now)
    updatedAt: datetime = Field(default_factory=utc_now)


class VehicleListResponse(BaseModel):
    vehicles: List[VehicleResponse]
    total: int


# ============ Brand Models ============
class BrandResponse(BaseModel):
    id: str
    name: str
    country: str
    models: List[str]


# ============ Segment Models ============
class SegmentName(BaseModel):
    tr: str
    en: str
    de: str = ""
    fr: str = ""
    es: str = ""
    it: str = ""
    nl: str = ""
    pt: str = ""
    pl: str = ""
    ar: str = ""


class SegmentResponse(BaseModel):
    id: str
    name: SegmentName


# ============ Garage Models ============
class GarageComment(BaseModel):
    """Garaj aracına yapılan yorum"""
    id: str = Field(default_factory=generate_id)
    userId: str
    userName: str
    content: str = Field(..., min_length=1, max_length=500)
    createdAt: datetime = Field(default_factory=utc_now)


class GarageVehicleCreate(BaseModel):
    """Kullanıcının garajına araç ekleme"""
    brand: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    year: int = Field(..., ge=1950, le=2025)
    color: str = ""
    image: str = ""  # Ana görsel URL
    images: List[str] = []  # Ek görseller
    description: str = Field(default="", max_length=1000)
    modifications: List[str] = []  # Modifikasyonlar
    isPublic: bool = True  # Keşfet'te görünsün mü
    ownershipDate: Optional[datetime] = None  # Sahiplik başlangıç tarihi
    purchaseReason: str = ""  # "Bu aracı neden aldım?"
    averageMonthlyExpense: int = 0  # Aylık ortalama masraf
    ownerRating: float = 0  # Sahibinin verdiği puan (1-10)
    maintenanceHistory: List[str] = []  # Bakım geçmişi
    isForSale: bool = False  # Satışa yakınlık
    fuelType: str = ""  # Yakıt tipi
    bodyType: str = ""  # Kasa tipi


class GarageVehicleUpdate(BaseModel):
    """Garaj aracı güncelleme"""
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    modifications: Optional[List[str]] = None
    isPublic: Optional[bool] = None
    ownershipDate: Optional[datetime] = None
    purchaseReason: Optional[str] = None
    averageMonthlyExpense: Optional[int] = None
    ownerRating: Optional[float] = None
    maintenanceHistory: Optional[List[str]] = None
    isForSale: Optional[bool] = None
    fuelType: Optional[str] = None
    bodyType: Optional[str] = None
    aiSummary: Optional[str] = None


class GarageVehicleResponse(BaseModel):
    """Garaj aracı response"""
    id: str
    userId: str
    userName: str = ""
    brand: str
    model: str
    year: int
    color: str = ""
    image: str = ""
    images: List[str] = []
    description: str = ""
    modifications: List[str] = []
    isPublic: bool = True
    ownershipDate: Optional[datetime] = None
    purchaseReason: str = ""
    averageMonthlyExpense: int = 0
    ownerRating: float = 0
    maintenanceHistory: List[str] = []
    isForSale: bool = False
    fuelType: str = ""
    bodyType: str = ""
    aiSummary: str = ""
    likes: List[str] = []
    likeCount: int = 0
    comments: List[GarageComment] = []
    commentCount: int = 0
    badges: List[str] = []
    createdAt: datetime
    updatedAt: datetime


class GarageVehicleInDB(BaseModel):
    """Garaj aracı veritabanı modeli"""
    id: str = Field(default_factory=generate_id)
    userId: str  # Araç sahibi
    brand: str
    model: str
    year: int
    color: str = ""
    image: str = ""
    images: List[str] = []
    description: str = ""
    modifications: List[str] = []
    isPublic: bool = True
    ownershipDate: Optional[datetime] = None
    purchaseReason: str = ""
    averageMonthlyExpense: int = 0
    ownerRating: float = 0
    maintenanceHistory: List[str] = []
    isForSale: bool = False
    fuelType: str = ""
    bodyType: str = ""
    aiSummary: str = ""
    likes: List[str] = []  # Beğenen kullanıcı ID'leri
    comments: List[Dict[str, Any]] = []
    createdAt: datetime = Field(default_factory=utc_now)
    updatedAt: datetime = Field(default_factory=utc_now)


class GarageListResponse(BaseModel):
    """Garaj araçları liste response"""
    vehicles: List[GarageVehicleResponse]
    total: int


# ============ Activity & Social Models ============
class GarageActivityType(str, Enum):
    MAINTENANCE = "MAINTENANCE"
    MODIFICATION = "MODIFICATION"
    PHOTO_ADDED = "PHOTO_ADDED"
    STATUS_UPDATE = "STATUS_UPDATE"
    FOR_SALE = "FOR_SALE"
    GENERAL = "GENERAL"


class GarageActivity(BaseModel):
    """Garaj aktivitesi"""
    id: str = Field(default_factory=generate_id)
    userId: str
    userName: str = ""
    userAvatar: str = ""
    
    # Vehicle info snapshot
    vehicleId: str
    vehicleBrand: str
    vehicleModel: str
    vehicleImage: str
    
    type: GarageActivityType
    title: str
    description: str = ""
    data: Dict[str, Any] = {}
    
    likes: List[str] = [] # User IDs
    
    createdAt: datetime = Field(default_factory=utc_now)


class GarageFollow(BaseModel):
    """Kullanıcı takip modeli"""
    id: str = Field(default_factory=generate_id)
    followerId: str
    followingId: str
    createdAt: datetime = Field(default_factory=utc_now)


# ============ News Models ============
class NewsItem(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str = Field(..., min_length=5, max_length=200)
    summary: str = Field(..., min_length=10, max_length=500)
    content: str = Field(..., min_length=50) # Tiptap HTML content
    image: str = "" # Cover image URL
    author: str = "AutoRate Editor"
    tags: List[str] = []
    viewCount: int = 0
    isPublished: bool = True
    publishedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class NewsCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    summary: str = Field(..., min_length=10, max_length=500)
    content: str = Field(..., min_length=50)
    image: str = ""
    tags: List[str] = []
    isPublished: bool = True

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None

class NewsListResponse(BaseModel):
    news: List[NewsItem]
    total: int


# ============ Vehicle Review Models ============
class VehicleReviewCreate(BaseModel):
    """Kullanıcı araç incelemesi oluşturma"""
    vehicleId: str
    rating: int = Field(..., ge=1, le=10)  # 1-10 arası puan
    title: str = Field(..., min_length=3, max_length=100)
    content: str = Field(..., min_length=10, max_length=2000)
    pros: List[str] = []  # Artılar
    cons: List[str] = []  # Eksiler


class VehicleReviewUpdate(BaseModel):
    """Kullanıcı araç incelemesi güncelleme"""
    rating: Optional[int] = Field(None, ge=1, le=10)
    title: Optional[str] = None
    content: Optional[str] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None


class VehicleReviewResponse(BaseModel):
    """Kullanıcı araç incelemesi response"""
    id: str
    vehicleId: str
    userId: str
    userName: str
    rating: int
    title: str
    content: str
    pros: List[str] = []
    cons: List[str] = []
    isVerifiedOwner: bool = False  # Garajında bu araç var mı?
    likes: List[str] = []
    likeCount: int = 0
    createdAt: datetime
    updatedAt: datetime


class VehicleReviewInDB(BaseModel):
    """Kullanıcı araç incelemesi veritabanı modeli"""
    id: str = Field(default_factory=generate_id)
    vehicleId: str
    userId: str
    rating: int
    title: str
    content: str
    pros: List[str] = []
    cons: List[str] = []
    likes: List[str] = []  # Beğenen kullanıcı ID'leri
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class VehicleReviewStats(BaseModel):
    """Araç için kullanıcı puanı istatistikleri"""
    vehicleId: str
    averageRating: float = 0.0
    totalReviews: int = 0
    ratingDistribution: Dict[str, int] = {}  # {"10": 5, "9": 3, ...}

