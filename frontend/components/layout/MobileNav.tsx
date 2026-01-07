"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/context/NotificationContext";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  User, 
  Menu
} from "lucide-react";

interface MobileNavProps {
  onMenuClick: () => void;
}

const mobileNavigation = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  if (!user || pathname?.startsWith('/auth')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-[#8e8e8e]"
        >
          <Menu className="w-6 h-6" />
          <span className="text-xs mt-1">Menu</span>
        </button>
        
        {mobileNavigation.map((item) => {
          const href = item.href === "/profile" ? `/profile/${user.username}` : item.href;
          const isActive = pathname === href || (item.href === "/" && pathname === "/");
          const isNotifications = item.name === "Notifications";
          
          return (
            <Link
              key={item.name}
              href={href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? "text-[#0095f6]" : "text-[#8e8e8e]"
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}