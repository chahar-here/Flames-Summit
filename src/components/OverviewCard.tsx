// /app/dashboard/components/OverviewCard.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OverviewCard() {
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, "projects"));
      const projects = snapshot.docs.map((doc) => doc.data());
      setStats({
        total: projects.length,
        inProgress: projects.filter((p) => p.status === "in-progress").length,
        completed: projects.filter((p) => p.status === "completed").length,
      });
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Overall Information</h3>
      <p className="text-sm text-gray-500 mb-4">Project stats overview</p>

      <div className="flex justify-between text-center">
        <div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-sm">Total Projects</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
          <p className="text-gray-500 text-sm">In Progress</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-gray-500 text-sm">Completed</p>
        </div>
      </div>
    </div>
  );
}
