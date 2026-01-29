import uuid
import io
import base64
from pymongo import MongoClient
import barcode
from barcode.writer import ImageWriter

client = MongoClient("mongodb://localhost:27017")
db = client["inventory_db"]
containers = db["specimen_containers"]

if containers.count_documents({}) > 0:
    print(f"Specimen containers already exist: {containers.count_documents({})}")
else:
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

    for item in sample_containers:
        # Create a unique barcode number
        barcode_number = str(uuid.uuid4().int)[:12]
        item['barcode_number'] = barcode_number

        # Generate barcode image in memory
        EAN = barcode.get_barcode_class('code128')
        ean = EAN(barcode_number, writer=ImageWriter())
        buffer = io.BytesIO()
        ean.write(buffer)
        base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
        item['barcode_image'] = f"data:image/png;base64,{base64_image}"

    result = containers.insert_many(sample_containers)
    print(f"✓ Created {len(result.inserted_ids)} specimen containers")

    for i, id in enumerate(result.inserted_ids, 1):
        print(f"  {i}. {sample_containers[i-1]['name']} - Barcode: {sample_containers[i-1]['barcode_number']} - ID: {id}")