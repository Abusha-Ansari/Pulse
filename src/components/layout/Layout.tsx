import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SimulatorControl } from './SimulatorControl';
import { LiveTrackerBadge } from '../widgets/LiveTrackerBadge';
import { Menu, X, Coffee } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useTracker } from '../../context/TrackerContext';
import { AppIcon } from '../ui/AppIcon';
import { CategoryBadge, ProductivityBadge } from '../ui/Badge';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  const { applications, activeSession, switchActiveApp, triggerManualBreak } = useTracker();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header / Topbar */}
        <header className="sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-xl border-b border-[#1E293B] px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Mobile Toggle & Live Status Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl bg-[#161D2B] border border-[#1E293B] text-slate-400 hover:text-white"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <LiveTrackerBadge
                onOpenSwitchMenu={() => setSwitchModalOpen(true)}
                className="flex-1 sm:flex-none"
              />
            </div>

            {/* Right: Simulator Controls */}
            <div className="flex items-center justify-end">
              <SimulatorControl />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* App Switcher Modal (Triggered by LiveTrackerBadge) */}
      <Modal
        isOpen={switchModalOpen}
        onClose={() => setSwitchModalOpen(false)}
        title="Switch Simulated Active Application"
        subtitle="Immediately transfer focus and begin tracking live duration on another application"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {applications.map((app) => {
            const isCurrent = app.id === activeSession.appId && !activeSession.isIdle;
            return (
              <button
                key={app.id}
                onClick={() => {
                  switchActiveApp(app.id);
                  setSwitchModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                    : 'bg-[#0F1420] border-[#1E293B] hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                    style={{ backgroundColor: `${app.color}20`, color: app.color }}
                  >
                    <AppIcon name={app.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">{app.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded font-bold">
                          ACTIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{app.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <CategoryBadge category={app.category} size="sm" />
                  <ProductivityBadge type={app.productivityType} size="sm" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
          <button
            onClick={() => {
              triggerManualBreak();
              setSwitchModalOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors border border-amber-500/20"
          >
            <Coffee className="w-4 h-4" />
            <span>Simulate Coffee Break (Idle)</span>
          </button>

          <button
            onClick={() => setSwitchModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};
