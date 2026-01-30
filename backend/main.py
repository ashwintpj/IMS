from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from database import (
    supabase,
    TABLE_USERS, TABLE_ADMINS, TABLE_ITEMS, TABLE_ORDERS,
    TABLE_CANCEL_REQUESTS, TABLE_DELIVERY_PERSONNEL,
    TABLE_DISTRIBUTION_HISTORY, TABLE_AUDIT_LOGS, TABLE_SPECIMEN_CONTAINERS
)
from models import (
    LoginRequest, UserCreate, AdminCreate, AdminProfileUpdate,
    UserProfileUpdate, SpecimenContainer, Item, Order,
    CancelRequest, DeliveryPerson, Distribution
)
from auth import hash_password, verify_password, create_access_token

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# AUTH ENDPOINTS
# -------------------------

@app.post("/create-user")
def create_user(user: UserCreate):
    # Check if user exists
    existing = supabase.table(TABLE_USERS).select("*").eq("employee_id", user.employee_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")

    data = {
        "employee_id": user.employee_id,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "role": user.role,
        "status": "pending",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}",
        "profile_completed": False
    }
    supabase.table(TABLE_USERS).insert(data).execute()
    return {"message": "User created successfully"}

@app.get("/user/profile/{user_id}")
def get_user_profile(user_id: str):
    res = supabase.table(TABLE_USERS).select("*").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = res.data[0]
    if "password_hash" in user: del user["password_hash"]
    return user

@app.put("/user/profile/{user_id}")
def update_user_profile(user_id: str, profile: UserProfileUpdate):
    update_data = profile.dict()
    update_data["profile_completed"] = True
    if profile.first_name and profile.last_name:
        update_data["full_name"] = f"{profile.first_name} {profile.last_name}"
    
    res = supabase.table(TABLE_USERS).update(update_data).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated successfully"}

@app.get("/user/containers")
def get_containers():
    res = supabase.table(TABLE_SPECIMEN_CONTAINERS).select("*").execute()
    return res.data

@app.post("/create-admin")
def create_admin(admin: AdminCreate):
    existing = supabase.table(TABLE_ADMINS).select("*").eq("email", admin.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Admin already exists")

    data = {
        "email": admin.email,
        "password_hash": hash_password(admin.password),
        "role": admin.role,
        "first_name": admin.first_name,
        "last_name": admin.last_name
    }
    supabase.table(TABLE_ADMINS).insert(data).execute()
    return {"message": "Admin created successfully"}

@app.post("/login/user")
def login_user(data: LoginRequest):
    res = supabase.table(TABLE_USERS).select("*").eq("email", data.email).execute()
    if not res.data or not verify_password(data.password, res.data[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = res.data[0]
    if user["status"] != "active":
        raise HTTPException(status_code=403, detail="Account pending approval")

    token = create_access_token({
        "sub": str(user["id"]),
        "type": "user",
        "role": user["role"]
    })

    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "user",
        "actor_id": str(user["id"]),
        "action": "login"
    }).execute()

    return {"access_token": token, "token_type": "bearer"}

@app.post("/login/admin")
def login_admin(data: LoginRequest):
    res = supabase.table(TABLE_ADMINS).select("*").eq("email", data.email).execute()
    if not res.data or not verify_password(data.password, res.data[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    admin = res.data[0]
    token = create_access_token({
        "sub": str(admin["id"]),
        "type": "admin",
        "role": admin["role"]
    })

    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "admin",
        "actor_id": str(admin["id"]),
        "action": "login"
    }).execute()

    return {"access_token": token, "token_type": "bearer"}

# -------------------------
# ADMIN PROFILE
# -------------------------

@app.get("/admin/profile/{admin_id}")
def get_admin_profile(admin_id: int):
    res = supabase.table(TABLE_ADMINS).select("*").eq("id", admin_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Admin not found")
    admin = res.data[0]
    del admin["password_hash"]
    return admin

@app.put("/admin/profile/{admin_id}")
def update_admin_profile(admin_id: int, profile: AdminProfileUpdate):
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    supabase.table(TABLE_ADMINS).update(update_data).eq("id", admin_id).execute()
    return {"message": "Profile updated successfully"}

# -------------------------
# USER MANAGEMENT & APPROVALS
# -------------------------

@app.get("/admin/users")
def get_users():
    res = supabase.table(TABLE_USERS).select("*").execute()
    users = res.data
    for u in users:
        if "password_hash" in u: del u["password_hash"]
    return users

@app.get("/admin/pending-users")
def get_pending_users():
    res = supabase.table(TABLE_USERS).select("*").eq("status", "pending").execute()
    users = res.data
    for u in users:
        if "password_hash" in u: del u["password_hash"]
    return users

@app.put("/admin/approve-user/{user_id}")
def approve_user(user_id: int):
    res = supabase.table(TABLE_USERS).update({"status": "active"}).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "admin",
        "action": "approved_user",
        "actor_id": "system", # Should be from token in real app
        "details": f"Approved user ID: {user_id}"
    }).execute()
    return {"message": "User approved"}

