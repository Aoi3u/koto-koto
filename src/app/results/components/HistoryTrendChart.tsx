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
import type { HistoryChartPoint } from '../types';

export default function HistoryTrendChart({
  data,
  accentColor,
}: {
  data: HistoryChartPoint[];
  accentColor: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.3em] text-subtle-gray">Trend</div>
        <div className="text-[10px] text-subtle-gray">{data.length} sessions</div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              stroke="rgba(255,255,255,0.35)"
              tick={{ fontSize: 10 }}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgba(255,255,255,0.35)"
              tick={{ fontSize: 10 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10,10,12,0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#cbd5f5' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              stroke={accentColor}
              strokeWidth={2}
              dot={false}
              name="WPM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={2}
              dot={false}
              name="Accuracy %"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="zenScore"
              stroke="rgba(255,212,102,0.8)"
              strokeWidth={1.5}
              dot={false}
              name="Zen Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
