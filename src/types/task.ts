export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  project: string; // Project ID
  assignee?: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  creator: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  sprint?: string | null;
  epic?: string | null;
  labels?: {
    _id: string;
    name: string;
    color: string;
  }[];
  taskType?: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  commentsCount?: number;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  project: string; // required
  assignee?: string; // User ID
  sprint?: string | null;
  epic?: string | null;
  labels?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string | null;
  sprint?: string | null;
  epic?: string | null;
  labels?: string[];
}