@app.put("/admin/reject-user/{user_id}")
def reject_user(user_id: int):
    res = supabase.table(TABLE_USERS).update({"status": "rejected"}).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User rejected"}

# -------------------------
# INVENTORY / STOCK
# -------------------------

@app.get("/admin/inventory")
def get_inventory():
    res = supabase.table(TABLE_ITEMS).select("*").execute()
    return res.data

@app.post("/admin/inventory")
def add_item(item: Item):
    supabase.table(TABLE_ITEMS).insert(item.dict()).execute()
    return {"message": "Item added successfully"}

@app.put("/admin/inventory/{item_id}/restock")
def restock_item(item_id: int, quantity: int):
    # Get current quantity
    res = supabase.table(TABLE_ITEMS).select("quantity").eq("id", item_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    
    current_qty = res.data[0]["quantity"] or 0
    new_qty = current_qty + quantity
    
    supabase.table(TABLE_ITEMS).update({"quantity": new_qty}).eq("id", item_id).execute()
    return {"message": f"Restocked successfully. New quantity: {new_qty}"}

# -------------------------
# ORDERS
# -------------------------

@app.get("/admin/orders")
def get_orders():
    res = supabase.table(TABLE_ORDERS).select("*").execute()
    return res.data

@app.post("/admin/orders")
def create_order(order: Order):
    # Check current stock
    res = supabase.table(TABLE_ITEMS).select("*").eq("name", order.item_name).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Item '{order.item_name}' not found")
    
    item = res.data[0]
    if item["quantity"] < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # Proceed with order
    order_data = order.dict()
    ins_res = supabase.table(TABLE_ORDERS).insert(order_data).execute()

    # Deduct stock
    new_qty = item["quantity"] - order.quantity
    supabase.table(TABLE_ITEMS).update({"quantity": new_qty}).eq("name", order.item_name).execute()

    # Log order creation
    order_id = ins_res.data[0]["id"] if ins_res.data else "unknown"
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "admin",
        "actor_id": "system",
        "action": "order_created",
        "details": f"Order #{order_id} created. Item: {order.item_name}, Qty: {order.quantity}"
    }).execute()

    return {"message": "Order created and stock updated"}

