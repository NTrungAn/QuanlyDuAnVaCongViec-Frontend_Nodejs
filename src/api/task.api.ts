import api from "./axios";
import { Task, CreateTaskDTO, UpdateTaskDTO } from "../types/task";

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
