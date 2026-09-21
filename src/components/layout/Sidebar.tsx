import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid,
  Clock,
  BarChart3,
  Settings,
  Activity,
  Zap,
  Radio,
  Cpu,
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { simulationSettings, activeSession } = useTracker();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: Grid },
    { to: '/timeline', label: 'Timeline', icon: Clock },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/scheduler', label: 'CPU Scheduler', icon: Cpu },
    { to: '/settings', label: 'Settings & Sim', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F1420] border-r border-[#1E293B] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1E293B]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0F1420] rounded-[10px] flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Pulse
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIVE
                </span>
              </span>
              <p className="text-[11px] text-slate-400 -mt-0.5">Screen-Time Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="p-4 border-t border-[#1E293B]">
          <div className="p-3 rounded-xl bg-[#161D2B] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Simulator Status</span>
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    simulationSettings.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                {simulationSettings.isPaused ? 'PAUSED' : `${simulationSettings.speed}x ACTIVE`}
              </span>
            </div>

            <div className="text-[11px] text-slate-300 truncate">
              <span className="text-slate-500">Target: </span>
              <span className="font-semibold text-slate-200">{activeSession.applicationName}</span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  simulationSettings.isPaused ? 'bg-amber-400' : 'bg-emerald-400'
                } transition-all duration-300`}
                style={{
                  width: `${Math.min(
                    100,
                    (activeSession.durationSeconds % simulationSettings.autoSwitchIntervalSec) /
                      simulationSettings.autoSwitchIntervalSec *
                      100
                  )}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>Auto-cycle</span>
              <span>{simulationSettings.autoSwitchIntervalSec}s</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
