import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { CategorySummary } from '../../utils/analyticsCalculators';
import { formatSecondsToHM } from '../../utils/timeFormatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryPieChartProps {
  categories: CategorySummary[];
  title?: string;
  subtitle?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  title = 'Category Breakdown',
  subtitle = 'Time distribution across functional domains',
}) => {
  const chartData = categories.map((cat) => ({
    name: cat.category,
    value: cat.totalSeconds,
    percentage: cat.percentage,
    color: cat.color,
  }));

  const totalTime = categories.reduce((sum, c) => sum + c.totalSeconds, 0);

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Recharts Donut */}
        <div className="w-full md:w-56 h-56 relative flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-semibold text-slate-100">{data.name}</span>
                        </div>
                        <p className="text-slate-400 font-mono">
                          {formatSecondsToHM(data.value)} ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered label inside donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-500 font-medium">Total</span>
            <span className="text-sm font-bold font-mono text-slate-100">
              {formatSecondsToHM(totalTime)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2 flex-1">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-300 font-medium">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono">
                  {formatSecondsToHM(cat.totalSeconds)}
                </span>
                <span className="font-mono text-slate-500 w-8 text-right font-medium">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
