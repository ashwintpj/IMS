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
    allow_origins=["https://ims-omega-eosin.vercel.app", "http://localhost:3000", "*"],
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
    try:
        update_data = profile.dict()
        update_data["profile_completed"] = True
        if profile.first_name and profile.last_name:
            update_data["full_name"] = f"{profile.first_name} {profile.last_name}"
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        res = supabase.table(TABLE_USERS).update(update_data).eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"message": "Profile updated successfully"}
    except Exception as e:
        print(f"Error updating user profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/containers")
def get_containers():
    # Fetch container definitions
    containers = supabase.table(TABLE_SPECIMEN_CONTAINERS).select("*").execute().data
    # Fetch current inventory stock
    items_res = supabase.table(TABLE_ITEMS).select("name, quantity").execute()
    
    # Map stock by item name
    stock_map = {i["name"]: i["quantity"] for i in items_res.data}
    
    # Attach stock to containers
    for c in containers:
        c["quantity"] = stock_map.get(c["name"], 0) # Use 'quantity' field to match frontend expectation if any, or add new 'stock' field
        
    return containers

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

@app.put("/admin/users/{user_id}/suspend")
def suspend_user(user_id: int):
    # Get user details for logging
    user_res = supabase.table(TABLE_USERS).select("*").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user_res.data[0]
    
    # Update user status to suspended
    res = supabase.table(TABLE_USERS).update({"status": "suspended"}).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the action
    try:
        log_entry = {
            "actor_type": "admin",
            "action": "suspend_user",
            "actor_id": "system",  # Should be from token in real app
            "details": f"Suspended user: {user.get('full_name', 'Unknown')} (ID: {user_id}, Employee ID: {user.get('employee_id', 'N/A')})"
        }
        print(f"Attempting to log: {log_entry}")
        result = supabase.table(TABLE_AUDIT_LOGS).insert(log_entry).execute()
        print(f"Log result: {result}")
    except Exception as e:
        print(f"Failed to log suspend action: {e}")
        # Don't fail the request if logging fails
    
    return {"message": "User suspended successfully"}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int):
    # Get user details for logging
    user_res = supabase.table(TABLE_USERS).select("*").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user_res.data[0]
    
    # Delete the user
    res = supabase.table(TABLE_USERS).delete().eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the action
    try:
        log_entry = {
            "actor_type": "admin",
            "action": "delete_user",
            "actor_id": "system",  # Should be from token in real app
            "details": f"Deleted user: {user.get('full_name', 'Unknown')} (ID: {user_id}, Employee ID: {user.get('employee_id', 'N/A')})"
        }
        print(f"Attempting to log: {log_entry}")
        result = supabase.table(TABLE_AUDIT_LOGS).insert(log_entry).execute()
        print(f"Log result: {result}")
    except Exception as e:
        print(f"Failed to log delete action: {e}")
        # Don't fail the request if logging fails
    
    return {"message": "User deleted successfully"}

@app.put("/admin/users/{user_id}/reactivate")
def reactivate_user(user_id: int):
    # Get user details for logging
    user_res = supabase.table(TABLE_USERS).select("*").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user_res.data[0]
    
    # Update user status to active
    res = supabase.table(TABLE_USERS).update({"status": "active"}).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the action
    try:
        log_entry = {
            "actor_type": "admin",
            "action": "reactivate_user",
            "actor_id": "system",  # Should be from token in real app
            "details": f"Reactivated user: {user.get('full_name', 'Unknown')} (ID: {user_id}, Employee ID: {user.get('employee_id', 'N/A')})"
        }
        print(f"Attempting to log: {log_entry}")
        result = supabase.table(TABLE_AUDIT_LOGS).insert(log_entry).execute()
        print(f"Log result: {result}")
    except Exception as e:
        print(f"Failed to log reactivate action: {e}")
        # Don't fail the request if logging fails
    
    return {"message": "User reactivated successfully"}

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

import time

