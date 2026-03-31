import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios.api.js";
import toast from "react-hot-toast";

const IST_OFFSET = 5.5 * 60 * 60000;
const nowIST = () => new Date(Date.now() + IST_OFFSET);
const toYYYYMM = (d) => d.toISOString().slice(0, 7);
const toYYYYMMDD = (d) => d.toISOString().slice(0, 10);

function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
function getDaysInMonth(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function getFirstDow(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(checkOut) - new Date(checkIn);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function getWorkingDays(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  const total = new Date(y, m, 0).getDate();
  let count = 0;
  for (let d = 1; d <= total; d++) {
    if (new Date(y, m - 1, d).getDay() !== 0) count++;
  }
  return count;
}

function pctColor(pct) {
  if (pct >= 80) return { fg: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" };
  if (pct >= 60) return { fg: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)" };
  return { fg: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" };
}

function RankBadge({ rank }) {
  const medals = { 1: { icon: "🥇", color: "#fbbf24" }, 2: { icon: "🥈", color: "#94a3b8" }, 3: { icon: "🥉", color: "#b45309" } };
  if (medals[rank]) return <span className="text-base">{medals[rank].icon}</span>;
  return (
    <span className="text-[10px] font-black tabular-nums" style={{ color: "rgba(255,255,255,0.2)" }}>
      #{rank}
    </span>
  );
}

function MiniHeatmap({ month, presentDays, todayStr }) {
  const days = getDaysInMonth(month);
  const startDow = getFirstDow(month);
  const [y, m] = month.split("-");
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${m}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, ds });
  }
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className="text-center text-[8px] text-white/15 font-bold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} />;
          const present = presentDays.has(cell.ds);
          const isToday = cell.ds === todayStr;
          const future = cell.ds > todayStr;
          return (
            <motion.div
              key={cell.ds}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.006 }}
              className="aspect-square rounded flex items-center justify-center text-[9px] font-bold"
              style={{
                background: present ? "rgba(34,197,94,0.2)" : future ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                border: isToday ? "1.5px solid rgba(239,68,68,0.6)" : present ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.04)",
                color: present ? "#22c55e" : future ? "#222" : "#2a2a2a",
              }}
            >
              {cell.day}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TodayTrainerRow({ record, rank, onClick }) {
  const trainer = record.trainer || {};
  const name = trainer.fullName || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const duration = formatDuration(record.checkIn, record.checkOut);
  const checkInMins = record.checkIn
    ? new Date(record.checkIn).getHours() * 60 + new Date(record.checkIn).getMinutes()
    : 9999;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 cursor-pointer transition-colors duration-150"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        <RankBadge rank={rank} />
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 overflow-hidden"
        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
      >
        {trainer.avatar?.url
          ? <img src={trainer.avatar.url} alt={name} className="w-full h-full object-cover" />
          : initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-sm font-bold truncate">{name}</p>
        <p className="text-white/25 text-xs">{trainer.phoneNumber || "—"}</p>
      </div>

      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-[9px] tracking-widest text-white/20 uppercase mb-0.5">In</p>
        <p className="text-sm font-bold text-emerald-400">{formatTime(record.checkIn)}</p>
      </div>

      <div className="shrink-0 text-right hidden md:block">
        <p className="text-[9px] tracking-widest text-white/20 uppercase mb-0.5">Out</p>
        <p className="text-sm font-bold text-sky-400">{formatTime(record.checkOut)}</p>
      </div>

      <div className="shrink-0 hidden lg:block">
        {duration ? (
          <span
            className="text-[10px] font-black px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}
          >
            {duration}
          </span>
        ) : (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            ACTIVE
          </span>
        )}
      </div>

      <div className="shrink-0 hidden sm:block">
        <span
          className="text-[8px] font-bold px-2 py-1 rounded-md tracking-widest"
          style={{
            background: record.source === "QR" ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
            color: record.source === "QR" ? "rgba(168,85,247,0.8)" : "rgba(255,255,255,0.2)",
            border: `1px solid ${record.source === "QR" ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {record.source}
        </span>
      </div>

      <div className="w-5 opacity-0 group-hover:opacity-40 transition-opacity shrink-0">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

function MonthlyTrainerRow({ entry, rank, onClick }) {
  const { trainer, presentCount, workingDays } = entry;
  const name = trainer?.fullName || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const pct = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;
  const c = pctColor(pct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-white/6 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/12"
      style={{ background: "linear-gradient(145deg,#0e0e0e,#0a0a0a)" }}
    >
      <div
        className="h-px w-full"
        style={{ background: rank <= 3 ? `linear-gradient(90deg,transparent,${c.fg}50,transparent)` : "transparent" }}
      />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 shrink-0 flex items-center justify-center">
            <RankBadge rank={rank} />
          </div>

          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 overflow-hidden"
            style={{ background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
          >
            {trainer?.avatar?.url
              ? <img src={trainer.avatar.url} alt={name} className="w-full h-full object-cover" />
              : initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white/85 font-bold text-sm truncate">{name}</p>
            <p className="text-white/25 text-xs">{trainer?.phoneNumber || "—"}</p>
          </div>

          <div
            className="shrink-0 text-sm font-black px-3 py-1 rounded-xl"
            style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
          >
            {pct}%
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: rank * 0.06 + 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg,${c.fg}80,${c.fg})` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/20 tracking-widest">
            {presentCount} / {workingDays} days
          </span>
          <span className="text-[9px] text-white/20 tracking-widest group-hover:text-white/40 transition-colors">
            VIEW DETAILS →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DrillPanel({ trainerId, trainerName, month, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = toYYYYMMDD(nowIST());
  const presentDays = useMemo(() => new Set(records.map((r) => r.date)), [records]);
  const workingDays = getWorkingDays(month);
  const pct = workingDays > 0 ? Math.round((presentDays.size / workingDays) * 100) : 0;
  const c = pctColor(pct);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/attendance/trainer/${trainerId}/month?month=${month}`)
      .then((res) => setRecords(res.data.attendance || []))
      .catch(() => toast.error("Failed to load trainer details"))
      .finally(() => setLoading(false));
  }, [trainerId, month]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col border-l border-white/8 overflow-hidden"
      style={{ background: "#090909" }}
    >
      <div
        className="flex items-center justify-between px-6 py-5 border-b border-white/6 shrink-0"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div>
          <p className="text-[9px] tracking-[0.3em] text-white/25 uppercase mb-0.5">Trainer Detail</p>
          <p className="text-white font-black text-base tracking-wide">{trainerName}</p>
          <p className="text-white/30 text-xs mt-0.5">{monthLabel(month)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/6 transition-all text-lg"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-2 w-full px-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Present", value: presentDays.size, color: "#22c55e" },
              { label: "Absent", value: Math.max(0, workingDays - presentDays.size), color: "#ef4444" },
              { label: "Rate", value: `${pct}%`, color: c.fg },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center border border-white/5"
                style={{ background: "#0e0e0e" }}
              >
                <p className="text-[8px] tracking-widest text-white/20 uppercase mb-1">{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/6 p-4" style={{ background: "#0e0e0e" }}>
            <p className="text-[9px] tracking-[0.25em] text-white/20 uppercase mb-3">Attendance Map</p>
            <MiniHeatmap month={month} presentDays={presentDays} todayStr={todayStr} />
          </div>

          <div>
            <p className="text-[9px] tracking-[0.25em] text-white/20 uppercase mb-3">
              Daily Records · {records.length} entries
            </p>
            {records.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-white/15 text-xs tracking-widest">No attendance recorded</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...records].sort((a, b) => b.date.localeCompare(a.date)).map((r, i) => {
                  const [, , dd] = r.date.split("-");
                  const dayName = new Date(r.date).toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
                  const dur = formatDuration(r.checkIn, r.checkOut);
                  return (
                    <motion.div
                      key={r._id || r.date}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5"
                      style={{ background: "#111" }}
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                      >
                        <span className="text-[7px] font-bold text-emerald-500/50 leading-none">{dayName}</span>
                        <span className="text-xs font-black text-emerald-400">{dd}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-400">{formatTime(r.checkIn)}</span>
                          <span className="text-white/15 text-[10px]">→</span>
                          <span className="text-xs font-bold text-sky-400">{formatTime(r.checkOut)}</span>
                        </div>
                      </div>
                      {dur && (
                        <span className="text-[10px] font-black shrink-0" style={{ color: "#f97316" }}>{dur}</span>
                      )}
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background: r.source === "QR" ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
                          color: r.source === "QR" ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {r.source}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminTrainerAttendance() {
  const todayIST = nowIST();
  const todayStr = toYYYYMMDD(todayIST);
  const [tab, setTab] = useState("today"); 
  const [month, setMonth] = useState(toYYYYMM(todayIST));

  const [todayRecords, setTodayRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const [drill, setDrill] = useState(null); 

  useEffect(() => {
    setLoadingToday(true);
    api.get("/admin/attendance/trainer/today")
      .then((res) => setTodayRecords(res.data.attendance || []))
      .catch(() => toast.error("Failed to load today's attendance"))
      .finally(() => setLoadingToday(false));
  }, []);

  useEffect(() => {
    if (tab !== "monthly") return;
    setLoadingMonthly(true);
    api.get(`/admin/attendance/trainer/month?month=${month}`)
      .then((res) => {
        const raw = res.data.attendance || [];
        const map = new Map();
        raw.forEach((r) => {
          const tid = r.trainer?._id || r.trainer;
          if (!map.has(tid)) {
            map.set(tid, { trainer: r.trainer, presentCount: 0 });
          }
          map.get(tid).presentCount++;
        });
        const working = getWorkingDays(month);
        const arr = [...map.values()].map((e) => ({ ...e, workingDays: working }));
        arr.sort((a, b) => a.presentCount - b.presentCount);
        setMonthlyData(arr);
      })
      .catch(() => toast.error("Failed to load monthly attendance"))
      .finally(() => setLoadingMonthly(false));
  }, [tab, month]);

  const sortedToday = useMemo(() => {
    return [...todayRecords].sort((a, b) => {
      const ta = a.checkIn ? new Date(a.checkIn).getTime() : Infinity;
      const tb = b.checkIn ? new Date(b.checkIn).getTime() : Infinity;
      return ta - tb;
    });
  }, [todayRecords]);

  // FIXED: Proper month navigation with year rollover
  const changeMonth = (dir) => {
    const [currentYear, currentMonth] = month.split("-").map(Number);
    let newYear = currentYear;
    let newMonth = currentMonth + dir;
    
    // Handle year rollover
    if (newMonth > 12) {
      newYear++;
      newMonth = 1;
    } else if (newMonth < 1) {
      newYear--;
      newMonth = 12;
    }
    
    const newDate = new Date(newYear, newMonth - 1, 1);
    const todayDate = new Date(todayIST.getFullYear(), todayIST.getMonth(), 1);
    
    // Don't allow going past current month
    if (newDate > todayDate) return;
    
    // Format to YYYY-MM
    const newMonthStr = String(newMonth).padStart(2, "0");
    setMonth(`${newYear}-${newMonthStr}`);
  };

  const loading = tab === "today" ? loadingToday : loadingMonthly;

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808" }}>

      <AnimatePresence>
        {drill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrill(null)}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drill && (
          <DrillPanel
            trainerId={drill.trainerId}
            trainerName={drill.trainerName}
            month={tab === "monthly" ? month : toYYYYMM(todayIST)}
            onClose={() => setDrill(null)}
          />
        )}
      </AnimatePresence>

      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "linear-gradient(180deg,#0d0d0d,#080808)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(239,68,68,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.5) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute top-0 right-1/4 w-80 h-48 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(239,68,68,0.08),transparent 70%)", filter: "blur(30px)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-red-500/60">Admin · Trainer Attendance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-2">
                TRAINER{" "}
                <span style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ATTENDANCE
                </span>
              </h1>
              <p className="text-white/25 text-sm font-light tracking-wide">
                {tab === "today"
                  ? `${sortedToday.length} trainer${sortedToday.length !== 1 ? "s" : ""} present today`
                  : `${monthlyData.length} trainers · ${monthLabel(month)}`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
              <div
                className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {[{ key: "today", label: "Today" }, { key: "monthly", label: "Monthly" }].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className="px-5 py-2 text-xs font-black rounded-lg transition-all duration-200 tracking-widest"
                    style={{
                      background: tab === key ? "rgba(239,68,68,0.2)" : "transparent",
                      color: tab === key ? "#ef4444" : "rgba(255,255,255,0.3)",
                      border: tab === key ? "1px solid rgba(239,68,68,0.35)" : "1px solid transparent",
                    }}
                  >
                    {label.toUpperCase()}
                  </button>
                ))}
              </div>

              {tab === "monthly" && (
                <div
                  className="flex items-center gap-1 p-1 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => changeMonth(-1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/6 transition-all text-sm"
                  >‹</button>
                  <span className="px-3 text-xs font-bold tracking-widest text-white/50 uppercase min-w-[130px] text-center">
                    {monthLabel(month)}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    disabled={month === toYYYYMM(todayIST)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/6 transition-all text-sm disabled:opacity-20 disabled:cursor-not-allowed"
                  >›</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {tab === "today" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Present Today", value: sortedToday.length, color: "#22c55e" },
                { label: "Checked Out", value: sortedToday.filter((r) => r.checkOut).length, color: "#38bdf8" },
                { label: "Still Inside", value: sortedToday.filter((r) => !r.checkOut).length, color: "#f97316" },
                { label: "Via QR", value: sortedToday.filter((r) => r.source === "QR").length, color: "#a855f7" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-2xl border border-white/6 p-5"
                  style={{ background: "linear-gradient(145deg,#0e0e0e,#111)" }}
                >
                  <div className="absolute left-0 inset-y-0 w-[3px] rounded-l-2xl" style={{ background: s.color }} />
                  <div className="pl-3">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 font-semibold mb-1">{s.label}</p>
                    <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/6 overflow-hidden"
              style={{ background: "#0b0b0b" }}
            >
              <div
                className="flex items-center gap-4 px-5 py-3 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="w-7" />
                <span className="w-10" />
                <span className="flex-1 text-[9px] font-bold tracking-[0.25em] uppercase text-white/20">Trainer</span>
                <span className="hidden sm:block text-[9px] font-bold tracking-[0.25em] uppercase text-white/20 shrink-0">In</span>
                <span className="hidden md:block text-[9px] font-bold tracking-[0.25em] uppercase text-white/20 w-20 shrink-0">Out</span>
                <span className="hidden lg:block text-[9px] font-bold tracking-[0.25em] uppercase text-white/20 shrink-0">Duration</span>
                <span className="hidden sm:block text-[9px] font-bold tracking-[0.25em] uppercase text-white/20 shrink-0">Source</span>
                <span className="w-5" />
              </div>

              {loadingToday && (
                <div className="p-4 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", animationDelay: `${i * 60}ms` }} />
                  ))}
                </div>
              )}

              {!loadingToday && sortedToday.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-3xl mb-3 opacity-15">◎</p>
                  <p className="text-white/20 text-sm tracking-[0.3em] uppercase">No trainer has checked in today</p>
                </div>
              )}

              {!loadingToday && sortedToday.map((r, i) => (
                <TodayTrainerRow
                  key={r._id}
                  record={r}
                  rank={i + 1}
                  onClick={() => setDrill({
                    trainerId: r.trainer?._id || r.trainer,
                    trainerName: r.trainer?.fullName || "Trainer",
                  })}
                />
              ))}
            </motion.div>

            {!loadingToday && sortedToday.length > 0 && (
              <p className="text-center text-[10px] text-white/15 tracking-widest mt-4 uppercase">
                Sorted by earliest check-in · Click any row for monthly detail
              </p>
            )}
          </>
        )}

        {tab === "monthly" && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/15 font-semibold">
                Lowest attendance on top · click to drill in
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>

            {loadingMonthly && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 animate-pulse" style={{ background: "rgba(255,255,255,0.02)", height: "130px", animationDelay: `${i * 55}ms` }} />
                ))}
              </div>
            )}

            {!loadingMonthly && monthlyData.length === 0 && (
              <div className="py-32 text-center">
                <p className="text-4xl mb-4 opacity-10">◎</p>
                <p className="text-white/20 text-sm tracking-[0.3em] uppercase">No attendance data for {monthLabel(month)}</p>
              </div>
            )}

            {!loadingMonthly && monthlyData.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {monthlyData.map((entry, i) => (
                  <MonthlyTrainerRow
                    key={entry.trainer?._id || i}
                    entry={entry}
                    rank={i + 1}
                    onClick={() => setDrill({
                      trainerId: entry.trainer?._id,
                      trainerName: entry.trainer?.fullName || "Trainer",
                    })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}