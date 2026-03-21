import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Clock,
  CheckCircle2,
  Layout,
  UserPlus,
  Search,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

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
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Member management state
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentUserJson = localStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  // Logic kiểm tra quyền sở hữu cực kỳ mạnh mẽ
  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const projectOwnerId = String(
    project?.owner?.id ||
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

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/projects/${projectId}`);
      navigate("/projects");
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xóa dự án.");
      setIsDeleting(false);
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
      // Lọc bỏ những người đã là thành viên (so sánh ID an toàn hơn)
      const currentMemberIds =
        project?.members.map((m) => String(m.id || m.id)) || [];
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
      fetchProject(); // Refresh project data
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
      fetchProject(); // Refresh project data
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
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-semibold transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Danh sách dự án
        </Link>

        {isOwner && (
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${project.id}/edit`}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all shadow-sm"
            >
              <Edit3 className="h-4 w-4 text-blue-600" />
              Chỉnh sửa
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Đang xóa..." : "Xóa dự án"}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Main Project Info */}
        <div className="lg:col-span-2 space-y-10">
          {/* Project Title Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Layout className="h-32 w-32" />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span
                className={`text-[10px] font-black px-3.5 py-1.5 rounded-full border uppercase tracking-[0.1em] ${statusConfig[project.status].color}`}
              >
                {statusConfig[project.status].label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
                <Clock className="h-3.5 w-3.5" />
                Đã tạo:{" "}
                {new Date(project.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
              {project.name}
            </h1>

            <div className="h-1 w-20 bg-blue-600 rounded-full mb-8"></div>

            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
              {project.description || "Dự án này chưa có mô tả chi tiết."}
            </p>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100/50 flex items-center gap-6 group transition-all hover:shadow-lg hover:shadow-blue-500/5">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Layout className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900/60 uppercase tracking-widest mb-1">
                  Tiến độ
                </p>
                <p className="text-3xl font-black text-blue-600">0%</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-100/50 flex items-center gap-6 group transition-all hover:shadow-lg hover:shadow-green-500/5">
              <div className="bg-green-600 p-4 rounded-2xl shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900/60 uppercase tracking-widest mb-1">
                  Hoàn thành
                </p>
                <p className="text-3xl font-black text-green-600">0/0</p>
              </div>
            </div>
          </div>

          {/* Task Placeholder */}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
            <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Công việc của dự án
            </h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Chưa có công việc nào được tạo trong dự án này. Hãy bắt đầu quản
              lý ngay!
            </p>
            <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">
              <Plus className="h-5 w-5" />
              Thêm công việc mới
            </button>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Timeframe Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> Thời gian dự án
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
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
                          { dateStyle: "full" },
                        )
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Kết thúc dự kiến
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("vi-VN", {
                          dateStyle: "full",
                        })
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" /> Thành viên (
                {project.members?.length || 0})
              </h3>
              {isOwner && (
                <div className="relative" ref={searchRef}>
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className={`p-2 rounded-xl transition-all ${showAddMember ? "bg-blue-600 text-white shadow-lg" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>

                  {showAddMember && (
                    <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Tìm theo tên hoặc email..."
                          value={searchQuery}
                          onChange={(e) => handleSearchUsers(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                        {searching ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            Đang tìm kiếm...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            {searchQuery.length < 2
                              ? "Nhập ít nhất 2 ký tự"
                              : "Không tìm thấy kết quả"}
                          </div>
                        ) : (
                          searchResults.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleAddMember(u.id)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-blue-50 rounded-xl transition-colors group text-left"
                            >
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                                {u.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {u.fullName}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                              <div className="bg-blue-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="h-3 w-3" />
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {project.members?.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">
                  Chưa có thành viên nào.
                </p>
              ) : (
                project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:from-blue-100 group-hover:to-blue-50 transition-all">
                        <span className="text-gray-500 font-bold text-xs uppercase group-hover:text-blue-600">
                          {member.fullName?.substring(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-blue-600 transition-colors truncate">
                          {member.fullName}
                          {member.id === project.owner?.id && (
                            <span className="ml-1.5 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                              Chủ sở hữu
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {isOwner && member.id !== project.owner?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa khỏi dự án"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300 mb-6 opacity-60">
              Chủ quản dự án
            </p>
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Settings className="h-7 w-7 text-blue-300" />
              </div>
              <div>
                <p className="font-black text-xl leading-none mb-1">
                  {project.owner?.fullName || "Admin"}
                </p>
                <p className="text-xs text-blue-200 opacity-60 tracking-wide font-medium">
                  Quản trị viên hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
