"""
Seed script to populate database with sample data for testing in Supabase.
Run: python backend/seed_data.py
"""

from datetime import datetime, timedelta
import random
import sys
import os

# Add the current directory to sys.path to import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    supabase,
    TABLE_USERS, TABLE_ADMINS, TABLE_ITEMS, TABLE_ORDERS,
    TABLE_CANCEL_REQUESTS, TABLE_DELIVERY_PERSONNEL,
    TABLE_DISTRIBUTION_HISTORY, TABLE_AUDIT_LOGS
)
from auth import hash_password

def clear_tables():
    print("Clearing existing data...")
    # SQL-style delete via PostgREST requires a filter
    # For safety/simplicity we use neq('id', -1) which matches everything with serial ID > 0
    tables = [
        TABLE_AUDIT_LOGS, TABLE_DISTRIBUTION_HISTORY, TABLE_CANCEL_REQUESTS,
        TABLE_ORDERS, TABLE_ITEMS, TABLE_DELIVERY_PERSONNEL,
        TABLE_USERS, TABLE_ADMINS
    ]
    for table in tables:
        try:
            supabase.table(table).delete().neq("id", -1).execute()
        except Exception as e:
            print(f"Warning: Could not clear {table}: {e}")

def seed_data():
    clear_tables()

    # ========================================
    # ADMINS
    # ========================================
    admin_user = {
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@hospital.com",
        "password_hash": hash_password("admin123"),
        "role": "admin"
    }
    supabase.table(TABLE_ADMINS).insert(admin_user).execute()
    print("[OK] Added admin account: admin@hospital.com / admin123")

    # ========================================
    # USERS (Staff)
    # ========================================
    active_user = {
        "employee_id": "EMP001",
        "first_name": "Sarah",
        "last_name": "Nurse",
        "email": "staff@hospital.com",
        "password_hash": hash_password("staff123"),
        "role": "user",
        "status": "active"
    }
    supabase.table(TABLE_USERS).insert(active_user).execute()
    print("[OK] Added staff account: staff@hospital.com / staff123")

    pending_users = [
        {
            "employee_id": f"EMP00{i}",
            "first_name": name,
            "last_name": last,
            "email": f"{name.lower()}.{last.lower()}@hospital.com",
            "password_hash": hash_password("password123"),
            "role": "user",
            "status": "pending"
        }
        for i, (name, last) in enumerate([("John", "Doe"), ("Jane", "Smith"), ("Bob", "Wilson")], start=2)
    ]
    supabase.table(TABLE_USERS).insert(pending_users).execute()
    print(f"[OK] Added {len(pending_users)} pending users for approval testing")

    # ========================================
    # INVENTORY / STOCK ITEMS
    # ========================================
    inventory_items = [
        {"name": "Surgical Gloves", "category": "PPE", "quantity": 500, "unit": "box", "min_stock": 100, "supplier": "MedSupply Co."},
        {"name": "N95 Masks", "category": "PPE", "quantity": 200, "unit": "box", "min_stock": 50, "supplier": "SafeGuard Inc."},
        {"name": "Syringes (10ml)", "category": "Medical Supplies", "quantity": 1000, "unit": "pcs", "min_stock": 200, "supplier": "MedEquip Ltd."},
        {"name": "IV Drip Sets", "category": "Medical Supplies", "quantity": 150, "unit": "set", "min_stock": 50, "supplier": "HealthFirst"},
        {"name": "Bandages (Large)", "category": "First Aid", "quantity": 300, "unit": "roll", "min_stock": 75, "supplier": "CareWell"},
        {"name": "Antiseptic Solution", "category": "First Aid", "quantity": 80, "unit": "bottle", "min_stock": 30, "supplier": "CleanMed"},
        {"name": "Blood Collection Tubes", "category": "Lab Equipment", "quantity": 45, "unit": "box", "min_stock": 50, "supplier": "LabPro"},
        {"name": "Specimen Containers", "category": "Lab Equipment", "quantity": 120, "unit": "pcs", "min_stock": 40, "supplier": "LabPro"},
        {"name": "Thermometers (Digital)", "category": "Medical Devices", "quantity": 25, "unit": "pcs", "min_stock": 10, "supplier": "TechMed"},
        {"name": "Stethoscopes", "category": "Medical Devices", "quantity": 15, "unit": "pcs", "min_stock": 5, "supplier": "MedEquip Ltd."},
    ]
    supabase.table(TABLE_ITEMS).insert(inventory_items).execute()
    print(f"[OK] Added {len(inventory_items)} inventory items")

    # ========================================
    # DELIVERY PERSONNEL
    # ========================================
    delivery_personnel = [
        {"name": "Tanaka Hiroshi", "phone": "090-1234-5678", "vehicle_number": "品川 300 あ 1234", "status": "available"},
        {"name": "Yamamoto Kenji", "phone": "090-2345-6789", "vehicle_number": "品川 300 い 5678", "status": "on_delivery"},
        {"name": "Suzuki Yuki", "phone": "090-3456-7890", "vehicle_number": "品川 300 う 9012", "status": "available"},
        {"name": "Sato Akira", "phone": "090-4567-8901", "vehicle_number": "品川 300 え 3456", "status": "on_delivery"},
    ]
    supabase.table(TABLE_DELIVERY_PERSONNEL).insert(delivery_personnel).execute()
    print(f"[OK] Added {len(delivery_personnel)} delivery personnel")

    # ========================================
    # ORDERS
    # ========================================
    departments = ["Ward A", "Ward B", "ICU", "Emergency", "Pharmacy", "Lab", "OPD"]
    statuses = ["pending", "out_for_delivery", "completed"]

    orders = []
    for _ in range(15):
        item = random.choice(inventory_items)
        status = random.choice(statuses)
        orders.append({
            "item_name": item["name"],
            "quantity": random.randint(5, 50),
            "ordered_by": f"Staff {random.randint(100, 999)}",
            "ordered_by_id": "EMP001",
            "department": random.choice(departments),
            "status": status
        })
    supabase.table(TABLE_ORDERS).insert(orders).execute()
    print(f"[OK] Added {len(orders)} sample orders")

    # ========================================
    # DISTRIBUTION HISTORY
    # ========================================
    history_data = [
        {"item_name": "Surgical Gloves", "quantity": 20, "destination": "Ward A", "delivered_by": "Tanaka Hiroshi", "notes": "Routine restock"},
        {"item_name": "N95 Masks", "quantity": 10, "destination": "ICU", "delivered_by": "Yamamoto Kenji", "notes": "Urgent request"},
        {"item_name": "IV Drip Sets", "quantity": 15, "destination": "Emergency", "delivered_by": "Suzuki Yuki", "notes": "Scheduled delivery"},
    ]
    supabase.table(TABLE_DISTRIBUTION_HISTORY).insert(history_data).execute()
    print(f"[OK] Added {len(history_data)} distribution history records")

    # ========================================
    # AUDIT LOGS
    # ========================================
    logs = [
        {"actor_type": "admin", "actor_id": "SYSTEM", "action": "database_seed", "details": "Initial seed data populated"},
        {"actor_type": "user", "actor_id": "EMP001", "action": "login"},
    ]
    supabase.table(TABLE_AUDIT_LOGS).insert(logs).execute()
    print(f"[OK] Added {len(logs)} audit log entries")

    print("\n" + "="*50)
    print("[SUCCESS] Supabase Database seeded successfully!")
    print("="*50)
    print("\nTest Credentials:")
    print("- Admin: admin@hospital.com / admin123")
    print("- Staff: staff@hospital.com / staff123")
    print("- Others: Use any pending user emails with 'password123'")

if __name__ == "__main__":
    seed_data()
