'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface VelocityDataPoint {
  day: string;
  completed: number;
  created: number;
}

interface VelocityChartProps {
  data?: VelocityDataPoint[];
}

const defaultData: VelocityDataPoint[] = [
  { day: 'Mon', created: 4, completed: 2 },
  { day: 'Tue', created: 6, completed: 5 },
  { day: 'Wed', created: 3, completed: 4 },
  { day: 'Thu', created: 8, completed: 7 },
  { day: 'Fri', created: 5, completed: 9 },
  { day: 'Sat', created: 2, completed: 3 },
  { day: 'Sun', created: 4, completed: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#131B2E]/95 border border-violet-500/30 backdrop-blur-md p-3 rounded-lg shadow-2xl space-y-1 text-xs">
        <p className="font-semibold text-gray-200">{label}</p>
        <p className="text-violet-400">
          Completed Tasks: <span className="font-bold text-white">{payload[0].value}</span>
        </p>
        <p className="text-cyan-400">
          Created Tasks: <span className="font-bold text-white">{payload[1]?.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function VelocityChart({ data = defaultData }: VelocityChartProps) {
  return (
    <div className="bg-[#131B2E]/80 border border-violet-900/30 backdrop-blur-md p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Completion Velocity</span>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Task completion throughput over the past 7 days</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-gray-400">Created</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="completed"
              stroke="#A855F7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#completedGradient)"
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#createdGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}