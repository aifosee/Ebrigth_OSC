"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  accessStatus: string;
  registeredAt: string;
  updatedAt: string;
}

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Fetch the first employee (Super Admin) as current user
      // In a real app, this would fetch the authenticated user
      const response = await fetch("/api/employees");
      const employees = await response.json();
      
      if (Array.isArray(employees) && employees.length > 0) {
        setUserData(employees[0]);
        setEditData(employees[0]);
      } else {
        setError("No user data found");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load profile data");
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    if (userData) {
      setEditData({ ...userData });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (userData) {
      setEditData({ ...userData });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editData) {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    if (!editData) return;
    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        setUserData(editData);
        setEditMode(false);
      } else {
        setError("Failed to save profile changes");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirm password do not match" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password updated successfully" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPasswordMessage(null), 3000);
      } else {
        setPasswordMessage({ type: "error", text: "Failed to update password" });
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <div className="spinner inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error</p>
          <p>{error || "No profile data available"}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    return status === "AUTHORIZED" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {editMode ? (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="firstName"
                    value={editData?.firstName || ""}
                    onChange={handleInputChange}
                    className="px-3 py-1 border border-gray-300 rounded text-2xl"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={editData?.lastName || ""}
                    onChange={handleInputChange}
                    className="px-3 py-1 border border-gray-300 rounded text-2xl"
                  />
                </div>
              ) : (
                `${userData.firstName} ${userData.lastName}`
              )}
            </h2>
            <p className="text-gray-600 text-lg">{userData.role}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(userData.accessStatus)}`}>
            {userData.accessStatus === "AUTHORIZED" ? "✓ Authorized" : "✗ Unauthorized"}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Information */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Employee ID */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Employee ID</label>
              {editMode ? (
                <input
                  type="text"
                  name="employeeId"
                  value={editData?.employeeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userData.employeeId}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Email</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={editData?.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 break-all">{userData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={editData?.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userData.phone}</p>
              )}
            </div>

            {/* Branch */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Branch</label>
              {editMode ? (
                <input
                  type="text"
                  name="branch"
                  value={editData?.branch || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userData.branch}</p>
              )}
            </div>

            {/* Role */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Role</label>
              {editMode ? (
                <input
                  type="text"
                  name="role"
                  value={editData?.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userData.role}</p>
              )}
            </div>

            {/* Access Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Access Status</label>
              <p className={`text-lg font-medium ${userData.accessStatus === "AUTHORIZED" ? "text-green-700" : "text-red-700"}`}>
                {userData.accessStatus}
              </p>
            </div>

            {/* Registration Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Registered On</label>
              <p className="text-lg font-medium text-gray-900">{formatDate(userData.registeredAt)}</p>
            </div>

            {/* Last Updated */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Last Updated</label>
              <p className="text-lg font-medium text-gray-900">{formatDate(userData.updatedAt)}</p>
            </div>
          </div>

          {/* Save Changes Button */}
          {editMode && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                💾 {savingProfile ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={savingProfile}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Change Password */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔒 Change Password</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">Leave password fields empty if you don&apos;t want to change your password.</p>

            {/* Current Password */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirm New Password */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Message */}
            {passwordMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${
                passwordMessage.type === "success" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {passwordMessage.text}
              </div>
            )}

            {/* Update Password Button */}
            <button
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🔑 {updatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Action Section */}
      {!editMode && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleEditClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            ✏️ Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
