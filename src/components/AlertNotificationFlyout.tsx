import React from 'react';
import { X, AlertTriangle, Check, ArrowRight, Clock } from 'lucide-react';
import { ClinicalDeviationAlert } from '../types/clinical';

interface AlertNotificationFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ClinicalDeviationAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenAudit: (alert: ClinicalDeviationAlert) => void;
}

export const AlertNotificationFlyout: React.FC<AlertNotificationFlyoutProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onOpenAudit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="font-bold text-slate-900 text-sm">
                Active Protocol Deviations ({alerts.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert List */}
          <div className="p-4 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {alert.protocol}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {alert.timestamp}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900">
                  {alert.title}
                </div>
                <div className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-700">{alert.patientName}</strong> ({alert.mrn}) · {alert.ward} (Bed {alert.bed})
                </div>
                <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200/60">
                  {alert.description}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Acknowledge</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAudit(alert);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <span>Audit & Sign</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active clinical protocol deviations. All systems nominal.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Immediate clinical response team alerted</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
