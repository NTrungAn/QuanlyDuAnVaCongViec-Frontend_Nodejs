export interface TaskType {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  project: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskTypeDTO {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}
