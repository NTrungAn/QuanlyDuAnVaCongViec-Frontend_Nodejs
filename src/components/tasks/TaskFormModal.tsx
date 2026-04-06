import React, { useState, useEffect } from "react";
import { X, Loader2, Tag, Check } from "lucide-react";
import {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskStatus,
  TaskPriority,
} from "../../types/task";
import { Sprint } from "../../types/sprint";
import { Epic } from "../../types/epic";
import { TaskType } from "../../types/taskType";
import CommentSection from "./CommentSection";
import AttachmentSection from "./AttachmentSection";
import SubtaskSection from "./SubtaskSection";

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
  taskTypes: TaskType[];
  labels: any[];
  statuses: any[];
  isSubmitting: boolean;
  defaultEpicId?: string | null;
  onEditSubtask?: (task: Task) => void;
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
  taskTypes,
  labels,
  statuses,
  isSubmitting,
  defaultEpicId,
  onEditSubtask,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: (statuses && statuses.length > 0
      ? statuses[0].name
      : "") as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    assignee: "",
    sprint: "",
    epic: "",
    taskType: "",
    labels: [] as string[],
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
        assignee: initialData.assignee?._id || "",
        sprint:
          (initialData.sprint as any)?._id ||
          (initialData.sprint as any)?.id ||
          "",
        epic:
          (initialData.epic as any)?._id || (initialData.epic as any)?.id || "",
        taskType:
          (initialData.taskType as any)?._id ||
          (initialData.taskType as any)?.id ||
          "",
        labels: (initialData.labels || []).map((l: any) => l._id || l.id || l),
      });
    } else if (isOpen) {
      // Reset form on open
      setFormData({
        title: "",
        description: "",
        status: statuses && statuses.length > 0 ? statuses[0].name : "",
        priority: "MEDIUM",
        dueDate: "",
        assignee: "",
        sprint: "",
        epic: defaultEpicId || "",
        taskType: "",
        labels: [],
      });
    }
  }, [initialData, isOpen, defaultEpicId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
    };

    if (!isEditing) submitData.project = projectId;
    if (formData.dueDate)
      submitData.dueDate = new Date(formData.dueDate).toISOString();
    if (formData.assignee) submitData.assignee = formData.assignee;
    if (formData.sprint) submitData.sprint = formData.sprint;
    if (formData.epic) submitData.epic = formData.epic;
    if (formData.taskType) submitData.taskType = formData.taskType;
    if (formData.labels && formData.labels.length > 0)
      submitData.labels = formData.labels;

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

        <div className="overflow-y-auto custom-scrollbar flex-grow">
          <form id="task-form" onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    {(statuses || []).map((s) => (
                      <option key={s._id || s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Độ ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as TaskPriority,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Người thực hiện
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, sprint: e.target.value })
                    }
                    disabled={(Array.isArray(sprints) ? sprints : []).some(
                      (s) =>
                        (s.id || s._id) === formData.sprint &&
                        s.status === "COMPLETED",
                    )}
                    title={
                      (Array.isArray(sprints) ? sprints : []).some(
                        (s) =>
                          (s.id || s._id) === formData.sprint &&
                          s.status === "COMPLETED",
                      )
                        ? "Công việc này thuộc Sprint đã hoàn thành, không thể chuyển sang Sprint khác"
                        : ""
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Backlog (Không thuộc Sprint) --</option>
                    {(Array.isArray(sprints) ? sprints : [])
                      .filter(
                        (s) =>
                          s.status !== "COMPLETED" ||
                          (s.id || s._id) === formData.sprint,
                      )
                      .map((s) => (
                        <option
                          key={s.id || s._id}
                          value={(s.id || s._id) as string}
                        >
                          {s.name}{" "}
                          {s.status === "COMPLETED" ? "(Đã hoàn thành)" : ""}
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
                    onChange={(e) =>
                      setFormData({ ...formData, epic: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="">-- Không thuộc Epic nào --</option>
                    {(Array.isArray(epics) ? epics : []).map((e) => (
                      <option
                        key={e.id || e._id}
                        value={(e.id || e._id) as string}
                      >
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Type */}
                <div className="flex-1">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Loại công việc
                  </label>
                  <select
                    value={formData.taskType || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, taskType: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">(Không có)</option>
                    {(Array.isArray(taskTypes) ? taskTypes : []).map((t) => (
                      <option
                        key={t._id || t.id}
                        value={(t._id || t.id) as string}
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Labels (Multi-select toggles) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Nhãn (Labels)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => {
                      const isSelected = formData.labels.includes(
                        label._id || label.id,
                      );
                      return (
                        <button
                          type="button"
                          key={label._id || label.id}
                          onClick={() => {
                            const id = label._id || label.id;
                            setFormData((prev) => ({
                              ...prev,
                              labels: isSelected
                                ? prev.labels.filter((l) => l !== id)
                                : [...prev.labels, id],
                            }));
                          }}
                          className={`group px-3 py-1.5 rounded-xl border text-[13px] font-bold transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 ml-1 text-indigo-600" />
                          )}
                        </button>
                      );
                    })}
                    {labels.length === 0 && (
                      <span className="text-sm text-gray-400 italic">
                        Chưa có nhãn nào trong dự án. Bạn có thể tạo nhãn trên
                        bảng điều khiển.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Integration of Comment Section */}
          {isEditing && initialData && (
            <div className="px-6 pb-6">
              <SubtaskSection
                taskId={(initialData.id || initialData._id) as string}
                projectId={projectId}
                onEditSubtask={onEditSubtask}
              />
              <AttachmentSection
                taskId={(initialData.id || initialData._id) as string}
              />
              <CommentSection
                taskId={(initialData.id || initialData._id) as string}
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-3xl">
          {isEditing && onDelete ? (
            <button
              onClick={() => {
                if (
                  window.confirm("Bạn có chắc chắn muốn xoá công việc này?")
                ) {
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
              type="submit"
              form="task-form"
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
