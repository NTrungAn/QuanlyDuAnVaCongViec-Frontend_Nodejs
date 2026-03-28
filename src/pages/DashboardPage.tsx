import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  Loader2,
  TrendingUp,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { getUserDashboardStats } from "../api/stat.api";
import { DashboardStats } from "../types/stat";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getUserDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang chuẩn bị dữ liệu cho bạn...</p>
      </div>
    );
  }

  const {
    totalProjects = 0,
    totalAssignedTasks = 0,
    assignedTaskStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
    upcomingDeadlines = []
  } = stats || {};

  const completionRate = totalAssignedTasks > 0 
    ? Math.round((assignedTaskStatus.DONE / totalAssignedTasks) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 transform transition-transform duration-1000 hover:scale-[1.7] hover:rotate-12">
          <TrendingUp className="h-48 w-48" />
        </div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Chào mừng trở lại, {user.fullName}! 👋</h1>
          <p className="text-blue-100/90 text-lg font-medium max-w-xl leading-relaxed">
            Hôm nay bạn có <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-md">{totalAssignedTasks - assignedTaskStatus.DONE}</span> công việc cần xử lý. Hãy cùng nhau hoàn thành chúng nhé!
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng dự án" 
          value={totalProjects} 
          icon={<Briefcase className="h-6 w-6" />} 
          color="blue"
          link="/projects"
        />
        <StatCard 
          title="Việc được giao" 
          value={totalAssignedTasks} 
          icon={<MessageSquare className="h-6 w-6" />} 
          color="indigo"
        />
        <StatCard 
          title="Hoàn thành" 
          value={assignedTaskStatus.DONE} 
          icon={<CheckCircle2 className="h-6 w-6" />} 
          color="emerald"
        />
        <StatCard 
          title="Tỷ lệ hoàn thành" 
          value={`${completionRate}%`} 
          icon={<TrendingUp className="h-6 w-6" />} 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Process Breakdown */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 transition-opacity opacity-0 group-hover:opacity-100" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              Trạng thái công việc
            </h3>
          </div>
          
          <div className="space-y-7 relative z-10">
            <ProgressBar label="Cần làm" count={assignedTaskStatus.TODO} total={totalAssignedTasks} color="bg-slate-300" textClass="text-slate-600" />
            <ProgressBar label="Đang thực hiện" count={assignedTaskStatus.IN_PROGRESS} total={totalAssignedTasks} color="bg-blue-500" textClass="text-blue-600" />
            <ProgressBar label="Đang duyệt" count={assignedTaskStatus.REVIEW} total={totalAssignedTasks} color="bg-amber-400" textClass="text-amber-600" />
            <ProgressBar label="Hoàn thành" count={assignedTaskStatus.DONE} total={totalAssignedTasks} color="bg-emerald-500" textClass="text-emerald-600" />
          </div>

          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-sm font-extrabold text-blue-900 mb-1">Hiệu suất hiển thị mức Tốt</p>
              <p className="text-sm text-blue-600/80 font-medium">Bạn đã hoàn thành <strong className="text-blue-700">{assignedTaskStatus.DONE}</strong> trong tổng số <strong className="text-blue-700">{totalAssignedTasks}</strong> tác vụ.</p>
            </div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(249,115,22,0.1)] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -z-10 transition-opacity opacity-0 group-hover:opacity-100" />
          
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            Deadline sắp tới
          </h3>
          
          <div className="space-y-4 flex-grow relative z-10">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-100">
                <div className="bg-orange-50 h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-orange-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Tuyệt vời! Bạn không có dự án nào sắp quá hạn trong 7 ngày tới.</p>
              </div>
            ) : (
              upcomingDeadlines.map((p) => (
                <Link 
                  key={p._id} 
                  to={`/projects/${p._id}`}
                  className="block p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200 transition-all group/item relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-slate-900 truncate mb-1.5 group-hover/item:text-orange-600 transition-colors">{p.name}</p>
                      <p className="text-[12px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                        Đến hạn: <span className="text-slate-700 font-bold">{new Date(p.endDate).toLocaleDateString("vi-VN")}</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl group-hover/item:bg-orange-50 transition-colors">
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover/item:text-orange-500" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link 
            to="/projects" 
            className="mt-8 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all group relative z-10"
          >
            Quản lý tất cả dự án <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "emerald" | "orange";
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, link }) => {
  const colors = {
    blue: "bg-blue-50/70 text-blue-600 border-blue-100/50",
    indigo: "bg-indigo-50/70 text-indigo-600 border-indigo-100/50",
    emerald: "bg-emerald-50/70 text-emerald-600 border-emerald-100/50",
    orange: "bg-orange-50/70 text-orange-600 border-orange-100/50"
  };

  const ringColors = {
    blue: "group-hover:ring-blue-100",
    indigo: "group-hover:ring-indigo-100",
    emerald: "group-hover:ring-emerald-100",
    orange: "group-hover:ring-orange-100"
  };

  const textColors = {
    blue: "group-hover:text-blue-700",
    indigo: "group-hover:text-indigo-700",
    emerald: "group-hover:text-emerald-700",
    orange: "group-hover:text-orange-700"
  }

  const baseClasses = `relative overflow-hidden p-6 lg:p-7 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:ring-4 ring-transparent ${ringColors[color]}`;

  const content = (
    <div className="relative z-10 flex flex-col h-full">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <div className="mt-auto">
        <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl lg:text-4xl font-black text-slate-900 transition-colors ${textColors[color]}`}>{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className={baseClasses + " block"}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
};

const ProgressBar: React.FC<{ label: string; count: number; total: number; color: string; textClass: string }> = ({ label, count, total, color, textClass }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2 group/bar">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-slate-700 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          {label}
        </span>
        <span className="text-slate-400 tabular-nums">
          <span className="text-slate-900 group-hover/bar:text-slate-900 transition-colors">{count}</span> / {total} 
          <span className={`ml-2 ${textClass} bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100`}>{percent}%</span>
        </span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner isolate">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out relative`} 
          style={{ width: `${percent}%` }}
        >
          <div className="absolute top-0 bottom-0 right-0 w-4 bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
