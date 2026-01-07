"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { api } from "@/lib/axios";
import { CommentCard } from "@/components/comments/CommentCard";
import { Heart } from "lucide-react";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likes: string[];
  likesCount: number;
  replies: Comment[];
  createdAt: string;
  parentId?: string;
}

export default function LikedPage() {
  const [likedComments, setLikedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLikedComments();
  }, []);

  const fetchLikedComments = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const response = await api.get("/users/liked-comments");
      setLikedComments(response.data);
    } catch (error) {
      console.error("Failed to fetch liked comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      fetchLikedComments(); // Refresh to get updated likes
    } catch (error) {
      console.error("Failed to like comment:", error);
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
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-[#262626]">Liked Comments</h1>
              <p className="social-text-muted">
                Comments you've liked ({likedComments.length})
              </p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="w-full">
          {likedComments.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#8e8e8e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#262626]">No liked comments yet</h3>
              <p className="social-text-muted mb-6">
                Start liking comments to see them here
              </p>
            </div>
          ) : (
            <div className="w-full">
              {likedComments.map((comment) => (
                <div key={comment._id} className="fade-in w-full">
                  <CommentCard
                    comment={comment}
                    onLike={handleLike}
                    currentUserId={user?.id}
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