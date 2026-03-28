import api from "./axios";
import { DashboardStats, ProjectStats, PerformanceReport, TimelineReport } from "../types/stat";

export const getUserDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/stats/dashboard");
  return response.data;
};

export const getProjectStats = async (projectId: string): Promise<ProjectStats> => {
  const response = await api.get(`/stats/project/${projectId}`);
  return response.data;
};

export const getMemberPerformanceReport = async (projectId: string): Promise<PerformanceReport> => {
  const response = await api.get(`/stats/project/${projectId}/performance`);
  return response.data;
};

export const getProjectTimelineReport = async (projectId: string): Promise<TimelineReport> => {
  const response = await api.get(`/stats/project/${projectId}/timeline`);
  return response.data;
};
