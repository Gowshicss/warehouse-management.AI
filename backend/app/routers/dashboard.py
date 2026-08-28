from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Product, Inventory, Vehicle, Receiving, SafetyEvent, Worker, Warehouse, EnergyReading
from ..dependencies import get_current_user
from ..services.ai_service import get_operational_priorities

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    healthy_count = db.query(Inventory).filter(Inventory.status == "HEALTHY").count()
    low_stock_count = db.query(Inventory).filter(Inventory.status == "LOW STOCK").count()
    critical_count = db.query(Inventory).filter(Inventory.status.in_(["CRITICAL", "OUT OF STOCK"])).count()

    total_workers = db.query(Worker).count()
    present_workers = db.query(Worker).filter(Worker.status == "PRESENT").count()
    absent_workers = db.query(Worker).filter(Worker.status == "ABSENT").count()

    total_vehicles = db.query(Vehicle).count()
    critical_vehicles = db.query(Vehicle).filter(Vehicle.status == "CRITICAL").count()

    pending_receivings = db.query(Receiving).filter(Receiving.status == "REVIEW").count()
    ppe_alerts_today = db.query(SafetyEvent).filter(SafetyEvent.event_type == "PPE_VIOLATION").count()

    avg_wh_capacity = db.query(Warehouse).first().used_capacity_pct if db.query(Warehouse).first() else 68.0

    res = {
        "inventory": {
            "total_items": total_products,
            "healthy": healthy_count,
            "low_stock": low_stock_count,
            "critical": critical_count
        },
        "attendance": {
            "total_workers": total_workers,
            "present": present_workers,
            "absent": absent_workers,
            "percentage": round((present_workers / (total_workers or 1)) * 100, 1)
        },
        "vehicles": {
            "total": total_vehicles,
            "critical": critical_vehicles,
            "healthy": total_vehicles - critical_vehicles
        },
        "receiving": {
            "pending_review": pending_receivings
        },
        "safety": {
            "ppe_violations_today": ppe_alerts_today
        },
        "warehouse": {
            "capacity_utilization": avg_wh_capacity
        }
    }

    # OWNER-ONLY Financial & Energy Metrics
    if current_user.role.upper() == "OWNER":
        latest_energy = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).first()
        res["energy"] = {
            "current_power_kw": latest_energy.power_kw if latest_energy else 42.5,
            "today_consumption_kwh": latest_energy.daily_kwh if latest_energy else 510.0,
            "est_monthly_cost": latest_energy.estimated_cost * 30 if latest_energy else 1420.0,
            "grid_status": "NORMAL"
        }
        res["financials"] = {
            "monthly_expenses": 18450.0,
            "total_inventory_value": sum(inv.current_stock * inv.product.unit_cost for inv in db.query(Inventory).all() if inv.product),
            "est_reorder_cost": sum(inv.product.reorder_level * inv.product.unit_cost for inv in db.query(Inventory).filter(Inventory.status.in_(["LOW STOCK", "CRITICAL"])).all() if inv.product)
        }

    return res

@router.get("/priorities")
def get_priorities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_operational_priorities(db)
