from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, Inventory, Vehicle, SafetyEvent, Attendance, EnergyReading, User
from ..dependencies import get_current_user, require_owner

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/summary")
def get_ai_report_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_products = db.query(Product).count()
    low_stock_count = db.query(Inventory).filter(Inventory.status.in_(["LOW STOCK", "CRITICAL"])).count()
    critical_vehicle = db.query(Vehicle).filter(Vehicle.status == "CRITICAL").first()
    safety_violations = db.query(SafetyEvent).filter(SafetyEvent.event_type == "PPE_VIOLATION").count()

    summary_text = (
        f"Warehouse operations remained stable across active shifts. Currently monitoring {total_products} SKUs, "
        f"where {low_stock_count} high-demand items require stock replenishment. "
        f"{'Vehicle ' + critical_vehicle.vehicle_code + ' requires immediate maintenance shutdown due to engine overheating.' if critical_vehicle else 'Fleet operations are running within nominal health parameters.'} "
        f"A total of {safety_violations} PPE compliance violations were logged today. Facility energy consumption trends remain on forecast."
    )
    return {
        "generated_at": "Today, 17:45",
        "executive_summary": summary_text,
        "metrics": {
            "monitored_skus": total_products,
            "replenishment_needed": low_stock_count,
            "safety_alerts": safety_violations
        }
    }

@router.get("/inventory")
def get_inventory_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Inventory).join(Product).all()
    return [
        {
            "sku": inv.product.sku,
            "name": inv.product.name,
            "category": inv.product.category,
            "current_stock": inv.current_stock,
            "min_stock": inv.product.min_stock,
            "unit_cost": inv.product.unit_cost,
            "total_value": round(inv.current_stock * inv.product.unit_cost, 2),
            "status": inv.status
        }
        for inv in items if inv.product
    ]

@router.get("/vehicles")
def get_vehicles_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicles = db.query(Vehicle).all()
    return [
        {
            "code": v.vehicle_code,
            "name": v.name,
            "type": v.type,
            "health_score": v.health_score,
            "status": v.status,
            "engine_temp": v.engine_temp_c,
            "hydraulic_pressure": v.hydraulic_press_psi
        }
        for v in vehicles
    ]

@router.get("/safety")
def get_safety_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.query(SafetyEvent).order_by(SafetyEvent.timestamp.desc()).all()
    return events

@router.get("/energy")
def get_energy_report(db: Session = Depends(get_db), owner_user: User = Depends(require_owner)):
    readings = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).all()
    return readings

@router.get("/financial")
def get_financial_report(db: Session = Depends(get_db), owner_user: User = Depends(require_owner)):
    total_val = sum(inv.current_stock * inv.product.unit_cost for inv in db.query(Inventory).all() if inv.product)
    return {
        "currency": "USD",
        "total_inventory_asset_value": round(total_val, 2),
        "monthly_warehouse_operating_cost": 18450.0,
        "estimated_utility_power_cost": 1420.0,
        "vehicle_maintenance_budget": 3500.0,
        "projected_monthly_profit_margin": "24.8%"
    }
