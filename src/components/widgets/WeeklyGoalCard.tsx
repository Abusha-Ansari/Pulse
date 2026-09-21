import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  getWeeklyProductiveGoalProgress,
  WeeklyGoalProgress,
} from '../../utils/analyticsCalculators';
import { formatSecondsToHM } from '../../utils/timeFormatters';
import { Card } from '../ui/Card';
import {
  Target,
  Clock,
  TrendingUp,
  Sparkles,
  Sliders,
  CheckCircle2,
  Calendar,
  Zap,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface WeeklyGoalCardProps {
  className?: string;
}

export const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({ className = '' }) => {
  const {
    records,
    activeSession,
    userPreferences,
    updateUserPreferences,
  } = useTracker();

  const [mode, setMode] = useState<'calendar' | 'rolling'>('calendar');
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const targetHours = userPreferences.weeklyProductiveGoalHours || 30;
  const progress: WeeklyGoalProgress = getWeeklyProductiveGoalProgress(
    records,
    activeSession,
    targetHours,
    mode
  );

  const isLiveProductive =
    activeSession &&
    !activeSession.isIdle &&
    activeSession.productivityType === 'Productive';

  const quickTargets = [20, 25, 30, 35, 40, 45];

  return (
    <div
      id="weekly-goal-metrics-card"
      className={`rounded-2xl bg-[#161D2B] border border-[#1E293B] p-5 shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-emerald-500/5 via-teal-500/5 to-transparent pointer-events-none" />

      {/* Header Row: Title, Target Badge, Mode Toggle, Edit Target */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div
            id="weekly-goal-icon-badge"
            className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"
          >
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Weekly Productive Goal
              </h2>
              <span
                id="weekly-goal-target-badge"
                className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"
              >
                Target: {targetHours}h Focus
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{progress.weekRangeLabel}</span>
            </p>
          </div>
        </div>

        {/* Controls: Mode Switcher & Quick Edit */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Calendar vs Rolling Mode Toggle */}
          <div
            id="weekly-goal-mode-toggle"
            className="flex items-center bg-[#0F1420] border border-[#1E293B] p-0.5 rounded-lg text-xs"
          >
            <button
              id="weekly-goal-mode-calendar"
              onClick={() => setMode('calendar')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                mode === 'calendar'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Week
            </button>
            <button
              id="weekly-goal-mode-rolling"
              onClick={() => setMode('rolling')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                mode === 'rolling'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rolling 7D
            </button>
          </div>

          {/* Quick Edit Target Button */}
          <button
            id="weekly-goal-edit-target-btn"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isEditingTarget
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#0F1420] text-slate-400 hover:text-slate-200 border-[#1E293B]'
            }`}
            title="Adjust Weekly Target"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Editor Drawer (collapsible) */}
      {isEditingTarget && (
        <div
          id="weekly-goal-target-editor"
          className="mt-3 p-3.5 rounded-xl bg-[#0F1420] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Weekly Target Hours:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {quickTargets.map((hrs) => (
              <button
                key={hrs}
                id={`target-preset-${hrs}`}
                onClick={() => {
                  updateUserPreferences({ weeklyProductiveGoalHours: hrs });
                  setIsEditingTarget(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  targetHours === hrs
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Metrics Highlight: Remaining Hours vs Target & Progress Percentage */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Metric 1: Remaining Hours (Primary Emphasis) */}
        <div
          id="weekly-goal-remaining-metric"
          className="p-3.5 rounded-xl bg-[#0F1420]/80 border border-[#1E293B] flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Remaining to Goal
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            {!progress.isGoalMet ? (
              <>
                <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {progress.remainingHours}h
                </span>
                <span className="text-xs text-slate-400">
                  remaining ({formatSecondsToHM(progress.remainingSeconds)})
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Target Met!
                </span>
                <span className="text-xs font-mono text-emerald-400/80">
                  +{progress.surplusHours}h surplus
                </span>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: Completed Productive Hours */}
        <div
          id="weekly-goal-achieved-metric"
          className="p-3.5 rounded-xl bg-[#0F1420]/80 border border-[#1E293B] flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Productive Time Logged
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {progress.currentProductiveHours}h
            </span>
            <span className="text-xs text-slate-400">
              of {targetHours}h weekly goal
            </span>
          </div>
        </div>

        {/* Metric 3: Weekly Goal Pace */}
        <div
          id="weekly-goal-pace-metric"
          className="p-3.5 rounded-xl bg-[#0F1420]/80 border border-[#1E293B] flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {progress.isGoalMet ? 'Weekly Status' : 'Pacing Needed'}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            {!progress.isGoalMet ? (
              <>
                <span className="text-2xl font-bold font-mono text-indigo-400 tracking-tight">
                  ~{progress.dailyPaceNeededHours}h
                </span>
                <span className="text-xs text-slate-400">
                  /day ({progress.daysRemainingInWeek} days left)
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  Streak Active
                </span>
                <span className="text-xs text-slate-400">Ahead of schedule</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Weekly Goal Progress Bar Visualizer */}
      <div className="mt-5 space-y-2">
        {/* Progress Bar Labels */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Weekly Progress</span>
            {isLiveProductive && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Productive Session
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              id="weekly-goal-percentage-label"
              className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
            >
              {progress.percentage}% completed
            </span>
            <span className="font-mono text-xs text-slate-400">
              ({progress.remainingHours}h left)
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Track */}
        <div
          id="weekly-goal-progress-bar-container"
          className="relative h-5 w-full bg-[#0B0F17] rounded-full p-1 border border-slate-800 overflow-hidden shadow-inner flex items-center"
        >
          {/* Milestone markers at 25%, 50%, 75% */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-2 z-10 opacity-30">
            <div className="h-full w-px bg-slate-600" style={{ left: '25%' }} />
            <div className="h-full w-px bg-slate-600" style={{ left: '50%' }} />
            <div className="h-full w-px bg-slate-600" style={{ left: '75%' }} />
          </div>

          {/* Filled Progress Bar */}
          <div
            id="weekly-goal-progress-bar-fill"
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-700 ease-out relative"
            style={{ width: `${Math.max(2, progress.percentage)}%` }}
          >
            {/* Live pulsating tip when productive */}
            {isLiveProductive && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full animate-ping" />
            )}
          </div>
        </div>

        {/* Milestone Tick Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-0.5">
          <span>0h (0%)</span>
          <span className="hidden sm:inline">{(targetHours * 0.25).toFixed(0)}h (25%)</span>
          <span>{(targetHours * 0.5).toFixed(0)}h (50%)</span>
          <span className="hidden sm:inline">{(targetHours * 0.75).toFixed(0)}h (75%)</span>
          <span className="text-emerald-400 font-bold">{targetHours}h (Goal)</span>
        </div>
      </div>

      {/* Days of the Week Mini-Bars Breakdown */}
      <div className="mt-5 pt-4 border-t border-[#1E293B]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Daily Focus Breakdown
          </span>
          <span className="text-[11px] text-slate-500">
            Daily avg so far: {progress.dailyAverageAchievedHours}h / day
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {progress.dayProgress.map((day) => {
            const maxDayExpected = 8;
            const dayHeightPercent = Math.min(
              100,
              Math.max(6, Math.round((day.productiveHours / maxDayExpected) * 100))
            );

            return (
              <div
                key={day.dateStr}
                id={`day-card-${day.dayLabel.toLowerCase()}`}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                  day.isToday
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : day.isFuture
                    ? 'bg-slate-900/30 border-slate-800/40 opacity-50'
                    : 'bg-[#0F1420] border-[#1E293B]'
                }`}
              >
                {/* Day Header */}
                <span
                  className={`text-[11px] font-semibold block ${
                    day.isToday ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {day.dayLabel}
                </span>

                {/* Day Mini Bar Column */}
                <div className="h-10 w-2.5 sm:w-3 bg-slate-800/80 rounded-full my-1.5 flex items-end p-0.5 overflow-hidden">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      day.isToday
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : day.productiveHours > 0
                        ? 'bg-emerald-500/70'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${dayHeightPercent}%` }}
                  />
                </div>

                {/* Hours Label */}
                <span className="font-mono text-[10px] text-slate-300 font-semibold block">
                  {day.isFuture ? '--' : `${day.productiveHours}h`}
                </span>

                {/* Today Indicator Pill */}
                {day.isToday && (
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter mt-0.5">
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
