import { BASE_URL } from "../api/axios";

/**
 * Tạo URL đầy đủ cho ảnh đại diện hoặc đính kèm.
 * @param path Đường dẫn tương đối từ backend (ví dụ: /api/users/avatars/abc.png)
 * @returns URL đầy đủ (ví dụ: http://localhost:3000/api/users/avatars/abc.png)
 */
export const getAvatarUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  // Nếu path bắt đầu bằng /, chỉ cần nối BASE_URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Tiện ích cho file đính kèm
 */
export const getFileUrl = (path: string): string => {
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};
