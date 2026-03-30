export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface UserSummary {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface TaskLinkedEntity {
  id?: string;
  _id?: string;
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export type TaskEntityRef = string | TaskLinkedEntity | null | undefined;

export interface Task {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  project: string;
  assignee?: UserSummary | null;
  creator: UserSummary;
  sprint?: TaskEntityRef;
  epic?: TaskEntityRef;
  labels?: {
    _id: string;
    name: string;
    color: string;
  }[];
  parentTask?: string | null;
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
  project: string;
  assignee?: string;
  sprint?: string | null;
  epic?: string | null;
  labels?: string[];
  parentTask?: string | null;
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
  parentTask?: string | null;
}

export interface Attachment {
  _id: string;
  task: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: UserSummary;
  createdAt: string;
}
