"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useSocket } from "@/context/SocketContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { api } from "@/lib/axios";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
  };
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { decrementCount, resetCount, fetchUnreadCount } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => {
          const exists = prev.some(n => n._id === notification._id);
          if (exists) return prev;
          return [notification, ...prev];
        });
      });
      
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const response = await api.get('/users/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        await api.post(`/users/notifications/${notificationId}/read`);
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? {...n, read: true} : n)
        );
        decrementCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/users/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      resetCount();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#0095f6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="px-4 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Bell className="w-8 h-8 lg:w-10 lg:h-10 text-[#0095f6]" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#262626]">Notifications</h1>
              <p className="social-text-muted text-base lg:text-lg">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="social-btn-secondary flex items-center justify-center space-x-2 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 w-full lg:w-auto"
              >
                <CheckCheck className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Mark all read</span>
              </button>
            )}
            
            {notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications}
                className="p-2 lg:p-3 text-[#8e8e8e] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full lg:w-auto"
                title="Clear all"
              >
                <Trash2 className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="lg:hidden text-sm">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="social-card overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-[#8e8e8e]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#262626]">No notifications yet</h3>
              <p className="social-text-muted text-lg">
                You'll see notifications here when someone interacts with your comments
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#dbdbdb]">
              {notifications.map((notification, index) => (
                <div key={`${notification._id}-${index}`} className="fade-in">
                  <NotificationItem
                    notification={{
                      id: notification._id,
                      type: notification.type as "comment" | "reply" | "like",
                      message: notification.message,
                      userId: notification.sender._id,
                      username: notification.sender.username,
                      createdAt: notification.createdAt,
                      read: notification.read
                    }}
                    onClick={() => markAsRead(notification._id)}
                    onDelete={() => deleteNotification(notification._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}