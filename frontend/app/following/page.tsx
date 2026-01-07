"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { api } from "@/lib/axios";
import { Users, User, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FollowUser {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  followersCount: number;
}

export default function FollowingPage() {
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const response = await api.get("/users/following");
      setFollowing(response.data);
    } catch (error) {
      console.error("Failed to fetch following:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await api.post(`/users/unfollow/${userId}`);
      setFollowing(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Failed to unfollow:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#dbdbdb] w-full">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-[#0095f6]" />
            <div>
              <h1 className="text-2xl font-bold text-[#262626]">Following</h1>
              <p className="social-text-muted">
                You're following {following.length} users
              </p>
            </div>
          </div>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#8e8e8e]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#262626]">Not following anyone yet</h3>
            <p className="social-text-muted mb-6">
              Start following users to see their activity in your feed
            </p>
            <Link href="/comments">
              <button className="social-btn-primary">Discover Users</button>
            </Link>
          </div>
        ) : (
          <div className="w-full px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {following.map((followedUser) => (
                <div key={followedUser._id} className="social-card p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="social-avatar-lg mb-4">
                      {followedUser.profilePicture ? (
                        <img 
                          src={followedUser.profilePicture} 
                          alt={followedUser.username}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        followedUser.username[0]?.toUpperCase()
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1 text-[#262626]">{followedUser.username}</h3>
                    <p className="social-text-muted mb-4">
                      {followedUser.followersCount} followers
                    </p>
                    
                    <div className="flex space-x-2 w-full">
                      <Link href={`/profile/${followedUser.username}`} className="flex-1">
                        <button className="social-btn-secondary w-full text-sm">
                          View Profile
                        </button>
                      </Link>
                      <button 
                        className="social-btn-secondary px-3"
                        onClick={() => handleUnfollow(followedUser._id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}