import api from "./axios";
import { TaskType, CreateTaskTypeDTO } from "../types/taskType";

export const getTaskTypesByProject = async (projectId: string): Promise<TaskType[]> => {
  const response = await api.get(`/task-types/project/${projectId}`);
  return response.data;
};

export const createTaskType = async (projectId: string, data: CreateTaskTypeDTO): Promise<TaskType> => {
  const response = await api.post(`/task-types/project/${projectId}`, data);
  return response.data;
};

export const updateTaskType = async (projectId: string, typeId: string, data: CreateTaskTypeDTO): Promise<TaskType> => {
  const response = await api.put(`/task-types/project/${projectId}/${typeId}`, data);
  return response.data;
};

export const deleteTaskType = async (projectId: string, typeId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/task-types/project/${projectId}/${typeId}`);
  return response.data;
};
