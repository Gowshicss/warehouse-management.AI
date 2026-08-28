from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
import random
from ..database import get_db
from ..models import Product, Inventory, InventoryTransaction, Supplier, Warehouse, User
from ..schemas import ProductCreate, ProductUpdate, StockAdjust
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("")
def list_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inventory).join(Product)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_pattern)) | 
            (Product.sku.ilike(search_pattern))
        )
    if category and category != "All Categories":
        query = query.filter(Product.category == category)
    if status and status != "All Items":
        query = query.filter(Inventory.status == status.upper())
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)

    items = query.all()

    res = []
    for inv in items:
        p = inv.product
        res.append({
            "id": p.id,
            "inventory_id": inv.id,
            "product_name": p.name,
            "sku": p.sku,
            "category": p.category,
            "supplier": p.supplier.name if p.supplier else "Acme Industrial",
            "unit_type": p.unit_type,
            "current_stock": inv.current_stock,
            "min_stock": p.min_stock,
            "max_capacity": p.max_capacity,
            "reorder_level": p.reorder_level,
            "unit_cost": p.unit_cost,
            "total_value": round(inv.current_stock * p.unit_cost, 2),
            "location": f"WH-Alpha {inv.zone_code}-R{inv.rack_code}-S{inv.shelf_code}",
            "full_location": {
                "warehouse": inv.warehouse.name if inv.warehouse else "WH-Alpha",
                "zone": inv.zone_code,
                "aisle": inv.aisle_code,
                "rack": inv.rack_code,
                "shelf": inv.shelf_code,
                "bin": inv.bin_code
            },
            "status": inv.status,
            "last_received": inv.last_received.isoformat() if inv.last_received else None,
            "image_url": p.image_url
        })
    return res

@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    inv = p.inventory
    avg_usage = inv.avg_daily_usage if inv else 15.0
    current_stock = inv.current_stock if inv else 0
    est_days = int(current_stock / (avg_usage or 1.0))

    # Generate synthetic 30-day stock history graph points
    history_points = []
    base_stock = current_stock + 300
    today = datetime.utcnow()
    for i in range(30, -1, -1):
        dt = today - timedelta(days=i)
        base_stock -= random.randint(5, 25)
        if base_stock < current_stock:
            base_stock = current_stock + random.randint(0, 40)
        history_points.append({
            "date": dt.strftime("%b %d"),
            "stock": base_stock if i > 0 else current_stock
        })

    return {
        "id": p.id,
        "name": p.name,
        "sku": p.sku,
        "category": p.category,
        "supplier": p.supplier.name if p.supplier else "Acme Industrial Supply",
        "unit_type": p.unit_type,
        "unit_cost": p.unit_cost,
        "current_stock": current_stock,
        "min_stock": p.min_stock,
        "reorder_level": p.reorder_level,
        "max_capacity": p.max_capacity,
        "status": inv.status if inv else "HEALTHY",
        "location": {
            "warehouse": inv.warehouse.name if inv and inv.warehouse else "WH-Alpha",
            "zone": inv.zone_code if inv else "Zone A",
            "aisle": inv.aisle_code if inv else "12",
            "rack": inv.rack_code if inv else "04",
            "shelf": inv.shelf_code if inv else "B",
            "bin": inv.bin_code if inv else "A12-04-B-02"
        },
        "ai_insights": {
            "avg_daily_usage": f"~{avg_usage:.0f} {p.unit_type}s",
            "est_days_remaining": f"{est_days} Days",
            "reorder_recommendation": f"Reorder {p.reorder_level} units within {max(1, est_days - 5)} days"
        },
        "history": history_points
    }

@router.post("")
def create_product(payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    product = Product(
        name=payload.name,
        sku=payload.sku,
        category=payload.category,
        supplier_id=payload.supplier_id,
        unit_type=payload.unit_type,
        min_stock=payload.min_stock,
        max_capacity=payload.max_capacity,
        reorder_level=payload.reorder_level,
        unit_cost=payload.unit_cost
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Initial inventory status calculation
    status_val = "HEALTHY"
    if payload.initial_stock == 0:
        status_val = "OUT OF STOCK"
    elif payload.initial_stock <= payload.min_stock:
        status_val = "CRITICAL"
    elif payload.initial_stock <= payload.reorder_level:
        status_val = "LOW STOCK"

    inv = Inventory(
        product_id=product.id,
        warehouse_id=payload.warehouse_id,
        zone_code=payload.zone_code,
        aisle_code=payload.aisle_code,
        rack_code=payload.rack_code,
        shelf_code=payload.shelf_code,
        bin_code=payload.bin_code,
        current_stock=payload.initial_stock,
        status=status_val
    )
    db.add(inv)
    db.commit()
    return {"message": "Product created successfully", "product_id": product.id}

@router.post("/{product_id}/adjust")
def adjust_stock(product_id: int, payload: StockAdjust, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p or not p.inventory:
        raise HTTPException(status_code=404, detail="Product inventory record not found")

    inv = p.inventory
    inv.current_stock = max(0, inv.current_stock + payload.quantity_change)

    if inv.current_stock == 0:
        inv.status = "OUT OF STOCK"
    elif inv.current_stock <= p.min_stock:
        inv.status = "CRITICAL"
    elif inv.current_stock <= p.reorder_level:
        inv.status = "LOW STOCK"
    else:
        inv.status = "HEALTHY"

    tx = InventoryTransaction(
        product_id=p.id,
        transaction_type="IN" if payload.quantity_change > 0 else "OUT",
        quantity=abs(payload.quantity_change),
        note=payload.note
    )
    db.add(tx)
    db.commit()
    return {"message": "Stock adjusted successfully", "new_stock": inv.current_stock, "status": inv.status}
