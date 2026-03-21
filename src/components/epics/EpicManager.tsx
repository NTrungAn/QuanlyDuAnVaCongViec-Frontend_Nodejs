import React, { useState, useEffect } from "react";
import { X, Plus, Target, Loader2, Edit2, Trash2 } from "lucide-react";
import { Epic, CreateEpicDTO, EpicStatus } from "../../types/epic";
import { getEpicsByProject, createEpic, updateEpic, deleteEpic } from "../../api/epic.api";
import EpicFormModal from "./EpicFormModal";

interface EpicManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onEpicsUpdated?: () => void;
}

const statusColors: Record<EpicStatus, string> = {
  PLANNING: "bg-gray-100 text-gray-700 border-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<EpicStatus, string> = {
  PLANNING: "Kế hoạch",
  IN_PROGRESS: "Đang triển khai",
  DONE: "Hoàn thành",
};

const EpicManager: React.FC<EpicManagerProps> = ({
  projectId,
  isOpen,
  onClose,
  onEpicsUpdated,
}) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEpics();
    }
  }, [isOpen, projectId]);

  const fetchEpics = async () => {
    setLoading(true);
    try {
      const data = await getEpicsByProject(projectId);
      setEpics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEpic = async (data: CreateEpicDTO) => {
    setIsSubmitting(true);
    try {
      if (editingEpic) {
        await updateEpic(projectId, (editingEpic.id || editingEpic._id) as string, data);
      } else {
        await createEpic(projectId, data);
      }
      setIsFormOpen(false);
      setEditingEpic(null);
      fetchEpics();
      if (onEpicsUpdated) onEpicsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi thao tác Epic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpic = async (epicId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Epic này không? Các công việc trong Epic này sẽ chuyển sang trạng thái không thuộc Epic nào.")) return;
    try {
      await deleteEpic(projectId, epicId);
      fetchEpics();
      if (onEpicsUpdated) onEpicsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi xóa Epic");
    }
  };

  const openCreateForm = () => {
    setEditingEpic(null);
    setIsFormOpen(true);
  };

  const openEditForm = (epic: Epic) => {
    setEditingEpic(epic);
    setIsFormOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Quản lý Epic</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Các Cột mốc / Tính năng lớn</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/20">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : epics.length === 0 ? (
            <div className="text-center p-10 bg-white border border-dashed border-gray-200 rounded-3xl">
              <Target className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Chưa có Epic nào.</p>
              <p className="text-xs text-gray-400 mt-2">Bắt đầu nhóm các công việc lớn bằng cách tạo Epic!</p>
            </div>
          ) : (
            epics.map((epic) => (
              <div
                key={epic.id || epic._id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 text-lg pr-12">{epic.name}</h4>
                  <span className={`text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded-full border ${statusColors[epic.status]}`}>
                    {statusLabels[epic.status]}
                  </span>
                </div>
                
                {epic.description && (
                  <div className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {epic.description}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="font-bold text-xs bg-purple-50 text-purple-600 px-2.5 py-1.5 rounded-lg border border-purple-100">
                    {epic.tasks?.length || 0} công việc
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(epic)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa Epic"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEpic((epic.id || epic._id) as string)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa Epic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button
            onClick={openCreateForm}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Tạo Epic mới
          </button>
        </div>
      </div>

      <EpicFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitEpic}
        isSubmitting={isSubmitting}
        initialData={editingEpic}
      />
    </>
  );
};

export default EpicManager;
