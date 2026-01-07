"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ReplyBoxProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

export function ReplyBox({ onSubmit, placeholder = "Write a reply..." }: ReplyBoxProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="social-input flex-1"
      />
      <button type="submit" className="social-btn-primary px-3 py-2" disabled={!content.trim()}>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}