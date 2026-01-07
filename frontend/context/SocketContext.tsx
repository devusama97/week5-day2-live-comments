"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
}

interface Notification {
  id: string;
  type: "comment" | "reply" | "like";
  message: string;
  userId: string;
  username: string;
  createdAt: string;
  read: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        auth: {
          token: token,
          userId: user.id,
        },
      });

      newSocket.on("notification", (notification: Notification) => {
        console.log('Received notification:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on("follow_notification", (notification: Notification) => {
        console.log('Received follow notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        // Also trigger the general notification event for the notification context
        window.dispatchEvent(new CustomEvent('newNotification'));
      });

      newSocket.on("new_comment", () => {
        console.log('Received new_comment event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("new_reply", () => {
        console.log('Received new_reply event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("like_update", () => {
        console.log('Received like_update event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("like_notification", () => {
        console.log('Received like_notification event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("comment_updated", (data: any) => {
        console.log('Received comment_updated event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("comment_deleted", (data: any) => {
        console.log('Received comment_deleted event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      newSocket.on("commentUpdate", () => {
        console.log('Received commentUpdate event');
        window.dispatchEvent(new CustomEvent("refreshComments"));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}