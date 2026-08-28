import React, { useEffect, useState, useRef } from 'react';

const WarehouseMapPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const mapContainerRef = useRef(null);

  const [vehicles, setVehicles] = useState([
    { id: 1, code: 'FL-01', x: 55, y: 220, status: 'Active', operator: 'A. Rivera', speed: '4 km/h' },
    { id: 2, code: 'FL-03', x: 55, y: 420, status: 'Active', operator: 'M. Vance', speed: '3 km/h' },
    { id: 3, code: 'FL-05', x: 280, y: 195, status: 'Active', operator: 'J. Doe', speed: '3 km/h' },
    { id: 4, code: 'FL-07', x: 490, y: 195, status: 'Active', operator: 'C. Wei', speed: '5 km/h' },
    { id: 5, code: 'FL-15', x: 800, y: 195, status: 'Active', operator: 'D. Kim', speed: '4 km/h' },
  ]);

  // Slow forklift drift animation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev =>
        prev.map(v => {
          const dx = (Math.random() - 0.5) * 6;
          const dy = (Math.random() - 0.5) * 6;
          return {
            ...v,
            x: Math.max(20, Math.min(980, v.x + dx)),
            y: Math.max(80, Math.min(520, v.y + dy))
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = () => setZoomLevel(z => Math.min(200, z + 10));
  const handleZoomOut = () => setZoomLevel(z => Math.max(50, z - 10));
  const handleFullscreen = () => {
    setIsFullScreen(f => !f);
  };

  const containerStyle = isFullScreen
    ? { position: 'fixed', inset: 0, zIndex: 9999, background: '#1e293b', display: 'flex', flexDirection: 'column' }
    : { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 };

  // -- Rack definitions --
  const racksRowA = [
    { label: 'A1', x: 100 },
    { label: 'A2', x: 155 },
    { label: 'A3', x: 210 },
    { label: 'A4', x: 265 },
    { label: 'A5', x: 320 },
    { label: 'A6', x: 375 },
    { label: 'A7', x: 430 },
    { label: 'A8', x: 485 },
  ];
  const racksRowB = [
    { label: 'B9', x: 570, filled: false },
    { label: 'B10', x: 625, filled: false },
    { label: 'B11', x: 680, filled: false },
    { label: 'B12', x: 735, filled: false },
  ];
  const racksRowBB = [
    { label: 'B13', x: 570, filled: true },
    { label: 'B14', x: 625, filled: true },
    { label: 'B15', x: 680, filled: true },
    { label: 'B16', x: 735, filled: true },
    { label: 'B17', x: 790, filled: true },
    { label: 'B18', x: 845, filled: true },
    { label: 'B19', x: 900, filled: true },
    { label: 'B20', x: 955, filled: true },
  ];

  // Loading bays
  const loadingBays = [
    { num: 1, x: 140 },
    { num: 2, x: 210 },
    { num: 3, x: 280 },
    { num: 4, x: 350 },
    { num: 5, x: 420 },
    { num: 6, x: 530 },
    { num: 7, x: 600 },
    { num: 8, x: 670 },
    { num: 9, x: 780 },
    { num: 10, x: 850 },
  ];

  return (
    <div style={containerStyle}>
      {/* Top Header Bar */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155',
        flexShrink: 0
      }}>
        <h1 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '0.3px', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Real-time Floor map
        </h1>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: '#334155',
              border: '1px solid #475569',
              borderRadius: 4,
              color: '#e2e8f0',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <span>Actives...</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: '#1e293b', border: '1px solid #475569', borderRadius: 6,
              padding: 8, minWidth: 160, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              {vehicles.map(v => (
                <div key={v.id} style={{
                  padding: '6px 10px', fontSize: 11, color: '#cbd5e1', cursor: 'pointer',
                  borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => { setSelectedVehicle(v); setShowDropdown(false); }}
                >
                  <span style={{ fontWeight: 600 }}>{v.code}</span>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: v.status === 'Active' ? '#4ade80' : '#fbbf24'
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div
        ref={mapContainerRef}
        style={{
          flex: 1,
          background: '#cbd5e1',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 12,
          position: 'relative',
          minHeight: 0
        }}
      >
        <div style={{
          width: 1060,
          height: 780,
          background: '#e8ecf1',
          border: '3px solid #475569',
          borderRadius: 2,
          position: 'relative',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
          userSelect: 'none',
          flexShrink: 0
        }}
          onClick={() => setSelectedVehicle(null)}
        >
          {/* SVG Warehouse Layout */}
          <svg
            width="1060"
            height="780"
            viewBox="0 0 1060 780"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Background */}
            <rect width="1060" height="780" fill="#e8ecf1" />

            {/* ===== TOP WALL ===== */}
            <rect x="0" y="0" width="1060" height="8" fill="#94a3b8" />
            <rect x="0" y="0" width="8" height="780" fill="#94a3b8" />
            <rect x="1052" y="0" width="8" height="780" fill="#94a3b8" />

            {/* ===== LEFT RECEIVING AREA ===== */}
            <rect x="12" y="80" width="60" height="460" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
            {/* Receiving label */}
            <text x="42" y="320" textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="700"
              transform="rotate(-90, 42, 320)" letterSpacing="1">
              Receiving
            </text>
            {/* Small status blocks on left */}
            <rect x="18" y="100" width="48" height="22" rx="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <text x="42" y="115" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="600">IN-01</text>
            <rect x="18" y="130" width="48" height="22" rx="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <text x="42" y="145" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="600">IN-02</text>
            <rect x="18" y="160" width="48" height="22" rx="3" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
            <text x="42" y="175" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="600">IN-03</text>
            <rect x="18" y="400" width="48" height="22" rx="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <text x="42" y="415" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="600">IN-04</text>
            <rect x="18" y="430" width="48" height="22" rx="3" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
            <text x="42" y="445" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="600">IN-05</text>

            {/* ===== STORAGE RACKS ROW A (A1-A8) ===== */}
            {racksRowA.map((rack, i) => (
              <g key={rack.label} transform={`translate(${rack.x}, 80)`}>
                {/* Top label */}
                <text x="16" y="-6" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
                {/* Rack body */}
                <rect width="32" height="200" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" rx="1" />
                {/* Center divider */}
                <line x1="16" y1="0" x2="16" y2="200" stroke="#94a3b8" strokeWidth="0.8" />
                {/* Shelf lines */}
                {[...Array(10)].map((_, j) => (
                  <line key={j} x1="0" y1={j * 20} x2="32" y2={j * 20} stroke="#94a3b8" strokeWidth="0.6" />
                ))}
              </g>
            ))}

            {/* ===== STORAGE RACKS ROW B (B9-B12, unfilled) ===== */}
            {racksRowB.map((rack, i) => (
              <g key={rack.label} transform={`translate(${rack.x}, 80)`}>
                <text x="16" y="-6" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
                <rect width="32" height="200" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" rx="1" />
                <line x1="16" y1="0" x2="16" y2="200" stroke="#94a3b8" strokeWidth="0.8" />
                {[...Array(10)].map((_, j) => (
                  <line key={j} x1="0" y1={j * 20} x2="32" y2={j * 20} stroke="#94a3b8" strokeWidth="0.6" />
                ))}
              </g>
            ))}

            {/* ===== STORAGE RACKS ROW BB (B13-B20, green filled) ===== */}
            {racksRowBB.map((rack, i) => (
              <g key={rack.label} transform={`translate(${rack.x}, 310)`}>
                <text x="16" y="-6" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
                <rect width="32" height="200" fill="#dcfce7" stroke="#64748b" strokeWidth="1.5" rx="1" />
                <line x1="16" y1="0" x2="16" y2="200" stroke="#86efac" strokeWidth="0.8" />
                {[...Array(10)].map((_, j) => (
                  <g key={j}>
                    <line x1="0" y1={j * 20} x2="32" y2={j * 20} stroke="#86efac" strokeWidth="0.6" />
                    {/* Green inventory indicators */}
                    <rect x="2" y={j * 20 + 3} width="12" height="14" rx="1" fill="#4ade80" stroke="#16a34a" strokeWidth="0.6" />
                    <rect x="18" y={j * 20 + 3} width="12" height="14" rx="1" fill="#4ade80" stroke="#16a34a" strokeWidth="0.6" />
                  </g>
                ))}
              </g>
            ))}

            {/* ===== A-row bottom labels ===== */}
            {racksRowA.map((rack) => (
              <text key={`bot-${rack.label}`} x={rack.x + 16} y={292} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
            ))}

            {/* ===== B-row bottom labels ===== */}
            {racksRowB.map((rack) => (
              <text key={`bot-${rack.label}`} x={rack.x + 16} y={292} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
            ))}
            {racksRowBB.map((rack) => (
              <text key={`bot-${rack.label}`} x={rack.x + 16} y={522} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">{rack.label}</text>
            ))}

            {/* ===== PICKING ZONE (right side) ===== */}
            <g transform="translate(995, 70)">
              <rect width="55" height="460" fill="#dcfce7" stroke="#86efac" strokeWidth="2" rx="2" />
              <text x="28" y="230" textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="800"
                transform="rotate(90, 28, 230)" letterSpacing="1">
                Picking Zone
              </text>
              {/* Small green blocks inside */}
              {[...Array(8)].map((_, i) => (
                <rect key={i} x="8" y={40 + i * 50} width="38" height="30" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" />
              ))}
            </g>

            {/* ===== BOTTOM SECTION ===== */}
            {/* Bottom divider line */}
            <line x1="8" y1="555" x2="1052" y2="555" stroke="#94a3b8" strokeWidth="2" />

            {/* Inward area */}
            <g transform="translate(12, 565)">
              <rect width="90" height="75" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" rx="3" />
              <text x="45" y="42" textAnchor="middle" fill="#1e40af" fontSize="13" fontWeight="700">Inward</text>
              {/* Door arc */}
              <path d="M 75 50 A 12 12 0 0 1 75 75" fill="none" stroke="#1e40af" strokeWidth="2" />
            </g>

            {/* Small Receiving (bottom-left) */}
            <g transform="translate(110, 575)">
              <rect width="60" height="50" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" rx="2" />
              <text x="30" y="30" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="700">Receiving</text>
            </g>

            {/* Main Receiving zone (bottom center-left) */}
            <g transform="translate(180, 575)">
              <rect width="280" height="55" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" rx="2" />
              <text x="140" y="33" textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="700">Receiving</text>
            </g>

            {/* Secondary Receiving zone (bottom center-right) */}
            <g transform="translate(480, 575)">
              <rect width="260" height="55" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" rx="2" />
              <text x="130" y="33" textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="700">Receiving</text>
            </g>

            {/* Shipping zone (bottom right) */}
            <g transform="translate(760, 575)">
              <rect width="230" height="55" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" rx="2" />
              <text x="115" y="33" textAnchor="middle" fill="#9f1239" fontSize="13" fontWeight="700">Shipping</text>
            </g>

            {/* ===== LOADING BAYS ===== */}
            <g transform="translate(0, 640)">
              {loadingBays.map(bay => (
                <g key={bay.num} transform={`translate(${bay.x}, 0)`}>
                  {/* Bay outline */}
                  <rect width="50" height="110" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" rx="2" />
                  {/* Truck body */}
                  <rect x="6" y="14" width="38" height="70" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                  {/* Truck cab */}
                  <rect x="10" y="68" width="30" height="16" rx="2" fill="#64748b" />
                  {/* Wheels */}
                  <circle cx="16" cy="88" r="4" fill="#475569" />
                  <circle cx="40" cy="88" r="4" fill="#475569" />
                  {/* Bay number */}
                  <text x="25" y="35" textAnchor="middle" fill="#334155" fontSize="14" fontWeight="700">{bay.num}</text>
                </g>
              ))}
            </g>

            {/* ===== TOP PICK LOCATIONS ===== */}
            {[
              { id: 'PA-100', x: 100 },
              { id: 'PA-130', x: 180 },
              { id: 'PA-150', x: 260 },
              { id: 'PA-160', x: 340 },
              { id: 'PA-190', x: 420 },
              { id: 'PA-200', x: 500 },
            ].map(p => (
              <g key={p.id} transform={`translate(${p.x}, 15)`}>
                <rect width="55" height="18" rx="3" fill="#86efac" stroke="#16a34a" strokeWidth="1" />
                <text x="28" y="13" textAnchor="middle" fill="#14532d" fontSize="9" fontWeight="700">{p.id}</text>
              </g>
            ))}

            {/* ===== AISLE LABELS ===== */}
            <text x="90" y="55" fill="#64748b" fontSize="10" fontWeight="600">Aisle 1</text>
            <text x="200" y="55" fill="#64748b" fontSize="10" fontWeight="600">Aisle 2</text>
            <text x="310" y="55" fill="#64748b" fontSize="10" fontWeight="600">Aisle 3</text>
            <text x="430" y="55" fill="#64748b" fontSize="10" fontWeight="600">Aisle 4</text>

            {/* ===== DASHED FORKLIFT PATHS ===== */}
            <line x1="80" y1="300" x2="540" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="80" y1="540" x2="990" y2="540" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 4" />
          </svg>

          {/* ===== FORKLIFT VEHICLES ===== */}
          {vehicles.map(v => (
            <div
              key={v.id}
              onClick={e => { e.stopPropagation(); setSelectedVehicle(v); }}
              style={{
                position: 'absolute',
                left: v.x,
                top: v.y,
                transition: 'left 4s ease-in-out, top 4s ease-in-out',
                cursor: 'pointer',
                zIndex: 30
              }}
            >
              {/* Label */}
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#1e293b',
                background: 'rgba(255,255,255,0.85)', padding: '1px 5px',
                borderRadius: 3, textAlign: 'center', marginBottom: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
              }}>
                {v.code}
              </div>
              {/* Forklift icon */}
              <div style={{
                width: 28, height: 28, background: '#2563eb',
                border: '2px solid #fff', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.45)',
                transition: 'transform 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Forklift SVG icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 5 17 H 3 V 7 L 7 3 H 12 V 12" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                  <path d="M 15 17 H 9" />
                  <path d="M 19 12 V 17 H 19" />
                  <path d="M 12 7 H 19 L 22 12 H 12 Z" />
                </svg>
              </div>
              {/* Speed trail */}
              <div style={{
                position: 'absolute', left: -12, top: 20,
                display: 'flex', gap: 2, opacity: 0.6
              }}>
                <span style={{ width: 4, height: 2, background: '#60a5fa', borderRadius: 2 }} />
                <span style={{ width: 7, height: 2, background: '#93c5fd', borderRadius: 2 }} />
              </div>
            </div>
          ))}

          {/* ===== VEHICLE STATUS POPUP ===== */}
          {selectedVehicle && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: selectedVehicle.x + 40,
                top: selectedVehicle.y - 20,
                background: '#1e293b',
                color: '#fff',
                borderRadius: 8,
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                border: '1px solid #475569',
                fontSize: 11,
                width: 175,
                zIndex: 50,
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #475569', paddingBottom: 6, marginBottom: 8
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{selectedVehicle.code}</span>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '0 2px',
                    lineHeight: 1
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ color: '#cbd5e1' }}>
                  Status: <span style={{ color: selectedVehicle.status === 'Active' ? '#4ade80' : '#fbbf24', fontWeight: 600 }}>{selectedVehicle.status}</span>
                </div>
                <div style={{ color: '#cbd5e1' }}>
                  Operator: <span style={{ color: '#fff', fontWeight: 500 }}>{selectedVehicle.operator}</span>
                </div>
                <div style={{ color: '#cbd5e1' }}>
                  Speed: <span style={{ color: '#fff', fontWeight: 500 }}>{selectedVehicle.speed}</span>
                </div>
              </div>
              {/* Tooltip arrow */}
              <div style={{
                position: 'absolute', left: -6, top: 30,
                width: 0, height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid #1e293b'
              }} />
            </div>
          )}

          {/* ===== ZOOM CONTROLS ===== */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: '#1e293b', borderRadius: 6,
            padding: '4px 6px',
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            border: '1px solid #475569',
            zIndex: 50
          }}>
            <button
              onClick={handleZoomOut}
              style={{
                background: 'none', border: 'none', color: '#cbd5e1',
                cursor: 'pointer', padding: '4px 6px', borderRadius: 4, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#334155'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Zoom Out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: '#e2e8f0', padding: '0 4px', minWidth: 36, textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                background: 'none', border: 'none', color: '#cbd5e1',
                cursor: 'pointer', padding: '4px 6px', borderRadius: 4, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#334155'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Zoom In"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <div style={{ width: 1, height: 14, background: '#475569' }} />
            <button
              onClick={handleFullscreen}
              style={{
                background: 'none', border: 'none', color: '#cbd5e1',
                cursor: 'pointer', padding: '4px 6px', borderRadius: 4, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#334155'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Toggle Fullscreen"
            >
              {isFullScreen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMapPage;
