from fastapi import Request, HTTPException
from passlib.context import CryptContext
from bson import ObjectId
from models import users

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_current_user(request: Request):
    username = request.cookies.get("user_session")
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = users.find_one({"name": username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return user
