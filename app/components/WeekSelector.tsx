"use client";

import { useState } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { format, startOfWeek, endOfWeek } from "date-fns";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 

interface WeekSelectorProps {
  onConfirm: (weekData: string) => void;
}

export default function WeekSelector({ onConfirm }: WeekSelectorProps) {
  // 1. Keep track of the currently viewed month
  const [shownDate, setShownDate] = useState(new Date());
  
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleConfirm = () => {
    const { startDate, endDate } = range[0];
    if (!startDate || !endDate) return;
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");
    onConfirm(`start=${start}&end=${end}`);
  };

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center">
      <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight text-center">Select a Week</h2>
      
      <div className="flex justify-center w-full overflow-hidden mb-6">
        <DateRange
          onChange={(item: RangeKeyDict) => {
            const selection = item.selection;
            if (selection.startDate) {
              const start = startOfWeek(selection.startDate, { weekStartsOn: 1 }); 
              const end = endOfWeek(selection.startDate, { weekStartsOn: 1 });

              setRange([{
                startDate: start,
                endDate: end,
                key: "selection",
              }]);
            }
          }}
          // 2. Add these two props to prevent the calendar from jumping!
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
        disabled={!range[0].startDate || !range[0].endDate}
        onClick={handleConfirm}
        className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 font-black uppercase tracking-widest transition-colors shadow-md text-sm"
      >
        Confirm Week: {format(range[0].startDate, "dd MMM yyyy")} – {format(range[0].endDate, "dd MMM yyyy")}
      </button>
    </div>
  );
}