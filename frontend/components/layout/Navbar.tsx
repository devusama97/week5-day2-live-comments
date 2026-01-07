"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Search, Heart, MessageCircle } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="social-navbar">
      <div className="max-w-[975px] mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl lg:text-2xl font-bold text-[#262626] tracking-tight">
              Social
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-[268px] mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8e8e8e] w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="w-full h-9 pl-10 pr-3 bg-[#efefef] border-0 rounded-lg text-sm placeholder-[#8e8e8e] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#dbdbdb]"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/" className="hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.005 16.545a2.997 2.997 0 012.997-2.997A2.997 2.997 0 0115 16.545V22h7V12.5L12 3 2 12.5V22h7.005z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                </Link>
                <Link href="/comments" className="hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                </Link>
                <Link href="/liked" className="hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="social-avatar hover:scale-110 transition-transform"
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </button>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                      <div className="absolute right-0 mt-3 w-64 bg-white border border-[#dbdbdb] rounded-lg shadow-lg z-50 py-1">
                        <div className="px-4 py-3 border-b border-[#dbdbdb]">
                          <p className="text-sm font-semibold text-[#262626]">{user.username}</p>
                          <p className="text-xs text-[#8e8e8e]">{user.email}</p>
                        </div>
                        <Link
                          href={`/profile/${user.username}`}
                          className="flex items-center px-4 py-3 text-sm text-[#262626] hover:bg-[#fafafa] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-3 text-sm text-[#262626] hover:bg-[#fafafa] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                        <div className="border-t border-[#dbdbdb] my-1" />
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-[#262626] hover:bg-[#fafafa] transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className="social-btn-secondary text-sm px-6">
                  Log In
                </Link>
                <Link href="/auth/register" className="social-btn-primary text-sm px-6">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}