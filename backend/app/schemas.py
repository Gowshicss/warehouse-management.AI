from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_name: str
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    supplier_id: Optional[int] = None
    unit_type: str = "Box"
    min_stock: int = 50
    max_capacity: int = 1000
    reorder_level: int = 100
    unit_cost: float = 10.0
    warehouse_id: int = 1
    zone_code: str = "Zone A"
    aisle_code: str = "12"
    rack_code: str = "04"
    shelf_code: str = "B"
    bin_code: str = "A12-04-B-02"
    initial_stock: int = 100

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    min_stock: Optional[int] = None
    max_capacity: Optional[int] = None
    reorder_level: Optional[int] = None
    unit_cost: Optional[float] = None

class StockAdjust(BaseModel):
    quantity_change: int  # Positive for IN, Negative for OUT
    note: Optional[str] = "Manual stock adjustment"

# Receiving Schemas
class ReceivingVerifyRequest(BaseModel):
    invoice_number: str
    supplier_name: str
    product_name: str
    sku: str
    expected_qty: int
    cv_detected_qty: int
    weight_measured_qty: float
    tolerance_pct: float = 2.0
    vehicle_code: str = "TRUCK-01"

# Stock Out Schema
class StockOutRequest(BaseModel):
    product_id: int
    quantity: int
    destination: str = "Order Dispatch Dock 2"
    requested_by: str = "Manager"

# AI Chat Schema
class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    reply: str
    category: Optional[str] = "General"
    data_context: Optional[dict] = None
