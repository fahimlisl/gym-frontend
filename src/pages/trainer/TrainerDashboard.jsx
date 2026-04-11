import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

function getLatestSub(student) {
  const subs = student?.subscription?.subscription;
  if (!Array.isArray(subs) || subs.length === 0) return null;
  return subs[subs.length - 1];
}

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(ease(p) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, icon, delay = 0, accent = "#ef4444" }) {
  const animated = useCountUp(typeof value === "number" ? value : 0, 900);
  return (
    <div
      className="relative overflow-hidden cursor-default select-none border border-white/8 rounded-xl p-5 group hover:border-white/15 transition-all duration-300"
      style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111111 100%)", animationDelay: `${delay}ms` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ background: accent }} />
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}25, transparent)` }}
      />
      <div className="pl-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-medium mb-1.5">{label}</p>
        <p className="text-3xl font-black tracking-tight" style={{ color: accent }}>
          {typeof value === "number" ? animated : value}
        </p>
      </div>
    </div>
  );
}

function CouponBonusSection({ coupon, bonus }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        className="relative overflow-hidden rounded-xl border border-white/8 p-5 group hover:border-yellow-500/30 transition-all duration-300"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111111 100%)" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ background: "#eab308" }} />
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(234,179,8,0.15), transparent)" }}
        />
        <div className="pl-3">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)" }}
            >
              🎟
            </div>
            {coupon ? (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                ACTIVE
              </span>
            ) : (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider"
                style={{ background: "rgba(107,114,128,0.2)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.2)" }}
              >
                NOT ASSIGNED
              </span>
            )}
          </div>
          <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-medium mb-1.5">My Coupon</p>
          {coupon ? (
            <>
              <p className="text-2xl font-black tracking-widest mb-1" style={{ color: "#eab308" }}>
                {coupon.code}
              </p>
            </>
          ) : (
            <p className="text-white/20 text-sm font-medium mt-1">No coupon assigned yet</p>
          )}
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-xl border border-white/8 p-5 group hover:border-purple-500/30 transition-all duration-300"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111111 100%)" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ background: "#a855f7" }} />
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent)" }}
        />
        <div className="pl-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
          >
            💰
          </div>
          <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-medium mb-3">Bonus</p>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">This Month</p>
              <p className="text-2xl font-black" style={{ color: "#a855f7" }}>
                ₹{(bonus?.monthBonus ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="pb-0.5">
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">Total Earned</p>
              <p className="text-lg font-bold text-white/50">
                ₹{(bonus?.totalBonus ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StudentGridCard({ student, index }) {
  const navigate = useNavigate();
  const initials = student.username?.slice(0, 2).toUpperCase() ?? "??";
  const sub = getLatestSub(student);
  const isActive = sub?.status?.toLowerCase() === "active";
  const plan = sub?.plan ?? "No Plan";
  const accents = ["#ef4444", "#f97316", "#ec4899", "#dc2626", "#e11d48", "#f59e0b"];
  const accent = accents[index % accents.length];

  return (
    <div
      onClick={() => navigate(`/trainer/student/${student._id}`)}
      className="group relative cursor-pointer rounded-xl border border-white/8 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-red-600/40"
      style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)" }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
      <div
        className="absolute inset-x-0 top-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${accent}08, transparent)` }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white"
              style={{ background: `${accent}20`, border: `1.5px solid ${accent}40`, color: accent }}
            >
              {student?.avatar?.url
                ? <img src={student?.avatar?.url} alt="" className="w-full h-full object-cover rounded-xl" />
                : initials}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: isActive ? "#22c55e" : "#3f3f3f",
                borderColor: "#0a0a0a",
                boxShadow: isActive ? "0 0 6px #22c55e80" : "none",
              }}
            />
          </div>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all border border-white/5 group-hover:border-red-600/30"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <p className="text-white/90 font-bold text-sm tracking-wide truncate mb-0.5">{student.username}</p>
        <p className="text-white/35 text-xs truncate mb-4">{student.email}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: isActive ? "rgba(34,197,94,0.12)" : "rgba(63,63,63,0.5)",
              color: isActive ? "#22c55e" : "#555",
              border: `1px solid ${isActive ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            {isActive ? "● Active" : "○ Inactive"}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-md capitalize"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {plan}
          </span>
        </div>
      </div>
      <div
        className="h-px w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </div>
  );
}

function StudentListRow({ student, index }) {
  const navigate = useNavigate();
  const initials = student.username?.slice(0, 2).toUpperCase() ?? "??";
  const sub = getLatestSub(student);
  const isActive = sub?.status?.toLowerCase() === "active";
  const plan = sub?.plan ?? "No Plan";
  const accents = ["#ef4444", "#f97316", "#ec4899", "#dc2626", "#e11d48", "#f59e0b"];
  const accent = accents[index % accents.length];

  return (
    <div
      onClick={() => navigate(`/trainer/student/${student._id}`)}
      className="group flex items-center gap-4 px-5 py-3.5 cursor-pointer border-b border-white/5 last:border-0 transition-all duration-200"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="text-white/15 text-xs font-mono w-5 shrink-0 tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}
        >
          {initials}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: isActive ? "#22c55e" : "#2a2a2a",
            borderColor: "#080808",
            boxShadow: isActive ? "0 0 5px #22c55e70" : "none",
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-sm font-semibold truncate">{student.username}</p>
        <p className="text-white/30 text-xs truncate">{student.email}</p>
      </div>
      <span
        className="hidden sm:block text-[10px] font-medium px-2 py-0.5 rounded-md capitalize shrink-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {plan}
      </span>
      <span
        className="hidden md:block text-[10px] font-semibold px-2.5 py-1 rounded-md shrink-0"
        style={{
          background: isActive ? "rgba(34,197,94,0.1)" : "rgba(63,63,63,0.4)",
          color: isActive ? "#22c55e" : "#555",
          border: `1px solid ${isActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
        }}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
      <span className="hidden lg:block text-xs text-white/20 shrink-0 w-20 text-right">
        {student.createdAt
          ? new Date(student.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
          : "—"}
      </span>
      <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 opacity-30 group-hover:opacity-70 transition-opacity">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  const [allStudents, setAllStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    api.get("/trainer/fetchAllUser")
      .then((res) => setAllStudents(res.data.data || []))
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoadingAll(false));

    api.get("/trainer/fetchAssignedStudents")
      .then((res) => setAssignedStudents(res.data.data || []))
      .catch(() => toast.error("Failed to load assigned students"))
      .finally(() => setLoadingAssigned(false));

    api.get("/trainer/fetch/self/coupon")
      .then((res) => {
        const data = res.data.data;
        if (data && Object.keys(data).length > 0) setCoupon(data);
      })
      .catch(() => {});

    api.get("/trainer/fetchSelf")
      .then((res) => setBonus(res.data.data?.bonus ?? null))
      .catch(() => {});
  }, []);

  const loading = loadingAll || loadingAssigned;

  const sourceStudents = filterStatus === "students" ? assignedStudents : allStudents;

  const activeCount = useMemo(
    () => allStudents.filter((s) => getLatestSub(s)?.status?.toLowerCase() === "active").length,
    [allStudents]
  );

  const assignedActiveCount = useMemo(
    () => assignedStudents.filter((s) => getLatestSub(s)?.status?.toLowerCase() === "active").length,
    [assignedStudents]
  );

  const filtered = useMemo(() => {
    return sourceStudents.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
      if (filterStatus === "students") return matchSearch;
      const isActive = getLatestSub(s)?.status?.toLowerCase() === "active";
      const matchFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && isActive) ||
        (filterStatus === "inactive" && !isActive);
      return matchSearch && matchFilter;
    });
  }, [sourceStudents, search, filterStatus]);

  const isStudentsMode = filterStatus === "students";

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808" }}>
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "linear-gradient(180deg, #0d0d0d, #080808)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "linear-gradient(rgba(239,68,68,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute top-0 left-1/3 w-72 h-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(239,68,68,0.12), transparent 70%)", filter: "blur(20px)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-red-500/70">
                  Trainer Portal
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none mb-2">
                TRAINER
                <span
                  className="ml-3"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  DASHBOARD
                </span>
              </h1>
              <p className="text-white/30 text-sm font-light tracking-wide">
                {loading
                  ? "Loading..."
                  : isStudentsMode
                    ? `${assignedStudents.length} assigned · ${assignedActiveCount} active`
                    : `${allStudents.length} total members · ${activeCount} active`}
              </p>
            </div>

            <div
              className="flex items-center gap-1 p-1 rounded-lg self-start sm:self-auto"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[{ key: "grid", label: "Grid" }, { key: "list", label: "List" }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 tracking-wider"
                  style={{
                    background: view === key ? "rgba(239,68,68,0.2)" : "transparent",
                    color: view === key ? "#ef4444" : "rgba(255,255,255,0.3)",
                    border: view === key ? "1px solid rgba(239,68,68,0.35)" : "1px solid transparent",
                  }}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div className="grid grid-cols-3 gap-3">
          {isStudentsMode ? (
            <>
              <StatCard label="My Students" value={assignedStudents.length} icon="◈" accent="#f97316" delay={0} />
              <StatCard label="Active" value={assignedActiveCount} icon="◉" accent="#22c55e" delay={70} />
              <StatCard label="Inactive" value={assignedStudents.length - assignedActiveCount} icon="◎" accent="#6b7280" delay={140} />
            </>
          ) : (
            <>
              <StatCard label="Total Members" value={allStudents.length} icon="◈" accent="#ef4444" delay={0} />
              <StatCard label="Active Subs" value={activeCount} icon="◉" accent="#22c55e" delay={70} />
              <StatCard label="Inactive" value={allStudents.length - activeCount} icon="◎" accent="#6b7280" delay={140} />
            </>
          )}
        </div>

        <CouponBonusSection coupon={coupon} bonus={bonus} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
              <path d="M10.5 10.5L13 13" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(239,68,68,0.45)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-xs"
              >✕</button>
            )}
          </div>

          <div
            className="flex items-center gap-1 p-1 rounded-lg shrink-0"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { key: "all",      label: "All",      c: "#ef4444" },
              { key: "active",   label: "Active",   c: "#22c55e" },
              { key: "inactive", label: "Inactive", c: "#6b7280" },
              { key: "students", label: "My Students", c: "#f97316" },
            ].map(({ key, label, c }) => (
              <button
                key={key}
                onClick={() => { setFilterStatus(key); setSearch(""); }}
                className="px-4 py-2 text-[11px] font-bold rounded-md transition-all duration-200 tracking-widest"
                style={{
                  background: filterStatus === key ? `${c}18` : "transparent",
                  color: filterStatus === key ? c : "rgba(255,255,255,0.25)",
                  border: filterStatus === key ? `1px solid ${c}35` : "1px solid transparent",
                }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(255,255,255,0.15)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
        )}

        {loading && (
          <div className={view === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-2"}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 animate-pulse"
                style={{ background: "rgba(255,255,255,0.02)", height: view === "grid" ? "152px" : "60px", animationDelay: `${i * 55}ms` }}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            className="rounded-xl p-16 text-center border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-3xl mb-3 opacity-20">◎</p>
            <p className="text-white/25 text-sm tracking-widest uppercase mb-3">
              {isStudentsMode
                ? "No students assigned to you yet"
                : search || filterStatus !== "all"
                  ? "No members match"
                  : "No members found"}
            </p>
            {(search || filterStatus !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); }}
                className="text-xs font-semibold tracking-widest uppercase text-red-500/60 hover:text-red-400 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && view === "grid" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s, i) => (
              <StudentGridCard key={s._id} student={s} index={i} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && view === "list" && (
          <div
            className="rounded-xl overflow-hidden border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="flex items-center gap-4 px-5 py-2.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.03)" }}
            >
              <span className="w-5" />
              <span className="w-9" />
              <span className="flex-1 text-[10px] font-bold tracking-[0.25em] uppercase text-white/20">Member</span>
              <span className="hidden sm:block text-[10px] font-bold tracking-[0.25em] uppercase text-white/20 shrink-0">Plan</span>
              <span className="hidden md:block text-[10px] font-bold tracking-[0.25em] uppercase text-white/20 w-20 shrink-0">Status</span>
              <span className="hidden lg:block text-[10px] font-bold tracking-[0.25em] uppercase text-white/20 w-20 text-right shrink-0">Joined</span>
              <span className="w-6" />
            </div>
            {filtered.map((s, i) => (
              <StudentListRow key={s._id} student={s} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}