from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="MANAGER")  # OWNER or MANAGER
    created_at = Column(DateTime, default=datetime.utcnow)

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    total_capacity_sqft = Column(Float, default=50000.0)
    used_capacity_pct = Column(Float, default=65.0)

    zones = relationship("Zone", back_populates="warehouse", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="warehouse")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    zone_type = Column(String, default="Storage")  # Storage, Receiving, Dispatch, Yard

    warehouse = relationship("Warehouse", back_populates="zones")
    racks = relationship("Rack", back_populates="zone", cascade="all, delete-orphan")

class Rack(Base):
    __tablename__ = "racks"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)

    zone = relationship("Zone", back_populates="racks")
    shelves = relationship("Shelf", back_populates="rack", cascade="all, delete-orphan")

class Shelf(Base):
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)
    rack_id = Column(Integer, ForeignKey("racks.id"), nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)

    rack = relationship("Rack", back_populates="shelves")
    bins = relationship("Bin", back_populates="shelf", cascade="all, delete-orphan")

class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)

    shelf = relationship("Shelf", back_populates="bins")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    products = relationship("Product", back_populates="supplier")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    unit_type = Column(String, default="Box")
    min_stock = Column(Integer, default=50)
    max_capacity = Column(Integer, default=1000)
    reorder_level = Column(Integer, default=100)
    unit_cost = Column(Float, default=10.0)
    image_url = Column(String, nullable=True)

    supplier = relationship("Supplier", back_populates="products")
    inventory = relationship("Inventory", back_populates="product", uselist=False)

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    zone_code = Column(String, default="Zone A")
    aisle_code = Column(String, default="12")
    rack_code = Column(String, default="04")
    shelf_code = Column(String, default="B")
    bin_code = Column(String, default="A12-04-B-02")
    current_stock = Column(Integer, default=0)
    status = Column(String, default="HEALTHY")  # HEALTHY, LOW STOCK, CRITICAL, OUT OF STOCK
    avg_daily_usage = Column(Float, default=15.0)
    last_received = Column(DateTime, default=datetime.utcnow)
    last_issued = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="inventory")
    warehouse = relationship("Warehouse", back_populates="inventories")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # IN, OUT, ADJUST
    quantity = Column(Integer, nullable=False)
    reference_id = Column(String, nullable=True)
    note = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Receiving(Base):
    __tablename__ = "receivings"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=False)
    supplier_name = Column(String, nullable=False)
    vehicle_code = Column(String, default="TRUCK-01")
    product_name = Column(String, nullable=False)
    expected_qty = Column(Integer, nullable=False)
    cv_detected_qty = Column(Integer, nullable=False)
    weight_measured_qty = Column(Float, nullable=False)
    tolerance_pct = Column(Float, default=2.0)
    status = Column(String, nullable=False)  # ACCEPTED, REVIEW, REJECTED
    decision_reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    worker_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="Warehouse Specialist")
    assigned_zone = Column(String, default="Zone A")
    badge_id = Column(String, nullable=False)
    status = Column(String, default="PRESENT")  # PRESENT, ABSENT, ON LEAVE

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    check_in_time = Column(String, nullable=True)
    check_out_time = Column(String, nullable=True)
    last_detected_camera_code = Column(String, default="CCTV-01")
    status = Column(String, default="PRESENT")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    ip_address = Column(String, default="192.168.1.104")
    fps = Column(Integer, default=30)
    resolution = Column(String, default="1080p")
    status = Column(String, default="LIVE")  # LIVE, ALERT, ACTIVE, OFFLINE

class SafetyEvent(Base):
    __tablename__ = "safety_events"

    id = Column(Integer, primary_key=True, index=True)
    camera_code = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    worker_name = Column(String, nullable=True)
    event_type = Column(String, nullable=False)  # PPE_VIOLATION, PROXIMITY_ALERT, ACCESS_LOG
    description = Column(String, nullable=False)
    helmet_status = Column(String, default="OK")  # OK, MISSING
    glove_status = Column(String, default="OK")   # OK, MISSING
    confidence = Column(Float, default=94.0)
    status = Column(String, default="REVIEW")     # REVIEW, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, default="FORKLIFT")  # FORKLIFT, AGV, PALLET_TRUCK
    warehouse_name = Column(String, default="WH-Alpha")
    current_zone = Column(String, default="Loading Dock B")
    speed_kmh = Column(Float, default=5.2)
    fuel_pct = Column(Float, default=85.0)
    engine_temp_c = Column(Float, default=78.0)
    hydraulic_press_psi = Column(Float, default=2100.0)
    health_score = Column(Integer, default=95)
    status = Column(String, default="ACTIVE")  # ACTIVE, MAINTENANCE_SOON, CRITICAL
    maintenance_status = Column(String, default="Good")
    last_update = Column(DateTime, default=datetime.utcnow)

class VehicleTelemetry(Base):
    __tablename__ = "vehicle_telemetries"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    speed = Column(Float, nullable=False)
    battery_level = Column(Float, nullable=False)
    engine_temp = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class EnergyMeter(Base):
    __tablename__ = "energy_meters"

    id = Column(Integer, primary_key=True, index=True)
    meter_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    status = Column(String, default="ONLINE")

class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True)
    meter_id = Column(Integer, ForeignKey("energy_meters.id"), nullable=False)
    power_kw = Column(Float, nullable=False)
    voltage_v = Column(Float, default=230.0)
    current_a = Column(Float, default=45.0)
    power_factor = Column(Float, default=0.95)
    daily_kwh = Column(Float, default=450.0)
    estimated_cost = Column(Float, default=67.5)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String, nullable=False)  # URGENT, HIGH PRIORITY, ATTENTION, ROUTINE
    module = Column(String, nullable=False)    # Fleet Module, Inventory Module, Analytics Module, Operations Module
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    action_type = Column(String, nullable=True) # schedule_maintenance, expedite_reorder, review_analytics, start_audit
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class StockOut(Base):
    __tablename__ = "stock_outs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    destination = Column(String, default="Order Dispatch Dock 2")
    requested_by = Column(String, default="Manager")
    status = Column(String, default="COMPLETED")
    timestamp = Column(DateTime, default=datetime.utcnow)
