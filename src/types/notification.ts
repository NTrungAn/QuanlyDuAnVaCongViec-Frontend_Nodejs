export interface NotificationItem {
  id: string;
  recipient?: string;
  sender?: {
    id?: string;
    fullName?: string;
    avatarUrl?: string | null;
  } | null;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
