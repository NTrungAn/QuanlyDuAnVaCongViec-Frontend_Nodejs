import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus, TaskPriority } from "../../types/task";
import { Sprint } from "../../types/sprint";
import { Epic } from "../../types/epic";

interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  initialData?: Task | null;
  projectId: string;
  projectMembers: User[];
  sprints: Sprint[];
  epics: Epic[];
  isSubmitting: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  projectId,
  projectMembers,
  sprints,
  epics,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    assignee: "",
    sprint: "",
    epic: "",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
        assignee: initialData.assignee?._id || "",
        sprint: (initialData.sprint as any)?._id || (initialData.sprint as any)?.id || "",
        epic: (initialData.epic as any)?._id || (initialData.epic as any)?.id || "",
      });
    } else if (isOpen) {
      // Reset form on open
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        assignee: "",
        sprint: "",
        epic: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateTaskDTO | UpdateTaskDTO = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      ...(isEditing ? {} : { project: projectId }),
      ...(formData.dueDate ? { dueDate: new Date(formData.dueDate).toISOString() } : {}),
      ...(formData.assignee ? { assignee: formData.assignee } : { assignee: null }),
      ...(formData.sprint ? { sprint: formData.sprint } : { sprint: null }),
      ...(formData.epic ? { epic: formData.epic } : { epic: null }),
    };

    onSubmit(submitData);
  };

  const isEditing = !!initialData;

  const getUserId = (user: User) => user._id || user.id || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">
            {isEditing ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Ví dụ: Thiết kế giao diện đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Thông tin chi tiết về công việc này..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="TODO">Lập kế hoạch</option>
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="REVIEW">Chờ duyệt</option>
                  <option value="DONE">Hoàn thành</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Độ ưu tiên
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Người thực hiện
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">-- Chưa giao cho ai --</option>
                  {projectMembers.map((member) => (
                    <option key={getUserId(member)} value={getUserId(member)}>
                      {member.fullName} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sprint
                </label>
                <select
                  value={formData.sprint}
                  onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">-- Backlog (Không thuộc Sprint) --</option>
                  {(Array.isArray(sprints) ? sprints : []).map((s) => (
                    <option key={s.id || s._id} value={(s.id || s._id) as string}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Epic
                </label>
                <select
                  value={formData.epic}
                  onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="">-- Không thuộc Epic nào --</option>
                  {(Array.isArray(epics) ? epics : []).map((e) => (
                    <option key={e.id || e._id} value={(e.id || e._id) as string}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-3xl">
          {isEditing && onDelete ? (
             <button
              onClick={() => {
                if(window.confirm("Bạn có chắc chắn muốn xoá công việc này?")) {
                  onDelete((initialData.id || initialData._id) as string);
                }
              }}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors w-full sm:w-auto"
            >
              Xoá công việc
            </button>
          ) : (
            <div></div> // Push right buttons to the right
          )}
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm w-full sm:w-auto"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim()}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Cập nhật" : "Tạo công việc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
