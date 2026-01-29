from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from auth import get_current_user
from models import specimen_containers, orders
from bson import ObjectId
from datetime import datetime

router = APIRouter()
templates = Jinja2Templates(directory="../User_frontend/templates")

@router.get("/order", response_class=HTMLResponse)
def order_page(request: Request):
    user = get_current_user(request)
    if not user.get("profile_completed"):
        return RedirectResponse("/user/profile", status_code=302)
    
    items = list(specimen_containers.find({}, {"_id":1,"name":1,"barcode_number":1,"barcode_image":1}))
    for item in items:
        item["_id"] = str(item["_id"])
    
    return templates.TemplateResponse("order.html", {"request": request, "user": user, "items": items})

@router.post("/order")
async def submit_order(request: Request, item_ids: list = Form(default=[])):
    user = get_current_user(request)
    if not user.get("profile_completed"):
        raise HTTPException(status_code=400, detail="Complete profile first")

    form_data = await request.form()
    item_list = item_ids if isinstance(item_ids, list) else [item_ids]

    order_items = []
    for item_id in item_list:
        qty_key = f"qty_{item_id}"
        if qty_key in form_data:
            quantity = int(form_data[qty_key])
            if quantity > 0:
                container = specimen_containers.find_one({"_id": ObjectId(item_id)}, {"name":1})
                order_items.append({
                    "item_id": ObjectId(item_id),
                    "name": container["name"],
                    "quantity": quantity
                })

    if not order_items:
        raise HTTPException(status_code=400, detail="No items selected")

    orders.insert_one({
        "user_id": user["_id"],
        "username": user["name"],
        "ward": user["ward"],
        "department": user["department"],
        "items": order_items,
        "status": "pending",
        "created_at": datetime.utcnow()
    })
    return HTMLResponse("<h2>Order submitted successfully!</h2>")

@router.get("/history", response_class=HTMLResponse)
def order_history(request: Request):
    user = get_current_user(request)
    user_orders = list(orders.find({"user_id": user["_id"]}).sort("created_at",-1))
    return templates.TemplateResponse("order_history.html", {"request": request, "orders": user_orders})
