import React, { useState, useEffect } from "react";
import { X, Tag, Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";
import { Label } from "../../types/label";
import { getLabelsByProject, createLabel, updateLabel, deleteLabel } from "../../api/label.api";

interface LabelManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onLabelsChange?: () => void;
}

const PREDEFINED_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
  "#64748b", "#cbd5e1"
];

const LabelManager: React.FC<LabelManagerProps> = ({ projectId, isOpen, onClose, onLabelsChange }) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", color: PREDEFINED_COLORS[6] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchLabels();
    }
  }, [isOpen, projectId]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLabelsByProject(projectId);
      setLabels(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải danh sách nhãn");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await createLabel({ name: formData.name, color: formData.color, project: projectId });
      await fetchLabels();
      setFormData({ name: "", color: PREDEFINED_COLORS[6] });
      setIsCreating(false);
      onLabelsChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tạo nhãn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent, labelId: string) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await updateLabel(labelId, { name: formData.name, color: formData.color });
      await fetchLabels();
      setEditingId(null);
      setFormData({ name: "", color: PREDEFINED_COLORS[6] });
      onLabelsChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi cập nhật nhãn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (labelId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhãn này? Nhãn này sẽ bị gỡ khỏi tất cả công việc.")) return;
    
    try {
      setLoading(true);
      await deleteLabel(labelId);
      await fetchLabels();
      if (editingId === labelId) {
        setEditingId(null);
      }
      onLabelsChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi xóa nhãn");
      setLoading(false);
    }
  };

  const startEdit = (label: Label) => {
    setEditingId(label._id);
    setIsCreating(false);
    setFormData({ name: label.name, color: label.color });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: "", color: PREDEFINED_COLORS[6] });
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", color: PREDEFINED_COLORS[6] });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 animate-in slide-in-from-right flex flex-col border-l border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Tag className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold border-none text-slate-800 focus:outline-none">Quản lý Nhãn (Label)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          {(isCreating || editingId) && (
            <form 
              onSubmit={(e) => editingId ? handleUpdate(e, editingId) : handleCreate(e)}
              className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm"
            >
              <h3 className="font-bold text-slate-700 mb-2">
                {editingId ? "Cập nhật nhãn" : "Tạo nhãn mới"}
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tên nhãn
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400"
                  placeholder="Vd: Bug, Feature, Urgent..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Màu sắc
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {formData.color === color && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl text-sm font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Lưu thay đổi" : "Tạo nhãn"}
                </button>
              </div>
            </form>
          )}

          {!isCreating && !editingId && (
            <button
              onClick={startCreate}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center gap-2 font-bold transition-all group"
            >
              <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Thêm nhãn mới
            </button>
          )}

          {/* List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 mb-2">
              Danh sách nhãn ({labels.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-sm font-medium">
                Chưa có nhãn nào trong dự án này.
              </div>
            ) : (
              labels.map(label => (
                <div 
                  key={label._id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    editingId === label._id ? "border-indigo-500 bg-indigo-50/30 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-8 rounded-full shadow-sm" 
                      style={{ backgroundColor: label.color }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-800">{label.name}</h4>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(label)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(label._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default LabelManager;
