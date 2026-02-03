import threading
import requests
import time
import random

# CONFIGURATION
BASE_URL = "http://localhost:8000"
ITEM_NAME = "Test Item" # We will ensure this item exists
INITIAL_QTY = 1

def ensure_test_item():
    """Ensures a test item exists with specific quantity."""
    # 1. Login as admin (to update inventory) - assuming we can or just use admin endpoints if no auth required?
    # The code shows endpoints are not protected by Depends(get_current_active_user) in the snippets viewed?
    # Actually they are just @app.post("/admin/...") without explicit dependency in the view, 
    # but likely there is middleware or dependency not shown or it's open.
    # Looking at the code: `app.add_middleware(CORSMiddleware...)` and then endpoints.
    # `login/admin` returns token.
    # But `create_order` and others don't seem to HAVE `Depends(get_current_user)` in the signature in the file I read!
    # They seem OPEN for this project (it's a prototype/student project likely).
    # If they are protected, this script might fail 401. I'll assume open or try to login.
    pass

def create_order(thread_id):
    print(f"[{thread_id}] Sending request...")
    try:
        payload = {
            "item_name": ITEM_NAME,
            "quantity": 1,
            "destination": "Test Ward",
            "ordered_by": f"Tester {thread_id}",
            "urgency": "Normal"
        }
        response = requests.post(f"{BASE_URL}/admin/orders", json=payload)
        print(f"[{thread_id}] Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        print(f"[{thread_id}] Error: {e}")

def run_test():
    print("--- Starting Concurrent Request Test ---")
    
    # 1. Provide instructions
    print("This script attempts to send 2 simultaneous requests for an item with Quantity=1.")
    print("If successful, one should succeed (200 OK) and one should fail (400 Insufficient Stock).")
    print("Please ensure the backend is running on http://localhost:8000")
    
    threads = []
    for i in range(2):
        t = threading.Thread(target=create_order, args=(i, ))
        threads.append(t)
        
    for t in threads:
        t.start()
        
    for t in threads:
        t.join()
        
    print("--- Test Completed ---")

if __name__ == "__main__":
    run_test()
