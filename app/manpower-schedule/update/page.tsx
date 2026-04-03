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
        <table className="w-full text-xs border-collapse">
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

// --- HOURS CALCULATION HELPER ---
const calculateHoursForData = (selections: Record<string, string>, branch: string) => {
  const hoursMap: Record<string, { name: string; coachHrs: number; execHrs: number }> = {};
  
  const getSlotDuration = (slot: string) => {
    // Assuming each slot is 1 hour; adjust if slots have different durations
    return 1;
  };
  
  const isCoachColumn = (colId: string) => {
    // Columns containing 'coach' in their ID are coach slots
    return colId.toLowerCase().includes('coach');
  };

  const days = getWorkingDaysForBranch(branch);
  
  days.forEach(day => {
    const slots = getTimeSlotsForDay(day, branch);
    slots.forEach(slot => {
      // Manager slot - counts as exec hours
      if (isManagerOnDutySlot(slot, branch, day)) {
        const key = `${day}-${slot}-MANAGER`;
        const name = selections[key]?.split(' ')[0];
        if (name) {
          if (!hoursMap[name]) hoursMap[name] = { name, coachHrs: 0, execHrs: 0 };
          hoursMap[name].execHrs += getSlotDuration(slot);
        }
      }
      // Regular columns
      COLUMNS.forEach(col => {
        const key = `${day}-${slot}-${col.id}`;
        const name = selections[key]?.split(' ')[0];
        if (name) {
          if (!hoursMap[name]) hoursMap[name] = { name, coachHrs: 0, execHrs: 0 };
          if (isCoachColumn(col.id)) {
            hoursMap[name].coachHrs += getSlotDuration(slot);
          } else {
            hoursMap[name].execHrs += getSlotDuration(slot);
          }
        }
      });
    });
  });

  return Object.values(hoursMap).map(r => ({
    ...r,
    total: r.coachHrs + r.execHrs
  }));
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

  // Logic to handle SHORT NAMES only
  const activeStaffList = useMemo(() => {
    if (!selectedRecord) return [];
    const branchStaff = branchStaffData[selectedRecord.branch] || [];
    const originalNames = Object.values(selectedRecord.originalSelections || {}).filter(Boolean) as string[];
    const currentNames = Object.values(updatedSelections || {}).filter(Boolean) as string[];

    const combined = new Set([
      ...branchStaff,
      ...SHARED_EMPLOYEES,
      ...originalNames,
      ...currentNames
    ]);
    
    // Transform to Short Names (takes first part of name)
    return Array.from(combined).map(name => name.split(' ')[0]);
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
      if (Object.keys(dayMap).length > 0) map[s.branch] = dayMap;
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
      if (!name || name === "None") {
        delete next[`${day}-${targetTime}-${colId}`];
      } else {
        next[`${day}-${targetTime}-${colId}`] = name;
      }
      return next;
    });
  };

  const handleUpdateSave = async () => {
    if (!window.confirm("Save adjustments?")) return;
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
    } catch (error) { alert("Error saving adjustments."); }
  };

  if (selectedRecord) {
    // EDIT MODE UI
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
                    {/* ... (Actual Table UI remains the same as provided in previous update) ... */}
                    <div className="overflow-x-auto border rounded relative">
                      <table className="w-full border-collapse text-[11px]" style={{ minWidth: '1700px' }}>
                         <thead>
                            <tr className="bg-[#2D3F50] text-white h-[40px]">
                                <th className="p-1 border w-32 sticky left-0 z-20 bg-[#2D3F50]">Slot</th>
                                <th className="p-1 border w-24">Manager</th>
                                {COLUMNS.map(c => <th key={c.id} className="p-1 border w-24">{c.label}</th>)}
                                <th className="p-1 border w-40">Notes</th>
                            </tr>
                         </thead>
                         <tbody>
                            {slots.map(slot => (
                                <tr key={slot} className="h-[32px]">
                                    <td className="p-1 border font-bold sticky left-0 bg-slate-50">{slot}</td>
                                    {/* Manager and Column selects use activeStaffList which is now shortened names */}
                                    <td className="p-1 border">
                                        {isManagerOnDutySlot(slot, selectedRecord.branch, day) ? (
                                            <select className="w-full h-full p-1 font-bold text-center appearance-none truncate"
                                                    value={updatedSelections[`${day}-${slot}-MANAGER`] || ""}
                                                    onChange={(e) => handleActualNameSelect(day, slot, "MANAGER", e.target.value)}>
                                                <option value="">--</option>
                                                {activeStaffList.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        ) : "—"}
                                    </td>
                                    {COLUMNS.map(col => (
                                        <td key={col.id} className="p-0 border">
                                            <select className="w-full h-full p-1 font-bold text-center appearance-none truncate"
                                                    value={updatedSelections[`${day}-${slot}-${col.id}`] || ""}
                                                    onChange={(e) => handleActualNameSelect(day, slot, col.id, e.target.value)}>
                                                <option value="">None</option>
                                                {activeStaffList.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </td>
                                    ))}
                                    <td className="p-1 border"><textarea className="w-full h-full p-1 text-[10px] italic" value={updatedNotes[`${day}-${slot}-notes`] || ""} onChange={(e) => setUpdatedNotes(p => ({...p, [`${day}-${slot}-notes`]: e.target.value}))} /></td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-md">
                <SummaryTable title="ADJUSTED HOURS" data={calculateHoursForData(updatedSelections, selectedRecord.branch)} theme="orange" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- LIST VIEW UI (RESTORED TO GRID LAYOUT) ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
      <main className="flex-1 h-screen flex flex-col overflow-hidden relative">
        <div className="shrink-0 w-full mx-auto px-4 md:px-6 pt-4 md:pt-6 z-50 bg-slate-50">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between mb-6">
            <h1 className="text-lg font-black uppercase tracking-wide text-slate-800 leading-none">Update Manpower Schedule</h1>
            <button onClick={() => router.push('/manpower-schedule')} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors">Back to HRMS</button>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-6 relative">
            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none">
              <option value="">All Branches</option>
              {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div onClick={() => setShowCalendar(true)} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 cursor-pointer flex justify-between items-center">
              <span>{isDateFiltered ? format(range[0].startDate, "dd MMM yyyy") : "Filter by Week"}</span>
              <span>📅</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full mx-auto px-4 md:px-6 pb-12">
          {isLoading ? (
            <div className="flex justify-center h-40 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center"><p className="text-slate-500 font-bold uppercase tracking-widest">No schedules matching filters.</p></div>
          ) : (() => {
            // RESTORED GRID GROUPING LOGIC
            const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const WEEK_LABELS = ["1 – 7","8 – 14","15 – 21","22 – 31"];
            const getWeekBucket = (dateStr: string) => {
              const d = parseInt(format(parseISO(dateStr), "d"));
              if (d <= 7) return 0; if (d <= 14) return 1; if (d <= 21) return 2; return 3;
            };
            const byYear: Record<string, any[]> = {};
            filteredHistory.forEach(r => {
              const y = format(parseISO(r.startDate), "yyyy");
              if (!byYear[y]) byYear[y] = [];
              byYear[y].push(r);
            });
            return Object.keys(byYear).sort((a,b) => parseInt(b)-parseInt(a)).map(year => {
              const recs = byYear[year];
              const monthIdxs = Array.from(new Set(recs.map(r => parseInt(format(parseISO(r.startDate),"M"))-1))).sort((a,b)=>a-b);
              const buckets = Array.from(new Set(recs.map(r => getWeekBucket(r.startDate)))).sort();
              const lookup: Record<string,any[]> = {};
              recs.forEach(r => {
                const k = `${parseInt(format(parseISO(r.startDate),"M"))-1}-${getWeekBucket(r.startDate)}`;
                if (!lookup[k]) lookup[k] = [];
                lookup[k].push(r);
              });
              return (
                <div key={year} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                  <div className="bg-[#2D3F50] px-6 py-3"><h2 className="text-white font-black text-xl uppercase tracking-widest">{year}</h2></div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="p-3 border-r w-20 text-xs font-black uppercase text-slate-400"></th>
                          {monthIdxs.map(mi => <th key={mi} className="p-3 border-r text-xs font-black uppercase text-slate-600 text-center min-w-[140px]">{MONTH_NAMES[mi]}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {buckets.map(bucket => (
                          <tr key={bucket} className="border-b">
                            <td className="p-3 border-r bg-slate-50 text-xs font-black text-slate-400 text-center">{WEEK_LABELS[bucket]}</td>
                            {monthIdxs.map(mi => {
                              const cellRecs = lookup[`${mi}-${bucket}`] || [];
                              return (
                                <td key={mi} className="p-2 border-r align-top">
                                  {cellRecs.map(record => (
                                    <button key={record.id} onClick={() => handleSelectRecord(record)} className="w-full text-left px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg mb-1 transition-colors">
                                      <div className="font-black text-xs text-orange-800 uppercase">{record.branch}</div>
                                    </button>
                                  ))}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </main>
      {/* Date selector modal logic same as before... */}
    </div>
  );
}