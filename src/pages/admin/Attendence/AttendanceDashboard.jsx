import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getTodayAttendance,
  markAttendance,
} from "../../../api/attendence.api.js";

import MonthlyAttendance from "./MonthlyAttendance.jsx";

export default function AttendanceDashboard() {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const res = await getTodayAttendance();
      setTodayAttendance(res.data.attendance);
    } catch (err) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    if (!phoneNumber) return toast.error("Enter phone number");


    try {
      setLoading(true);

      const payload = {
        phoneNumber: phoneNumber, 
        source: "MANUAL",
      };

      await markAttendance(payload);
      
      toast.success("Attendance marked successfully");
      setPhoneNumber("");

      await fetchTodayAttendance();
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response);
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">
            Mark Attendance
          </h2>

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
            }}
            placeholder="Enter Phone Number"
            className="w-full bg-black border border-[#2a2a2a] rounded-md p-3 text-white focus:border-red-500 outline-none transition-colors"
          />

          <button
            disabled={loading}
            onClick={handleMarkAttendance}
            className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all py-2.5 rounded-md font-semibold"
          >
            {loading ? "Processing..." : "Mark Present"}
          </button>
        </div>

        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-400">
              Today's Attendance
            </h2>
            {loading && (
              <span className="text-xs text-gray-400 animate-pulse">
                Refreshing...
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {todayAttendance.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No attendance marked yet today</p>
              </div>
            )}

            {todayAttendance.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between bg-black border border-[#1f1f1f] p-3 rounded-md hover:border-[#2a2a2a] transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {a.member?.username || "Member"}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(a.checkIn).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">
                  {a.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MonthlyAttendance />
    </div>
  );
}