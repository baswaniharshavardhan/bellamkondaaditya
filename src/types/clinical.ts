export type AcuityLevel = 'stable' | 'observation' | 'critical';

export type ProtocolStatus = 'compliant' | 'deviation' | 'pending';

export interface Vitals {
  hr: number; // beats per min
  sbp: number; // mmHg
  dbp: number; // mmHg
  rr: number; // breaths per min
  spo2: number; // percentage
  temp: number; // Celsius
  map: number; // Mean arterial pressure
}

export interface Biomarkers {
  lactate: number; // mmol/L (norm: 0.5-1.9, critical >2.0, severe >4.0)
  egfr: number; // mL/min/1.73m2 (norm: >90, severe <30)
  troponinI: number; // ng/mL (norm: <0.04, elevated >0.40)
  hba1c: number; // % (norm: <5.7, diabetes >6.5)
  wbc: number; // x10^3/uL (norm: 4.5-11.0)
  crp: number; // mg/L (norm: <5.0)
  platelets: number; // x10^3/uL (norm: 150-450)
  creatinine: number; // mg/dL (norm: 0.6-1.2)
}

export interface ProtocolRecord {
  protocolId: string;
  protocolName: string;
  category: 'Sepsis (SEP-1)' | 'ERAS Surgical' | 'Antimicrobial Stewardship' | 'Heart Failure GDMT' | 'VTE Prevention';
  status: ProtocolStatus;
  stepName?: string;
  timeRemainingMinutes?: number;
  deviationReason?: string;
  assignedTime: string;
  dueDate: string;
  verifiedBy?: string;
}

export interface LabTrendPoint {
  timestamp: string;
  lactate: number;
  creatinine: number;
  wbc: number;
  hr: number;
  map: number;
}

export interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  ward: 'ICU-North' | 'Medical Stepdown' | 'Acute Cardiology' | 'Post-Op Surgical 4W' | 'Emergency Observation';
  bed: string;
  admissionDate: string;
  primaryDiagnosis: string;
  icd10: string;
  acuity: AcuityLevel;
  news2Score: number; // National Early Warning Score 2 (0-20)
  lacePlusScore: number; // LACE+ 30d readmission index (0-100)
  vitals: Vitals;
  biomarkers: Biomarkers;
  protocol: ProtocolRecord;
  attendingPhysician: string;
  dischargeReadinessPct: number; // 0 - 100
  labHistory: LabTrendPoint[];
  medications: string[];
  allergies: string[];
  notes: string[];
}

export interface DepartmentMetric {
  department: string;
  bedsOccupied: number;
  totalBeds: number;
  criticalCount: number;
  observationCount: number;
  stableCount: number;
  protocolDeviationCount: number;
  avgLengthOfStayDays: number;
}

export interface ClinicalDeviationAlert {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  ward: string;
  bed: string;
  severity: 'critical' | 'warning' | 'info';
  protocol: string;
  title: string;
  description: string;
  timestamp: string;
  actionRequired: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface CohortInflowPoint {
  date: string;
  actualCohort: number;
  baselineProjection: number;
  priorCycle: number;
  adverseEvents: number;
}

export interface KaplanMeierDataPoint {
  day: number;
  interventionSurvivalPct: number;
  standardCareSurvivalPct: number;
  patientsAtRiskIntervention: number;
  patientsAtRiskStandard: number;
  eventsIntervention: number;
  eventsStandard: number;
}
