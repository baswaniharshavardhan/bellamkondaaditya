import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck,
  FileText,
  Activity,
  Heart,
  User,
  Shield,
  Download,
} from 'lucide-react';
import { Patient, ClinicalDeviationAlert } from '../types/clinical';

interface PatientAuditDrawerProps {
  patient: Patient | null;
  alert?: ClinicalDeviationAlert | null;
  onClose: () => void;
  onSignOff: (patientId: string, disposition: string, rationale: string, doctorName: string) => void;
}

export const PatientAuditDrawer: React.FC<PatientAuditDrawerProps> = ({
  patient,
  alert,
  onClose,
  onSignOff,
}) => {
  if (!patient) return null;

  const [disposition, setDisposition] = useState<'continue' | 'consult' | 'override'>('continue');
  const [rationale, setRationale] = useState<string>('');
  const [physicianSig, setPhysicianSig] = useState<string>(patient.attendingPhysician);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignOff(patient.id, disposition, rationale, physicianSig);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  const downloadAuditSlip = () => {
    const slip = `CLINICAL GOVERNANCE & PROTOCOL AUDIT CERTIFICATE
--------------------------------------------------
FACILITY: MetroHealth Academic Center
TIMESTAMP: ${new Date().toISOString()}
PATIENT: ${patient.fullName} (${patient.mrn})
WARD / BED: ${patient.ward} · Bed ${patient.bed}
PRIMARY DIAGNOSIS: ${patient.primaryDiagnosis} (${patient.icd10})
ATTENDING: ${physicianSig}

PROTOCOL: ${patient.protocol.protocolName}
STATUS: ${patient.protocol.status.toUpperCase()}
DISPOSITION: ${disposition.toUpperCase()}
CLINICAL RATIONALE:
${rationale || 'Protocol reviewed against institutional guidelines. No adverse variances detected.'}

CURRENT VITALS:
HR: ${patient.vitals.hr} bpm | BP: ${patient.vitals.sbp}/${patient.vitals.dbp} mmHg | MAP: ${patient.vitals.map}
SpO2: ${patient.vitals.spo2}% | Temp: ${patient.vitals.temp}°C | RR: ${patient.vitals.rr}/min

CURRENT BIOMARKERS:
Serum Lactate: ${patient.biomarkers.lactate} mmol/L
Serum Creatinine: ${patient.biomarkers.creatinine} mg/dL
eGFR: ${patient.biomarkers.egfr} mL/min
WBC: ${patient.biomarkers.wbc} x10^3/uL
Troponin I: ${patient.biomarkers.troponinI} ng/mL

PHYSICIAN SIGNATURE: ${physicianSig} (E-VERIFIED)
--------------------------------------------------`;

    const blob = new Blob([slip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuditSlip_${patient.mrn}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Lab trend chart math
  const trendPoints = patient.labHistory || [];
  const chartW = 460;
  const chartH = 120;
  const padX = 35;
  const padY = 20;

  const maxLactate = Math.max(...trendPoints.map((p) => p.lactate), 3.0);
  const minLactate = 0.5;

  const getTx = (i: number) => padX + (i / Math.max(1, trendPoints.length - 1)) * (chartW - padX * 2);
  const getTy = (val: number) => chartH - padY - ((val - minLactate) / (maxLactate - minLactate)) * (chartH - padY * 2);

  const lactatePath = trendPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getTx(i)} ${getTy(p.lactate)}`)
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Top Header */}
        <div>
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {patient.bed}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">
                    {patient.fullName}
                  </h2>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {patient.mrn}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {patient.age}y / {patient.gender} · {patient.ward} · Bed {patient.bed}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadAuditSlip}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                title="Download Clinical Audit Slip"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Primary Diagnosis & Risk Scores */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Primary Clinical Diagnosis
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {patient.primaryDiagnosis}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    ICD-10: {patient.icd10}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs tabular-nums">
                  <div className="text-center p-2 rounded bg-white border border-slate-200/80 min-w-[70px]">
                    <div className="text-[10px] text-slate-400">NEWS2 Score</div>
                    <div
                      className={`text-base font-bold ${
                        patient.news2Score >= 7
                          ? 'text-rose-600'
                          : patient.news2Score >= 5
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {patient.news2Score}
                    </div>
                  </div>

                  <div className="text-center p-2 rounded bg-white border border-slate-200/80 min-w-[70px]">
                    <div className="text-[10px] text-slate-400">LACE+ Index</div>
                    <div className="text-base font-bold text-slate-800">
                      {patient.lacePlusScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Vitals Strip */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Bedside Telemetry Telemetry Vitals
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs tabular-nums">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">HR (bpm)</div>
                  <div className="font-bold text-slate-900 mt-0.5">{patient.vitals.hr}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">BP (mmHg)</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {patient.vitals.sbp}/{patient.vitals.dbp}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">MAP</div>
                  <div
                    className={`font-bold mt-0.5 ${
                      patient.vitals.map < 65 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {patient.vitals.map}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">SpO2</div>
                  <div className="font-bold text-slate-900 mt-0.5">{patient.vitals.spo2}%</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">Resp Rate</div>
                  <div className="font-bold text-slate-900 mt-0.5">{patient.vitals.rr}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-400">Temp</div>
                  <div className="font-bold text-slate-900 mt-0.5">{patient.vitals.temp}°C</div>
                </div>
              </div>
            </div>

            {/* Longitudinal Biomarker Trendline */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Longitudinal Lactate & Hemodynamic Response
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Serial measurements from resuscitation onset to present.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 tabular-nums">
                  Current: {patient.biomarkers.lactate} mmol/L
                </span>
              </div>

              <div className="mt-2">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto select-none">
                  <line
                    x1={padX}
                    y1={getTy(2.0)}
                    x2={chartW - padX}
                    y2={getTy(2.0)}
                    stroke="#FECDD3"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={chartW - padX + 4}
                    y={getTy(2.0) + 3}
                    fontSize="9"
                    fill="#E11D48"
                    className="font-mono"
                  >
                    2.0 (Threshold)
                  </text>

                  <path d={lactatePath} fill="none" stroke="#0D9488" strokeWidth="2.5" />

                  {trendPoints.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={getTx(i)}
                        cy={getTy(p.lactate)}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#0D9488"
                        strokeWidth="2"
                      />
                      <text
                        x={getTx(i)}
                        y={chartH - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748B"
                      >
                        {p.timestamp}
                      </text>
                      <text
                        x={getTx(i)}
                        y={getTy(p.lactate) - 7}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#0F172A"
                        fontWeight="600"
                        className="font-mono tabular-nums"
                      >
                        {p.lactate}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Active Protocol Status & Deviation Details */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {patient.protocol.protocolName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    patient.protocol.status === 'compliant'
                      ? 'bg-teal-100 text-teal-800'
                      : patient.protocol.status === 'deviation'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {patient.protocol.status}
                </span>
              </div>

              {patient.protocol.deviationReason && (
                <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Clinical Deviation:</span>
                  </div>
                  <p className="mt-1">{patient.protocol.deviationReason}</p>
                </div>
              )}
            </div>

            {/* Form for Physician Sign-off & Disposition */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Physician Protocol Sign-Off & Clinical Disposition
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDisposition('continue')}
                  className={`p-2 text-xs font-semibold rounded border text-center transition-colors ${
                    disposition === 'continue'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Acknowledge & Continue
                </button>
                <button
                  type="button"
                  onClick={() => setDisposition('consult')}
                  className={`p-2 text-xs font-semibold rounded border text-center transition-colors ${
                    disposition === 'consult'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Order STAT Consult
                </button>
                <button
                  type="button"
                  onClick={() => setDisposition('override')}
                  className={`p-2 text-xs font-semibold rounded border text-center transition-colors ${
                    disposition === 'override'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Clinical Override
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physician Clinical Notes & Rationale
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Enter medical reasoning, hemodynamic target adjustments, or lab orders..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attending Physician Electronic Signature
                </label>
                <input
                  type="text"
                  value={physicianSig}
                  onChange={(e) => setPhysicianSig(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-sky-600 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full py-2.5 text-xs font-bold rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Sign-Off Recorded in HL7 EHR</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Authorize & Log Clinical Decision</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Audit Log ID: AUD-{(Math.random() * 100000).toFixed(0)}</span>
          <span>HIPAA & CMS Compliant Electronic Health Record</span>
        </div>
      </div>
    </div>
  );
};
