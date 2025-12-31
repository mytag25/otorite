from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from pydantic import BaseModel
import random
import asyncio
import json
import os
from pathlib import Path
import httpx
import base64
import re
import difflib


from dependencies import get_db
from models import VehicleResponse

router = APIRouter(prefix="/ai", tags=["ai"])

# DEBUG: Print routes when module is loaded
import sys
print("Loading ai_routes.py (REST Mode)...", file=sys.stderr)

# Direct .env file reader - bypasses dotenv library issues
def _get_api_key_from_env():
    """Read GEMINI_API_KEY directly from .env file"""
    possible_paths = [
        Path("backend/.env"),
        Path(".env"),
        Path("../.env"),
        Path("C:/Users/PC/Desktop/yedek/backend/.env")
    ]
    
    for env_path in possible_paths:
        if env_path.exists():
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for line in content.splitlines():
                        line = line.strip()
                        if line.startswith('GEMINI_API_KEY='):
                            value = line.split('=', 1)[1].strip()
                            if (value.startswith('"') and value.endswith('"')) or \
                               (value.startswith("'") and value.endswith("'")):
                                value = value[1:-1]
                            return value
            except Exception:
                pass
    return None

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def get_gemini_api_key():
    return _get_api_key_from_env()

async def find_vehicle_in_db(brand: str, model: str, db: AsyncIOMotorDatabase):
    """
    Robustly find a vehicle in the database using multiple matching strategies.
    Uses fuzzy logic and filters generic car terms to avoid false positives.
    """
    brand_clean = brand.lower().strip()
    model_clean = model.lower().strip()
    
    # 1. Direct Slug Match (Fastest & most accurate)
    target_slug = slugify(f"{brand} {model}")
    matched = await db.vehicles.find_one({"slug": target_slug})
    if matched: return matched
    
    # Helper to clean model of generic terms for better matching
    GENERIC_TERMS = {"model", "series", "class", "generation", "long", "range", "performance", "awd", "rwd", "fwd", "phev", "hybrid", "electric", "ev"}
    def get_core_model_tokens(m_str):
        # Split by non-alphanumeric to handle "C-Class", "E-200" etc.
        raw_tokens = re.split(r'[^a-zA-Z0-9]+', m_str.lower())
        tokens = [t for t in raw_tokens if t and t not in GENERIC_TERMS]
        return tokens

    core_tokens = get_core_model_tokens(model_clean)
    
    # 2. Advanced Similarity Search
    # Fetch all candidates from the same brand
    brand_regex = f"^{brand_clean.split('-')[0].split(' ')[0]}$"
    cursor = db.vehicles.find({"brand": {"$regex": brand_regex, "$options": "i"}})
    candidates = await cursor.to_list(length=100)
    
    if not candidates:
        return None

    best_v = None
    max_score = 0.0
    
    for v in candidates:
        db_model = v.get("model", "").lower()
        db_tokens = get_core_model_tokens(db_model)
        
        # Strategy A: Similarity Ratio (difflib)
        score = difflib.SequenceMatcher(None, model_clean, db_model).ratio()
        
        # Strategy B: Hard Token Match
        token_match_count = 0
        for ct in core_tokens:
            # Check if token matches exactly or is a significant substring (e.g. "3" in "320i")
            if any(ct == dt or (len(ct) == 1 and dt.startswith(ct)) or (len(dt) == 1 and ct.startswith(dt)) for dt in db_tokens):
                token_match_count += 1
        
        # Special Boost for BMW/Mercedes/Audi Series/Class Logic
        # e.g. "320i" matches "3 Series" because they start with "3" and it's a "Series"
        series_boost = 0
        if (("series" in db_model or "class" in db_model) and 
            model_clean and db_model and model_clean[0] == db_model[0]):
            series_boost = 0.5
            
        token_score = token_match_count / max(len(core_tokens), 1)
        
        # Final combined score
        final_score = (score * 0.3) + (token_score * 0.4) + (series_boost * 0.3)
        
        if final_score > max_score:
            max_score = final_score
            best_v = v
            
    # Threshold check
    if max_score >= 0.55:
        return best_v
                
    return None

# --- UTILS ---
def clean_json_string(text: str) -> str:
    """
    Cleans a string to extract valid JSON.
    Handles Markdown blocks, unescaped characters, and extracts the JSON object.
    """
    # Remove Markdown code blocks
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    
    text = text.strip()
    
    # Try to find the first '{' and last '}' to extract the logic JSON object
    # This helps if there is extra text around the JSON
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx : end_idx + 1]
        
    return text

