"use client";

import { useState } from "react";

interface AcademyEvent {
  id: string;
  name: string;
  from: string;
  to: string;
  location: string;
  organizers: string;
  remarks: string;
}

const initialEvents: AcademyEvent[] = [
  {
    id: "1",
    name: "Trinity Exam Communication Skills",
    from: "2026-05-07",
    to: "2026-05-10",
    location: "Ebright Subang Taipan",
    organizers: "John Doe",
    remarks: "Mandatory for all staff",
  },
  {
    id: "2",
    name: "April Showcase",
    from: "2026-04-18",
    to: "2026-04-19",
    location: "Spanish Steps (Sunway University)",
    organizers: "Jane Smith",
    remarks: "Annual event",
  },
  {
    id: "3",
    name: "World Scholar's Cup KL Round",
    from: "2026-04-07",
    to: "2026-04-08",
    location: "Bukit International School KL",
    organizers: "Admin Team",
    remarks: "Regional competition",
  },
];

export default function AcademyEventManagement() {
  const [events, setEvents] = useState<AcademyEvent[]>(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    from: "",
    to: "",
    location: "",
    organizers: "",
    remarks: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Event name is required");
      return;
    }

    if (editingId) {
      // Update existing event
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingId
            ? { ...event, ...formData }
            : event
        )
      );
      setEditingId(null);
    } else {
      // Add new event
      const newEvent: AcademyEvent = {
        id: Date.now().toString(),
        ...formData,
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    // Reset form
    setFormData({
      name: "",
      from: "",
      to: "",
      location: "",
      organizers: "",
      remarks: "",
    });
  };

  const handleEditEvent = (event: AcademyEvent) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      from: event.from,
      to: event.to,
      location: event.location,
      organizers: event.organizers,
      remarks: event.remarks,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: "",
      from: "",
      to: "",
      location: "",
      organizers: "",
      remarks: "",
    });
  };

  return (
    <div>
      {/* Existing Events Section */}
      <div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Existing Events ({events.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Event Name
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Dates
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-800">{event.name}</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {event.from} to {event.to}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold mr-2 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Event Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {editingId ? "Edit Event" : "Add New Event"}
        </h2>
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From *
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To *
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organizers
            </label>
            <input
              type="text"
              name="organizers"
              value={formData.organizers}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              {editingId ? "Update Event" : "Save Event"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
