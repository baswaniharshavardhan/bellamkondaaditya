import React, { useState, useMemo } from 'react';
import {
  Download,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Patient,
  AcuityLevel,
  KaplanMeierDataPoint,
} from '../types/clinical';
import { KAPLAN_MEIER_DATA } from '../data/mockClinicalData';

interface CohortRiskExplorerProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenProtocolAudit: (patient: Patient) => void;
}

type SortField = 'fullName' | 'age' | 'news2Score' | 'lacePlusScore' | 'lactate' | 'acuity';
type SortOrder = 'asc' | 'desc';

export const CohortRiskExplorer: React.FC<CohortRiskExplorerProps> = ({
  patients,
  onSelectPatient,
  onOpenProtocolAudit,
}) => {
  // Filters
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('all');
  const [selectedAcuity, setSelectedAcuity] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [highRiskOnly, setHighRiskOnly] = useState<boolean>(false);
  const [lactateThreshold, setLactateThreshold] = useState<number>(0);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());

  // Sorting
  const [sortField, setSortField] = useState<SortField>('news2Score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Diagnosis options
  const diagnoses = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => set.add(p.primaryDiagnosis.split(' ')[0]));
    return Array.from(set);
  }, [patients]);

  // Wards
  const wards = ['ICU-North', 'Acute Cardiology', 'Medical Stepdown', 'Post-Op Surgical 4W', 'Emergency Observation'];

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (selectedDiagnosis !== 'all' && !p.primaryDiagnosis.toLowerCase().includes(selectedDiagnosis.toLowerCase())) {
        return false;
      }
      if (selectedAcuity !== 'all' && p.acuity !== selectedAcuity) {
        return false;
      }
      if (selectedWard !== 'all' && p.ward !== selectedWard) {
        return false;
      }
      if (highRiskOnly && p.news2Score < 5 && p.lacePlusScore < 60) {
        return false;
      }
      if (lactateThreshold > 0 && p.biomarkers.lactate < lactateThreshold) {
        return false;
      }
      return true;
    });
  }, [patients, selectedDiagnosis, selectedAcuity, selectedWard, highRiskOnly, lactateThreshold]);

  // Sorted patients
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'fullName') {
        valA = a.fullName.toLowerCase();
        valB = b.fullName.toLowerCase();
      } else if (sortField === 'age') {
        valA = a.age;
        valB = b.age;
      } else if (sortField === 'news2Score') {
        valA = a.news2Score;
        valB = b.news2Score;
      } else if (sortField === 'lacePlusScore') {
        valA = a.lacePlusScore;
        valB = b.lacePlusScore;
      } else if (sortField === 'lactate') {
        valA = a.biomarkers.lactate;
        valB = b.biomarkers.lactate;
      } else if (sortField === 'acuity') {
        const rank = { critical: 3, observation: 2, stable: 1 };
        valA = rank[a.acuity];
        valB = rank[b.acuity];
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPatients, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedPatientIds.size === filteredPatients.length) {
      setSelectedPatientIds(new Set());
    } else {
      setSelectedPatientIds(new Set(filteredPatients.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedPatientIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPatientIds(next);
  };

  const exportFilteredCSV = () => {
    const headers = ['MRN,Full Name,Age,Gender,Ward,Bed,Primary Diagnosis,ICD10,Acuity,NEWS2,LACE+,Lactate,MAP,Protocol Status,Attending'];
    const rows = filteredPatients.map((p) =>
      `"${p.mrn}","${p.fullName}",${p.age},"${p.gender}","${p.ward}","${p.bed}","${p.primaryDiagnosis}","${p.icd10}","${p.acuity}",${p.news2Score},${p.lacePlusScore},${p.biomarkers.lactate},${p.vitals.map},"${p.protocol.status}","${p.attendingPhysician}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Clinical_Cohort_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kaplan Meier chart math
  const kmWidth = 640;
  const kmHeight = 200;
  const kmPadX = 45;
  const kmPadY = 25;

  const getKmX = (day: number) => kmPadX + (day / 365) * (kmWidth - kmPadX * 2);
  const getKmY = (pct: number) => kmPadY + ((100 - pct) / 40) * (kmHeight - kmPadY * 2);

  const interventionPath = KAPLAN_MEIER_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getKmX(d.day)} ${getKmY(d.interventionSurvivalPct)}`).join(' ');
  const standardPath = KAPLAN_MEIER_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getKmX(d.day)} ${getKmY(d.standardCareSurvivalPct)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Cohort Risk Stratification & Longitudinal Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Epidemiological risk models, Kaplan-Meier event-free survival, and patient-level clinical audit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportFilteredCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Cohort CSV ({filteredPatients.length})</span>
          </button>
        </div>
      </div>

      {/* Kaplan-Meier Survival Analysis Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Kaplan-Meier 365-Day Event-Free Survival & Readmission Freedom
              </h2>
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                Cox Proportional Hazard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted Clinical Precision Protocol (Cohort A) vs Standard Hospital Care (Cohort B).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs tabular-nums text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200/60">
            <div>
              <span className="text-slate-400">Hazard Ratio:</span>{' '}
              <span className="font-bold text-slate-900">HR 0.64</span>
            </div>
            <span>·</span>
            <div>
              <span className="text-slate-400">95% CI:</span>{' '}
              <span className="font-medium text-slate-800">0.52 - 0.78</span>
            </div>
            <span>·</span>
            <div>
              <span className="text-slate-400">Log-Rank:</span>{' '}
              <span className="font-bold text-teal-700">p &lt; 0.001</span>
            </div>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="mt-4 relative overflow-hidden">
          <svg viewBox={`0 0 ${kmWidth} ${kmHeight}`} className="w-full h-auto select-none">
            {/* Grid horizontal lines */}
            {[100, 90, 80, 70, 60].map((pct) => {
              const y = getKmY(pct);
              return (
                <g key={pct}>
                  <line
                    x1={kmPadX}
                    y1={y}
                    x2={kmWidth - kmPadX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                  />
                  <text
                    x={kmPadX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94A3B8"
                    className="font-mono tabular-nums"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Standard Care Curve (Sky Blue #0284C7 dashed) */}
            <path
              d={standardPath}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Targeted Protocol Intervention Curve (Clinical Teal #0D9488 solid) */}
            <path
              d={interventionPath}
              fill="none"
              stroke="#0D9488"
              strokeWidth="2.5"
            />

            {/* Data nodes */}
            {KAPLAN_MEIER_DATA.map((d) => (
              <g key={d.day}>
                <circle
                  cx={getKmX(d.day)}
                  cy={getKmY(d.interventionSurvivalPct)}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#0D9488"
                  strokeWidth="2"
                />
                <circle
                  cx={getKmX(d.day)}
                  cy={getKmY(d.standardCareSurvivalPct)}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth="2"
                />
                {/* Day label on X axis */}
                <text
                  x={getKmX(d.day)}
                  y={kmHeight - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748B"
                  className="font-mono"
                >
                  Day {d.day}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Patients at Risk Table */}
        <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-1 pr-4">Study Arm</th>
                {KAPLAN_MEIER_DATA.map((d) => (
                  <th key={d.day} className="py-1 px-3 text-right tabular-nums">
                    Day {d.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 tabular-nums">
              <tr>
                <td className="py-1.5 pr-4 font-medium text-teal-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-teal-600 rounded-full" />
                  Target Protocol Arm (At Risk)
                </td>
                {KAPLAN_MEIER_DATA.map((d) => (
                  <td key={d.day} className="py-1.5 px-3 text-right">
                    {d.patientsAtRiskIntervention}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-sky-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-sky-600 rounded-full" />
                  Standard Care Arm (At Risk)
                </td>
                {KAPLAN_MEIER_DATA.map((d) => (
                  <td key={d.day} className="py-1.5 px-3 text-right">
                    {d.patientsAtRiskStandard}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Filter Controls & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-semibold text-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Cohort Stratification Parameters</span>
          </div>
          <span className="text-slate-500 font-normal">
            Displaying <strong className="text-slate-900">{filteredPatients.length}</strong> of{' '}
            {patients.length} registry records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Diagnosis Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Primary Diagnosis
            </label>
            <select
              aria-label="Filter by primary diagnosis"
              value={selectedDiagnosis}
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
            >
              <option value="all">All Clinical Diagnoses</option>
              <option value="Sepsis">Sepsis / Septic Shock</option>
              <option value="Heart">Heart Failure / HFrEF</option>
              <option value="COPD">COPD / Respiratory Failure</option>
              <option value="Post-Op">Post-Op Surgical / ERAS</option>
              <option value="NSTEMI">NSTEMI / Coronary Disease</option>
              <option value="Pancreatitis">Pancreatitis (Severe)</option>
            </select>
          </div>

          {/* Acuity Level Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Acuity Classification
            </label>
            <select
              aria-label="Filter by acuity classification"
              value={selectedAcuity}
              onChange={(e) => setSelectedAcuity(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
            >
              <option value="all">All Acuity Levels</option>
              <option value="critical">Critical (NEWS2 &gt;= 7)</option>
              <option value="observation">Observation (NEWS2 4-6)</option>
              <option value="stable">Stable (NEWS2 0-3)</option>
            </select>
          </div>

          {/* Ward Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Hospital Unit / Ward
            </label>
            <select
              aria-label="Filter by hospital unit or ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Biomarker Threshold (Lactate) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Lactate Floor: {lactateThreshold > 0 ? `${lactateThreshold} mmol/L` : 'Any'}
            </label>
            <div className="flex items-center gap-2 h-9">
              <input
                type="range"
                min="0"
                max="4.0"
                step="0.5"
                value={lactateThreshold}
                onChange={(e) => setLactateThreshold(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>

          {/* High Risk Toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highRiskOnly}
                onChange={(e) => setHighRiskOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-medium text-slate-700">
                High-Risk Tier (NEWS2 &ge; 5 or LACE+ &ge; 60)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* High-Density Patient Cohort Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedPatientIds.size === filteredPatients.length && filteredPatients.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-semibold text-slate-900">
              {selectedPatientIds.size > 0
                ? `${selectedPatientIds.size} Patients Selected`
                : 'Cohort Registry Records'}
            </span>
          </div>

          {selectedPatientIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Batch flagged ${selectedPatientIds.size} patients for immediate attending clinical rounds review.`)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
              >
                Flag for Rounds ({selectedPatientIds.size})
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10"></th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Patient Identifier</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Age/Sex</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Location / Unit</th>
                <th className="py-2.5 px-3">Primary Diagnosis (ICD-10)</th>
                <th
                  onClick={() => handleSort('acuity')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Acuity Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('news2Score')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>NEWS2</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lacePlusScore')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LACE+</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lactate')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lactate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">MAP</th>
                <th className="py-2.5 px-3">Protocol Tracking</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {sortedPatients.map((patient) => {
                const isSelected = selectedPatientIds.has(patient.id);

                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(patient.id)}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="font-semibold text-slate-900 hover:text-teal-700 transition-colors text-left"
                        >
                          {patient.fullName}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {patient.mrn}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {patient.age}y / {patient.gender}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-medium">{patient.ward}</div>
                      <div className="text-[11px] text-slate-400">Bed {patient.bed}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-900 max-w-xs truncate">
                      <div className="font-medium truncate" title={patient.primaryDiagnosis}>
                        {patient.primaryDiagnosis}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {patient.icd10}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {/* Strictly formatted status badges per design spec */}
                      {patient.acuity === 'stable' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#CCFBF1] text-[#0F766E]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                          Stable
                        </span>
                      )}
                      {patient.acuity === 'observation' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          Observation
                        </span>
                      )}
                      {patient.acuity === 'critical' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE4E6] text-[#BE123C]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                          Critical
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span
                        className={
                          patient.news2Score >= 7
                            ? 'text-rose-600'
                            : patient.news2Score >= 5
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }
                      >
                        {patient.news2Score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {patient.lacePlusScore}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={
                          patient.biomarkers.lactate >= 2.0
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-700'
                        }
                      >
                        {patient.biomarkers.lactate.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {patient.vitals.map}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            patient.protocol.status === 'compliant'
                              ? 'bg-teal-600'
                              : patient.protocol.status === 'deviation'
                              ? 'bg-rose-600'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-xs text-slate-800 truncate max-w-[150px]">
                          {patient.protocol.protocolName}
                        </span>
                      </div>
                      {patient.protocol.deviationReason && (
                        <div className="text-[10px] text-rose-600 truncate max-w-[180px]">
                          {patient.protocol.deviationReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="View Patient Chart & Labs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenProtocolAudit(patient)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