# --- GEMINI REST CLIENT ---
# Using stable Gemini 1.5 Flash for high reliability and speed
TARGET_MODEL = "models/gemini-2.5-flash" 

async def call_gemini_rest(contents: list, api_key: str, system_instruction: str = None) -> str:
    """
    Direct REST call to Gemini API using httpx.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/{TARGET_MODEL}:generateContent?key={api_key}"
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 8192,
            "topP": 0.8,
            "topK": 40
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]
    }

    if system_instruction:
        payload["system_instruction"] = {
            "parts": [{"text": system_instruction}]
        }

    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Calling Gemini REST: {url.split('?')[0]}...")
            response = await client.post(
                url, 
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"ERROR: Gemini API returned {response.status_code}")
                print(f"Response Body: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API Error: {response.text}")

            data = response.json()
            # Extract text
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                finish_reason = candidate.get("finishReason")
                if finish_reason and finish_reason != "STOP":
                    print(f"WARNING: Gemini Finish Reason: {finish_reason}")
                
                parts = candidate["content"]["parts"]
                text = "".join([part.get("text", "") for part in parts])
                return text
            else:
                 print(f"ERROR: No candidates in response: {data}")
                 return ""

        except Exception as e:
            print(f"EXCEPTION in call_gemini_rest: {e}")
            import traceback
            traceback.print_exc()
            raise e


# Helper function
def vehicle_to_response(vehicle: dict) -> VehicleResponse:
    return VehicleResponse(**vehicle)

class AIRecommendationRequest(BaseModel):
    query: str

class AIRecommendationResponse(BaseModel):
    vehicles: List[VehicleResponse]
    explanation: str

class AICompareRequest(BaseModel):
    vehicleIds: List[str]


@router.post("/recommend", response_model=AIRecommendationResponse)
async def recommend_vehicles(
    request: AIRecommendationRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    api_key = get_gemini_api_key()
    if not api_key:
        return await heuristic_recommend(request.query, db)

    try:
        # 1. Fetch simplified vehicle list
        cursor = db.vehicles.find({})
        vehicles = await cursor.to_list(length=50) # Limit context
        
        vehicle_context = "\n".join([
            f"- {v.get('brand')} {v.get('model')} ({v.get('year')}): {v.get('price')} TL, {v.get('engine', {}).get('fuel')}, {v.get('engine', {}).get('transmission')}" 
            for v in vehicles
        ])

        system_instruction = "Sen OTORITE AI, uzman bir otomobil danışmanısın. Verilen araç listesinden kullanıcının isteğine en uygun 3 aracı seç ve JSON formatında döndür."
        
        prompt = f"""
        User Request: "{request.query}"
        
        Available Vehicles:
        {vehicle_context}
        
        Task: Recommend top 3 vehicles.
        Return strictly JSON matching this structure:
        {{
            "recommendations": [
                {{ "brand": "Brand", "model": "Model", "year": 2023, "reason": "Why..." }}
            ],
            "general_advice": "Short advice..."
        }}
        """
        
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        response_text = await call_gemini_rest(contents, api_key, system_instruction)
        
        # Parse JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
             response_text = response_text.split("```")[1].split("```")[0]
             
        data = json.loads(response_text)
        
        # Fetch full objects
        recommended_vehicles = []
        for rec in data.get("recommendations", []):
            vehicle = await db.vehicles.find_one({
                "brand": rec["brand"], 
                "model": rec["model"]
            })
            if vehicle:
                recommended_vehicles.append(vehicle)
                
        if not recommended_vehicles:
             return await heuristic_recommend(request.query, db)

        return AIRecommendationResponse(
            vehicles=[vehicle_to_response(v) for v in recommended_vehicles],
            explanation=data.get("general_advice", "İşte önerilerim.")
        )

    except Exception as e:
        print(f"Recommend Error: {e}")
        return await heuristic_recommend(request.query, db)


# === IDENTIFY (VISION) ===
# Note: Identify logic is heavy, keeping simplified for now or need to send image bytes
@router.post("/identify")
async def identify_vehicle(file: UploadFile = File(...), db: AsyncIOMotorDatabase = Depends(get_db)):
    # ... legacy implementation mostly, let's focus on chat/snap ...
    return await snap_identify(file)


# === CHAT ===

class AIChatRequest(BaseModel):
    message: str
    garageContext: Optional[List[dict]] = None

class AIChatResponse(BaseModel):
    response: str
    recommendations: Optional[List[dict]] = None

@router.post("/chat", response_model=AIChatResponse)
async def chat_consultant(
    request: AIChatRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    print(f"--- CHAT REQUEST (REST): {request.message} ---")
    
    api_key = get_gemini_api_key()
    if not api_key:
        return AIChatResponse(response="Sistem Hatası: API Anahtarı bulunamadı.")

    try:
        if request.garageContext:
            print(f"DEBUG: Using Garage Context with {len(request.garageContext)} vehicles")
            # Format user's garage
            user_garage_str = "\n".join([
                f"- {v.get('brand')} {v.get('model')} ({v.get('year')}) - {v.get('fuelType', '')}" 
                for v in request.garageContext
            ])
            garage_instruction = f"""
