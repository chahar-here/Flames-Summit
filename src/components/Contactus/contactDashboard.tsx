"use client";
import React, { useState, useEffect } from "react";
import { IconTrash, IconMail, IconUser, IconClock, IconCheck, IconX } from "@tabler/icons-react";
import { getContactMessages, deleteContactMessage, toggleContactResolved } from "@/lib/actions";

interface ContactMessage {
  resolved: boolean;
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: string; // ISO string from server
}

export function ContactDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch messages using adminDb action
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages(100); // Get first 100 messages
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...messages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by resolved status
    if (statusFilter === "resolved") {
      filtered = filtered.filter(msg => msg.resolved === true);
    } else if (statusFilter === "unresolved") {
      filtered = filtered.filter(msg => msg.resolved !== true);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (sortOrder === "newest") {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    setFilteredMessages(filtered);
  }, [messages, statusFilter, sortOrder, searchTerm]);

  // Delete message using adminDb action
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    setDeleting(id);
    try {
      const result = await deleteContactMessage(id);
      if (result.success) {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert(error instanceof Error ? error.message : "Failed to delete message");
    } finally {
      setDeleting(null);
    }
  };

  // Format timestamp
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Resolve message (toggleable) using adminDb action
  const handleResolve = async (id: string, currentState: boolean) => {
    try {
      const result = await toggleContactResolved(id, currentState);
      if (result.success) {
        setMessages(prev => 
          prev.map(msg =>
            msg.id === id ? { ...msg, resolved: !currentState } : msg
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update message status');
      }
    } catch (error) {
      console.error("Error toggling resolved state:", error);
      alert(error instanceof Error ? error.message : "Failed to update message status");
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E62B1E] mb-6">
            Contact Us Messages
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name, email or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-96 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#E62B1E] transition"
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-[#E62B1E] transition"
              >
                <option value="all">All</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-[#E62B1E] transition"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
            <IconMail size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400">No messages match your filters</h3>
            <p className="text-gray-600 mt-2">Try adjusting your search or filter settings</p>
          </div>
        )}

        {/* Messages Table */}
        {!loading && filteredMessages.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Full Name</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Message</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className="border-b border-zinc-900 hover:bg-zinc-900/30 transition"
                  >
                    {/* Full Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <IconUser size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-white font-medium">{msg.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4">
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-[#E62B1E] hover:underline"
                      >
                        {msg.email}
                      </a>
                    </td>

                    {/* Message Preview */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-gray-300 truncate text-sm">
                        {msg.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <IconClock size={14} />
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span 
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          msg.resolved 
                            ? "bg-green-900/20 text-green-500" 
                            : "bg-yellow-900/20 text-yellow-500"
                        }`}
                      >
                        {msg.resolved ? (
                          <>
                            <IconCheck size={12} />
                            Resolved
                          </>
                        ) : (
                          <>
                            <IconClock size={12} />
                            Pending
                          </>
                        )}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Resolve Toggle Button */}
                        <button
                          onClick={() => handleResolve(msg.id, msg.resolved)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                            msg.resolved
                              ? "bg-yellow-900/20 text-yellow-500 hover:bg-yellow-900/40"
                              : "bg-green-900/20 text-green-500 hover:bg-green-900/40"
                          }`}
                        >
                          {msg.resolved ? "Unresolve" : "Resolve"}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deleting === msg.id}
                          className="px-3 py-1.5 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === msg.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}