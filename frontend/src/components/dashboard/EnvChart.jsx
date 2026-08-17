import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Card from '../common/Card';

export default function EnvChart({ chartData = [] }) {
  return (
    <Card
      title="Biểu Đồ Môi Trường Thời Gian Thực"
    >
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
          >
            {/* 1. Định nghĩa bộ lọc chuyển màu Linear Gradients */}
            <defs>
              {/* Gradient Nhiệt độ (Cam) */}
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient Độ ẩm (Cyan) */}
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient Ánh sáng (Vàng) */}
              <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 11 }}
            />

            {/* Trục Y Trái: 0 - 100 (°C và %) */}
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
            />

            {/* Trục Y Phải: 0 - 1000 (Lux) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 1000]}
              stroke="#94a3b8"
              tick={{ fill: '#d97706', fontSize: 11 }}
              tickFormatter={(v) => `${v} lx`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}
            />

            {/* Legend tích hợp của Recharts */}
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />

            {/* 1. Vùng Nhiệt độ (Trục trái 0-100) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Nhiệt độ (°C)"
              stroke="#ea580c"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTemp)"
              dot={false}
              activeDot={{ r: 4, fill: '#ea580c' }}
              isAnimationActive={false}
            />

            {/* 2. Vùng Độ ẩm (Trục trái 0-100) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              name="Độ ẩm (%)"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHum)"
              dot={false}
              activeDot={{ r: 4, fill: '#06b6d4' }}
              isAnimationActive={false}
            />

            {/* 3. Vùng Ánh sáng (Trục phải 0-1000) */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="light"
              name="Ánh sáng (Lux)"
              stroke="#eab308"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLight)"
              dot={false}
              activeDot={{ r: 4, fill: '#eab308' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