========================
KULLANICININ GARAJI (Sorular bu araçlarla ilgili olabilir)
========================
{user_garage_str}

Eğer kullanıcı "Arabam", "Aracım" veya spesifik bir modelden (örn: "BMW'm") bahsederse, yukarıdaki listedeki ilgili aracı baz al.
"""
        else:
            garage_instruction = ""

        # Fetch catalog for general knowledge
        cursor = db.vehicles.find({})
        db_vehicles = await cursor.to_list(length=50) # Reduced for performance
        vehicle_catalog = "\n".join([
            f"- {v.get('brand')} {v.get('model')} (Slug: {v.get('slug')})"
            for v in db_vehicles
        ])

        system_instruction = f"""
SEN BİR CHAT BOT DEĞİLSİN.
SEN OTORITE SİTESİNİN DİJİTAL OTOMOBİL DANIŞMANISIN.
{garage_instruction}

KISMİ, EKSİK, YARIM CEVAP VEREMEZSİN.
TEK MODEL YAZIP DURAMAZSIN.
MADDEYİ YARIDA KESERSEN BU BİR HATADIR.

========================
VERİTABANIMIZDAKİ ARAÇLAR (Referans)
========================
{vehicle_catalog}

========================
GENEL KURAL
========================
KULLANICI BİR ARAÇ TÜRÜ, İHTİYAÇ YA DA PROFİL SÖYLEDİĞİNDE:
- EN AZ 3 ARAÇ ÖNERMEK ZORUNDASIN
- HER ARAÇ İÇİN: Kısa neden, Artı/eksi, Kimler için uygun, OTORITE puanı, İnceleme durumu sunmalısın.
TEK SATIRLIK CEVAP YASAK. SADECE MODEL ADI YAZMAK YASAK.

========================
VERİTABANI ÖNCELİĞİ (existsInDB)
========================
Eğer önerdiğin araç yukarıdaki veritabanı listesinde VARSA:
→ ŞUNU YAZ: “Bu araç OTORITE’de incelenmiştir”
→ PUANI DB’DEN GÖSTER
→ LİNK VER: /vehicles/{{slug}}

Eğer veritabanında YOKSA:
→ “Henüz editör incelemesi yok” DE ve TAHMİNİ puan ver.

========================
CEVAP ŞABLONU (ZORUNLU)
========================
Başlık: “... Önerileri”

1️⃣ Araç Adı
- Neden öneriliyor:
- Kimler için uygun:
- Artıları:
- Eksileri:
- OTORITE Puanı: X/10
- İnceleme: [İncelemeye Git] (Link: /vehicles/slug)

(Bu yapıyı en az 3 araç için tekrarla)

