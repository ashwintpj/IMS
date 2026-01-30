import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

supabase: Client = create_client(url, key)

# Table Names
TABLE_USERS = "users"
TABLE_ADMINS = "admins"
TABLE_ITEMS = "items"
TABLE_ORDERS = "orders"
TABLE_CANCEL_REQUESTS = "cancel_requests"
TABLE_DELIVERY_PERSONNEL = "delivery_personnel"
TABLE_DISTRIBUTION_HISTORY = "distribution_history"
TABLE_AUDIT_LOGS = "audit_logs"
TABLE_SPECIMEN_CONTAINERS = "specimen_containers"
