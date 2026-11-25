import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card from '../common/Card';

/**
 * Biểu đồ đường vùng real-time cho 1 loại cảm biến riêng biệt.
 */
export default function SingleSensorChart({
  title,
  unit,
  dataKey,
  color = '#ea580c',
  gradientId = 'sensorGrad',
  chartData = [],
  domain = [0, 'auto'],
  latestValue = null,
}) {
  return (
    <Card
      title={title}
      className="p-3.5 md:p-4"
      headerClassName="pb-1.5 mb-2"
      action={
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: color }}
          />
          <span>
            {latestValue !== null && latestValue !== undefined
              ? `${Number(latestValue).toLocaleString()} ${unit}`
              : `-- ${unit}`}
          </span>
        </div>
      }
    >
      <div className="w-full h-40 md:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 6, right: 12, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.32} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 10 }}
              minTickGap={16}
            />

            <YAxis
              domain={domain}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: color }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

