# Seed data for initial vehicles
from datetime import datetime
import uuid

SEED_VEHICLES = [
    {
        "id": str(uuid.uuid4()),
        "brand": "bmw",
        "model": "3 Series",
        "year": 2024,
        "segment": "sedan",
        "image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "specs": {
            "engine": "2.0L Turbo",
            "power": "258 hp",
            "torque": "400 Nm",
            "acceleration": "5.8s",
            "topSpeed": "250 km/h"
        },
        "scores": {
            "reliability": {"score": 7.5, "justification": {"tr": "Olgun platform, ancak bazı elektronik sorunlar bildirilmiş", "en": "Mature platform with some reported electronic issues"}},
            "buildQuality": {"score": 8.5, "justification": {"tr": "Premium malzemeler ve hassas montaj", "en": "Premium materials and precise assembly"}},
            "performance": {"score": 8.8, "justification": {"tr": "Güçlü motor seçenekleri ve keskin tepkiler", "en": "Powerful engine options with sharp responses"}},
            "drivingExperience": {"score": 9.0, "justification": {"tr": "Segment lideri direksiyon hissi ve dinamikler", "en": "Segment-leading steering feel and dynamics"}},
            "technology": {"score": 8.5, "justification": {"tr": "iDrive 8 sistemi sezgisel ve kapsamlı", "en": "iDrive 8 system is intuitive and comprehensive"}},
            "safety": {"score": 8.7, "justification": {"tr": "Euro NCAP 5 yıldız, gelişmiş ADAS", "en": "Euro NCAP 5 stars with advanced ADAS"}},
            "costOfOwnership": {"score": 6.5, "justification": {"tr": "Premium segment bakım maliyetleri", "en": "Premium segment maintenance costs"}},
            "design": {"score": 8.5, "justification": {"tr": "Sportif oranlar, modern iç mekan", "en": "Sporty proportions with modern interior"}},
            "valueForMoney": {"score": 7.0, "justification": {"tr": "Yüksek fiyat ancak güçlü donanım", "en": "High price but strong equipment"}},
            "overall": {"score": 8.1, "justification": {"tr": "Segmentinin en dinamik seçeneği", "en": "Most dynamic choice in its segment"}}
        },
        "strengths": {"tr": ["Üstün sürüş dinamikleri", "Premium iç mekan", "Güçlü motor"], "en": ["Superior driving dynamics", "Premium interior", "Powerful engine"]},
        "weaknesses": {"tr": ["Yüksek bakım maliyeti", "Sert süspansiyon"], "en": ["High maintenance cost", "Firm suspension"]},
        "bestFor": {"tr": "Sürüş keyfi arayanlar", "en": "Those seeking driving pleasure"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "bmw-3-series-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "mercedes",
        "model": "C-Class",
        "year": 2024,
        "segment": "sedan",
        "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
        "specs": {
            "engine": "1.5L Turbo + Mild Hybrid",
            "power": "204 hp",
            "torque": "300 Nm",
            "acceleration": "7.3s",
            "topSpeed": "246 km/h"
        },
        "scores": {
            "reliability": {"score": 7.0, "justification": {"tr": "Yeni platform, uzun vadeli veriler sınırlı", "en": "New platform with limited long-term data"}},
            "buildQuality": {"score": 9.0, "justification": {"tr": "S-Class kalitesinde malzemeler", "en": "S-Class quality materials"}},
            "performance": {"score": 8.0, "justification": {"tr": "Yeterli güç, hafif hibrit desteği", "en": "Adequate power with mild hybrid support"}},
            "drivingExperience": {"score": 8.0, "justification": {"tr": "Konfor odaklı ancak yetkin", "en": "Comfort-focused but capable"}},
            "technology": {"score": 9.2, "justification": {"tr": "MBUX sistemi segment lideri", "en": "MBUX system is segment-leading"}},
            "safety": {"score": 8.8, "justification": {"tr": "Kapsamlı güvenlik paketleri", "en": "Comprehensive safety packages"}},
            "costOfOwnership": {"score": 6.0, "justification": {"tr": "Yüksek servis maliyetleri", "en": "High service costs"}},
            "design": {"score": 9.0, "justification": {"tr": "Zarif ve modern tasarım", "en": "Elegant and modern design"}},
            "valueForMoney": {"score": 6.8, "justification": {"tr": "Premium fiyatlandırma", "en": "Premium pricing"}},
            "overall": {"score": 8.0, "justification": {"tr": "Lüks ve teknoloji odaklı seçenek", "en": "Luxury and technology focused choice"}}
        },
        "strengths": {"tr": ["Üstün iç mekan kalitesi", "İleri teknoloji", "Zarif tasarım"], "en": ["Superior interior quality", "Advanced technology", "Elegant design"]},
        "weaknesses": {"tr": ["Yüksek fiyat", "Düşük taban motor gücü"], "en": ["High price", "Low base engine power"]},
        "bestFor": {"tr": "Lüks ve prestij arayanlar", "en": "Those seeking luxury and prestige"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "mercedes-c-class-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "toyota",
        "model": "Camry",
        "year": 2024,
        "segment": "sedan",
        "image": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        "specs": {
            "engine": "2.5L Hybrid",
            "power": "218 hp",
            "torque": "221 Nm",
            "acceleration": "8.1s",
            "topSpeed": "180 km/h"
        },
        "scores": {
            "reliability": {"score": 9.5, "justification": {"tr": "Kanıtlanmış güvenilirlik geçmişi", "en": "Proven reliability track record"}},
            "buildQuality": {"score": 7.5, "justification": {"tr": "Sağlam ancak premium hissi yok", "en": "Solid but lacks premium feel"}},
            "performance": {"score": 7.0, "justification": {"tr": "Yeterli performans, hibrit verimli", "en": "Adequate performance, efficient hybrid"}},
            "drivingExperience": {"score": 7.0, "justification": {"tr": "Konforlu ve sessiz", "en": "Comfortable and quiet"}},
            "technology": {"score": 7.5, "justification": {"tr": "Temel özellikler yeterli", "en": "Basic features are adequate"}},
            "safety": {"score": 8.5, "justification": {"tr": "Toyota Safety Sense standart", "en": "Toyota Safety Sense standard"}},
            "costOfOwnership": {"score": 9.0, "justification": {"tr": "Düşük bakım, yüksek değer koruma", "en": "Low maintenance, high value retention"}},
            "design": {"score": 7.0, "justification": {"tr": "Fonksiyonel tasarım", "en": "Functional design"}},
            "valueForMoney": {"score": 8.5, "justification": {"tr": "Güçlü değer önerisi", "en": "Strong value proposition"}},
            "overall": {"score": 8.0, "justification": {"tr": "En güvenilir seçenek", "en": "Most reliable choice"}}
        },
        "strengths": {"tr": ["Efsanevi güvenilirlik", "Düşük işletme maliyeti", "Yüksek ikinci el değeri"], "en": ["Legendary reliability", "Low running costs", "High resale value"]},
        "weaknesses": {"tr": ["Sıradan iç mekan", "Düşük sürüş heyecanı"], "en": ["Ordinary interior", "Low driving excitement"]},
        "bestFor": {"tr": "Güvenilirlik arayanlar", "en": "Those seeking reliability"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "toyota-camry-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "tesla",
        "model": "Model 3",
        "year": 2024,
        "segment": "electric",
        "image": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
        "specs": {
            "engine": "Dual Motor Electric",
            "power": "340 hp",
            "torque": "493 Nm",
            "acceleration": "4.4s",
            "topSpeed": "233 km/h"
        },
        "scores": {
            "reliability": {"score": 6.5, "justification": {"tr": "Panel uyumu sorunları, yazılım güvenilir", "en": "Panel gap issues, software reliable"}},
            "buildQuality": {"score": 6.5, "justification": {"tr": "Değişken kalite kontrolü", "en": "Variable quality control"}},
            "performance": {"score": 9.0, "justification": {"tr": "Anlık tork, hızlı hızlanma", "en": "Instant torque, rapid acceleration"}},
            "drivingExperience": {"score": 8.0, "justification": {"tr": "Sessiz ve çevik", "en": "Quiet and agile"}},
            "technology": {"score": 9.5, "justification": {"tr": "Segment lideri yazılım ve OTA", "en": "Segment-leading software and OTA"}},
            "safety": {"score": 8.5, "justification": {"tr": "Güçlü çarpışma testi sonuçları", "en": "Strong crash test results"}},
            "costOfOwnership": {"score": 8.0, "justification": {"tr": "Düşük enerji maliyeti, yüksek sigorta", "en": "Low energy cost, high insurance"}},
            "design": {"score": 7.5, "justification": {"tr": "Minimalist ancak tartışmalı", "en": "Minimalist but divisive"}},
            "valueForMoney": {"score": 7.5, "justification": {"tr": "Segment için rekabetçi fiyat", "en": "Competitive pricing for segment"}},
            "overall": {"score": 7.8, "justification": {"tr": "En iyi teknoloji odaklı EV", "en": "Best tech-focused EV"}}
        },
        "strengths": {"tr": ["Üstün teknoloji", "Hızlı hızlanma", "Geniş şarj ağı"], "en": ["Superior technology", "Rapid acceleration", "Extensive charging network"]},
        "weaknesses": {"tr": ["Yapı kalitesi tutarsızlıkları", "Minimalist iç mekan"], "en": ["Build quality inconsistencies", "Minimalist interior"]},
        "bestFor": {"tr": "Teknoloji meraklıları", "en": "Tech enthusiasts"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "tesla-model-3-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "porsche",
        "model": "911",
        "year": 2024,
        "segment": "sports",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "specs": {
            "engine": "3.0L Twin-Turbo Flat-6",
            "power": "385 hp",
            "torque": "450 Nm",
            "acceleration": "4.2s",
            "topSpeed": "293 km/h"
        },
        "scores": {
            "reliability": {"score": 8.0, "justification": {"tr": "Olgun platform, premium bakım gerektirir", "en": "Mature platform, requires premium maintenance"}},
            "buildQuality": {"score": 9.5, "justification": {"tr": "El işçiliği ve hassasiyet", "en": "Handcrafted precision"}},
            "performance": {"score": 9.8, "justification": {"tr": "Efsanevi performans mimarisi", "en": "Legendary performance architecture"}},
            "drivingExperience": {"score": 10.0, "justification": {"tr": "Segment tanımlayan sürüş deneyimi", "en": "Segment-defining driving experience"}},
            "technology": {"score": 8.0, "justification": {"tr": "Sürüş odaklı, yeterli infotainment", "en": "Driving-focused, adequate infotainment"}},
            "safety": {"score": 8.0, "justification": {"tr": "Spor araç için yeterli sistemler", "en": "Adequate systems for sports car"}},
            "costOfOwnership": {"score": 5.0, "justification": {"tr": "Çok yüksek bakım ve sigorta", "en": "Very high maintenance and insurance"}},
            "design": {"score": 9.5, "justification": {"tr": "İkonik ve zamansız", "en": "Iconic and timeless"}},
            "valueForMoney": {"score": 7.0, "justification": {"tr": "Yüksek fiyat ancak yüksek değer koruma", "en": "High price but high value retention"}},
            "overall": {"score": 9.0, "justification": {"tr": "Spor araç segmentinin referans noktası", "en": "Benchmark of sports car segment"}}
        },
        "strengths": {"tr": ["Efsanevi sürüş", "Zamansız tasarım", "Yüksek değer koruma"], "en": ["Legendary driving", "Timeless design", "High value retention"]},
        "weaknesses": {"tr": ["Yüksek fiyat", "Sınırlı pratiklik"], "en": ["High price", "Limited practicality"]},
        "bestFor": {"tr": "Saf sürüş tutkunları", "en": "Pure driving enthusiasts"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "porsche-911-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "hyundai",
        "model": "Ioniq 5",
        "year": 2024,
        "segment": "electric",
        "image": "https://images.unsplash.com/photo-1644143379190-08a5f055de1d?w=800",
        "specs": {
            "engine": "Dual Motor Electric",
            "power": "325 hp",
            "torque": "605 Nm",
            "acceleration": "5.1s",
            "topSpeed": "185 km/h"
        },
        "scores": {
            "reliability": {"score": 7.5, "justification": {"tr": "Yeni platform ancak Hyundai güvenilirliği", "en": "New platform but Hyundai reliability"}},
            "buildQuality": {"score": 8.0, "justification": {"tr": "İyi malzeme kalitesi", "en": "Good material quality"}},
            "performance": {"score": 8.5, "justification": {"tr": "Güçlü elektrik motoru", "en": "Powerful electric motor"}},
            "drivingExperience": {"score": 8.0, "justification": {"tr": "Rahat ve çevik", "en": "Comfortable and agile"}},
            "technology": {"score": 9.0, "justification": {"tr": "800V şarj, V2L özelliği", "en": "800V charging, V2L feature"}},
            "safety": {"score": 8.5, "justification": {"tr": "Kapsamlı güvenlik sistemleri", "en": "Comprehensive safety systems"}},
            "costOfOwnership": {"score": 8.0, "justification": {"tr": "Rekabetçi fiyat, düşük işletme", "en": "Competitive price, low running costs"}},
            "design": {"score": 9.0, "justification": {"tr": "Cesur ve özgün retro-fütüristik", "en": "Bold and unique retro-futuristic"}},
            "valueForMoney": {"score": 8.5, "justification": {"tr": "Segment için mükemmel değer", "en": "Excellent value for segment"}},
            "overall": {"score": 8.4, "justification": {"tr": "En dengeli EV seçeneği", "en": "Most balanced EV option"}}
        },
        "strengths": {"tr": ["Hızlı şarj", "Özgün tasarım", "V2L özelliği"], "en": ["Fast charging", "Unique design", "V2L feature"]},
        "weaknesses": {"tr": ["Sınırlı arka görüş", "Karmaşık klima kontrolleri"], "en": ["Limited rear visibility", "Complex climate controls"]},
        "bestFor": {"tr": "Değer arayan EV alıcıları", "en": "Value-seeking EV buyers"},
        "reliability_details": {
            "engine": {"tr": "", "en": ""},
            "transmission": {"tr": "", "en": ""},
            "electronics": {"tr": "", "en": ""},
            "materials": {"tr": "", "en": ""},
            "editor_note": {"tr": "", "en": ""}
        },
        "slug": "hyundai-ioniq-5-2024",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]


async def seed_database(db):
    """Seed the database with initial data if empty"""
    # Check if vehicles exist
    count = await db.vehicles.count_documents({})
    if count == 0:
        print("Seeding vehicles...")
        await db.vehicles.insert_many(SEED_VEHICLES)
        print(f"Inserted {len(SEED_VEHICLES)} vehicles")
    else:
        print(f"Database already has {count} vehicles, skipping seed")
