import axiosInstance from "./axios";
import { Label, CreateLabelDto, UpdateLabelDto } from "../types/label";

export const getLabelsByProject = async (projectId: string): Promise<Label[]> => {
  const response = await axiosInstance.get(`/labels/project/${projectId}`);
  return response.data;
};

export const createLabel = async (data: CreateLabelDto): Promise<Label> => {
  const response = await axiosInstance.post("/labels", data);
  return response.data;
};

export const updateLabel = async (id: string, data: UpdateLabelDto): Promise<Label> => {
  const response = await axiosInstance.put(`/labels/${id}`, data);
  return response.data;
};

export const deleteLabel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/labels/${id}`);
};
