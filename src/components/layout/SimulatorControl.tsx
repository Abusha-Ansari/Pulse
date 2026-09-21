import React, { useState, useRef, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { SimulationSpeed } from '../../types/tracker';
import { AppIcon } from '../ui/AppIcon';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Coffee,
  ChevronDown,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SimulatorControl: React.FC = () => {
  const {
    activeSession,
    simulationSettings,
    applications,
    switchActiveApp,
    togglePauseSimulation,
    setSimulationSpeed,
    triggerManualBreak,
    resetDataToDefault,
  } = useTracker();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const speeds: SimulationSpeed[] = [1, 5, 10];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#161D2B]/90 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-2xl shadow-lg">
      {/* Simulation status pill */}
      <div className="flex items-center gap-2 pr-2 border-r border-[#1E293B]">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-semibold text-slate-300">SIMULATOR:</span>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePauseSimulation}
          title={simulationSettings.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          className={`p-1.5 rounded-lg transition-all ${
            simulationSettings.isPaused
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          }`}
        >
          {simulationSettings.isPaused ? (
            <Play className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Pause className="w-3.5 h-3.5 fill-current" />
          )}
        </button>
      </div>

      {/* Speed Selector (1x, 5x, 10x) */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSimulationSpeed(s)}
            className={`px-2 py-0.5 text-xs font-mono rounded-md font-medium transition-all ${
              simulationSettings.speed === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Manual Switch Active App Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors font-medium"
        >
          <span className="text-slate-400">Switch:</span>
          <span className="font-semibold text-slate-100 max-w-[90px] truncate">
            {activeSession.applicationName}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-[#161D2B] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 uppercase tracking-wider">
              Force Switch Active App
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {applications.map((app) => {
                const isCurrent = app.id === activeSession.appId && !activeSession.isIdle;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      switchActiveApp(app.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors text-left ${
                      isCurrent
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${app.color}20`, color: app.color }}
                      >
                        <AppIcon name={app.iconName} className="w-3 h-3" />
                      </div>
                      <span className="truncate">{app.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800/80 pt-1 mt-1">
              <button
                onClick={() => {
                  triggerManualBreak();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Simulate Coffee Break / Idle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Break Button */}
      <button
        onClick={triggerManualBreak}
        title="Simulate Coffee Break (Away From Keyboard)"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors font-medium"
      >
        <Coffee className="w-3 h-3" />
        <span>Break</span>
      </button>

      {/* Reset to Default */}
      <button
        onClick={() => {
          if (confirm('Reset tracker data and simulator back to default initial state?')) {
            resetDataToDefault();
          }
        }}
        title="Reset mock data and active simulator to default"
        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
