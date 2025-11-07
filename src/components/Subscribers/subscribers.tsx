"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: { seconds: number };
}

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSubscribers = async () => {
      const q = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
      const snapshot = await getDocs(q);
    //   const data = snapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...(doc.data() as Subscriber),
    //   }));
    const data = snapshot.docs.map((doc) => {
        const docData = doc.data() as Omit<Subscriber, "id">;
        return {
            id: doc.id,
            ...docData,
        };
    });
      setSubscribers(data);
    };

    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      await deleteDoc(doc(db, "subscribers", id));
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    }
  };

  const handleExport = () => {
    const csv = [
      ["Email", "Subscribed At"],
      ...subscribers.map((s) => [
        s.email,
        format(new Date(s.subscribedAt.seconds * 1000), "dd/MM/yyyy HH:mm"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscribers.csv";
    link.click();
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#E62B1E]">Subscribers</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by email"
            className="px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 text-white w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={handleExport}
            className="bg-[#E62B1E] hover:bg-[#c52217] text-white px-4 py-2 rounded-md font-semibold"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-700">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-neutral-800 text-white">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed At</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-neutral-950">
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-neutral-400">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="border-t border-neutral-800 hover:bg-neutral-900 transition"
                >
                  <td className="px-4 py-3">{subscriber.email}</td>
                  <td className="px-4 py-3">
                    {format(
                      new Date(subscriber.subscribedAt.seconds * 1000),
                      "dd MMM yyyy, hh:mm a"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
