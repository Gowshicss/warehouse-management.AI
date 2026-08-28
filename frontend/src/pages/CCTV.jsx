import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import {
  Video,
  ShieldAlert,
  Users,
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';

const CCTV = () => {
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCam, setSelectedCam] = useState('CCTV-01');
  const [frameUrl, setFrameUrl] = useState('');
  const [hasViolation, setHasViolation] = useState(true);
  const [eventType, setEventType] = useState('PPE_VIOLATION');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [camRes, eventRes, frameRes] = await Promise.all([
        api.get('/api/cctv/cameras'),
        api.get('/api/cctv/events'),
        api.get('/api/cctv/frame', {
          params: {
            camera_code: selectedCam,
            violation: hasViolation,
            event_type: eventType
          }
        })
      ]);
      setCameras(camRes.data);
      setEvents(eventRes.data);
      setFrameUrl(frameRes.data.image_data);
    } catch (err) {
      console.error("CCTV fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCam, hasViolation, eventType]);

  const handleSimulateViolation = async (camCode, type) => {
    try {
      setSelectedCam(camCode);
      setHasViolation(true);
      setEventType(type);
      await api.post('/api/cctv/simulate', null, {
        params: { camera_code: camCode, violation_type: type }
      });
      fetchData();
    } catch (err) {
      alert("Simulation failed");
    }
  };

  const handleResetCompliant = () => {
    setHasViolation(false);
    setEventType('NONE');
    fetchData();
  };

  const activeCamObj = cameras.find(c => c.camera_code === selectedCam);

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top Title & Right Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            CCTV & Worker Safety
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time AI surveillance, human posture, helmet/PPE compliance & anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulateViolation('CCTV-01', 'PPE_VIOLATION')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Missing Helmet (CCTV-01)</span>
          </button>

          <button
            onClick={() => handleSimulateViolation('CCTV-02', 'PROXIMITY_ALERT')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Forklift Proximity (CCTV-02)</span>
          </button>

          <button
            onClick={() => handleSimulateViolation('CCTV-03', 'ACCESS_LOG')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Restricted Entry (CCTV-03)</span>
          </button>

          <button
            onClick={handleResetCompliant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reset All Compliant</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Feeds List (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Feeds
              </h2>
              <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {cameras.length} Total
              </span>
            </div>

            <div className="space-y-2">
              {cameras.map((cam) => (
                <button
                  key={cam.camera_code}
                  onClick={() => setSelectedCam(cam.camera_code)}
                  className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                    selectedCam === cam.camera_code
                      ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      {cam.camera_code}
                    </span>
                    <StatusBadge status={cam.status} size="small" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{cam.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Live Main Feed Player (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between min-h-[480px]">
          {/* Main Feed Image Canvas (object-contain ensures bounding boxes & labels fit without truncation) */}
          <div className="relative w-full h-[430px] bg-slate-950 flex items-center justify-center p-2">
            {frameUrl ? (
              <img
                src={frameUrl}
                alt="CCTV AI Feed Stream"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting live AI video stream...</span>
              </div>
            )}
          </div>

          {/* Player Footer Overlay */}
          <div className="bg-slate-900/90 backdrop-blur border-t border-slate-800 p-3 px-4 flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              LIVE FEED • {selectedCam} ({activeCamObj?.zone_name?.toUpperCase() || 'ZONE A'})
            </span>
            <span className="font-mono text-[11px] text-slate-400">FPS: 30 | 4K AI-ENABLED</span>
          </div>
        </div>

        {/* Right Column: Attendance & AI Safety Events (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Attendance Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                ZONE ATTENDANCE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-2xl font-black text-slate-900">42</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Total Assigned</span>
              </div>
              <div>
                <span className="text-2xl font-black text-blue-600">38</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Present</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="text-blue-600">Active: 36</span>
              <span className="text-slate-400">Absent: 4</span>
            </div>
          </div>

          {/* AI Safety Events List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                AI Safety Events
              </h3>
            </div>

            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={evt.event_type} size="small" />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs leading-tight">{evt.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Loc: {evt.camera_code}</span>
                    <button className="text-blue-600 font-bold hover:underline">REVIEW</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
              VIEW ALL EVENTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTV;