@app.put("/admin/orders/{order_id}/status")
def update_order_status(order_id: int, status: str):
    res = supabase.table(TABLE_ORDERS).select("*").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    order = res.data[0]

    # Automated Rider Assignment on Dispatch
    if status == "out_for_delivery":
        # REDUCE INVENTORY FIRST
        items = order.get("items") or [{"name": order.get("item_name"), "quantity": order.get("quantity")}]
        for it in items:
            name = it.get("name")
            qty = it.get("quantity")
            if name and qty:
                stock_res = supabase.table(TABLE_ITEMS).select("id, quantity").eq("name", name).execute()
                if stock_res.data:
                    item_id = stock_res.data[0]["id"]
                    current_qty = stock_res.data[0]["quantity"]
                    new_qty = current_qty - qty
                    supabase.table(TABLE_ITEMS).update({"quantity": new_qty}).eq("id", item_id).execute()

        # Find first available rider
        rider_res = supabase.table(TABLE_DELIVERY_PERSONNEL).select("*").eq("status", "available").limit(1).execute()
        if not rider_res.data:
            raise HTTPException(status_code=400, detail="No riders currently available")
        
        rider = rider_res.data[0]
        
        # Update order with rider info
        supabase.table(TABLE_ORDERS).update({
            "status": status,
            "assigned_rider": rider["name"],
            "rider_id": str(rider["id"])
        }).eq("id", order_id).execute()
        
        # Update rider status
        supabase.table(TABLE_DELIVERY_PERSONNEL).update({"status": "on_delivery"}).eq("id", rider["id"]).execute()
        
        # LOG THE DISPATCH
        supabase.table(TABLE_AUDIT_LOGS).insert({
            "actor_type": "admin",
            "actor_id": "system",
            "action": "order_dispatched",
            "details": f"Order #{order_id} dispatched. Delivered by: {rider['name']}"
        }).execute()
        
        return {"message": f"Order dispatched and assigned to {rider['name']}"}

    # Release Rider on Completion
    elif status == "completed":
        supabase.table(TABLE_ORDERS).update({"status": status}).eq("id", order_id).execute()
        
        rider_name = order.get("assigned_rider", "Unknown")
        if order.get("rider_id"):
            supabase.table(TABLE_DELIVERY_PERSONNEL).update({"status": "available"}).eq("id", int(order["rider_id"])).execute()
        
        # Log order completion
        supabase.table(TABLE_AUDIT_LOGS).insert({
            "actor_type": "admin",
            "actor_id": "system",
            "action": "order_completed",
            "details": f"Order #{order_id} completed. Delivered by: {rider_name}"
        }).execute()

        # Record in Distribution History
        dist_data = {
            "item_name": order.get("item_name", "Unknown"),
            "quantity": order.get("quantity", 0),
            "destination": order.get("department", "Unknown"),
            "delivered_by": rider_name,
            "ordered_by": order.get("ordered_by", "Unknown"),
            "timestamp": datetime.utcnow().isoformat(),
            "notes": f"Order #{order_id}"
        }
        supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(dist_data).execute()
        
        return {"message": "Order completed and rider released"}

    else:
        supabase.table(TABLE_ORDERS).update({"status": status}).eq("id", order_id).execute()
        return {"message": f"Order status updated to {status}"}

# -------------------------
# CANCEL REQUESTS
# -------------------------

@app.get("/admin/cancel-requests")
def get_cancel_requests():
    res = supabase.table(TABLE_CANCEL_REQUESTS).select("*").execute()
    return res.data

@app.post("/admin/cancel-requests")
def create_cancel_request(req: CancelRequest):
    supabase.table(TABLE_CANCEL_REQUESTS).insert(req.dict()).execute()
    return {"message": "Cancel request submitted"}

@app.put("/admin/cancel-requests/{request_id}")
def handle_cancel_request(request_id: int, action: str):
    if action not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    supabase.table(TABLE_CANCEL_REQUESTS).update({"status": action}).eq("id", request_id).execute()
    
    if action == "approved":
        req_res = supabase.table(TABLE_CANCEL_REQUESTS).select("*").eq("id", request_id).execute()
        if req_res.data:
            req = req_res.data[0]
            order_id = req["order_id"]
            order_res = supabase.table(TABLE_ORDERS).select("*").eq("id", order_id).execute()
            
            if order_res.data:
                order = order_res.data[0]
                # Update order status
                supabase.table(TABLE_ORDERS).update({"status": "cancelled"}).eq("id", order_id).execute()
                
                # Return stock
                item_res = supabase.table(TABLE_ITEMS).select("quantity").eq("name", order["item_name"]).execute()
                if item_res.data:
                    current_qty = item_res.data[0]["quantity"]
                    supabase.table(TABLE_ITEMS).update({"quantity": current_qty + order["quantity"]}).eq("name", order["item_name"]).execute()
    
    return {"message": f"Request {action} and stock handled"}

# -------------------------
# DELIVERY PERSONNEL
# -------------------------

@app.get("/admin/delivery-personnel")
def get_delivery_personnel():
    res = supabase.table(TABLE_DELIVERY_PERSONNEL).select("*").execute()
    return res.data

@app.post("/admin/delivery-personnel")
def add_delivery_person(person: DeliveryPerson):
    supabase.table(TABLE_DELIVERY_PERSONNEL).insert(person.dict()).execute()
    return {"message": "Delivery person added"}

