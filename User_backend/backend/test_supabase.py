import os
from supabase import create_client, Client

# Supabase Credentials provided by user
url: str = "https://vadcvpbktzlzeuwnzaqt.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZGN2cGJrdHpsemV1d256YXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjA0MzQsImV4cCI6MjA4NTIzNjQzNH0.Fucno9JqqjNW_xQdkV2FbzSnFu5slFn9KhOVzeGbHG8"

def test_supabase_connection():
    print(f"Connecting to Supabase at: {url}")
    try:
        # Initialize the Supabase client
        supabase: Client = create_client(url, key)
        
        # Test connection by listing tables or just checking initialization
        print("✅ Successfully initialized Supabase client!")
        
        # If you have a table named 'items', you can test a query:
        # data, count = supabase.table('items').select('*').execute()
        # print("Data found:", data)
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_supabase_connection()
