"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { api } from "@/lib/axios";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.put("/users/profile", { username: formData.username, bio: formData.bio });
      setSuccess("Profile updated successfully!");
      
      // Update user context with new data
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/users/me");
        // Trigger a re-fetch of user data by updating localStorage
        localStorage.setItem("user", JSON.stringify(response.data));
        // Reload the page to refresh all components with new user data
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#dbdbdb] w-full">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-[#0095f6]" />
            <div>
              <h1 className="text-2xl font-bold text-[#262626]">Settings</h1>
              <p className="social-text-muted">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="w-full px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="social-card p-8">
              <h2 className="text-xl font-semibold mb-6 text-[#262626]">Profile Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#262626]">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="social-input"
                    placeholder="Your username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#262626]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="social-input opacity-50 cursor-not-allowed"
                    placeholder="Your email"
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#262626]">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="social-input resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="social-btn-primary w-full flex items-center justify-center space-x-2" 
                  disabled={loading}
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}