// /app/dashboard/components/ProjectList.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      const snapshot = await getDocs(collection(db, "projects"));
      setProjects(snapshot.docs.map((doc) => doc.data()));
    }
    fetchProjects();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Last Projects</h3>

      <div className="grid grid-cols-3 gap-4">
        {projects.slice(0, 3).map((p, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border ${
              p.status === "completed" ? "bg-black text-white" : "bg-gray-50"
            }`}
          >
            <p className="font-semibold">{p.title}</p>
            <p className="text-sm opacity-70">{p.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
