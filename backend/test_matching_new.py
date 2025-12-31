
import asyncio
import difflib
import re

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

async def find_vehicle_in_db_test(brand: str, model: str, vehicles_list: list):
    brand_clean = brand.lower().strip()
    model_clean = model.lower().strip()
    
    # 1. Direct Slug Match
    target_slug = slugify(f"{brand} {model}")
    for v in vehicles_list:
        if v.get("slug") == target_slug:
            return v, 1.0, "Exact Slug"
    
    # Helper to clean model
    GENERIC_TERMS = {"model", "series", "class", "generation", "long", "range", "performance", "awd", "rwd", "fwd", "phev", "hybrid", "electric", "ev"}
    def get_core_model_tokens(m_str):
        raw_tokens = re.split(r'[^a-zA-Z0-9]+', m_str.lower())
        tokens = [t for t in raw_tokens if t and t not in GENERIC_TERMS]
        return tokens

    core_tokens = get_core_model_tokens(model_clean)
    
    brand_regex = f"^{brand_clean.split('-')[0].split(' ')[0]}$"
    candidates = [v for v in vehicles_list if re.search(brand_regex, v.get("brand", "").lower())]
    
    if not candidates:
        return None, 0.0, "No Brand Match"

    best_v = None
    max_score = 0.0
    
    for v in candidates:
        db_model = v.get("model", "").lower()
        db_tokens = get_core_model_tokens(db_model)
        
        score = difflib.SequenceMatcher(None, model_clean, db_model).ratio()
        
        token_match_count = 0
        for ct in core_tokens:
            if any(ct == dt or (len(ct) == 1 and dt.startswith(ct)) or (len(dt) == 1 and ct.startswith(dt)) for dt in db_tokens):
                token_match_count += 1
        
        series_boost = 0
        if (("series" in db_model or "class" in db_model) and 
            model_clean and db_model and model_clean[0] == db_model[0]):
            series_boost = 0.5
            
        token_score = token_match_count / max(len(core_tokens), 1)
        
        final_score = (score * 0.3) + (token_score * 0.4) + (series_boost * 0.3)
        
        if final_score > max_score:
            max_score = final_score
            best_v = v
            
    if max_score >= 0.55:
        return best_v, max_score, "Fuzzy Match"
                
    return None, max_score, "Threshold Fail"

async def run_tests():
    import json
    import os
    
    db_path = r'c:\Users\PC\Desktop\yedek\backend\local_db.json'
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        vehicles = data.get("vehicles", [])

    test_cases = [
        ("Tesla", "Model Y", False), # Error case: Should NOT match Model 3
        ("Tesla", "Model 3", True),  
        ("BMW", "320i", True),      # Should match 3 Series
        ("BMW", "3 Series", True),   
        ("Mercedes", "C200", True),  # Should match C-Class
        ("Mercedes", "E-Class", False), 
    ]

    print("\n--- FINAL CORE MATCHING TESTS ---\n")
    all_passed = True
    for brand, model, should_match in test_cases:
        match, score, method = await find_vehicle_in_db_test(brand, model, vehicles)
        result_found = match is not None
        id_str = f"{match.get('brand')} {match.get('model')}" if result_found else "None"
        
        status = "✅ PASS" if result_found == should_match else "❌ FAIL"
        if result_found != should_match: all_passed = False
        
        print(f"{status} | Input: {brand} {model: <10} | Found: {id_str: <15} | Score: {score:.2f} | {method}")

    if all_passed:
        print("\n🚀 ALL TESTS PASSED! Vehicle matching is now precise and robust.")
    else:
        print("\n⚠️ SOME TESTS FAILED.")

if __name__ == "__main__":
    asyncio.run(run_tests())