========================
DAVRANIŞ KURALI
========================
EĞER CEVAP çok kısa olduysa veya linkler eksikse BU BİR HATADIR.
Görevin KULLANICIYI DOĞRU ARACIN İNCELEMESİNE GÖTÜRMEK yani bir “yönlendirme makinesi” olmaktır.
Türkçe konuş.
"""
        
        contents = [{
            "role": "user", 
            "parts": [{"text": request.message}]
        }]
        
        # --- ROBUST FIX: Multi-Pass Completion Loop ---
        response_text = await call_gemini_rest(contents, api_key, system_instruction)
        
        max_retries = 2
        for _ in range(max_retries):
            # Check for truncation indicators: ends with bullet, number, conjunction, or doesn't end with punctuation
            is_truncated = (
                response_text.strip().endswith(("*", "-", "1.", "2.", "3.", "ve", "veya", "olun", "arasında", ":", ",")) or
                not any(response_text.strip().endswith(p) for p in (".", "!", "?", "...", ")"))
            )
            
            if is_truncated:
                print(f"DEBUG: Truncation detected at: '{response_text.strip()[-10:]}'. Requesting continuation...")
                continuation_prompt = f"Cevabın yarıda kesildi. Lütfen kaldığın yerden ('{response_text.strip()[-30:]}') başlayarak hiçbir şeyi tekrarlamadan sadece mesajın kalanını tamamla."
                
                # Append context for continuation
                continuation_contents = contents + [
                    {"role": "model", "parts": [{"text": response_text}]},
                    {"role": "user", "parts": [{"text": continuation_prompt}]}
                ]
                
                continuation_text = await call_gemini_rest(continuation_contents, api_key, system_instruction)
                if continuation_text:
                    response_text = response_text.strip() + " " + continuation_text.strip()
                else:
                    break
            else:
                break

        # --- FEATURE: Extract Mentions & Fetch DB Cards ---
        recommendations = []
        try:
            # We fetch all vehicles to cross-reference
            # In a real app, we'd use more efficient NLP, but for MVP we match tokens
            cursor = db.vehicles.find({})
            all_vehicles = await cursor.to_list(length=100)
            
            for v in all_vehicles:
                v_name = f"{v.get('brand')} {v.get('model')}".lower()
                # If AI response contains the car name, add to cards
                if v_name in response_text.lower() or (v.get('model').lower() in response_text.lower() and len(v.get('model')) > 3):
                    recommendations.append({
                        "brand": v.get("brand"),
                        "model": v.get("model"),
                        "slug": v.get("slug"),
                        "image": v.get("image"),
                        "year": v.get("year"),
                        "overallScore": v.get("scores", {}).get("overall", {}).get("score", 0)
                    })
                    if len(recommendations) >= 4: break # Limit cards
        except Exception as e:
            print(f"Card Fetch Error: {e}")

        return AIChatResponse(response=response_text, recommendations=recommendations)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return AIChatResponse(response=f"HATA: {str(e)}")



# === SUMMARY GENERATION ===

class AISummaryRequest(BaseModel):
    vehicle: dict

class AISummaryResponse(BaseModel):
    summary: str
    highlight: str

@router.post("/generate-summary", response_model=AISummaryResponse)
async def generate_summary(request: AISummaryRequest):
    api_key = get_gemini_api_key()
    if not api_key:
        return AISummaryResponse(
            summary="Yapay zeka servisine erişilemiyor. Lütfen manuel açıklama girin.",
            highlight="Bağlantı Hatası"
        )

    try:
        v = request.vehicle
        vehicle_info = f"""
Marka: {v.get('brand')}
Model: {v.get('model')}
Yıl: {v.get('year')}
Yakıt: {v.get('fuelType')}
Kasa: {v.get('bodyType')}
Modifikasyonlar: {', '.join(v.get('modifications', []))}
Bakım Kaydı Sayısı: {len(v.get('maintenanceHistory', []))}
Sahiplik Süresi: {v.get('ownershipDate', 'Bilinmiyor')} den beri.
Puan: {v.get('ownerRating')}/10
Satılık mı: {'Evet' if v.get('isForSale') else 'Hayır'}
"""

        prompt = f"""
Aşağıdaki araç verilerine dayanarak Türkçe, etkileyici ve akıcı bir "Garaj Hikayesi/Özeti" yaz.
Araç sahibinin ağzından yazılmış gibi samimi ama profesyonel olsun.
Aracın özelliklerini metne yedir.

ARAÇ BİLGİLERİ:
{vehicle_info}

