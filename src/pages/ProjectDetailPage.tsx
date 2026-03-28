import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  X,
  AlertCircle,
  Loader2,
  Clock,
  Layout,
  UserPlus,
  Search,
  Plus
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import TaskBoard from "../components/tasks/TaskBoard";
import ProjectStatsView from "../components/projects/ProjectStatsView";

interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startDate: string;
  endDate: string;
  members: User[];
  owner: User;
  createdAt: string;
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

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"board" | "stats">("board");

  // Member management state
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentUserJson = localStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const projectOwnerId = String(
    project?.owner?.id ||
      (typeof project?.owner === "string" ? project.owner : ""),
  );

  const isOwner = !!(
    currentUserId &&
    projectOwnerId &&
    currentUserId === projectOwnerId
  );

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowAddMember(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data);
    } catch (err: any) {
      setError("Không thể tải thông tin dự án.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await api.get(`/users/search?q=${q}`);
      const currentMemberIds =
        project?.members.map((m) => String(m.id)) || [];
      const filteredResults = response.data.filter((u: any) => {
        const userId = String(u.id || u._id);
        return !currentMemberIds.includes(userId);
      });
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await api.post(`/projects/${projectId}/members`, { memberId: userId });
      setShowAddMember(false);
      setSearchQuery("");
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể thêm thành viên.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Bạn có muốn xóa thành viên này khỏi dự án?")) return;
    try {
      await api.delete(`/projects/${projectId}/members`, {
        data: { memberId: userId },
      });
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xóa thành viên.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-20 text-center">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 inline-block max-w-md shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h3>
          <p className="text-gray-600 mb-6">
            {error || "Không tìm thấy dự án."}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Quay lại danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-2">
      {/* THAY ĐỔI 2: Đổi tỉ lệ grid thành xl:grid-cols-4 để cột trái rộng hơn */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Left Column: Cột chính chứa Project Info và Kanban, chiếm 3/4 màn hình trên desktop rộng */}
        <div className="xl:col-span-3 space-y-4 flex flex-col min-w-0">
          {/* Project Title Card  */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:px-4 sm:py-3 shadow-sm relative overflow-hidden shrink-0">
            {/* Icon nền mờ thu nhỏ */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-[0.03] pointer-events-none">
              <Layout className="h-12 w-12" />
            </div>

            {/* Hàng 1: Tiêu đề + Trạng thái + Ngày tạo (Nằm chung 1 dòng) */}
            <div className="flex flex-wrap items-center gap-3 mb-1 pr-12">
              <h1 className="text-lg font-bold text-[#172B4D] leading-none">
                {project.name}
              </h1>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusConfig[project.status].color}`}
              >
                {statusConfig[project.status].label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                <Clock className="h-3 w-3" />
                {new Date(project.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            {/* Hàng 2: Mô tả dự án */}
            <p className="text-[#5E6C84] text-[13px] leading-relaxed whitespace-pre-wrap pr-12 truncate">
              {project.description || "Dự án này chưa có mô tả chi tiết."}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("board")}
              className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                activeTab === "board"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Bảng công việc
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                activeTab === "stats"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Thống kê & Báo cáo
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden min-h-[500px]">
            {activeTab === "board" ? (
              <TaskBoard
                projectId={projectId!}
                projectMembers={project.members}
              />
            ) : (
              <ProjectStatsView projectId={projectId!} />
            )}
          </div>
        </div>

        {/* Right Column: Sidebar - Chuyển xuống chiếm 1/4 màn hình */}
        <div className="xl:col-span-1 space-y-6">
          {/* Timeframe Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> Thời gian dự án
            </h3>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Bắt đầu
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString(
                          "vi-VN",
                          { dateStyle: "long" },
                        )
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Kết thúc
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("vi-VN", {
                          dateStyle: "long",
                        })
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" /> Nhóm (
                {project.members?.length || 0})
              </h3>
              {isOwner && (
                <div className="relative" ref={searchRef}>
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className={`p-1.5 rounded-lg transition-all ${showAddMember ? "bg-blue-600 text-white shadow-md" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>

                  {showAddMember && (
                    <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-3">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Tìm email..."
                          value={searchQuery}
                          onChange={(e) => handleSearchUsers(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {searching ? (
                          <div className="p-3 text-center text-xs text-gray-400">
                            Đang tìm...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-400">
                            {searchQuery.length < 2
                              ? "Nhập ít nhất 2 ký tự"
                              : "Không có kết quả"}
                          </div>
                        ) : (
                          searchResults.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleAddMember(u.id)}
                              className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg text-left group"
                            >
                              <div className="flex-grow min-w-0 pr-2">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {u.fullName}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                              <Plus className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {project.members?.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  Chưa có thành viên nào.
                </p>
              ) : (
                project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-gray-500 font-bold text-[10px] uppercase">
                          {member.fullName?.substring(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">
                          {member.fullName}
                          {member.id === project.owner?.id && (
                            <span className="ml-1.5 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                              Chủ
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {isOwner && member.id !== project.owner?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
