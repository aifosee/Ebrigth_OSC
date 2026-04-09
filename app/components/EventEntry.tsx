"use client";

import { useState } from "react";

interface Event {
  id: string;
  name: string;
  date: string;
  tier: string;
  status: "upcoming" | "ongoing" | "completed";
  type: "qual" | "tier1" | "tier2" | "tier3" | "shown";
  location: string;
}

const events: Event[] = [
  // Upcoming Events
  { id: "1", name: "Annual Company Summit 2026", date: "Apr 02-03", tier: "Qual", status: "upcoming", type: "qual", location: "Ebright Subang Taipan" },
  { id: "2", name: "Regional Sales Conference", date: "Apr 02-03", tier: "Qual", status: "upcoming", type: "qual", location: "Spanish Steps (Sunway University)" },
  { id: "3", name: "Product Launch Event", date: "Apr 02-03", tier: "Tier 1", status: "upcoming", type: "tier1", location: "Bukit International School KL" },
  { id: "4", name: "Team Building Retreat", date: "Mar 31", tier: "Tier 1", status: "upcoming", type: "tier1", location: "Ebright Subang Taipan" },
  { id: "5", name: "Quarterly Awards Ceremony", date: "Mar 30", tier: "Qual", status: "upcoming", type: "qual", location: "Convention Center KL" },
  { id: "6", name: "Tech Conference 2026", date: "Mar 30", tier: "Tier 3", status: "upcoming", type: "tier3", location: "Kuala Lumpur Convention Centre" },
  { id: "7", name: "Spring Networking Event", date: "Mar 29", tier: "Tier 3", status: "upcoming", type: "tier3", location: "Banquet Hall, Petaling Jaya" },
  { id: "8", name: "Department Summit", date: "Mar 22-29", tier: "Tier 1", status: "upcoming", type: "tier1", location: "Ebright Subang Taipan" },
  { id: "9", name: "HR Training Session", date: "Mar 21", tier: "Shown", status: "upcoming", type: "shown", location: "Training Room A" },
  { id: "10", name: "Team Bonding Activity", date: "Mar 16-22", tier: "Shown", status: "upcoming", type: "shown", location: "Outdoor Venue, Subang" },
  { id: "11", name: "Leadership Workshop", date: "Mar 12-20", tier: "Tier 3", status: "upcoming", type: "tier3", location: "Hilton Kuala Lumpur" },
  { id: "12", name: "Compliance Training", date: "Mar 07-15", tier: "Tier 1", status: "upcoming", type: "tier1", location: "Training Room B" },
  
  // Ongoing Events
  { id: "13", name: "Q1 Performance Review", date: "Mar 04-26", tier: "Tier 3", status: "ongoing", type: "tier3", location: "HR Department" },
  { id: "14", name: "Skills Development Program", date: "Mar 01-21", tier: "Tier 3", status: "ongoing", type: "tier3", location: "E-Learning Platform" },
  { id: "15", name: "Innovation Challenge", date: "Feb 28 - Mar 08", tier: "Tier 3", status: "ongoing", type: "tier3", location: "Innovation Lab" },
  
  // Completed Events
  { id: "16", name: "Annual Awards Ceremony", date: "Feb 07 - Mar 05", tier: "Tier 3", status: "completed", type: "tier3", location: "Grand Ballroom" },
  { id: "17", name: "Winter Conference 2026", date: "Feb 16 - Mar 01", tier: "Tier 1", status: "completed", type: "tier1", location: "Sunway Pyramid Convention Centre" },
  { id: "18", name: "Employee Recognition Event", date: "Feb 19-28", tier: "Tier 3", status: "completed", type: "tier3", location: "Ebright Subang Taipan" },
  { id: "19", name: "Safety Training Session", date: "Feb 02-21", tier: "Tier 3", status: "completed", type: "tier3", location: "Training Room C" },
  { id: "20", name: "Team Lunch Gathering", date: "Feb 12-20", tier: "Tier 3", status: "completed", type: "tier3", location: "Restaurant, Subang Jaya" },
  { id: "21", name: "Onboarding Program", date: "Jan 31 - Feb 17", tier: "Tier 3", status: "completed", type: "tier3", location: "HR Training Center" },
  { id: "22", name: "Company Town Hall", date: "Feb 03-15", tier: "Tier 1", status: "completed", type: "tier1", location: "Main Auditorium" },
];

type TabType = "upcoming" | "ongoing" | "completed";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "qual":
      return "🏆";
    case "tier1":
      return "⭐";
    case "tier2":
      return "📊";
    case "tier3":
      return "📋";
    case "shown":
      return "📺";
    default:
      return "📅";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "upcoming":
      return { bg: "bg-blue-500", text: "text-white", label: "Soon" };
    case "ongoing":
      return { bg: "bg-green-500", text: "text-white", label: "Live" };
    case "completed":
      return { bg: "bg-gray-500", text: "text-white", label: "Done" };
    default:
      return { bg: "bg-gray-500", text: "text-white", label: "Event" };
  }
};

const tabs: TabType[] = ["upcoming", "ongoing", "completed"];

export default function EventEntry() {
  const [expandedSections, setExpandedSections] = useState<Record<TabType, boolean>>({
    upcoming: true,
    ongoing: true,
    completed: true,
  });

  const toggleSection = (tab: TabType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [tab]: !prev[tab],
    }));
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-red-700 p-4 flex items-center justify-start">
        <h2 className="text-xl font-bold">📅 Event Entry</h2>
      </div>

      {/* Expandable Sections */}
      <div className="bg-gray-800 p-3 space-y-3">
        {tabs.map((tab) => {
          const filteredEvents = events.filter((event) => event.status === tab);
          const tabTitle = tab.charAt(0).toUpperCase() + tab.slice(1);
          const isExpanded = expandedSections[tab];

          return (
            <div key={tab} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Expandable Header */}
              <button
                onClick={() => toggleSection(tab)}
                className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 flex items-center justify-center transition-colors relative"
              >
                <h3 className="text-sm font-bold text-gray-100">{tabTitle}</h3>
                <span className={`text-lg transition-transform absolute right-3 ${isExpanded ? "" : "-rotate-90"}`}>
                  ▼
                </span>
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="space-y-1 p-2 bg-gray-800">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const badge = getStatusBadge(event.status);
                      const icon = getTypeIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          className="px-3 py-2 hover:bg-gray-700 transition-colors cursor-pointer flex flex-col gap-1 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            <div
                              className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex items-center justify-center min-w-12`}
                            >
                              {badge.label}
                            </div>

                            {/* Icon and Event Name */}
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                              <span className="text-lg">{icon}</span>
                              <span className="text-sm font-semibold truncate">{event.name}</span>
                            </div>

                            {/* Date */}
                            <div className="text-right whitespace-nowrap">
                              <p className="text-xs text-gray-400">{event.date}</p>
                            </div>
                          </div>
                          
                          {/* Location */}
                          <div className="pl-14 text-xs text-gray-400">
                            📍 {event.location}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-center text-gray-500 text-sm">
                      No {tab} events
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
