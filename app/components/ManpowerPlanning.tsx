"use client";

import { useState } from "react";

const COLUMNS = ["Iqbal", "Ying Chen", "Adam", "Eswarr", "Ashwin", "Faiq"] as const;
type Column = (typeof COLUMNS)[number];
type RoleValue = "" | "exec" | "coach";

const DAYS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const WEEKDAY_TIME_SLOTS = [
  "06:00 PM – 07:15 PM",
  "07:15 PM – 08:30 PM",
] as const;

const WEEKEND_TIME_SLOTS = [
  "09:15 AM – 10:30 AM",
  "10:30 AM – 11:45 AM",
  "12:00 PM – 1:15 PM",
  "1:15 PM – 2:30 PM",
  "2:45 PM – 4:00 PM",
  "4:00 PM – 5:15 PM",
  "5:30 PM – 6:45 PM",
] as const;

const WEEKDAY_DAYS = ["Wednesday", "Thursday", "Friday"] as const;

function getTimeSlotsForDay(day: string): readonly string[] {
  return WEEKDAY_DAYS.includes(day as (typeof WEEKDAY_DAYS)[number])
    ? WEEKDAY_TIME_SLOTS
    : WEEKEND_TIME_SLOTS;
}

const SELECT_ARROW_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E";

export default function Page() {
  const [selections, setSelections] = useState<Record<string, RoleValue>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleSelect = (
    day: string,
    time: string,
    column: Column,
    value: RoleValue,
  ) => {
    const key = `${day}-${time}-${column}`;
    setSelections((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNoteChange = (day: string, time: string, value: string) => {
    const key = `${day}-${time}-notes`;
    setNotes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div
      className="min-h-screen bg-[#f5f6f8] p-8 text-[#1a1d23] [font-family:Segoe_UI,system-ui,-apple-system,sans-serif]"
    >
      {DAYS.map((day) => (
        <div
          key={day}
          className="mx-auto mb-8 w-full max-w-[95%] overflow-hidden rounded-[10px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] last:mb-0"
        >
          <header className="border-b border-[#e8eaed] bg-white px-8 py-6">
            <h1 className="m-0 text-[1.5rem] font-semibold text-[#1a1d23]">
              {day}
            </h1>
            <p className="m-0 mt-1 text-[0.9rem] text-[#5f6368]">
              Manpower planning – Date of the week (Monday – Friday)
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1550px] table-auto border-separate border-spacing-0 text-[0.9rem]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[250px] border border-[#e0e2e6] bg-[#2c3e50] px-6 py-4 text-left font-semibold text-white whitespace-nowrap align-middle">
                    Time slot
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="min-w-[200px] border border-[#e0e2e6] bg-[#2c3e50] px-3 py-[0.6rem] text-center font-semibold text-white whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="min-w-[200px] border border-[#e0e2e6] bg-[#2c3e50] px-3 py-[0.6rem] text-left font-semibold text-white whitespace-nowrap">
                    Notes / Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {getTimeSlotsForDay(day).map((slot) => (
                  <tr
                    key={slot}
                    className="even:bg-[#fafbfc] hover:bg-[#f0f4f8]"
                  >
                    <td className="sticky left-0 z-10 border border-[#e0e2e6] bg-white px-6 py-4 align-middle font-medium whitespace-nowrap">
                      {slot}
                    </td>

                    {COLUMNS.map((col) => {
                      const selectionKey = `${day}-${slot}-${col}`;

                      return (
                        <td
                          key={col}
                          className="min-w-[200px] border border-[#e0e2e6] px-6 py-4 align-middle text-center"
                        >
                          <select
                            value={selections[selectionKey] ?? ""}
                            onChange={(e) =>
                              handleSelect(
                                day,
                                slot,
                                col,
                                e.target.value as RoleValue,
                              )
                            }
                            className="w-full min-w-0 cursor-pointer appearance-none rounded-[6px] border border-[#d0d4d9] bg-white bg-no-repeat px-[0.6rem] py-[0.45rem] pr-7 text-[0.875rem] text-center hover:border-[#2c3e50] focus:border-[#2c3e50] focus:outline-none"
                            style={{
                              backgroundImage: `url("${SELECT_ARROW_DATA_URI}")`,
                              backgroundPosition: "right 0.5rem center",
                            }}
                          >
                            <option className="text-center" value="">
                              — None —
                            </option>
                            <option className="text-center" value="exec">
                              Executive
                            </option>
                            <option className="text-center" value="coach">
                              Coach
                            </option>
                          </select>
                        </td>
                      );
                    })}

                    <td className="min-w-[200px] border border-[#e0e2e6] px-3 py-[0.6rem] align-middle">
                      <textarea
                        value={notes[`${day}-${slot}-notes`] ?? ""}
                        onChange={(e) =>
                          handleNoteChange(day, slot, e.target.value)
                        }
                        placeholder="Notes…"
                        rows={1}
                        className="min-h-[2.2rem] w-full resize-y rounded-[6px] border border-[#d0d4d9] px-[0.6rem] py-[0.45rem] text-[0.875rem] focus:border-[#2c3e50] focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}