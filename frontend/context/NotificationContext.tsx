"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSocket } from "./SocketContext";
import { api } from "@/lib/axios";

interface NotificationContextType {
  unreadCount: number;
  incrementCount: () => void;
  decrementCount: () => void;
  resetCount: () => void;
  fetchUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/users/notifications");
        const unread = response.data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification', () => {
        setUnreadCount(prev => prev + 1);
      });
      
      socket.on('follow_notification', () => {
        console.log('Follow notification received in NotificationContext');
        setUnreadCount(prev => prev + 1);
      });
      
      return () => {
        socket.off('notification');
        socket.off('follow_notification');
      };
    }
  }, [socket]);

  const incrementCount = () => setUnreadCount(prev => prev + 1);
  const decrementCount = () => setUnreadCount(prev => Math.max(0, prev - 1));
  const resetCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      incrementCount,
      decrementCount,
      resetCount,
      fetchUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}