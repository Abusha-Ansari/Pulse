import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Category, ProductivityType, Application } from '../types/tracker';
import { AppIcon } from '../components/ui/AppIcon';
import { ProductivityBadge, CategoryBadge } from '../components/ui/Badge';
import { formatSecondsToHM } from '../utils/timeFormatters';
import { AppDetailModal } from '../components/widgets/AppDetailModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const {
    applications,
    records,
    activeSession,
    updateAppClassification,
    switchActiveApp,
  } = useTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProductivity, setSelectedProductivity] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [detailAppId, setDetailAppId] = useState<string | null>(null);

  // Categories list
  const categories: Array<Category | 'All'> = [
    'All',
    'Development',
    'Design',
    'Communication',
    'Productivity',
    'Entertainment',
  ];

  // Productivity classification filter
  const productivityTypes: Array<ProductivityType | 'All'> = [
    'All',
    'Productive',
    'Neutral',
    'Distracting',
  ];

  // Compute metrics per app
  const appStats = applications.map((app) => {
    const appRecords = records.filter((r) => r.appId === app.id);
    let totalSecs = appRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

    const isCurrentActive = activeSession.appId === app.id && !activeSession.isIdle;
    if (isCurrentActive) {
      totalSecs += activeSession.durationSeconds;
    }

    const sessionCount = appRecords.length + (isCurrentActive ? 1 : 0);
    const uniqueDays = new Set(appRecords.map((r) => r.date)).size || 1;
    const dailyAvgSecs = Math.round(totalSecs / uniqueDays);

    return {
      app,
      totalSecs,
      sessionCount,
      dailyAvgSecs,
      isCurrentActive,
    };
  });

  // Filter apps
  const filteredApps = appStats.filter(({ app }) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesProductivity =
      selectedProductivity === 'All' || app.productivityType === selectedProductivity;

    return matchesSearch && matchesCategory && matchesProductivity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Applications Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage monitored apps, review usage metrics, and customize productivity categorization.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#161D2B] border border-[#1E293B] p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Category Filters, Productivity Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#161D2B] border border-[#1E293B] p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Productivity Filter */}
          <div className="flex items-center gap-1">
            {productivityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedProductivity(type)}
                className={`px-2.5 py-1.5 text-xs rounded-xl font-medium transition-all ${
                  selectedProductivity === type
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map(({ app, totalSecs, sessionCount, dailyAvgSecs, isCurrentActive }) => {
            return (
              <div
                key={app.id}
                className={`group relative rounded-2xl bg-[#161D2B] border transition-all duration-200 p-5 flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-md"
                        style={{ backgroundColor: `${app.color}20`, color: app.color }}
                      >
                        <AppIcon name={app.iconName} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => setDetailAppId(app.id)}
                            className="text-sm font-bold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {app.name}
                          </h3>
                          {isCurrentActive && (
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <CategoryBadge category={app.category} size="sm" className="mt-1" />
                      </div>
                    </div>

                    {/* Simulation Switch Trigger */}
                    {!isCurrentActive ? (
                      <button
                        onClick={() => switchActiveApp(app.id)}
                        title="Simulate Switch to this App"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-400 border border-slate-800 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {/* Metrics & Categorization Selector */}
                <div className="mt-5 pt-4 border-t border-[#1E293B] space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Total</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                        {formatSecondsToHM(totalSecs)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Daily Avg</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                        {formatSecondsToHM(dailyAvgSecs)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Sessions</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                        {sessionCount}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Classification Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Classification:</span>
                    <div className="flex items-center gap-1">
                      {(['Productive', 'Neutral', 'Distracting'] as ProductivityType[]).map((type) => {
                        const isSelected = app.productivityType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => updateAppClassification(app.id, type)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                              isSelected
                                ? type === 'Productive'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : type === 'Neutral'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-[#161D2B] border border-[#1E293B] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1420] text-slate-400 font-semibold border-b border-[#1E293B]">
                <tr>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Total Time</th>
                  <th className="py-3.5 px-4">Daily Average</th>
                  <th className="py-3.5 px-4">Sessions</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 text-slate-300">
                {filteredApps.map(({ app, totalSecs, sessionCount, dailyAvgSecs, isCurrentActive }) => {
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setDetailAppId(app.id)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${app.color}20`, color: app.color }}
                          >
                            <AppIcon name={app.iconName} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 flex items-center gap-2">
                              {app.name}
                              {isCurrentActive && (
                                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 block max-w-xs truncate">
                              {app.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={app.category} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">
                        {formatSecondsToHM(totalSecs)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formatSecondsToHM(dailyAvgSecs)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {sessionCount}
                      </td>
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {(['Productive', 'Neutral', 'Distracting'] as ProductivityType[]).map((type) => {
                            const isSelected = app.productivityType === type;
                            return (
                              <button
                                key={type}
                                onClick={() => updateAppClassification(app.id, type)}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                                  isSelected
                                    ? type === 'Productive'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : type === 'Neutral'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {!isCurrentActive ? (
                          <button
                            onClick={() => switchActiveApp(app.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Simulate</span>
                          </button>
                        ) : (
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* App Detail Modal */}
      <AppDetailModal
        appId={detailAppId}
        onClose={() => setDetailAppId(null)}
      />
    </div>
  );
};
