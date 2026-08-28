from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, dashboard, inventory, receiving, cctv, attendance, vehicles, energy, warehouse, stock, ai, reports

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SMART WAREHOUSE MANAGEMENT SYSTEM",
    description="Intelligent Warehouse Operations & Analytics API",
    version="2.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(receiving.router)
app.include_router(cctv.router)
app.include_router(attendance.router)
app.include_router(vehicles.router)
app.include_router(energy.router)
app.include_router(warehouse.router)
app.include_router(stock.router)
app.include_router(ai.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "system": "SMART WAREHOUSE MANAGEMENT SYSTEM",
        "status": "ONLINE",
        "docs_url": "/docs"
    }
