"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, Reply, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
    id: string;
    type: "comment" | "reply" | "like";
    message: string;
    userId: string;
    username: string;
    createdAt: string;
    read: boolean;
  };
  onClick?: () => void;
  onDelete?: () => void;
}

export function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "comment":
        return <MessageCircle className="w-6 h-6 text-[#0095f6]" />;
      case "reply":
        return <Reply className="w-6 h-6 text-[#0095f6]" />;
      case "like":
        return <Heart className="w-6 h-6 text-red-500" />;
      default:
        return <Bell className="w-6 h-6 text-[#8e8e8e]" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start space-x-4 p-6 cursor-pointer hover:bg-[#fafafa] transition-colors",
        !notification.read && "bg-[#0095f6]/5 border-l-4 border-l-[#0095f6]"
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-base text-[#262626]">
          {notification.message}
        </p>
        <p className="text-sm social-text-muted mt-2">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {!notification.read && (
        <div className="w-3 h-3 bg-[#0095f6] rounded-full flex-shrink-0 mt-2" />
      )}
      
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-[#8e8e8e] hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}