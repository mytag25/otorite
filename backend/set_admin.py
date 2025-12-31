import json
from passlib.context import CryptContext
from datetime import datetime
import uuid

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

db_path = "local_db.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

admin_email = "admin@otorite.com"
admin_password = "admin"

# Check if already exists
exists = False
for user in db.get("users", []):
    if user["email"] == admin_email:
        user["password_hash"] = pwd_context.hash(admin_password)
        user["isAdmin"] = True
        exists = True
        break

if not exists:
    new_admin = {
        "id": str(uuid.uuid4()),
        "name": "Otorite Admin",
        "email": admin_email,
        "password_hash": pwd_context.hash(admin_password),
        "isAdmin": True,
        "favorites": [],
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
        "_id": str(datetime.now().timestamp())
    }
    if "users" not in db:
        db["users"] = []
    db["users"].append(new_admin)

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, default=str)

print(f"Admin account set: {admin_email} / {admin_password}")
