import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

const toYYYYMM = (d) => d.toISOString().slice(0, 7);
const toYYYYMMDD = (d) => d.toISOString().slice(0, 10);

const IST_OFFSET = 5.5 * 60 * 60000;
const nowIST = () => new Date(Date.now() + IST_OFFSET);

function getDaysInMonth(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function getFirstDayOfWeek(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay(); // 0=Sun
}
function formatDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(checkOut) - new Date(checkIn);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function StatPill({ label, value, accent, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/6 group"
      style={{ background: "linear-gradient(145deg,#0e0e0e,#111)" }}
    >
      <div className="absolute left-0 inset-y-0 w-[3px] rounded-l-2xl" style={{ background: accent }} />
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle,${accent}22,transparent 70%)` }}
      />
      <div className="pl-3">
        <span className="text-lg mb-2 block">{icon}</span>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-semibold mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tight" style={{ color: accent }}>{value}</p>
      </div>
    </motion.div>
  );
}

function HeatmapCalendar({ month, presentDays, todayStr }) {
  const days = getDaysInMonth(month);
  const startDow = getFirstDayOfWeek(month);
  const [y, m] = month.split("-");
  const cells = [];

  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const dateStr = `${y}-${m}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }

  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="rounded-2xl border border-white/6 overflow-hidden" style={{ background: "#0b0b0b" }}>
      <div className="px-5 pt-5 pb-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-semibold">Attendance Map</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#22c55e40", border: "1px solid #22c55e50" }} />
          <span className="text-[9px] text-white/20 tracking-widest">PRESENT</span>
          <span className="w-3 h-3 rounded-sm ml-2" style={{ background: "#1a1a1a", border: "1px solid #ffffff0d" }} />
          <span className="text-[9px] text-white/20 tracking-widest">ABSENT</span>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DOW.map((d) => (
            <div key={d} className="text-center text-[8px] tracking-widest text-white/15 font-bold py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`e-${i}`} />;
            const isPresent = presentDays.has(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isFuture = cell.dateStr > todayStr;

            return (
              <motion.div
                key={cell.dateStr}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.008, duration: 0.3, ease: "easeOut" }}
                title={cell.dateStr}
                className="relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-200"
                style={{
                  background: isPresent
                    ? "rgba(34,197,94,0.18)"
                    : isFuture
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.04)",
                  border: isToday
                    ? "1.5px solid rgba(239,68,68,0.7)"
                    : isPresent
                    ? "1px solid rgba(34,197,94,0.35)"
                    : "1px solid rgba(255,255,255,0.05)",
                  color: isPresent ? "#22c55e" : isFuture ? "#333" : "#3a3a3a",
                  boxShadow: isPresent ? "0 0 8px rgba(34,197,94,0.15)" : "none",
                }}
              >
                {cell.day}
                {isPresent && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#22c55e" }}
                  />
                )}
                {isToday && !isPresent && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#ef4444" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecordRow({ record, index }) {
  const checkInTime = formatTime(record.checkIn);
  const checkOutTime = formatTime(record.checkOut);
  const duration = formatDuration(record.checkIn, record.checkOut);
  const [, , dd] = record.date.split("-");
  const dayName = new Date(record.date).toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-150"
    >
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <span className="text-[8px] font-bold text-emerald-500/60 tracking-widest leading-none">{dayName}</span>
        <span className="text-sm font-black text-emerald-400 leading-tight">{dd}</span>
      </div>

      <div className="flex-1 flex items-center gap-6 min-w-0">
        <div>
          <p className="text-[9px] tracking-[0.25em] text-white/20 uppercase mb-0.5">Check In</p>
          <p className="text-sm font-bold text-white/80">{checkInTime}</p>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
          <span className="text-white/10 text-xs">→</span>
        </div>
        <div>
          <p className="text-[9px] tracking-[0.25em] text-white/20 uppercase mb-0.5">Check Out</p>
          <p className="text-sm font-bold text-white/80">{checkOutTime}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {duration ? (
          <>
            <p className="text-[9px] tracking-[0.25em] text-white/20 uppercase mb-0.5">Duration</p>
            <p className="text-sm font-black text-orange-400">{duration}</p>
          </>
        ) : (
          <span
            className="text-[9px] px-2 py-1 rounded-md font-semibold tracking-widest"
            style={{ background: "rgba(239,68,68,0.1)", color: "rgba(239,68,68,0.5)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            NO CHECKOUT
          </span>
        )}
      </div>

      <div className="shrink-0 hidden sm:block">
        <span
          className="text-[8px] font-bold px-2 py-1 rounded-md tracking-widest"
          style={{
            background: record.source === "QR" ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.05)",
            color: record.source === "QR" ? "rgba(168,85,247,0.8)" : "rgba(255,255,255,0.2)",
            border: `1px solid ${record.source === "QR" ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {record.source}
        </span>
      </div>
    </motion.div>
  );
}
export default function TrainerMyAttendance() {
  const todayIST = nowIST();
  const todayStr = toYYYYMMDD(todayIST);
  const [month, setMonth] = useState(toYYYYMM(todayIST));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/trainer/attendance/trainer/my?month=${month}`)
      .then((res) => setRecords(res.data.attendance || []))
      .catch(() => toast.error("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [month]);

  const presentDays = useMemo(() => new Set(records.map((r) => r.date)), [records]);

  const totalDays = getDaysInMonth(month);
  const workingDays = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    let count = 0;
    for (let d = 1; d <= totalDays; d++) {
      const dow = new Date(y, m - 1, d).getDay();
      if (dow !== 0) count++; // exclude Sunday
    }
    return count;
  }, [month, totalDays]);

  const presentCount = records.length;
  const absentCount = Math.max(0, workingDays - presentCount);
  const pct = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;

  const totalMins = useMemo(() => {
    return records.reduce((acc, r) => {
      if (!r.checkIn || !r.checkOut) return acc;
      return acc + (new Date(r.checkOut) - new Date(r.checkIn)) / 60000;
    }, 0);
  }, [records]);

  const avgHours = records.length > 0
    ? `${Math.floor(totalMins / records.length / 60)}h ${Math.round((totalMins / records.length) % 60)}m`
    : "—";

  const changeMonth = (dir) => {
    const [currentYear, currentMonth] = month.split("-").map(Number);
    let newYear = currentYear;
    let newMonth = currentMonth + dir;
    
    if (newMonth > 12) {
      newYear++;
      newMonth = 1;
    } else if (newMonth < 1) {
      newYear--;
      newMonth = 12;
    }
    
    const newDate = new Date(newYear, newMonth - 1, 1);
    const currentDate = new Date(currentYear, currentMonth - 1, 1);
    const todayDate = new Date(todayIST.getFullYear(), todayIST.getMonth(), 1);
    
    if (newDate > todayDate) return;
    
    const newMonthStr = String(newMonth).padStart(2, "0");
    setMonth(`${newYear}-${newMonthStr}`);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808" }}>
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "linear-gradient(180deg,#0d0d0d,#080808)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.4) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-96 h-52 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(34,197,94,0.09),transparent 70%)", filter: "blur(30px)" }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-emerald-500/60">
                  Trainer Portal
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-2">
                MY{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ATTENDANCE
                </span>
              </h1>
              <p className="text-white/25 text-sm font-light tracking-wide">
                {loading ? "Loading..." : `${presentCount} days present · ${pct}% this month`}
              </p>
            </div>

            <div
              className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/6 transition-all text-xs"
              >
                ‹
              </button>
              <span className="px-4 text-xs font-bold tracking-[0.2em] text-white/60 uppercase min-w-[140px] text-center">
                {monthLabel(month)}
              </span>
              <button
                onClick={() => changeMonth(1)}
                disabled={month === toYYYYMM(todayIST)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/6 transition-all text-xs disabled:opacity-20 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="Present" value={presentCount} accent="#22c55e" icon="✓" delay={0} />
          <StatPill label="Absent" value={absentCount} accent="#ef4444" icon="✕" delay={0.06} />
          <StatPill label="Attendance %" value={`${pct}%`} accent="#f97316" icon="◎" delay={0.12} />
          <StatPill label="Avg Hours" value={avgHours} accent="#a855f7" icon="⏱" delay={0.18} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/6 p-5"
          style={{ background: "#0b0b0b" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-semibold">Monthly Progress</p>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-lg"
              style={{
                background: pct >= 80 ? "rgba(34,197,94,0.12)" : pct >= 60 ? "rgba(249,115,22,0.12)" : "rgba(239,68,68,0.12)",
                color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f97316" : "#ef4444",
                border: `1px solid ${pct >= 80 ? "rgba(34,197,94,0.25)" : pct >= 60 ? "rgba(249,115,22,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {pct >= 80 ? "EXCELLENT" : pct >= 60 ? "AVERAGE" : "NEEDS IMPROVEMENT"}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: pct >= 80
                  ? "linear-gradient(90deg,#16a34a,#22c55e)"
                  : pct >= 60
                  ? "linear-gradient(90deg,#c2410c,#f97316)"
                  : "linear-gradient(90deg,#b91c1c,#ef4444)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-white/15 tracking-widest">{presentCount} / {workingDays} working days</span>
            <span className="text-[9px] text-white/15 tracking-widest">{pct}%</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeatmapCalendar month={month} presentDays={presentDays} todayStr={todayStr} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            {(() => {
              let streak = 0;
              const sortedDates = [...presentDays].sort().reverse();
              const [y, m] = month.split("-").map(Number);
              let cursor = new Date(Math.min(new Date(y, m, 0), todayIST));
              for (const d of Array.from({ length: cursor.getDate() }, (_, i) => {
                const dd = cursor.getDate() - i;
                return `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
              })) {
                if (presentDays.has(d)) streak++;
                else break;
              }

              return (
                <div
                  className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
                  style={{ background: "#0b0b0b" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}
                  >
                    🔥
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-semibold mb-0.5">Current Streak</p>
                    <p className="text-3xl font-black text-orange-400">{streak} <span className="text-sm font-semibold text-white/30">days</span></p>
                  </div>
                </div>
              );
            })()}
            <div
              className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
              style={{ background: "#0b0b0b" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
              >
                ⚡
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-semibold mb-0.5">Total Hours</p>
                <p className="text-3xl font-black text-purple-400">
                  {Math.floor(totalMins / 60)}
                  <span className="text-sm font-semibold text-white/30">h {Math.round(totalMins % 60)}m</span>
                </p>
              </div>
            </div>

            {(() => {
              const times = records
                .filter((r) => r.checkIn)
                .map((r) => {
                  const d = new Date(r.checkIn);
                  return d.getHours() * 60 + d.getMinutes();
                });
              const earliest = times.length ? Math.min(...times) : null;
              const earliestStr = earliest !== null
                ? `${String(Math.floor(earliest / 60)).padStart(2, "0")}:${String(earliest % 60).padStart(2, "0")}`
                : "—";

              return (
                <div
                  className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
                  style={{ background: "#0b0b0b" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    🌅
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-semibold mb-0.5">Earliest Check-In</p>
                    <p className="text-3xl font-black text-emerald-400">
                      {earliestStr !== "—"
                        ? new Date(`1970-01-01T${earliestStr}:00`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                        : "—"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: "#0b0b0b" }}
        >
          <div
            className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-semibold">
              Daily Records · {monthLabel(month)}
            </p>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              {presentCount} entries
            </span>
          </div>
          {loading && (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.03)", animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          )}

          {!loading && records.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3 opacity-20">◎</p>
              <p className="text-white/20 text-sm tracking-[0.3em] uppercase">No attendance recorded</p>
              <p className="text-white/10 text-xs mt-1 tracking-widest">for {monthLabel(month)}</p>
            </div>
          )}
          {!loading && records.length > 0 && (
            <div>
              {[...records].sort((a, b) => b.date.localeCompare(a.date)).map((r, i) => (
                <RecordRow key={r._id || r.date} record={r} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}