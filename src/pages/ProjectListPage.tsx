import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
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
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  ON_HOLD: {
    label: "Tạm dừng",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 border-red-200",
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dự án của tôi
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý và theo dõi tiến độ các dự án đang tham gia.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Tạo dự án mới
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none shadow-sm"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <Filter className="h-5 w-5" />
          Bộ lọc
        </button>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6 mb-6"></div>
              <div className="flex justify-between items-center mt-auto">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded-full w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy dự án nào
          </h3>
          <p className="text-gray-500 mb-8">
            Hãy bắt đầu bằng cách tạo một dự án mới cho riêng bạn.
          </p>
          <Link
            to="/projects/new"
            className="text-blue-600 font-semibold hover:underline"
          >
            Tạo dự án đầu tiên của bạn →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col relative"
            >
              <div className="mb-4">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusConfig[project.status].color}`}
                >
                  {statusConfig[project.status].label}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                {project.name}
              </h3>

              <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow">
                {project.description || "Chưa có mô tả cho dự án này."}
              </p>

              <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                <div className="flex items-center text-xs text-gray-400 gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}{" "}
                    -{" "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{project.members?.length || 0} thành viên</span>
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
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
