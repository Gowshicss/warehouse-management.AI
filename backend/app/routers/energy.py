from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from ..database import get_db
from ..models import EnergyMeter, EnergyReading, User
from ..dependencies import require_owner

router = APIRouter(prefix="/api/energy", tags=["Energy Monitoring (Owner Only)"])

@router.get("/summary")
def get_energy_summary(db: Session = Depends(get_db), owner_user: User = Depends(require_owner)):
    readings = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).limit(24).all()
    latest = readings[0] if readings else None

    current_power = latest.power_kw if latest else 42.5
    daily_kwh = latest.daily_kwh if latest else 510.0
    est_cost = daily_kwh * 8 * 30  # $0.15/kWh for 30 days

    # Hourly distribution chart data
    hourly_chart = []
    now = datetime.utcnow()
    for i in range(12, -1, -1):
        t = now - timedelta(hours=i*2)
        p = round(35.0 + random.uniform(5.0, 20.0), 1)
        hourly_chart.append({
            "time": t.strftime("%H:00"),
            "power_kw": p,
            "cost": round(p * 0.15, 2)
        })

    return {
        "current_power_kw": current_power,
        "daily_consumption_kwh": daily_kwh,
        "estimated_monthly_cost": round(est_cost, 2),
        "power_factor": latest.power_factor if latest else 0.95,
        "voltage_v": latest.voltage_v if latest else 230.0,
        "current_a": latest.current_a if latest else 48.2,
        "zone_breakdown": [
            {"zone": "Zone A (Receiving & Storage)", "kwh": 210, "pct": 41},
            {"zone": "Zone B (Sorting & Conveyors)", "kwh": 160, "pct": 31},
            {"zone": "Zone C (Cold Storage Racks)", "kwh": 90, "pct": 18},
            {"zone": "Dock & Exterior Yard", "kwh": 50, "pct": 10}
        ],
        "hourly_chart": hourly_chart
    }

@router.post("/simulate")
def simulate_energy_reading(power_kw: float = 58.5, db: Session = Depends(get_db), owner_user: User = Depends(require_owner)):
    meter = db.query(EnergyMeter).first()
    meter_id = meter.id if meter else 1

    reading = EnergyReading(
        meter_id=meter_id,
        power_kw=power_kw,
        voltage_v=232.0,
        current_a=round(power_kw * 1000 / 232 / 1.732, 1),
        power_factor=0.96,
        daily_kwh=580.0,
        estimated_cost=87.0,
        timestamp=datetime.utcnow()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading
