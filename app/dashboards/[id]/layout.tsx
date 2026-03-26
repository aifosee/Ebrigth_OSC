"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import UserHeader from "@/app/components/UserHeader"; // Add this if you want the blue top bar back!

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* OPTIONAL: Uncomment this if you want the blue header on all dashboard pages! */}
      {/* <UserHeader userName="Admin User" userRole="SUPER_ADMIN" userEmail="admin@ebright.com" /> */}
      
      <div className="flex flex-1 overflow-hidden">
        {/* The Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} onCollapse={() => setSidebarOpen(false)} />
        
        {/* The Actual Page Content (Your HRMS, Library, etc.) */}
        <main className="flex-1 overflow-y-auto p-6 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}