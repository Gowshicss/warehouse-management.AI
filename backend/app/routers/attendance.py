from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import Worker, Attendance, User
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["Worker Attendance"])

@router.get("/today")
def get_today_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    workers = db.query(Worker).all()
    total = len(workers)
    present = sum(1 for w in workers if w.status == "PRESENT")
    absent = sum(1 for w in workers if w.status == "ABSENT")
    on_leave = sum(1 for w in workers if w.status == "ON LEAVE")

    return {
        "summary": {
            "total_assigned": total,
            "present": present,
            "absent": absent,
            "on_leave": on_leave,
            "percentage": round((present / (total or 1)) * 100, 1)
        },
        "workers": workers
    }

@router.post("/event")
def record_attendance_event(worker_id: int, camera_code: str = "CCTV-01", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return {"error": "Worker not found"}

    worker.status = "PRESENT"
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    att = db.query(Attendance).filter(Attendance.worker_id == worker.id, Attendance.date == today_str).first()
    
    if not att:
        att = Attendance(
            worker_id=worker.id,
            date=today_str,
            check_in_time=datetime.utcnow().strftime("%H:%M:%S"),
            last_detected_camera_code=camera_code,
            status="PRESENT"
        )
        db.add(att)
    else:
        att.last_detected_camera_code = camera_code
        att.status = "PRESENT"

    db.commit()
    return {"message": f"Attendance recorded for {worker.name}", "status": "PRESENT"}
