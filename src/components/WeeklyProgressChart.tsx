// /app/dashboard/components/WeeklyProgressChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "M", sport: 40, study: 30 },
  { day: "T", sport: 60, study: 20 },
  { day: "W", sport: 50, study: 45 },
  { day: "T", sport: 70, study: 60 },
  { day: "F", sport: 60, study: 55 },
  { day: "S", sport: 90, study: 80 },
  { day: "S", sport: 30, study: 20 },
];

export default function WeeklyProgressChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="sport" stroke="#000" strokeWidth={2} />
          <Line type="monotone" dataKey="study" stroke="#999" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
