from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import random
from ..database import get_db
from ..models import Vehicle, VehicleTelemetry, User
from ..services.vehicle_service import update_vehicle_telemetry
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/vehicles", tags=["Vehicle Tracking & Health"])

@router.get("")
def list_vehicles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicles = db.query(Vehicle).all()
    res = []
    for v in vehicles:
        res.append({
            "id": v.id,
            "vehicle_code": v.vehicle_code,
            "name": v.name,
            "type": v.type,
            "warehouse": v.warehouse_name,
            "current_zone": v.current_zone,
            "speed_kmh": v.speed_kmh,
            "fuel_pct": v.fuel_pct,
            "engine_temp_c": v.engine_temp_c,
            "hydraulic_press_psi": v.hydraulic_press_psi,
            "health_score": v.health_score,
            "status": v.status,
            "maintenance_status": v.maintenance_status,
            "last_update": v.last_update.isoformat() if v.last_update else None
        })
    return res

@router.get("/{vehicle_id}")
def get_vehicle_detail(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    telemetry_history = db.query(VehicleTelemetry).filter(VehicleTelemetry.vehicle_id == v.id).order_by(VehicleTelemetry.timestamp.desc()).limit(15).all()
    
    return {
        "vehicle": v,
        "telemetry_history": telemetry_history
    }

@router.post("/simulate")
def simulate_vehicle_telemetry(vehicle_code: str = "V03", critical: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_code == vehicle_code).first()
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_code} not found")

    if critical:
        temp = 112.0
        press = 1650.0
        battery = 35.0
        speed = 8.4
    else:
        temp = 75.0
        press = 2100.0
        battery = 92.0
        speed = 4.5

    updated = update_vehicle_telemetry(
        db=db,
        vehicle_id=v.id,
        speed=speed,
        battery=battery,
        temp=temp,
        pressure=press
    )
    return updated
