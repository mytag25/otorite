from fastapi import APIRouter
from typing import List

from models import BrandResponse, SegmentResponse, SegmentName

router = APIRouter(tags=["Static Data"])

# Brands with models (20 years of data)
BRANDS_DATA = [
    {"id": "audi", "name": "Audi", "country": "Germany", "models": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4", "Q5", "Q7", "Q8", "TT", "R8", "e-tron", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7", "S3", "S4", "S5", "S6", "S7", "S8"]},
    {"id": "bmw", "name": "BMW", "country": "Germany", "models": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "i5", "i7", "iX", "iX1", "iX3", "M2", "M3", "M4", "M5", "M8"]},
    {"id": "mercedes", "name": "Mercedes-Benz", "country": "Germany", "models": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT", "EQA", "EQB", "EQC", "EQE", "EQS", "EQV", "Maybach", "V-Class"]},
    {"id": "volkswagen", "name": "Volkswagen", "country": "Germany", "models": ["Polo", "Golf", "Passat", "Arteon", "Jetta", "Tiguan", "Touareg", "T-Cross", "T-Roc", "Taigo", "ID.3", "ID.4", "ID.5", "ID.7", "ID.Buzz", "Caddy", "Multivan", "Amarok"]},
    {"id": "porsche", "name": "Porsche", "country": "Germany", "models": ["718 Cayman", "718 Boxster", "911", "Panamera", "Cayenne", "Macan", "Taycan"]},
    {"id": "opel", "name": "Opel", "country": "Germany", "models": ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Combo", "Zafira"]},
    {"id": "toyota", "name": "Toyota", "country": "Japan", "models": ["Yaris", "Corolla", "Camry", "Avalon", "Crown", "Prius", "C-HR", "RAV4", "Highlander", "Land Cruiser", "Supra", "GR86", "GR Yaris", "bZ4X", "Mirai", "Hilux"]},
    {"id": "honda", "name": "Honda", "country": "Japan", "models": ["Jazz", "Civic", "Accord", "HR-V", "CR-V", "ZR-V", "e:Ny1", "NSX", "City", "Pilot"]},
    {"id": "mazda", "name": "Mazda", "country": "Japan", "models": ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-90", "MX-5", "MX-30"]},
    {"id": "nissan", "name": "Nissan", "country": "Japan", "models": ["Micra", "Note", "Leaf", "Sentra", "Altima", "Maxima", "Juke", "Qashqai", "X-Trail", "Ariya", "GT-R", "Z", "Navara", "Patrol"]},
    {"id": "lexus", "name": "Lexus", "country": "Japan", "models": ["IS", "ES", "LS", "LC", "RC", "UX", "NX", "RX", "GX", "LX", "RZ"]},
    {"id": "subaru", "name": "Subaru", "country": "Japan", "models": ["Impreza", "Legacy", "WRX", "BRZ", "Crosstrek", "Forester", "Outback", "Solterra"]},
    {"id": "mitsubishi", "name": "Mitsubishi", "country": "Japan", "models": ["Mirage", "Lancer", "Eclipse Cross", "ASX", "Outlander", "Pajero", "L200"]},
    {"id": "suzuki", "name": "Suzuki", "country": "Japan", "models": ["Swift", "Baleno", "Ignis", "Vitara", "S-Cross", "Jimny", "Across"]},
    {"id": "ford", "name": "Ford", "country": "USA", "models": ["Fiesta", "Focus", "Mondeo", "Fusion", "Mustang", "Puma", "Kuga", "Explorer", "Bronco", "Ranger", "F-150", "Mach-E", "E-Transit"]},
    {"id": "chevrolet", "name": "Chevrolet", "country": "USA", "models": ["Spark", "Cruze", "Malibu", "Camaro", "Corvette", "Trax", "Equinox", "Blazer", "Tahoe", "Suburban", "Silverado", "Colorado", "Bolt"]},
    {"id": "tesla", "name": "Tesla", "country": "USA", "models": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck", "Roadster"]},
    {"id": "cadillac", "name": "Cadillac", "country": "USA", "models": ["CT4", "CT5", "XT4", "XT5", "XT6", "Escalade", "Lyriq", "Celestiq"]},
    {"id": "jeep", "name": "Jeep", "country": "USA", "models": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Avenger"]},
    {"id": "dodge", "name": "Dodge", "country": "USA", "models": ["Charger", "Challenger", "Durango", "Hornet"]},
    {"id": "volvo", "name": "Volvo", "country": "Sweden", "models": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40", "EX30", "EX90", "EM90"]},
    {"id": "peugeot", "name": "Peugeot", "country": "France", "models": ["208", "308", "408", "508", "2008", "3008", "5008", "e-208", "e-2008", "e-308", "e-3008"]},
    {"id": "renault", "name": "Renault", "country": "France", "models": ["Clio", "Megane", "Talisman", "Captur", "Kadjar", "Austral", "Arkana", "Scenic", "Espace", "Zoe", "Megane E-Tech", "Kangoo"]},
    {"id": "citroen", "name": "Citroën", "country": "France", "models": ["C1", "C3", "C4", "C5 X", "C3 Aircross", "C5 Aircross", "e-C4", "Ami", "Berlingo"]},
    {"id": "fiat", "name": "Fiat", "country": "Italy", "models": ["500", "500X", "500L", "Panda", "Tipo", "Punto", "Doblo", "500e", "600"]},
    {"id": "alfaromeo", "name": "Alfa Romeo", "country": "Italy", "models": ["Giulia", "Stelvio", "Tonale", "Giulietta", "4C"]},
    {"id": "maserati", "name": "Maserati", "country": "Italy", "models": ["Ghibli", "Quattroporte", "Levante", "GranTurismo", "GranCabrio", "MC20", "Grecale"]},
    {"id": "ferrari", "name": "Ferrari", "country": "Italy", "models": ["Roma", "Portofino", "296 GTB", "SF90", "812", "F8", "Purosangue"]},
    {"id": "lamborghini", "name": "Lamborghini", "country": "Italy", "models": ["Huracan", "Revuelto", "Urus"]},
    {"id": "hyundai", "name": "Hyundai", "country": "South Korea", "models": ["i10", "i20", "i30", "Elantra", "Sonata", "Kona", "Tucson", "Santa Fe", "Palisade", "Ioniq 5", "Ioniq 6", "Nexo", "N Vision 74"]},
    {"id": "kia", "name": "Kia", "country": "South Korea", "models": ["Picanto", "Rio", "Ceed", "Forte", "K5", "Stinger", "Niro", "Sportage", "Sorento", "Telluride", "EV6", "EV9", "Soul"]},
    {"id": "genesis", "name": "Genesis", "country": "South Korea", "models": ["G70", "G80", "G90", "GV60", "GV70", "GV80"]},
    {"id": "landrover", "name": "Land Rover", "country": "UK", "models": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"]},
    {"id": "jaguar", "name": "Jaguar", "country": "UK", "models": ["XE", "XF", "F-Type", "E-Pace", "F-Pace", "I-Pace"]},
    {"id": "mini", "name": "MINI", "country": "UK", "models": ["Cooper", "Clubman", "Countryman", "Electric"]},
    {"id": "bentley", "name": "Bentley", "country": "UK", "models": ["Continental GT", "Flying Spur", "Bentayga"]},
    {"id": "rollsroyce", "name": "Rolls-Royce", "country": "UK", "models": ["Ghost", "Phantom", "Cullinan", "Spectre"]},
    {"id": "astonmartin", "name": "Aston Martin", "country": "UK", "models": ["Vantage", "DB11", "DB12", "DBS", "DBX"]},
    {"id": "seat", "name": "SEAT", "country": "Spain", "models": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"]},
    {"id": "cupra", "name": "CUPRA", "country": "Spain", "models": ["Leon", "Formentor", "Born", "Tavascan"]},
    {"id": "skoda", "name": "Škoda", "country": "Czech Republic", "models": ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"]},
    {"id": "dacia", "name": "Dacia", "country": "Romania", "models": ["Sandero", "Logan", "Duster", "Jogger", "Spring"]},
    {"id": "polestar", "name": "Polestar", "country": "Sweden", "models": ["Polestar 2", "Polestar 3", "Polestar 4"]},
    {"id": "byd", "name": "BYD", "country": "China", "models": ["Atto 3", "Dolphin", "Seal", "Tang", "Han"]},
    {"id": "mg", "name": "MG", "country": "China", "models": ["MG3", "MG4", "MG5", "ZS", "HS", "Marvel R", "Cyberster"]},
    {"id": "togg", "name": "TOGG", "country": "Turkey", "models": ["T10X", "T10F"]}
]

# Segments with translations - Class-based segments (A, B, C, D, E, F) combined with body type
SEGMENTS_DATA = [
    # A Segment - Minis/City cars
    {"id": "a-hatchback", "name": {"tr": "A Hatchback (Mini)", "en": "A Hatchback (Mini)", "de": "A Kleinwagen", "fr": "A Citadine", "es": "A Urbano", "it": "A Citycar", "nl": "A Stadsauto", "pt": "A Compacto", "pl": "A Miejski", "ar": "A سيارة صغيرة"}},
    
    # B Segment - Superminis/Small cars
    {"id": "b-hatchback", "name": {"tr": "B Hatchback (Küçük)", "en": "B Hatchback (Small)", "de": "B Kleinwagen", "fr": "B Citadine", "es": "B Compacto", "it": "B Utilitaria", "nl": "B Compact", "pt": "B Hatch", "pl": "B Mały", "ar": "B هاتشباك"}},
    {"id": "b-suv", "name": {"tr": "B SUV (Küçük SUV)", "en": "B SUV (Small SUV)", "de": "B SUV (Klein-SUV)", "fr": "B SUV (Petit SUV)", "es": "B SUV (SUV Pequeño)", "it": "B SUV (SUV Piccolo)", "nl": "B SUV (Kleine SUV)", "pt": "B SUV (SUV Pequeno)", "pl": "B SUV (Mały SUV)", "ar": "B SUV صغير"}},
    {"id": "b-sedan", "name": {"tr": "B Sedan (Küçük Sedan)", "en": "B Sedan (Small Sedan)", "de": "B Limousine", "fr": "B Berline", "es": "B Sedán", "it": "B Berlina", "nl": "B Sedan", "pt": "B Sedã", "pl": "B Sedan", "ar": "B سيدان صغير"}},
    
    # C Segment - Compact/Medium
    {"id": "c-hatchback", "name": {"tr": "C Hatchback (Kompakt)", "en": "C Hatchback (Compact)", "de": "C Kompaktklasse", "fr": "C Compacte", "es": "C Compacto", "it": "C Compatta", "nl": "C Compact", "pt": "C Compacto", "pl": "C Kompakt", "ar": "C هاتشباك متوسط"}},
    {"id": "c-suv", "name": {"tr": "C SUV (Kompakt SUV)", "en": "C SUV (Compact SUV)", "de": "C SUV (Kompakt-SUV)", "fr": "C SUV (SUV Compact)", "es": "C SUV (SUV Compacto)", "it": "C SUV (SUV Compatto)", "nl": "C SUV (Compact SUV)", "pt": "C SUV (SUV Compacto)", "pl": "C SUV (Kompaktowy SUV)", "ar": "C SUV متوسط"}},
    {"id": "c-sedan", "name": {"tr": "C Sedan (Kompakt Sedan)", "en": "C Sedan (Compact Sedan)", "de": "C Limousine", "fr": "C Berline", "es": "C Sedán", "it": "C Berlina", "nl": "C Sedan", "pt": "C Sedã", "pl": "C Sedan", "ar": "C سيدان متوسط"}},
    {"id": "c-wagon", "name": {"tr": "C Station Wagon (Kompakt)", "en": "C Wagon (Compact)", "de": "C Kombi", "fr": "C Break", "es": "C Familiar", "it": "C Station Wagon", "nl": "C Stationwagen", "pt": "C Perua", "pl": "C Kombi", "ar": "C ستيشن واجن"}},
    
    # D Segment - Mid-size/Upper Medium
    {"id": "d-sedan", "name": {"tr": "D Sedan (Orta-Büyük)", "en": "D Sedan (Mid-size)", "de": "D Mittelklasse", "fr": "D Berline", "es": "D Sedán", "it": "D Berlina", "nl": "D Sedan", "pt": "D Sedã", "pl": "D Sedan", "ar": "D سيدان كبير"}},
    {"id": "d-suv", "name": {"tr": "D SUV (Orta SUV)", "en": "D SUV (Mid-size SUV)", "de": "D SUV (Mittelklasse-SUV)", "fr": "D SUV (SUV Familial)", "es": "D SUV (SUV Mediano)", "it": "D SUV (SUV Medio)", "nl": "D SUV (Middelgrote SUV)", "pt": "D SUV (SUV Médio)", "pl": "D SUV (Średni SUV)", "ar": "D SUV متوسط كبير"}},
    {"id": "d-wagon", "name": {"tr": "D Station Wagon", "en": "D Wagon (Mid-size)", "de": "D Kombi", "fr": "D Break", "es": "D Familiar", "it": "D Station Wagon", "nl": "D Stationwagen", "pt": "D Perua", "pl": "D Kombi", "ar": "D ستيشن واجن"}},
    {"id": "d-coupe", "name": {"tr": "D Coupe", "en": "D Coupe", "de": "D Coupé", "fr": "D Coupé", "es": "D Cupé", "it": "D Coupé", "nl": "D Coupé", "pt": "D Cupê", "pl": "D Coupe", "ar": "D كوبيه"}},
    
    # E Segment - Full-size/Executive
    {"id": "e-sedan", "name": {"tr": "E Sedan (Executive)", "en": "E Sedan (Executive)", "de": "E Oberklasse", "fr": "E Berline Executive", "es": "E Sedán Ejecutivo", "it": "E Berlina Executive", "nl": "E Executive Sedan", "pt": "E Sedã Executivo", "pl": "E Sedan Executive", "ar": "E سيدان فاخر"}},
    {"id": "e-suv", "name": {"tr": "E SUV (Büyük SUV)", "en": "E SUV (Large SUV)", "de": "E SUV (Groß-SUV)", "fr": "E SUV (Grand SUV)", "es": "E SUV (SUV Grande)", "it": "E SUV (SUV Grande)", "nl": "E SUV (Grote SUV)", "pt": "E SUV (SUV Grande)", "pl": "E SUV (Duży SUV)", "ar": "E SUV كبير"}},
    {"id": "e-wagon", "name": {"tr": "E Station Wagon (Büyük)", "en": "E Wagon (Full-size)", "de": "E Kombi", "fr": "E Break", "es": "E Familiar", "it": "E Station Wagon", "nl": "E Stationwagen", "pt": "E Perua", "pl": "E Kombi", "ar": "E ستيشن واجن كبير"}},
    {"id": "e-coupe", "name": {"tr": "E Coupe (GT)", "en": "E Coupe (GT)", "de": "E Coupé (GT)", "fr": "E Coupé (GT)", "es": "E Cupé (GT)", "it": "E Coupé (GT)", "nl": "E Coupé (GT)", "pt": "E Cupê (GT)", "pl": "E Coupe (GT)", "ar": "E كوبيه GT"}},
    
    # F Segment - Luxury/Full-size Luxury
    {"id": "f-sedan", "name": {"tr": "F Sedan (Lüks)", "en": "F Sedan (Luxury)", "de": "F Luxusklasse", "fr": "F Berline Luxe", "es": "F Sedán de Lujo", "it": "F Berlina Lusso", "nl": "F Luxe Sedan", "pt": "F Sedã de Luxo", "pl": "F Sedan Luksusowy", "ar": "F سيدان فاخر جداً"}},
    {"id": "f-suv", "name": {"tr": "F SUV (Lüks SUV)", "en": "F SUV (Luxury SUV)", "de": "F SUV (Luxus-SUV)", "fr": "F SUV (SUV Luxe)", "es": "F SUV (SUV de Lujo)", "it": "F SUV (SUV Lusso)", "nl": "F SUV (Luxe SUV)", "pt": "F SUV (SUV de Luxo)", "pl": "F SUV (Luksusowy SUV)", "ar": "F SUV فاخر"}},
    
    # Special Segments
    {"id": "sports-coupe", "name": {"tr": "Spor Coupe", "en": "Sports Coupe", "de": "Sportwagen Coupé", "fr": "Coupé Sportif", "es": "Cupé Deportivo", "it": "Coupé Sportiva", "nl": "Sport Coupé", "pt": "Cupê Esportivo", "pl": "Sportowe Coupe", "ar": "كوبيه رياضي"}},
    {"id": "sports-convertible", "name": {"tr": "Spor Cabrio", "en": "Sports Convertible", "de": "Sportwagen Cabrio", "fr": "Cabriolet Sportif", "es": "Descapotable Deportivo", "it": "Cabriolet Sportiva", "nl": "Sport Cabrio", "pt": "Conversível Esportivo", "pl": "Sportowy Kabriolet", "ar": "مكشوفة رياضية"}},
    {"id": "supercar", "name": {"tr": "Supercar", "en": "Supercar", "de": "Supersportwagen", "fr": "Supercar", "es": "Superdeportivo", "it": "Supercar", "nl": "Supercar", "pt": "Supercarro", "pl": "Supersamochód", "ar": "سوبركار"}},
    {"id": "hypercar", "name": {"tr": "Hypercar", "en": "Hypercar", "de": "Hypercar", "fr": "Hypercar", "es": "Hiperdeportivo", "it": "Hypercar", "nl": "Hypercar", "pt": "Hipercarro", "pl": "Hipersamochód", "ar": "هايبركار"}},
    {"id": "mpv", "name": {"tr": "MPV (Çok Amaçlı)", "en": "MPV (Multi-Purpose)", "de": "Van/MPV", "fr": "Monospace", "es": "Monovolumen", "it": "Monovolume", "nl": "MPV", "pt": "MPV", "pl": "Van/MPV", "ar": "MPV"}},
    {"id": "pickup", "name": {"tr": "Pickup", "en": "Pickup Truck", "de": "Pickup", "fr": "Pick-up", "es": "Pickup", "it": "Pickup", "nl": "Pickup", "pt": "Picape", "pl": "Pickup", "ar": "بيك أب"}},
    {"id": "offroad", "name": {"tr": "Off-Road / 4x4", "en": "Off-Road / 4x4", "de": "Geländewagen", "fr": "Tout-terrain", "es": "Todo terreno", "it": "Fuoristrada", "nl": "Terreinwagen", "pt": "Off-Road", "pl": "Terenowy", "ar": "دفع رباعي"}}
]


@router.get("/brands", response_model=List[BrandResponse])
async def get_brands():
    """Get all brands with their models"""
    return [BrandResponse(**brand) for brand in BRANDS_DATA]


@router.get("/segments", response_model=List[SegmentResponse])
async def get_segments():
    """Get all segments with translations"""
    return [SegmentResponse(id=s["id"], name=SegmentName(**s["name"])) for s in SEGMENTS_DATA]


@router.get("/years")
async def get_years():
    """Get available years (2005-2025)"""
    return list(range(2025, 2004, -1))
