"""
Settings routes for site-wide configuration
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import json
import os

router = APIRouter(prefix="/settings", tags=["settings"])

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "settings.json")

class SettingsResponse(BaseModel):
    christmas_enabled: bool
    site_name: str
    updated_at: str

class SettingsUpdate(BaseModel):
    christmas_enabled: Optional[bool] = None
    site_name: Optional[str] = None

def load_settings() -> dict:
    """Load settings from JSON file"""
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading settings: {e}")
    
    # Default settings
    return {
        "christmas_enabled": False,
        "site_name": "OTORİTE",
        "updated_at": datetime.now().isoformat()
    }

def save_settings(settings: dict) -> bool:
    """Save settings to JSON file"""
    try:
        os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving settings: {e}")
        return False

@router.get("", response_model=SettingsResponse)
async def get_settings():
    """Get current site settings"""
    settings = load_settings()
    return SettingsResponse(**settings)

@router.put("", response_model=SettingsResponse)
async def update_settings(update: SettingsUpdate):
    """Update site settings (admin only)"""
    settings = load_settings()
    
    if update.christmas_enabled is not None:
        settings["christmas_enabled"] = update.christmas_enabled
    
    if update.site_name is not None:
        settings["site_name"] = update.site_name
    
    settings["updated_at"] = datetime.now().isoformat()
    
    if not save_settings(settings):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save settings"
        )
    
    return SettingsResponse(**settings)

@router.post("/toggle-christmas")
async def toggle_christmas():
    """Quick toggle for Christmas theme"""
    settings = load_settings()
    settings["christmas_enabled"] = not settings["christmas_enabled"]
    settings["updated_at"] = datetime.now().isoformat()
    
    if not save_settings(settings):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save settings"
        )
    
    return {"christmas_enabled": settings["christmas_enabled"]}
