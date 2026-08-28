from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..models import (
    Product, Inventory, Vehicle, Receiving, SafetyEvent, Attendance,
    Worker, Warehouse, Alert, EnergyReading, User
)

def get_operational_priorities(db: Session) -> List[Dict[str, Any]]:
    priorities = []

    # 1. Critical/Low Vehicle Health Check
    critical_vehicle = db.query(Vehicle).filter(Vehicle.status == "CRITICAL").first()
    if critical_vehicle:
        priorities.append({
            "id": f"veh-{critical_vehicle.id}",
            "severity": "URGENT",
            "severity_color": "red",
            "title": f"Vehicle {critical_vehicle.vehicle_code} Health Critical",
            "module": "Fleet Module",
            "description": f"Engine temperature exceeding safe operational thresholds ({critical_vehicle.engine_temp_c}°C). Immediate shutdown recommended to prevent hardware damage.",
            "button_text": "Schedule Maintenance",
            "action_type": "schedule_maintenance",
            "entity_type": "Vehicle",
            "entity_id": str(critical_vehicle.id),
            "target_route": "/vehicles",
            "time_ago": "10 mins ago",
            "location_tag": critical_vehicle.current_zone
        })

    # 2. Critical Product Stock Depletion
    critical_inv = db.query(Inventory).filter(Inventory.status.in_(["CRITICAL", "OUT OF STOCK"])).first()
    if critical_inv and critical_inv.product:
        p = critical_inv.product
        est_hours = int((critical_inv.current_stock / (critical_inv.avg_daily_usage or 1.0)) * 24)
        priorities.append({
            "id": f"inv-{p.id}",
            "severity": "HIGH PRIORITY",
            "severity_color": "orange",
            "title": f"Critical Stock Depletion: {p.name}",
            "module": "Inventory Module",
            "description": f"High-velocity SKU ({p.sku}) has dropped below reserve threshold (Current: {critical_inv.current_stock} {p.unit_type}s, Min: {p.min_stock}). Projected stockout in ~{max(1, est_hours)} hours.",
            "button_text": "Expedite Reorder",
            "action_type": "expedite_reorder",
            "entity_type": "Product",
            "entity_id": str(p.id),
            "target_route": f"/inventory/{p.id}",
            "time_ago": "45 mins ago",
            "location_tag": f"SKU: {p.sku}"
        })

    # 3. Receiving Mismatch
    mismatch_rec = db.query(Receiving).filter(Receiving.status == "REVIEW").first()
    if mismatch_rec:
        priorities.append({
            "id": f"rec-{mismatch_rec.id}",
            "severity": "URGENT",
            "severity_color": "red",
            "title": f"Receiving Mismatch Detected: Invoice #{mismatch_rec.invoice_number}",
            "module": "Receiving Module",
            "description": f"Supplier {mismatch_rec.supplier_name} shipment delivered {mismatch_rec.cv_detected_qty} units via CV detection vs {mismatch_rec.expected_qty} invoice expected. Tolerance threshold exceeded.",
            "button_text": "Review Receiving",
            "action_type": "review_analytics",
            "entity_type": "Receiving",
            "entity_id": str(mismatch_rec.id),
            "target_route": "/receiving",
            "time_ago": "15 mins ago",
            "location_tag": mismatch_rec.vehicle_code
        })

    # 4. Warehouse Utilization Check
    high_cap_wh = db.query(Warehouse).filter(Warehouse.used_capacity_pct >= 85.0).first()
    if high_cap_wh:
        priorities.append({
            "id": f"wh-{high_cap_wh.id}",
            "severity": "ATTENTION",
            "severity_color": "blue",
            "title": f"High Capacity Warning: {high_cap_wh.name}",
            "module": "Warehouse Module",
            "description": f"Warehouse facility {high_cap_wh.code} is currently at {high_cap_wh.used_capacity_pct}% capacity utilization. Consider rebalancing aisle assignments.",
            "button_text": "View Map",
            "action_type": "review_analytics",
            "entity_type": "Warehouse",
            "entity_id": str(high_cap_wh.id),
            "target_route": "/warehouse",
            "time_ago": "1 hr ago",
            "location_tag": high_cap_wh.location
        })

    # 5. Safety Audit Routine
    priorities.append({
        "id": "routine-audit",
        "severity": "ROUTINE",
        "severity_color": "gray",
        "title": "Weekly Safety Audit Due",
        "module": "Operations Module",
        "description": "Standard weekly facility safety walk-through is scheduled for today. Ensure all compliance checklists are completed by EOD.",
        "button_text": "Start Audit",
        "action_type": "start_audit",
        "entity_type": "Safety",
        "entity_id": "routine-01",
        "target_route": "/cctv",
        "time_ago": "Scheduled: Today",
        "location_tag": "All Zones"
    })

    return priorities

