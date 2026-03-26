export const SHARED_EMPLOYEES = ["Iqbal", "Ying Chen", "Adam", "Faiq", "Salman"];

export const ALL_BRANCHES = [
  "Subang Taipan", "Setia Alam", "Shah Alam", "Putrajaya", "Ampang", 
  "Cyberjaya", "Klang", "Bandar Baru Bangi", "Taman Sri Gombak", 
  "Online", "Kajang TTDI Groove", "Kota Warisan", "Bandar Tun Hussein Onn", 
  "Danau Kota", "Denai Alam", "Sri Petaling", "Eco Grandeur", 
  "Kota Damansara", "Bandar Seri Putra", "Rimbayu"
].sort();

export const DAYS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const WEEKDAY_DAYS = ["Wednesday", "Thursday", "Friday"] as const;

export const EMPLOYEE_COLORS: Record<string, string> = {
  "Iqbal": "bg-blue-400 text-white border-blue-500",
  "Ying Chen": "bg-pink-300 text-white border-pink-400",
  "Adam": "bg-purple-400 text-white border-purple-500",
  "Faiq": "bg-indigo-400 text-white border-indigo-500",
  "Salman": "bg-teal-400 text-white border-teal-500",
  "Sofia": "bg-orange-400 text-white border-orange-500",
  "Dina": "bg-orange-400 text-white border-orange-500",
  "Didi": "bg-orange-400 text-white border-orange-500",
  "Mai": "bg-orange-400 text-white border-orange-500",
};

export const COLUMNS = [
  { id: "coach1", label: "Coach 1", type: "coach" as const },
  { id: "coach2", label: "Coach 2", type: "coach" as const },
  { id: "coach3", label: "Coach 3", type: "coach" as const },
  { id: "coach4", label: "Coach 4", type: "coach" as const },
  { id: "coach5", label: "Coach 5", type: "coach" as const },
  { id: "exec1", label: "Exec 1", type: "exec" as const },
  { id: "exec2", label: "Exec 2", type: "exec" as const },
  { id: "exec3", label: "Exec 3", type: "exec" as const },
  { id: "exec4", label: "Exec 4", type: "exec" as const },
  { id: "exec5", label: "Exec 5", type: "exec" as const },
] as const;

const DEFAULT_WEEKDAY_TIME_SLOTS = ["06.00PM - 07.15PM", "07:15PM - 08:30PM", "08.30PM - 09:45PM"] as const;
const DEFAULT_WEEKEND_TIME_SLOTS = ["09:15 AM – 10:30 AM", "10:30 AM – 11:45 AM", "12:00 PM – 1:15 PM", "1:15 PM – 2:30 PM", "2:45 PM – 4:00 PM", "4:00 PM – 5:15 PM", "5:30 PM – 6:45 PM"] as const;
const TAIPAN_WEEKDAY_TIME_SLOTS = ["4:15 PM", "04.30PM - 05.45PM", "06.00PM - 07.15PM", "07:15PM - 08:30PM", "08.30PM - 09:45PM", "10:00 PM"] as const;

export const BRANCH_SLOTS_CONFIG: Record<string, { weekday: readonly string[], weekend: readonly string[] }> = {
  "Subang Taipan": { weekday: TAIPAN_WEEKDAY_TIME_SLOTS, weekend: DEFAULT_WEEKEND_TIME_SLOTS },
  "default": { weekday: DEFAULT_WEEKDAY_TIME_SLOTS, weekend: DEFAULT_WEEKEND_TIME_SLOTS }
};

export function getTimeSlotsForDay(day: string, branchName: string): readonly string[] {
  const config = BRANCH_SLOTS_CONFIG[branchName] || BRANCH_SLOTS_CONFIG["default"];
  return WEEKDAY_DAYS.includes(day as any) ? config.weekday : config.weekend;
}

export function isAdminSlot(slot: string, branchName: string) {
  if (branchName === "Subang Taipan") return ["4:15 PM", "10:00 PM"].includes(slot);
  return ["5:00 PM", "10:00 PM", "08:45 AM – 09:15 AM", "11:45 AM – 12:00 PM", "2:30 PM – 2:45 PM", "5:15 PM – 5:30 PM", "6:45 PM – 7:15 PM"].includes(slot);
}

export const SELECT_ARROW_WHITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 8L1 3h10z'/%3E%3C/svg%3E";
export const SELECT_ARROW_DARK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E";