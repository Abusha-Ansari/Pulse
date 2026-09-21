import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { UsageRecord, ActiveSession } from '../../types/tracker';
import { formatClockTime, formatSecondsToHM } from '../../utils/timeFormatters';
import { AppIcon } from '../ui/AppIcon';
import { ProductivityBadge, CategoryBadge } from '../ui/Badge';
import { Clock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  records: UsageRecord[];
  activeSession: ActiveSession | null;
  limit?: number;
  onSelectApp?: (appId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  activeSession,
  limit = 6,
  onSelectApp,
}) => {
  // Take the most recent completed sessions
  const recentRecords = records.slice(0, limit);

  return (
    <Card>
      <CardHeader
        title="Real-Time Activity Feed"
        subtitle="Chronological stream of active and completed application blocks"
        action={
          <Link
            to="/timeline"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Full Timeline →
          </Link>
        }
      />

      <div className="space-y-2.5 mt-2">
        {/* Currently active session at top */}
        {activeSession && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="flex items-center gap-3 pl-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${activeSession.color}25`,
                  color: activeSession.color,
                }}
              >
                <AppIcon name={activeSession.iconName} className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100">
                    {activeSession.applicationName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <PlayCircle className="w-2.5 h-2.5 animate-spin" />
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400">
                    Started at {formatClockTime(activeSession.startedAt)}
                  </span>
                  {!activeSession.isIdle && (
                    <CategoryBadge category={activeSession.category} size="sm" />
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-emerald-400">
                {formatSecondsToHM(activeSession.durationSeconds)}
              </span>
              <div className="mt-0.5">
                <ProductivityBadge type={activeSession.productivityType} size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* Previous completed sessions */}
        {recentRecords.map((record) => {
          return (
            <div
              key={record.id}
              onClick={() => onSelectApp && onSelectApp(record.appId)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <AppIcon name={record.applicationName} className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200">
                      {record.applicationName}
                    </span>
                    <CategoryBadge category={record.category} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatClockTime(record.startTime)} - {formatClockTime(record.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-slate-200 block">
                  {formatSecondsToHM(record.durationSeconds)}
                </span>
                <div className="mt-0.5">
                  <ProductivityBadge type={record.productivityType} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
