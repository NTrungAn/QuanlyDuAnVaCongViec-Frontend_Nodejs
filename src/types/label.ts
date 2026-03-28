export interface Label {
  _id: string;
  name: string;
  color: string;
  project: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLabelDto = Pick<Label, "name" | "color" | "project">;
export type UpdateLabelDto = Partial<Pick<Label, "name" | "color">>;
