-- SMART WAREHOUSE MANAGEMENT SYSTEM - SUPABASE POSTGRES MIGRATION SCHEMA

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    full_name VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'MANAGER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    total_capacity_sqft DOUBLE PRECISION DEFAULT 50000.0,
    used_capacity_pct DOUBLE PRECISION DEFAULT 65.0
);

-- 3. Zones Table
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    zone_type VARCHAR DEFAULT 'Storage'
);

-- 4. Racks Table
CREATE TABLE IF NOT EXISTS racks (
    id SERIAL PRIMARY KEY,
    zone_id INT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL
);

-- 5. Shelves Table
CREATE TABLE IF NOT EXISTS shelves (
    id SERIAL PRIMARY KEY,
    rack_id INT NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL
);

-- 6. Bins Table
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    shelf_id INT NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL
);

-- 7. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    contact_person VARCHAR,
    email VARCHAR,
    phone VARCHAR
);

-- 8. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    sku VARCHAR UNIQUE NOT NULL,
    category VARCHAR NOT NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_type VARCHAR DEFAULT 'Box',
    min_stock INT DEFAULT 50,
    max_capacity INT DEFAULT 1000,
    reorder_level INT DEFAULT 100,
    unit_cost DOUBLE PRECISION DEFAULT 10.0,
    image_url VARCHAR
);

-- 9. Inventories Table
CREATE TABLE IF NOT EXISTS inventories (
    id SERIAL PRIMARY KEY,
    product_id INT UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_code VARCHAR DEFAULT 'Zone A',
    aisle_code VARCHAR DEFAULT '12',
    rack_code VARCHAR DEFAULT '04',
    shelf_code VARCHAR DEFAULT 'B',
    bin_code VARCHAR DEFAULT 'A12-04-B-02',
    current_stock INT DEFAULT 0,
    status VARCHAR DEFAULT 'HEALTHY',
    avg_daily_usage DOUBLE PRECISION DEFAULT 15.0,
    last_received TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_issued TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    transaction_type VARCHAR NOT NULL,
    quantity INT NOT NULL,
    reference_id VARCHAR,
    note VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Receivings Table
CREATE TABLE IF NOT EXISTS receivings (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR NOT NULL,
    supplier_name VARCHAR NOT NULL,
    vehicle_code VARCHAR DEFAULT 'TRUCK-01',
    product_name VARCHAR NOT NULL,
    expected_qty INT NOT NULL,
    cv_detected_qty INT NOT NULL,
    weight_measured_qty DOUBLE PRECISION NOT NULL,
    tolerance_pct DOUBLE PRECISION DEFAULT 2.0,
    status VARCHAR NOT NULL,
    decision_reason VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    worker_code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'Warehouse Specialist',
    assigned_zone VARCHAR DEFAULT 'Zone A',
    badge_id VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'PRESENT'
);

-- 13. Attendances Table
CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    date VARCHAR NOT NULL,
    check_in_time VARCHAR,
    check_out_time VARCHAR,
    last_detected_camera_code VARCHAR DEFAULT 'CCTV-01',
    status VARCHAR DEFAULT 'PRESENT'
);

-- 14. Cameras Table
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    camera_code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    zone_name VARCHAR NOT NULL,
    ip_address VARCHAR DEFAULT '192.168.1.104',
    fps INT DEFAULT 30,
    resolution VARCHAR DEFAULT '1080p',
    status VARCHAR DEFAULT 'LIVE'
);

