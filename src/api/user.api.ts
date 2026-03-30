import api from "./axios";
import { User, UpdateUserDTO } from "../types/user";

export const getMe = async (): Promise<User> => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateUser = async (userId: string, data: UpdateUserDTO): Promise<User> => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const uploadAvatar = async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/users/${userId}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Admin APIs
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const assignRole = async (userId: string, roles: string[]): Promise<User> => {
  const response = await api.post("/users/assign-role", { userId, roles });
  return response.data;
};
