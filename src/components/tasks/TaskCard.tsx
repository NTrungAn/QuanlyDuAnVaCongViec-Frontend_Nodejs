import React from "react";
import { Clock, MessageSquare, MoreHorizontal, User } from "lucide-react";
import { Task, TaskPriority } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDragStart }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onClick={() => onClick(task)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority === "URGENT" ? "KHẨN CẤP" : task.priority === "HIGH" ? "CAO" : task.priority === "MEDIUM" ? "TB" : "THẤP"}
        </span>
        <div className="flex flex-wrap gap-1 ml-2">
          {task.epic && (task.epic as any).name && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {(task.epic as any).name}
            </span>
          )}
          {task.sprint && (task.sprint as any).name && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {(task.sprint as any).name}
            </span>
          )}
        </div>
        <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity ml-auto">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h4 className="font-bold text-gray-800 text-sm mb-3 line-clamp-2">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-4 text-gray-500">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${isOverdue ? "text-red-500" : ""}`}>
              <Clock className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}</span>
            </div>
          )}
          {/* Mock indicators for comments/attachments */}
          <div className="flex items-center gap-1 text-xs">
            <MessageSquare className="h-3 w-3" />
            <span>0</span>
          </div>
        </div>

        <div>
          {task.assignee ? (
             <div 
               className="h-6 w-6 rounded-full bg-blue-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-blue-700"
               title={task.assignee.fullName}
             >
               {task.assignee.fullName.substring(0, 2).toUpperCase()}
             </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center" title="Chưa giao việc">
              <User className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
