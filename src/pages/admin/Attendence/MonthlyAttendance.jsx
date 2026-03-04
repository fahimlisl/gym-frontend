import { useState } from "react";
import { getMonthlyAttendance } from "../../../api/attendence.api.js";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function MonthlyAttendanceMatrix() {

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonth);
  const [members, setMembers] = useState([]);
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

      const membersArray = Object.values(grouped).map((m) => {

        const totalPresent = m.presentDates.size;
        const percentage = ((totalPresent / totalDays) * 100).toFixed(1);

        return {
          ...m,
          totalPresent,
          percentage: Number(percentage),
        };

      });

      membersArray.sort((a, b) => {
        const diff = a.totalPresent - b.totalPresent;
        if (diff !== 0) return diff;
        return a.username.localeCompare(b.username);
      });

      setMembers(membersArray);

    } catch {

      toast.error("Failed to load attendance");

    } finally {

      setLoading(false);

    }
  };

  const exportToExcel = () => {

    if (!month || members.length === 0) {
      return toast.error("No data to export");
    }

    const header = [
      "Member Name",
      "Contact No",
      "Total Present",
      "Attendance %",
      ...daysInMonth,
    ];

    const rows = members.map((m) => {

      const row = [
        m.username,
        m.phoneNumber || "",
        m.totalPresent,
        `${m.percentage}%`,
      ];

      daysInMonth.forEach((day) => {
        row.push(m.presentDates.has(day) ? "P" : "A");
      });

      return row;

    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance ${month}`);

    XLSX.writeFile(workbook, `Attendance_${month}.xlsx`);
  };

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 sm:p-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <h2 className="text-lg sm:text-xl font-semibold text-red-400">
          Monthly Attendance Matrix
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-black border border-[#2a2a2a] p-2 rounded-md text-white w-full sm:w-auto"
          />

          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md font-semibold text-sm"
          >
            Load
          </button>

          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-semibold text-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">
          Loading attendance...
        </p>
      )}

      {!loading && members.length === 0 && (
        <p className="text-gray-500 text-sm">
          No attendance data for this month
        </p>
      )}

      <div className="overflow-x-auto">

        <table className="border-collapse text-[10px] sm:text-xs min-w-[900px] w-full">

          <thead>

            <tr>

              <th className="sticky left-0 bg-[#111] z-10 px-3 py-2 border border-[#1f1f1f] text-gray-400 text-left whitespace-nowrap">
                Member
              </th>

              <th className="px-2 py-2 border border-[#1f1f1f] text-gray-400 whitespace-nowrap">
                Present
              </th>

              <th className="px-2 py-2 border border-[#1f1f1f] text-gray-400 whitespace-nowrap">
                %
              </th>

              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-1 py-2 border border-[#1f1f1f] text-gray-500 w-[26px]"
                >
                  {day}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {members.map((m) => {

              const isCritical = m.totalPresent < 4;
              const isBelow50 = m.percentage < 50;

              return (
                <tr
                  key={m.memberId}
                  className={isCritical ? "bg-red-900/30" : ""}
                >

                  <td className="sticky left-0 bg-black px-3 py-2 border border-[#1f1f1f] text-white font-medium whitespace-nowrap">
                    {m.username}
                  </td>

                  <td
                    className={`text-center border border-[#1f1f1f] font-semibold px-2 ${
                      isCritical ? "text-red-400" : "text-gray-300"
                    }`}
                  >
                    {m.totalPresent}
                  </td>

                  <td
                    className={`text-center border border-[#1f1f1f] font-bold px-2 ${
                      isBelow50 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {m.percentage}%
                  </td>

                  {daysInMonth.map((day) => (
                    <td
                      key={day}
                      className="text-center border border-[#1f1f1f] px-1"
                    >
                      {m.presentDates.has(day) ? (
                        <span className="text-green-500 font-bold">
                          ●
                        </span>
                      ) : (
                        <span className="text-gray-700">–</span>
                      )}
                    </td>
                  ))}

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">

        <div className="flex items-center gap-1">
          <span className="text-green-500">●</span> Present
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600">–</span> Absent
        </div>

        <div className="flex items-center gap-1">
          <span className="bg-red-900/30 px-2 rounded-sm">Row</span>
          Attendance below 4 days
        </div>

      </div>

    </div>
  );
}