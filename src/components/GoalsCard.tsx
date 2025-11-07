// /app/dashboard/components/GoalsCard.tsx
"use client";
import { CheckSquare } from "lucide-react";

export default function GoalsCard() {
  const goals = [
    { text: "Read 2 books", done: true },
    { text: "Sports every day", done: false },
    { text: "Complete the course", done: false },
    { text: "Learn a new skill", done: false },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Month Goals</h3>
        <CheckSquare className="w-5 h-5 text-gray-500" />
      </div>

      <ul className="space-y-3">
        {goals.map((goal, idx) => (
          <li key={idx} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={goal.done}
              readOnly
              className="w-4 h-4 rounded accent-black"
            />
            <span className={goal.done ? "line-through text-gray-400" : "text-gray-700"}>
              {goal.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
