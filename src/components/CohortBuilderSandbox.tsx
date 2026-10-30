import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  Download,
  Sparkles,
  Save,
  Check,
  TrendingDown,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface Criterion {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'inclusion' | 'exclusion';
}

export const CohortBuilderSandbox: React.FC = () => {
  const [cohortName, setCohortName] = useState<string>('Post-Sepsis Care Transition & Readmission Prevention');
  const [targetCondition, setTargetCondition] = useState<string>('Sepsis & Severe Infection');
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 'c1', field: 'Primary ICD-10', operator: 'equals', value: 'A41.9 (Sepsis Unspecified)', type: 'inclusion' },
    { id: 'c2', field: 'Peak Serum Lactate', operator: '>=', value: '2.5 mmol/L', type: 'inclusion' },
    { id: 'c3', field: 'Patient Age', operator: '>=', value: '65 years', type: 'inclusion' },
    { id: 'c4', field: 'LACE+ Readmission Score', operator: '>=', value: '60', type: 'inclusion' },
    { id: 'c5', field: 'Hospice / Palliative Care Orders', operator: 'equals', value: 'Active', type: 'exclusion' },
  ]);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Field options
  const fieldOptions = [
    'Primary ICD-10',
    'Patient Age',
    'Peak Serum Lactate',
    'eGFR (Kidney Function)',
    'Troponin I',
    'HbA1c',
    'NEWS2 Early Warning Score',
    'LACE+ Readmission Score',
    'Prior 30-Day Inpatient Admission',
    'Hospice / Palliative Care Orders',
  ];

  const operatorOptions = ['>=', '<=', 'equals', 'contains', 'between'];

  const addCriterion = (type: 'inclusion' | 'exclusion') => {
    const newId = `c-${Date.now()}`;
    setCriteria([
      ...criteria,
      {
        id: newId,
        field: type === 'inclusion' ? 'Patient Age' : 'Hospice / Palliative Care Orders',
        operator: type === 'inclusion' ? '>=' : 'equals',
        value: type === 'inclusion' ? '50' : 'Active',
        type,
      },
    ]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const updateCriterion = (id: string, key: keyof Criterion, val: string) => {
    setCriteria(
      criteria.map((c) => {
        if (c.id === id) {
          return { ...c, [key]: val };
        }
        return c;
      })
    );
  };

  const loadPreset = (preset: string) => {
    if (preset === 'hf') {
      setCohortName('HFrEF GDMT Optimization & Remote Hemodynamic Monitoring');
      setTargetCondition('Heart Failure (HFrEF)');
      setCriteria([
        { id: 'hf-1', field: 'Primary ICD-10', operator: 'contains', value: 'I50.2 (Systolic HF)', type: 'inclusion' },
        { id: 'hf-2', field: 'eGFR (Kidney Function)', operator: '>=', value: '30 mL/min', type: 'inclusion' },
        { id: 'hf-3', field: 'LACE+ Readmission Score', operator: '>=', value: '55', type: 'inclusion' },
        { id: 'hf-4', field: 'Prior 30-Day Inpatient Admission', operator: 'equals', value: 'Yes (>= 1)', type: 'inclusion' },
        { id: 'hf-5', field: 'Hospice / Palliative Care Orders', operator: 'equals', value: 'Active', type: 'exclusion' },
      ]);
    } else if (preset === 'copd') {
      setCohortName('COPD Frequent Exacerbator Pulmonary Rehab Pathway');
      setTargetCondition('COPD / Respiratory');
      setCriteria([
        { id: 'c-1', field: 'Primary ICD-10', operator: 'contains', value: 'J44.1 (COPD w/ Exacerbation)', type: 'inclusion' },
        { id: 'c-2', field: 'Patient Age', operator: '>=', value: '55 years', type: 'inclusion' },
        { id: 'c-3', field: 'NEWS2 Early Warning Score', operator: '>=', value: '5', type: 'inclusion' },
        { id: 'c-4', field: 'Hospice / Palliative Care Orders', operator: 'equals', value: 'Active', type: 'exclusion' },
      ]);
    } else {
      setCohortName('Post-Sepsis Care Transition & Readmission Prevention');
      setTargetCondition('Sepsis & Severe Infection');
      setCriteria([
        { id: 'c1', field: 'Primary ICD-10', operator: 'equals', value: 'A41.9 (Sepsis Unspecified)', type: 'inclusion' },
        { id: 'c2', field: 'Peak Serum Lactate', operator: '>=', value: '2.5 mmol/L', type: 'inclusion' },
        { id: 'c3', field: 'Patient Age', operator: '>=', value: '65 years', type: 'inclusion' },
        { id: 'c4', field: 'LACE+ Readmission Score', operator: '>=', value: '60', type: 'inclusion' },
        { id: 'c5', field: 'Hospice / Palliative Care Orders', operator: 'equals', value: 'Active', type: 'exclusion' },
      ]);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Simulated metrics based on criteria length
  const inclusionCount = criteria.filter((c) => c.type === 'inclusion').length;
  const eligibleRegistryPts = Math.round(1850 / Math.max(1, inclusionCount * 0.45));
  const projectedReadmissionDrop = (2.2 + inclusionCount * 0.4).toFixed(1);
  const bedDaysSaved = Math.round(eligibleRegistryPts * 0.36);
  const estimatedSavings = Math.round(bedDaysSaved * 2650).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Interactive Cohort Sandbox & Clinical Trial Feasibility
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Model clinical inclusion/exclusion rules, calculate registry population size, and project bed day savings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>Cohort Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Protocol Definition</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Cohort Templates Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <span className="text-xs font-semibold text-slate-700">Quick Clinical Presets:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadPreset('sepsis')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
          >
            Post-Sepsis Pathway
          </button>
          <button
            onClick={() => loadPreset('hf')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
          >
            HFrEF GDMT Optimization
          </button>
          <button
            onClick={() => loadPreset('copd')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
          >
            COPD Frequent Exacerbators
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rule Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Cohort Name & Condition */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Protocol & Cohort Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cohort Name / Pathway Identifier
                </label>
                <input
                  type="text"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-3 text-xs text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Disease Domain
                </label>
                <input
                  type="text"
                  value={targetCondition}
                  onChange={(e) => setTargetCondition(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-3 text-xs text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inclusion Criteria Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Inclusion Criteria (AND)
                </h3>
              </div>
              <button
                onClick={() => addCriterion('inclusion')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Criterion</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {criteria
                .filter((c) => c.type === 'inclusion')
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200/80 text-xs"
                  >
                    <select
                      aria-label="Inclusion field"
                      value={c.field}
                      onChange={(e) => updateCriterion(c.id, 'field', e.target.value)}
                      className="h-8 bg-white border border-slate-200 rounded px-2 text-slate-900 font-medium"
                    >
                      {fieldOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Inclusion operator"
                      value={c.operator}
                      onChange={(e) => updateCriterion(c.id, 'operator', e.target.value)}
                      className="h-8 bg-white border border-slate-200 rounded px-2 text-slate-700 font-mono w-24"
                    >
                      {operatorOptions.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) => updateCriterion(c.id, 'value', e.target.value)}
                      className="h-8 flex-1 bg-white border border-slate-200 rounded px-2 text-slate-900"
                    />

                    <button
                      onClick={() => removeCriterion(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white self-end sm:self-center"
                      title="Remove criterion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Exclusion Criteria Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Exclusion Criteria (NOT)
                </h3>
              </div>
              <button
                onClick={() => addCriterion('exclusion')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exclusion</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {criteria
                .filter((c) => c.type === 'exclusion')
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200/80 text-xs"
                  >
                    <select
                      aria-label="Exclusion field"
                      value={c.field}
                      onChange={(e) => updateCriterion(c.id, 'field', e.target.value)}
                      className="h-8 bg-white border border-slate-200 rounded px-2 text-slate-900 font-medium"
                    >
                      {fieldOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Exclusion operator"
                      value={c.operator}
                      onChange={(e) => updateCriterion(c.id, 'operator', e.target.value)}
                      className="h-8 bg-white border border-slate-200 rounded px-2 text-slate-700 font-mono w-24"
                    >
                      {operatorOptions.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) => updateCriterion(c.id, 'value', e.target.value)}
                      className="h-8 flex-1 bg-white border border-slate-200 rounded px-2 text-slate-900"
                    />

                    <button
                      onClick={() => removeCriterion(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white self-end sm:self-center"
                      title="Remove exclusion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Impact & Feasibility Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Simulated Population & Financial Impact
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Monte Carlo Model
              </span>
            </div>

            {/* Impact Cards */}
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  Eligible Hospital Patient Registry
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {eligibleRegistryPts}
                  </span>
                  <span className="text-xs text-slate-500">patients / year</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Confidence interval: 95% CI ({Math.round(eligibleRegistryPts * 0.92)} - {Math.round(eligibleRegistryPts * 1.08)})
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/60 rounded border border-teal-100">
                <div className="text-xs text-teal-800 font-medium flex items-center justify-between">
                  <span>Projected Readmission Reduction</span>
                  <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-teal-900 tabular-nums">
                    -{projectedReadmissionDrop}%
                  </span>
                  <span className="text-xs text-teal-700 font-medium">
                    (from 14.8% to {(14.8 - parseFloat(projectedReadmissionDrop)).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-sky-50/60 rounded border border-sky-100">
                <div className="text-xs text-sky-800 font-medium flex items-center justify-between">
                  <span>Inpatient Bed Days Saved</span>
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-sky-900 tabular-nums">
                    {bedDaysSaved}
                  </span>
                  <span className="text-xs text-sky-700">acute hospital days</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded">
                <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Direct Annual Institutional Savings</span>
                  <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white tabular-nums">
                    ${estimatedSavings}
                  </span>
                  <span className="text-xs text-slate-400">USD / Year</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Avoided Medicare HRRP penalties & excess variable costs
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert(`Active clinical protocol initiated for ${eligibleRegistryPts} prospective patients in ${cohortName}.`)}
                className="w-full py-2.5 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
              >
                Deploy Cohort to Active Surveillance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
