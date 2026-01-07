"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { api } from "@/lib/axios";
import { CommentCard } from "@/components/comments/CommentCard";
import { ReplyBox } from "@/components/comments/ReplyBox";
import { MessageCircle, Plus } from "lucide-react";

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

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCommentBox, setShowNewCommentBox] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing comments due to socket event');
      fetchComments();
    };

    window.addEventListener("refreshComments", handleRefresh);
    return () => window.removeEventListener("refreshComments", handleRefresh);
  }, []);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const response = await api.get("/comments");
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = async (content: string) => {
    try {
      const response = await api.post("/comments", { content });
      setComments(prev => [response.data, ...prev]);
      setShowNewCommentBox(false);
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      const response = await api.post(`/comments/reply`, { 
        parentCommentId: commentId, 
        content 
      });
      fetchComments();
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      fetchComments();
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      await api.patch(`/comments/${commentId}`, { content });
      fetchComments();
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#0095f6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="px-4 lg:px-8 py-6 lg:py-8 border-b border-[#dbdbdb] w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 text-[#0095f6]" />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-[#262626]">Comments</h1>
                <p className="social-text-muted text-sm lg:text-base">Join the conversation</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowNewCommentBox(!showNewCommentBox)}
              className="social-btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Comment</span>
            </button>
          </div>
        </div>

        {/* New Comment Box */}
        {showNewCommentBox && (
          <div className="w-full border-b border-[#dbdbdb] px-4 lg:px-8 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="social-avatar">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="font-semibold">{user?.username}</span>
            </div>
            <ReplyBox 
              onSubmit={handleNewComment} 
              placeholder="Share your thoughts..."
            />
          </div>
        )}

        {/* Comments List */}
        <div className="w-full">
          {comments.length === 0 ? (
            <div className="text-center py-16 px-4 lg:px-8">
              <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-[#8e8e8e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#262626]">No comments yet</h3>
              <p className="social-text-muted mb-6">Be the first to start a conversation!</p>
              <button 
                onClick={() => setShowNewCommentBox(true)}
                className="social-btn-primary"
              >
                Write the first comment
              </button>
            </div>
          ) : (
            <div className="w-full">
              {comments.map((comment) => (
                <div key={comment._id} className="fade-in w-full">
                  <CommentCard
                    comment={comment}
                    onReply={handleReply}
                    onLike={handleLike}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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