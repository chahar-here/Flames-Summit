// /app/dashboard/components/MonthProgressChart.tsx
"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function MonthProgressChart() {
  const percentage = 120; // e.g. +20% growth

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
      <h3 className="text-lg font-semibold mb-2">Month Progress</h3>
      <p className="text-sm text-gray-500 mb-4">+20% compared to last month</p>

      <div className="w-24 mx-auto mb-3">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: "#000",
            pathColor: "#000",
            trailColor: "#eee",
          })}
        />
      </div>

      <button className="text-sm border border-gray-200 rounded-xl px-3 py-1 hover:bg-gray-50">
        Download Report
      </button>
    </div>
  );
}
