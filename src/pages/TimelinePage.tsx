import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { TimelineBar } from '../components/widgets/TimelineBar';
import { AppDetailModal } from '../components/widgets/AppDetailModal';
import {
  getDateString,
  getRelativeDateLabel,
  formatClockTime,
  formatSecondsToHM,
} from '../utils/timeFormatters';
import { AppIcon } from '../components/ui/AppIcon';
import { CategoryBadge, ProductivityBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { ProductivityType } from '../types/tracker';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  PlayCircle,
  ArrowUpDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { records, activeSession } = useTracker();

  const todayStr = getDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterType, setFilterType] = useState<ProductivityType | 'All'>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [detailAppId, setDetailAppId] = useState<string | null>(null);

  // Generate last 7 days for the date selector
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    return {
      dateStr,
      label: getRelativeDateLabel(dateStr),
    };
  });

  const isSelectedToday = selectedDate === todayStr;

  // Filter records for the selected date
  const dayRecords = records
    .filter((r) => r.date === selectedDate)
    .filter((r) => (filterType === 'All' ? true : r.productivityType === filterType))
    .filter((r) =>
      searchFilter
        ? r.applicationName.toLowerCase().includes(searchFilter.toLowerCase())
        : true
    );

  // Compute daily totals for the summary
  const totalDaySeconds = records
    .filter((r) => r.date === selectedDate)
    .reduce((sum, r) => sum + r.durationSeconds, 0) +
    (isSelectedToday && !activeSession.isIdle ? activeSession.durationSeconds : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Visual Timeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            24-hour chronological breakdown of application switches, focus blocks, and session logs.
          </p>
        </div>

        {/* Total Time Badge for Selected Date & Link to Scheduler */}
        <div className="flex items-center gap-2">
          <Link
            to="/scheduler"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Scheduling Lab</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161D2B] border border-[#1E293B]">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Total Tracked:</span>
            <span className="font-mono text-xs font-bold text-slate-100">
              {formatSecondsToHM(totalDaySeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Date Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {last7Days.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[#161D2B] border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.dateStr === todayStr && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive 24-Hour Gantt Timeline */}
      <TimelineBar
        records={records}
        activeSession={activeSession}
        selectedDate={selectedDate}
        onSelectApp={(id) => setDetailAppId(id)}
      />

      {/* Session Log List Card */}
      <Card>
        <CardHeader
          title={`Session Logs for ${getRelativeDateLabel(selectedDate)}`}
          subtitle={`${dayRecords.length + (isSelectedToday ? 1 : 0)} chronological work intervals recorded`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter sessions..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                />
              </div>

              {/* Productivity Type Filters */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {(['All', 'Productive', 'Neutral', 'Distracting'] as Array<ProductivityType | 'All'>).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2 py-0.5 text-[11px] rounded-md transition-all font-medium ${
                        filterType === type
                          ? 'bg-slate-700 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>
          }
        />

        {/* Sessions List */}
        <div className="space-y-2 mt-4">
          {/* Active Live Session at top if viewing today */}
          {isSelectedToday && (filterType === 'All' || filterType === activeSession.productivityType) && (
            <div
              onClick={() => setDetailAppId(activeSession.appId)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div className="flex items-center gap-3.5 pl-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                  style={{
                    backgroundColor: `${activeSession.color}25`,
                    color: activeSession.color,
                  }}
                >
                  <AppIcon name={activeSession.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">
                      {activeSession.applicationName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                      <PlayCircle className="w-3 h-3 animate-spin" />
                      LIVE ACTIVE SESSION
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      Started: {formatClockTime(activeSession.startedAt)}
                    </span>
                    {!activeSession.isIdle && (
                      <CategoryBadge category={activeSession.category} size="sm" />
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-bold text-emerald-400 block">
                  {formatSecondsToHM(activeSession.durationSeconds)}
                </span>
                <div className="mt-1">
                  <ProductivityBadge type={activeSession.productivityType} size="sm" />
                </div>
              </div>
            </div>
          )}

          {/* Past Sessions List */}
          {dayRecords.length === 0 && (!isSelectedToday || filterType !== 'All') ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No recorded sessions matching the selected filters.
            </div>
          ) : (
            dayRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setDetailAppId(record.appId)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <AppIcon name={record.applicationName} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs sm:text-sm">
                        {record.applicationName}
                      </span>
                      <CategoryBadge category={record.category} size="sm" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatClockTime(record.startTime)} - {formatClockTime(record.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-100 block">
                    {formatSecondsToHM(record.durationSeconds)}
                  </span>
                  <div className="mt-1">
                    <ProductivityBadge type={record.productivityType} size="sm" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* App Detail Modal */}
      <AppDetailModal
        appId={detailAppId}
        onClose={() => setDetailAppId(null)}
      />
    </div>
  );
};