@app.put("/admin/delivery-personnel/{person_id}/status")
def update_delivery_status(person_id: int, status: str):
    supabase.table(TABLE_DELIVERY_PERSONNEL).update({"status": status}).eq("id", person_id).execute()
    return {"message": "Status updated"}

# -------------------------
# DISTRIBUTION HISTORY
# -------------------------

@app.get("/admin/distributions")
def get_distributions():
    res = supabase.table(TABLE_DISTRIBUTION_HISTORY).select("*").execute()
    return res.data

@app.post("/admin/distributions")
def record_distribution(dist: Distribution):
    supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(dist.dict()).execute()
    
    # Reduce stock
    item_res = supabase.table(TABLE_ITEMS).select("quantity").eq("name", dist.item_name).execute()
    if item_res.data:
        current_qty = item_res.data[0]["quantity"]
        supabase.table(TABLE_ITEMS).update({"quantity": current_qty - dist.quantity}).eq("name", dist.item_name).execute()
    
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "admin",
        "action": "distribution",
        "actor_id": "system",
        "details": f"{dist.quantity} of {dist.item_name} to {dist.destination}"
    }).execute()
    
    return {"message": "Distribution recorded"}

# -------------------------
# AUDIT LOGS
# -------------------------

@app.get("/admin/logs")
def get_logs():
    res = supabase.table(TABLE_AUDIT_LOGS).select("*").order("timestamp", desc=True).execute()
    return res.data

# -------------------------
# USER / WARD ENDPOINTS
# -------------------------

@app.get("/user/inventory")
def get_user_inventory():
    res = supabase.table(TABLE_ITEMS).select("*").execute()
    return res.data

@app.get("/user/requests/{user_id}")
def get_user_requests(user_id: str):
    res = supabase.table(TABLE_ORDERS).select("*").eq("ordered_by_id", user_id).execute()
    return res.data

@app.post("/user/requests")
def create_user_request(order: Order):
    # CHECK STOCK AVAILABILITY FIRST
    if order.items:
        for item in order.items:
            name = item.get("name")
            requested_qty = item.get("quantity", 0)
            if name and requested_qty > 0:
                stock_res = supabase.table(TABLE_ITEMS).select("quantity").eq("name", name).execute()
                if stock_res.data:
                    available = stock_res.data[0]["quantity"] or 0
                    if requested_qty > available:
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Insufficient stock for '{name}'. Requested: {requested_qty}, Available: {available}"
                        )

    # Proceed with order
    order_dict = order.dict()
    order_dict["status"] = "pending"
    order_dict["created_at"] = datetime.utcnow().isoformat()

    # Backward compatibility for legacy item_name and quantity columns
    if order.items:
        first_item = order.items[0]
        other_count = len(order.items) - 1
        summary = first_item.get("name", "Unknown")
        if other_count > 0:
            summary += f" + {other_count} more"
        order_dict["item_name"] = summary
        order_dict["quantity"] = sum(i.get("quantity", 0) for i in order.items)
    
    ins_res = supabase.table(TABLE_ORDERS).insert(order_dict).execute()
    
    # Log the request
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "user",
        "actor_id": order_dict.get("ordered_by_id", "unknown"),
        "action": "created_request",
        "details": f"Multi-item order: {len(order.items)} items, Urgency: {order.urgency}"
    }).execute()
    
    return {"message": "Request submitted successfully", "id": str(ins_res.data[0]["id"] if ins_res.data else "unknown")}

@app.post("/user/requests/{order_id}/cancel")
def cancel_user_request(order_id: int):
    # Fetch order to check status
    res = supabase.table(TABLE_ORDERS).select("*").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = res.data[0]
    if order["status"] != "pending":
        raise HTTPException(status_code=400, detail="Cannot cancel order that is not pending")
    
    # Update status to cancelled
    supabase.table(TABLE_ORDERS).update({"status": "cancelled"}).eq("id", order_id).execute()
    
    # Log the cancellation
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "user",
        "actor_id": order.get("ordered_by_id", "unknown"),
        "action": "cancelled_request",
        "details": f"Order ID: {order_id} cancelled by user"
    }).execute()
    
    return {"message": "Request cancelled successfully"}
