import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, Target, Loader2, Play, Edit2, Trash2 } from "lucide-react";
import { Sprint, CreateSprintDTO, SprintStatus } from "../../types/sprint";
import { getSprintsByProject, createSprint, updateSprint, deleteSprint } from "../../api/sprint.api";
import SprintFormModal from "./SprintFormModal";

interface SprintManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSprintsUpdated?: () => void;
}

const statusColors: Record<SprintStatus, string> = {
  PLANNED: "bg-gray-100 text-gray-700 border-gray-200",
  ACTIVE: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<SprintStatus, string> = {
  PLANNED: "Lập kế hoạch",
  ACTIVE: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
};

const SprintManager: React.FC<SprintManagerProps> = ({
  projectId,
  isOpen,
  onClose,
  onSprintsUpdated,
}) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSprints();
    }
  }, [isOpen, projectId]);

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const data = await getSprintsByProject(projectId);
      setSprints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setSelectedSprint(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsFormOpen(true);
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Sprint này không? Các công việc bên trong sẽ được chuyển về Backlog.")) return;
    try {
      await deleteSprint(projectId, sprintId);
      fetchSprints();
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa Sprint");
    }
  };

  const handleSubmitSprint = async (data: CreateSprintDTO) => {
    setIsSubmitting(true);
    try {
      if (selectedSprint) {
        await updateSprint(projectId, (selectedSprint.id || selectedSprint._id) as string, data);
      } else {
        await createSprint(projectId, data);
      }
      setIsFormOpen(false);
      fetchSprints();
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể lưu Sprint");
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-xl font-black text-gray-900">Quản lý Sprint</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Các giai đoạn phát triển của dự án</p>
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
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : sprints.length === 0 ? (
            <div className="text-center p-10 bg-white border border-dashed border-gray-200 rounded-3xl">
              <Play className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Chưa có Sprint nào.</p>
              <p className="text-xs text-gray-400 mt-2">Bắt đầu lên kế hoạch bằng cách tạo Sprint đầu tiên!</p>
            </div>
          ) : (
            sprints.map((sprint) => (
              <div
                key={sprint.id || sprint._id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">{sprint.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusColors[sprint.status]}`}>
                    {statusLabels[sprint.status]}
                  </span>
                </div>
                
                {sprint.goal && (
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Target className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p className="leading-relaxed">{sprint.goal}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                    <Calendar className="h-3.5 w-3.5 text-gray-600" />
                    {new Date(sprint.startDate).toLocaleDateString("vi-VN")} - {new Date(sprint.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditForm(sprint)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Chỉnh sửa Sprint"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSprint((sprint.id || sprint._id) as string)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa Sprint"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="font-bold bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    {sprint.tasks?.length || 0} công việc
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button
            onClick={handleOpenCreateForm}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Tạo Sprint mới
          </button>
        </div>
      </div>

      <SprintFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitSprint}
        isSubmitting={isSubmitting}
        initialData={selectedSprint}
      />
    </>
  );
};

export default SprintManager;
