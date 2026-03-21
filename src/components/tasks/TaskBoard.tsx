import React, { useState, useEffect } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "../../types/task";
import { Sprint } from "../../types/sprint";
import { Epic } from "../../types/epic";
import { getTasksByProject, createTask, updateTask, deleteTask } from "../../api/task.api";
import { getSprintsByProject } from "../../api/sprint.api";
import { getEpicsByProject } from "../../api/epic.api";
import TaskCard from "./TaskCard";
import TaskFormModal from "./TaskFormModal";
import SprintManager from "../sprints/SprintManager";
import EpicManager from "../epics/EpicManager";

interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
}

interface TaskBoardProps {
  projectId: string;
  projectMembers: User[];
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "Cần làm", color: "bg-gray-100/50 border-gray-200" },
  { id: "IN_PROGRESS", label: "Đang làm", color: "bg-blue-50/50 border-blue-200" },
  { id: "REVIEW", label: "Chờ duyệt", color: "bg-orange-50/50 border-orange-200" },
  { id: "DONE", label: "Hoàn thành", color: "bg-green-50/50 border-green-200" },
];

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, projectMembers }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals state
  const [isSprintManagerOpen, setIsSprintManagerOpen] = useState(false);
  const [isEpicManagerOpen, setIsEpicManagerOpen] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchSprints();
    fetchEpics();
  }, [projectId]);

  const fetchEpics = async () => {
    try {
      const data = await getEpicsByProject(projectId);
      setEpics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSprints = async () => {
    try {
      const data = await getSprintsByProject(projectId);
      setSprints(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasksByProject(projectId);
      setTasks(data);
    } catch (err: any) {
      setError("Không thể tải danh sách công việc.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (taskData: any) => {
    setIsSubmitting(true);
    try {
      if (selectedTask) {
        // Cập nhật
        await updateTask((selectedTask.id || selectedTask._id) as string, taskData);
      } else {
        // Tạo mới
        await createTask(taskData);
      }
      setIsModalOpen(false);
      fetchTasks(); // Tải lại danh sách
    } catch (error: any) {
      console.error("Failed to save task:", error);
      const errData = error.response?.data;
      const errMsg = errData?.message || (errData?.errors?.join(", ")) || "Đã có lỗi xảy ra. Kiểm tra lại dữ liệu.";
      alert(errMsg);
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      await deleteTask(taskId);
      setIsModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa công việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", (task.id || task._id) as string);
    // Optional: Adding a small drag effect
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const taskToMove = tasks.find((t) => (t.id || t._id) === taskId);
    if (!taskToMove || taskToMove.status === newStatus) return; // Không thay đổi gì

    // Optimistic UI Update: Cập nhật state ngay lập tức để user thấy mượt
    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        (t.id || t._id) === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      // Background sync lên DB
      await updateTask(taskId, { status: newStatus });
    } catch (error: any) {
      // Revert lại nếu API lỗi
      setTasks(previousTasks);
      alert(error.response?.data?.message || "Không thể chuyển trạng thái công việc");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Đang tải công việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex gap-3 mt-6">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <h4 className="font-bold mb-1">Đã có lỗi xảy ra</h4>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-black text-gray-900">Bảng công việc</h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEpicManagerOpen(true)}
            className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl font-bold hover:bg-purple-100 transition-all shadow-sm border border-purple-100"
          >
            Quản lý Epics
          </button>

          <button
            onClick={() => setIsSprintManagerOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
          >
            Quản lý Sprints
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Thêm việc
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 rounded-2xl border ${column.color} flex flex-col max-h-[700px] transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Cột Header */}
              <div className="p-4 flex items-center justify-between border-b border-black/5 bg-white/40 sticky top-0 rounded-t-2xl">
                <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">
                  {column.label}
                </h4>
                <div className="h-6 min-w-[24px] px-1.5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-black text-gray-600">
                  {columnTasks.length}
                </div>
              </div>

              {/* Danh sách Tasks */}
              <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs font-medium text-gray-400 border-2 border-dashed border-gray-300/30 rounded-xl">
                    Chưa có việc nào
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id || task._id}
                      task={task}
                      onClick={handleOpenEditModal}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTask}
        onDelete={handleDeleteTask}
        initialData={selectedTask}
        projectId={projectId}
        projectMembers={projectMembers}
        sprints={sprints}
        epics={epics}
        isSubmitting={isSubmitting}
      />

      {/* Epics Manager Drawer */}
      <EpicManager
        projectId={projectId}
        isOpen={isEpicManagerOpen}
        onClose={() => setIsEpicManagerOpen(false)}
        onEpicsUpdated={fetchEpics}
      />

      {/* Sprint Manager Drawer */}
      <SprintManager
        projectId={projectId}
        isOpen={isSprintManagerOpen}
        onClose={() => setIsSprintManagerOpen(false)}
        onSprintsUpdated={fetchSprints}
      />
    </div>
  );
};

export default TaskBoard;
