"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { MessageCircle, Users, Heart, Bell } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0095f6]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Social App</h1>
          <Link href="/auth/login" className="social-btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#262626] mb-2">
          Welcome back, {user?.username}!
        </h1>
      </div>

      <div className="mb-8">
        <div className="social-card p-8">
          <h3 className="font-semibold text-xl mb-6 text-[#262626]">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/comments" className="flex flex-col items-center space-y-4 p-6 rounded-lg hover:bg-[#fafafa] transition-colors">
              <MessageCircle className="w-12 h-12 text-[#0095f6]" />
              <span className="text-base font-medium text-[#262626]">Comments</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center space-y-4 p-6 rounded-lg hover:bg-[#fafafa] transition-colors">
              <Bell className="w-12 h-12 text-[#0095f6]" />
              <span className="text-base font-medium text-[#262626]">Notifications</span>
            </Link>
            <Link href="/following" className="flex flex-col items-center space-y-4 p-6 rounded-lg hover:bg-[#fafafa] transition-colors">
              <Users className="w-12 h-12 text-[#0095f6]" />
              <span className="text-base font-medium text-[#262626]">Following</span>
            </Link>
            <Link href="/liked" className="flex flex-col items-center space-y-4 p-6 rounded-lg hover:bg-[#fafafa] transition-colors">
              <Heart className="w-12 h-12 text-[#0095f6]" />
              <span className="text-base font-medium text-[#262626]">Liked</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}