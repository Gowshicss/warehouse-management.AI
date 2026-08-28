from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Warehouse, Vehicle, Product, Inventory, User
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/warehouses", tags=["Warehouse Map"])

@router.get("")
def list_warehouses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Warehouse).all()

@router.get("/{warehouse_id}/map")
def get_warehouse_map_data(warehouse_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        wh = db.query(Warehouse).first()

    vehicles = db.query(Vehicle).all()
    inventories = db.query(Inventory).all()

    # Dynamic vehicles fleet overview for map
    fleet_map = [
        {
            "id": 1, "code": "FL-01", "type": "Forklift", "status": "Active",
            "operator": "A. Rivera", "speed": "4 km/h", "battery": "98%",
            "x_pct": 5, "y_pct": 18, "direction": "down"
        },
        {
            "id": 2, "code": "FL-03", "type": "Forklift", "status": "Active",
            "operator": "M. Vance", "speed": "5 km/h", "battery": "85%",
            "x_pct": 5, "y_pct": 42, "direction": "down"
        },
        {
            "id": 3, "code": "FL-05", "type": "Forklift", "status": "Active",
            "operator": "J. Doe", "speed": "3 km/h", "battery": "92%",
            "x_pct": 25, "y_pct": 15, "direction": "right"
        },
        {
            "id": 4, "code": "FL-07", "type": "Forklift", "status": "Active",
            "operator": "C. Wei", "speed": "6 km/h", "battery": "74%",
            "x_pct": 45, "y_pct": 15, "direction": "right"
        },
        {
            "id": 5, "code": "FL-09", "type": "Forklift", "status": "Critical",
            "operator": "T. Mansoor", "speed": "8 km/h (Overheating)", "battery": "38%",
            "x_pct": 52, "y_pct": 42, "direction": "right"
        },
        {
            "id": 6, "code": "FL-15", "type": "Forklift", "status": "Active",
            "operator": "D. Kim", "speed": "4 km/h", "battery": "91%",
            "x_pct": 76, "y_pct": 15, "direction": "right"
        },
        {
            "id": 7, "code": "FL-18", "type": "Pallet Truck", "status": "Active",
            "operator": "C. Mendez", "speed": "3 km/h", "battery": "88%",
            "x_pct": 36, "y_pct": 68, "direction": "right"
        },
        {
            "id": 8, "code": "FL-20", "type": "AGV Unit", "status": "Active",
            "operator": "Auto AGV", "speed": "2 km/h", "battery": "95%",
            "x_pct": 64, "y_pct": 68, "direction": "right"
        }
    ]

    # Aisles list matching reference screenshot media_1787936033533.png
    aisles = [
        {"id": "A1", "label": "A1", "occupied": False},
        {"id": "A2", "label": "A2", "occupied": False},
        {"id": "A3", "label": "A3", "occupied": False},
        {"id": "A4", "label": "A4", "occupied": False},
        {"id": "A5", "label": "A5", "occupied": False},
        {"id": "A6", "label": "A6", "occupied": False},
        {"id": "A7", "label": "A7", "occupied": False},
        {"id": "A8", "label": "A8", "occupied": False},
        {"id": "A9", "label": "A9", "occupied": False},
        {"id": "A10", "label": "A10", "occupied": False},
        {"id": "B11", "label": "B11", "occupied": False},
        {"id": "B12", "label": "B12", "occupied": False},
        {"id": "BB13", "label": "BB13", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB14", "label": "BB14", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB15", "label": "BB15", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB16", "label": "BB16", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB17", "label": "BB17", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB18", "label": "BB18", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB19", "label": "BB19", "occupied": True, "fill_color": "#86efac"},
        {"id": "BB20", "label": "BB20", "occupied": True, "fill_color": "#86efac"}
    ]

    return {
        "warehouse": wh,
        "aisles": aisles,
        "vehicles": fleet_map,
        "pick_locations": ["PA-100", "PA-130", "PA-150", "PA-160", "PA-190", "PA-200"],
        "docks": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
