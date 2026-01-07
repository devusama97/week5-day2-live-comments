"use client";

import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { api } from "@/lib/axios";
import { useState, useEffect, use } from "react";
import { User, Users, MessageCircle, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  followersCount: number;
  followingCount: number;
  commentsCount: number;
  likesReceived: number;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, [resolvedParams.username]);

  const { socket } = useSocket();
  
  useEffect(() => {
    // Listen for socket events to update comment count
    const handleNewComment = (comment: any) => {
      console.log('New comment received:', comment);
      if (profile && user && comment.author._id === user.id) {
        console.log('Updating comment count for own comment');
        setProfile(prev => prev ? {...prev, commentsCount: (prev.commentsCount || 0) + 1} : null);
      }
    };
    
    if (socket) {
      socket.on('new_comment', handleNewComment);
      return () => {
        socket.off('new_comment', handleNewComment);
      };
    }
  }, [socket, profile?._id, user?.id]);

  const fetchProfile = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const response = await api.get(`/users/profile/${resolvedParams.username}`);
      setProfile(response.data);
      
      if (user && response.data._id !== user.id) {
        try {
          const followResponse = await api.get(`/followers/is-following/${response.data._id}`);
          setIsFollowing(followResponse.data.isFollowing);
        } catch (followError) {
          console.log("Follow status check failed, defaulting to false");
          setIsFollowing(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (isFollowing) {
        await api.post(`/users/unfollow/${profile._id}`);
        setProfile(prev => prev ? {...prev, followersCount: prev.followersCount - 1} : null);
      } else {
        await api.post(`/users/follow/${profile._id}`);
        setProfile(prev => prev ? {...prev, followersCount: prev.followersCount + 1} : null);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      fetchProfile(); // Fallback to refresh
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwnProfile = user && profile && (user.id === profile._id || user.username === profile.username);

  return (
    <ProtectedRoute>
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#dbdbdb] w-full">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-[#0095f6]" />
            <div>
              <h1 className="text-2xl font-bold text-[#262626]">{profile.username}</h1>
              <p className="social-text-muted">Profile</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="w-full px-8 py-8">
          <div className="social-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="social-avatar-lg flex-shrink-0">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  profile.username[0]?.toUpperCase()
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                  <h2 className="text-2xl font-bold mb-2 md:mb-0 text-[#262626]">{profile.username}</h2>
                  {isOwnProfile ? (
                    <Link href="/settings">
                      <button className="social-btn-secondary flex items-center justify-center md:justify-start space-x-2 w-full md:w-auto">
                        <Settings className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    </Link>
                  ) : (
                    <button 
                      onClick={handleFollow} 
                      className={`w-full md:w-auto ${isFollowing ? "social-btn-secondary" : "social-btn-primary"}`}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
                
                <div className="flex justify-center md:justify-start space-x-8 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-xl text-[#262626]">{profile.commentsCount || 0}</div>
                    <div className="social-text-muted text-xs md:text-sm">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-[#262626]">{profile.followersCount}</div>
                    <div className="social-text-muted text-xs md:text-sm">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-[#262626]">{profile.followingCount}</div>
                    <div className="social-text-muted text-xs md:text-sm">Following</div>
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="social-text-muted">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="social-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-[#0095f6]" />
                <h3 className="font-semibold text-[#262626]">Recent Comments</h3>
              </div>
              <p className="social-text-muted text-sm">
                {profile.commentsCount > 0 
                  ? `${profile.username} has shared ${profile.commentsCount} comments`
                  : "No comments yet"
                }
              </p>
            </div>

            <div className="social-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-[#0095f6]" />
                <h3 className="font-semibold text-[#262626]">Network</h3>
              </div>
              <p className="social-text-muted text-sm">
                Following {profile.followingCount} users with {profile.followersCount} followers
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}