import React, { useState, useEffect } from "react";
import {
  X,
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowRight,
  Settings,
} from "lucide-react";
import {
  getStatusesByProject,
  createStatus,
  updateStatus,
  deleteStatus,
  getWorkflowByProject,
  getWorkflowSteps,
  createStep,
  deleteStep,
  setupDefaultWorkflow,
} from "../../api/workflow.api";

interface WorkflowManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onWorkflowChange?: () => void;
}

const PREDEFINED_COLORS = [
  "#F4F5F7",
  "#EAE6FF",
  "#FFFAE6",
  "#E3FCEF",
  "#DEEBFF",
  "#EFEFEF",
  "#FFEBE6",
  "#FFF0B3",
  "#D2F1FF",
  "#E3DEFF",
  "#F3F0FF",
  "#FFF7E6",
];

const CATEGORIES = [
  { id: "TODO", label: "Cần làm", color: "bg-slate-100 text-slate-700" },
  { id: "IN_PROGRESS", label: "Đang làm", color: "bg-blue-100 text-blue-700" },
  { id: "DONE", label: "Hoàn thành", color: "bg-green-100 text-green-700" },
];

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  projectId,
  isOpen,
  onClose,
  onWorkflowChange,
}) => {
  const [activeTab, setActiveTab] = useState<"statuses" | "steps">("statuses");
  const [statuses, setStatuses] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingStatus, setIsCreatingStatus] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusFormData, setStatusFormData] = useState({
    name: "",
    category: "TODO",
    color: PREDEFINED_COLORS[0],
    order: 0,
  });

  const [isCreatingStep, setIsCreatingStep] = useState(false);
  const [stepFormData, setStepFormData] = useState({
    fromStatus: "",
    toStatus: "",
    requiredPermission: "MEMBER",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchData();
    }
  }, [isOpen, projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusesData, workflowData] = await Promise.all([
        getStatusesByProject(projectId),
        getWorkflowByProject(projectId),
      ]);
      // Ensure deterministic ordering on the client in case some `order` are missing
      const sortedStatuses = (statusesData || [])
        .slice()
        .sort((a: any, b: any) => {
          const ao =
            typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
          const bo =
            typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
          if (ao !== bo) return ao - bo;
          if (a.createdAt && b.createdAt)
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          return (a.name || "").localeCompare(b.name || "");
        });
      setStatuses(sortedStatuses);
      setWorkflow(workflowData);

      if (workflowData) {
        const stepsData = await getWorkflowSteps(
          workflowData._id || workflowData.id,
        );
        setSteps(stepsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu Workflow");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createStatus(projectId, statusFormData);
      await fetchData();
      resetStatusForm();
      onWorkflowChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tạo trạng thái");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateStatus(id, statusFormData);
      await fetchData();
      resetStatusForm();
      onWorkflowChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStatus = async (id: string) => {
    if (
      !window.confirm(
        "Xóa trạng thái này có thể ảnh hưởng đến các công việc hiện tại. Tiếp tục?",
      )
    )
      return;
    try {
      await deleteStatus(id);
      await fetchData();
      onWorkflowChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi xóa trạng thái");
    }
  };

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflow) return;
    try {
      setIsSubmitting(true);
      await createStep({
        ...stepFormData,
        workflow: workflow._id || workflow.id,
      });
      await fetchData();
      setIsCreatingStep(false);
      setStepFormData({
        fromStatus: "",
        toStatus: "",
        requiredPermission: "MEMBER",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tạo bước chuyển đổi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStep = async (id: string) => {
    try {
      await deleteStep(id);
      await fetchData();
    } catch (err: any) {
      setError("Lỗi xóa bước chuyển đổi");
    }
  };

  const resetStatusForm = () => {
    setIsCreatingStatus(false);
    setEditingStatusId(null);
    setStatusFormData({
      name: "",
      category: "TODO",
      color: PREDEFINED_COLORS[0],
      order: statuses.length,
    });
  };

  const resetToDefault = async () => {
    if (
      !window.confirm(
        "Hành động này sẽ xóa tất cả trạng thái và quy tắc hiện tại để khôi phục về mặc định. Bạn có chắc chắn?",
      )
    )
      return;
    try {
      setLoading(true);
      await setupDefaultWorkflow(projectId);
      await fetchData();
      onWorkflowChange?.();
    } catch (err: any) {
      setError("Lỗi khi khôi phục mặc định");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 animate-in slide-in-from-right flex flex-col border-l border-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <GitBranch className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Quản lý Workflow
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
              title="Khôi phục quy trình mặc định"
            >
              Đặt lại mặc định
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("statuses")}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "statuses" ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
          >
            Trạng thái (Columns)
          </button>
          <button
            onClick={() => setActiveTab("steps")}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "steps" ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
          >
            Quy tắc chuyển (Transitions)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : activeTab === "statuses" ? (
            <div className="space-y-6">
              {/* Status Form */}
              {isCreatingStatus || editingStatusId ? (
                <form
                  onSubmit={(e) =>
                    editingStatusId
                      ? handleUpdateStatus(e, editingStatusId)
                      : handleCreateStatus(e)
                  }
                  className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4"
                >
                  <h3 className="font-bold text-slate-700">
                    {editingStatusId ? "Sửa trạng thái" : "Thêm trạng thái mới"}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-xl"
                      placeholder="Tên trạng thái (VD: Đang Test)"
                      value={statusFormData.name}
                      onChange={(e) =>
                        setStatusFormData({
                          ...statusFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <select
                      className="w-full px-4 py-2 border rounded-xl bg-white"
                      value={statusFormData.category}
                      onChange={(e) =>
                        setStatusFormData({
                          ...statusFormData,
                          category: e.target.value,
                        })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setStatusFormData({ ...statusFormData, color: c })
                          }
                          className={`w-8 h-8 rounded-full border-2 ${statusFormData.color === c ? "border-blue-500 scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetStatusForm}
                      className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Lưu
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingStatus(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 font-bold"
                >
                  <Plus className="h-5 w-5" /> Thêm trạng thái mới
                </button>
              )}

              {/* Status List */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Danh sách trạng thái ({statuses.length})
                </h3>
                {statuses.map((s) => (
                  <div
                    key={s._id}
                    className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-8 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {s.name}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${CATEGORIES.find((c) => c.id === s.category)?.color}`}
                          >
                            {CATEGORIES.find((c) => c.id === s.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingStatusId(s._id);
                          setStatusFormData({
                            name: s.name,
                            category: s.category,
                            color: s.color,
                            order: s.order,
                          });
                        }}
                        className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(s._id)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Steps Form */}
              {isCreatingStep ? (
                <form
                  onSubmit={handleCreateStep}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4"
                >
                  <h3 className="font-bold text-slate-700">
                    Thêm quy tắc chuyển đổi
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Từ trạng thái
                      </label>
                      <select
                        className="w-full mt-1 px-3 py-2 border rounded-xl bg-white text-sm"
                        value={stepFormData.fromStatus}
                        onChange={(e) =>
                          setStepFormData({
                            ...stepFormData,
                            fromStatus: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Chọn...</option>
                        {statuses.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Đến trạng thái
                      </label>
                      <select
                        className="w-full mt-1 px-3 py-2 border rounded-xl bg-white text-sm"
                        value={stepFormData.toStatus}
                        onChange={(e) =>
                          setStepFormData({
                            ...stepFormData,
                            toStatus: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Chọn...</option>
                        {statuses.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingStep(false)}
                      className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Xác nhận
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingStep(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 font-bold"
                >
                  <Plus className="h-5 w-5" /> Thêm quy tắc chuyển đổi
                </button>
              )}

              {/* Steps List */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Quy tắc hiện tại ({steps.length})
                </h3>
                {steps.map((step) => (
                  <div
                    key={step._id}
                    className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg">
                        {step.fromStatus?.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                        {step.toStatus?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteStep(step._id)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 text-[11px] text-slate-400 flex items-center gap-2">
          <Settings className="h-3 w-3" />
          Mỗi thay đổi ở đây sẽ cập nhật trực tiếp lên bảng Kanban của dự án.
        </div>
      </div>
    </>
  );
};

export default WorkflowManager;
