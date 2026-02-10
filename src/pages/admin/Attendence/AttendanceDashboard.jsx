import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getTodayAttendance,
  markAttendance,
} from "../../../api/attendence.api.js";

import MonthlyAttendance from "./MonthlyAttendance.jsx";

export default function AttendanceDashboard() {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [memberId, setMemberId] = useState("");
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
    if (!memberId) return toast.error("Enter Member ID");

    try {
      setLoading(true);
      await markAttendance({ memberId, source: "MANUAL" });
      toast.success("Attendance marked");
      setMemberId("");


      await fetchTodayAttendance();
    } catch (err) {
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
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Enter Member ID"
            className="w-full bg-black border border-[#2a2a2a] rounded-md p-3 text-white focus:border-red-500 outline-none"
          />

          <button
            disabled={loading}
            onClick={handleMarkAttendance}
            className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 transition py-2 rounded-md font-semibold"
          >
            {loading ? "Processing..." : "Mark Present"}
          </button>
        </div>


        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">
            Today’s Attendance
          </h2>

          {loading && (
            <p className="text-gray-400 text-sm mb-3">Refreshing...</p>
          )}

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {todayAttendance.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">No attendance yet</p>
            )}

            {todayAttendance.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between bg-black border border-[#1f1f1f] p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {a.member?.username || "Member"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(a.checkIn).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-xs text-red-400">{a.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MonthlyAttendance />
    </div>
  );
}
