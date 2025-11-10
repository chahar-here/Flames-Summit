"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { LoaderOne } from "@/components/ui/loader";

export default function ContactDashboard() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContacts(contactData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteDoc(doc(db, "contacts", id));
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Contact Messages</h1>
      {loading ? (
        <LoaderOne/>
      ) : contacts.length === 0 ? (
        <p className="text-neutral-500">No messages found.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300">Message</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-black">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200">{contact.fullName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{contact.email}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300 max-w-sm truncate">{contact.message}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{contact.createdAt?.toDate().toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(contact.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
