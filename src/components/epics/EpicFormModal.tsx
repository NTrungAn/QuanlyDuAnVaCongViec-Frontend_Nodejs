import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Epic, CreateEpicDTO, EpicStatus } from "../../types/epic";

interface EpicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEpicDTO) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Epic | null;
}

const EpicFormModal: React.FC<EpicFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateEpicDTO>({
    name: "",
    description: "",
    status: "PLANNING",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        status: initialData.status,
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        status: "PLANNING",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Vui lòng điền Tên Epic.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">
            {initialData ? "Chỉnh sửa Epic" : "Thêm Epic mới"}
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
                Tên Epic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="VD: Authentication System"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Mô tả chức năng/tính năng lớn này..."
              />
            </div>

            {initialData && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EpicStatus })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="PLANNING">Đang lên kế hoạch</option>
                  <option value="IN_PROGRESS">Đang triển khai</option>
                  <option value="DONE">Đã hoàn thành</option>
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
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialData ? "Cập nhật Epic" : "Tạo Epic"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpicFormModal;
