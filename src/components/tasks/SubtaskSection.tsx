import React, { useState, useEffect } from "react";
import { CheckSquare, Loader2, Plus, GitMerge } from "lucide-react";
import { Task } from "../../types/task";
import { getSubtasks, createSubtask } from "../../api/task.api";

interface SubtaskSectionProps {
  taskId: string;
  projectId: string;
  onEditSubtask?: (task: Task) => void;
}

const SubtaskSection: React.FC<SubtaskSectionProps> = ({ taskId, projectId, onEditSubtask }) => {
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      const data = await getSubtasks(taskId);
      setSubtasks(data);
    } catch (error) {
      console.error("Failed to fetch subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      await createSubtask(taskId, {
        title: newTitle.trim(),
        project: projectId,
        status: "TODO",
        priority: "MEDIUM"
      });
      setNewTitle("");
      fetchSubtasks();
    } catch (error) {
      console.error("Failed to create subtask:", error);
      alert("Không tạo được công việc con. Vui lòng kiểm tra lại quyền.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "TODO": return "bg-gray-100 text-gray-700";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "REVIEW": return "bg-purple-100 text-purple-700";
      case "DONE": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case "TODO": return "Lập KH";
      case "IN_PROGRESS": return "Đang làm";
      case "REVIEW": return "Chờ duyệt";
      case "DONE": return "Xong";
      default: return status;
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-emerald-500" /> Công việc con ({subtasks.length})
        </h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {subtasks.map((st) => (
              <div 
                key={st._id || st.id} 
                onClick={() => onEditSubtask?.(st)}
                className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md bg-white transition-all shadow-sm cursor-pointer"
              >
                <CheckSquare className={`h-4 w-4 shrink-0 transition-colors ${st.status === 'DONE' ? 'text-green-500' : 'text-gray-300 group-hover:text-emerald-400'}`} />
                <span className={`flex-1 text-sm font-medium ${st.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {st.title}
                </span>
                <span className={`px-2 py-1 flex items-center rounded-lg text-[10px] font-black tracking-wider uppercase ${getStatusColor(st.status)}`}>
                  {getStatusText(st.status)}
                </span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-3 relative">
          <div className="flex items-center">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Thêm công việc con mới..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50/80 border border-gray-200 border-dashed rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white focus:border-solid"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="absolute right-2 p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg disabled:opacity-50 transition-colors"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubtaskSection;
