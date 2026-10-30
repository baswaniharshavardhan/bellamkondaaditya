import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import {
  DepartmentMetric,
  ClinicalDeviationAlert,
  CohortInflowPoint,
  Patient,
} from '../types/clinical';

interface ExecutiveOverviewProps {
  departmentMetrics: DepartmentMetric[];
  alerts: ClinicalDeviationAlert[];
  cohortInflow: CohortInflowPoint[];
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAlertAudit: (alert: ClinicalDeviationAlert) => void;
  onNavigateToCohorts: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  departmentMetrics,
  alerts,
  cohortInflow,
  patients,
  onSelectPatient,
  onOpenAlertAudit,
  onNavigateToCohorts,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<'inflow' | 'adverse'>('inflow');

  // Chart dimensions & scaling
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;

  const maxActual = Math.max(...cohortInflow.map((d) => Math.max(d.actualCohort, d.baselineProjection, d.priorCycle)));
  const minActual = Math.min(...cohortInflow.map((d) => Math.min(d.actualCohort, d.baselineProjection, d.priorCycle))) * 0.9;

  const getY = (val: number) => {
    return (
      chartHeight -
      paddingY -
      ((val - minActual) / (maxActual - minActual)) * (chartHeight - paddingY * 2)
    );
  };

  const getX = (idx: number) => {
    return paddingX + (idx / (cohortInflow.length - 1)) * (chartWidth - paddingX * 2);
  };

  // Generate SVG path points
  const actualPoints = cohortInflow.map((d, i) => `${getX(i)},${getY(d.actualCohort)}`).join(' ');
  const baselinePoints = cohortInflow.map((d, i) => `${getX(i)},${getY(d.baselineProjection)}`).join(' ');
  const priorPoints = cohortInflow.map((d, i) => `${getX(i)},${getY(d.priorCycle)}`).join(' ');

  // Area path for actual cohort
  const areaPath = `M ${getX(0)},${chartHeight - paddingY} ` +
    cohortInflow.map((d, i) => `L ${getX(i)},${getY(d.actualCohort)}`).join(' ') +
    ` L ${getX(cohortInflow.length - 1)},${chartHeight - paddingY} Z`;

