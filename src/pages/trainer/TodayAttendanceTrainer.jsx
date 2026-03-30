import { useEffect, useState } from "react";
import { getTodayAttendanceTrainer } from "../../api/attendence.api";

export default function TodayAttendanceTrainer() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTodayAttendanceTrainer().then((res) => {
      setData(res.data.attendance);
    });
  }, []);

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-red-400 mb-4">
        Today’s Attendance
      </h2>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {data.map((a) => (
          <div
            key={a._id}
            className="flex items-center justify-between bg-black border border-[#1f1f1f] p-3 rounded-md"
          >
            <div>
              <p className="font-medium">{a.member.username || "Member"}</p>
              <p className="text-sm text-gray-400">
                {new Date(a.checkIn).toLocaleTimeString()}
              </p>
            </div>
            <span className="text-xs text-red-400">{a.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
};