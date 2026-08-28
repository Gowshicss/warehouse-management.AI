import React from 'react';

const StatusBadge = ({ status, size = "normal" }) => {
  if (!status) return null;

  const s = status.toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  if (s === "HEALTHY" || s === "ACCEPTED" || s === "LIVE" || s === "ACTIVE" || s === "PRESENT" || s === "OK") {
    styles = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
  } else if (s === "LOW STOCK" || s === "MAINTENANCE_SOON" || s === "ATTENTION" || s === "HIGH PRIORITY") {
    styles = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
  } else if (s === "CRITICAL" || s === "OUT OF STOCK" || s === "URGENT" || s === "REVIEW" || s === "PPE VIOLATION" || s === "MISSING" || s === "ALERT") {
    styles = "bg-red-50 text-red-700 border-red-200 font-semibold";
  } else if (s === "ROUTINE" || s === "OFFLINE" || s === "ABSENT") {
    styles = "bg-slate-100 text-slate-600 border-slate-200";
  }

  const px = size === "small" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${px} ${styles} uppercase tracking-wider`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};

export default StatusBadge;
