export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export interface Sprint {
  id?: string;
  _id?: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  project: string;
  tasks?: any[];
  createdBy?: any;
}

export interface CreateSprintDTO {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
}
