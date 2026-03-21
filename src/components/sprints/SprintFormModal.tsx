import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { CreateSprintDTO, Sprint } from "../../types/sprint";

interface SprintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSprintDTO) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Sprint | null;
}

const SprintFormModal: React.FC<SprintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateSprintDTO>({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name,
        goal: initialData.goal || "",
        startDate: initialData.startDate.split("T")[0],
        endDate: initialData.endDate.split("T")[0],
        status: initialData.status,
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        status: "PLANNED",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert("Vui lòng điền đầy đủ Tên, Ngày bắt đầu và kết thúc.");
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      alert("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">
            {initialData ? "Chỉnh sửa Sprint" : "Thêm Sprint mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên Sprint (Giai đoạn) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="VD: Sprint 1 - Core Features"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mục tiêu Sprint
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Mục tiêu chính cần đạt được..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {initialData && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="PLANNED">Lập kế hoạch</option>
                  <option value="ACTIVE">Đang diễn ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.startDate || !formData.endDate}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialData ? "Lưu thay đổi" : "Tạo Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintFormModal;
