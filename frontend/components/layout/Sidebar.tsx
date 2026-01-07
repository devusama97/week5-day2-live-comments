"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/context/NotificationContext";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageCircle, 
  Bell, 
  User, 
  Settings,
  Users,
  Heart,
  Plus,
  ChevronRight,
  X,
  Menu
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Messages", href: "/comments", icon: MessageCircle },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

const moreItems = [
  { name: "Following", href: "/following", icon: Users },
  { name: "Liked", href: "/liked", icon: Heart },
];

export function Sidebar({ 
  isMobileSidebarOpen, 
  setIsMobileSidebarOpen 
}: {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  if (!user || pathname?.startsWith('/auth')) return null;

  const allNavItems = [
    ...navigation,
    ...moreItems
  ];

  const closeSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex social-sidebar">
        <div className="flex flex-col h-full px-3 py-8">
          {/* Logo */}
          <div className="mb-8 px-3">
            <Link href="/" className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 tracking-tighter font-mono">
              𝕊𝕠𝕔𝕚𝕒𝕝
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex-1">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const href = item.href === "/profile" ? `/profile/${user.username}` : item.href;
                const isActive = pathname === href || (item.href === "/" && pathname === "/");
                const isNotifications = item.name === "Notifications";
                
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? "bg-[#fafafa] font-bold" 
                        : "hover:bg-[#fafafa] font-normal"
                    }`}
                  >
                    <div className="relative">
                      <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
                      {isNotifications && unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-base">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* More Section */}
            <div className="mt-8">
              <div className="px-3 py-2">
                <h3 className="text-sm font-semibold text-[#8e8e8e] uppercase tracking-wide">More</h3>
              </div>
              <nav className="space-y-2">
                {moreItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
                        isActive 
                          ? "bg-[#fafafa] font-bold" 
                          : "hover:bg-[#fafafa] font-normal"
                      }`}
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
                      <span className="text-base">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="mt-auto pt-4 border-t border-[#dbdbdb]">
            <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-[#fafafa]">
              <div className="social-avatar">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#262626] truncate">{user.username}</p>
                <p className="text-xs social-text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" onClick={closeSidebar} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#dbdbdb]">
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-mono" onClick={closeSidebar}>
                  𝕊𝕠𝕔𝕚𝕒𝕝
                </Link>
                <button onClick={closeSidebar} className="p-2 text-[#8e8e8e] hover:text-[#262626]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {allNavItems.map((item) => {
                    const href = item.href === "/profile" ? `/profile/${user.username}` : item.href;
                    const isActive = pathname === href || (item.href === "/" && pathname === "/");
                    const isNotifications = item.name === "Notifications";
                    
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        onClick={closeSidebar}
                        className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-[#fafafa] font-bold" 
                            : "hover:bg-[#fafafa] font-normal"
                        }`}
                      >
                        <div className="relative">
                          <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                          {isNotifications && unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-base">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User Profile Section */}
              <div className="p-4 border-t border-[#dbdbdb]">
                <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-[#fafafa]">
                  <div className="social-avatar">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#262626] truncate">{user.username}</p>
                    <p className="text-xs social-text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}