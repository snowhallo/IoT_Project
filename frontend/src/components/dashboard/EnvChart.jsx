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
      title="Biểu đồ thông số cảm biến"
      className="p-3.5 md:p-4"
      headerClassName="pb-1.5 mb-2"
    >
      <div className="w-full h-48 md:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 15, left: -10, bottom: 0 }}
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

            {/* Trục Y Phải: Ánh sáng (Lux) - Co giãn linh hoạt theo giá trị vật lý thực tế */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, (dataMax) => (dataMax ? Math.max(Math.ceil(dataMax / 500) * 500, 1500) : 1500)]}
              stroke="#94a3b8"
              tick={{ fill: '#d97706', fontSize: 11 }}
              tickFormatter={(v) => `${v} lx`}
            />

            <Tooltip
              formatter={(value, name) => {
                if (name.includes('Nhiệt độ')) return [`${value} °C`, name];
                if (name.includes('Độ ẩm')) return [`${value} %`, name];
                if (name.includes('Ánh sáng')) return [`${value} Lux`, name];
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              content={() => (
                <div className="flex items-center justify-end gap-4 text-xs pb-2.5 select-none">
                  <div className="flex items-center gap-1.5 text-[#ea580c] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] inline-block shrink-0" />
                    <span>Nhiệt độ (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#d97706] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block shrink-0" />
                    <span>Ánh sáng (Lux)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0891b2] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block shrink-0" />
                    <span>Độ ẩm (%)</span>
                  </div>
                </div>
              )}
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
