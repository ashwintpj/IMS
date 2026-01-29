from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from auth import get_current_user
from models import users

router = APIRouter()
templates = Jinja2Templates(directory="../User_frontend/templates")

@router.get("/profile", response_class=HTMLResponse)
def profile_page(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("profile.html", {"request": request, "user": user})

@router.post("/profile")
def save_profile(request: Request, full_name: str = Form(...), department: str = Form(...), ward: str = Form(...)):
    user = get_current_user(request)
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"full_name": full_name, "department": department, "ward": ward, "profile_completed": True}}
    )
    return RedirectResponse("/user/order", status_code=302)

# View profile
@router.get("/view_profile", response_class=HTMLResponse)
def view_profile(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("view_profile.html", {"request": request, "user": user})

# Edit profile
@router.get("/profile/edit", response_class=HTMLResponse)
def edit_profile(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("edit_profile.html", {"request": request, "user": user})

@router.post("/profile/edit")
def update_profile(request: Request, full_name: str = Form(...), department: str = Form(...), ward: str = Form(...)):
    user = get_current_user(request)
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"full_name": full_name, "department": department, "ward": ward}}
    )
    return RedirectResponse("/user/view_profile", status_code=302)
