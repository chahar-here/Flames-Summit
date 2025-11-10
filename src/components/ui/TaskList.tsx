// /app/dashboard/components/TaskList.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const snapshot = await getDocs(collection(db, "tasks"));
      setTasks(snapshot.docs.map((doc) => doc.data()));
    }
    fetchTasks();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tasks In Progress</h3>
        <button className="text-sm text-black font-medium border border-gray-200 px-3 py-1 rounded-xl hover:bg-gray-50">
          + Add Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tasks.map((task, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="font-medium text-gray-800">{task.title}</p>
            <p className="text-sm text-gray-500">{task.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
