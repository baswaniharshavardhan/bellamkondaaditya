import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { CohortRiskExplorer } from './components/CohortRiskExplorer';
import { ProtocolComplianceView } from './components/ProtocolComplianceView';
import { WardBedsideFlow } from './components/WardBedsideFlow';
import { CohortBuilderSandbox } from './components/CohortBuilderSandbox';
import { PatientAuditDrawer } from './components/PatientAuditDrawer';
import { AlertNotificationFlyout } from './components/AlertNotificationFlyout';
import {
  INITIAL_PATIENTS,
  DEPARTMENT_METRICS,
  CLINICAL_ALERTS,
  COHORT_INFLOW_HISTORY,
} from './data/mockClinicalData';
import { Patient, ClinicalDeviationAlert, DepartmentMetric } from './types/clinical';
import { Activity, Bell, FileSpreadsheet, PlusCircle, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [facility, setFacility] = useState<string>('MetroHealth Academic Center (Main Campus)');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [alerts, setAlerts] = useState<ClinicalDeviationAlert[]>(CLINICAL_ALERTS);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>(DEPARTMENT_METRICS);

  // Selected patient for deep audit / chart
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAlertForAudit, setSelectedAlertForAudit] = useState<ClinicalDeviationAlert | null>(null);

  // Alerts Flyout Modal
  const [isAlertsFlyoutOpen, setIsAlertsFlyoutOpen] = useState<boolean>(false);

  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live telemetry simulation effect
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setPatients((prev) =>
        prev.map((pt) => {
          // slight normal fluctuation in vitals
          const hrDelta = Math.floor(Math.random() * 3) - 1;
          const mapDelta = Math.floor(Math.random() * 3) - 1;
          const newHr = Math.max(45, Math.min(140, pt.vitals.hr + hrDelta));
          const newMap = Math.max(55, Math.min(125, pt.vitals.map + mapDelta));

          return {
            ...pt,
            vitals: {
              ...pt.vitals,
              hr: newHr,
              map: newMap,
            },
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Handle global search filter
  const displayedPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.primaryDiagnosis.toLowerCase().includes(q) ||
      p.ward.toLowerCase().includes(q) ||
      p.protocol.protocolName.toLowerCase().includes(q)
    );
  });

  // Handle Physician Sign-off from Audit Drawer
  const handleSignOff = (
    patientId: string,
    disposition: string,
    rationale: string,
    doctorName: string
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            protocol: {
              ...p.protocol,
              status: 'compliant',
              deviationReason: undefined,
              verifiedBy: doctorName,
            },
            notes: [
              ...p.notes,
              `[${new Date().toLocaleTimeString()}] Disposition '${disposition.toUpperCase()}' signed by ${doctorName}. Note: ${
                rationale || 'Protocol verified.'
              }`,
            ],
          };
        }
        return p;
      })
    );

    // Resolve corresponding alert
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.patientId === patientId) {
          return { ...a, status: 'resolved' };
        }
        return a;
      })
    );

    showToast(`Clinical sign-off recorded for patient by ${doctorName}.`);
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return { ...a, status: 'acknowledged' };
        }
        return a;
      })
    );
    showToast('Alert acknowledged by clinical supervisor.');
  };

  // Open audit from alert
  const handleOpenAlertAudit = (alert: ClinicalDeviationAlert) => {
    const targetPatient = patients.find((p) => p.id === alert.patientId);
    if (targetPatient) {
      setSelectedPatient(targetPatient);
      setSelectedAlertForAudit(alert);
    }
  };

  // Trigger simulated new clinical alert
  const handleTriggerSimulatedAlert = () => {
    const newAlert: ClinicalDeviationAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      patientId: 'pt-102',
      patientName: 'Robert K. Chen',
      mrn: 'MRN-794012',
      ward: 'Acute Cardiology',
      bed: 'CARD-12',
      severity: 'warning',
      protocol: 'Heart Failure GDMT',
      title: 'Serum Potassium Elevation (5.4 mEq/L) on ARNI + MRA',
      description: 'Follow-up basic metabolic panel indicates borderline hyperkalemia during uptitration. EKG rhythm strip requested.',
      timestamp: 'Just now',
      actionRequired: 'Hold evening Spironolactone dose and verify telemetry rhythm.',
      status: 'active',
    };

    setAlerts([newAlert, ...alerts]);
    showToast('Simulated real-time clinical protocol alert triggered!');
  };

  // Export full system report
  const handleExportSystemCSV = () => {
    const headers = [
      'Facility,Timeframe,Patient ID,MRN,Full Name,Age,Gender,Ward,Bed,Primary Diagnosis,ICD10,Acuity,NEWS2,LACE+,HR,MAP,SpO2,Lactate,Protocol,Protocol Status,Attending',
    ];
    const rows = patients.map(
      (p) =>
        `"${facility}","${timeframe}","${p.id}","${p.mrn}","${p.fullName}",${p.age},"${p.gender}","${p.ward}","${p.bed}","${p.primaryDiagnosis}","${p.icd10}","${p.acuity}",${p.news2Score},${p.lacePlusScore},${p.vitals.hr},${p.vitals.map},${p.vitals.spo2},${p.biomarkers.lactate},"${p.protocol.protocolName}","${p.protocol.status}","${p.attendingPhysician}"`
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `Clinical_Precision_Analytics_Full_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comprehensive institutional clinical CSV exported.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        facility={facility}
        onFacilityChange={setFacility}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        alerts={alerts}
        onOpenAlertsFlyout={() => setIsAlertsFlyoutOpen(true)}
        onExportReport={handleExportSystemCSV}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search filter warning strip if filtered */}
        {searchQuery && (
          <div className="mb-4 p-2.5 bg-sky-50 border border-sky-200 rounded text-xs text-sky-900 flex items-center justify-between">
            <span>
              Filtering across system records for: <strong>"{searchQuery}"</strong> (
              {displayedPatients.length} matches)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-700 font-semibold hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <ExecutiveOverview
            departmentMetrics={departmentMetrics}
            alerts={alerts.filter((a) => a.status === 'active')}
            cohortInflow={COHORT_INFLOW_HISTORY}
            patients={displayedPatients}
            onSelectPatient={setSelectedPatient}
            onOpenAlertAudit={handleOpenAlertAudit}
            onNavigateToCohorts={() => setActiveTab('cohorts')}
          />
        )}

        {activeTab === 'cohorts' && (
          <CohortRiskExplorer
            patients={displayedPatients}
            onSelectPatient={setSelectedPatient}
            onOpenProtocolAudit={(pt) => setSelectedPatient(pt)}
          />
        )}

        {activeTab === 'protocols' && (
          <ProtocolComplianceView
            patients={displayedPatients}
            onSelectPatient={setSelectedPatient}
            onOpenAuditForProtocol={(pt) => setSelectedPatient(pt)}
          />
        )}

        {activeTab === 'telemetry' && (
          <WardBedsideFlow
            patients={displayedPatients}
            onSelectPatient={setSelectedPatient}
            onOpenAudit={(pt) => setSelectedPatient(pt)}
          />
        )}

        {activeTab === 'builder' && <CohortBuilderSandbox />}
      </main>

      {/* Floating Simulation Controls Toolbar */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 text-xs">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming ? 'bg-teal-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="font-mono text-[11px] text-slate-300">
            {isStreaming ? 'Live HL7 Feed' : 'Feed Paused'}
          </span>
        </div>

        <button
          onClick={handleTriggerSimulatedAlert}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/90 hover:bg-rose-600 text-white font-medium transition-colors"
          title="Trigger an incoming real-time protocol deviation alert"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Simulate Deviation</span>
        </button>

        <button
          onClick={handleExportSystemCSV}
          className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
          title="Export CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded shadow-lg border border-teal-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Patient Deep Audit Drawer */}
      <PatientAuditDrawer
        patient={selectedPatient}
        alert={selectedAlertForAudit}
        onClose={() => {
          setSelectedPatient(null);
          setSelectedAlertForAudit(null);
        }}
        onSignOff={handleSignOff}
      />

      {/* Alert Notification Flyout */}
      <AlertNotificationFlyout
        isOpen={isAlertsFlyoutOpen}
        onClose={() => setIsAlertsFlyoutOpen(false)}
        alerts={alerts.filter((a) => a.status === 'active')}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onOpenAudit={handleOpenAlertAudit}
      />

      {/* Subdued Clinical Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Clinical Precision Analytics</span>
            <span>·</span>
            <span>Enterprise Healthcare Quality & Epidemiological Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>CMS Quality Reporting Verified</span>
            <span>·</span>
            <span>FHIR R4 / HL7 Telemetry Engine</span>
            <span>·</span>
            <span>Confidential Medical Records</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
