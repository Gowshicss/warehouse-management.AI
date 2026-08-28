import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Package,
  Route,
  Calendar,
  Wrench,
  ShoppingCart,
  BarChart3,
  ClipboardCheck,
} from 'lucide-react';

const PriorityCard = ({ priority }) => {
  const navigate = useNavigate();

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'URGENT':
        return {
          bg: 'bg-red-100/70',
          text: 'text-red-700',
          icon: AlertTriangle,
          label: 'URGENT',
        };

      case 'HIGH PRIORITY':
        return {
          bg: 'bg-orange-100/70',
          text: 'text-orange-700',
          icon: Package,
          label: 'HIGH PRIORITY',
        };

      case 'ATTENTION':
        return {
          bg: 'bg-blue-100/70',
          text: 'text-blue-700',
          icon: Route,
          label: 'ATTENTION',
        };

      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          icon: Calendar,
          label: 'ROUTINE',
        };
    }
  };

  const getActionButtonIcon = (actionType) => {
    switch (actionType) {
      case 'schedule_maintenance':
        return Wrench;

      case 'expedite_reorder':
        return ShoppingCart;

      case 'review_analytics':
        return BarChart3;

      default:
        return ClipboardCheck;
    }
  };

  const severityInfo = getSeverityStyle(priority?.severity);
  const SevIcon = severityInfo.icon;
  const ActionIcon = getActionButtonIcon(priority?.action_type);

  const handleClick = () => {
    if (priority?.target_route) {
      navigate(priority.target_route);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all">

      {/* Left Section */}
      <div className="flex items-start gap-5 flex-1">

        {/* Severity Icon */}
        <div
          className={`w-14 h-14 rounded-xl ${severityInfo.bg} flex flex-col items-center justify-center shrink-0 p-2`}
        >
          <SevIcon
            className={`w-6 h-6 ${severityInfo.text}`}
          />

          <span
            className={`text-[9px] font-bold ${severityInfo.text} tracking-wider mt-0.5 text-center leading-tight`}
          >
            {severityInfo.label}
          </span>
        </div>

        {/* Priority Details */}
        <div className="space-y-1.5 flex-1">

          {/* Title + Module */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {priority?.title || 'Priority Alert'}
            </h3>

            {priority?.module && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {priority.module}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            {priority?.description || 'No additional information available.'}
          </p>

          {/* Time + Location */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1">

            {priority?.time_ago && (
              <span>
                🕒 {priority.time_ago}
              </span>
            )}

            {priority?.location_tag && (
              <span>
                📍 {priority.location_tag}
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full md:w-auto">
        <button
          onClick={handleClick}
          disabled={!priority?.target_route}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <ActionIcon className="w-4 h-4" />

          <span>
            {priority?.button_text || 'View Action'}
          </span>
        </button>
      </div>

    </div>
  );
};

export default PriorityCard;