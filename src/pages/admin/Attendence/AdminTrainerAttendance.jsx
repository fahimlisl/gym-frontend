import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../../api/axios.api.js";

const ZONE = "Asia/Kolkata";
const RED = "#f05a62";

function istToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value: v }) => [type, v]));
  return `${value.year}-${value.month}-${value.day}`;
}

function changeDay(iso, offset) {
  const value = new Date(`${iso}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

function readableDate(iso, options = {}) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

function istTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    timeZone: ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function scheduleTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value || "")) return value || "—";
  const [hour, minute] = value.split(":").map(Number);
  return `${String(hour % 12 || 12)}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function mins(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  const n = Math.max(0, Math.round(Number(value)));
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

function extractPayload(response) {
  // ApiResponse sends { statusCode, data: { ... }, message, success }.
  return response?.data?.data ?? response?.data ?? {};
}

function errorText(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong.";
}

function isCancelled(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function Glyph({ name, size = 18, className = "" }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", className, "aria-hidden": true };
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
    prev: <path d="m15 18-6-6 6-6" />,
    next: <path d="m9 18 6-6-6-6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7.5 7.5 0 0 1 18 6l2 6M4 12l2 6a7.5 7.5 0 0 0 12.5-3" /></>,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    check: <><path d="M20 7 10 17l-5-5" /><circle cx="12" cy="12" r="10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    exit: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    enter: <><path d="M15 21h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4" /><path d="m8 17-5-5 5-5M3 12h12" /></>,
    coffee: <><path d="M4 8h14v6a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8ZM18 9h2a2 2 0 0 1 0 4h-2M8 3v2M13 3v2" /></>,
    activity: <path d="M2 12h5l3-7 4 14 3-7h5" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    fingerprint: <><path d="M5 10a7 7 0 0 1 14 0M8 13v-3a4 4 0 0 1 8 0v4M12 10v4M5 14c0 3 .5 5 2 7M19 14c0 3-.5 5-2 7M9 17c0 2 .5 3.5 1.5 4M15 17c0 2-.5 3.5-1.5 4" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.activity}</svg>;
}

function Avatar({ trainer, size = "md" }) {
  const name = trainer?.fullName || "Trainer";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const sz = size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-xs";
  return (
    <div className={`${sz} shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 flex items-center justify-center font-black overflow-hidden`}>
      {trainer?.avatar?.url ? (
        <img src={trainer.avatar.url} alt="" className="w-full h-full object-cover" />
      ) : initials}
    </div>
  );
}

const statusStyles = {
  present: { label: "Present", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  absent: { label: "Absent", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  "not-checked-in": { label: "Not checked in", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  upcoming: { label: "Upcoming", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", dot: "bg-sky-400" },
  "no-schedule": { label: "No schedule", color: "text-zinc-400", bg: "bg-white/[0.04] border-white/10", dot: "bg-zinc-500" },
};

function Status({ value }) {
  const style = statusStyles[value] || statusStyles["no-schedule"];
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide ${style.bg} ${style.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function Metric({ label, value, icon, tone = "white", caption }) {
  const colors = { white: "text-white", red: "text-red-400", green: "text-emerald-400", amber: "text-amber-400", blue: "text-sky-400" };
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#111113] p-4 sm:p-5 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] tracking-[0.18em] text-white/40 uppercase font-semibold">{label}</span>
        <span className="text-white/25"><Glyph name={icon} size={17} /></span>
      </div>
      <p className={`mt-3 text-3xl font-black tracking-tight tabular-nums ${colors[tone] || colors.white}`}>{value}</p>
      {caption && <p className="text-[11px] text-white/30 mt-1">{caption}</p>}
    </div>
  );
}

function MonthPicker({ date, onChange, onClose }) {
  const [year, month] = date.slice(0, 7).split("-").map(Number);
  const [viewMonth, setViewMonth] = useState(`${year}-${String(month).padStart(2, "0")}`);
  const [vy, vm] = viewMonth.split("-").map(Number);
  const first = new Date(Date.UTC(vy, vm - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(vy, vm, 0)).getUTCDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
  const today = istToday();

  const moveMonth = (direction) => {
    const d = new Date(Date.UTC(vy, vm - 1 + direction, 1));
    setViewMonth(d.toISOString().slice(0, 7));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="absolute z-30 top-[calc(100%+10px)] right-0 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-[#171719] shadow-2xl shadow-black/80 p-4">
      <div className="flex justify-between items-center mb-4">
        <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="rounded-lg p-2 hover:bg-white/10 text-white/60"><Glyph name="prev" size={16} /></button>
        <span className="text-sm font-bold">{readableDate(`${viewMonth}-01`, { weekday: undefined, day: undefined })}</span>
        <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="rounded-lg p-2 hover:bg-white/10 text-white/60"><Glyph name="next" size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-white/35 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          const iso = day ? `${viewMonth}-${String(day).padStart(2, "0")}` : null;
          return day ? (
            <button key={iso} type="button" onClick={() => { onChange(iso); onClose(); }}
              className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${iso === date ? "bg-red-500 text-white" : iso === today ? "border border-red-500/50 text-red-300 hover:bg-red-500/10" : "text-white/70 hover:bg-white/10"}`}>
              {day}
            </button>
          ) : <span key={`empty-${index}`} />;
        })}
      </div>
      <button type="button" onClick={() => { onChange(today); onClose(); }} className="mt-4 w-full py-2 rounded-lg border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5">
        Jump to today
      </button>
    </motion.div>
  );
}

function TrainerRow({ record, onOpen }) {
  const trainer = record.trainer || {};
  const summary = record.summary || {};
  const late = Number(summary.lateMinutes) || 0;
  const excess = Number(summary.totalExcessMinutes) || 0;
  return (
    <motion.button type="button" layout initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="group text-left w-full grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar trainer={trainer} />
        <div className="min-w-0">
          <p className="font-bold text-sm text-white/90 truncate group-hover:text-white">{trainer.fullName || "Unknown trainer"}</p>
          <p className="text-[11px] text-white/35 truncate mt-0.5">{trainer.email || "No email"}</p>
          <div className="sm:hidden mt-2"><Status value={record.status} /></div>
        </div>
      </div>
      <div className="hidden sm:block"><Status value={record.status} /></div>
      <div className="hidden sm:block">
        <p className="text-[12px] font-bold text-white/75 tabular-nums">{summary.firstCheckIn || "—"}</p>
        <p className="text-[10px] text-white/30 mt-1">{summary.lastCheckOut ? `Out ${summary.lastCheckOut}` : `${summary.totalScans || 0} scans`}</p>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <div className="flex flex-col gap-1.5 items-end">
          {late > 0 && <span className="text-[10px] font-semibold text-amber-400">{mins(late)} late</span>}
          {excess > 0 && <span className="text-[10px] font-semibold text-red-300">{mins(excess)} excess</span>}
          {summary.excessCurrentlyOpen && <span className="text-[10px] font-semibold text-amber-300">Excess out open</span>}
          {!late && !excess && !summary.excessCurrentlyOpen && <span className="text-[11px] text-white/25">View day</span>}
        </div>
        <span className="text-white/30 group-hover:text-red-400 transition-colors"><Glyph name="next" size={18} /></span>
      </div>
    </motion.button>
  );
}

const eventConfig = {
  "check in": { label: "Check in", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", icon: "enter" },
  "check out": { label: "Check out", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/25", icon: "exit" },
  "break out": { label: "Break out", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", icon: "coffee" },
  "break in": { label: "Break in", color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/25", icon: "enter" },
  "excess out": { label: "Excess out", color: "text-red-400", bg: "bg-red-500/10 border-red-500/25", icon: "exit" },
  "excess in": { label: "Excess in", color: "text-red-300", bg: "bg-red-500/10 border-red-500/25", icon: "enter" },
};

function TimelineItem({ event, index, last }) {
  const cfg = eventConfig[event.type] || { label: event.type || "Activity", color: "text-white/70", bg: "bg-white/5 border-white/10", icon: "activity" };
  const isLate = event.type === "check in" && Number(event.lateMinutes) > 0;
  const hasDuration = Number.isFinite(Number(event.durationMinutes)) && event.durationMinutes !== null;
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.05, 0.35) }}
      className="relative flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.color}`}><Glyph name={cfg.icon} size={19} /></div>
        {!last && <span className="w-px flex-1 min-h-6 my-2 bg-gradient-to-b from-white/15 to-white/[0.04]" />}
      </div>
      <div className="pb-6 min-w-0 flex-1">
        <div className="rounded-2xl border border-white/[0.07] bg-[#141416] px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`font-bold text-[13px] ${cfg.color}`}>{cfg.label}</p>
              <p className="text-[11px] mt-1 text-white/30">{event.source || "FACIAL"} verification</p>
            </div>
            <p className="text-sm font-black text-white tabular-nums whitespace-nowrap">{event.displayTime || istTime(event.time)}</p>
          </div>
          {(event.note || isLate || hasDuration) && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {event.note && <span className="text-[11px] text-white/55">{event.note}</span>}
              {!event.note && isLate && <span className="text-[11px] text-amber-300">{mins(event.lateMinutes)} late</span>}
              {hasDuration && <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-white/65">{mins(event.durationMinutes)}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DetailPanel({ selection, date, refreshKey, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selection?.trainerId) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setDetail(null);

    api.get(`/admin/trainer-attendance/${selection.trainerId}`, {
      params: { date },
      signal: controller.signal,
    })
      .then((response) => setDetail(extractPayload(response)))
      .catch((err) => { if (!isCancelled(err)) setError(errorText(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [selection?.trainerId, date, refreshKey]);

  useEffect(() => {
    const onEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEscape);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = original;
    };
  }, [onClose]);

  const trainer = detail?.trainer || selection?.trainer || {};
  const timeline = Array.isArray(detail?.timeline) ? detail.timeline : [];
  const summary = detail?.summary || {};
  const schedule = detail?.schedule || selection?.schedule || null;
  const label = selection?.status || (timeline.length ? "present" : "not-checked-in");

  return (
    <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 35 }}
      role="dialog" aria-modal="true" aria-label={`${trainer.fullName || "Trainer"} attendance details`}
      className="fixed z-[61] right-0 top-0 h-[100dvh] w-full max-w-[600px] border-l border-white/10 bg-[#0b0b0d] shadow-2xl shadow-black/80 flex flex-col overflow-hidden text-white">
      <div className="shrink-0 border-b border-white/10 px-5 sm:px-7 py-5 bg-gradient-to-r from-[#1b1013] to-[#111114]">
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] font-black text-red-400 tracking-[0.25em] uppercase">AlphaGym / Day activity</span>
          <button type="button" onClick={onClose} aria-label="Close activity" className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition"><Glyph name="close" size={19} /></button>
        </div>
        <div className="flex gap-3 items-center mt-5">
          <Avatar trainer={trainer} size="lg" />
          <div className="min-w-0">
            <h2 className="font-black text-xl truncate">{trainer.fullName || selection?.trainerName || "Trainer"}</h2>
            <p className="text-xs text-white/40 mt-0.5">{readableDate(date)}</p>
          </div>
          <div className="ml-auto"><Status value={label} /></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((n) => <div key={n} className="h-24 bg-white/5 rounded-xl" />)}</div>
            {[0, 1, 2, 3].map((n) => <div key={n} className="h-20 bg-white/5 rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                ["First in", summary.firstCheckIn || "—", "text-emerald-400"],
                ["Last out", summary.lastCheckOut || "—", "text-sky-400"],
                ["Scans", String(summary.totalScans ?? timeline.length), "text-white"],
              ].map(([labelText, value, color]) => (
                <div key={labelText} className="p-3 rounded-xl border border-white/[0.07] bg-white/[0.025] min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-white/35">{labelText}</p>
                  <p className={`mt-2 text-[12px] sm:text-sm font-black truncate ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3">
                <p className="text-[10px] text-white/40 mb-1">Arrival delay</p>
                <p className="text-lg font-black text-amber-400">{summary.lateMinutes === null || summary.lateMinutes === undefined ? "—" : mins(summary.lateMinutes)}</p>
              </div>
              <div className="rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
                <p className="text-[10px] text-white/40 mb-1">Completed excess time</p>
                <p className="text-lg font-black text-red-400">{mins(summary.totalExcessMinutes ?? 0)}</p>
              </div>
            </div>

            {summary.excessCurrentlyOpen && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-xs text-amber-200 mb-5">
                <Glyph name="warning" size={16} /> Excess-out interval is still open. Duration is not final.
              </div>
            )}

            <div className="rounded-2xl border border-white/[0.07] bg-[#121214] p-4 mb-7">
              <div className="flex items-center gap-2 mb-3 text-white/65"><Glyph name="calendar" size={16} /><span className="text-[11px] tracking-widest uppercase font-bold">Assigned schedule</span></div>
              {schedule ? (
                <>
                  <p className="text-sm font-bold">{scheduleTime(schedule.shiftStart)} <span className="text-red-400 px-1">→</span> {scheduleTime(schedule.shiftEnd)}</p>
                  {Array.isArray(schedule.breaks) && schedule.breaks.length > 0 && (
                    <div className="mt-3 border-t border-white/[0.06] pt-3 space-y-2">
                      {schedule.breaks.map((br, i) => (
                        <div key={br._id || i} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-white/45 truncate">{br.name || `Break ${i + 1}`}</span>
                          <span className="text-white/70 whitespace-nowrap">{scheduleTime(br.startTime)} – {scheduleTime(br.endTime)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : <p className="text-xs text-white/35">No schedule available for this date.</p>}
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2"><Glyph name="activity" size={18} className="text-red-400" /><h3 className="font-black tracking-tight text-lg">Activity timeline</h3></div>
              <span className="text-[10px] font-semibold tracking-wide text-white/30">{timeline.length} EVENTS</span>
            </div>
            {timeline.length ? (
              <div>{timeline.map((event, i) => <TimelineItem key={event.id || i} event={event} index={i} last={i === timeline.length - 1} />)}</div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-2xl px-5 py-12 text-center">
                <div className="text-white/20 flex justify-center mb-3"><Glyph name="fingerprint" size={34} /></div>
                <p className="font-bold text-white/65 text-sm">No attendance activities</p>
                <p className="text-xs text-white/35 mt-1">There are no recorded scans for this trainer on this date.</p>
              </div>
            )}
            <p className="text-[10px] text-white/25 text-center mt-6">Activity timestamps are displayed in Asia/Kolkata (IST).</p>
          </>
        )}
      </div>
    </motion.aside>
  );
}

export default function AdminTrainerAttendance() {
  const [date, setDate] = useState(istToday);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const closeDetail = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get("/admin/trainer-attendance", {
      params: { date },
      signal: controller.signal,
    })
      .then((response) => {
        const payload = extractPayload(response);
        const rows = payload.trainers;
        if (!Array.isArray(rows)) throw new Error("Unexpected trainer attendance response format.");
        setTrainers(rows);
      })
      .catch((err) => {
        if (isCancelled(err)) return;
        setTrainers([]);
        setError(errorText(err));
        toast.error("Unable to load trainer attendance.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [date, refreshKey]);

  const stats = useMemo(() => ({
    total: trainers.length,
    present: trainers.filter((t) => t.status === "present").length,
    absent: trainers.filter((t) => t.status === "absent").length,
    attention: trainers.filter((t) =>
      t.status === "absent" ||
      Number(t.summary?.lateMinutes) > 0 ||
      Number(t.summary?.totalExcessMinutes) > 0 ||
      t.summary?.excessCurrentlyOpen
    ).length,
  }), [trainers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainers
      .filter((item) => {
        if (q && !`${item.trainer?.fullName || ""} ${item.trainer?.email || ""}`.toLowerCase().includes(q)) return false;
        if (filter === "present") return item.status === "present";
        if (filter === "absent") return item.status === "absent";
        if (filter === "attention") return item.status === "absent" || Number(item.summary?.lateMinutes) > 0 || Number(item.summary?.totalExcessMinutes) > 0 || Boolean(item.summary?.excessCurrentlyOpen);
        return true;
      })
      .sort((a, b) => (a.trainer?.fullName || "").localeCompare(b.trainer?.fullName || ""));
  }, [trainers, search, filter]);

  const selectedDateIsToday = date === istToday();

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-20">
      <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-[#1c1013] via-[#111113] to-[#09090b]">
        <div className="absolute right-0 top-0 h-64 w-80 rounded-full bg-red-700/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-9 sm:py-12">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-black text-red-400 mb-4">
            <Glyph name="fingerprint" size={17} /> AlphaGym / Staff operations
          </div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Trainer <span className="text-red-500">attendance.</span></h1>
              <p className="text-sm text-white/40 max-w-lg mt-2">Every trainer. Every scan. One clear daily activity record.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => { setDate(istToday()); setCalendarOpen(false); }} className={`px-4 h-11 rounded-xl border text-xs font-bold transition ${selectedDateIsToday ? "border-red-500/30 bg-red-500/15 text-red-300" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"}`}>Today</button>
              <div className="flex items-center rounded-xl border border-white/10 bg-black/30">
                <button type="button" aria-label="Previous day" onClick={() => setDate((d) => changeDay(d, -1))} className="h-11 w-10 flex justify-center items-center hover:text-red-400 text-white/60"><Glyph name="prev" size={17} /></button>
                <div className="relative">
                  <button type="button" aria-label="Choose attendance date" aria-expanded={calendarOpen} onClick={() => setCalendarOpen((v) => !v)} className="h-11 flex items-center gap-2 px-2 text-[11px] sm:text-xs font-bold text-white/90 hover:text-white whitespace-nowrap">
                    <Glyph name="calendar" size={16} className="text-red-400" />{readableDate(date, { weekday: "short" })}
                  </button>
                  <AnimatePresence>{calendarOpen && <MonthPicker key={date.slice(0, 7)} date={date} onChange={setDate} onClose={() => setCalendarOpen(false)} />}</AnimatePresence>
                </div>
                <button type="button" aria-label="Next day" onClick={() => setDate((d) => changeDay(d, 1))} className="h-11 w-10 flex justify-center items-center hover:text-red-400 text-white/60"><Glyph name="next" size={17} /></button>
              </div>
              <button type="button" onClick={() => setRefreshKey((n) => n + 1)} aria-label="Refresh attendance" title="Refresh" className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white/60 hover:text-white hover:border-red-500/30 transition"><Glyph name="refresh" size={17} /></button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 mt-7">
        <div className="flex justify-between items-center gap-2 mb-4">
          <p className="text-[11px] text-white/40">Showing attendance for <span className="text-white/75 font-semibold">{readableDate(date)}</span></p>
          <span className="text-[10px] tracking-widest text-white/25 uppercase">Asia/Kolkata · IST</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Metric label="All trainers" value={loading ? "—" : stats.total} icon="users" />
          <Metric label="Present" value={loading ? "—" : stats.present} icon="check" tone="green" />
          <Metric label="Absent" value={loading ? "—" : stats.absent} icon="exit" tone="red" caption="Past scheduled days" />
          <Metric label="Needs attention" value={loading ? "—" : stats.attention} icon="warning" tone="amber" caption="Late, excess or absent" />
        </div>

        <section className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0f0f11]">
          <div className="p-5 sm:p-6 border-b border-white/[0.07]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2"><span className="flex items-center justify-center h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"><Glyph name="activity" size={18} /></span><h2 className="font-black text-lg">Daily register</h2></div>
                <p className="text-xs text-white/35 mt-2">Select a trainer to see the complete check-in, break and excess-movement timeline.</p>
              </div>
              <div className="relative w-full md:w-[300px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><Glyph name="search" size={17} /></span>
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trainers..." aria-label="Search trainers" className="w-full rounded-xl border border-white/10 bg-[#18181b] pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-red-500/50" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-5">
              {[
                ["all", "All trainers"],
                ["present", "Present"],
                ["absent", "Absent"],
                ["attention", "Needs attention"],
              ].map(([key, label]) => (
                <button type="button" key={key} onClick={() => setFilter(key)}
                  className={`px-3 py-2 rounded-lg border text-[11px] font-bold transition-colors ${filter === key ? "bg-red-500/15 border-red-500/30 text-red-300" : "bg-white/[0.025] border-white/[0.07] text-white/45 hover:text-white/80"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-5 px-6 py-3 bg-white/[0.025] border-b border-white/[0.05] text-[9px] uppercase font-bold tracking-[0.2em] text-white/25">
            <span>Trainer</span><span>Status</span><span>Activity</span><span className="text-right">Details</span>
          </div>
          {loading ? (
            <div className="px-5 py-4 space-y-3 animate-pulse">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[62px] rounded-xl bg-white/[0.035]" />)}</div>
          ) : error ? (
            <div className="py-16 px-5 text-center">
              <div className="flex justify-center text-red-400"><Glyph name="warning" size={28} /></div>
              <h3 className="mt-3 font-bold">Could not load attendance</h3>
              <p className="text-white/45 text-xs mt-2 max-w-md mx-auto">{error}</p>
              <button type="button" onClick={() => setRefreshKey((n) => n + 1)} className="mt-5 px-4 py-2 rounded-lg bg-red-500/15 text-red-300 text-xs font-bold">Try again</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-20 px-5 text-center">
              <div className="text-white/25 flex justify-center"><Glyph name="search" size={30} /></div>
              <h3 className="text-sm font-bold text-white/65 mt-4">No trainers found</h3>
              <p className="text-xs text-white/35 mt-2">Try another date, filter or search.</p>
            </div>
          ) : (
            <div>{visible.map((item) => {
              const trainerId = item.trainer?._id;
              return <TrainerRow key={trainerId} record={item} onOpen={() => trainerId && setSelected({ trainerId, trainer: item.trainer, status: item.status, schedule: item.schedule })} />;
            })}</div>
          )}
          {!loading && !error && visible.length > 0 && (
            <div className="px-5 sm:px-6 py-4 text-[11px] flex items-center justify-between border-t border-white/[0.06] text-white/30">
              <span>Showing {visible.length} of {trainers.length} trainers</span>
              <span>Click a row to view activity <span className="text-red-400">→</span></span>
            </div>
          )}
        </section>
        <p className="text-center text-[10px] mt-6 text-white/25">Only recorded scan events are displayed. Failed face/location verifications are not attendance events.</p>
      </main>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDetail} className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-[3px]" />
            <DetailPanel key="detail" selection={selected} date={date} refreshKey={refreshKey} onClose={closeDetail} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
