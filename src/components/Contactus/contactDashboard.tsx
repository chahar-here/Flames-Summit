"use client";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { IconTrash, IconMail, IconUser, IconClock, IconFilter } from "@tabler/icons-react";

interface ContactMessage {
  resolved: boolean;
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: any;
}

export function ContactDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch messages from Firebase
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: ContactMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          ...doc.data()
        } as ContactMessage);
      });
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...messages];

    // Filter by resolved status
    if (statusFilter === "resolved") {
      filtered = filtered.filter(msg => msg.resolved === true);
    } else if (statusFilter === "unresolved") {
      filtered = filtered.filter(msg => msg.resolved !== true);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      
      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredMessages(filtered);
  }, [messages, statusFilter, sortOrder]);

  // Delete message
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "contacts", id));
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    } finally {
      setDeleting(null);
    }
  };

  // Format timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Resolve message (toggleable)
  const handleResolve = async (id: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, "contacts", id), { resolved: !currentState });

      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, resolved: !currentState } : msg
      ));
    } catch (error) {
      console.error("Error toggling resolved state:", error);
      alert("Failed to update message status");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unresolvedCount = messages.filter(msg => !msg.resolved).length;
  const resolvedCount = messages.filter(msg => msg.resolved).length;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#E62B1E]">
            Contact Messages
          </h1>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>
                Total: <span className="text-white font-semibold">{messages.length}</span>
              </span>
              <span>
                Unresolved: <span className="text-yellow-500 font-semibold">{unresolvedCount}</span>
              </span>
              <span>
                Resolved: <span className="text-green-500 font-semibold">{resolvedCount}</span>
              </span>
            </div>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconFilter size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#E62B1E] transition"
              >
                <option value="all">All Messages</option>
                <option value="unresolved">Unresolved Only</option>
                <option value="resolved">Resolved Only</option>
              </select>
            </div>

            {/* Date Sort */}
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Sort by Date</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#E62B1E] transition"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMessages.length === 0 && messages.length === 0 && (
          <div className="text-center py-20">
            <IconMail size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400">No messages yet</h3>
            <p className="text-gray-600 mt-2">Contact form submissions will appear here</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredMessages.length === 0 && messages.length > 0 && (
          <div className="text-center py-20">
            <IconFilter size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400">No messages match your filters</h3>
            <p className="text-gray-600 mt-2">Try adjusting your filter settings</p>
          </div>
        )}

        {/* Messages Grid */}
        {!loading && filteredMessages.length > 0 && (
          <div className="grid gap-4 md:gap-6">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Message Content */}
                  <div className="flex-1 space-y-3">
                    {/* Name and Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <IconUser size={18} className="text-gray-500 flex-shrink-0" />
                        <span className="text-white font-semibold break-words">{msg.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMail size={18} className="text-gray-500 flex-shrink-0" />
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-[#E62B1E] hover:underline break-all"
                        >
                          {msg.email}
                        </a>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-black/30 rounded p-4 border border-zinc-800 max-h-[300px] overflow-y-auto overflow-x-hidden w-full">
                      <p className="text-gray-300 w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <IconClock size={16} />
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deleting === msg.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-500 rounded-md hover:bg-red-900/40 transition border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconTrash size={18} />
                      {deleting === msg.id ? "Deleting..." : "Delete"}
                    </button>

                    {/* Resolved Button (Toggleable) */}
                    <button
                      onClick={() => handleResolve(msg.id, msg.resolved)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition border
                                  ${msg.resolved
                                  ? "bg-green-900/20 text-green-500 border-green-900/50 hover:bg-green-900/40"
                                  : "bg-yellow-900/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900/40"
                                }`}
                    >
                      {msg.resolved ? "✓ Resolved" : "Mark as Resolved"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}