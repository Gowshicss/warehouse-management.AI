# SMART WAREHOUSE MANAGEMENT SYSTEM

An intelligent, fully integrated industrial warehouse management platform combining Python/FastAPI backend, SQLite database, OpenCV Computer Vision, IoT/ESP32 sensor simulations, AI priority engine & chatbot, and a modern React.js frontend.

---

## 🌟 Key Features

1. **AI Operational Priorities ("WHAT SHOULD I DO TODAY?")**
   - Automatically calculates priorities based on real database conditions (`URGENT`, `HIGH PRIORITY`, `ATTENTION`, `ROUTINE`).
   - Detects low stock reserves, critical vehicle temperatures, receiving mismatches, and PPE violations.

2. **Automated Warehouse Receiving**
   - Verification gate comparing expected invoice quantities against Computer Vision (CV) detected quantities and IoT Weight Sensor measurements.
   - Computes ±2% tolerance check and outputs `ACCEPTED` vs `REVIEW` decisions.
   - Interactive simulation triggers for hackathon demonstration.

3. **CCTV & Worker Safety Surveillance**
   - Simulated 4K AI-enabled camera feeds overlaying real-time worker bounding boxes.
   - Compliant vs missing helmet/gloves detection.
   - AI safety event logging and worker attendance tracking.

4. **Vehicle Tracking & Predictive Telemetry Health**
   - Fleet tracking for Forklifts, AGVs, and Pallet Trucks.
   - Real-time engine temperature, hydraulic pressure, speed, and battery monitoring.
   - Health score algorithm generating alerts when engine temperature exceeds 105°C (V03 critical demo scenario).

5. **Role-Based Access Control (RBAC)**
   - **OWNER**: Full system access including energy power consumption (kW), utility cost estimations, and financial asset valuations.
   - **MANAGER**: Full operational access (Inventory, Receiving, CCTV, Attendance, Fleet, Map), but strictly blocked (403 Forbidden backend enforcement) from energy cost & financial metrics.

6. **Interactive 2D Warehouse Blueprint Map**
   - Spatial layout of Zone A, B, C, storage racks, live moving vehicles, and camera nodes.

7. **Database-Backed AI Assistant**
   - Natural language query engine fetching real SQLite data for questions like "Which products may run out soon?" or "Which vehicle has the lowest health?".

---

## 🚀 How to Run Locally

### 1. Backend Setup (FastAPI & SQLite)

```bash
cd backend

# Create & activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the SQLite database with full hackathon dataset
python app/seed.py

# Start the FastAPI Uvicorn server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will run on `http://127.0.0.1:8000` with documentation available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React.js & Vite)

```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

The frontend UI will run on `http://localhost:3000`.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Owner** | `owner@smartwarehouse.com` | `password123` | Full access (including Energy & Financials) |
| **Manager** | `manager@smartwarehouse.com` | `password123` | Operational access (Energy & Financials restricted) |
