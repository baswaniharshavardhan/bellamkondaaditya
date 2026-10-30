import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Shield,
  Download,
  Users,
} from 'lucide-react';
import { Patient } from '../types/clinical';

interface ProtocolComplianceViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAuditForProtocol: (patient: Patient) => void;
}

export const ProtocolComplianceView: React.FC<ProtocolComplianceViewProps> = ({
  patients,
  onSelectPatient,
  onOpenAuditForProtocol,
}) => {
  const [activeProtocolTab, setActiveProtocolTab] = useState<'sep1' | 'eras' | 'stewardship'>('sep1');

  // SEP-1 Milestones
  const sep1Milestones = [
    {
      id: 'step-1',
      title: 'Blood Cultures Drawn Prior to Antimicrobials',
      targetTime: '< 45 min',
      compliancePct: 94.2,
      avgTime: '36 min',
      status: 'compliant',
      criticality: 'Standard Core',
      note: '2 sets (aerobic + anaerobic) drawn from peripheral sites.',
    },
    {
      id: 'step-2',
      title: 'Initial Serum Lactate Measured',
      targetTime: '< 60 min',
      compliancePct: 96.8,
      avgTime: '24 min',
      status: 'compliant',
      criticality: 'Rapid Diagnostic',
      note: 'STAT point-of-care or laboratory blood gas analyzer.',
    },
    {
      id: 'step-3',
      title: 'Broad-Spectrum IV Antimicrobial Administered',
      targetTime: '< 180 min (3h)',
      compliancePct: 88.6,
      avgTime: '78 min',
      status: 'compliant',
      criticality: 'Mortality Sensitive',
      note: 'Door-to-antibiotic interval directly impacts 28-day survival.',
    },
    {
      id: 'step-4',
      title: '30 mL/kg Crystalloid Bolus for MAP < 65 or Lactate >= 4.0',
      targetTime: '< 180 min',
      compliancePct: 84.1,
      avgTime: '112 min',
      status: 'warning',
      criticality: 'Hemodynamic Volume',
      note: 'Fluid titration bottleneck observed in elderly cardiac comorbidities.',
    },
    {
      id: 'step-5',
      title: 'Repeat Serum Lactate within 6 Hours',
      targetTime: '< 360 min (6h)',
      compliancePct: 91.5,
      avgTime: '215 min',
      status: 'compliant',
      criticality: 'Clearance Metric',
      note: 'Lactate clearance > 20% at 2h / 4h correlates with resolution.',
    },
    {
      id: 'step-6',
      title: 'Vasopressor Titration for Persistent MAP < 65 mmHg',
      targetTime: '< 360 min',
      compliancePct: 86.4,
      avgTime: '145 min',
      status: 'compliant',
      criticality: 'Shock Reversal',
      note: 'First-line Norepinephrine; add Vasopressin if dose > 0.25 mcg/kg/min.',
    },
  ];

  // Care Team Rankings
  const careTeams = [
    { name: 'ICU Critical Care Team Alpha', protocol: 'SEP-1 Sepsis', adherence: 94.6, deviations: 2, volume: 48 },
    { name: 'Cardiothoracic Surgical Unit', protocol: 'ERAS Pathway', adherence: 91.2, deviations: 3, volume: 39 },
    { name: 'Hospitalist Internal Medicine Service', protocol: 'Antimicrobial Timeout', adherence: 86.8, deviations: 6, volume: 74 },
    { name: 'General Surgery Service 4W', protocol: 'ERAS Colorectal', adherence: 83.5, deviations: 5, volume: 32 },
    { name: 'Emergency Medicine Rapid Triage', protocol: 'SEP-1 Sepsis', adherence: 88.9, deviations: 4, volume: 62 },
  ];

  // Patients on this protocol
  const protocolPatients = patients.filter((p) => {
    if (activeProtocolTab === 'sep1') return p.protocol.category === 'Sepsis (SEP-1)';
    if (activeProtocolTab === 'eras') return p.protocol.category === 'ERAS Surgical';
    return p.protocol.category === 'Antimicrobial Stewardship';
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Clinical Protocol Compliance & CMS Quality Measures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time bundle execution tracking, milestone variance audit, and clinical pathway adherence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Clinical Quality Governance Bundle exported as PDF/CSV package.')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Quality Audit Package</span>
          </button>
        </div>
      </div>

      {/* Protocol Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
        <button
          onClick={() => setActiveProtocolTab('sep1')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeProtocolTab === 'sep1'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sepsis Bundle (SEP-1)
        </button>
        <button
          onClick={() => setActiveProtocolTab('eras')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeProtocolTab === 'eras'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ERAS Surgical Recovery
        </button>
        <button
          onClick={() => setActiveProtocolTab('stewardship')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeProtocolTab === 'stewardship'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          72h Antimicrobial Timeout
        </button>
      </div>

      {/* Protocol Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-xs text-slate-500 font-medium">Bundle Overall Compliance</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">88.6%</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              Above CMS Baseline (85.0%)
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: '88.6%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-xs text-slate-500 font-medium">Active In-Flight Patients</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {protocolPatients.length}
            </span>
            <span className="text-xs text-slate-500">Currently in active time window</span>
          </div>
          <div className="mt-2 text-xs text-rose-700 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {protocolPatients.filter((p) => p.protocol.status === 'deviation').length} protocol deviations require review
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-xs text-slate-500 font-medium">Median Door-to-Antibiotic Time</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">78 min</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              -14 min vs prior cycle
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Mandate ceiling: &le; 180 min (3 Hours)
          </div>
        </div>
      </div>

      {/* Step-by-Step Milestone Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Bundle Milestone Execution & Bottleneck Diagnostics
          </h2>
          <p className="text-xs text-slate-500">
            Chronological compliance gates from triage arrival to 6-hour bundle closure.
          </p>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {sep1Milestones.map((ms, idx) => (
            <div key={ms.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900">
                      {ms.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {ms.criticality}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ms.note}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-center shrink-0 text-xs tabular-nums">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Target Interval</div>
                  <div className="font-medium text-slate-700">{ms.targetTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Avg Time</div>
                  <div className="font-mono text-slate-900 font-semibold">{ms.avgTime}</div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="text-[11px] text-slate-400">Compliance</div>
                  <div
                    className={`font-bold ${
                      ms.compliancePct >= 90
                        ? 'text-teal-700'
                        : ms.compliancePct >= 85
                        ? 'text-slate-800'
                        : 'text-amber-700'
                    }`}
                  >
                    {ms.compliancePct}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Patients on Selected Protocol */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Active Cohort Patient Protocol Status
            </h2>
            <p className="text-xs text-slate-500">
              Patients currently enrolled in the {activeProtocolTab.toUpperCase()} pathway.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            {protocolPatients.length} Enrolled
          </span>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {protocolPatients.map((patient) => (
            <div
              key={patient.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="font-semibold text-xs sm:text-sm text-slate-900 hover:text-teal-700 text-left"
                  >
                    {patient.fullName}
                  </button>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono text-slate-500">{patient.mrn}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-600">
                    {patient.ward} (Bed {patient.bed})
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600 flex items-center gap-3">
                  <span>
                    Current Step:{' '}
                    <strong className="text-slate-800 font-medium">
                      {patient.protocol.stepName || 'Initial Evaluation'}
                    </strong>
                  </span>
                  {patient.protocol.timeRemainingMinutes !== undefined && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {patient.protocol.timeRemainingMinutes > 0
                        ? `${patient.protocol.timeRemainingMinutes} min remaining`
                        : 'Window Passed'}
                    </span>
                  )}
                </div>
                {patient.protocol.deviationReason && (
                  <div className="mt-1 text-xs text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-1 rounded max-w-2xl">
                    <strong>Protocol Deviation:</strong> {patient.protocol.deviationReason}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  Clinical Chart
                </button>
                <button
                  onClick={() => onOpenAuditForProtocol(patient)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                >
                  Audit / Sign-Off
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Team Adherence Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Clinical Service & Care Team Protocol Governance
            </h2>
            <p className="text-xs text-slate-500">
              Quarterly adherence ratings, deviation volumes, and patient cohort coverage.
            </p>
          </div>
          <span className="text-xs text-slate-500">Peer-Reviewed Institutional Data</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Clinical Service / Care Team</th>
                <th className="py-2.5 px-3">Governed Pathway</th>
                <th className="py-2.5 px-3 text-right">Cohort Volume</th>
                <th className="py-2.5 px-3 text-right">Adherence Rate</th>
                <th className="py-2.5 px-3 text-right">Active Deviations</th>
                <th className="py-2.5 px-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {careTeams.map((team) => (
                <tr key={team.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{team.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{team.protocol}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{team.volume} pts</td>
                  <td className="py-3 px-3 text-right font-bold text-teal-700">
                    {team.adherence}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        team.deviations > 4 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {team.deviations}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      Tier 1 Exceeds
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
