"use client";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { IconTrash, IconMail, IconCalendar, IconUsers } from "@tabler/icons-react";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
}

interface DailyStats {
  date: string;
  count: number;
}

export function SubscriberDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  // Fetch subscribers from Firebase
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedSubscribers: Subscriber[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedSubscribers.push({
          id: doc.id,
          ...doc.data()
        } as Subscriber);
      });
      
      setSubscribers(fetchedSubscribers);
      calculateDailyStats(fetchedSubscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily subscription stats
  const calculateDailyStats = (subs: Subscriber[]) => {
    const statsMap = new Map<string, number>();
    
    subs.forEach(sub => {
      if (sub.subscribedAt) {
        const date = sub.subscribedAt.toDate ? sub.subscribedAt.toDate() : new Date(sub.subscribedAt);
        const dateKey = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
        
        statsMap.set(dateKey, (statsMap.get(dateKey) || 0) + 1);
      }
    });

    const stats: DailyStats[] = Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7); // Show last 7 days

    setDailyStats(stats);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...subscribers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.subscribedAt?.toDate ? a.subscribedAt.toDate() : new Date(a.subscribedAt);
      const dateB = b.subscribedAt?.toDate ? b.subscribedAt.toDate() : new Date(b.subscribedAt);
      
      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredSubscribers(filtered);
  }, [subscribers, searchTerm, sortOrder]);

  // Delete subscriber
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "subscribers", id));
      setSubscribers(subscribers.filter(sub => sub.id !== id));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("Failed to delete subscriber");
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

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Get today's new subscribers count
  const todayCount = dailyStats.length > 0 ? dailyStats[0].count : 0;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E62B1E] mb-6">
            Newsletter Subscribers
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Subscribers */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#E62B1E]/10 rounded-lg">
                  <IconUsers size={24} className="text-[#E62B1E]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Subscribers</p>
                  <p className="text-2xl font-bold text-white">{subscribers.length}</p>
                </div>
              </div>
            </div>

            {/* New Today */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <IconCalendar size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">New Today</p>
                  <p className="text-2xl font-bold text-white">{todayCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Stats */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Daily New Subscribers</h2>
            <div className="space-y-2">
              {dailyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{stat.date}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-[#E62B1E] h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(stat.count / Math.max(...dailyStats.map(s => s.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-white font-semibold text-sm w-8 text-right">
                      {stat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-96 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#E62B1E] transition"
            />

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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSubscribers.length === 0 && subscribers.length === 0 && (
          <div className="text-center py-20">
            <IconMail size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400">No subscribers yet</h3>
            <p className="text-gray-600 mt-2">Newsletter subscriptions will appear here</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredSubscribers.length === 0 && subscribers.length > 0 && (
          <div className="text-center py-20">
            <IconMail size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400">No subscribers match your search</h3>
            <p className="text-gray-600 mt-2">Try adjusting your search term</p>
          </div>
        )}

        {/* Subscribers Table */}
        {!loading && filteredSubscribers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Subscribed At</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr 
                    key={sub.id} 
                    className="border-b border-zinc-900 hover:bg-zinc-900/30 transition"
                  >
                    {/* Email */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <IconMail size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-white">{sub.email}</span>
                      </div>
                    </td>

                    {/* Subscribed Date */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <IconCalendar size={14} />
                        <span>{formatDate(sub.subscribedAt)}</span>
                      </div>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deleting === sub.id}
                          className="px-3 py-1.5 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === sub.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Load More Button (Optional) */}
            {filteredSubscribers.length >= 20 && (
              <div className="flex justify-center mt-6">
                <button className="px-6 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition">
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}