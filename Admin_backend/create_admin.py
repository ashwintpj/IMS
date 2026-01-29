from passlib.context import CryptContext
from pymongo import MongoClient
from datetime import datetime

# Password hashing (MUST match admin backend)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client["Admin_db"]
users = db["users"]

# Admin credentials
username = "admin1"
password = "Admin@123"   

# Check if admin already exists
if users.find_one({"name": username}):
    print("Admin already exists")
else:
    users.insert_one({
        "name": username,
        "password": pwd_context.hash(password),
        "role": "admin",
        "created_at": datetime.utcnow()
    })
    print("Admin created successfully")
