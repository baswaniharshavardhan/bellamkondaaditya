import React from 'react';
import {
  Activity,
  Bell,
  Download,
  Building2,
  Play,
  Pause,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ClinicalDeviationAlert } from '../types/clinical';

export type ActiveTab = 'overview' | 'cohorts' | 'protocols' | 'telemetry' | 'builder';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  facility: string;
  onFacilityChange: (facility: string) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  alerts: ClinicalDeviationAlert[];
  onOpenAlertsFlyout: () => void;
  onExportReport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  timeframe,
  onTimeframeChange,
  facility,
  onFacilityChange,
  isStreaming,
  onToggleStreaming,
  alerts,
  onOpenAlertsFlyout,
  onExportReport,
  searchQuery,
  onSearchChange,
}) => {
  const activeAlertCount = alerts.filter(a => a.status === 'active').length;

  const facilities = [
    'MetroHealth Academic Center (Main Campus)',
    'Northwestern Oncology & Surgical Center',
    'St. Jude Memorial Cardiovascular ICU',
  ];

  const timeframes = ['24H', '7D', '30D', '90D', 'YTD'];

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Executive Overview' },
    { id: 'cohorts', label: 'Cohort Risk Stratification' },
    { id: 'protocols', label: 'Protocol & Quality Measures' },
    { id: 'telemetry', label: 'Ward Telemetry & Flow' },
    { id: 'builder', label: 'Cohort Sandbox' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
      {/* Top utility row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-100">
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-4 h-4 text-teal-400 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    Clinical Precision Analytics
                  </span>
                  <span className="hidden md:inline-flex items-center text-[10px] font-semibold tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                    CLINICAL v4.2
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <span>Epidemiological Intelligence</span>
                  <span aria-hidden="true">·</span>
                  <span>Institutional Telemetry</span>
                </div>
              </div>
            </div>

            {/* Facility Selector */}
            <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-slate-200">
              <Building2 className="w-4 h-4 text-slate-400 mr-2" />
              <select
                aria-label="Select facility"
                value={facility}
                onChange={(e) => onFacilityChange(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent hover:text-slate-900 focus:outline-none cursor-pointer pr-4"
              >
                {facilities.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Bar */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search MRN, patient, protocol..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Timeframe Segmented Control */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200/80">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded transition-all tabular-nums ${
                    timeframe === tf
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Live Streaming Toggle */}
            <button
              onClick={onToggleStreaming}
              title={isStreaming ? 'Pause live telemetry stream' : 'Resume live telemetry stream'}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                isStreaming
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? 'bg-teal-600 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {isStreaming ? 'Live' : 'Paused'}
              </span>
              {isStreaming ? (
                <Pause className="w-3 h-3 text-teal-700 ml-0.5" />
              ) : (
                <Play className="w-3 h-3 text-slate-500 ml-0.5" />
              )}
            </button>

            {/* Clinical Deviations Alert Bell */}
            <button
              onClick={onOpenAlertsFlyout}
              className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="View Clinical Deviations & Immediate Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Export CSV / Report */}
            <button
              onClick={onExportReport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-200 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors rounded ${
                  isActive
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-teal-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
