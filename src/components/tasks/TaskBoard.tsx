import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  Search,
  LayoutGrid,
  ListTodo,
  Check,
  X as CloseIcon,
  Settings,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Task, TaskStatus } from "../../types/task";
import { Sprint } from "../../types/sprint";
import { Epic } from "../../types/epic";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "../../api/task.api";
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

// Tối ưu màu sắc nền cột nhạt hơn để tập trung vào Card
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "Cần làm", color: "bg-[#F4F5F7]" },
  { id: "IN_PROGRESS", label: "Đang làm", color: "bg-[#EAE6FF]" },
  { id: "REVIEW", label: "Chờ duyệt", color: "bg-[#FFFAE6]" },
  { id: "DONE", label: "Hoàn thành", color: "bg-[#E3FCEF]" },
];

const getEntityId = (value: any) =>
  String(value?._id || value?.id || value || "");

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
  const [activeDefaultEpicId, setActiveDefaultEpicId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State bật/tắt Panel Epics bên trái
  const [showEpicPanel, setShowEpicPanel] = useState(true);

  // States cho tính năng Quick Create Inline
  const [quickCreateSectionId, setQuickCreateSectionId] = useState<
    string | null
  >(null);
  const [quickCreateTitle, setQuickCreateTitle] = useState("");
  const [isQuickCreating, setIsQuickCreating] = useState(false);

  // State lưu trữ trạng thái Đóng/Mở của các Section (Sprint/Backlog)
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

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
      console.error("Không thể tải danh sách công việc.");
      setError("Không thể tải danh sách công việc.");
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
    return sprints.map((sprint) => ({
      id: String((sprint as any)._id || (sprint as any).id),
      name: sprint.name,
      goal: sprint.goal,
      tasks: filteredTasks.filter(
        (task) =>
          getEntityId(task.sprint) ===
          String((sprint as any)._id || (sprint as any).id),
      ),
    }));
  }, [filteredTasks, sprints]);

  // ======= HANDLERS CHUNG =======
  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setActiveDefaultEpicId(null);
    setIsModalOpen(true);
  };

  const handleAddTaskFromEpic = (epicId: string) => {
    setSelectedTask(null);
    setActiveDefaultEpicId(epicId);
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
        await updateTask(
          (selectedTask.id || selectedTask._id) as string,
          taskData,
        );
      } else {
        await createTask({ ...taskData, project: projectId });
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      alert("Đã có lỗi xảy ra. Kiểm tra lại dữ liệu.");
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
      alert("Không thể xóa công việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======= DRAG & DROP CHO BẢNG KANBAN =======
  const handleDragStartBoard = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId_board", (task.id || task._id) as string);
  };

  const handleDropBoard = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId_board");
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
    } catch (error) {
      setTasks(previousTasks);
      alert("Lỗi chuyển trạng thái.");
    }
  };

  // ======= DRAG & DROP CHO BACKLOG =======
  const handleDragStartBacklog = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId_backlog", (task.id || task._id) as string);
  };

  const handleDropBacklog = async (
    e: React.DragEvent,
    targetSprintId: string | null,
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId_backlog");
    if (!taskId) return;

    const taskToMove = tasks.find((t) => (t.id || t._id) === taskId);
    if (!taskToMove) return;

    const currentSprintId = getEntityId(taskToMove.sprint) || null;
    if (currentSprintId === targetSprintId) return;

    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        (t.id || t._id) === taskId ? { ...t, sprint: targetSprintId } : t,
      ),
    );

    try {
      await updateTask(taskId, { sprint: targetSprintId });
      fetchTasks();
    } catch (error) {
      setTasks(previousTasks);
      alert("Lỗi khi chuyển Sprint.");
    }
  };

  const handleDropToEpic = async (
    e: React.DragEvent,
    targetEpicId: string | null,
  ) => {
    e.preventDefault();
    const taskId =
      e.dataTransfer.getData("taskId_backlog") ||
      e.dataTransfer.getData("taskId_board");
    if (!taskId) return;

    const taskToMove = tasks.find((t) => (t.id || t._id) === taskId);
    if (!taskToMove) return;

    const currentEpicId = getEntityId(taskToMove.epic) || null;
    if (currentEpicId === targetEpicId) return;

    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        (t.id || t._id) === taskId ? { ...t, epic: targetEpicId } : t,
      ),
    );

    try {
      await updateTask(taskId, { epic: targetEpicId });
      fetchTasks();
    } catch (error) {
      setTasks(previousTasks);
      alert("Lỗi khi chuyển Epic.");
    }
  };

  // ======= THÊM NHANH (QUICK CREATE) =======
  const handleQuickCreateSubmit = async (sectionId: string | null) => {
    if (!quickCreateTitle.trim()) {
      setQuickCreateSectionId(null);
      return;
    }
    setIsQuickCreating(true);
    try {
      await createTask({
        title: quickCreateTitle,
        sprint: sectionId,
        project: projectId,
        status: "TODO",
        // Tự động gán Epic nếu đang bật bộ lọc Epic
        epic:
          selectedEpicFilter !== "all" && selectedEpicFilter !== "none"
            ? selectedEpicFilter
            : undefined,
      });
      setQuickCreateTitle("");
      fetchTasks();
    } catch (error) {
      alert(
        "Không thể thêm nhanh công việc. Vui lòng thử dùng nút thêm chi tiết.",
      );
    } finally {
      setIsQuickCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Đang tải...</p>
      </div>
    );
  }

  // ======= RENDER BACKLOG KHU VỰC =======
  const renderBacklogSection = (
    sectionId: string | null,
    title: string,
    subtitle: string,
    sectionTasks: Task[],
    tone: string,
  ) => {
    const isTargeting = quickCreateSectionId === String(sectionId);
    const safeSectionKey = String(sectionId || "backlog");
    const isCollapsed = collapsedSections[safeSectionKey];

    return (
      <div
        key={safeSectionKey}
        className={`rounded-lg border ${tone} overflow-hidden bg-white mb-6 shadow-sm transition-all`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropBacklog(e, sectionId)}
      >
        {/* Header Section - Click để thu gọn/mở rộng */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
          onClick={() => toggleSection(safeSectionKey)}
        >
          <div className="flex items-start gap-2">
            <button className="text-gray-400 mt-0.5 hover:text-gray-700 transition-colors">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                {title}
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {sectionTasks.length}
                </span>
              </h4>
              {subtitle && (
                <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Thân Section - Bị ẩn khi isCollapsed = true */}
        {!isCollapsed && (
          <div className="p-2 min-h-[40px] bg-white">
            {sectionTasks.length === 0 ? (
              <div className="text-center py-6 text-xs font-medium text-gray-400 border-2 border-dashed border-gray-200 rounded-lg mx-2 mb-2 bg-gray-50/50">
                Kéo thả công việc vào đây
              </div>
            ) : (
              <div className="space-y-1">
                {sectionTasks.map((task) => (
                  <div key={task.id || task._id}>
                    <TaskCard
                      task={task}
                      onClick={handleOpenEditModal}
                      onDragStart={handleDragStartBacklog}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Ô Input Thêm Nhanh */}
            {isTargeting ? (
              <div className="mt-2 mx-1 flex items-center gap-2 border-2 border-blue-500 rounded-lg bg-white px-3 py-2 shadow-sm">
                <input
                  autoFocus
                  value={quickCreateTitle}
                  onChange={(e) => setQuickCreateTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickCreateSubmit(sectionId);
                    if (e.key === "Escape") setQuickCreateSectionId(null);
                  }}
                  disabled={isQuickCreating}
                  placeholder="Nhập tên công việc... (Nhấn Enter để lưu)"
                  className="flex-1 text-sm outline-none bg-transparent"
                />
                {isQuickCreating ? (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <>
                    <button
                      onClick={() => handleQuickCreateSubmit(sectionId)}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setQuickCreateSectionId(null)}
                      className="text-gray-400 hover:bg-gray-100 p-1 rounded"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setQuickCreateSectionId(String(sectionId));
                  setQuickCreateTitle("");
                }}
                className="mt-2 ml-1 flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors w-max"
              >
                <Plus className="h-4 w-4" /> Thêm công việc
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-2 flex flex-col h-full bg-white">
      {/* KHU VỰC ĐIỀU KHIỂN */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                viewMode === "board"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Bảng
            </button>
            <button
              onClick={() => setViewMode("backlog")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                viewMode === "backlog"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" /> Backlog
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEpicManagerOpen(true)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[13px] font-semibold rounded-lg border border-purple-100"
            >
              Epics
            </button>
            <button
              onClick={() => setIsSprintManagerOpen(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[13px] font-semibold rounded-lg border border-indigo-100"
            >
              Sprints
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Việc chi tiết
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <select
            value={selectedSprintFilter}
            onChange={(e) => setSelectedSprintFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none"
          >
            <option value="all">Tất cả Sprint</option>
            <option value="none">Chưa vào Sprint</option>
            {sprints.map((s) => (
              <option key={s._id || s.id} value={String(s._id || s.id)}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedEpicFilter}
            onChange={(e) => setSelectedEpicFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none"
          >
            <option value="all">Tất cả Epic</option>
            <option value="none">Không có Epic</option>
            {epics.map((e) => (
              <option key={e._id || e.id} value={String(e._id || e.id)}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex gap-2 mb-4">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-[13px]">{error}</p>
        </div>
      )}

      {/* KHÔNG GIAN KANBAN BOARD & BACKLOG */}
      <div className="flex-1 overflow-hidden min-h-[60vh] bg-gray-50 rounded-xl border border-gray-100 p-2">
        {viewMode === "board" ? (
          <div className="flex gap-4 overflow-x-auto h-full pb-2 custom-scrollbar items-start">
            {COLUMNS.map((column) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === column.id,
              );
              return (
                <div
                  key={column.id}
                  className={`flex-shrink-0 w-[280px] rounded-lg ${column.color} flex flex-col max-h-[75vh]`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropBoard(e, column.id)}
                >
                  <div className="px-3 py-2.5 flex items-center justify-between sticky top-0 z-10">
                    <h4 className="font-bold text-[12px] text-gray-700 uppercase tracking-wider">
                      {column.label}
                    </h4>
                    <span className="bg-white/60 text-gray-600 text-[11px] font-bold px-1.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="px-2 pb-2 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-6 text-[11px] font-medium text-gray-400 border border-dashed border-gray-300/50 rounded-lg mx-1">
                        Thả vào đây
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id || task._id}
                            task={task}
                            onClick={handleOpenEditModal}
                            onDragStart={handleDragStartBoard}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-4 h-full overflow-hidden pb-4">
            {/* CỘT TRÁI: PANEL EPICS (GIỐNG JIRA) */}
            {showEpicPanel && (
              <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm h-full">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Epics
                  </h3>
                  <button
                    onClick={() => setIsEpicManagerOpen(true)}
                    className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg transition-colors"
                    title="Quản lý Epics"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {epics.map((epic) => {
                    const epicId = String(epic._id || epic.id);
                    const isActive = selectedEpicFilter === epicId;
                    return (
                      <div
                        key={epicId}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropToEpic(e, epicId)}
                        onClick={() =>
                          setSelectedEpicFilter(isActive ? "all" : epicId)
                        }
                        className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-purple-50 border-purple-300 shadow-sm"
                            : "bg-white border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-sm font-bold truncate ${isActive ? "text-purple-700" : "text-gray-700"}`}
                          >
                            {epic.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-purple-200 text-purple-800" : "bg-gray-100 text-gray-600"}`}
                          >
                            {epic.tasks?.length || 0}
                          </span>
                        </div>
                        {/* Thanh tiến trình mini */}
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min((epic.tasks?.length || 0) * 10, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Vùng thả để XÓA EPIC khỏi Task */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropToEpic(e, null)}
                    onClick={() => setSelectedEpicFilter("none")}
                    className={`p-3 mt-6 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[80px] ${
                      selectedEpicFilter === "none"
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-600">
                      Issues không có Epic
                    </span>
                    <span className="text-[10px] mt-1 opacity-70">
                      Thả task vào đây để gỡ Epic
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CỘT PHẢI: KHU VỰC SPRINTS VÀ BACKLOG CHÍNH */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
              {/* Nút Bật/Tắt Panel Epic nằm ở góc trên */}
              <div className="mb-4">
                <button
                  onClick={() => setShowEpicPanel(!showEpicPanel)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    showEpicPanel
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {showEpicPanel ? "Ẩn Panel Epics" : "Mở Panel Epics"}
                </button>
              </div>

              {/* Render danh sách Sprints */}
              {sprintBacklogSections.map((section) =>
                renderBacklogSection(
                  section.id,
                  section.name,
                  section.goal || "Chưa có mục tiêu cho sprint này.",
                  section.tasks,
                  "border-indigo-200",
                ),
              )}

              {/* Render Backlog */}
              {renderBacklogSection(
                null,
                "Backlog",
                "Các công việc chưa được phân bổ vào Sprint nào.",
                backlogTasks,
                "border-gray-300",
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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
        defaultEpicId={activeDefaultEpicId}
      />
      <EpicManager
        projectId={projectId}
        isOpen={isEpicManagerOpen}
        onClose={() => setIsEpicManagerOpen(false)}
        onEpicsUpdated={fetchEpics}
        onAddTask={handleAddTaskFromEpic}
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
