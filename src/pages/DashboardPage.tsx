import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  calculateDayMetrics,
  getTopApplications,
  getCategoryBreakdown,
} from '../utils/analyticsCalculators';
import { getDateString, formatSecondsToHMS } from '../utils/timeFormatters';
import { MetricCardsGrid } from '../components/widgets/MetricCard';
import { WeeklyGoalCard } from '../components/widgets/WeeklyGoalCard';
import { TopAppsWidget } from '../components/widgets/TopAppsWidget';
import { ActivityFeed } from '../components/widgets/ActivityFeed';
import { TimelineBar } from '../components/widgets/TimelineBar';
import { CategoryPieChart } from '../components/widgets/CategoryPieChart';
import { AppDetailModal } from '../components/widgets/AppDetailModal';
import { CATEGORY_COLORS } from '../data/defaultApps';
import { AppIcon } from '../components/ui/AppIcon';
import { CategoryBadge, ProductivityBadge } from '../components/ui/Badge';
import { Sparkles, Activity, Play, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { records, activeSession, simulationSettings } = useTracker();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const today = new Date();
  const todayStr = getDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  // Aggregated live calculations
  const metrics = calculateDayMetrics(records, activeSession, todayStr, yesterdayStr);
  const topApps = getTopApplications(records, activeSession, todayStr, 5);
  const categoryBreakdown = getCategoryBreakdown(
    records,
    activeSession,
    todayStr,
    CATEGORY_COLORS
  );

  return (
    <div className="space-y-6">
      {/* Live Status Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161D2B] via-[#1A2338] to-[#161D2B] border border-[#1E293B] p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Live Activity Simulation Active
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Speed: {simulationSettings.speed}x
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Today's Focus Pulse</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time workspace telemetry capturing focus depth, application shifts, and energy cadence.
            </p>
          </div>

          {/* Active Application Quick Highlight Pill */}
          <div
            onClick={() => setSelectedAppId(activeSession.appId)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer shadow-inner"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
              style={{ backgroundColor: `${activeSession.color}20`, color: activeSession.color }}
            >
              <AppIcon name={activeSession.iconName} className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current App:</span>
                <span className="text-sm font-bold text-white">
                  {activeSession.applicationName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  {formatSecondsToHMS(activeSession.durationSeconds)}
                </span>
                <ProductivityBadge type={activeSession.productivityType} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4x Metric Cards */}
      <MetricCardsGrid metrics={metrics} />

      {/* Weekly Goal Progress Bar Card */}
      <WeeklyGoalCard />

      {/* 24-Hour Visual Session Gantt */}
      <TimelineBar
        records={records}
        activeSession={activeSession}
        selectedDate={todayStr}
        onSelectApp={(id) => setSelectedAppId(id)}
      />

      {/* Two Column Grid: Top Apps & Real-Time Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopAppsWidget
          topApps={topApps}
          onSelectApp={(id) => setSelectedAppId(id)}
        />

        <ActivityFeed
          records={records}
          activeSession={activeSession}
          limit={6}
          onSelectApp={(id) => setSelectedAppId(id)}
        />
      </div>

      {/* Category Breakdown & Insights Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryPieChart
            categories={categoryBreakdown}
            title="Today's Category Allocation"
            subtitle="Real-time distribution across functional software domains"
          />
        </div>

        {/* Quick Insights Card */}
        <div className="rounded-2xl bg-[#161D2B]/90 border border-[#1E293B] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Smart Workspace Insights</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {metrics.productivityScore >= 80
                ? 'High Velocity Flow State'
                : 'Balanced Multi-tasking'}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {metrics.productivityScore >= 80
                ? `You have spent ${Math.round((metrics.focusTimeSeconds / Math.max(1, metrics.totalScreenTimeSeconds)) * 100)}% of your screen time in core productive engineering & design tools today.`
                : 'Frequent context switches between communication channels and development tools detected.'}
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Total Tracked Today</span>
                <span className="font-mono font-semibold text-slate-200">
                  {Math.round(metrics.totalScreenTimeSeconds / 60)} minutes
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Recorded Sessions</span>
                <span className="font-mono font-semibold text-slate-200">
                  {metrics.totalSessionsCount} switches
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1E293B]">
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
            >
              <span>Explore 14-Day Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* App Detail Modal */}
      <AppDetailModal
        appId={selectedAppId}
        onClose={() => setSelectedAppId(null)}
      />
    </div>
  );
};