def deduct_stock_atomic(item_name: str, quantity: int, max_retries: int = 3):
    """
    Atomically deducts stock using optimistic locking (Compare-And-Swap).
    Returns (True, None) on success.
    Returns (False, error_message) on failure.
    """
    for attempt in range(max_retries):
        # 1. Fetch current version
        res = supabase.table(TABLE_ITEMS).select("id, quantity").eq("name", item_name).execute()
        if not res.data:
            return False, f"Item '{item_name}' not found"
        
        item_id = res.data[0]["id"]
        current_qty = res.data[0]["quantity"] or 0
        
        if current_qty < quantity:
            return False, f"Insufficient stock for '{item_name}'. Available: {current_qty}, Requested: {quantity}"
        
        new_qty = current_qty - quantity
        
        # 2. Atomic Update (CAS)
        # Only update if quantity is STILL current_qty
        update_res = supabase.table(TABLE_ITEMS)\
            .update({"quantity": new_qty})\
            .eq("id", item_id)\
            .eq("quantity", current_qty)\
            .execute()
            
        if update_res.data:
            # Success
            return True, None
            
        # If we got here, it means the update failed (matched 0 rows) because quantity changed.
        # Retry loop will continue
        time.sleep(0.05 * (attempt + 1)) # Small backoff
        
    return False, f"Concurrent update detected for '{item_name}'. Please try again."

# -------------------------
# ORDERS
# -------------------------

@app.get("/admin/orders")
def get_orders():
    res = supabase.table(TABLE_ORDERS).select("*").execute()
    return res.data

@app.post("/admin/orders")
def create_order(order: Order):
    # Handle stock deduction for all items
    # Since this is an admin manual entry, usually it's one item, but we support list.
    if order.items:
        for item in order.items:
            i_name = item.get("name")
            i_qty = item.get("quantity", 0)
            if i_name and i_qty > 0:
                success, error = deduct_stock_atomic(i_name, i_qty)
                if not success:
                    # Note: If multiple items were requested and one failed, previous ones are already deducted.
                    raise HTTPException(status_code=400, detail=f"Stock deduction failed: {error}")

    # Proceed with order creation
    try:
        order_data = order.dict()
        order_data["status"] = order.status or "pending"
        order_data["created_at"] = datetime.utcnow().isoformat()
        
        # Backward compatibility for legacy item_name and quantity columns
        if order.items:
            first_item = order.items[0]
            other_count = len(order.items) - 1
            summary = first_item.get("name", "Unknown")
            if other_count > 0:
                summary += f" + {other_count} more"
            order_data["item_name"] = summary
            order_data["quantity"] = sum(i.get("quantity", 0) for i in order.items)

        ins_res = supabase.table(TABLE_ORDERS).insert(order_data).execute()
        
        # Log order creation
        order_id = ins_res.data[0]["id"] if ins_res.data else "unknown"
        
        # Format details string
        details_str = f"Order #{order_id} created."
        if order.items:
            items_str = ", ".join([f"{i.get('name')} x{i.get('quantity')}" for i in order.items])
            details_str += f" Items: {items_str}"

        supabase.table(TABLE_AUDIT_LOGS).insert({
            "actor_type": "admin",
            "actor_id": "system",
            "action": "order_created",
            "details": details_str
        }).execute()

        return {"message": "Order created and stock updated"}
    except Exception as e:
        print(f"Error creating order after stock deduction: {e}")
        raise HTTPException(status_code=500, detail="Order creation failed, but stock was deducted. Please contact support.")

