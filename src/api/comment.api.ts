import api from "./axios";
import { Comment, CreateCommentDTO, UpdateCommentDTO } from "../types/comment";

export const getCommentsByTask = async (taskId: string): Promise<Comment[]> => {
  const response = await api.get(`/comments/task/${taskId}`);
  return response.data;
};

export const createComment = async (data: CreateCommentDTO): Promise<Comment> => {
  const response = await api.post("/comments", data);
  return response.data;
};

export const updateComment = async (commentId: string, data: UpdateCommentDTO): Promise<Comment> => {
  const response = await api.put(`/comments/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
