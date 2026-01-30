import os
import uuid
import io
import base64
from supabase import create_client, Client
from dotenv import load_dotenv
import barcode
from barcode.writer import ImageWriter

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

TABLE_CONTAINERS = "specimen_containers"

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

def seed_containers():
    print("Clearing existing specimen containers...")
    try:
        # Delete all existing containers
        supabase.table(TABLE_CONTAINERS).delete().neq("id", -1).execute()
        print("Existing containers cleared.")
    except Exception as e:
        print(f"Warning: Could not clear existing containers: {e}")

    print("Seeding specimen containers...")

    for item in sample_containers:
        # Create a unique barcode number (12 digits for EAN13 or similar)
        barcode_number = str(uuid.uuid4().int)[:12]
        item['barcode_number'] = barcode_number

        # Generate barcode image in memory
        COD128 = barcode.get_barcode_class('code128')
        c128 = COD128(barcode_number, writer=ImageWriter())
        buffer = io.BytesIO()
        c128.write(buffer)
        
        base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
        item['barcode_image'] = f"data:image/png;base64,{base64_image}"

    res = supabase.table(TABLE_CONTAINERS).insert(sample_containers).execute()
    print(f"Successfully seeded {len(res.data)} containers.")

if __name__ == "__main__":
    seed_containers()
