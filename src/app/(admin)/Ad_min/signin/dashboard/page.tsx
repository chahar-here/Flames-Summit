// /app/dashboard/page.tsx
import OverviewCard from "@/components/ui/OverviewCard";
import GoalsCard from "@/components/ui/GoalsCard";
import TaskList from "@/components/ui/TaskList";
import WeeklyProgressChart from "@/components/ui/WeeklyProgressChart";
import MonthProgressChart from "@/components/ui/MonthProgressChart";
import ProjectList from "@/components/ui/ProjectList";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Top Section */}
      <div className="col-span-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hi, Dilan!</h1>
        <button className="bg-black text-white px-4 py-2 rounded-xl">+ Create</button>
      </div>

      {/* Info Cards */}
      <div className="col-span-4"><OverviewCard /></div>
      <div className="col-span-4"><WeeklyProgressChart /></div>
      <div className="col-span-4"><MonthProgressChart /></div>

      {/* Goals and Tasks */}
      <div className="col-span-4"><GoalsCard /></div>
      <div className="col-span-8"><TaskList /></div>

      {/* Last Projects */}
      <div className="col-span-12"><ProjectList /></div>
    </div>
  );
}
