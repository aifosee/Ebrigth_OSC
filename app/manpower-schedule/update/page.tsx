"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns"; 
import Sidebar from "@/app/components/Sidebar";
import UserHeader from "@/app/components/UserHeader";

// --- IMPORT SHARED CONSTANTS ---
import { 
  SHARED_EMPLOYEES, ALL_BRANCHES, DAYS, WEEKDAY_DAYS, 
  EMPLOYEE_COLORS, COLUMNS, BRANCH_SLOTS_CONFIG, 
  getTimeSlotsForDay, isAdminSlot, 
  SELECT_ARROW_WHITE, SELECT_ARROW_DARK 
} from "@/lib/manpowerUtils";

// --- DATE FORMATTING HELPERS ---
const formatDateString = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch (e) {
    return dateStr;
  }
};

const getDateForDay = (dayName: string, startDateStr: string) => {
  if (!startDateStr) return "";
  try {
    const start = parseISO(startDateStr);
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
// -----------------------------------

// --- HELPER COMPONENT: DETAILED SUMMARY TABLE ---
const SummaryTable = ({ title, data, theme = "blue" }: { title: string, data: any[], theme?: "blue" | "orange" }) => {
  const formatTime = (d: number) => {
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return { h: h, m: m.toString().padStart(2, '0') };
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${theme === "orange" ? "border-orange-200" : "border-slate-200"} bg-white shadow-md w-full flex-1`}>
      <header className={`border-b px-2 py-1.5 text-center ${theme === "orange" ? "bg-orange-600 text-white" : "bg-[#2D3F50] text-white"}`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest">{title}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-[8px] border-collapse">
          <thead className="bg-slate-100 text-slate-600 border-b">
            <tr>
              <th className="p-1.5 border-r text-left w-6">No.</th>
              <th className="p-1.5 border-r text-left">Name</th>
              <th className="p-2 border-r text-center">Coach</th>
              <th className="p-2 border-r text-center">Exec</th>
              <th className="p-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => {
              const c = formatTime(row.coachHrs);
              const e = formatTime(row.execHrs);
              const t = formatTime(row.total);
              return (
                <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                  <td className="p-1.5 border-r text-center text-slate-400 font-bold">{index + 1}</td>
                  <td className="p-1.5 border-r font-black text-slate-700 truncate">{row.name}</td>
                  <td className="p-1.5 border-r text-center">
                    <span className="bg-slate-50 border rounded px-1 py-0.5 text-slate-600 font-bold">{c.h}h {c.m}m</span>
                  </td>
                  <td className="p-1.5 border-r text-center">
                    <span className="bg-slate-50 border rounded px-1 py-0.5 text-slate-600 font-bold">{e.h}h {e.m}m</span>
                  </td>
                  <td className="p-1.5 text-center">
                    <span className={`rounded-lg px-2 py-0.5 font-black border ${theme === "orange" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
                      {t.h}:{t.m}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function UpdateSchedulePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [updatedSelections, setUpdatedSelections] = useState<Record<string, string>>({});
  const [updatedNotes, setUpdatedNotes] = useState<Record<string, string>>({});
  const [dayBranches, setDayBranches] = useState<Record<string, string>>({});
  const [branchStaffData, setBranchStaffData] = useState<Record<string, string[]>>({});
  const [newStaffInput, setNewStaffInput] = useState("");
  const [activeAddingBranch, setActiveAddingBranch] = useState<string>("");
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("branch_custom_staff");
    if (saved) setBranchStaffData(JSON.parse(saved));
  }, []);

  const handleAddStaff = () => {
    if (!activeAddingBranch) { alert("Please select a branch first!"); return; }
    if (newStaffInput.trim()) {
      const currentStaff = branchStaffData[activeAddingBranch] || [];
      if (!currentStaff.includes(newStaffInput.trim())) {
        const newData = { ...branchStaffData, [activeAddingBranch]: [...currentStaff, newStaffInput.trim()] };
        setBranchStaffData(newData);
        localStorage.setItem("branch_custom_staff", JSON.stringify(newData));
        setNewStaffInput("");
      }
    }
  };

  const handleRemoveStaff = (branch: string, name: string) => {
    const updated = (branchStaffData[branch] || []).filter(s => s !== name);
    const newData = { ...branchStaffData, [branch]: updated };
    setBranchStaffData(newData);
    localStorage.setItem("branch_custom_staff", JSON.stringify(newData));
  };

  const handleSelectRecord = (record: any) => {
    setSelectedRecord(record);
    setUpdatedSelections({ ...record.selections });
    setUpdatedNotes({ ...record.notes });
  };

  const handleActualNameSelect = (day: string, targetTime: string, colId: string, name: string) => {
    setUpdatedSelections((prev) => {
      const next = { ...prev };
      const branchForThisDay = dayBranches[day] || selectedRecord.branch;
      if (!name || name === "None") {
        delete next[`${day}-${targetTime}-${colId}`];
        return next;
      }
      getTimeSlotsForDay(day, branchForThisDay).forEach((slot) => {
        next[`${day}-${slot}-${colId}`] = name;
      });
      return next;
    });
  };

  const handleClearDay = (day: string) => {
    if (!window.confirm(`Clear assignments for ${day}?`)) return;
    setUpdatedSelections(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => { if (key.startsWith(`${day}-`)) delete next[key]; });
      return next;
    });
  };

  const handleClearColumn = (day: string, colId: string) => {
    setUpdatedSelections(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => { if (key.startsWith(`${day}-`) && key.endsWith(`-${colId}`)) delete next[key]; });
      return next;
    });
  };

  const calculateHoursForData = (selections: Record<string, string>, isOriginalData = false) => {
    if (!selectedRecord) return [];
    const dataToCalculate = isOriginalData ? (selectedRecord.originalSelections || selectedRecord.selections) : selections;
    if (!dataToCalculate) return [];

    const uniqueEmployeesToTrack: string[] = Array.from(new Set([
      ...SHARED_EMPLOYEES, 
      ...(Object.values(dataToCalculate) as string[])
    ])).filter(e => e && e !== "None");

    const staffStats: Record<string, { coachHrs: number; execHrs: number; total: number }> = {};
    uniqueEmployeesToTrack.forEach(emp => { staffStats[emp] = { coachHrs: 0, execHrs: 0, total: 0 }; });

    DAYS.forEach((day) => {
      const isWeekend = day === "Saturday" || day === "Sunday";
      const dailyTarget = isWeekend ? 10.5 : 5.0;
      const branchForDay = selectedRecord.branch;

      uniqueEmployeesToTrack.forEach((emp) => {
        let coachingHoursForDay = 0;
        let workedThatDay = false;
        getTimeSlotsForDay(day, branchForDay).forEach((slot: string) => {
          COLUMNS.forEach((col) => {
            if (dataToCalculate[`${day}-${slot}-${col.id}`] === emp) {
              workedThatDay = true;
              if (col.type === "coach") coachingHoursForDay += isAdminSlot(slot, branchForDay) ? 0.25 : 1.25;
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

  const handleUpdateSave = () => {
    if (!window.confirm("Save adjustments?")) return;
    const history = JSON.parse(localStorage.getItem("manpower_history") || "[]");
    const newHistory = history.map((h: any) => h.id === selectedRecord.id ? { ...h, selections: updatedSelections, notes: updatedNotes, lastUpdated: new Date().toISOString() } : h);
    localStorage.setItem("manpower_history", JSON.stringify(newHistory));
    alert("Adjustments Saved!");
    setSelectedRecord(null);
  };

  // Prevent accessing localStorage on server-side
  const historyData = useMemo(() => {
    if (isMounted) {
      return JSON.parse(localStorage.getItem("manpower_history") || "[]");
    }
    return [];
  }, [isMounted]);

  if (selectedRecord) {
    
    // FIX: Dynamically build a master list of EVERY employee used in this specific record.
    // This ensures that even if a custom staff member isn't in the branch list yet, 
    // their saved name won't vanish from the dropdown!
    const namesUsedInOriginal = Object.values(selectedRecord.originalSelections || {}).filter(Boolean) as string[];
    const namesUsedInUpdates = Object.values(updatedSelections || {}).filter(Boolean) as string[];
    const globalUsedNames = Array.from(new Set([...namesUsedInOriginal, ...namesUsedInUpdates]));

    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar sidebarOpen={sidebarOpen} onCollapse={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto" style={{ zoom: 0.9 }}>
          <div className="w-full mx-auto">
            
            {/* DETAIL TOP BAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center gap-6 mb-8 sticky top-0 z-50">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-6 py-3 rounded-xl font-bold uppercase transition-colors flex items-center gap-2 shadow-sm"
                >
                  ← Back to List
                </button>
                <div className="h-8 w-px bg-slate-300"></div>
                <h1 className="text-2xl font-black uppercase tracking-wide text-slate-800 leading-none m-0 flex items-center gap-4">
                  <span>Updating: {selectedRecord.branch}</span>
                  {selectedRecord.startDate && selectedRecord.endDate && (
                    <span className="text-sm bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase">
                      {formatDateString(selectedRecord.startDate)} - {formatDateString(selectedRecord.endDate)}
                    </span>
                  )}
                </h1>
              </div>
              <button onClick={handleUpdateSave} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-black uppercase shadow-md transition-colors flex items-center gap-2">
                <span>💾</span> Save Adjustments
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-5 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">STEP 1: SELECT BRANCHES</label>
                <div className="grid grid-cols-1 gap-1">
                  {DAYS.map(day => (
                    <div key={day} className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${activeAddingBranch === dayBranches[day] && dayBranches[day] ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[9px] font-black uppercase w-20">{day}</span>
                      <select value={dayBranches[day] || ""} onChange={(e) => {setDayBranches(p=>({...p, [day]: e.target.value})); setActiveAddingBranch(e.target.value);}} className="text-[9px] bg-transparent font-bold text-blue-600 outline-none">
                        <option value="">Select Branch...</option>
                        {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7 bg-white p-4 rounded-xl shadow-sm border border-orange-200">
                <label className="text-[10px] font-black uppercase text-orange-600 block mb-2 font-bold">STEP 2: ADD STAFF FOR {activeAddingBranch || '...'}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" disabled={!activeAddingBranch} value={newStaffInput} onChange={(e) => setNewStaffInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()} placeholder="Enter name..." className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none" />
                  <button onClick={handleAddStaff} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase">Add Staff</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeAddingBranch && branchStaffData[activeAddingBranch]?.map(s => (
                    <span key={s} className="bg-white text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm flex items-center gap-1.5">{s} <button onClick={() => handleRemoveStaff(activeAddingBranch, s)} className="text-red-400">×</button></span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              {DAYS.map((day) => {
                const branchForThisDay = dayBranches[day] || selectedRecord.branch;
                const slots = getTimeSlotsForDay(day, branchForThisDay);
                
                // FIX: Combine the SHARED employees, the Custom Branch employees, AND anyone who was previously saved to this specific record!
                const activeStaffList = Array.from(new Set([
                    ...SHARED_EMPLOYEES, 
                    ...(branchStaffData[branchForThisDay] || []),
                    ...globalUsedNames
                ]));

                return (
                  <div key={day} className="bg-white rounded-xl shadow-lg p-3 border-t-2 border-orange-500">
                    <div className="relative flex flex-col justify-center items-center mb-3 border-b pb-2 min-h-[30px]">
                      <h2 className="text-lg font-black uppercase text-slate-700 m-0 leading-none">{day}</h2>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {getDateForDay(day, selectedRecord.startDate)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-3 relative">
                      {/* PLANNING SIDE */}
                      <div className="flex-1 opacity-60 flex flex-col min-w-0">
                        <div className="bg-slate-500 p-1.5 text-center font-bold text-[9px] uppercase mb-1 rounded text-white tracking-widest h-8 sticky left-0 right-0 z-30">
                            Planning
                        </div>
                        <div className="overflow-x-auto border rounded relative">
                          <table className="w-full border-collapse text-[9px]" style={{ minWidth: '1500px' }}>
                            <thead>
                              <tr className="bg-slate-700 text-white text-center h-[40px]">
                                <th className="p-1 border border-slate-600 w-32 sticky left-0 z-20 bg-slate-700">
                                  <div className="flex flex-col items-center">
                                      <span>Slot</span>
                                      <span className="text-[6px] invisible py-0.5">CLEAR</span>
                                  </div>
                                </th>
                                {COLUMNS.map(c => (
                                  <th key={c.id} className={`p-1 border border-slate-600 w-24 ${c.type==='exec'?'bg-slate-800':''}`}>
                                    <div className="flex flex-col items-center">
                                        <span>{c.label}</span>
                                        <span className="text-[6px] invisible py-0.5">CLEAR</span>
                                    </div>
                                  </th>
                                ))}
                                <th className="p-1 border border-slate-600 w-40">
                                  <div className="flex flex-col items-center">
                                      <span>Notes</span>
                                      <span className="text-[6px] invisible py-0.5">CLEAR</span>
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {slots.map(slot => (
                                <tr key={slot} className="h-[32px]">
                                  <td className="p-1 border bg-slate-50 font-bold sticky left-0 z-10 h-[32px]">{slot}</td>
                                  {COLUMNS.map(col => {
                                    const name = (selectedRecord.originalSelections || selectedRecord.selections)[`${day}-${slot}-${col.id}`];
                                    return <td key={col.id} className={`p-1 border text-center font-bold h-[32px] ${name ? (EMPLOYEE_COLORS[name] || 'bg-slate-500 text-white') : 'bg-white'}`}>{name || "-"}</td>;
                                  })}
                                  <td className="p-1 border bg-white italic text-slate-400 h-[32px]">...</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ACTUAL SIDE */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="bg-orange-600 p-1.5 flex justify-between items-center mb-1 rounded text-white tracking-widest h-8 sticky left-0 right-0 z-30">
                            <div className="w-fit min-w-[100px] text-[8px] font-black bg-black/10 px-2 py-1 rounded">
                                {branchForThisDay}
                            </div>
                            <span className="font-bold text-[9px] uppercase">Actual</span>
                            <div className="w-24 flex justify-end">
                              <button onClick={() => handleClearDay(day)} className="text-[7px] font-bold bg-orange-800 px-1.5 py-0.5 rounded">CLEAR DAY</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto border rounded relative">
                          <table className="w-full border-collapse text-[9px]" style={{ minWidth: '1500px' }}>
                            <thead>
                              <tr className="bg-[#2D3F50] text-white h-[40px]">
                                <th className="p-1 border border-slate-900 w-32 sticky left-0 z-20 bg-[#2D3F50]">
                                  <div className="flex flex-col items-center">
                                      <span>Slot</span>
                                      <span className="text-[6px] invisible py-0.5">CLEAR</span>
                                  </div>
                                </th>
                                {COLUMNS.map(c => (
                                  <th key={c.id} className={`p-1 border border-slate-900 w-24 ${c.type==='exec'?'bg-slate-700 border-b-2 border-b-blue-400':''}`}>
                                    <div className="flex flex-col items-center">
                                      <span>{c.label}</span>
                                      <button onClick={() => handleClearColumn(day, c.id)} className="text-[6px] text-orange-300 font-bold hover:text-white py-0.5">CLEAR</button>
                                    </div>
                                  </th>
                                ))}
                                <th className="p-1 border border-slate-900 w-40">
                                  <div className="flex flex-col items-center">
                                      <span>Notes</span>
                                      <span className="text-[6px] invisible py-0.5">CLEAR</span>
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {slots.map(slot => (
                                <tr key={slot} className="group h-[32px]">
                                  <td className="p-1 border bg-orange-50 font-bold sticky left-0 z-10 group-hover:bg-orange-100 h-[32px]">{slot}</td>
                                  {COLUMNS.map(col => {
                                    const val = updatedSelections[`${day}-${slot}-${col.id}`] || "";
                                    const others = COLUMNS.filter(c => c.id !== col.id).map(c => updatedSelections[`${day}-${slot}-${c.id}`]).filter(Boolean);
                                    return (
                                      <td key={col.id} className={`p-0 border h-[32px] ${col.type==='exec' ? 'bg-slate-50' : 'bg-white'}`}>
                                        <select value={val} onChange={(e) => handleActualNameSelect(day, slot, col.id, e.target.value)} 
                                          className={`w-full h-full p-1 outline-none font-bold text-center appearance-none block ${val ? (EMPLOYEE_COLORS[val] || 'bg-orange-500 text-white') : 'bg-transparent text-slate-300'}`}>
                                          <option value="">-</option>
                                          {activeStaffList.map(e => <option key={e} value={e} disabled={others.includes(e)} className="text-black">{e}</option>)}
                                        </select>
                                      </td>
                                    );
                                  })}
                                  <td className="p-0 border bg-white h-[32px]">
                                    <textarea value={updatedNotes[`${day}-${slot}-notes`] || ""} onChange={(e) => setUpdatedNotes(p => ({...p, [`${day}-${slot}-notes`]: e.target.value}))} className="w-full h-full p-1 text-[8px] resize-none outline-none italic text-slate-600 block" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-md">
                <h2 className="text-sm font-black text-center uppercase tracking-widest text-slate-800 mb-4">📊 Staff Hours Comparison</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <SummaryTable title="ORIGINAL" data={calculateHoursForData({}, true)} theme="blue" />
                    <SummaryTable title="ADJUSTED" data={calculateHoursForData(updatedSelections, false)} theme="orange" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} onCollapse={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto" style={{ zoom: 0.9 }}>
        <div className="max-w-6xl mx-auto w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 mb-12 sticky top-0 z-50">
              <button
                onClick={() => router.push('/manpower-schedule')}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-md hover:bg-blue-600 transition-colors"
              >
                <span className="text-2xl">👥</span>
                <span className="text-lg font-black uppercase tracking-wide leading-none">HRMS</span>
              </button>
              <div className="h-8 w-px bg-slate-300"></div>
              <h1 className="text-2xl font-black uppercase tracking-wide text-slate-800 leading-none m-0">
                Update Manpower Schedule
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isMounted && historyData.length > 0 ? (
                  historyData.map((record: any) => (
                    <div key={record.id} onClick={() => handleSelectRecord(record)} className="bg-white p-8 rounded-3xl shadow-md border-4 border-transparent hover:border-orange-500 cursor-pointer transition-all flex flex-col justify-center">
                        <h3 className="font-black text-2xl uppercase text-slate-800 mb-2">{record.branch}</h3>
                        <div className="inline-flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase shadow-sm">
                            {/* HERE IS THE FORMATTED DATE IN THE LIST VIEW */}
                            Week Of: {formatDateString(record.startDate)}
                          </span>
                        </div>
                    </div>
                  ))
                ) : isMounted ? (
                  <div className="col-span-1 md:col-span-2 bg-white p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center shadow-sm">
                      <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">No schedules available to update.</p>
                  </div>
                ) : null}
            </div>
        </div>
      </main>
    </div>
  );
}