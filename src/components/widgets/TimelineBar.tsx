import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { UsageRecord, ActiveSession } from '../../types/tracker';
import { formatClockTime, formatSecondsToHM, getDateString } from '../../utils/timeFormatters';
import { AppIcon } from '../ui/AppIcon';
import { ProductivityBadge, CategoryBadge } from '../ui/Badge';
import { Info } from 'lucide-react';

interface TimelineBarProps {
  records: UsageRecord[];
  activeSession: ActiveSession | null;
  selectedDate: string;
  onSelectApp?: (appId: string) => void;
}

interface HoveredBlock {
  appName: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  category: string;
  productivityType: 'Productive' | 'Neutral' | 'Distracting';
  color: string;
  leftPercent: number;
  isLive?: boolean;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  records,
  activeSession,
  selectedDate,
  onSelectApp,
}) => {
  const [hovered, setHovered] = useState<HoveredBlock | null>(null);

  // Filter records for this day
  const dayRecords = records.filter((r) => r.date === selectedDate);
  const isToday = selectedDate === getDateString(new Date());

  // Hours markings (every 3 hours)
  const hourMarkers = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  // Helper to convert date to minute of day (0 to 1440)
  const getMinuteOfDay = (isoString: string): number => {
    const d = new Date(isoString);
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  };

  return (
    <Card className="overflow-visible">
      <CardHeader
        title="24-Hour Visual Session Gantt"
        subtitle="Chronological distribution of focus sessions and application context"
        action={
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Productive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Neutral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Distracting
            </span>
          </div>
        }
      />

      {/* Interactive 24h Bar Container */}
      <div className="relative pt-6 pb-2">
        {/* Hover Tooltip */}
        {hovered && (
          <div
            className="absolute -top-14 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-75"
            style={{ left: `${Math.min(92, Math.max(8, hovered.leftPercent))}%` }}
          >
            <div className="bg-[#0B0F17] border border-slate-700/80 shadow-2xl rounded-xl px-3 py-1.5 text-xs flex items-center gap-2.5 whitespace-nowrap">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hovered.color }}
              />
              <span className="font-semibold text-slate-100">{hovered.appName}</span>
              <span className="text-slate-400 font-mono">
                {formatClockTime(hovered.startTime)} - {formatClockTime(hovered.endTime)}
              </span>
              <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {formatSecondsToHM(hovered.durationSeconds)}
              </span>
              {hovered.isLive && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
            {/* Tooltip arrow */}
            <div className="w-2 h-2 bg-[#0B0F17] border-b border-r border-slate-700 transform rotate-45 mx-auto -mt-1" />
          </div>
        )}

        {/* The Track Bar */}
        <div className="relative h-12 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center">
          {/* Hour grid lines */}
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-r border-slate-800/60 pointer-events-none"
              style={{ left: `${(h / 24) * 100}%` }}
            />
          ))}

          {/* Past sessions blocks */}
          {dayRecords.map((record) => {
            const startMin = Math.max(0, getMinuteOfDay(record.startTime));
            const endMin = Math.min(1440, getMinuteOfDay(record.endTime));
            const durationMin = Math.max(1.5, endMin - startMin);

            const leftPercent = (startMin / 1440) * 100;
            const widthPercent = Math.max(0.35, (durationMin / 1440) * 100);

            const color =
              record.productivityType === 'Productive'
                ? '#10B981'
                : record.productivityType === 'Neutral'
                ? '#F59E0B'
                : '#F43F5E';

            return (
              <div
                key={record.id}
                onClick={() => onSelectApp && onSelectApp(record.appId)}
                onMouseEnter={() =>
                  setHovered({
                    appName: record.applicationName,
                    startTime: record.startTime,
                    endTime: record.endTime,
                    durationSeconds: record.durationSeconds,
                    category: record.category,
                    productivityType: record.productivityType,
                    color,
                    leftPercent: leftPercent + widthPercent / 2,
                  })
                }
                onMouseLeave={() => setHovered(null)}
                className="absolute top-1.5 bottom-1.5 rounded-[4px] cursor-pointer hover:opacity-100 hover:scale-y-110 hover:z-20 transition-all opacity-85"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                }}
              />
            );
          })}

          {/* Active Live Session block if today */}
          {isToday && activeSession && (
            (() => {
              const startMin = Math.max(0, getMinuteOfDay(activeSession.startedAt));
              const nowMin = getMinuteOfDay(new Date().toISOString());
              const durationMin = Math.max(2, nowMin - startMin);
              const leftPercent = (startMin / 1440) * 100;
              const widthPercent = Math.max(0.5, (durationMin / 1440) * 100);

              const color = activeSession.isIdle
                ? '#94A3B8'
                : activeSession.productivityType === 'Productive'
                ? '#10B981'
                : activeSession.productivityType === 'Neutral'
                ? '#F59E0B'
                : '#F43F5E';

              return (
                <div
                  onClick={() => onSelectApp && onSelectApp(activeSession.appId)}
                  onMouseEnter={() =>
                    setHovered({
                      appName: activeSession.applicationName,
                      startTime: activeSession.startedAt,
                      endTime: new Date().toISOString(),
                      durationSeconds: activeSession.durationSeconds,
                      category: activeSession.category,
                      productivityType: activeSession.productivityType,
                      color,
                      leftPercent: leftPercent + widthPercent / 2,
                      isLive: true,
                    })
                  }
                  onMouseLeave={() => setHovered(null)}
                  className="absolute top-1 bottom-1 rounded-[4px] cursor-pointer ring-2 ring-emerald-400/60 animate-pulse z-10"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                  }}
                />
              );
            })()
          )}
        </div>

        {/* Hour Labels Below */}
        <div className="relative h-6 mt-1.5 text-[11px] font-mono text-slate-500">
          {hourMarkers.map((hour) => {
            const label =
              hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour === 24 ? '12 AM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
            return (
              <span
                key={hour}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
