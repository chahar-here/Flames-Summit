"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { LoaderOne } from '../../../components/ui/loader';
import { Input } from '../../../components/ui/input';
import { IconCheck, IconX, IconArrowNarrowUp, IconArrowNarrowDown, IconFileExport } from '@tabler/icons-react';

interface TicketData {
  id: string;
  ticketReferenceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketId: string;
  quantity: number;
  amountPaid: number;
  couponCodeUsed: string | null;
  purchaseDate: string;
  checkedIn: boolean;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof TicketData>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tickets');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tickets.');
      }
      const data: TicketData[] = await response.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleToggleCheckIn = async (id: string, currentStatus: boolean) => {
    const originalTickets = [...tickets];
    setTickets(currentTickets => 
      currentTickets.map(ticket => 
        ticket.id === id ? { ...ticket, checkedIn: !currentStatus } : ticket
      )
    );
    
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn: !currentStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update check-in status.');
      }
    } catch (err: any) {
      setError(err.message);
      setTickets(originalTickets);
    }
  };

  const handleSort = (key: keyof TicketData) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => 
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketReferenceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortDirection === 'asc' ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [tickets, searchTerm, sortKey, sortDirection]);

  const salesOverview = useMemo(() => {
    const totalTicketsSold = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = tickets.reduce((sum, t) => sum + t.amountPaid, 0);
    const checkedInCount = tickets.filter(t => t.checkedIn).length;
    
    return { totalTicketsSold, totalRevenue, checkedInCount, totalAttendees: tickets.length };
  }, [tickets]);

  const handleExport = () => {
    const headers = [
      'Ticket Ref ID', 'Name', 'Email', 'Phone', 'Ticket Type', 'Quantity', 'Amount Paid', 'Coupon Used', 'Purchase Date', 'Checked In'
    ];
    const rows = sortedAndFilteredTickets.map(t => [
      t.ticketReferenceId, t.customerName, t.customerEmail, t.customerPhone, t.ticketId, t.quantity, t.amountPaid, t.couponCodeUsed || 'N/A', new Date(t.purchaseDate).toLocaleString(), t.checkedIn ? 'Yes' : 'No'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`));

    const csvContent = "data:text/csv;charset=utf-8," 
                      + headers.join(',') + '\n'
                      + rows.map(e => e.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tedxsviet_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-200">
          Tickets Management Dashboard
        </h1>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <IconX className="h-6 w-6 text-red-500" />
                </button>
            </div>
        )}
        
        {/* Sales Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Total Tickets Sold</h3>
            <p className="mt-1 text-3xl font-bold text-[#E62B1E]">{salesOverview.totalTicketsSold}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Total Attendees</h3>
            <p className="mt-1 text-3xl font-bold text-[#E62B1E]">{salesOverview.totalAttendees}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Total Revenue</h3>
            <p className="mt-1 text-3xl font-bold text-[#E62B1E]">₹{salesOverview.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Attendees Checked In</h3>
            <p className="mt-1 text-3xl font-bold text-[#E62B1E]">{salesOverview.checkedInCount} / {salesOverview.totalAttendees}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-6">
            <button onClick={handleExport} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <IconFileExport size={20} />
                Export CSV
            </button>
        </div>

        {/* Ticket List Table */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">All Tickets ({sortedAndFilteredTickets.length})</h2>
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm p-2 rounded-md border dark:bg-zinc-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-zinc-900">
                <tr>
                  <th onClick={() => handleSort('ticketReferenceId')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID {sortKey === 'ticketReferenceId' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>
                  <th onClick={() => handleSort('customerName')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name {sortKey === 'customerName' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>
                  <th onClick={() => handleSort('ticketId')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Type {sortKey === 'ticketId' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>
                  
                  {/* ✅ NEW: Added Amount Paid column header */}
                  <th onClick={() => handleSort('amountPaid')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid {sortKey === 'amountPaid' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>

                  <th onClick={() => handleSort('purchaseDate')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date {sortKey === 'purchaseDate' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>
                  <th onClick={() => handleSort('checkedIn')} className="cursor-pointer px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked In {sortKey === 'checkedIn' && (sortDirection === 'asc' ? <IconArrowNarrowUp size={14} className="inline ml-1" /> : <IconArrowNarrowDown size={14} className="inline ml-1" />)}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedAndFilteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {ticket.ticketReferenceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className='font-medium text-gray-800 dark:text-gray-200'>{ticket.customerName}</div>
                      <div className="text-xs">{ticket.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                      <span className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          ticket.ticketId === 'gold' && 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300',
                          ticket.ticketId === 'platinum' && 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300',
                          ticket.ticketId === 'both_sessions' && 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
                      )}>
                          {ticket.ticketId.replace('_', ' ')}
                      </span>
                    </td>

                    {/* ✅ NEW: Added Amount Paid data cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                        ₹{ticket.amountPaid.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {ticket.checkedIn ? (
                            <IconCheck className="text-green-500 inline-block" size={24} />
                        ) : (
                            <IconX className="text-red-500 inline-block" size={24} />
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                            onClick={() => handleToggleCheckIn(ticket.id, ticket.checkedIn)}
                            className={cn(
                                "px-3 py-1 text-xs font-bold rounded-full transition-colors",
                                ticket.checkedIn 
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            )}
                        >
                            {ticket.checkedIn ? 'Un-Check In' : 'Check In'}
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}