def process_ai_chat(db: Session, message: str, user: User) -> Dict[str, Any]:
    msg_lower = message.lower().strip()
    user_role = user.role.upper()

    # Manager restriction check for finance/energy cost
    if user_role == "MANAGER" and any(k in msg_lower for k in ["cost", "expense", "financial", "bill", "dollar", "$", "budget", "money"]):
        return {
            "reply": "🔒 Security Restriction: Manager role does not have access to financial cost data or energy billing metrics. Please contact an Owner.",
            "category": "Restricted"
        }

    # Query 1: Low stock / stock out
    if "low" in msg_lower and "stock" in msg_lower or "run out" in msg_lower:
        low_items = db.query(Inventory).join(Product).filter(
            Inventory.status.in_(["LOW STOCK", "CRITICAL", "OUT OF STOCK"])
        ).all()
        
        if not low_items:
            return {
                "reply": "All products in inventory are currently HEALTHY with optimal stock reserves.",
                "category": "Inventory"
            }
        
        details = [f"• {item.product.name} ({item.product.sku}): {item.current_stock} {item.product.unit_type}s remaining (Status: {item.status})" for item in low_items]
        reply_str = f"Found {len(low_items)} products requiring attention:\n" + "\n".join(details)
        return {
            "reply": reply_str,
            "category": "Inventory"
        }

    # Query 2: Lowest vehicle health
    if "vehicle" in msg_lower or "health" in msg_lower or "fleet" in msg_lower:
        worst_vehicle = db.query(Vehicle).order_by(Vehicle.health_score.asc()).first()
        if worst_vehicle:
            return {
                "reply": f"Vehicle {worst_vehicle.vehicle_code} ({worst_vehicle.name}) currently has the lowest health score at {worst_vehicle.health_score}% (Status: {worst_vehicle.status}). Engine temp: {worst_vehicle.engine_temp_c}°C, Hydraulic Pressure: {worst_vehicle.hydraulic_press_psi} PSI.",
                "category": "Fleet"
            }

    # Query 3: Absent workers / Attendance
    if "worker" in msg_lower or "absent" in msg_lower or "attendance" in msg_lower:
        total_workers = db.query(Worker).count()
        absent_count = db.query(Worker).filter(Worker.status == "ABSENT").count()
        present_count = db.query(Worker).filter(Worker.status == "PRESENT").count()
        return {
            "reply": f"Today's Worker Attendance Overview: Total Registered: {total_workers} | Present: {present_count} | Absent: {absent_count} | Attendance Rate: {(present_count / (total_workers or 1)) * 100:.1f}%.",
            "category": "Attendance"
        }

    # Query 4: PPE Violations / Safety
    if "ppe" in msg_lower or "safety" in msg_lower or "violation" in msg_lower:
        viol_count = db.query(SafetyEvent).filter(SafetyEvent.event_type == "PPE_VIOLATION").count()
        latest = db.query(SafetyEvent).order_by(SafetyEvent.timestamp.desc()).first()
        latest_str = f" Latest event: {latest.description} in {latest.zone_name}." if latest else ""
        return {
            "reply": f"There are {viol_count} recorded safety/PPE compliance events on record.{latest_str}",
            "category": "Safety"
        }

    # Query 5: Specific product search
    if "fastener" in msg_lower or "industrial fasteners" in msg_lower or "sku" in msg_lower:
        product = db.query(Product).filter(Product.name.ilike("%Fastener%")).first()
        if product and product.inventory:
            inv = product.inventory
            return {
                "reply": f"Stock Details for {product.name} (SKU: {product.sku}): Current Stock: {inv.current_stock} Boxes. Location: Zone {inv.zone_code}, Aisle {inv.aisle_code}, Rack {inv.rack_code}. Status: {inv.status}.",
                "category": "Product"
            }

    # Query 6: Warehouse capacity
    if "warehouse" in msg_lower or "capacity" in msg_lower or "full" in msg_lower:
        wh = db.query(Warehouse).order_by(Warehouse.used_capacity_pct.desc()).first()
        if wh:
            return {
                "reply": f"{wh.name} ({wh.code}) is currently the most filled warehouse at {wh.used_capacity_pct}% capacity utilization.",
                "category": "Warehouse"
            }

    # Query 7: Energy Consumption
    if "energy" in msg_lower or "power" in msg_lower or "kwh" in msg_lower:
        if user_role == "MANAGER":
            return {
                "reply": "🔒 Energy financial details are restricted for Manager role. Total operational status is ONLINE.",
                "category": "Restricted"
            }
        readings = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).limit(10).all()
        avg_power = sum(r.power_kw for r in readings) / len(readings) if readings else 42.5
        total_kwh = sum(r.daily_kwh for r in readings) if readings else 510.0
        return {
            "reply": f"Energy Consumption Overview: Current Average Load: {avg_power:.1f} kW | Daily Consumption: {total_kwh:.1f} kWh | Projected Monthly Cost: $1,420.00.",
            "category": "Energy"
        }

    # Default fallback
    return {
        "reply": f"I analyzed current SQLite warehouse tables. System status: Active. Key metrics: {db.query(Product).count()} SKUs registered, {db.query(Vehicle).count()} fleet vehicles monitored, {db.query(Worker).count()} staff on roster. How else can I assist your operational tasks today?",
        "category": "General"
    }
