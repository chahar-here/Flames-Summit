// /app/dashboard/components/Topbar.tsx
"use client";
import { Bell, Search, UserCircle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </div>

        <button className="relative">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        <UserCircle className="w-9 h-9 text-gray-700" />
      </div>
    </header>
  );
}
