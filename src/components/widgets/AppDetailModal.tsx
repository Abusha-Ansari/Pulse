import React from 'react';
import { Modal } from '../ui/Modal';
import { useTracker } from '../../context/TrackerContext';
import { formatSecondsToHM } from '../../utils/timeFormatters';
import { AppIcon } from '../ui/AppIcon';
import { CategoryBadge, ProductivityBadge } from '../ui/Badge';
import { ProductivityType } from '../../types/tracker';
import { Clock, Calendar, CheckCircle2, TrendingUp, Layers, Play } from 'lucide-react';

interface AppDetailModalProps {
  appId: string | null;
  onClose: () => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({ appId, onClose }) => {
  const {
    applications,
    records,
    activeSession,
    updateAppClassification,
    switchActiveApp,
  } = useTracker();

  if (!appId) return null;

  const app = applications.find((a) => a.id === appId);
  if (!app) return null;

  // Calculate statistics for this app
  const appRecords = records.filter((r) => r.appId === appId);
  let totalSeconds = appRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

  if (activeSession.appId === appId && !activeSession.isIdle) {
    totalSeconds += activeSession.durationSeconds;
  }

  const sessionCount = appRecords.length + (activeSession.appId === appId ? 1 : 0);
  const avgSessionSeconds = sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0;

  // Group by date to find unique days used
  const uniqueDays = new Set(appRecords.map((r) => r.date)).size || 1;
  const avgDailySeconds = Math.round(totalSeconds / uniqueDays);

  const isCurrentActive = activeSession.appId === appId && !activeSession.isIdle;

  const classifications: ProductivityType[] = ['Productive', 'Neutral', 'Distracting'];

  return (
    <Modal
      isOpen={Boolean(appId)}
      onClose={onClose}
      title={`${app.name} Details & Controls`}
      subtitle={`Detailed usage statistics and categorization for ${app.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* App Hero Card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1420] border border-[#1E293B]">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg"
              style={{ backgroundColor: `${app.color}25`, color: app.color }}
            >
              <AppIcon name={app.iconName} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-100">{app.name}</h4>
                {isCurrentActive && (
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE NOW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{app.description}</p>
            </div>
          </div>

          {!isCurrentActive && (
            <button
              onClick={() => {
                switchActiveApp(app.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate</span>
            </button>
          )}
        </div>

        {/* Classification Control */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Productivity Classification (Affects Overall Score):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {classifications.map((type) => {
              const isSelected = app.productivityType === type;
              return (
                <button
                  key={type}
                  onClick={() => updateAppClassification(app.id, type)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? type === 'Productive'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm'
                        : type === 'Neutral'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm'
                        : 'bg-rose-500/15 border-rose-500/50 text-rose-400 shadow-sm'
                      : 'bg-[#0F1420] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      type === 'Productive'
                        ? 'bg-emerald-400'
                        : type === 'Neutral'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span>{type}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Quick Stat Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <span className="text-[11px] text-slate-400 block">Total Tracked</span>
            <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
              {formatSecondsToHM(totalSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <span className="text-[11px] text-slate-400 block">Daily Average</span>
            <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
              {formatSecondsToHM(avgDailySeconds)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <span className="text-[11px] text-slate-400 block">Total Sessions</span>
            <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
              {sessionCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E293B]">
            <span className="text-[11px] text-slate-400 block">Avg Session</span>
            <span className="text-sm font-bold font-mono text-slate-100 mt-1 block">
              {formatSecondsToHM(avgSessionSeconds)}
            </span>
          </div>
        </div>

        {/* Category & Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span>Category:</span>
            <CategoryBadge category={app.category} />
          </div>
          <span className="font-mono text-slate-500">ID: {app.id}</span>
        </div>
      </div>
    </Modal>
  );
};
