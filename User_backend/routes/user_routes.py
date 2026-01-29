from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from auth import pwd_context
from models import users
from datetime import datetime

router = APIRouter()
templates = Jinja2Templates(directory="../User_frontend/templates")

# Register
@router.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
def register_user(username: str = Form(...), password: str = Form(...)):
    if users.find_one({"name": username}):
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = pwd_context.hash(password)
    users.insert_one({
        "name": username,
        "password": hashed_password,
        "role": "user",
        "created_at": datetime.utcnow(),
        "profile_completed": False
    })
    return RedirectResponse("/user/login", status_code=302)


# Login
@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
def login_user(username: str = Form(...), password: str = Form(...)):
    user = users.find_one({"name": username})
    if not user or not pwd_context.verify(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Access denied")
    
    response = RedirectResponse("/user/profile", status_code=302)
    response.set_cookie(key="user_session", value=username, httponly=True)
    return response
