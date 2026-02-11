import { useState } from "react";
import { getMonthlyAttendance } from "../../../api/attendence.api.js";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function MonthlyAttendanceMatrix() {
  const currentMonth = new Date().toISOString().slice(0, 7);
const [month, setMonth] = useState(currentMonth);
  const [members, setMembers] = useState({});
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!month) return toast.error("Select a month");

    try {
      setLoading(true);
      const res = await getMonthlyAttendance(month);
      const attendance = res.data.attendance;

      const [year, mon] = month.split("-");
      const totalDays = new Date(year, mon, 0).getDate();
      const days = Array.from({ length: totalDays }, (_, i) =>
        String(i + 1).padStart(2, "0")
      );
      setDaysInMonth(days);

      const grouped = {};

      attendance.forEach((a) => {
        const id = a.member._id;
        const day = a.date.split("-")[2];

        if (!grouped[id]) {
          grouped[id] = {
            memberId: id,
            username: a.member.username,
            phoneNumber: a.member.phoneNumber,
            presentDates: new Set(),
          };
        }

        grouped[id].presentDates.add(day);
      });

      setMembers(grouped);
    } catch (err) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!month || Object.keys(members).length === 0) {
      return toast.error("No data to export");
    }

    const header = ["Member Name", "Contact No", ...daysInMonth];

    const rows = Object.values(members).map((m) => {
      const row = [
        m.username,
        m.phoneNumber || "",
      ];

      daysInMonth.forEach((day) => {
        row.push(m.presentDates.has(day) ? "P" : "A");
      });

      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Attendance ${month}`
    );

    XLSX.writeFile(workbook, `Attendance_${month}.xlsx`);
  };

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-red-400">
          Monthly Attendance Matrix
        </h2>

        <div className="flex gap-2">

          <input
  type="month"
  value={month}
  onChange={(e) => setMonth(e.target.value)}
  className="bg-black border border-[#2a2a2a] p-2 rounded-md text-white"
/>


          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-500 px-4 rounded-md font-semibold"
          >
            Load
          </button>

          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-500 px-4 rounded-md font-semibold"
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading attendance...</p>
      )}

      {!loading && Object.keys(members).length === 0 && (
        <p className="text-gray-500 text-sm">
          No attendance data for this month
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs w-full">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[#111] z-10 px-3 py-2 border border-[#1f1f1f] text-gray-400 text-left">
                Member
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-2 py-2 border border-[#1f1f1f] text-gray-500"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.values(members).map((m) => (
              <tr key={m.memberId}>
                <td className="sticky left-0 bg-black px-3 py-2 border border-[#1f1f1f] text-white font-medium">
                  {m.username}
                </td>

                {daysInMonth.map((day) => (
                  <td
                    key={day}
                    className="text-center border border-[#1f1f1f]"
                  >
                    {m.presentDates.has(day) ? (
                      <span className="text-green-500 font-bold">●</span>
                    ) : (
                      <span className="text-gray-700">–</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="text-green-500">●</span> Present (P)
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600">–</span> Absent (A)
        </div>
      </div>
    </div>
  );
}
