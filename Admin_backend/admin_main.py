from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext
from pymongo import MongoClient

# --- MongoDB Setup ---
client = MongoClient("mongodb://localhost:27017")
db = client["Admin_db"]
users = db["users"]

# --- Password hashing ---
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# --- FastAPI and templates ---
app = FastAPI()
templates = Jinja2Templates(directory="../Admin_frontend")

# ----------ADMIN LOGIN----------
@app.get("/admin/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )

@app.post("/admin/login")
def login_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    user = users.find_one({"name": username})

    if not user or not pwd_context.verify(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: not an admin")

    return HTMLResponse(f"<h2>Welcome Admin {username}, login successful!</h2>")

# ----------ADMIN HOME----------
@app.get("/admin", response_class=HTMLResponse)
def home_page():
    return HTMLResponse("<h2>Admin Portal</h2>")
