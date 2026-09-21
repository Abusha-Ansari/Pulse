import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { AppUsageSummary } from '../../utils/analyticsCalculators';
import { formatSecondsToHM } from '../../utils/timeFormatters';
import { AppIcon } from '../ui/AppIcon';
import { ProductivityBadge } from '../ui/Badge';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopAppsWidgetProps {
  topApps: AppUsageSummary[];
  onSelectApp?: (appId: string) => void;
}

export const TopAppsWidget: React.FC<TopAppsWidgetProps> = ({ topApps, onSelectApp }) => {
  return (
    <Card>
      <CardHeader
        title="Top Applications Today"
        subtitle="Ranked by cumulative active screen duration"
        action={
          <Link
            to="/applications"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        }
      />

      <div className="space-y-4 mt-2">
        {topApps.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No activity recorded for today yet.</p>
        ) : (
          topApps.map((app, index) => {
            return (
              <div
                key={app.appId}
                onClick={() => onSelectApp && onSelectApp(app.appId)}
                className="group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-500 w-3">{index + 1}</span>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${app.color}20`, color: app.color }}
                    >
                      <AppIcon name={app.iconName} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                      {app.name}
                    </span>
                    <ProductivityBadge type={app.productivityType} size="sm" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {app.sessionCount} {app.sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
                    <span className="font-mono font-semibold text-slate-100">
                      {formatSecondsToHM(app.totalSeconds)}
                    </span>
                    <span className="font-mono text-slate-500 w-8 text-right">
                      {app.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(4, app.percentage))}%`,
                      backgroundColor: app.color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