İSTENEN ÇIKTI (JSON):
{{
  "summary": "2-3 cümlelik, vitrin yazısı tadında, ilgi çekici özet.",
  "highlight": "Aracın en dikkat çekici özelliği veya durumu (Kısa bir cümle, örn: 'Titizlikle bakılmış bir klasik' veya 'Pist günlerine hazır canavar')"
}}
"""
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        response_text = await call_gemini_rest(contents, api_key)
        
        cleaned_json = clean_json_string(response_text)
        data = json.loads(cleaned_json)
        
        return AISummaryResponse(**data)
        
    except Exception as e:
        print(f"Summary Gen Error: {e}")
        return AISummaryResponse(
            summary="Özet oluşturulurken bir hata oluştu.",
            highlight="Hata"
        )


# === SNAP & RATE ===

class SnapResponse(BaseModel):
    brand: str
    model: str
    generation: Optional[str] = None
    bodyType: str
    confidence: int

@router.post("/snap", response_model=SnapResponse)
async def snap_identify(file: UploadFile = File(...)):
    api_key = get_gemini_api_key()
    if not api_key:
         raise HTTPException(status_code=500, detail="API Key missing")
         
    try:
        content = await file.read()
        # Convert to base64
        b64_image = base64.b64encode(content).decode('utf-8')
        
        prompt = """
        Analyze this car. Return STRICT JSON:
        {
            "brand": "String",
            "model": "String",
            "generation": "String or null",
            "bodyType": "String",
            "confidence": Integer (0-100)
        }
        If no car, confidence 0.
        """
        
        contents = [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {"inline_data": {
                    "mime_type": "image/jpeg", # Assuming jpeg for simplicity, or detect
                    "data": b64_image
                }}
            ]
        }]
        
        response_text = await call_gemini_rest(contents, api_key)
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        data = json.loads(response_text)
        return SnapResponse(**data)
        
    except Exception as e:
        print(f"Snap Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/snap-rate")
async def snap_rate(
    brand: str = Body(...), 
    model: str = Body(...),
    generation: Optional[str] = Body(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    print(f"DEBUG: Snap-Rate Request -> Brand: {brand}, Model: {model}, Gen: {generation}")
    try:
        # --- 1. SEARCH DATABASE FIRST ---
        matched_vehicle = await find_vehicle_in_db(brand, model, db)

        # --- 2. IF FOUND IN DB: Return Official Data ---
        if matched_vehicle:
            print(f"DEBUG: Match FOUND in DB: {matched_vehicle.get('brand')} {matched_vehicle.get('model')}")
            scores = matched_vehicle.get("scores", {})
            
            # Helper to safely get score
            def get_val(path, default=7.0):
                keys = path.split('.')
                curr = scores
                for k in keys:
                    if isinstance(curr, dict) and k in curr:
                        curr = curr[k]
                    else:
                        return default
                return curr if isinstance(curr, (int, float)) else default

            return {
                "source": "database",
                "reliability": get_val("reliability.score", 8.0),
                "performance": get_val("performance.score", 8.0),
                "maintenance": get_val("costOfOwnership.score", 7.5),
                "fuelEconomy": get_val("technology.score", 7.0),
                "userSatisfaction": get_val("overall.score", 8.5),
                "overallScore": get_val("overall.score", 8.2),
                "explanation": "Bu araç için resmi editör incelememiz mevcuttur. Veritabanındaki güncel puanlar aşağıdadır.",
                "matchedVehicleId": matched_vehicle.get("id") or str(matched_vehicle.get("_id")),
                "matchedVehicleSlug": matched_vehicle.get("slug"),
                "year": matched_vehicle.get("year"),
                "isExactMatch": True
            }

        print("DEBUG: No DB match found. Calling AI...")
        
        # --- 3. IF NOT IN DB: Use AI Estimation ---
        api_key = get_gemini_api_key()
        if not api_key:
             return {
                "source": "ai_fallback",
                "overallScore": 7.5,
                "explanation": "Resmi inceleme bulunamadı ve AI servisine erişilemiyor."
            }

        full_name = f"{brand} {model}"
        if generation: full_name += f" ({generation})"
        
        prompt = f"Act as an automotive expert. Rate this car: {full_name}. Return STRICT JSON with: reliability, performance, maintenance, fuelEconomy, userSatisfaction, overallScore, explanation (in Turkish)."
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        
        response_text = await call_gemini_rest(contents, api_key)
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        data = json.loads(response_text)
        data["source"] = "ai"
        data["isExactMatch"] = False
        data["explanation"] = "Bu araç için henüz resmi bir inceleme bulunmuyor. İşte yapay zeka tarafından üretilen tahmini veriler."
        return data
        
    except Exception as e:
        print(f"Snap-Rate Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "source": "error",
            "reliability": 7.5, "performance": 7.5, "maintenance": 7.5,
            "fuelEconomy": 7.5, "userSatisfaction": 7.5, "overallScore": 7.5,
            "explanation": "Analiz sırasında teknik bir hata oluştu, ancak genel değerlendirme aşağıdadır."
        }

# === WIZARD ===

class WizardRequest(BaseModel):
    budgetMin: int = 500000
    budgetMax: int = 1500000
    vehicleType: str = ""
    usage: List[str] = []
    fuelType: str = ""
    annualKm: int = 15000
    fuelEconomyImportance: int = 5
    familyStatus: str = ""
    priorities: List[str] = []
    additionalNotes: str = ""

@router.post("/wizard")
async def wizard_recommend(
    request: WizardRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """8 adımlı sihirbaz için AI destekli araç önerisi"""
    print(f"--- WIZARD REQUEST ---")
    
    api_key = get_gemini_api_key()
    if not api_key:
        return {"error": "API anahtarı bulunamadı", "recommendations": []}
    
    try:
        # Build user profile from wizard answers
        budget_str = f"{request.budgetMin:,} - {request.budgetMax:,} TL"
        usage_str = ", ".join(request.usage) if request.usage else "Belirtilmedi"
        priorities_str = ", ".join(request.priorities) if request.priorities else "Belirtilmedi"
        
        user_profile = f"""
