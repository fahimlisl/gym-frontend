import { useState } from "react";
import toast from "react-hot-toast";
import { markAttendance } from "../../../api/attendence.api.js";

export default function MarkAttendance({ onMarked }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMark = async () => {
    if (!phoneNumber) return toast.error("Enter phone number");

    try {
      setLoading(true);

      await markAttendance({
        phoneNumber: Number(phoneNumber), 
        source: "MANUAL",
      });

      toast.success("Attendance marked");
      setPhoneNumber("");

      onMarked?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-red-400 mb-4">
        Mark Attendance
      </h2>

      <input
        type="number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter Phone Number"
        className="w-full bg-black border border-[#2a2a2a] rounded-md p-3 text-white focus:border-red-500 outline-none"
      />

      <button
        disabled={loading}
        onClick={handleMark}
        className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 transition py-2 rounded-md font-semibold"
      >
        {loading ? "Marking..." : "Mark Present"}
      </button>
    </div>
  );
}
