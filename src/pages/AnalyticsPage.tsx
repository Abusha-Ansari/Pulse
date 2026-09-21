import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  getDailyScreenTimeTrend,
  getCategoryBreakdown,
  getHourlyHeatmap,
} from '../utils/analyticsCalculators';
import { getDateString, formatSecondsToHM } from '../utils/timeFormatters';
import { CATEGORY_COLORS } from '../data/defaultApps';
import { Card, CardHeader } from '../components/ui/Card';
import { CategoryPieChart } from '../components/widgets/CategoryPieChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { records, activeSession, userPreferences } = useTracker();
  const [daysCount, setDaysCount] = useState<7 | 14>(14);

  const todayStr = getDateString(new Date());

  // Analytics data
  const trendData = getDailyScreenTimeTrend(records, activeSession, daysCount);
  const categoryBreakdown = getCategoryBreakdown(
    records,
    activeSession,
    undefined,
    CATEGORY_COLORS
  );
  const hourlyData = getHourlyHeatmap(
    records,
    activeSession,
    todayStr,
    userPreferences.timeFormat === '24h'
  );

  // Compute key period metrics
  const totalPeriodHours = trendData.reduce((sum, d) => sum + d.totalHours, 0);
  const avgDailyHours = (totalPeriodHours / daysCount).toFixed(1);
  const avgScore = Math.round(
    trendData.reduce((sum, d) => sum + d.score, 0) / (trendData.length || 1)
  );

  // Find peak hour
  const peakHourItem = [...hourlyData].sort((a, b) => b.totalSeconds - a.totalSeconds)[0];

  return (
    <div className="space-y-6">
      {/* Page Header with Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics & Insights</h1>
          <p className="text-xs text-slate-400 mt-1">
            Long-term productivity trends, cognitive focus patterns, and software categorization.
          </p>
        </div>

        {/* 7 vs 14 Days Switcher */}
        <div className="flex items-center gap-1 bg-[#161D2B] border border-[#1E293B] p-1 rounded-xl">
          <button
            onClick={() => setDaysCount(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              daysCount === 7
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDaysCount(14)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              daysCount === 14
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 14 Days
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Period Total</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {totalPeriodHours.toFixed(1)} hrs
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {daysCount} recorded days</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Average</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {avgDailyHours} hrs/day
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Consistent work rhythm</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mean Productivity</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-purple-400">{avgScore}%</span>
            <p className="text-[11px] text-slate-400 mt-0.5">High ratio of focus vs distraction</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Peak Work Hour</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {peakHourItem?.label || '11 AM'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Highest concentration window</p>
          </div>
        </Card>
      </div>

      {/* Chart 1: Daily Screen Time Bar Chart */}
      <Card>
        <CardHeader
          title={`Daily Screen Time Breakdown (${daysCount} Days)`}
          subtitle="Hours per day stacked by Productive, Neutral, and Distracting apps"
        />

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                unit="h"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0B0F17] border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <span className="font-bold text-slate-200 block mb-1">{label}</span>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 font-mono">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-slate-100">{entry.value}h</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="productiveHours" name="Productive" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutralHours" name="Neutral" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="distractingHours" name="Distracting" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Section: Productivity Trend Area Chart & Category Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend Area Chart */}
        <Card>
          <CardHeader
            title="Focus vs. Distraction Trajectory"
            subtitle="Relative volume comparison over recent working sessions"
          />

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <span className="font-bold text-slate-200">{label}</span>
                          <div className="text-emerald-400 font-mono">
                            Focus: {payload[0]?.value}h
                          </div>
                          <div className="text-rose-400 font-mono">
                            Distracting: {payload[1]?.value}h
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="productiveHours"
                  name="Focus Time"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProd)"
                />
                <Area
                  type="monotone"
                  dataKey="distractingHours"
                  name="Distracting Time"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDist)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <CategoryPieChart
          categories={categoryBreakdown}
          title="Overall Software Category Share"
          subtitle="Proportional usage aggregated across all historical records"
        />
      </div>

      {/* Hourly Peak Activity Heatmap Breakdown */}
      <Card>
        <CardHeader
          title="Peak Working Hours Heatmap (24h Activity Distribution)"
          subtitle="Aggregated time spent active during each hour of the day"
        />

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData.map((h) => ({
                label: h.label,
                minutes: Math.round(h.totalSeconds / 60),
                productiveMinutes: Math.round(h.productiveSeconds / 60),
                distractingMinutes: Math.round(h.distractingSeconds / 60),
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} interval={2} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="m" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                        <span className="font-bold text-slate-200">{label}</span>
                        <div className="text-indigo-400 font-mono">
                          Active: {payload[0]?.value} mins
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="minutes" name="Active Minutes" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
