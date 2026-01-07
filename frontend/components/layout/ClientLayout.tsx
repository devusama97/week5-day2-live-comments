"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      <Navbar />
      <div className="flex w-full overflow-x-hidden">
        <Sidebar 
          isMobileSidebarOpen={isMobileSidebarOpen} 
          setIsMobileSidebarOpen={setIsMobileSidebarOpen} 
        />
        <main className="social-main pt-6 w-full min-w-0 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav onMenuClick={() => setIsMobileSidebarOpen(true)} />
    </>
  );
}