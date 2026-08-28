import sys
import os
from datetime import datetime, timedelta
import random

# Ensure app package is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models import (
    User, Warehouse, Zone, Rack, Shelf, Bin, Supplier, Product, Inventory,
    InventoryTransaction, Receiving, Worker, Attendance, Camera, SafetyEvent,
    Vehicle, VehicleTelemetry, EnergyMeter, EnergyReading, Alert, StockOut
)
from app.auth import hash_password

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[SEED] Seeding Smart Warehouse Management System Database...")

    # 1. Users (Owner & Manager)
    owner = User(
        email="owner@smartwarehouse.com",
        password_hash=hash_password("password123"),
        full_name="Sarah Connor (System Owner)",
        role="OWNER"
    )
    manager = User(
        email="manager@smartwarehouse.com",
        password_hash=hash_password("password123"),
        full_name="John Doe (Warehouse Manager)",
        role="MANAGER"
    )
    db.add_all([owner, manager])
    db.commit()

    # 2. Warehouses
    wh1 = Warehouse(code="WH-Alpha", name="Primary Logistics Hub Alpha", location="Sector A North", total_capacity_sqft=75000.0, used_capacity_pct=68.5)
    wh2 = Warehouse(code="WH-Beta", name="High-Capacity Terminal WH-02", location="Sector B East", total_capacity_sqft=120000.0, used_capacity_pct=92.4)
    wh3 = Warehouse(code="WH-Gamma", name="Cold Storage Facility", location="Sector C West", total_capacity_sqft=45000.0, used_capacity_pct=42.0)
    db.add_all([wh1, wh2, wh3])
    db.commit()

    # 3. Zones & Racks
    zone_a = Zone(warehouse_id=wh1.id, code="Zone A", name="Receiving & Heavy Hardware", zone_type="Receiving")
    zone_b = Zone(warehouse_id=wh1.id, code="Zone B", name="High-Velocity SKUs & Sorting", zone_type="Storage")
    zone_c = Zone(warehouse_id=wh1.id, code="Zone C", name="Cold Storage & Microelectronics", zone_type="Storage")
    db.add_all([zone_a, zone_b, zone_c])
    db.commit()

    rack1 = Rack(zone_id=zone_a.id, code="R-01", name="Rack A1")
    rack2 = Rack(zone_id=zone_b.id, code="R-02", name="Rack B1")
    db.add_all([rack1, rack2])
    db.commit()

    shelf1 = Shelf(rack_id=rack1.id, code="S-12", name="Shelf 12")
    db.add(shelf1)
    db.commit()

    bin1 = Bin(shelf_id=shelf1.id, code="B-02", name="Bin A12-04-B-02")
    db.add(bin1)
    db.commit()

    # 4. Suppliers
    s1 = Supplier(name="Acme Industrial Supply", contact_person="Robert Vance", email="vance@acmeind.com", phone="+1-800-555-0199")
    s2 = Supplier(name="Apex Microelectronics", contact_person="Elena Rostova", email="elena@apexmicro.io", phone="+1-888-555-0144")
    s3 = Supplier(name="Polymer Logistics Corp", contact_person="David Miller", email="dmiller@polymerlogistics.com", phone="+1-877-555-0122")
    db.add_all([s1, s2, s3])
    db.commit()

    # 5. Products & Inventory (20+ SKUs)
    products_data = [
        # (Name, SKU, Category, Supplier, Unit, Min, Max, Reorder, Cost, Stock, Status, Zone, Aisle, Rack, Shelf, Bin)
        ("Industrial Microcontroller A1", "ELC-MC-001", "Electronics", s2.id, "Box", 50, 1000, 100, 45.0, 342, "HEALTHY", "Zone A", "01", "R4", "S12", "A1-R4-S12"),
        ("Heavy Duty Gear Assembly", "HDW-GR-045", "Hardware", s1.id, "Piece", 20, 300, 50, 120.0, 12, "CRITICAL", "Zone B", "03", "R1", "S02", "C3-R1-S02"),
        ("Polymer Packaging Tape (100m)", "PKG-TP-992", "Packaging", s3.id, "Roll", 100, 2000, 300, 3.5, 115, "LOW STOCK", "Zone A", "02", "R8", "S44", "B2-R8-S44"),
        ("Industrial Fasteners - M8", "HW-FST-M8-001", "Hardware", s1.id, "Box (100 pcs)", 300, 2000, 500, 18.5, 1245, "HEALTHY", "Zone A", "12", "04", "B", "A12-04-B-02"),
        ("High-Capacity Lithium Cell 12V", "ELC-BAT-12V", "Electronics", s2.id, "Unit", 40, 500, 80, 85.0, 48, "LOW STOCK", "Zone C", "05", "R2", "S01", "C5-R2-S01"),
        ("Thermal Conductive Compound 50g", "ELC-THM-050", "Electronics", s2.id, "Tube", 30, 400, 60, 14.0, 8, "CRITICAL", "Zone C", "01", "R1", "S03", "C1-R1-S03"),
        ("Copper Armature Wire 50m", "RAW-CPR-050", "Raw Materials", s1.id, "Spool", 15, 200, 30, 95.0, 0, "OUT OF STOCK", "Zone B", "04", "R3", "S10", "B4-R3-S10"),
        ("Safety Hard Hat (Yellow)", "PPE-HAT-YEL", "Safety", s3.id, "Piece", 50, 500, 100, 15.0, 210, "HEALTHY", "Zone A", "01", "R1", "S01", "A1-R1-S01"),
        ("Cut-Resistant Kevlar Gloves", "PPE-GLV-KEV", "Safety", s3.id, "Pair", 80, 1000, 150, 12.0, 450, "HEALTHY", "Zone A", "01", "R1", "S02", "A1-R1-S02"),
        ("Pneumatic Actuator Valve 24V", "HDW-PNM-024", "Hardware", s1.id, "Unit", 25, 250, 50, 175.0, 38, "LOW STOCK", "Zone B", "02", "R5", "S04", "B2-R5-S04"),
        ("Corrugated Shipping Boxes L", "PKG-BOX-LRG", "Packaging", s3.id, "Bundle", 200, 3000, 500, 22.0, 1120, "HEALTHY", "Zone A", "06", "R9", "S01", "A6-R9-S01"),
        ("Stretch Wrap Roll 20 micron", "PKG-WRP-020", "Packaging", s3.id, "Roll", 50, 800, 100, 28.0, 95, "LOW STOCK", "Zone A", "06", "R9", "S02", "A6-R9-S02"),
        ("Digital Vernier Caliper 150mm", "TLS-CLP-150", "Tools", s1.id, "Piece", 10, 100, 20, 65.0, 42, "HEALTHY", "Zone B", "01", "R2", "S01", "B1-R2-S01"),
        ("Barcode Scanner Wireless 2D", "EQP-SCN-2D", "Equipment", s2.id, "Unit", 15, 150, 25, 140.0, 28, "HEALTHY", "Zone B", "01", "R2", "S02", "B1-R2-S02"),
        ("Heavy Pallet Strapping Kit", "PKG-STP-KIT", "Packaging", s3.id, "Kit", 20, 200, 40, 55.0, 18, "CRITICAL", "Zone A", "05", "R4", "S03", "A5-R4-S03"),
        ("Hydraulic Fluid ISO VG 46", "LUB-HYD-046", "Chemicals", s1.id, "Drum 20L", 10, 100, 20, 110.0, 35, "HEALTHY", "Zone Yard", "01", "R1", "S01", "Y1-R1-S01"),
        ("Industrial Robot Sensor Node", "ELC-SNS-ROB", "Electronics", s2.id, "Module", 30, 400, 60, 210.0, 180, "HEALTHY", "Zone C", "02", "R3", "S04", "C2-R3-S04"),
        ("High-Vis Reflective Vest L", "PPE-VST-LRG", "Safety", s3.id, "Piece", 60, 600, 120, 18.0, 290, "HEALTHY", "Zone A", "01", "R1", "S03", "A1-R1-S03"),
        ("Conveyor Drive Belt 5m", "PAR-BLT-005", "Hardware", s1.id, "Piece", 15, 150, 30, 88.0, 22, "LOW STOCK", "Zone B", "03", "R2", "S02", "B3-R2-S02"),
        ("Precision Torque Wrench 1/2\"", "TLS-TRQ-050", "Tools", s1.id, "Piece", 12, 100, 20, 95.0, 31, "HEALTHY", "Zone B", "01", "R2", "S03", "B1-R2-S03")
    ]

    for item in products_data:
        p_name, sku, cat, supp_id, unit, min_s, max_c, reorder, cost, stock, stat, z_code, aisle, r_code, s_code, b_code = item
        prod = Product(
            name=p_name,
            sku=sku,
            category=cat,
            supplier_id=supp_id,
            unit_type=unit,
            min_stock=min_s,
            max_capacity=max_c,
            reorder_level=reorder,
            unit_cost=cost
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)

        inv = Inventory(
            product_id=prod.id,
            warehouse_id=wh1.id,
            zone_code=z_code,
            aisle_code=aisle,
            rack_code=r_code,
            shelf_code=s_code,
            bin_code=b_code,
            current_stock=stock,
            status=stat,
            avg_daily_usage=round(random.uniform(5.0, 45.0), 1),
            last_received=datetime.utcnow() - timedelta(days=random.randint(1, 14)),
            last_issued=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
        )
        db.add(inv)
        db.commit()

    # 6. Workers & Attendance (10 Workers)
    workers_list = [
        ("W-101", "Alex Rivera", "Receiving Lead", "Zone A", "BADGE-901", "PRESENT"),
        ("W-102", "Marcus Vance", "Forklift Operator", "Zone A", "BADGE-902", "PRESENT"),
        ("W-103", "Elena Gomez", "Quality Inspector", "Zone B", "BADGE-903", "PRESENT"),
        ("W-104", "Chen Wei", "Inventory Specialist", "Zone B", "BADGE-904", "PRESENT"),
        ("W-105", "Samantha Reed", "Dispatch Operator", "Zone Dispatch", "BADGE-905", "ABSENT"),
        ("W-106", "Tariq Mansoor", "Maintenance Tech", "Zone A", "BADGE-906", "PRESENT"),
        ("W-107", "Jessica Taylor", "Safety Officer", "Zone C", "BADGE-907", "PRESENT"),
        ("W-108", "David Kim", "AGV Supervisor", "Zone B", "BADGE-908", "PRESENT"),
        ("W-109", "Rachel Green", "Stock Auditor", "Zone C", "BADGE-909", "ON LEAVE"),
        ("W-110", "Carlos Mendez", "Receiving Clerk", "Zone A", "BADGE-910", "PRESENT")
    ]

    for w_code, w_name, w_role, w_zone, w_badge, w_stat in workers_list:
        wk = Worker(
            worker_code=w_code,
            name=w_name,
            role=w_role,
            assigned_zone=w_zone,
            badge_id=w_badge,
            status=w_stat
        )
        db.add(wk)
        db.commit()
        db.refresh(wk)

        if w_stat == "PRESENT":
            att = Attendance(
                worker_id=wk.id,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                check_in_time="08:00:00",
                last_detected_camera_code="CCTV-01" if "A" in w_zone else "CCTV-02",
                status="PRESENT"
            )
            db.add(att)
            db.commit()

    # 7. CCTV Cameras
    cams = [
        Camera(camera_code="CCTV-01", name="Zone A Receiving Gate", zone_name="Zone A Receiving", ip_address="192.168.1.104", fps=30, resolution="4K AI-ENABLED", status="LIVE"),
        Camera(camera_code="CCTV-02", name="Zone B Sorting Conveyor", zone_name="Zone B Sorting", ip_address="192.168.1.105", fps=30, resolution="1080p", status="ALERT"),
        Camera(camera_code="CCTV-03", name="Zone C High-Rack Storage", zone_name="Zone C Storage", ip_address="192.168.1.106", fps=30, resolution="1080p", status="ACTIVE"),
        Camera(camera_code="CCTV-04", name="Exterior Dock 4 Gate", zone_name="Exterior Dock 4", ip_address="192.168.1.107", fps=0, resolution="ERR: NO_SIGNAL", status="OFFLINE")
    ]
    db.add_all(cams)
    db.commit()

    # 8. Safety Events
    se1 = SafetyEvent(
        camera_code="CCTV-01",
        zone_name="Zone A Receiving",
        worker_name="Marcus Vance",
        event_type="PPE_VIOLATION",
        description="Missing Safety Helmet",
        helmet_status="MISSING",
        glove_status="OK",
        confidence=94.0,
        status="REVIEW",
        timestamp=datetime.utcnow() - timedelta(minutes=18)
    )
    se2 = SafetyEvent(
        camera_code="CCTV-02",
        zone_name="Zone B Sorting",
        worker_name="Chen Wei",
        event_type="PROXIMITY_ALERT",
        description="Forklift Distance < 2m",
        helmet_status="OK",
        glove_status="OK",
        confidence=98.0,
        status="REVIEW",
        timestamp=datetime.utcnow() - timedelta(minutes=45)
    )
    db.add_all([se1, se2])
    db.commit()

    # 9. Vehicles (V01, V02, V03 - CRITICAL, V04)
    v1 = Vehicle(vehicle_code="V01", name="Forklift Alpha-01", type="FORKLIFT", warehouse_name="WH-Alpha", current_zone="Zone A Receiving", speed_kmh=5.2, fuel_pct=98.0, engine_temp_c=78.0, hydraulic_press_psi=2100.0, health_score=98, status="ACTIVE", maintenance_status="Optimal")
    v2 = Vehicle(vehicle_code="V02", name="Automated AGV Unit-02", type="AGV", warehouse_name="WH-Alpha", current_zone="Zone B Sorting", speed_kmh=3.8, fuel_pct=74.0, engine_temp_c=88.0, hydraulic_press_psi=1950.0, health_score=74, status="MAINTENANCE_SOON", maintenance_status="Schedule Inspection")
    v3 = Vehicle(vehicle_code="V03", name="Heavy Forklift V03", type="FORKLIFT", warehouse_name="WH-Alpha", current_zone="Loading Dock B", speed_kmh=8.4, fuel_pct=38.0, engine_temp_c=112.0, hydraulic_press_psi=1650.0, health_score=38, status="CRITICAL", maintenance_status="Immediate Shutdown Recommended")
    v4 = Vehicle(vehicle_code="V04", name="Electric Pallet Truck 04", type="PALLET_TRUCK", warehouse_name="WH-Alpha", current_zone="Zone C Cold Storage", speed_kmh=4.1, fuel_pct=92.0, engine_temp_c=72.0, hydraulic_press_psi=2200.0, health_score=92, status="ACTIVE", maintenance_status="Optimal")
    db.add_all([v1, v2, v3, v4])
    db.commit()

    # 10. Energy Meter & Readings
    em = EnergyMeter(meter_code="EM-01", name="Main Facility Substation", zone_name="Main Grid", status="ONLINE")
    db.add(em)
    db.commit()

    er = EnergyReading(
        meter_id=em.id,
        power_kw=42.5,
        voltage_v=230.0,
        current_a=48.2,
        power_factor=0.95,
        daily_kwh=510.0,
        estimated_cost=76.5,
        timestamp=datetime.utcnow()
    )
    db.add(er)
    db.commit()

    # 11. Initial Receiving Records (Including Mismatch)
    r1 = Receiving(
        invoice_number="INV-8842",
        supplier_name="Acme Industrial Supply",
        vehicle_code="TRUCK-01",
        product_name="Industrial Fasteners - M8",
        expected_qty=100,
        cv_detected_qty=99,
        weight_measured_qty=98.5,
        tolerance_pct=2.0,
        status="REVIEW",
        decision_reason="Mismatch Detected: CV (99) / Weight (98.5) exceeds 2.0% tolerance against expected (100).",
        timestamp=datetime.utcnow() - timedelta(minutes=15)
    )
    r2 = Receiving(
        invoice_number="INV-8801",
        supplier_name="Apex Microelectronics",
        vehicle_code="TRUCK-02",
        product_name="Industrial Microcontroller A1",
        expected_qty=50,
        cv_detected_qty=50,
        weight_measured_qty=50.0,
        tolerance_pct=2.0,
        status="ACCEPTED",
        decision_reason="Verified: CV count (50) and Weight sensor (50.0) match expected within 2.0% tolerance.",
        timestamp=datetime.utcnow() - timedelta(hours=2)
    )
    db.add_all([r1, r2])
    db.commit()

    # 12. Priority Alerts
    a1 = Alert(
        severity="URGENT",
        module="Fleet Module",
        title="Vehicle V03 Health Critical",
        description="Engine temperature exceeding safe operational thresholds (112°C). Immediate shutdown recommended to prevent permanent hardware damage.",
        entity_type="Vehicle",
        entity_id=str(v3.id),
        recommended_action="Schedule Maintenance",
        action_type="schedule_maintenance",
        status="ACTIVE",
        created_at=datetime.utcnow() - timedelta(minutes=10)
    )
    a2 = Alert(
        severity="HIGH PRIORITY",
        module="Inventory Module",
        title="Critical Stock Depletion: Pallet A-42",
        description="High-velocity SKU (Industrial Fasteners - M8) has dropped below minimum reserve threshold. Current projected stockout in 4 hours based on active orders.",
        entity_type="Product",
        entity_id="4",
        recommended_action="Expedite Reorder",
        action_type="expedite_reorder",
        status="ACTIVE",
        created_at=datetime.utcnow() - timedelta(minutes=45)
    )
    db.add_all([a1, a2])
    db.commit()

    db.close()
    print("[SEED SUCCESS] Database successfully seeded with full hackathon dataset!")

if __name__ == "__main__":
    seed_database()
