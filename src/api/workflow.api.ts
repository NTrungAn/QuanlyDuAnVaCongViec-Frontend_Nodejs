import api from "./axios";

export const getStatusesByProject = async (projectId: string) => {
  const response = await api.get(`/workflow/projects/${projectId}/statuses`);
  return response.data;
};

export const createStatus = async (projectId: string, statusData: any) => {
  const response = await api.post(`/workflow/projects/${projectId}/statuses`, statusData);
  return response.data;
};

export const updateStatus = async (statusId: string, statusData: any) => {
  const response = await api.put(`/workflow/statuses/${statusId}`, statusData);
  return response.data;
};

export const deleteStatus = async (statusId: string) => {
  const response = await api.delete(`/workflow/statuses/${statusId}`);
  return response.data;
};

export const getWorkflowByProject = async (projectId: string) => {
  const response = await api.get(`/workflow/projects/${projectId}/workflow`);
  return response.data;
};

export const getWorkflowSteps = async (workflowId: string) => {
  const response = await api.get(`/workflow/workflows/${workflowId}/steps`);
  return response.data;
};

export const createStep = async (stepData: any) => {
  const response = await api.post(`/workflow/workflows/steps`, stepData);
  return response.data;
};

export const deleteStep = async (stepId: string) => {
  const response = await api.delete(`/workflow/workflows/steps/${stepId}`);
  return response.data;
};

export const setupDefaultWorkflow = async (projectId: string) => {
  const response = await api.post(`/workflow/projects/${projectId}/setup-default`);
  return response.data;
};
