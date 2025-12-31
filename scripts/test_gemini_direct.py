import os
import requests
import json
from pathlib import Path

# 1. Load API Key
env_path = Path("backend/.env")
api_key = None
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("GEMINI_API_KEY="):
                api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not api_key:
    # Try alternate path
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
             for line in f:
                if line.strip().startswith("GEMINI_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

if not api_key:
    print("❌ ERROR: Could not find GEMINI_API_KEY in backend/.env or .env")
    exit(1)

print(f"🔑 API Key found (starts with: {api_key[:4]}...)")

# 2. Test Function
def test_model(model_name):
    print(f"\nTesting Model: {model_name}...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": "Hello, are you working?"}]
        }]
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ SUCCESS! {model_name} is working.")
            print(f"Response: {response.json()['candidates'][0]['content']['parts'][0]['text'][:50]}...")
        else:
            print(f"❌ FAILURE! Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

# 3. specific models
test_model("gemini-1.5-flash")
test_model("gemini-3-flash")
