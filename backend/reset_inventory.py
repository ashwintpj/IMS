import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

TABLE_ITEMS = "items"
TABLE_ORDERS = "orders"
TABLE_DISTRIBUTION_HISTORY = "distribution_history"
TABLE_CANCEL_REQUESTS = "cancel_requests"
TABLE_AUDIT_LOGS = "audit_logs"

sample_containers = [
    {"name": "Blood Collection Tube (EDTA)"},
    {"name": "Blood Collection Tube (SST)"},
    {"name": "Urine Container (24-hour)"},
    {"name": "Stool Sample Container"},
    {"name": "Sputum Container"},
    {"name": "Swab (Throat)"},
    {"name": "Swab (Nasal)"},
    {"name": "Synovial Fluid Container"},
    {"name": "CSF Container"},
    {"name": "Sterile Urine Cup"},
]

def reset_inventory():
    print("Clearing all related order and distribution data...")
    tables_to_clear = [
        TABLE_AUDIT_LOGS,
        TABLE_DISTRIBUTION_HISTORY,
        TABLE_CANCEL_REQUESTS,
        TABLE_ORDERS,
        TABLE_ITEMS
    ]
    
    for table in tables_to_clear:
        print(f"Clearing {table}...")
        try:
            supabase.table(table).delete().neq("id", "-1" if table == TABLE_AUDIT_LOGS else -1).execute()
        except Exception as e:
            print(f"Warning: Could not clear {table}: {e}")

    print("Filling inventory with containers...")
    items_to_insert = []
    for container in sample_containers:
        items_to_insert.append({
            "name": container["name"],
            "category": "Containers",
            "quantity": 100,
            "unit": "pcs",
            "min_stock": 20,
            "supplier": "Internal Lab Supply"
        })

    try:
        res = supabase.table(TABLE_ITEMS).insert(items_to_insert).execute()
        print(f"Successfully added {len(res.data)} items to inventory.")
    except Exception as e:
        print(f"Error filling inventory: {e}")

if __name__ == "__main__":
    reset_inventory()
