import api from "./axios";
import { Sprint, CreateSprintDTO } from "../types/sprint";

export const getSprintsByProject = async (projectId: string): Promise<Sprint[]> => {
  const response = await api.get(`/projects/${projectId}/sprints`);
  return response.data;
};

export const createSprint = async (projectId: string, data: CreateSprintDTO): Promise<Sprint> => {
  const response = await api.post(`/projects/${projectId}/sprints`, data);
  return response.data;
};

export const addTaskToSprint = async (projectId: string, sprintId: string, taskId: string): Promise<any> => {
  const response = await api.post(`/projects/${projectId}/sprints/${sprintId}/tasks`, { taskId });
  return response.data;
};

export const updateSprint = async (projectId: string, sprintId: string, data: any): Promise<Sprint> => {
  const response = await api.put(`/projects/${projectId}/sprints/${sprintId}`, data);
  return response.data;
};

export const deleteSprint = async (projectId: string, sprintId: string): Promise<any> => {
  const response = await api.delete(`/projects/${projectId}/sprints/${sprintId}`);
  return response.data;
};
