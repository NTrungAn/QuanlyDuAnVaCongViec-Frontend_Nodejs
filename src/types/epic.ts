export type EpicStatus = "PLANNING" | "IN_PROGRESS" | "DONE";

export interface Epic {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  status: EpicStatus;
  project: string;
  tasks?: any[];
  createdBy?: any;
}

export interface CreateEpicDTO {
  name: string;
  description?: string;
  status?: EpicStatus;
}
