import React, { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, AlertCircle, Search, LayoutGrid, ListTodo, FolderKanban } from "lucide-react";
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

type ViewMode = "board" | "backlog";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "Cần làm", color: "bg-gray-100/50 border-gray-200" },
  { id: "IN_PROGRESS", label: "Đang làm", color: "bg-blue-50/50 border-blue-200" },
  { id: "REVIEW", label: "Chờ duyệt", color: "bg-orange-50/50 border-orange-200" },
  { id: "DONE", label: "Hoàn thành", color: "bg-green-50/50 border-green-200" },
];

const getEntityId = (value: any) => String(value?._id || value?.id || value || "");
const getEntityName = (value: any, fallback = "") => value?.name || fallback;

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, projectMembers }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSprintFilter, setSelectedSprintFilter] = useState("all");
  const [selectedEpicFilter, setSelectedEpicFilter] = useState("all");

  const [isSprintManagerOpen, setIsSprintManagerOpen] = useState(false);
  const [isEpicManagerOpen, setIsEpicManagerOpen] = useState(false);
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
    setError("");
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        task.title.toLowerCase().includes(keyword) ||
        (task.description || "").toLowerCase().includes(keyword);

      const sprintId = getEntityId(task.sprint);
      const epicId = getEntityId(task.epic);

      const matchesSprint =
        selectedSprintFilter === "all"
          ? true
          : selectedSprintFilter === "none"
            ? !sprintId
            : sprintId === selectedSprintFilter;

      const matchesEpic =
        selectedEpicFilter === "all"
          ? true
          : selectedEpicFilter === "none"
            ? !epicId
            : epicId === selectedEpicFilter;

      return matchesSearch && matchesSprint && matchesEpic;
    });
  }, [tasks, searchTerm, selectedSprintFilter, selectedEpicFilter]);

  const backlogTasks = useMemo(
    () => filteredTasks.filter((task) => !getEntityId(task.sprint)),
    [filteredTasks],
  );

  const sprintBacklogSections = useMemo(() => {
    const mapped = sprints.map((sprint) => ({
      id: String((sprint as any)._id || (sprint as any).id),
      name: sprint.name,
      goal: sprint.goal,
      tasks: filteredTasks.filter((task) => getEntityId(task.sprint) === String((sprint as any)._id || (sprint as any).id)),
    }));

    const otherSprintTasks = filteredTasks.filter((task) => {
      const sprintId = getEntityId(task.sprint);
      return sprintId && !mapped.some((section) => section.id === sprintId);
    });

    if (otherSprintTasks.length > 0) {
      mapped.push({
        id: "other-sprint",
        name: "Sprint khác",
        goal: "",
        tasks: otherSprintTasks,
      });
    }

    return mapped.filter((section) => section.tasks.length > 0);
  }, [filteredTasks, sprints]);

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
        await updateTask((selectedTask.id || selectedTask._id) as string, taskData);
      } else {
        await createTask(taskData);
      }
      setIsModalOpen(false);
      await Promise.all([fetchTasks(), fetchSprints(), fetchEpics()]);
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
      await Promise.all([fetchTasks(), fetchSprints(), fetchEpics()]);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa công việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", (task.id || task._id) as string);
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
    if (!taskToMove || taskToMove.status === newStatus) return;

    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        (t.id || t._id) === taskId ? { ...t, status: newStatus } : t,
      ),
    );

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error: any) {
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

  const renderBacklogSection = (title: string, subtitle: string, sectionTasks: Task[], tone: string) => (
    <div className={`rounded-2xl border ${tone} overflow-hidden bg-white`}>
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-black/5 bg-white/80">
        <div>
          <h4 className="font-black text-gray-900 text-sm uppercase tracking-wide">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="h-7 min-w-[28px] px-2 rounded-full bg-black/5 flex items-center justify-center text-[11px] font-black text-gray-700">
          {sectionTasks.length}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {sectionTasks.length === 0 ? (
          <div className="text-center py-10 text-sm font-medium text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            Không có công việc nào
          </div>
        ) : (
          sectionTasks.map((task) => (
            <TaskCard
              key={task.id || task._id}
              task={task}
              onClick={handleOpenEditModal}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-1 w-fit">
            <button
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === "board"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Bảng công việc
            </button>
            <button
              onClick={() => setViewMode("backlog")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === "backlog"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Backlog
            </button>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            {viewMode === "board"
              ? "Kéo thả công việc giữa các cột để cập nhật trạng thái nhanh."
              : "Backlog hiển thị các công việc chưa vào sprint và nhóm công việc theo từng sprint, gần với cách Jira tổ chức backlog."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={viewMode === "backlog" ? "Tìm trong backlog" : "Tìm trong bảng công việc"}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={selectedSprintFilter}
            onChange={(e) => setSelectedSprintFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả Sprint</option>
            <option value="none">Chưa vào Sprint</option>
            {sprints.map((sprint: any) => (
              <option key={sprint._id || sprint.id} value={String(sprint._id || sprint.id)}>
                {sprint.name}
              </option>
            ))}
          </select>
          <select
            value={selectedEpicFilter}
            onChange={(e) => setSelectedEpicFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả Epic</option>
            <option value="none">Không có Epic</option>
            {epics.map((epic: any) => (
              <option key={epic._id || epic.id} value={String(epic._id || epic.id)}>
                {epic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="px-3 py-1 rounded-full bg-gray-100 font-semibold">Tổng: {filteredTasks.length}</span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">Backlog: {backlogTasks.length}</span>
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold">Sprint có việc: {sprintBacklogSections.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex gap-3 mt-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-bold mb-1">Đã có lỗi xảy ra</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {viewMode === "board" ? (
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.id);

            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 rounded-2xl border ${column.color} flex flex-col max-h-[700px] transition-colors`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-4 flex items-center justify-between border-b border-black/5 bg-white/40 sticky top-0 rounded-t-2xl">
                  <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">
                    {column.label}
                  </h4>
                  <div className="h-6 min-w-[24px] px-1.5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-black text-gray-600">
                    {columnTasks.length}
                  </div>
                </div>

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
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Backlog theo phong cách Jira</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Khu vực trên cùng là các công việc chưa được đưa vào sprint. Bên dưới là các sprint đang có công việc, giúp bạn kiểm thử luồng Agile rõ ràng hơn.
                </p>
              </div>
            </div>
          </div>

          {renderBacklogSection(
            "Backlog",
            "Các công việc chưa được gán vào sprint.",
            backlogTasks,
            "border-indigo-100"
          )}

          {sprintBacklogSections.map((section) =>
            renderBacklogSection(
              section.name,
              section.goal || "Các công việc hiện đang thuộc sprint này.",
              section.tasks,
              "border-purple-100"
            ),
          )}
        </div>
      )}

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

      <EpicManager
        projectId={projectId}
        isOpen={isEpicManagerOpen}
        onClose={() => setIsEpicManagerOpen(false)}
        onEpicsUpdated={fetchEpics}
      />

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
