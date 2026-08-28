from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from ..database import get_db
from ..models import Receiving, Product, User
from ..schemas import ReceivingVerifyRequest
from ..services.receiving_service import verify_and_process_receiving
from ..services.cv_service import process_cv_receiving_count
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/receiving", tags=["Receiving"])

@router.get("")
def list_receivings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Receiving).order_by(Receiving.timestamp.desc()).all()
    return items

@router.post("/verify")
def verify_receiving(payload: ReceivingVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = verify_and_process_receiving(
        db=db,
        invoice_number=payload.invoice_number,
        supplier_name=payload.supplier_name,
        product_name=payload.product_name,
        sku=payload.sku,
        expected_qty=payload.expected_qty,
        cv_detected_qty=payload.cv_detected_qty,
        weight_measured_qty=payload.weight_measured_qty,
        tolerance_pct=payload.tolerance_pct,
        vehicle_code=payload.vehicle_code
    )
    return rec

@router.post("/simulate")
def simulate_receiving_gate(mismatch: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).all()
    if not products:
        raise HTTPException(status_code=400, detail="No products seeded")

    p = random.choice(products)
    expected = 100
    if mismatch:
        cv_qty = 99
        weight_qty = 98.5
        inv_num = f"INV-ERR-{random.randint(100, 999)}"
    else:
        cv_qty = 100
        weight_qty = 100.0
        inv_num = f"INV-OK-{random.randint(100, 999)}"

    rec = verify_and_process_receiving(
        db=db,
        invoice_number=inv_num,
        supplier_name="Acme Industrial Supply",
        product_name=p.name,
        sku=p.sku,
        expected_qty=expected,
        cv_detected_qty=cv_qty,
        weight_measured_qty=weight_qty,
        tolerance_pct=2.0,
        vehicle_code="TRUCK-04"
    )
    return rec