KULLANICI PROFİLİ:
- Bütçe: {budget_str}
- Araç Tipi: {request.vehicleType or 'Fark etmez'}
- Kullanım Alanı: {usage_str}
- Yakıt Tercihi: {request.fuelType or 'Fark etmez'}
- Yıllık KM: {request.annualKm:,} km
- Yakıt Ekonomisi Önemi: {request.fuelEconomyImportance}/10
- Aile Durumu: {request.familyStatus or 'Belirtilmedi'}
- Öncelikler: {priorities_str}
- EK NOT (ÖNCELİKLİ): {request.additionalNotes or 'Yok'}
"""

        system_instruction = """
Sen OTORITE AI, Türkiye piyasasına hakim profesyonel bir otomobil danışmanısın.
Kullanıcının 8 adımlı sihirbaz cevaplarını analiz edip, Türkiye şartlarında bütçesine ve ihtiyaçlarına en uygun 3 araç önereceksin.

KURALLAR:
1. Sınırlama Yok: Piyasada bulunan HERHANGİ bir aracı önerebilirsin. Veritabanı sınırın yok.
2. FİYAT KONTROLÜ (KRİTİK): Kullanıcının bütçesi ({budget_str}). Türkiye 2. el piyasasındaki ORTALAMA fiyatları baz al. Bütçeyi aşan araçları ASLA önerme.
3. TİP DOĞRULUĞU (KRİTİK): Araçların 'Tip' bilgisini (Sedan, SUV, Hatchback vb.) doğru ver.
4. "ÖNERİLEN SPECLER": Önerdiğin modelin motor, güç, yıl gibi teknik verilerini de JSON içinde döndür.

ÇOK ÖNEMLİ:
- SADECE VE SADECE JSON DÖNDÜR.
- JSON DIŞINDA HİÇBİR AÇIKLAMA, YORUM VEYA METİN YAZMA.
- CEVABIN ```json İLE BAŞLAYIP ``` İLE BİTSİN.

CEVAP FORMATI (Doğrudan JSON):
{
    "aiSummary": "Kısa genel değerlendirme (1-2 cümle)",
    "recommendations": [
        {
            "brand": "Marka",
            "model": "Model (Örn: Civic 1.5 VTEC)", 
            "year": 2020,
            "price_range": "Tahmini Fiyat Aralığı",
            "reason": "Neden bu araç öneriliyor (1 cümle)",
            "pros": ["Artı 1", "Artı 2"],
            "cons": ["Eksi 1"],
            "specs": {
                "engine": "Örn: 1.5 Turbo",
                "power": "Örn: 182 HP",
                "fuel": "Örn: Benzin"
            },
            "isTopPick": true/false
        }
    ]
}
"""

        prompt = f"""
{user_profile}

