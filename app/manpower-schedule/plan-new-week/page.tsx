"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns";
import WeekSelector from "@/app/components/WeekSelector";
import Sidebar from "@/app/components/Sidebar";

// --- IMPORT SHARED CONSTANTS ---
import { 
  SHARED_EMPLOYEES, ALL_BRANCHES, DAYS, WEEKDAY_DAYS, 
  EMPLOYEE_COLORS, COLUMNS, BRANCH_SLOTS_CONFIG, 
  getTimeSlotsForDay, isAdminSlot, 
  SELECT_ARROW_WHITE, SELECT_ARROW_DARK 
} from "@/lib/manpowerUtils";


// --- HELPER COMPONENT: SUMMARY TABLE ---
const SummaryTable = ({ title, data }: { title: string, data: any[] }) => {
  const formatTime = (d: number) => {
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return { h: h.toString(), m: m.toString().padStart(2, '0') };
  };
  return (
    <div className="mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-md overflow-hidden text-slate-800">
      <header className="border-b border-slate-200 pb-4 mb-4 text-center">
        <h2 className="m-0 text-xl font-black uppercase tracking-widest text-slate-800">{title}</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-[60px] border border-slate-300 bg-[#2D3F50] p-3 text-white font-bold text-center">No.</th>
              <th className="w-[250px] border border-slate-300 bg-[#2D3F50] p-3 text-white font-bold text-left">Name</th>
              <th className="w-[240px] border border-slate-300 bg-[#2D3F50] p-3 text-white font-bold text-center">Class (Coach)</th>
              <th className="w-[240px] border border-slate-300 bg-[#2D3F50] p-3 text-white font-bold text-center">Executive</th>
              <th className="w-[240px] border border-slate-300 bg-[#2D3F50] p-3 text-white font-bold text-center">Total (hrs:min)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const c = formatTime(row.coachHrs);
              const e = formatTime(row.execHrs);
              const t = formatTime(row.total);
              return (
                <tr key={row.name} className="even:bg-slate-50 hover:bg-slate-100 transition-colors">
                  <td className="border border-slate-300 px-3 py-3 text-center font-bold text-slate-500">{index + 1}</td>
                  <td className="border border-slate-300 px-3 py-3 font-black text-slate-800">{row.name}</td>
                  {[c, e, t].map((time, i) => (
                    <td key={i} className={`border border-slate-300 px-2 py-3 ${i === 2 ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex flex-row gap-4 items-center justify-center">
                        <div className="flex items-baseline gap-1 bg-white border border-slate-200 px-2 py-1 rounded">
                          <span className="text-sm font-bold text-slate-700">{time.h}</span>
                          <span className="text-[9px] uppercase font-black text-slate-400">hrs</span>
                        </div>
                        <div className="flex items-baseline gap-1 bg-white border border-slate-200 px-2 py-1 rounded">
                          <span className="text-sm font-bold text-slate-700">{time.m}</span>
                          <span className="text-[9px] uppercase font-black text-slate-400">min</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function PlanNewWeekPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [hasConfirmedBranch, setHasConfirmedBranch] = useState(false);
  const [hasConfirmedWeek, setHasConfirmedWeek] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingDays, setEditingDays] = useState<Record<string, boolean>>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: true }), {})
  );
  
  const [branchStaffData, setBranchStaffData] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (startDateStr && endDateStr) {
      setHasConfirmedWeek(true);
      const history = JSON.parse(localStorage.getItem("manpower_history") || "[]");
      const record = history.find((h: any) => h.startDate === startDateStr);
      if (record && searchParams.get("view") === "archive") {
        setSelections(record.selections || {});
        setNotes(record.notes || {});
        setSelectedBranch(record.branch);
        setHasConfirmedBranch(true);
        setIsLocked(true);
      }
    } else {
      setHasConfirmedWeek(false);
    }
  }, [startDateStr, endDateStr, searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem("branch_custom_staff");
    if (saved) setBranchStaffData(JSON.parse(saved));
  }, []);

  // Format Helper: Get the exact date (dd MMM yyyy) for a specific day of the week
  const getDateForDay = (dayName: string) => {
    if (!startDateStr) return "";
    try {
      const start = parseISO(startDateStr);
      // Iterate through the 7 days of the week to find the matching day name
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(start, i);
        if (format(currentDate, "EEEE").toLowerCase() === dayName.toLowerCase()) {
          return format(currentDate, "dd MMM yyyy");
        }
      }
    } catch (error) {
      return "";
    }
    return "";
  };

  const clearAllForDay = (day: string) => {
    if (isLocked) return;
    if (window.confirm(`Are you sure you want to clear all selections for ${day}?`)) {
      setSelections((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => { if (key.startsWith(`${day}-`)) delete next[key]; });
        return next;
      });
      setNotes((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => { if (key.startsWith(`${day}-`)) delete next[key]; });
        return next;
      });
    }
  };

  const clearColumnForDay = (day: string, columnId: string) => {
    if (isLocked) return;
    setSelections((prev) => {
      const next = { ...prev };
      getTimeSlotsForDay(day, selectedBranch).forEach((slot) => { delete next[`${day}-${slot}-${columnId}`]; });
      return next;
    });
  };

  const handleNameSelect = (day: string, targetTime: string, columnId: string, name: string) => {
    if (isLocked) return;
    
    setSelections((prev) => {
      const next = { ...prev };
      if (!name) {
        delete next[`${day}-${targetTime}-${columnId}`];
        return next;
      }
      getTimeSlotsForDay(day, selectedBranch).forEach((slot) => {
        next[`${day}-${slot}-${columnId}`] = name;
      });
      return next;
    });
  };

  const handleNoteChange = (day: string, time: string, value: string) => {
    if (isLocked) return;
    setNotes((prev) => ({ ...prev, [`${day}-${time}-notes`]: value }));
  };

  const calculateStaffHours = () => {
    const selectedInSlots = Object.values(selections).filter(val => val !== "" && val !== "None");
    const uniqueEmployeesToTrack = Array.from(new Set([...SHARED_EMPLOYEES, ...selectedInSlots]));

    const staffStats: Record<string, { coachHrs: number; execHrs: number; total: number }> = {};
    uniqueEmployeesToTrack.forEach(emp => { staffStats[emp] = { coachHrs: 0, execHrs: 0, total: 0 }; });

    DAYS.forEach((day) => {
      const isWeekend = day === "Saturday" || day === "Sunday";
      const dailyTarget = isWeekend ? 10.5 : 5.0; 
      
      uniqueEmployeesToTrack.forEach((emp) => {
        let coachingHoursForDay = 0;
        let workedThatDay = false;
        
        getTimeSlotsForDay(day, selectedBranch).forEach((slot) => {
          COLUMNS.forEach((col) => {
            if (selections[`${day}-${slot}-${col.id}`] === emp) {
              workedThatDay = true;
              if (col.type === "coach") {
                  coachingHoursForDay += isAdminSlot(slot, selectedBranch) ? 0.25 : 1.25;
              }
            }
          });
        });
        
        if (workedThatDay) {
          staffStats[emp].coachHrs += coachingHoursForDay; 
          staffStats[emp].execHrs += Math.max(0, dailyTarget - coachingHoursForDay);
          staffStats[emp].total = staffStats[emp].coachHrs + staffStats[emp].execHrs;
        }
      });
    });
    
    return Object.entries(staffStats).map(([name, stats]) => ({ name, ...stats }));
  };

  const handleFinalSubmit = () => {
    if (!window.confirm("Submit final schedule? This will lock the original record.")) return;

    const history = JSON.parse(localStorage.getItem("manpower_history") || "[]");
    const existingIndex = history.findIndex((h: any) => h.id === `${selectedBranch}_${startDateStr}`);
    
    if (existingIndex !== -1) {
      if (!window.confirm("A record for this branch and week already exists. Overwrite the ORIGINAL record? (This is usually not recommended)")) {
        return;
      }
    }

    const snapshot = {
      id: `${selectedBranch}_${startDateStr}`, 
      branch: selectedBranch,
      startDate: startDateStr,
      endDate: endDateStr,
      selections: { ...selections }, 
      notes: { ...notes },
      originalSelections: { ...selections }, 
      originalNotes: { ...notes },
      status: "Finalized",
      submittedAt: new Date().toISOString(),
      originalAuthor: "Admin User", 
    };

    let newHistory;
    if (existingIndex !== -1) {
      newHistory = [...history];
      newHistory[existingIndex] = snapshot;
    } else {
      newHistory = [snapshot, ...history];
    }

    localStorage.setItem("manpower_history", JSON.stringify(newHistory));
    alert("Schedule Finalized and Archived!");
    router.push("/manpower-schedule");
  };

  const branchSpecificStaff = branchStaffData[selectedBranch] || [];
  const activeStaffList = Array.from(new Set([...SHARED_EMPLOYEES, ...branchSpecificStaff]));

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} onCollapse={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto flex flex-col" style={{ zoom: 0.9 }}>
        <div className="w-full mx-auto flex-1 flex flex-col">
          
          {/* THE TOP BAR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center mb-8 sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push('/manpower-schedule')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-md hover:bg-blue-600 transition-colors"
                >
                  <span className="text-2xl">👥</span>
                  <span className="text-lg font-black uppercase tracking-wide leading-none">HRMS</span>
                </button>
                
                <div className="h-8 w-px bg-slate-300"></div>
                
                <h1 className="text-2xl font-black uppercase tracking-wide text-slate-800 leading-none m-0 flex items-center gap-4">
                  <span>Plan New Week {hasConfirmedBranch && `- ${selectedBranch}`}</span>
                  
                  {/* Overall Week Range Tag in Top Bar */}
                  {hasConfirmedWeek && startDateStr && endDateStr && (
                    <span className="text-sm bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase">
                      {format(parseISO(startDateStr), "dd MMM yyyy")} - {format(parseISO(endDateStr), "dd MMM yyyy")}
                    </span>
                  )}
                </h1>
            </div>

            {/* Change Branch Button */}
            {hasConfirmedBranch && !hasConfirmedWeek && (
              <button 
                onClick={() => setHasConfirmedBranch(false)} 
                className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-6 py-3 rounded-xl font-bold uppercase transition-colors shadow-sm"
              >
                ← Change Branch
              </button>
            )}
          </div>

          {/* DYNAMIC CONTENT AREA */}
          {!hasConfirmedBranch ? (
            
            // STEP 1: SELECT BRANCH
            <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] w-full">
              <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 text-center text-slate-800">
                <h2 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tight">Select Branch</h2>
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full p-4 border-2 border-slate-200 rounded-xl bg-slate-50 mb-6 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors">
                  <option value="">-- Choose Branch --</option>
                  {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button disabled={!selectedBranch} onClick={() => setHasConfirmedBranch(true)} className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 disabled:bg-slate-300 uppercase tracking-widest transition-colors shadow-md">
                  Continue
                </button>
              </div>
            </div>

          ) : !hasConfirmedWeek ? (

            // STEP 2: SELECT WEEK
            <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] w-full text-slate-800">
              <WeekSelector onConfirm={(wd) => router.push(`/manpower-schedule/plan-new-week?${wd}`)} />
            </div>

          ) : (

            // STEP 3: THE ACTUAL TABLES
            <div className="space-y-10 mb-20">
              {isLocked && (
                 <div className="bg-slate-800 text-white p-4 rounded-xl flex justify-between items-center shadow-xl">
                   <span className="font-bold uppercase tracking-widest text-sm">🔒 Archived Record (Read-Only)</span>
                   <button onClick={() => setIsLocked(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black text-xs uppercase hover:bg-blue-500">Edit</button>
                 </div>
              )}

              {DAYS.map((day) => {
                const isEditing = !!editingDays[day] && !isLocked;
                return (
                  <div key={day} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    
                    {/* Day Header with Formatting */}
                    <header className="bg-white p-4 border-b flex justify-between items-center relative">
                      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <h2 className="text-xl font-black uppercase text-slate-800 m-0 leading-none">{day}</h2>
                        {/* THE DYNAMIC DATE IS ADDED HERE */}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {getDateForDay(day)}
                        </span>
                      </div>
                      
                      <div className="flex-1"></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {!isLocked && isEditing && (
                          <button onClick={() => clearAllForDay(day)} className="text-red-500 font-bold uppercase text-xs hover:underline">Clear All</button>
                        )}
                        {isEditing ? 
                          <button onClick={() => setEditingDays(p => ({...p, [day]: false}))} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase shadow-sm transition-colors">Save Day</button> :
                          <button onClick={() => setEditingDays(p => ({...p, [day]: true}))} className="text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-bold text-xs uppercase transition-colors">Edit Day</button>
                        }
                      </div>
                    </header>
                    
                    {/* The Table */}
                    <div className="overflow-x-auto relative">
                      <table className="w-full border-collapse" style={{ minWidth: '1900px' }}>
                        <thead className="bg-[#2D3F50] text-white text-[10px] uppercase tracking-widest">
                          <tr>
                            <th className="p-3 text-left w-[180px] sticky left-0 z-20 bg-[#2D3F50] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] border-r border-slate-600">
                              Time Slot
                            </th>
                            {COLUMNS.map(col => (
                              <th key={col.id} className={`p-3 text-center border-l border-slate-600 w-[150px] ${col.type === 'exec' ? 'bg-slate-700 border-b-4 border-b-blue-400' : ''}`}>
                                <div className="flex flex-col items-center gap-1">
                                  <span>{col.label}</span>
                                  {!isLocked && isEditing && (
                                    <button onClick={() => clearColumnForDay(day, col.id)} className="text-[8px] text-orange-300 font-bold hover:text-white uppercase px-2 py-0.5 rounded transition-colors bg-slate-600">CLEAR</button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th className="p-3 text-center border-l border-slate-600 w-[250px]">Notes/Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getTimeSlotsForDay(day, selectedBranch).map(slot => (
                            <tr key={slot} className="border-b hover:bg-slate-50 transition-colors group">
                              <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-xs sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-100 transition-colors">
                                  {slot}
                              </td>
                              {COLUMNS.map(col => {
                                const val = selections[`${day}-${slot}-${col.id}`] || "";
                                const otherNamesInThisSlot = COLUMNS.filter(c => c.id !== col.id).map(c => selections[`${day}-${slot}-${c.id}`]).filter(Boolean);

                                return (
                                  <td key={col.id} className={`p-1.5 border-l ${col.type === 'exec' ? 'bg-slate-50' : ''}`}>
                                    <select disabled={!isEditing} value={val} onChange={(e) => handleNameSelect(day, slot, col.id, e.target.value)} 
                                      className={`w-full p-2 rounded appearance-none text-center font-bold transition-all text-xs ${val ? (EMPLOYEE_COLORS[val] || "bg-orange-500 text-white border-transparent") : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                      style={{ backgroundImage: `url("${val ? SELECT_ARROW_WHITE : SELECT_ARROW_DARK}")`, backgroundPosition: "right 0.3rem center", backgroundSize: "8px", backgroundRepeat: "no-repeat" }}>
                                      <option value="">None</option>
                                      {activeStaffList.map(e => (
                                        <option key={e} value={e} disabled={otherNamesInThisSlot.includes(e)} className="text-slate-800 font-bold">
                                          {e}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                );
                              })}
                              <td className="p-1.5 border-l w-[250px] bg-white">
                                <textarea disabled={!isEditing} value={notes[`${day}-${slot}-notes`] || ""} onChange={(e) => handleNoteChange(day, slot, e.target.value)}
                                  placeholder="Add remarks..." className="w-full p-2 text-xs border border-slate-200 rounded bg-white resize-none h-[38px] overflow-y-auto outline-none focus:border-blue-500 transition-all font-medium italic text-slate-600 block" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              <SummaryTable title="Weekly Hours Summary" data={calculateStaffHours()} />

              {!isLocked && (
                <div className="mt-16 text-center pb-10">
                   <button onClick={handleFinalSubmit} className="bg-green-600 hover:bg-green-700 text-white px-20 py-5 rounded-2xl text-xl font-black shadow-xl uppercase tracking-widest transition-transform hover:scale-105">
                     🚀 Final Submit & Archive
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}