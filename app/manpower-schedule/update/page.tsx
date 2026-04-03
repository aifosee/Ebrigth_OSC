"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns"; 
import { DateRange, RangeKeyDict } from "react-date-range"; 
import { useSession } from "next-auth/react";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 
import Sidebar from "@/app/components/Sidebar";

// --- IMPORT SHARED CONSTANTS ---
import {
  SHARED_EMPLOYEES, ALL_BRANCHES, COLUMNS,
  getTimeSlotsForDay, isAdminSlot, getStaffColorByIndex,
  getWorkingDaysForBranch, isOpeningClosingSlot,
  isManagerOnDutySlot, SELECT_ARROW_WHITE, SELECT_ARROW_DARK
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

// --- HELPER COMPONENT: DETAILED SUMMARY TABLE ---
const SummaryTable = ({ title, data, theme = "blue" }: { title: string, data: any[], theme?: "blue" | "orange" }) => {
  const formatTime = (d: number) => {
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return { h: h, m: m.toString().padStart(2, '0') };
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${theme === "orange" ? "border-orange-200" : "border-slate-200"} bg-white shadow-md w-full flex-1`}>
      <header className={`border-b px-3 py-2 text-center ${theme === "orange" ? "bg-orange-600 text-white" : "bg-[#2D3F50] text-white"}`}>
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse"> {/* Increased font size to text-xs (12px) */}
          <thead className="bg-slate-100 text-slate-600 border-b">
            <tr>
              <th className="p-3 border-r text-left w-10">No.</th>
              <th className="p-3 border-r text-left">Name</th>
              <th className="p-3 border-r text-center">Coach</th>
              <th className="p-3 border-r text-center">Exec</th>
              <th className="p-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => {
              const c = formatTime(row.coachHrs);
              const e = formatTime(row.execHrs);
              const t = formatTime(row.total);
              return (
                <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 border-r text-center text-slate-400 font-bold">{index + 1}</td>
                  <td className="p-3 border-r font-black text-slate-700 truncate">{row.name}</td>
                  <td className="p-3 border-r text-center">
                    <span className="bg-slate-50 border rounded px-2 py-1 text-slate-600 font-bold">{c.h}h {c.m}m</span>
                  </td>
                  <td className="p-3 border-r text-center">
                    <span className="bg-slate-50 border rounded px-2 py-1 text-slate-600 font-bold">{e.h}h {e.m}m</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`rounded-lg px-3 py-1 font-black border ${theme === "orange" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
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
  const { data: session } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [updatedSelections, setUpdatedSelections] = useState<Record<string, string>>({});
  const [updatedNotes, setUpdatedNotes] = useState<Record<string, string>>({});
  const [branchStaffData, setBranchStaffData] = useState<Record<string, string[]>>({});
  const [branchManagerData, setBranchManagerData] = useState<Record<string, string[]>>({});
  const [columnReplacementBranch, setColumnReplacementBranch] = useState<Record<string, string>>({});
  const [managerReplacementBranch, setManagerReplacementBranch] = useState<Record<string, string>>({});
  const [scheduledElsewhere, setScheduledElsewhere] = useState<Record<string, Record<string, Set<string>>>>({});

  const [selectedDay, setSelectedDay] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(""); 
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [shownDate, setShownDate] = useState(new Date());
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [range, setRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);

  // FIX DUPLICATES: Create a clean list of unique names
  const activeStaffList = useMemo(() => {
    if (!selectedRecord) return [];
    const branchStaff = branchStaffData[selectedRecord.branch] || [];
    const originalNames = Object.values(selectedRecord.originalSelections || {}).filter(Boolean) as string[];
    const currentNames = Object.values(updatedSelections || {}).filter(Boolean) as string[];

    // Using Set to automatically remove duplicates between Shared and Database lists
    const combined = new Set([
      ...branchStaff,
      ...SHARED_EMPLOYEES,
      ...originalNames,
      ...currentNames
    ]);
    return Array.from(combined);
  }, [selectedRecord, branchStaffData, updatedSelections]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('/api/get-schedules');
        const data = await res.json();
        if (data.success) setHistory(data.schedules);
      } catch (err) {
        console.error("Failed to load schedules", err);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchStaff = async () => {
      const res = await fetch('/api/branch-staff');
      const staffList = await res.json();
      if (!Array.isArray(staffList)) return;
      const grouped: Record<string, string[]> = {};
      const managers: Record<string, string[]> = {};
      staffList.forEach((s: any) => {
        if (!s.branch) return;
        if (!grouped[s.branch]) grouped[s.branch] = [];
        grouped[s.branch].push(s.name);
        if (s.role && s.role.startsWith('branch_manager')) {
          if (!managers[s.branch]) managers[s.branch] = [];
          managers[s.branch].push(s.name);
        }
      });
      setBranchStaffData(grouped);
      setBranchManagerData(managers);
    };
    fetchSchedules();
    fetchStaff();
  }, []);

  const userRole = (session?.user as any)?.role || "USER";
  const userBranch = (session?.user as any)?.branchName;

  const filteredHistory = useMemo(() => {
    return history.filter((record: any) => {
      if (userRole === "BRANCH_MANAGER" && record.branch !== userBranch) return false;
      const matchBranch = filterBranch ? record.branch === filterBranch : true;
      const matchWeek = filterDate ? record.startDate === filterDate : true;
      return matchBranch && matchWeek;
    });
  }, [history, filterBranch, filterDate, userRole, userBranch]);

  useEffect(() => {
    if (!selectedRecord) return;
    const map: Record<string, Record<string, Set<string>>> = {};
    history.forEach((s: any) => {
      if (s.startDate !== selectedRecord.startDate || s.branch === selectedRecord.branch) return;
      
      const dayMap: Record<string, Set<string>> = {};
      Object.entries(s.selections || {}).forEach(([key, val]: [string, any]) => {
        if (!val || val === "None") return;
        const dayName = key.split('-')[0];
        if (!dayMap[dayName]) dayMap[dayName] = new Set();
        dayMap[dayName].add(val as string);
      });
      
      if (Object.keys(dayMap).length > 0) {
        map[s.branch] = dayMap;
      }
    });
    setScheduledElsewhere(map);
  }, [selectedRecord, history]);

  const handleSelectRecord = (record: any) => {
    setSelectedRecord(record);
    setUpdatedSelections({ ...record.selections });
    setUpdatedNotes({ ...record.notes });
    const days = getWorkingDaysForBranch(record.branch);
    if (days.length > 0) setSelectedDay(days[0]);
  };

  const handleActualNameSelect = (day: string, targetTime: string, colId: string, name: string) => {
    setUpdatedSelections((prev) => {
      const next = { ...prev };
      const slotKey = `${day}-${targetTime}-${colId}`;
      
      if (!name || name === "None") {
        delete next[slotKey];
      } else {
        const usedInOther = COLUMNS.filter(c => c.id !== colId).some(c => next[`${day}-${targetTime}-${c.id}`] === name) ||
                           next[`${day}-${targetTime}-MANAGER`] === name;
        
        if (usedInOther) {
            alert(`${name} is already assigned to another column in this time slot.`);
            return prev;
        }
        next[slotKey] = name;
      }
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

  const calculateHoursForData = (selections: Record<string, string>, isOriginalData = false) => {
    if (!selectedRecord) return [];
    const dataToCalculate = isOriginalData ? (selectedRecord.originalSelections || selectedRecord.selections) : selections;
    if (!dataToCalculate) return [];

    const managerNames = new Set(Object.values(branchManagerData).flat());
    const allBranchStaff = (branchStaffData[selectedRecord.branch] || []).filter(n => !managerNames.has(n));
    const uniqueEmployeesToTrack: string[] = Array.from(new Set([
      ...allBranchStaff,
      ...(Object.values(dataToCalculate) as string[]).filter(e => e && e !== "None" && !managerNames.has(e))
    ]));

    const staffStats: Record<string, { coachHrs: number; execHrs: number; total: number }> = {};
    uniqueEmployeesToTrack.forEach(emp => { staffStats[emp] = { coachHrs: 0, execHrs: 0, total: 0 }; });

    getWorkingDaysForBranch(selectedRecord.branch).forEach((day) => {
      const isWeekend = day === "Saturday" || day === "Sunday";
      const dailyTarget = isWeekend ? 10.5 : 5.0;
      const branchForDay = selectedRecord.branch;

      uniqueEmployeesToTrack.forEach((emp) => {
        let coachingHoursForDay = 0;
        let workedThatDay = false;
        getTimeSlotsForDay(day, branchForDay).forEach((slot: string) => {
          if (isOpeningClosingSlot(slot, branchForDay)) return;
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

  const handleUpdateSave = async () => {
    if (!window.confirm("Save adjustments to the database?")) return;
    const updatedRecord = { ...selectedRecord, selections: updatedSelections, notes: updatedNotes, status: "Updated" };
    try {
      const response = await fetch('/api/save-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord)
      });
      if (!response.ok) throw new Error("Failed to save");
      alert("Adjustments Saved Successfully! 💾");
      setHistory(prev => prev.map(h => h.id === updatedRecord.id ? updatedRecord : h));
      setSelectedRecord(null);
    } catch (error) {
      console.error(error);
      alert("Error saving adjustments to database.");
    }
  };

  if (selectedRecord) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 h-screen flex flex-col overflow-hidden relative">
          <div className="shrink-0 w-full mx-auto px-4 md:px-6 pt-4 md:pt-6 z-50 bg-slate-50">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center gap-6 mb-6">
              <div className="flex items-center gap-6">
                <button onClick={() => setSelectedRecord(null)} className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-6 py-3 rounded-xl font-bold uppercase transition-colors flex items-center gap-2 shadow-sm">
                  ← Back to List
                </button>
                <div className="h-8 w-px bg-slate-300"></div>
                <h1 className="text-lg font-black uppercase tracking-wide text-slate-800 leading-none m-0 flex items-center gap-4">
                  <span>Updating: {selectedRecord.branch}</span>
                  <span className="text-sm bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase">
                    {formatDateString(selectedRecord.startDate)} - {formatDateString(selectedRecord.endDate)}
                  </span>
                </h1>
              </div>
              <button onClick={handleUpdateSave} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-black uppercase shadow-md transition-colors flex items-center gap-2">
                <span>💾</span> Save Adjustments
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full mx-auto px-4 md:px-6 pb-20">
            <div className="space-y-6 mb-10">
              <div className="flex gap-2 flex-wrap">
                {getWorkingDaysForBranch(selectedRecord.branch).map((day) => {
                  const isActive = selectedDay === day;
                  const hasData = Object.keys(updatedSelections).some(k => k.startsWith(`${day}-`));
                  return (
                    <button key={day} onClick={() => setSelectedDay(day)}
                      className={`relative px-6 py-3 rounded-xl font-black uppercase text-sm tracking-wide transition-all shadow-sm ${
                        isActive ? "bg-[#2D3F50] text-white shadow-lg scale-105"
                        : hasData ? "bg-orange-50 text-orange-700 border-2 border-orange-300 hover:bg-orange-100"
                        : "bg-white text-slate-500 border-2 border-slate-200 hover:bg-slate-50"
                      }`}>
                      {day.slice(0, 3)}
                      {hasData && <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isActive ? "bg-green-400" : "bg-orange-500"}`} />}
                    </button>
                  );
                })}
              </div>

              {selectedDay && (() => {
                const day = selectedDay;
                const slots = getTimeSlotsForDay(day, selectedRecord.branch);
                const originalData = selectedRecord.originalSelections || {};
                
                return (
                  <div key={day} className="bg-white rounded-xl shadow-lg p-3 border-t-2 border-orange-500">
                    <div className="relative flex flex-col justify-center items-center mb-3 border-b pb-2">
                      <h2 className="text-lg font-black uppercase text-slate-700 m-0">{day}</h2>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {getDateForDay(day, selectedRecord.startDate)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* PLANNING SIDE */}
                      <div className="flex-1 opacity-60 flex flex-col min-w-0">
                        <div className="bg-slate-500 p-1.5 text-center font-bold text-[9px] uppercase mb-1 rounded text-white tracking-widest">Planning</div>
                        <div className="overflow-x-auto border rounded relative">
                          <table className="w-full border-collapse text-[11px]" style={{ minWidth: '1700px' }}>
                            <thead>
                              <tr className="bg-slate-700 text-white text-center h-[40px]">
                                <th className="p-1 border border-slate-600 w-32 sticky left-0 z-20 bg-slate-700">Slot</th>
                                <th className="p-1 border border-slate-600 w-24 bg-slate-700 border-b-2 border-b-emerald-400">Manager</th>
                                {COLUMNS.map(c => <th key={c.id} className="p-1 border border-slate-600 w-24">{c.label}</th>)}
                                <th className="p-1 border border-slate-600 w-40">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {slots.map((slot) => {
                                const isOpenClose = isOpeningClosingSlot(slot, selectedRecord.branch);
                                const showManagerPlanning = isManagerOnDutySlot(slot, selectedRecord.branch, day);
                                const planningManagerName = originalData[`${day}-${slot}-MANAGER`] || "";
                                return (
                                  <tr key={slot} className={`h-[32px] ${isOpenClose ? 'bg-blue-50' : ''}`}>
                                    <td className={`p-1 border font-bold sticky left-0 z-10 ${isOpenClose ? 'bg-blue-100' : 'bg-slate-50'}`}>{slot}</td>
                                    {!isOpenClose && (
                                      <td className="p-1 border bg-emerald-50 text-center font-bold">
                                        {showManagerPlanning ? planningManagerName : "—"}
                                      </td>
                                    )}
                                    {isOpenClose ? (
                                      <td colSpan={COLUMNS.length + 2} className="p-1 border text-center text-blue-600 font-black">All Staff Executive</td>
                                    ) : (
                                      <>
                                        {COLUMNS.map(col => (
                                          <td key={col.id} className={`p-1 border text-center font-bold ${originalData[`${day}-${slot}-${col.id}`] ? getStaffColorByIndex(originalData[`${day}-${slot}-${col.id}`], activeStaffList) : 'bg-white'}`}>
                                            {originalData[`${day}-${slot}-${col.id}`] || "-"}
                                          </td>
                                        ))}
                                        <td className="p-1 border italic text-slate-400">...</td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ACTUAL SIDE */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="bg-orange-600 p-1.5 flex justify-between items-center mb-1 rounded text-white tracking-widest h-8">
                            <span className="text-[10px] font-black bg-black/10 px-2 py-1 rounded">{selectedRecord.branch}</span>
                            <span className="font-bold text-[11px] uppercase">Actual</span>
                            <button onClick={() => handleClearDay(day)} className="text-[9px] font-bold bg-orange-800 px-1.5 py-0.5 rounded">CLEAR DAY</button>
                        </div>
                        <div className="overflow-x-auto border rounded relative">
                          <table className="w-full border-collapse text-[11px]" style={{ minWidth: '1700px' }}>
                            <thead>
                              <tr className="bg-[#2D3F50] text-white h-[40px]">
                                <th className="p-1 border border-slate-900 w-32 sticky left-0 z-20 bg-[#2D3F50]">Slot</th>
                                <th className="p-1 border border-slate-900 w-24 bg-slate-700 border-b-2 border-b-emerald-400">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span>Manager</span>
                                    <select value={managerReplacementBranch[day] || ""} onChange={(e) => setManagerReplacementBranch(p => ({ ...p, [day]: e.target.value }))} className="text-[9px] bg-slate-600 text-white rounded px-1">
                                      <option value="">Own Branch</option>
                                      {ALL_BRANCHES.filter(b => b !== selectedRecord.branch).map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                  </div>
                                </th>
                                {COLUMNS.map(c => (
                                  <th key={c.id} className={`p-1 border border-slate-900 w-24 ${c.type==='exec'?'bg-slate-700 border-b-2 border-b-blue-400':''}`}>
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span>{c.label}</span>
                                      <select value={columnReplacementBranch[`${day}-${c.id}`] || ""} onChange={(e) => setColumnReplacementBranch(p => ({ ...p, [`${day}-${c.id}`]: e.target.value }))} className="text-[9px] bg-slate-600 text-white rounded px-1">
                                        <option value="">Own Branch</option>
                                        {ALL_BRANCHES.filter(b => b !== selectedRecord.branch).map(b => <option key={b} value={b}>{b}</option>)}
                                      </select>
                                    </div>
                                  </th>
                                ))}
                                <th className="p-1 border border-slate-900 w-40">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {slots.map((slot) => {
                                const isOpenClose = isOpeningClosingSlot(slot, selectedRecord.branch);
                                const showManagerActual = isManagerOnDutySlot(slot, selectedRecord.branch, day);
                                const actualManagerVal = updatedSelections[`${day}-${slot}-MANAGER`] || "";

                                return (
                                  <tr key={slot} className={`h-[32px] ${isOpenClose ? 'bg-blue-50' : ''}`}>
                                    <td className={`p-1 border font-bold sticky left-0 z-10 ${isOpenClose ? 'bg-blue-100' : 'bg-orange-50'}`}>{slot}</td>
                                    {!isOpenClose && (
                                      <td className="p-1 border bg-emerald-50">
                                        {showManagerActual ? (
                                          <select value={actualManagerVal} onChange={(e) => handleActualNameSelect(day, slot, "MANAGER", e.target.value)} 
                                            className={`w-full h-full p-1 text-[11px] font-bold text-center border rounded appearance-none truncate ${actualManagerVal ? getStaffColorByIndex(actualManagerVal, activeStaffList) : 'bg-white'}`}>
                                            <option value="">-- Select --</option>
                                            {(branchManagerData[managerReplacementBranch[day] || selectedRecord.branch] || []).map(e => {
                                              const targetBranch = managerReplacementBranch[day] || selectedRecord.branch;
                                              const isElsewhere = targetBranch !== selectedRecord.branch && (scheduledElsewhere[targetBranch]?.[day]?.has(e));
                                              return <option key={e} value={e} disabled={isElsewhere}>{isElsewhere ? `${e} (at other branch)` : e}</option>;
                                            })}
                                          </select>
                                        ) : <div className="text-center text-emerald-200">—</div>}
                                      </td>
                                    )}
                                    {isOpenClose ? (
                                      <td colSpan={COLUMNS.length + 1} className="p-1 border text-center text-blue-600 font-black">All Staff Executive</td>
                                    ) : (
                                      <>
                                        {COLUMNS.map(col => {
                                          const val = updatedSelections[`${day}-${slot}-${col.id}`] || "";
                                          const replacementBranch = columnReplacementBranch[`${day}-${col.id}`];
                                          const colStaffList = replacementBranch ? (branchStaffData[replacementBranch] || []) : activeStaffList;
                                          return (
                                            <td key={col.id} className="p-0 border">
                                              <select value={val} onChange={(e) => handleActualNameSelect(day, slot, col.id, e.target.value)}
                                                className={`w-full h-full p-1 font-bold text-center appearance-none truncate ${val ? getStaffColorByIndex(val, activeStaffList) : 'bg-transparent text-slate-300'}`}>
                                                <option value="">None</option>
                                                {colStaffList.map(e => {
                                                  const targetBranch = replacementBranch || selectedRecord.branch;
                                                  const isElsewhere = targetBranch !== selectedRecord.branch && (scheduledElsewhere[targetBranch]?.[day]?.has(e));
                                                  return <option key={e} value={e} disabled={isElsewhere}>{isElsewhere ? `${e} (at other branch)` : e}</option>;
                                                })}
                                              </select>
                                            </td>
                                          );
                                        })}
                                        <td className="p-0 border bg-white">
                                          <textarea value={updatedNotes[`${day}-${slot}-notes`] || ""} onChange={(e) => setUpdatedNotes(p => ({...p, [`${day}-${slot}-notes`]: e.target.value}))} className="w-full h-full p-1 text-[10px] resize-none outline-none italic" />
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-md">
                <h2 className="text-base font-black text-center uppercase tracking-widest text-slate-800 mb-4">📊 Staff Hours Comparison</h2>
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 h-screen flex flex-col overflow-hidden px-4 md:px-6 pt-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex items-center justify-between">
                <h1 className="text-lg font-black uppercase">Update Manpower Schedule</h1>
                <button onClick={() => router.push('/manpower-schedule')} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold">Back to HRMS</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="p-3 border rounded-xl font-bold">
                    <option value="">All Branches</option>
                    {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div onClick={() => setShowCalendar(true)} className="p-3 border rounded-xl font-bold bg-white cursor-pointer">
                    {isDateFiltered ? filterDate : "Filter by Week"} 📅
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? <p>Loading...</p> : filteredHistory.map(record => (
                    <div key={record.id} onClick={() => handleSelectRecord(record)} className="bg-white p-4 rounded-xl border mb-3 cursor-pointer hover:bg-orange-50 transition-colors">
                        <div className="font-black text-orange-800">{record.branch}</div>
                        <div className="text-xs text-slate-500">{record.startDate} - {record.endDate}</div>
                    </div>
                ))}
            </div>
        </main>
        {showCalendar && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <DateRange
                        onChange={(item: any) => {
                            const start = item.selection.startDate;
                            setFilterDate(format(start, "yyyy-MM-dd"));
                            setIsDateFiltered(true);
                            setShowCalendar(false);
                        }}
                        ranges={range}
                    />
                    <button onClick={() => setShowCalendar(false)} className="w-full mt-4 p-2 bg-slate-200 rounded-xl font-bold">Close</button>
                </div>
            </div>
        )}
    </div>
  );
}