@app.put("/admin/orders/{order_id}/status")
def update_order_status(order_id: int, status: str):
    res = supabase.table(TABLE_ORDERS).select("*").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    order = res.data[0]

    # Automated Rider Assignment on Dispatch
    if status == "out_for_delivery":
        # Find first available rider
        rider_res = supabase.table(TABLE_DELIVERY_PERSONNEL).select("*").eq("status", "available").limit(1).execute()
        if not rider_res.data:
             raise HTTPException(status_code=400, detail="No riders currently available")
        
        rider = rider_res.data[0]

        # REDUCE INVENTORY FIRST (Atomically)
        items = order.get("items") or [{"name": order.get("item_name"), "quantity": order.get("quantity")}]
        
        # Process deductions
        deducted_items = []
        for it in items:
            name = it.get("name")
            qty = it.get("quantity")
            if name and qty:
                success, error = deduct_stock_atomic(name, qty)
                if not success:
                    # Partial failure handling:
                    # In a real system, we'd need to re-add stock for `deducted_items` if multiple.
                    # Given simpler requirements, we raise error.
                    raise HTTPException(status_code=400, detail=f"Failed to dispatch: {error}")
                deducted_items.append((name, qty))
        
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
        try:
            supabase.table(TABLE_ORDERS).update({"status": status}).eq("id", order_id).execute()
            
            rider_name = order.get("assigned_rider", "Unknown")
            rider_id = order.get("rider_id")
            
            if rider_id:
                # remove int() cast as it might be UUID or string
                supabase.table(TABLE_DELIVERY_PERSONNEL).update({"status": "available"}).eq("id", rider_id).execute()
            
            # Log order completion
            supabase.table(TABLE_AUDIT_LOGS).insert({
                "actor_type": "admin",
                "actor_id": "system",
                "action": "order_completed",
                "details": f"Order #{order_id} completed. Delivered by: {rider_name}"
            }).execute()


            timestamp_str = datetime.utcnow().isoformat()
            
            # Use 'items' list if available to respect Foreign Key constraints on item_name
            items_list = order.get("items")
            
            if items_list and isinstance(items_list, list) and len(items_list) > 0:
                dist_entries = []
                for item in items_list:
                    item_name_single = item.get("name")
                    # Skip if item name is invalid or empty
                    if not item_name_single: 
                        continue
                        
                    dist_entries.append({
                        "item_name": item_name_single,
                        "quantity": item.get("quantity", 0),
                        "destination": order.get("department", "Unknown"),
                        "delivered_by": rider_name,
                        "notes": f"Order #{order_id} (Multi-item) - Ordered by: {order.get('ordered_by', 'Unknown')} - Time: {timestamp_str}"
                    })
                if dist_entries:
                    supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(dist_entries).execute()
            else:
                # Fallback for legacy single-item orders
                dist_data = {
                    "item_name": order.get("item_name", "Unknown"),
                    "quantity": order.get("quantity", 0),
                    "destination": order.get("department", "Unknown"),
                    "delivered_by": rider_name,
                    "notes": f"Order #{order_id} - Ordered by: {order.get('ordered_by', 'Unknown')} - Time: {timestamp_str}"
                }
                supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(dist_data).execute()
            
            return {"message": "Order completed and rider released"}
        except Exception as e:
            print(f"Error completing order {order_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Error completing order: {str(e)}")

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
                
                # Return stock (This is an addition so it doesn't need to be atomic deduction, but simple update is fine or atomic addition)
                # For safety, we can just do simple update as returning stock is less critical for race conditions (it increases stock)
                # But to follow "Optimistic" pattern we technically could, but here we just read-modify-write.
                # Since multiple cancels for same order won't happen (status check), this is likely safe.
                
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
@app.post("/admin/distributions")
def record_distribution(dist: Distribution):
    # ATOMIC DEDUCTION FIRST
    success, error = deduct_stock_atomic(dist.item_name, dist.quantity)
    if not success:
        raise HTTPException(status_code=400, detail=error)
        
    # NOTE: 'ordered_by' and 'timestamp' might be missing in DB schema.
    data = dist.dict()
    ordered_by = data.pop("ordered_by", "Unknown")
    timestamp = data.pop("timestamp", None) # Remove timestamp if present
    
    extra_info = f"Ordered by: {ordered_by}"
    if timestamp:
        extra_info += f", Time: {timestamp}"

    # Append to notes if notes exists, else create it
    if "notes" in data and data["notes"]:
        data["notes"] += f" ({extra_info})"
    else:
        data["notes"] = extra_info

    supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(data).execute()
    
    supabase.table(TABLE_AUDIT_LOGS).insert({
        "actor_type": "admin",
        "action": "distribution",
        "actor_id": "system",
        "details": f"{dist.quantity} of {dist.item_name} to {dist.destination}"
    }).execute()
    
    return {"message": "Distribution recorded"}

