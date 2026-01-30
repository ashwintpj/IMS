from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    employee_id: str
    email: Optional[EmailStr]
    password: str
    role: str
    first_name: str
    last_name: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    first_name: str
    last_name: str

class AdminProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class Item(BaseModel):
    name: str
    category: str
    quantity: int
    unit: str
    min_stock: int
    supplier: str

class Order(BaseModel):
    items: list[dict] # [{name: str, quantity: int}]
    urgency: str = "Normal" # Normal, Urgent
    ordered_by: str
    ordered_by_id: Optional[str] = None
    department: str
    ward: Optional[str] = "General"
    status: str = "pending"  # pending, approved, delivered, cancelled
    created_at: Optional[datetime] = None

class SpecimenContainer(BaseModel):
    name: str
    barcode_number: Optional[str] = None
    barcode_image: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    full_name: Optional[str] = None
    department: str
    ward: str
    phone: Optional[str] = None

class CancelRequest(BaseModel):
    order_id: str
    reason: str
    requested_by: str
    status: str = "pending"  # pending, approved, rejected

class DeliveryPerson(BaseModel):
    name: str
    phone: str
    vehicle_number: str
    status: str = "available"  # available, on_delivery

class Distribution(BaseModel):
    item_name: str
    quantity: int
    destination: str
    delivered_by: str
    ordered_by: Optional[str] = "Unknown"
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None
