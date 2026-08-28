from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import StockOut, Product, Inventory, InventoryTransaction, Alert, User
from ..schemas import StockOutRequest
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/stock", tags=["Stock-Out Management"])

@router.get("/out")
def list_stock_outs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StockOut).order_by(StockOut.timestamp.desc()).all()

@router.post("/out")
def dispatch_stock_out(payload: StockOutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == payload.product_id).first()
    if not p or not p.inventory:
        raise HTTPException(status_code=404, detail="Product or inventory record not found")

    inv = p.inventory
    if inv.current_stock < payload.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient Stock: Requested {payload.quantity} {p.unit_type}s, but only {inv.current_stock} available."
        )

    previous_stock = inv.current_stock
    inv.current_stock -= payload.quantity
    inv.last_issued = datetime.utcnow()

    # Recalculate status
    if inv.current_stock == 0:
        inv.status = "OUT OF STOCK"
    elif inv.current_stock <= p.min_stock:
        inv.status = "CRITICAL"
    elif inv.current_stock <= p.reorder_level:
        inv.status = "LOW STOCK"

    # Log inventory tx
    tx = InventoryTransaction(
        product_id=p.id,
        transaction_type="OUT",
        quantity=payload.quantity,
        note=f"Dispatch Out to {payload.destination} by {payload.requested_by}"
    )
    db.add(tx)

    # Log stock out record
    so = StockOut(
        product_id=p.id,
        quantity=payload.quantity,
        destination=payload.destination,
        requested_by=payload.requested_by,
        status="COMPLETED",
        timestamp=datetime.utcnow()
    )
    db.add(so)

    # AI Stock-out risk analysis message
    avg_usage = inv.avg_daily_usage or 10.0
    est_days_remaining = round(inv.current_stock / avg_usage, 1)

    ai_msg = f"Stock dispatch completed. Remaining Stock: {inv.current_stock} {p.unit_type}s. At current daily usage rate ({avg_usage:.0f}/day), estimated days remaining: {est_days_remaining} days."
    if inv.current_stock <= p.reorder_level:
        ai_msg += f" WARNING: Product stock is decreasing rapidly and has crossed the reorder threshold ({p.reorder_level}). Recommended action: Expedite reorder."

    db.commit()

    return {
        "message": "Stock dispatch successful",
        "previous_stock": previous_stock,
        "outgoing_quantity": payload.quantity,
        "remaining_stock": inv.current_stock,
        "status": inv.status,
        "estimated_days_remaining": est_days_remaining,
        "ai_risk_analysis": ai_msg
    }

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Alert).filter(Alert.status == "ACTIVE").order_by(Alert.created_at.desc()).all()
