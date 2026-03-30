export interface Comment {
  id: string;
  _id?: string;
  content: string;
  task: string;
  user: {
    id: string;
    _id?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDTO {
  content: string;
  task: string;
}

export interface UpdateCommentDTO {
  content: string;
}
