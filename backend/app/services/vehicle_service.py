from sqlalchemy.orm import Session
from datetime import datetime
from ..models import Vehicle, VehicleTelemetry, Alert

def calculate_vehicle_health(vehicle: Vehicle) -> dict:
    score = 100
    reasons = []

    if vehicle.engine_temp_c >= 110.0:
        score -= 50
        reasons.append(f"Engine Temp Critical ({vehicle.engine_temp_c}°C)")
    elif vehicle.engine_temp_c >= 95.0:
        score -= 20
        reasons.append(f"Engine Temp Elevated ({vehicle.engine_temp_c}°C)")

    if vehicle.hydraulic_press_psi < 1800.0:
        score -= 25
        reasons.append(f"Hydraulic Pressure Low ({vehicle.hydraulic_press_psi} PSI)")

    if vehicle.fuel_pct < 15.0:
        score -= 15
        reasons.append(f"Low Fuel/Battery ({vehicle.fuel_pct}%)")

    score = max(0, min(100, score))

    if score < 50:
        status = "CRITICAL"
        maint = "Immediate Maintenance Required"
    elif score < 80:
        status = "MAINTENANCE_SOON"
        maint = "Schedule Inspection"
    else:
        status = "ACTIVE"
        maint = "Optimal"

    vehicle.health_score = score
    vehicle.status = status
    vehicle.maintenance_status = maint
    vehicle.last_update = datetime.utcnow()

    return {
        "score": score,
        "status": status,
        "maintenance_status": maint,
        "reasons": reasons
    }

def update_vehicle_telemetry(
    db: Session,
    vehicle_id: int,
    speed: float,
    battery: float,
    temp: float,
    pressure: float
) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        return None

    vehicle.speed_kmh = speed
    vehicle.fuel_pct = battery
    vehicle.engine_temp_c = temp
    vehicle.hydraulic_press_psi = pressure

    health_info = calculate_vehicle_health(vehicle)

    # Save telemetry log
    telemetry = VehicleTelemetry(
        vehicle_id=vehicle.id,
        speed=speed,
        battery_level=battery,
        engine_temp=temp,
        pressure=pressure,
        timestamp=datetime.utcnow()
    )
    db.add(telemetry)

    # Check if critical alert needed
    if vehicle.status == "CRITICAL":
        existing_alert = db.query(Alert).filter(
            Alert.entity_id == str(vehicle.id),
            Alert.module == "Fleet Module",
            Alert.status == "ACTIVE"
        ).first()

        if not existing_alert:
            alert = Alert(
                severity="URGENT",
                module="Fleet Module",
                title=f"Vehicle {vehicle.vehicle_code} Health Critical",
                description=f"Engine temperature exceeding safe operational thresholds ({temp}°C). Immediate shutdown recommended.",
                entity_type="Vehicle",
                entity_id=str(vehicle.id),
                recommended_action="Schedule Maintenance",
                action_type="schedule_maintenance",
                status="ACTIVE"
            )
            db.add(alert)

    db.commit()
    db.refresh(vehicle)
    return vehicle
