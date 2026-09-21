import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { formatSecondsToHMS } from '../../utils/timeFormatters';
import { AppIcon } from '../ui/AppIcon';
import { CategoryBadge, ProductivityBadge } from '../ui/Badge';
import { ChevronDown, Sparkles } from 'lucide-react';

interface LiveTrackerBadgeProps {
  onOpenSwitchMenu?: () => void;
  className?: string;
}

export const LiveTrackerBadge: React.FC<LiveTrackerBadgeProps> = ({
  onOpenSwitchMenu,
  className = '',
}) => {
  const { activeSession, simulationSettings } = useTracker();

  const isIdle = activeSession.isIdle;

  return (
    <div
      onClick={onOpenSwitchMenu}
      className={`group flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[#161D2B] border border-[#1E293B] hover:border-slate-700/80 transition-all cursor-pointer shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing indicator */}
        <div className="relative flex items-center justify-center">
          <span
            className={`w-3 h-3 rounded-full ${
              isIdle
                ? 'bg-amber-400'
                : activeSession.productivityType === 'Productive'
                ? 'bg-emerald-400'
                : activeSession.productivityType === 'Neutral'
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          {!simulationSettings.isPaused && (
            <span
              className={`absolute w-3 h-3 rounded-full animate-ping opacity-75 ${
                isIdle
                  ? 'bg-amber-400'
                  : activeSession.productivityType === 'Productive'
                  ? 'bg-emerald-400'
                  : activeSession.productivityType === 'Neutral'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
          )}
        </div>

        {/* App Icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/5"
          style={{ backgroundColor: `${activeSession.color}20`, color: activeSession.color }}
        >
          <AppIcon name={activeSession.iconName} className="w-4 h-4" />
        </div>

        {/* App Name and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Active:</span>
            <span className="text-xs font-semibold text-slate-100">
              {activeSession.applicationName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {formatSecondsToHMS(activeSession.durationSeconds)}
            </span>

            {!isIdle && <CategoryBadge category={activeSession.category} size="sm" />}
            {!isIdle && (
              <ProductivityBadge type={activeSession.productivityType} size="sm" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-slate-500 group-hover:text-slate-300 transition-colors">
        <span className="text-[11px] font-mono hidden md:inline">Switch</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
