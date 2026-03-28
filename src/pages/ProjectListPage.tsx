import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startDate: string;
  endDate: string;
  members: any[];
  owner: any;
}

const statusConfig = {
  PLANNING: {
    label: "Lập kế hoạch",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "bg-blue-50 text-blue-700 border-blue-200/60",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  ON_HOLD: {
    label: "Tạm dừng",
    color: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-rose-50 text-rose-700 border-rose-200/60",
  },
};

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (err: any) {
      setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-6 rounded-3xl border border-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Quản lý Dự án
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Theo dõi và quản lý các dự án bạn đang tham gia.
            </p>
          </div>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-blue-500/20 hover:shadow-lg active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Plus className="h-5 w-5" />
          Tạo dự án mới
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm tên dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm text-slate-900 font-medium placeholder:text-slate-400 hover:border-slate-300"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
          <Filter className="h-5 w-5" />
          Bộ lọc
        </button>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-100 p-8 animate-pulse shadow-sm"
            >
              <div className="h-6 bg-slate-200/60 rounded-lg w-24 mb-6"></div>
              <div className="h-6 bg-slate-200/80 rounded-lg w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-full mb-2"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-5/6 mb-8"></div>
              <div className="flex justify-between items-center mt-auto align-bottom pt-6 border-t border-slate-50">
                <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                <div className="h-8 bg-slate-200/60 rounded-xl w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-100 rounded-xl">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-rose-900 mb-1">Đã có lỗi xảy ra</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center">
          <div className="bg-white p-5 rounded-3xl shadow-sm mb-6 inline-flex">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Chưa có dự án nào
          </h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm">
            Bạn chưa có dự án nào hoặc không tìm thấy kết quả phù hợp. Khởi tạo không gian làm việc đầu tiên ngay hôm nay.
          </p>
          <Link
            to="/projects/new"
            className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-2 group"
          >
            Tạo dự án ngay bây giờ
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-100 p-7 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100/60 transition-all duration-300 flex flex-col relative hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="mb-5">
                <span
                  className={`text-[11px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider ${statusConfig[project.status].color}`}
                >
                  {statusConfig[project.status].label}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                {project.name}
              </h3>

              <p className="text-slate-500 text-sm line-clamp-2 mb-8 flex-grow leading-relaxed font-medium">
                {project.description || "Chưa có mô tả cho dự án này."}
              </p>

              <div className="flex flex-col gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center text-xs font-bold text-slate-400 gap-2">
                  <Calendar className="h-4 w-4 text-slate-300" />
                  <span>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}{" "}
                    —{" "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{project.members?.length || 0} thành viên</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-transparent group-hover:border-blue-100">
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
