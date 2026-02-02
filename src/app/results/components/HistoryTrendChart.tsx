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
import { useSeasonalTheme } from '@/contexts/SeasonalContext';
import { THEME } from '@/config/theme';
import { getSeasonalChartColors } from '@/config/seasons';
import type { HistoryChartPoint } from '../types';

export default function HistoryTrendChart({
  data,
  accentColor,
}: {
  data: HistoryChartPoint[];
  accentColor: string;
}) {
  const { adjustedColors } = useSeasonalTheme();
  const chartColors = getSeasonalChartColors();

  return (
    <div
      className="bg-white/5 border rounded-xl p-6 mb-6"
      style={{ borderColor: THEME.colors.zenDark }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-sm uppercase tracking-[0.2em] text-subtle-gray font-zen-old-mincho">
            Progression
          </h3>
          <p className="text-xs text-subtle-gray/60 mt-1">Daily trend of your performance</p>
        </div>
        <div className="text-xs text-subtle-gray font-mono bg-white/5 px-2 py-1 rounded">
          {data.length} sessions
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={THEME.charts.grid} vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              stroke={THEME.charts.axis}
              tick={{ fontSize: 10, fill: THEME.charts.axisText }}
              tickLine={false}
              axisLine={{ stroke: THEME.charts.axis }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              stroke={THEME.charts.axis}
              tick={{ fontSize: 10, fill: THEME.charts.axisText }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={THEME.charts.axis}
              tick={{ fontSize: 10, fill: THEME.charts.axisText }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: THEME.charts.tooltip.bg,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${THEME.charts.tooltip.border}`,
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ padding: 0 }}
              labelStyle={{
                color: adjustedColors.primary,
                marginBottom: '0.5rem',
                fontFamily: 'monospace',
              }}
              cursor={{ stroke: THEME.charts.axis, strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontSize: '11px', opacity: 0.9 }}
              iconType="circle"
              iconSize={8}
            />
            {/* Zen Score - The main metric */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="zenScore"
              stroke={chartColors.zenScore}
              strokeWidth={3}
              activeDot={{ r: 6, fill: chartColors.zenScore, stroke: '#fff', strokeWidth: 2 }}
              dot={false}
              name="Zen Score"
              animationDuration={1500}
            />
            {/* WPM - Secondary */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              stroke={chartColors.wpm}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="WPM"
              role="img"
              opacity={0.85}
              animationDuration={1500}
            />
            {/* Accuracy - Accent */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke={chartColors.accuracy}
              strokeWidth={1.5}
              dot={false}
              name="Accuracy"
              opacity={0.75}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
