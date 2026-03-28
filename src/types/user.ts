export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface UpdateUserDTO {
  fullName?: string;
  password?: string;
}

export interface AdminUserUpdateDTO {
  isActive?: boolean;
  roles?: string[];
}