  // Total census
  const totalOccupied = departmentMetrics.reduce((acc, d) => acc + d.bedsOccupied, 0);
  const totalBeds = departmentMetrics.reduce((acc, d) => acc + d.totalBeds, 0);
  const overallOccupancy = Math.round((totalOccupied / totalBeds) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header / Contextual Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Institutional Telemetry & Clinical Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active cohort tracking, quality bundle governance, and acute bed capacity.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="font-semibold text-slate-900 tabular-nums">
              {totalOccupied} / {totalBeds}
            </span>
            <span className="text-slate-500">Beds ({overallOccupancy}%)</span>
          </div>
          <button
            onClick={onNavigateToCohorts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            <span>Cohort Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards with 2px status indicator bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Readmission Rate */}
        <div className="relative bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-teal-600" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>30-Day All-Cause Readmission</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              11.4%
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded tabular-nums">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -1.8%
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
            <span>Institutional Target: &lt;12.0%</span>
            <span className="text-teal-700 font-medium">Compliant</span>
          </div>
        </div>

        {/* Card 2: Sepsis Bundle SEP-1 */}
        <div className="relative bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-teal-600" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>SEP-1 Sepsis Bundle Adherence</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              88.6%
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded tabular-nums">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +4.2%
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
            <span>CMS Benchmark: &gt;85.0%</span>
            <span className="text-teal-700 font-medium">Target Met</span>
          </div>
        </div>

        {/* Card 3: ICU Bed Utilization */}
        <div className="relative bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ICU High-Acuity Utilization</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              91.6%
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded tabular-nums">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +3.1%
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
            <span>Warning Ceiling: 90.0%</span>
            <span className="text-amber-700 font-medium">Near Capacity</span>
          </div>
        </div>

        {/* Card 4: Adverse Drug Events ADE */}
        <div className="relative bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-teal-600" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Adverse Drug Event (ADE) Index</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              0.42
            </span>
            <span className="text-xs text-slate-500 font-normal">/ 1k pt-days</span>
            <span className="inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded tabular-nums ml-auto">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -14.2%
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
            <span>Baseline Peer: 0.65</span>
            <span className="text-teal-700 font-medium">Top Decile</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Chart (Left 7 Cols) + Department Acuity Matrix (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Longitudinal Cohort Inflow & Velocity Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Cohort Census & Readmission Velocity
              </h2>
              <p className="text-xs text-slate-500">
                Active high-risk cohort trajectory vs institutional baseline projection.
              </p>
            </div>
            {/* Chart mode toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
              <button
                onClick={() => setChartMetric('inflow')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  chartMetric === 'inflow'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inflow Census
              </button>
              <button
                onClick={() => setChartMetric('adverse')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  chartMetric === 'adverse'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Adverse Deviations
              </button>
            </div>
          </div>

          {/* SVG Chart Canvas */}
          <div className="mt-4 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                const val = Math.round(maxActual - pct * (maxActual - minActual));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="2 3"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94A3B8"
                      className="font-mono tabular-nums"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area for Actual Cohort */}
              <path d={areaPath} fill="url(#actualGradient)" />

              {/* Baseline Projection Line (Sky Blue #0284C7) */}
              <polyline
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
                strokeDasharray="4 4"
                points={baselinePoints}
              />

              {/* Prior Period Line (Slate 500 #64748B) */}
              <polyline
                fill="none"
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                points={priorPoints}
              />

              {/* Actual Cohort Line (Clinical Teal #0D9488) */}
              <polyline
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={actualPoints}
              />

              {/* Data Point interactive nodes */}
              {cohortInflow.map((d, i) => {
                const cx = getX(i);
                const cy = getY(d.actualCohort);
                const isHovered = hoveredPointIndex === i;

                return (
                  <g
                    key={d.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#0D9488"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all"
                    />
                    {/* X axis labels */}
                    <text
                      x={cx}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? '#0F172A' : '#64748B'}
                      fontWeight={isHovered ? '600' : '400'}
                    >
                      {d.date}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredPointIndex !== null && (
              <div
                className="absolute z-10 bg-slate-900 text-white rounded p-2.5 text-xs shadow-lg pointer-events-none transition-all"
                style={{
                  left: `${(getX(hoveredPointIndex) / chartWidth) * 100}%`,
                  top: '12%',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-4">
                  <span>{cohortInflow[hoveredPointIndex].date}</span>
                  <span className="text-[10px] text-teal-300 font-mono">
                    Δ{' '}
                    {cohortInflow[hoveredPointIndex].actualCohort -
                      cohortInflow[hoveredPointIndex].baselineProjection}{' '}
                    pts
                  </span>
                </div>
                <div className="space-y-1 tabular-nums text-[11px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-teal-400">Actual Cohort:</span>
                    <span className="font-bold">
                      {cohortInflow[hoveredPointIndex].actualCohort}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sky-300">Baseline Target:</span>
                    <span>
                      {cohortInflow[hoveredPointIndex].baselineProjection}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Prior Period:</span>
                    <span>{cohortInflow[hoveredPointIndex].priorCycle}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-rose-300">
                    <span>Adverse Incidents:</span>
                    <span className="font-bold">
                      {cohortInflow[hoveredPointIndex].adverseEvents}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-teal-600 rounded-full" />
                <span className="text-slate-700 font-medium">Actual Cohort</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-600 border-t border-dashed border-sky-600" />
                <span>Baseline Projection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-slate-400 border-t border-dotted border-slate-400" />
                <span>Prior Cycle</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Updated 2 min ago · HL7-FHIR Synced
            </div>
          </div>
        </div>

        {/* Clinical Department Acuity & Census Matrix (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Department Acuity Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Bed capacity, patient acuity mix, and protocol deviations.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                5 Active Units
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {departmentMetrics.map((dept) => {
                const occupancyPct = Math.round((dept.bedsOccupied / dept.totalBeds) * 100);
                const criticalPct = Math.round((dept.criticalCount / dept.totalBeds) * 100);
                const obsPct = Math.round((dept.observationCount / dept.totalBeds) * 100);
                const stablePct = Math.round((dept.stableCount / dept.totalBeds) * 100);

                return (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">
                        {dept.department}
                      </span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="text-slate-500">
                          {dept.bedsOccupied}/{dept.totalBeds} ({occupancyPct}%)
                        </span>
                        {dept.protocolDeviationCount > 0 && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">
                            {dept.protocolDeviationCount} dev
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stacked Capacity Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden flex">
                      <div
                        style={{ width: `${criticalPct}%` }}
                        className="bg-rose-600 transition-all"
                        title={`Critical: ${dept.criticalCount}`}
                      />
                      <div
                        style={{ width: `${obsPct}%` }}
                        className="bg-amber-500 transition-all"
                        title={`Observation: ${dept.observationCount}`}
                      />
                      <div
                        style={{ width: `${stablePct}%` }}
                        className="bg-teal-600 transition-all"
                        title={`Stable: ${dept.stableCount}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>ALOS: {dept.avgLengthOfStayDays}d</span>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-600 font-medium">{dept.criticalCount} crit</span>
                        <span>·</span>
                        <span className="text-amber-600 font-medium">{dept.observationCount} obs</span>
                        <span>·</span>
                        <span className="text-teal-600 font-medium">{dept.stableCount} stb</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acuity Legend */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Critical</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Observation</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>Stable</span>
              </span>
            </div>
            <span className="text-slate-400">Updated Real-Time</span>
          </div>
        </div>
      </div>

      {/* Immediate Clinical Deviations & Safety Alerts Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Active Clinical Protocol Deviations & Immediate Alerts
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Showing {alerts.length} active alerts requiring physician or charge nurse review
          </span>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {alerts.map((alert) => {
            const correspondingPatient = patients.find((p) => p.id === alert.patientId);

            return (
              <div
                key={alert.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {alert.title}
                      </span>
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
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-700">
                        {alert.patientName} ({alert.mrn})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        {alert.ward} · Bed {alert.bed}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                      {alert.description}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-teal-700 font-medium">
                        Action Required: {alert.actionRequired}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {correspondingPatient && (
                    <button
                      onClick={() => onSelectPatient(correspondingPatient)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    >
                      Patient Chart
                    </button>
                  )}
                  <button
                    onClick={() => onOpenAlertAudit(alert)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <span>Review & Sign</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
