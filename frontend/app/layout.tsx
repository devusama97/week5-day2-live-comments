"use client";

import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social",
  description: "Connect and share with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-white">
                <ClientLayout>{children}</ClientLayout>
              </div>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}