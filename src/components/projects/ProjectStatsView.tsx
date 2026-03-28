import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  PieChart, 
  Users, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  Activity
} from "lucide-react";
import { getProjectStats, getMemberPerformanceReport } from "../../api/stat.api";
import { ProjectStats, PerformanceReport } from "../../types/stat";

interface ProjectStatsViewProps {
  projectId: string;
}

const ProjectStatsView: React.FC<ProjectStatsViewProps> = ({ projectId }) => {
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, perfData] = await Promise.all([
          getProjectStats(projectId),
          getMemberPerformanceReport(projectId)
        ]);
        setProjectStats(statsData);
        setPerformance(perfData);
      } catch (error) {
        console.error("Failed to fetch project statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  if (!projectStats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Tổng công việc" 
          value={projectStats.totalTasks} 
          icon={<Activity className="h-5 w-5" />} 
          color="blue" 
        />
        <SummaryCard 
          label="Hoàn thành" 
          value={projectStats.statusCounts.DONE} 
          icon={<CheckCircle2 className="h-5 w-5" />} 
          color="emerald" 
        />
        <SummaryCard 
          label="Tiến độ dự án" 
          value={`${projectStats.completionPercentage}%`} 
          icon={<TrendingUp className="h-5 w-5" />} 
          color="orange" 
        />
        <SummaryCard 
          label="Thành viên" 
          value={projectStats.memberCount} 
          icon={<Users className="h-5 w-5" />} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-8">
            <PieChart className="h-5 w-5 text-blue-600" /> Phân bổ trạng thái
          </h3>
          <div className="space-y-6">
            <StatusRow label="Cần làm" count={projectStats.statusCounts.TODO} total={projectStats.totalTasks} color="bg-gray-200" />
            <StatusRow label="Đang làm" count={projectStats.statusCounts.IN_PROGRESS} total={projectStats.totalTasks} color="bg-blue-500" />
            <StatusRow label="Đang duyệt" count={projectStats.statusCounts.REVIEW} total={projectStats.totalTasks} color="bg-orange-400" />
            <StatusRow label="Hoàn thành" count={projectStats.statusCounts.DONE} total={projectStats.totalTasks} color="bg-emerald-500" />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-red-500" /> Mức độ ưu tiên
          </h3>
          <div className="space-y-6">
            <PriorityRow label="Khẩn cấp" count={projectStats.priorityCounts.URGENT} color="text-red-600" bgColor="bg-red-50" />
            <PriorityRow label="Cao" count={projectStats.priorityCounts.HIGH} color="text-orange-600" bgColor="bg-orange-50" />
            <PriorityRow label="Trung bình" count={projectStats.priorityCounts.MEDIUM} color="text-blue-600" bgColor="bg-blue-50" />
            <PriorityRow label="Thấp" count={projectStats.priorityCounts.LOW} color="text-gray-600" bgColor="bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Member Performance Table */}
      {performance && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-8">
            <Users className="h-5 w-5 text-indigo-600" /> Hiệu suất thành viên
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Thành viên</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Tổng việc</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Đang làm</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Hoàn thành</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {performance.memberStats.map((member) => (
                  <tr key={member.memberId} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {member.fullName.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{member.fullName}</p>
                          <p className="text-[10px] text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-gray-700 text-sm">{member.totalTasks}</td>
                    <td className="py-4 text-center font-bold text-blue-600 text-sm">{member.statusCounts.IN_PROGRESS}</td>
                    <td className="py-4 text-center font-bold text-emerald-600 text-sm">{member.statusCounts.DONE}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${member.completionRate >= 70 ? 'bg-emerald-50 text-emerald-600' : member.completionRate >= 30 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {member.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const StatusRow = ({ label, count, total, color }: any) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900">{count} ({percent}%)</span>
      </div>
      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const PriorityRow = ({ label, count, color, bgColor }: any) => (
  <div className={`flex items-center justify-between p-4 ${bgColor} rounded-2xl border border-white`}>
    <span className={`text-sm font-bold ${color}`}>{label}</span>
    <span className={`text-lg font-black ${color}`}>{count}</span>
  </div>
);

export default ProjectStatsView;
