import api from "./axios";
import { Task, CreateTaskDTO, UpdateTaskDTO, Attachment } from "../types/task";

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const response = await api.get(`/tasks/project/${projectId}`);
  return response.data?.data || response.data || [];
};

export const createTask = async (data: CreateTaskDTO): Promise<Task> => {
  const response = await api.post("/tasks", data);
  return response.data;
};

export const updateTask = async (taskId: string, data: UpdateTaskDTO): Promise<Task> => {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Subtasks
export const createSubtask = async (taskId: string, data: CreateTaskDTO): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/subtasks`, data);
  return response.data;
};

export const getSubtasks = async (taskId: string): Promise<Task[]> => {
  const response = await api.get(`/tasks/${taskId}/subtasks`);
  return response.data?.data || response.data || [];
};

// Attachments
export const uploadAttachment = async (taskId: string, file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAttachments = async (taskId: string): Promise<Attachment[]> => {
  const response = await api.get(`/tasks/${taskId}/attachments`);
  return response.data?.data || response.data || [];
};

export const deleteAttachment = async (taskId: string, attachmentId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  return response.data;
};

