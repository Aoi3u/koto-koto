'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_THEME } from '@/config/theme';
import type { HistoryChartPoint } from '../types';

export default function HistoryTrendChart({ data }: { data: HistoryChartPoint[] }) {
  const chartColors = CHART_THEME;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.3em] text-subtle-gray">Trend</div>
        <div className="text-[12px] text-subtle-gray">{data.length} sessions</div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 10 }}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke={chartColors.axis} tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              stroke={chartColors.axis}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={chartColors.axisSecondary}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip.background,
                border: `1px solid ${chartColors.tooltip.border}`,
                borderRadius: '8px',
                fontSize: '14px',
              }}
              labelStyle={{ color: chartColors.tooltip.label }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              stroke={chartColors.lines.wpm}
              strokeWidth={2.5}
              dot={false}
              strokeDasharray="6 4"
              name="WPM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke={chartColors.lines.accuracy}
              strokeWidth={2.5}
              dot={false}
              strokeDasharray="6 4"
              name="Accuracy"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="zenScore"
              stroke={chartColors.lines.zen}
              strokeWidth={2.5}
              dot={false}
              name="Zen Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
