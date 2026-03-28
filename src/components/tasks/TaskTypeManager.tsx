import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Loader2, Tag } from "lucide-react";
import { TaskType, CreateTaskTypeDTO } from "../../types/taskType";
import { getTaskTypesByProject, createTaskType, updateTaskType, deleteTaskType } from "../../api/taskType.api";

interface TaskTypeManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskTypesUpdated: () => void;
}

const COLORS = [
  "#4F46E5", "#EF4444", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"
];

const ICONS = [
  "Tag", "Bug", "Zap", "CheckCircle", "Info", "AlertTriangle", "FileText", "Layout"
];

const TaskTypeManager: React.FC<TaskTypeManagerProps> = ({
  projectId,
  isOpen,
  onClose,
  onTaskTypesUpdated,
}) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTaskTypeDTO>({
    name: "",
    description: "",
    color: COLORS[0],
    icon: ICONS[0],
  });

  useEffect(() => {
    if (isOpen) fetchTaskTypes();
  }, [isOpen, projectId]);

  const fetchTaskTypes = async () => {
    setLoading(true);
    try {
      const data = await getTaskTypesByProject(projectId);
      setTaskTypes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTaskType(projectId, editingId, formData);
      } else {
        await createTaskType(projectId, formData);
      }
      resetForm();
      fetchTaskTypes();
      onTaskTypesUpdated();
    } catch (error) {
      alert("Lỗi khi lưu loại công việc.");
    }
  };

  const handleEdit = (type: TaskType) => {
    setEditingId(type._id || type.id);
    setFormData({
      name: type.name,
      description: type.description || "",
      color: type.color || COLORS[0],
      icon: type.icon || ICONS[0],
    });
    setIsAdding(true);
  };

  const handleDelete = async (typeId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại công việc này?")) return;
    try {
      await deleteTaskType(projectId, typeId);
      fetchTaskTypes();
      onTaskTypesUpdated();
    } catch (error) {
      alert("Lỗi khi xóa loại công việc.");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "", color: COLORS[0], icon: ICONS[0] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" /> Quản lý loại công việc
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên loại</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Ví dụ: Lỗi hệ thống"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Mô tả ngắn gọn..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform ${formData.color === c ? "scale-125 ring-2 ring-offset-2 ring-blue-500" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-blue-400 hover:text-blue-600 transition-all group"
              >
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" /> Thêm loại công việc mới
              </button>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>
              ) : taskTypes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Chưa có loại công việc nào cho dự án này.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {taskTypes.map((type) => (
                    <div key={type._id || type.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${type.color}15`, color: type.color }}>
                          <Tag className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{type.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{type.description || "Không có mô tả"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(type)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(type._id || type.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTypeManager;
