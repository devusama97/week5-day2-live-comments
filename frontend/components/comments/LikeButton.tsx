"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
}

export function LikeButton({ isLiked, likesCount, onLike }: LikeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onLike}
      className={cn(
        "text-[#8e8e8e] hover:text-[#262626] transition-colors p-0 h-auto font-normal",
        isLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart 
        className={cn(
          "w-4 h-4 mr-1 transition-all",
          isLiked && "fill-current scale-110"
        )} 
      />
      {likesCount > 0 && <span>{likesCount}</span>}
    </Button>
  );
}