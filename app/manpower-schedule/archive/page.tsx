"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays, startOfWeek, endOfWeek } from "date-fns"; 
import { DateRange, RangeKeyDict } from "react-date-range"; 
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 
import Sidebar from "@/app/components/Sidebar";

// --- IMPORT SHARED CONSTANTS ---
import { 
  SHARED_EMPLOYEES, DAYS, EMPLOYEE_COLORS, COLUMNS, ALL_BRANCHES,
  getTimeSlotsForDay, isAdminSlot 
} from "@/lib/manpowerUtils";


// --- HELPER COMPONENT: SUMMARY TABLE ---
const SummaryTable = ({ data }: { data: any[] }) => {
  const formatTime = (d: number) => {
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return { h: h, m: m.toString().padStart(2, '0') };
  };

  return (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden mt-8">
        <div className="bg-slate-100 py-4 border-b border-slate-200">
            <h3 className="text-center font-black uppercase tracking-widest text-lg text-slate-800">Archived Hours Summary</h3>
        </div>
        <table className="w-full text-xs border-collapse">
            <thead className="bg-[#2D3F50] text-white">
                <tr>
                    <th className="p-3 text-left w-12 border-r border-slate-600">No.</th>
                    <th className="p-3 text-left border-r border-slate-600">Name</th>
                    <th className="p-3 text-center border-r border-slate-600">Class (Coach)</th>
                    <th className="p-3 text-center border-r border-slate-600">Executive</th>
                    <th className="p-3 text-center">Total (hrs:min)</th>
                </tr>
            </thead>
            <tbody className="divide-y text-sm">
                {data.map((row, index) => {
                    const c = formatTime(row.coachHrs);
                    const e = formatTime(row.execHrs);
                    const t = formatTime(row.total);
                    return (
                        <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-center border-r font-bold text-slate-500">{index + 1}</td>
                            <td className="p-4 font-bold border-r text-slate-800">{row.name}</td>
                            <td className="p-4 text-center border-r">
                                <span className="inline-flex items-baseline gap-1 border border-slate-200 bg-white px-2 py-1 rounded">
                                    <span className="font-bold">{c.h}</span> <span className="text-[10px] text-slate-400">HRS</span>
                                    <span className="font-bold">{c.m}</span> <span className="text-[10px] text-slate-400">MIN</span>
                                </span>
                            </td>
                            <td className="p-4 text-center border-r">
                                <span className="inline-flex items-baseline gap-1 border border-slate-200 bg-white px-2 py-1 rounded">
                                    <span className="font-bold">{e.h}</span> <span className="text-[10px] text-slate-400">HRS</span>
                                    <span className="font-bold">{e.m}</span> <span className="text-[10px] text-slate-400">MIN</span>
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <span className="inline-flex items-baseline gap-1 border border-blue-200 px-2 py-1 rounded bg-blue-50">
                                    <span className="font-bold text-blue-700">{t.h}</span> <span className="text-[10px] text-blue-400">HRS</span>
                                    <span className="font-bold text-blue-700">{t.m}</span> <span className="text-[10px] text-blue-400">MIN</span>
                                </span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );
};

export default function ArchiveSchedulePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // --- FILTER STATES ---
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(""); 
  
  // --- CALENDAR POPOVER STATES ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [shownDate, setShownDate] = useState(new Date());
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [range, setRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);

  // Prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const history = useMemo(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("manpower_history") || "[]");
    }
    return [];
  }, []);

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

  // --- APPLY FILTERS TO THE LIST ---
  const filteredHistory = useMemo(() => {
    return history.filter((record: any) => {
      const matchBranch = filterBranch ? record.branch === filterBranch : true;
      const matchWeek = filterDate ? record.startDate === filterDate : true;
      return matchBranch && matchWeek;
    });
  }, [history, filterBranch, filterDate]);

  // --- BULLETPROOF DATA SYNC ---
  const validData = useMemo(() => {
    if (!selectedRecord) return {};
    if (selectedRecord.selections && Object.keys(selectedRecord.selections).length > 0) {
        return selectedRecord.selections;
    }
    return selectedRecord.originalSelections || {};
  }, [selectedRecord]);


  const calculateHoursForData = () => {
    if (!selectedRecord) return [];
    
    const selectedInTable = Object.values(validData).filter(val => val !== "" && val !== "None") as string[];
    const uniqueEmployeesToTrack: string[] = Array.from(new Set([...SHARED_EMPLOYEES, ...selectedInTable]));

    const staffStats: Record<string, { coachHrs: number; execHrs: number; total: number }> = {};
    uniqueEmployeesToTrack.forEach((emp: string) => { staffStats[emp] = { coachHrs: 0, execHrs: 0, total: 0 }; });

    DAYS.forEach((day) => {
      const isWeekend = day === "Saturday" || day === "Sunday";
      const dailyTarget = isWeekend ? 10.5 : 5.0;

      uniqueEmployeesToTrack.forEach((emp: string) => {
        let coachingHoursForDay = 0;
        let explicitExecHoursForDay = 0;
        let workedThatDay = false;

        getTimeSlotsForDay(day, selectedRecord.branch).forEach((slot: string) => {
          COLUMNS.forEach((col) => {
            if (validData[`${day}-${slot}-${col.id}`] === emp) {
              workedThatDay = true;
              
              if (col.type === "coach") {
                  const slotDuration = isAdminSlot(slot, selectedRecord.branch) ? 0.25 : 1.25;
                  coachingHoursForDay += slotDuration;
              } else if (col.type === "exec") {
                  const slotDuration = isAdminSlot(slot, selectedRecord.branch) ? 0.25 : 1.25;
                  explicitExecHoursForDay += slotDuration;
              }
            }
          });
        });
        
        if (workedThatDay) {
          staffStats[emp].coachHrs += coachingHoursForDay;
          if (explicitExecHoursForDay > 0) {
             staffStats[emp].execHrs += explicitExecHoursForDay;
          } else {
             staffStats[emp].execHrs += Math.max(0, dailyTarget - coachingHoursForDay);
          }
          staffStats[emp].total = staffStats[emp].coachHrs + staffStats[emp].execHrs;
        }
      });
    });
    
    return Object.entries(staffStats).map(([name, stats]) => ({ name, ...stats }));
  };

  // --- RECORD DETAIL VIEW ---
  if (selectedRecord) {
    const displayNotes = selectedRecord.notes || selectedRecord.originalNotes || {};

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
                  <span>Archived: {selectedRecord.branch}</span>
                  
                  {selectedRecord.startDate && selectedRecord.endDate && (
                    <span className="text-sm bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase">
                      {formatDateString(selectedRecord.startDate)} - {formatDateString(selectedRecord.endDate)}
                    </span>
                  )}
                </h1>
              </div>
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-xs font-black rounded-lg uppercase tracking-widest shadow-sm">
                🔒 Read Only Record
              </div>
            </div>

            <div className="space-y-8 mb-20">
              {DAYS.map((day) => {
                const slots = getTimeSlotsForDay(day, selectedRecord.branch);

                return (
                  <div key={day} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    
                    <div className="bg-slate-500 p-3 border-b flex flex-col items-center justify-center">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest text-center m-0 leading-none">{day}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                          {getDateForDay(day, selectedRecord.startDate)}
                        </span>
                    </div>

                    <div className="overflow-x-auto relative">
                        <table className="w-full border-collapse text-xs" style={{ minWidth: '1900px' }}>
                        <thead>
                            <tr className="bg-slate-700 text-white uppercase tracking-widest">
                                <th className="p-3 border-r border-slate-600 text-left w-[180px] sticky left-0 z-20 bg-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Slot</th>
                                {COLUMNS.map(c => (
                                    <th key={c.id} className={`p-3 border-r border-slate-600 text-center w-[150px] ${c.type === 'exec' ? 'bg-slate-800' : ''}`}>
                                        {c.label}
                                    </th>
                                ))}
                                <th className="p-3 border-slate-600 text-left w-[250px]">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map(slot => (
                            <tr key={slot} className="hover:bg-slate-50 group">
                                <td className="p-3 border-r border-b border-slate-200 font-bold text-slate-600 sticky left-0 z-10 bg-slate-50 group-hover:bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                                    {slot}
                                </td>
                                {COLUMNS.map(col => {
                                  const name = validData[`${day}-${slot}-${col.id}`];
                                  const displayValue = name && name !== "None" ? name : "-";
                                  const bgColor = name && name !== "None" ? (EMPLOYEE_COLORS[name] || 'bg-slate-500 text-white') : (col.type === 'exec' ? 'bg-slate-50 text-slate-300' : 'bg-white text-slate-300');
                                  
                                  return (
                                      <td key={col.id} className={`p-3 border-r border-b border-slate-200 text-center font-bold transition-colors ${bgColor}`}>
                                          {displayValue}
                                      </td>
                                  );
                                })}
                                <td className="p-3 border-b border-slate-200 text-slate-500 italic bg-white max-w-xs truncate">
                                    {displayNotes[`${day}-${slot}-notes`] || "-"}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                  </div>
                );
              })}

              <SummaryTable data={calculateHoursForData()} />
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
                
                {/* LIST TOP BAR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 mb-6 sticky top-0 z-50">
                  <button
                    onClick={() => router.push('/manpower-schedule')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-md hover:bg-blue-600 transition-colors"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="text-lg font-black uppercase tracking-wide leading-none">HRMS</span>
                  </button>
                  
                  <div className="h-8 w-px bg-slate-300"></div>
                  
                  <h1 className="text-2xl font-black uppercase tracking-wide text-slate-800 leading-none m-0">
                    Archive Overview
                  </h1>
                </div>

                {/* FILTER CONTROLS */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8 relative">
                  
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Filter by Branch</label>
                    <select 
                      value={filterBranch} 
                      onChange={(e) => setFilterBranch(e.target.value)} 
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Branches</option>
                      {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Filter by Week</label>
                    
                    {/* CUSTOM POPOVER CALENDAR BUTTON */}
                    <div 
                      onClick={() => setShowCalendar(true)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 cursor-pointer flex justify-between items-center transition-colors hover:border-blue-500"
                    >
                      <span>
                        {isDateFiltered 
                          ? `${format(range[0].startDate, "dd MMM yyyy")} - ${format(range[0].endDate, "dd MMM yyyy")}` 
                          : "All Weeks"}
                      </span>
                      <span>📅</span>
                    </div>
                  </div>
                  
                  {(filterBranch || isDateFiltered) && (
                    <div className="flex items-end">
                      <button 
                        onClick={() => { 
                          setFilterBranch(""); 
                          setFilterDate(""); 
                          setIsDateFiltered(false);
                        }}
                        className="h-[50px] px-6 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* --- CENTERED MODAL FOR CALENDAR --- */}
                {showCalendar && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col max-w-md w-full relative">
                      <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight text-center">Select a Week</h2>
                      
                      <div className="flex justify-center w-full overflow-hidden mb-4">
                        <DateRange
                          onChange={(item: RangeKeyDict) => {
                            const selection = item.selection;
                            if (selection.startDate) {
                              const start = startOfWeek(selection.startDate, { weekStartsOn: 1 });
                              const end = endOfWeek(selection.startDate, { weekStartsOn: 1 });
                              
                              setRange([{ startDate: start, endDate: end, key: "selection" }]);
                              setIsDateFiltered(true);
                              
                              // Pass the exact string format our history filter expects
                              setFilterDate(format(start, "yyyy-MM-dd")); 
                              
                              // Auto-close calendar after selection
                              setTimeout(() => setShowCalendar(false), 250);
                            }
                          }}
                          shownDate={shownDate}
                          onShownDateChange={(date) => setShownDate(date)}
                          moveRangeOnFirstSelection={true}
                          ranges={range}
                          rangeColors={["#3b82f6"]}
                          months={1}
                          direction="horizontal"
                          dateDisplayFormat="dd MMM yyyy"
                          className="border-none"
                        />
                      </div>

                      <button 
                        onClick={() => setShowCalendar(false)} 
                        className="w-full py-4 bg-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-300 uppercase tracking-widest text-sm transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* ARCHIVE RECORDS GRID */}
                {isMounted && filteredHistory.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center shadow-sm">
                        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">No archived records found matching filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {isMounted && filteredHistory.map((record: any) => (
                            <div key={record.id} onClick={() => setSelectedRecord(record)} className="bg-white p-8 rounded-3xl shadow-md border-4 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-center">
                                <h3 className="font-black text-2xl uppercase text-slate-800 mb-2">{record.branch}</h3>
                                <div className="inline-flex items-center gap-2">
                                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase shadow-sm">
                                    Week Of: {formatDateString(record.startDate)}
                                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}