Yukarıdaki kullanıcı profiline göre Türkiye piyasasındaki en uygun 3 aracı öner.
Unutma: Bütçe {budget_str}. Bu aralığın dışına çıkma.
Sadece JSON döndür.
"""

        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        response_text = await call_gemini_rest(contents, api_key, system_instruction)
        
        # Parse JSON
        # Robust JSON Parsing
        cleaned_json = clean_json_string(response_text)
        try:
            data = json.loads(cleaned_json)
        except json.JSONDecodeError as je:
            print(f"JSON DECODE ERROR: {je}")
            print(f"Original Text: {response_text}")
            print(f"Cleaned Text: {cleaned_json}")
            
            # Fallback Retry Strategy could be added here, but for now return a safe error
            raise ValueError("AI yanıtı uygun formatta değildi.")
            
        data = json.loads(cleaned_json)
        
        # Post-Process: Check Database for Matches
        for rec in data.get("recommendations", []):
            rec["in_inventory"] = False # Default assumes we don't have it
            
            db_match = await find_vehicle_in_db(rec.get('brand'), rec.get('model'), db)
            
            if db_match:
                print(f"DEBUG: Match Found for {rec.get('brand')} {rec.get('model')} -> {db_match.get('slug')}")
                rec["in_inventory"] = True
                rec["slug"] = db_match.get("slug")
                rec["image"] = db_match.get("image")
                rec["db_score"] = db_match.get("scores", {}).get("overall", {}).get("score", 0)
            else:
                print(f"DEBUG: No Match for {rec.get('brand')} {rec.get('model')}")
        
        return data
        
    except Exception as e:
        print(f"Wizard Error: {e}")
        # Log bad response for debugging
        try:
            with open("C:/Users/PC/Desktop/yedek/backend/gemini_error_log.txt", "a", encoding="utf-8") as f:
                f.write(f"\n\n--- ERROR {e} ---\n")
                if 'response_text' in locals():
                    f.write(response_text)
        except:
             pass

        # === FALLBACK STRATEGY ===
        # If AI fails, do not show error. Show random popular cars.
        print("Switching to WIZARD FALLBACK MODE...")
        
        try:
            pipeline = [{"$sample": {"size": 3}}]
            fallback_vehicles = await db.vehicles.aggregate(pipeline).to_list(length=3)
            
            recommendations = []
            for v in fallback_vehicles:
                recommendations.append({
                    "brand": v.get("brand"),
                    "model": v.get("model"),
                    "slug": v.get("slug"),
                    "image": v.get("image", ""),
                    "reason": "Popüler ve güvenilir bir seçenek olduğu için öneriliyor (AI Geçici Olarak Devre Dışı).",
                    "pros": ["Yüksek kullanıcı memnuniyeti", "Güvenilir marka"],
                    "cons": ["Stok durumu değişebilir"],
                    "suitableFor": "Genel kullanım",
                    "isTopPick": False
                })
                
            if recommendations:
                recommendations[0]["isTopPick"] = True
                
            return {
                "aiSummary": "Yapay zeka servisine şu an erişilemiyor, ancak profiliniz için popüler seçenekleri derledik.",
                "recommendations": recommendations,
                "error": None # Clear error to prevent UI popup
            }
        except Exception as fallback_error:
             print(f"CRITICAL FALLBACK ERROR: {fallback_error}")
             # If even DB fails, return static hardcoded response to prevent 500 error
             return {
                "aiSummary": "Bağlantı sorunları yaşanıyor. İşte editörün seçtikleri:",
                "recommendations": [
                     {
                        "brand": "Toyota", 
                        "model": "Corolla", 
                        "slug": "toyota-corolla",
                        "reason": "Dünyanın en çok tercih edilen, sorunsuz otomobili.",
                        "pros": ["Yakıt ekonomisi", "Dayanıklılık"],
                        "cons": ["Sıradan tasarım"],
                        "suitableFor": "Herkes",
                        "isTopPick": True
                     },
                     {
                        "brand": "Renault", 
                        "model": "Clio", 
                        "slug": "renault-clio",
                        "reason": "Şehir içinin en pratik ve ekonomik seçeneği.",
                        "pros": ["Yaygın servis", "Düşük yakıt"],
                        "cons": ["Arka diz mesafesi"],
                        "suitableFor": "Şehir içi kullanım",
                        "isTopPick": False
                     },
                                          {
                        "brand": "Fiat", 
                        "model": "Egea", 
                        "slug": "fiat-egea",
                        "reason": "Fiyat/performans şampiyonu aile aracı.",
                        "pros": ["Geniş bagaj", "Yedek parça"],
                        "cons": ["İç malzeme kalitesi"],
                        "suitableFor": "Aileler",
                        "isTopPick": False
                     }
                ],
                "error": None
            }


# === FALLBACK ===
async def heuristic_recommend(query: str, db: AsyncIOMotorDatabase):
    # Simple fallback logic
    pipeline = [{"$sample": {"size": 3}}]
    vehicles = await db.vehicles.aggregate(pipeline).to_list(length=3)
    return AIRecommendationResponse(
        vehicles=[vehicle_to_response(v) for v in vehicles],
        explanation="Şu anda yapay zeka servisine erişilemiyor (Fallback Mode)."
    )

@router.post("/compare-analyst")
async def compare_analyst(
    request: AICompareRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Analyzes multiple vehicles and provides a comparative review for the user.
    """
    if not request.vehicleIds or len(request.vehicleIds) < 2:
        raise HTTPException(status_code=400, detail="Analiz için en az iki araç seçilmelidir.")

    api_key = get_gemini_api_key()
    
    try:
        # 1. Fetch vehicle data
        vehicles = []
        for vid in request.vehicleIds:
            v = await db.vehicles.find_one({"id": vid})
            if v:
                vehicles.append(v)
        
        if len(vehicles) < 2:
            raise HTTPException(status_code=404, detail="Seçilen araçlar veritabanında bulunamadı.")

        # 2. Prepare context for AI
        vehicle_details = []
        for v in vehicles:
            details = {
                "name": f"{v.get('brand')} {v.get('model')} ({v.get('year')})",
                "specs": v.get("specs", {}),
                "scores": {k: v.get("scores", {}).get(k, {}).get("score") for k in v.get("scores", {})} if v.get("scores") else {},
                "strengths": v.get("strengths", {}).get("tr", []),
                "weaknesses": v.get("weaknesses", {}).get("tr", []),
                "bestFor": v.get("bestFor", {}).get("tr", ""),
                "verdict": v.get("editorial", {}).get("verdict", {}).get("tr", "")
            }
            vehicle_details.append(details)

        # 3. Call Gemini
        system_instruction = """
        Sen OTORİTE AI, dünyanın en saygın otomobil dergilerinden ve analiz platformlarından biri olan 'Otorite'nin kıdemli kıyaslama uzmanısın.
        Görevin, sana verilen araç verilerini analiz edip kullanıcıya objektif, teknik temelli ama akıcı bir karşılaştırma raporu sunmaktır.
        
        Kullanıcının arasından seçim yapmaya çalıştığı bu araçlar için:
        1. Araçların temel karakter farklarını belirt (Örn: Biri konfor diğeri sürüş keyfi odaklı).
        2. Karşılaştırılan kategorilerde (Performans, İç mekan, Teknoloji vb.) kimin önde olduğunu açıkla.
        3. Farklı kullanıcı profilleri için hangisinin daha mantıklı olduğunu söyle (Aileler için X, gençler için Y gibi).
        4. Otorite kararı olarak objektif bir tavsiye ver.
        
        Yanıtın profesyonel, anlaşılır ve ikna edici olmalı. Markdown formatında başlıklar ve listeler kullanarak şık bir rapor üret.
        Yalnızca TÜRKÇE cevap ver.
        """
        
        prompt = f"Aşağıdaki araçları detaylıca kıyasla ve kullanıcıya hangisini seçmesi gerektiği konusunda rehberlik et:\n\n{json.dumps(vehicle_details, indent=2, ensure_ascii=False)}"
        
        if api_key:
            contents = [{"parts": [{"text": prompt}]}]
            ai_response = await call_gemini_rest(contents, api_key, system_instruction)
            return {"analysis": ai_response}
        else:
            # Fallback: Scrappy heuristic analysis if AI is offline
            v1, v2 = vehicles[0], vehicles[1]
            analysis = f"### Otorite Karşılaştırma Analizi (Statik Mod)\n\n"
            analysis += f"**{v1['brand'].upper()} {v1['model']}** ve **{v2['brand'].upper()} {v2['model']}** kıyaslandığında:\n\n"
            
            s1 = v1.get("scores", {}).get("overall", {}).get("score", 0)
            s2 = v2.get("scores", {}).get("overall", {}).get("score", 0)
            
            if s1 > s2:
                analysis += f"- Genel Otorite puanlamasında **{v1['model']}** ({s1}) daha yüksek bir skora sahip.\n"
            else:
                analysis += f"- Genel Otorite puanlamasında **{v2['model']}** ({s2}) daha yüksek bir skora sahip.\n"
            
            analysis += "\nLütfen teknik tabloyu inceleyerek önceliklerinize göre karar veriniz. AI servisi şu an kısıtlı olduğundan detaylı rapor sunulamıyor."
            return {"analysis": analysis}

    except Exception as e:
        print(f"Error in compare_analyst: {e}")
        raise HTTPException(status_code=500, detail=str(e))
