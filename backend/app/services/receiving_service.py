from sqlalchemy.orm import Session
from datetime import datetime
from ..models import Receiving, Product, Inventory, InventoryTransaction, Alert

def verify_and_process_receiving(
    db: Session,
    invoice_number: str,
    supplier_name: str,
    product_name: str,
    sku: str,
    expected_qty: int,
    cv_detected_qty: int,
    weight_measured_qty: float,
    tolerance_pct: float = 2.0,
    vehicle_code: str = "TRUCK-01"
) -> Receiving:
    # Calculate percentage differences
    cv_diff_pct = abs(cv_detected_qty - expected_qty) / expected_qty * 100.0
    weight_diff_pct = abs(weight_measured_qty - expected_qty) / expected_qty * 100.0

    # Decision logic
    if cv_diff_pct <= tolerance_pct and weight_diff_pct <= tolerance_pct:
        decision_status = "ACCEPTED"
        reason = f"Verified: CV count ({cv_detected_qty}) and Weight sensor ({weight_measured_qty}) match expected within {tolerance_pct}% tolerance."
    else:
        decision_status = "REVIEW"
        reason = f"Mismatch Detected: CV ({cv_detected_qty}) / Weight ({weight_measured_qty:.1f}) exceeds {tolerance_pct}% tolerance against expected ({expected_qty})."

    receiving_record = Receiving(
        invoice_number=invoice_number,
        supplier_name=supplier_name,
        vehicle_code=vehicle_code,
        product_name=product_name,
        expected_qty=expected_qty,
        cv_detected_qty=cv_detected_qty,
        weight_measured_qty=weight_measured_qty,
        tolerance_pct=tolerance_pct,
        status=decision_status,
        decision_reason=reason,
        timestamp=datetime.utcnow()
    )
    db.add(receiving_record)
    db.commit()
    db.refresh(receiving_record)

    # Find product by SKU
    product = db.query(Product).filter(Product.sku == sku).first()

    if decision_status == "ACCEPTED":
        if product and product.inventory:
            inv = product.inventory
            inv.current_stock += expected_qty
            inv.last_received = datetime.utcnow()
            
            # Recalculate status
            if inv.current_stock == 0:
                inv.status = "OUT OF STOCK"
            elif inv.current_stock <= product.min_stock:
                inv.status = "CRITICAL"
            elif inv.current_stock <= product.reorder_level:
                inv.status = "LOW STOCK"
            else:
                inv.status = "HEALTHY"

            # Log transaction
            tx = InventoryTransaction(
                product_id=product.id,
                transaction_type="IN",
                quantity=expected_qty,
                reference_id=invoice_number,
                note=f"Automated Receiving Gate match ({supplier_name})"
            )
            db.add(tx)
            db.commit()
    else:
        # Create alert for receiving mismatch
        alert = Alert(
            severity="URGENT",
            module="Receiving Module",
            title=f"Receiving Mismatch: Invoice #{invoice_number}",
            description=reason,
            entity_type="Receiving",
            entity_id=str(receiving_record.id),
            recommended_action="Inspect Physical Shipment & Re-weigh",
            action_type="review_analytics",
            status="ACTIVE"
        )
        db.add(alert)
        db.commit()

    return receiving_record
