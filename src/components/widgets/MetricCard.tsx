import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Clock, Target, Coffee, Zap } from 'lucide-react';
import { DayMetricOverview } from '../../types/tracker';
import { formatSecondsToHM } from '../../utils/timeFormatters';

interface MetricCardsGridProps {
  metrics: DayMetricOverview;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({ metrics }) => {
  const isPositiveTrend = metrics.yesterdayDiffPercent >= 0;

  // Productivity gauge stroke calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.productivityScore / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Screen Time */}
      <Card glow className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Screen Time</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {formatSecondsToHM(metrics.totalScreenTimeSeconds)}
            </h2>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {isPositiveTrend ? (
              <span className="flex items-center text-emerald-400 font-mono font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{Math.abs(metrics.yesterdayDiffPercent)}%
              </span>
            ) : (
              <span className="flex items-center text-rose-400 font-mono font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -{Math.abs(metrics.yesterdayDiffPercent)}%
              </span>
            )}
            <span className="text-slate-500">vs yesterday</span>
          </div>
          <span className="text-slate-400 font-mono">{metrics.totalSessionsCount} sessions</span>
        </div>
      </Card>

      {/* 2. Focus Time */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Focus Time</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {formatSecondsToHM(metrics.focusTimeSeconds)}
            </h2>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
          <span>Deep productive work</span>
          <span className="font-mono text-emerald-400">
            {metrics.totalScreenTimeSeconds > 0
              ? `${Math.round((metrics.focusTimeSeconds / metrics.totalScreenTimeSeconds) * 100)}%`
              : '0%'}
          </span>
        </div>
      </Card>

      {/* 3. Idle / Break Time */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Idle & Breaks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-amber-400">
              {formatSecondsToHM(metrics.idleTimeSeconds)}
            </h2>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
          <span>Away from keyboard</span>
          <span className="font-mono text-amber-400">
            {metrics.idleTimeSeconds > 0 ? 'Healthy cadence' : 'In work zone'}
          </span>
        </div>
      </Card>

      {/* 4. Productivity Score with Circular Gauge */}
      <Card className="flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Productivity Score</span>
            <div className="mt-3">
              <h2 className="text-2xl font-bold font-mono tracking-tight text-slate-100">
                {metrics.productivityScore}%
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {metrics.productivityScore >= 80
                  ? 'Highly Focused'
                  : metrics.productivityScore >= 60
                  ? 'Balanced Output'
                  : 'Needs Recovery'}
              </p>
            </div>
          </div>

          {/* SVG Circular Progress Gauge */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 68 68">
              <circle
                cx="34"
                cy="34"
                r={radius}
                className="text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="34"
                cy="34"
                r={radius}
                className={
                  metrics.productivityScore >= 75
                    ? 'text-emerald-400'
                    : metrics.productivityScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <Zap className="w-4 h-4 text-emerald-400 absolute" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
          <span>Target: 80%+</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {metrics.productivityScore >= 80 ? 'Achieved' : 'In Progress'}
          </span>
        </div>
      </Card>
    </div>
  );
};
