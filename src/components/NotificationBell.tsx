import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notification.api';
import type { NotificationItem } from '../types/notification';

const socketUrl = 'http://localhost:3000';

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return value;
  }
};

const typeLabel = (type: string) => {
  switch (type) {
    case 'PROJECT_INVITATION':
      return 'Thành viên';
    case 'TASK_CREATED':
    case 'TASK_ASSIGNED':
    case 'TASK_UPDATED':
      return 'Công việc';
    case 'SPRINT_CREATED':
      return 'Sprint';
    case 'EPIC_CREATED':
      return 'Epic';
    default:
      return 'Thông báo';
  }
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  };

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const items = await getNotifications();
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    refreshUnreadCount();
    refreshNotifications();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(socketUrl, {
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('notification:new', (payload: NotificationItem) => {
      setNotifications((current) => [payload, ...current.filter((item) => item.id !== payload.id)].slice(0, 50));
      setUnreadCount((current) => current + 1);
    });

    socket.on('notification:unread-count', () => {
      refreshUnreadCount();
      refreshNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => Number(a.isRead) - Number(b.isRead) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await Promise.all([refreshNotifications(), refreshUnreadCount()]);
    }
  };

  const handleItemClick = async (notification: NotificationItem) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      // ignore
    }

    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-all relative"
        title="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold text-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              <p className="text-xs text-gray-500">Cập nhật realtime về thành viên, công việc, sprint, epic</p>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-4 w-4" />
              Đọc hết
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">Đang tải thông báo...</div>
            ) : sortedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">Chưa có thông báo nào.</div>
            ) : (
              sortedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                          {typeLabel(notification.type)}
                        </span>
                        {!notification.isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                      </div>
                      <p className="text-sm text-gray-800 leading-5">{notification.message}</p>
                      <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                        <span>{notification.sender?.fullName || 'Hệ thống'}</span>
                        <span>•</span>
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
