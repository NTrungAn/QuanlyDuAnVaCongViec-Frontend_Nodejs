import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Calendar, FileText, Settings, UserPlus, Info, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

interface ProjectForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
}

const ProjectFormPage: React.FC = () => {
  const { projectId } = useParams();
  const isEdit = !!projectId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    status: "PLANNING",
  });

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      const { name, description, startDate, endDate, status } = response.data;
      setForm({
        name,
        description: description || "",
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : "",
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : "",
        status,
      });
    } catch (err: any) {
      setError("Không thể tải thông tin dự án.");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/projects/${projectId}`, form);
      } else {
        await api.post("/projects", form);
      }
      setSuccess(true);
      setTimeout(() => navigate("/projects"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu dự án.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-20 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Breadcrumb / Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách dự án
      </Link>

      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEdit ? "Cập nhật dự án" : "Khởi tạo dự án mới"}
        </h1>
        <p className="text-gray-500 mt-2">
          {isEdit ? "Chỉnh sửa thông tin chi tiết và thiết lập tiến độ của dự án." : "Bắt đầu một hành trình mới bằng việc thiết lập các thông tin cơ bản cho dự án của bạn."}
        </p>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 shadow-sm animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="font-medium">Thành công! Dự án của bạn đã được lưu lại.</span>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 shadow-sm">
          <Info className="h-5 w-5 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="Ví dụ: Xây dựng hệ thống quản lý công việc"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" /> Mô tả chi tiết
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400 resize-none"
              placeholder="Mô tả mục tiêu, phạm vi và những điểm chính của dự án này..."
            />
          </div>

          {/* Grid for Dates and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Ngày bắt đầu
              </label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 font-medium"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Ngày dự kiến kết thúc
              </label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 font-medium"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" /> Trạng thái
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 font-bold"
              >
                <option value="PLANNING">Lập kế hoạch</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="ON_HOLD">Tạm dừng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-grow flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save className="h-5 w-5" />
              {loading ? "Đang lưu..." : isEdit ? "Lưu các thay đổi" : "Tạo dự án ngay"}
            </button>
            <Link
              to="/projects"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all active:scale-[0.98]"
            >
              Hủy bỏ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormPage;
