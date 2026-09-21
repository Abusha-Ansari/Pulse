import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SimulationSpeed } from '../types/tracker';
import {
  Settings,
  Sliders,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Coffee,
  HardDrive,
  FileJson,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    simulationSettings,
    userPreferences,
    records,
    applications,
    updateSimulationSettings,
    updateUserPreferences,
    setSimulationSpeed,
    togglePauseSimulation,
    resetDataToDefault,
    generateFreshData,
    exportDataJson,
    importDataJson,
    clearAllData,
  } = useTracker();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Telemetry data exported successfully as JSON file!');
  };

  const handleImportSubmit = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please provide valid JSON text to import.');
      return;
    }
    const success = importDataJson(importJsonText);
    if (success) {
      setImportModalOpen(false);
      setImportJsonText('');
      showToast('Data imported and loaded successfully!');
    } else {
      setImportError('Invalid JSON structure. Please check the backup file format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  const speeds: SimulationSpeed[] = [1, 5, 10];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Simulation Hub</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure real-time simulation mechanics, application preferences, and local data persistence.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Section 1: Live Simulation Engine Parameters */}
      <Card>
        <CardHeader
          title="Live Activity Simulation Engine"
          subtitle="Tweak autonomous app switching, clock acceleration, and break patterns"
        />

        <div className="space-y-5 mt-2">
          {/* Engine Status & Pause */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Simulation Engine State
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Controls the active ticking clock and background duration increments.
              </p>
            </div>
            <button
              onClick={togglePauseSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                simulationSettings.isPaused
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {simulationSettings.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Engine</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Speed */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Clock Simulation Speed
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Fast-forward tracking to preview sessions and hour accumulations quickly.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSimulationSpeed(s)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                    simulationSettings.speed === s
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s}x {s === 1 ? '(Real-Time)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Switch Interval Slider */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Autonomous App Switch Cadence
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  How frequently the simulator switches context to another software application.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                {simulationSettings.autoSwitchIntervalSec} seconds
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="180"
              step="5"
              value={simulationSettings.autoSwitchIntervalSec}
              onChange={(e) =>
                updateSimulationSettings({
                  autoSwitchIntervalSec: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15s (Rapid Demo)</span>
              <span>45s (Standard)</span>
              <span>180s (Deep Work)</span>
            </div>
          </div>

          {/* Idle Simulation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Simulate Random Away / Coffee Breaks
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Intermittently pauses focus to mimic walking away from keyboard.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                updateSimulationSettings({
                  idleSimulationEnabled: !simulationSettings.idleSimulationEnabled,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                simulationSettings.idleSimulationEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  simulationSettings.idleSimulationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Section 2: User Preferences */}
      <Card>
        <CardHeader
          title="User Preferences & Targets"
          subtitle="Display preferences and daily productive goals"
        />

        <div className="space-y-4 mt-2">
          {/* Time Format */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Clock Time Format</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Display hours in 12-hour (1:00 PM) or 24-hour (13:00) military notation.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => updateUserPreferences({ timeFormat: '12h' })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  userPreferences.timeFormat === '12h'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                12-Hour
              </button>
              <button
                onClick={() => updateUserPreferences({ timeFormat: '24h' })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  userPreferences.timeFormat === '24h'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Daily Screen Time Goal */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Daily Screen Time Budget Goal
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimal daily ceiling target for balancing screen fatigue.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                {Math.round(userPreferences.dailyGoalSeconds / 3600)} Hours
              </span>
            </div>

            <input
              type="range"
              min="4"
              max="14"
              step="1"
              value={Math.round(userPreferences.dailyGoalSeconds / 3600)}
              onChange={(e) =>
                updateUserPreferences({
                  dailyGoalSeconds: parseInt(e.target.value, 10) * 3600,
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4h (Light)</span>
              <span>8h (Standard Workday)</span>
              <span>14h (Intensive)</span>
            </div>
          </div>

          {/* Weekly Productive Focus Goal */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Weekly Productive Focus Target
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target hours of productive coding, design, and focused work per week.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                {userPreferences.weeklyProductiveGoalHours || 30} Hours
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={userPreferences.weeklyProductiveGoalHours || 30}
              onChange={(e) =>
                updateUserPreferences({
                  weeklyProductiveGoalHours: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10h (Part-time)</span>
              <span>30h (Standard Focus)</span>
              <span>50h (Sprint)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Data Management & Persistence */}
      <Card>
        <CardHeader
          title="Data Management & Backup"
          subtitle="Import, export, regenerate mock historical logs, or reset the database"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Export */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Telemetry (JSON)</span>
              </div>
              <p className="text-xs text-slate-400">
                Download a full JSON archive containing all applications, records, and settings.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExport}
                className="w-full"
              >
                Export JSON Archive
              </Button>
            </div>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import JSON Backup</span>
              </div>
              <p className="text-xs text-slate-400">
                Restore a previously exported backup file or paste raw JSON.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => setImportModalOpen(true)}
                className="w-full"
              >
                Import from Backup
              </Button>
            </div>
          </div>

          {/* Generate 30-Day Fresh Data */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Generate Fresh 30-Day History</span>
              </div>
              <p className="text-xs text-slate-400">
                Populates 30 continuous days of rich mock records to test long-term analytics.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  generateFreshData(30);
                  showToast('Generated 30-day realistic sample dataset!');
                }}
                className="w-full"
              >
                Generate 30-Day Sample
              </Button>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                <Trash2 className="w-4 h-4" />
                <span>Reset Data to Default</span>
              </div>
              <p className="text-xs text-slate-400">
                Restores default apps, 14-day history, and resets simulator to default state.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (confirm('Reset all tracking data and restore factory defaults?')) {
                    resetDataToDefault();
                    showToast('Tracker data reset to initial default state.');
                  }
                }}
                className="w-full"
              >
                Factory Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Database & Storage Stats Footer */}
        <div className="mt-4 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage: localStorage (Persistent client-side engine)</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>{applications.length} Monitored Apps</span>
            <span>{records.length} Recorded Sessions</span>
          </div>
        </div>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Telemetry JSON Backup"
        subtitle="Upload a file or paste raw backup JSON to overwrite current state"
      >
        <div className="space-y-4">
          {importError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {importError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select JSON File:
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Or Paste JSON Content:
            </label>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"exportVersion": "1.0", "applications": [...], "records": [...]}'
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImportSubmit}
            >
              Load & Apply Backup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
