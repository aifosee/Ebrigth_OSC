"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CSVEmployee {
  name: string;
  dept: string;
  position: string;
  scannerRef: string;
}

interface LogEntry {
  date: string;        // "YYYY-MM-DD"
  empName: string;
  clockInTime: string | null;
  clockOutTime: string | null;
}

interface DayRow {
  no: number;
  date: string;        // "YYYY-MM-DD"
  dayLabel: string;    // "Mon"
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  attendance: "Present" | "Weekend" | "No Data";
}

// ─── CSV parser (same formula as AttendanceSummary) ────────────────────────────

function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { cols.push(current.trim()); current = ""; }
    else { current += char; }
  }
  cols.push(current.trim());
  return cols.map(c => c.replace(/^"|"$/g, ""));
}

async function fetchEmployees(): Promise<CSVEmployee[]> {
  const res = await fetch("/employees.csv");
  const text = await res.text();
  return text.trim().split("\n").slice(2).map(line => {
    const cols = parseCSVLine(line);
    if (cols.length < 4) return null;
    const eid = (cols[8] ?? "").trim();
    const parts = eid.split(" ");
    const scannerRef = parts.length === 3 ? parts[1] + parts[0].substring(0, 2) + parts[2] : "";
    return {
      name: (cols[0] ?? "").trim(),
      dept: (cols[1] ?? "").trim(),
      position: (cols[3] ?? "").trim(),
      scannerRef,
    };
  }).filter((e): e is CSVEmployee => !!e && e.name !== "" && e.scannerRef !== "");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

// Parse "YYYY-MM-DD" without timezone drift by using UTC
function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dayLabel(dateStr: string): string {
  return DAYS[parseDateUTC(dateStr).getUTCDay()];
}

function isWeekend(dateStr: string): boolean {
  const d = parseDateUTC(dateStr).getUTCDay();
  return d === 0 || d === 1; // Sunday=0, Monday=1 are off days; working days are Tue–Sat
}

// Parse "HH:mm:ss" → total minutes
function parseTimeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length < 2) return null;
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesToHours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month is 1-based here
}

function padDate(n: number): string {
  return String(n).padStart(2, "0");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttendanceReport() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-based

  const [employees, setEmployees] = useState<CSVEmployee[]>([]);
  const [selectedEmpIdx, setSelectedEmpIdx] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load employee list once
  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
  }, []);

  const selectedEmp = employees[selectedEmpIdx] ?? null;

  // Fetch real logs whenever employee or month/year changes
  const fetchLogs = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance-logs?empNo=${selectedEmp.scannerRef}&month=${selectedMonth}&year=${selectedYear}`
      );
      const data: LogEntry[] = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEmp, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Build day rows for entire month (all 30/31 days) ────────────────────────
  const rows: DayRow[] = [];
  const totalDays = getDaysInMonth(selectedYear, selectedMonth);

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${selectedYear}-${padDate(selectedMonth)}-${padDate(d)}`;
    const weekend = isWeekend(dateStr);
    const log = logs.find(l => l.date === dateStr);

    let hoursWorked: number | null = null;
    if (log?.clockInTime && log?.clockOutTime) {
      const inMins = parseTimeToMinutes(log.clockInTime);
      const outMins = parseTimeToMinutes(log.clockOutTime);
      if (inMins !== null && outMins !== null && outMins > inMins) {
        hoursWorked = outMins - inMins;
      }
    }

    rows.push({
      no: d,
      date: dateStr,
      dayLabel: dayLabel(dateStr),
      clockIn: log?.clockInTime ?? null,
      clockOut: log?.clockOutTime ?? null,
      hoursWorked,
      attendance: weekend ? "Weekend" : log ? "Present" : "No Data",
    });
  }

  const presentCount = rows.filter(r => r.attendance === "Present").length;
  const noDataCount = rows.filter(r => r.attendance === "No Data").length;
  const totalMinutes = rows.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0);

  // Years for selector
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4 flex-wrap">
            <button onClick={() => router.back()} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-blue-800">Attendance Report</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* ── Employee Info Card ── */}
            <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">Employee</h2>

              {/* Employee dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                <select
                  value={selectedEmpIdx}
                  onChange={e => setSelectedEmpIdx(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {employees.map((emp, i) => (
                    <option key={emp.scannerRef} value={i}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {selectedEmp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                    <p className="text-sm font-medium text-gray-800">{selectedEmp.dept || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Position</label>
                    <p className="text-sm font-medium text-gray-800">{selectedEmp.position || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Scanner ID</label>
                    <p className="text-xs font-mono text-gray-400">{selectedEmp.scannerRef}</p>
                  </div>
                </>
              )}

              {/* Month selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Summary stats */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Days Present</span>
                  <span className="text-sm font-bold text-green-600">{presentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 font-semibold uppercase">No Record</span>
                  <span className="text-sm font-bold text-gray-400">{noDataCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total Hours</span>
                  <span className="text-sm font-bold text-blue-600">
                    {totalMinutes > 0 ? minutesToHours(totalMinutes) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Attendance Table ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    {MONTHS[selectedMonth - 1]} {selectedYear}
                    {selectedEmp && <span className="ml-2 text-gray-400 font-normal text-base">— {selectedEmp.name}</span>}
                  </h2>
                  {loading && (
                    <span className="text-xs text-gray-400 animate-pulse">Loading…</span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="px-3 py-3 text-left text-xs font-semibold">No.</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold">Day</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold">Date</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold">Clock In</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold">Clock Out</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold">Duration</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 && !loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-gray-400 text-sm">
                            {employees.length === 0
                              ? "Loading employees…"
                              : "No working days in this period."}
                          </td>
                        </tr>
                      ) : (
                        rows.map(row => {
                          const isWeekendRow = row.attendance === "Weekend";
                          return (
                            <tr
                              key={row.date}
                              className={`border-b border-gray-100 transition-colors ${
                                isWeekendRow
                                  ? "bg-gray-50"
                                  : row.attendance === "No Data"
                                  ? "opacity-60 hover:bg-gray-50"
                                  : "hover:bg-blue-50"
                              }`}
                            >
                              <td className="px-3 py-2 text-sm text-gray-400">{row.no}</td>
                              <td className={`px-3 py-2 text-sm font-semibold ${isWeekendRow ? "text-gray-400" : "text-blue-600"}`}>
                                {row.dayLabel}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-700">
                                {row.date.split("-").reverse().join("/")}
                              </td>
                              <td className="px-3 py-2 text-sm font-mono font-semibold text-green-700">
                                {row.clockIn ?? <span className="text-gray-300 font-normal">—</span>}
                              </td>
                              <td className="px-3 py-2 text-sm font-mono font-semibold text-orange-600">
                                {row.clockOut ?? <span className="text-gray-300 font-normal">—</span>}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-700">
                                {row.hoursWorked !== null
                                  ? minutesToHours(row.hoursWorked)
                                  : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isWeekendRow ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
                                    Weekend
                                  </span>
                                ) : row.attendance === "Present" ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    Present
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
                                    No Record
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Days Present</p>
                      <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">No Record</p>
                      <p className="text-2xl font-bold text-gray-400">{noDataCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Total Hours</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalMinutes > 0 ? minutesToHours(totalMinutes) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <p className="mt-4 text-xs text-gray-400 text-center">
                Data is pulled live from the thumbprint scanner logs · Sun &amp; Mon are off days · Hours calculated from clock-in to clock-out
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}