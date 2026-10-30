import React, { useState } from 'react';
import {
  Bed,
  Heart,
  Activity,
  Wind,
  Thermometer,
  Gauge,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Patient, AcuityLevel } from '../types/clinical';

interface WardBedsideFlowProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAudit: (patient: Patient) => void;
}

export const WardBedsideFlow: React.FC<WardBedsideFlowProps> = ({
  patients,
  onSelectPatient,
  onOpenAudit,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('ICU-North');
  const [acuityFilter, setAcuityFilter] = useState<string>('all');

  const wards = [
    'ICU-North',
    'Acute Cardiology',
    'Medical Stepdown',
    'Post-Op Surgical 4W',
    'Emergency Observation',
  ];

  // Filter patients by selected ward and acuity
  const wardPatients = patients.filter((p) => {
    if (p.ward !== selectedWard) return false;
    if (acuityFilter !== 'all' && p.acuity !== acuityFilter) return false;
    return true;
  });

  const criticalInWard = patients.filter((p) => p.ward === selectedWard && p.acuity === 'critical').length;
  const observationInWard = patients.filter((p) => p.ward === selectedWard && p.acuity === 'observation').length;
  const stableInWard = patients.filter((p) => p.ward === selectedWard && p.acuity === 'stable').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ward Bedside Telemetry & Patient Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Continuous bedside vitals telemetry, early warning score (NEWS2), and discharge disposition readiness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="font-semibold">{wardPatients.length} Beds Monitored</span>
          </div>
        </div>
      </div>

      {/* Ward Selector Strip & Acuity Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        {/* Wards */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {wards.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                selectedWard === w
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Acuity Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 self-start lg:self-center">
          <button
            onClick={() => setAcuityFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              acuityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Beds
          </button>
          <button
            onClick={() => setAcuityFilter('critical')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              acuityFilter === 'critical'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({criticalInWard})
          </button>
          <button
            onClick={() => setAcuityFilter('observation')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              acuityFilter === 'observation'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Observation ({observationInWard})
          </button>
          <button
            onClick={() => setAcuityFilter('stable')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              acuityFilter === 'stable'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stable ({stableInWard})
          </button>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wardPatients.map((patient) => {
          const isCritical = patient.acuity === 'critical';
          const isObs = patient.acuity === 'observation';

          return (
            <div
              key={patient.id}
              className={`bg-white border rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 ${
                isCritical
                  ? 'border-rose-200 ring-1 ring-rose-500/10'
                  : isObs
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Top: Bed ID & Acuity Badge */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-800 font-bold text-xs font-mono">
                    {patient.bed}
                  </div>
                  <div>
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="font-semibold text-slate-900 text-sm hover:text-teal-700 transition-colors text-left"
                    >
                      {patient.fullName}
                    </button>
                    <div className="text-[11px] text-slate-400">
                      {patient.mrn} · {patient.age}y / {patient.gender}
                    </div>
                  </div>
                </div>

                {/* Acuity Status Badge per design spec */}
                <div>
                  {patient.acuity === 'stable' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#CCFBF1] text-[#0F766E]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                      Stable
                    </span>
                  )}
                  {patient.acuity === 'observation' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      Obs
                    </span>
                  )}
                  {patient.acuity === 'critical' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE4E6] text-[#BE123C]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                      Critical
                    </span>
                  )}
                </div>
              </div>

              {/* Diagnosis & Attending */}
              <div className="mt-2.5 text-xs">
                <div className="text-slate-800 font-medium truncate" title={patient.primaryDiagnosis}>
                  {patient.primaryDiagnosis}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Attending: {patient.attendingPhysician}
                </div>
              </div>

              {/* Real-time Vitals Telemetry Matrix */}
              <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 text-center tabular-nums">
                {/* Heart Rate */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Heart className="w-2.5 h-2.5 text-rose-500" />
                    <span>HR (bpm)</span>
                  </div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      patient.vitals.hr > 100 || patient.vitals.hr < 50
                        ? 'text-rose-600 font-black'
                        : 'text-slate-900'
                    }`}
                  >
                    {patient.vitals.hr}
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Activity className="w-2.5 h-2.5 text-sky-500" />
                    <span>BP (mmHg)</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {patient.vitals.sbp}/{patient.vitals.dbp}
                  </div>
                </div>

                {/* Mean Arterial Pressure */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Gauge className="w-2.5 h-2.5 text-teal-500" />
                    <span>MAP</span>
                  </div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      patient.vitals.map < 65 ? 'text-rose-600 font-black' : 'text-slate-900'
                    }`}
                  >
                    {patient.vitals.map}
                  </div>
                </div>

                {/* SpO2 */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Wind className="w-2.5 h-2.5 text-teal-600" />
                    <span>SpO2</span>
                  </div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      patient.vitals.spo2 < 92 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {patient.vitals.spo2}%
                  </div>
                </div>

                {/* Resp Rate */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="text-[10px] text-slate-400">RR (/min)</div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      patient.vitals.rr > 22 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {patient.vitals.rr}
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-1 rounded bg-white border border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Thermometer className="w-2.5 h-2.5 text-amber-500" />
                    <span>Temp</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {patient.vitals.temp}°C
                  </div>
                </div>
              </div>

              {/* Bottom Scores: NEWS2 & Discharge Readiness */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">NEWS2:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[11px] tabular-nums ${
                      patient.news2Score >= 7
                        ? 'bg-rose-100 text-rose-800 font-black'
                        : patient.news2Score >= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {patient.news2Score}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-slate-400 text-[11px]">Discharge Ready:</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {patient.dischargeReadinessPct}%
                  </span>
                </div>
              </div>

              {/* Protocol Alert strip if deviation */}
              {patient.protocol.status === 'deviation' && (
                <div className="mt-2.5 text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-1 rounded flex items-center justify-between">
                  <span className="truncate max-w-[200px]">
                    Deviation: {patient.protocol.stepName}
                  </span>
                  <button
                    onClick={() => onOpenAudit(patient)}
                    className="font-bold underline ml-1 hover:text-rose-950"
                  >
                    Resolve
                  </button>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  Inspect Labs & Trends
                </button>
                <button
                  onClick={() => onOpenAudit(patient)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                >
                  Clinical Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {wardPatients.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          <Bed className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">No patients matching filter in {selectedWard}</p>
          <p className="text-xs text-slate-400 mt-1">Adjust your acuity filter or choose a different unit.</p>
        </div>
      )}
    </div>
  );
};