# -------------------------
# ANALYTICS
# -------------------------

@app.get("/admin/analytics")
def get_analytics():
    try:
        # Fetch all orders that are meaningful for analytics (completed, dispatched, delivered)
        # We also include 'pending' maybe? User asked for USAGE. 
        # Typically usage = dispatched/completed. 
        # But for trends, maybe all requests?
        # Let's stick to 'out_for_delivery' and 'completed' and 'delivered' as confirmed usage.
        # Although 'pending' is demand.
        # Let's fetch all non-cancelled/rejected orders.
        res = supabase.table(TABLE_ORDERS).select("*").neq("status", "cancelled").neq("status", "rejected").execute()
        orders = res.data
        
        # Aggregate Data
        usage_by_ward = {} # { Ward: { Item: Qty } }
        daily_trends = {}  # { Date: { Item: Qty } }
        
        for order in orders:
            # Use 'department' or 'ward' column if exists. Order model has 'department'.
            ward = order.get("department") or order.get("ward") or "Unknown"
            item = order.get("item_name") or "Unknown"
            qty = order.get("quantity") or 0
            
            # Parse timestamp (created_at)
            ts = order.get("created_at")
            date = ts[:10] if ts else "Unknown"
            
            # Aggregate by Ward
            if ward not in usage_by_ward: usage_by_ward[ward] = {}
            usage_by_ward[ward][item] = usage_by_ward[ward].get(item, 0) + qty
            
            # Aggregate by Day
            if date not in daily_trends: daily_trends[date] = {}
            daily_trends[date][item] = daily_trends[date].get(item, 0) + qty
            
        return {
            "usage_by_ward": usage_by_ward,
            "daily_trends": daily_trends
        }
    except Exception as e:
        print(f"Analytics Error: {e}")
        return {"usage_by_ward": {}, "daily_trends": {}}

# -------------------------
# AUDIT LOGS
# -------------------------

@app.get("/admin/logs")
def get_logs():
    res = supabase.table(TABLE_AUDIT_LOGS).select("*").order("timestamp", desc=True).execute()
    logs = res.data

    # Fetch users and admins for mapping names
    try:
        users_res = supabase.table(TABLE_USERS).select("id, first_name, last_name, full_name").execute()
        admins_res = supabase.table(TABLE_ADMINS).select("id, first_name, last_name").execute()
        
        users_map = {str(u["id"]): u.get("full_name") or f"{u.get('first_name','')} {u.get('last_name','')}".strip() for u in users_res.data}
        admins_map = {str(a["id"]): f"{a.get('first_name','')} {a.get('last_name','')}".strip() for a in admins_res.data}

        for log in logs:
            actor_id = str(log.get("actor_id"))
            actor_type = log.get("actor_type")
            
            if actor_type == "user":
                log["actor_name"] = users_map.get(actor_id, "Unknown User")
            elif actor_type == "admin":
                if actor_id == "system":
                    log["actor_name"] = "System"
                else:
                    log["actor_name"] = admins_map.get(actor_id, "Unknown Admin")
            else:
                log["actor_name"] = actor_id
                
    except Exception as e:
        print(f"Error enriching logs: {e}")
        # If error (e.g. table missing), return logs as is
        pass
        
    return logs

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
    print(f"DEBUG: Received Order Payload: {order.dict()}")
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
    # Sanitize ordered_by_id to avoid UUID error if empty string
    if order_dict.get("ordered_by_id") == "":
        order_dict["ordered_by_id"] = None

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
