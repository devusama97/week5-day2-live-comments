"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { ReplyBox } from "./ReplyBox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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

interface CommentCardProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

export function CommentCard({ 
  comment, 
  onReply, 
  onLike, 
  onEdit,
  onDelete,
  currentUserId, 
  level = 0 
}: CommentCardProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleReply = (content: string) => {
    if (onReply) {
      onReply(comment._id, content);
      setShowReplyBox(false);
    }
  };

  const handleEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(comment._id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment._id);
    }
  };

  const isLiked = currentUserId && comment.likes ? comment.likes.includes(currentUserId) : false;
  const isOwner = currentUserId === comment.author._id;

  return (
    <div className={`w-full ${level > 0 ? 'ml-4 lg:ml-8 border-l-2 border-[#dbdbdb] pl-2 lg:pl-4' : ''}`}>
      <div className="w-full bg-white border-b border-[#dbdbdb] py-4 px-4 lg:px-8">
        <div className="flex items-start space-x-3 w-full">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#262626] rounded-full flex items-center justify-center flex-shrink-0">
            {comment.author?.profilePicture ? (
              <img 
                src={comment.author.profilePicture} 
                alt={comment.author?.username || 'User'}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Link href={`/profile/${comment.author?.username || ''}`}>
                  <h4 className="font-semibold text-sm text-[#262626] hover:text-[#0095f6] cursor-pointer truncate">
                    {comment.author?.username || 'Unknown User'}
                  </h4>
                </Link>
                <span className="text-xs text-[#8e8e8e] whitespace-nowrap">
                  {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Unknown time'}
                </span>
              </div>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#8e8e8e] hover:text-[#262626] flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2 w-full">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dbdbdb] rounded-lg bg-[#fafafa] focus:outline-none focus:border-[#0095f6] focus:bg-white text-sm placeholder-[#8e8e8e] resize-none"
                  rows={3}
                  placeholder="Edit your comment..."
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }} className="text-[#262626] border-[#dbdbdb] hover:bg-[#fafafa]">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleEdit} disabled={!editContent.trim()} className="bg-[#0095f6] text-white hover:bg-[#1877f2]">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-2 text-[#262626] w-full break-words">{comment.content}</p>
            )}
            
            <div className="flex items-center space-x-6 mt-3 w-full">
              <LikeButton
                isLiked={isLiked}
                likesCount={comment.likesCount}
                onLike={() => onLike?.(comment._id)}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-[#8e8e8e] hover:text-[#262626] p-0 h-auto font-normal"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
              
              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-[#8e8e8e] hover:text-[#262626] p-0 h-auto font-normal"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showReplyBox && (
          <div className="mt-4 ml-8 lg:ml-13 w-full max-w-full overflow-hidden">
            <ReplyBox onSubmit={handleReply} />
          </div>
        )}
      </div>
      
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="w-full">
          {comment.replies.map((reply) => (
            <CommentCard
              key={`reply-${reply._id}`}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}