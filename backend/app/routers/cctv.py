from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
import random
from ..database import get_db
from ..models import Camera, SafetyEvent, Worker, User
from ..services.cv_service import generate_cctv_frame_base64
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/cctv", tags=["CCTV & Worker Safety"])

@router.get("/cameras")
def get_cameras(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Camera).all()

@router.get("/events")
def get_safety_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SafetyEvent).order_by(SafetyEvent.timestamp.desc()).all()

@router.get("/frame")
def get_cctv_frame(
    camera_code: str = "CCTV-01",
    violation: bool = False,
    event_type: str = "PPE_VIOLATION",
    current_user: User = Depends(get_current_user)
):
    frame_data = generate_cctv_frame_base64(
        camera_code=camera_code,
        has_violation=violation,
        event_type=event_type
    )
    return {"image_data": frame_data}

@router.post("/simulate")
def simulate_cctv_event(
    camera_code: str = "CCTV-01",
    violation_type: str = "PPE_VIOLATION",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workers = db.query(Worker).all()
    worker_name = random.choice(workers).name if workers else "Worker #042"

    if violation_type == "PPE_VIOLATION":
        event = SafetyEvent(
            camera_code=camera_code,
            zone_name="Zone A Receiving Gate",
            worker_name=worker_name,
            event_type="PPE_VIOLATION",
            description="Missing Safety Helmet & Gloves",
            helmet_status="MISSING",
            glove_status="MISSING",
            confidence=94.0,
            status="REVIEW",
            timestamp=datetime.utcnow()
        )
    elif violation_type == "PROXIMITY_ALERT":
        event = SafetyEvent(
            camera_code=camera_code,
            zone_name="Zone B Sorting Conveyor",
            worker_name=worker_name,
            event_type="PROXIMITY_ALERT",
            description="Forklift Distance < 1.8m Hazard",
            helmet_status="OK",
            glove_status="OK",
            confidence=98.0,
            status="REVIEW",
            timestamp=datetime.utcnow()
        )
    else:
        event = SafetyEvent(
            camera_code=camera_code,
            zone_name="Zone C High-Rack Cold Storage",
            worker_name=worker_name,
            event_type="ACCESS_LOG",
            description="Zone C Restricted Entry Violation",
            helmet_status="OK",
            glove_status="OK",
            confidence=97.0,
            status="REVIEW",
            timestamp=datetime.utcnow()
        )

    db.add(event)
    db.commit()
    db.refresh(event)
    return event
