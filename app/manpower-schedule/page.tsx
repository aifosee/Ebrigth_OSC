"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

export default function ManpowerHub() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if any schedules have been submitted yet
    const history = JSON.parse(localStorage.getItem("manpower_history") || "[]");
    if (history.length > 0) {
      setHasHistory(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 1. Sidebar Included Here */}
      <Sidebar sidebarOpen={sidebarOpen} onCollapse={() => setSidebarOpen(false)} />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* 3. The New Top Bar (HRMS Button + Current Page Name) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 mb-12">
            <button
              onClick={() => router.push('/dashboards/hrms')}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-md hover:bg-blue-600 transition-colors"
            >
              <span className="text-2xl">👥</span>
              <span className="text-lg font-black uppercase tracking-wide leading-none">HRMS</span>
            </button>
            
            <div className="h-8 w-px bg-slate-300"></div> {/* Vertical Divider Line */}
            
            <h1 className="text-2xl font-black uppercase tracking-wide text-slate-800 leading-none m-0">
              Manpower Planning
            </h1>
          </div>

          {/* 4. The Original Cards Grid */}
          <div className={`w-full grid grid-cols-1 ${hasHistory ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-md'} gap-8 text-slate-800`}>
            
            {/* Button 1: Plan New Week */}
            <div onClick={() => router.push("/manpower-schedule/plan-new-week")} className="bg-white p-10 rounded-3xl shadow-xl border-4 border-transparent hover:border-green-500 cursor-pointer transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-green-600 group-hover:text-white transition-all">✍️</div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">Plan New Week</h2>
            </div>

            {hasHistory && (
              <>
                {/* Button 2: Update Manpower Schedule */}
                <div onClick={() => router.push("/manpower-schedule/update")} className="bg-white p-10 rounded-3xl shadow-xl border-4 border-transparent hover:border-orange-500 cursor-pointer transition-all flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-orange-600 group-hover:text-white transition-all">🔄</div>
                  <h2 className="text-2xl font-bold tracking-tight uppercase">Update Manpower Schedule</h2>
                </div>

                {/* Button 3: Archive Overview */}
                <div onClick={() => router.push("/manpower-schedule/archive")} className="bg-white p-10 rounded-3xl shadow-xl border-4 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">📊</div>
                  <h2 className="text-2xl font-bold tracking-tight uppercase">Archive Overview</h2>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}