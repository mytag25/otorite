# Import config FIRST to ensure .env is loaded before any other imports
from config import GEMINI_API_KEY

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from contextlib import asynccontextmanager

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import db_instance, get_database

# Create limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("Starting up...")
    
    # Check Env
    if GEMINI_API_KEY:
        logging.info(f"GEMINI_API_KEY loaded: {GEMINI_API_KEY[:5]}... ({len(GEMINI_API_KEY)} chars)")
    else:
        logging.warning("GEMINI_API_KEY NOT FOUND in environment variables!")
    
    # Check JWT Secret Key Security
    from auth import SECRET_KEY
    if SECRET_KEY == "autorate-secret-key-change-in-production-2024":
        logging.warning("CRITICAL SECURITY WARNING: Using default JWT_SECRET_KEY. Please change it in .env for production!")
    
    # Connect DB
    db_instance.connect()
    db = db_instance.get_db()

    # Seed database
    from seed_data import seed_database
    await seed_database(db)
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.vehicles.create_index("id", unique=True)
    await db.vehicles.create_index([("brand", 1), ("model", 1), ("year", 1)])
    await db.vehicles.create_index("segment")
    await db.vehicles.create_index("scores.overall.score")
    
    # Garage collection indexes
    await db.garage.create_index("id", unique=True)
    await db.garage.create_index("userId")
    await db.garage.create_index([("isPublic", 1), ("createdAt", -1)])
    
    # Reviews collection indexes
    await db.reviews.create_index("id", unique=True)
    await db.reviews.create_index("vehicleId")
    await db.reviews.create_index([("vehicleId", 1), ("userId", 1)], unique=True)
    await db.reviews.create_index([("vehicleId", 1), ("createdAt", -1)])
    
    logging.info("Database indexes created")
    
    yield
    
    # Shutdown
    logging.info("Shutting down...")
    db_instance.close()


# Create the main app
app = FastAPI(
    title="AutoRate API",
    description="Professional Vehicle Rating Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Set rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Health check
@api_router.get("/")
async def root():
    return {"message": "AutoRate API is running", "status": "ok"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# Import and include route modules
from routes.auth_routes import router as auth_router
from routes.vehicle_routes import router as vehicle_router
from routes.favorites_routes import router as favorites_router
from routes.static_routes import router as static_router
from routes.blog_routes import router as blog_router
from routes.garage_routes import router as garage_router
from routes.ai_routes import router as ai_router
from routes.news_routes import router as news_router
from routes.settings_routes import router as settings_router
from routes.review_routes import router as review_router

api_router.include_router(auth_router)
api_router.include_router(vehicle_router)
api_router.include_router(favorites_router)
api_router.include_router(static_router)
api_router.include_router(blog_router)
api_router.include_router(garage_router)
api_router.include_router(ai_router)
api_router.include_router(news_router)
api_router.include_router(settings_router)
api_router.include_router(review_router)

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
# Security Tip: In production, change ["*"] to specific origins like ["https://autorate.com", "http://localhost:3000"]
import os
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
