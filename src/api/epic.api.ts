import api from "./axios";
import { Epic, CreateEpicDTO } from "../types/epic";

export const getEpicsByProject = async (projectId: string): Promise<Epic[]> => {
  const response = await api.get(`/epics/project/${projectId}`);
  return response.data?.data || response.data || [];
};

export const createEpic = async (projectId: string, data: CreateEpicDTO): Promise<Epic> => {
  const response = await api.post(`/projects/${projectId}/epics`, data);
  return response.data;
};

export const updateEpic = async (projectId: string, epicId: string, data: CreateEpicDTO): Promise<Epic> => {
  const response = await api.put(`/projects/${projectId}/epics/${epicId}`, data);
  return response.data;
};

export const deleteEpic = async (projectId: string, epicId: string): Promise<any> => {
  const response = await api.delete(`/projects/${projectId}/epics/${epicId}`);
  return response.data;
};

export const linkTaskToEpic = async (projectId: string, epicId: string, taskId: string): Promise<any> => {
  const response = await api.post(`/projects/${projectId}/epics/${epicId}/tasks`, { taskId });
  return response.data;
};