-- 15. Safety Events Table
CREATE TABLE IF NOT EXISTS safety_events (
    id SERIAL PRIMARY KEY,
    camera_code VARCHAR NOT NULL,
    zone_name VARCHAR NOT NULL,
    worker_name VARCHAR,
    event_type VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    helmet_status VARCHAR DEFAULT 'OK',
    glove_status VARCHAR DEFAULT 'OK',
    confidence DOUBLE PRECISION DEFAULT 94.0,
    status VARCHAR DEFAULT 'REVIEW',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    type VARCHAR DEFAULT 'FORKLIFT',
    warehouse_name VARCHAR DEFAULT 'WH-Alpha',
    current_zone VARCHAR DEFAULT 'Loading Dock B',
    speed_kmh DOUBLE PRECISION DEFAULT 5.2,
    fuel_pct DOUBLE PRECISION DEFAULT 85.0,
    engine_temp_c DOUBLE PRECISION DEFAULT 78.0,
    hydraulic_press_psi DOUBLE PRECISION DEFAULT 2100.0,
    health_score INT DEFAULT 95,
    status VARCHAR DEFAULT 'ACTIVE',
    maintenance_status VARCHAR DEFAULT 'Good',
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Vehicle Telemetries Table
CREATE TABLE IF NOT EXISTS vehicle_telemetries (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    speed DOUBLE PRECISION NOT NULL,
    battery_level DOUBLE PRECISION NOT NULL,
    engine_temp DOUBLE PRECISION NOT NULL,
    pressure DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Energy Meters Table
CREATE TABLE IF NOT EXISTS energy_meters (
    id SERIAL PRIMARY KEY,
    meter_code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    zone_name VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'ONLINE'
);

-- 19. Energy Readings Table
CREATE TABLE IF NOT EXISTS energy_readings (
    id SERIAL PRIMARY KEY,
    meter_id INT NOT NULL REFERENCES energy_meters(id) ON DELETE CASCADE,
    power_kw DOUBLE PRECISION NOT NULL,
    voltage_v DOUBLE PRECISION DEFAULT 230.0,
    current_a DOUBLE PRECISION DEFAULT 45.0,
    power_factor DOUBLE PRECISION DEFAULT 0.95,
    daily_kwh DOUBLE PRECISION DEFAULT 450.0,
    estimated_cost DOUBLE PRECISION DEFAULT 67.5,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR NOT NULL,
    module VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    entity_type VARCHAR,
    entity_id VARCHAR,
    recommended_action VARCHAR,
    action_type VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Stock Outs Table
CREATE TABLE IF NOT EXISTS stock_outs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    destination VARCHAR DEFAULT 'Order Dispatch Dock 2',
    requested_by VARCHAR DEFAULT 'Manager',
    status VARCHAR DEFAULT 'COMPLETED',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) on all tables while allowing backend access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_telemetries ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_outs ENABLE ROW LEVEL SECURITY;

-- Allow service_role and authenticated backend access
CREATE POLICY "Allow backend access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow backend access to warehouses" ON warehouses FOR ALL USING (true);
CREATE POLICY "Allow backend access to zones" ON zones FOR ALL USING (true);
CREATE POLICY "Allow backend access to racks" ON racks FOR ALL USING (true);
CREATE POLICY "Allow backend access to shelves" ON shelves FOR ALL USING (true);
CREATE POLICY "Allow backend access to bins" ON bins FOR ALL USING (true);
CREATE POLICY "Allow backend access to suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow backend access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow backend access to inventories" ON inventories FOR ALL USING (true);
CREATE POLICY "Allow backend access to inventory_transactions" ON inventory_transactions FOR ALL USING (true);
CREATE POLICY "Allow backend access to receivings" ON receivings FOR ALL USING (true);
CREATE POLICY "Allow backend access to workers" ON workers FOR ALL USING (true);
CREATE POLICY "Allow backend access to attendances" ON attendances FOR ALL USING (true);
CREATE POLICY "Allow backend access to cameras" ON cameras FOR ALL USING (true);
CREATE POLICY "Allow backend access to safety_events" ON safety_events FOR ALL USING (true);
CREATE POLICY "Allow backend access to vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow backend access to vehicle_telemetries" ON vehicle_telemetries FOR ALL USING (true);
CREATE POLICY "Allow backend access to energy_meters" ON energy_meters FOR ALL USING (true);
CREATE POLICY "Allow backend access to energy_readings" ON energy_readings FOR ALL USING (true);
CREATE POLICY "Allow backend access to alerts" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow backend access to stock_outs" ON stock_outs FOR ALL USING (true);
