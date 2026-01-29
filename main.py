# main.py (repo root)

import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from User_backend.routes import user_routes, order_routes, profile_routes
from pymongo import MongoClient

# -----------------------------
# MongoDB connection
# -----------------------------
MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable not set")

client = MongoClient(MONGODB_URI)
db = client.get_database()  # default DB or specify name here

# -----------------------------
# Create FastAPI app
# -----------------------------
app = FastAPI()

# -----------------------------
# Mount static files
# -----------------------------
# Assuming User_backend/static/ is now inside repo root
app.mount("/static", StaticFiles(directory="User_backend/static"), name="static")

# -----------------------------
# Include routers with proper prefixes
# -----------------------------
app.include_router(user_routes.router, prefix="/user")
app.include_router(order_routes.router, prefix="/order")
app.include_router(profile_routes.router, prefix="/profile")

# -----------------------------
# Optional root endpoint
# -----------------------------
@app.get("/")
def root():
    return {"message": "FastAPI app deployed successfully!"}
