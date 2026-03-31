import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Badge = ({ children, color = "neutral" }) => {
  const map = {
    neutral: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "#6b7280" },
    green:   { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",  color: "#22c55e" },
    red:     { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  color: "#ef4444" },
    yellow:  { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)",  color: "#eab308" },
  };
  const s = map[color] || map.neutral;
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-md"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
    <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium shrink-0">{label}</span>
    <span className="text-sm text-white/80 font-light text-right ml-4">{value ?? "—"}</span>
  </div>
);

const SectionTitle = ({ children, accent }) => (
  <div className="flex items-center gap-3 mb-5">
    {accent && <div className="w-0.5 h-4 rounded-full" style={{ background: accent }} />}
    <p className="text-[10px] font-bold text-white/30 tracking-[0.25em] uppercase">{children}</p>
  </div>
);

function DayCard({ day }) {
  const [open, setOpen] = useState(false);
  const isRest = day.isRestDay;

  return (
    <div
      className="overflow-hidden rounded-lg border transition-all duration-200"
      style={{
        background: open ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
        borderColor: open ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={() => !isRest && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${
          isRest ? "cursor-default" : "hover:bg-white/3"
        }`}
      >
        <span
          className="text-[10px] font-black font-mono w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: isRest ? "rgba(255,255,255,0.04)" : "rgba(239,68,68,0.12)",
            color: isRest ? "#374151" : "#ef4444",
            border: `1px solid ${isRest ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {day.dayNumber}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-sm font-semibold">
            {day.day}
            {day.workoutName && (
              <span className="text-white/35 font-light"> · {day.workoutName}</span>
            )}
          </p>
          <p className="text-white/25 text-xs mt-0.5">
            {isRest ? "Rest Day" : `${day.exercises?.length || 0} exercises`}
          </p>
        </div>

        {isRest ? (
          <Badge color="neutral">REST</Badge>
        ) : (
          <span className="text-white/20 text-xs">{open ? "▲" : "▼"}</span>
        )}
      </button>

      {open && !isRest && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {day.exercises?.length === 0 ? (
            <p className="text-white/20 text-xs p-4">No exercises listed.</p>
          ) : (
            day.exercises.map((ex, i) => (
              <div key={i} className="px-4 py-3.5 flex items-start gap-4">
                <span
                  className="text-[10px] font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-semibold">{ex.exerciseName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ex.sets && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                        <span className="text-white font-semibold">{ex.sets}</span> sets
                      </span>
                    )}
                    {ex.reps && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                        <span className="text-white font-semibold">{ex.reps}</span> reps
                      </span>
                    )}
                    {ex.restTime && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                        <span className="text-white font-semibold">{ex.restTime}s</span> rest
                      </span>
                    )}
                    {ex.muscleGroup && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        {ex.muscleGroup}
                      </span>
                    )}
                  </div>
                  {ex.notes && <p className="text-white/25 text-xs mt-2 italic">{ex.notes}</p>}
                </div>
              </div>
            ))
          )}
          {day.notes && (
            <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-white/25 text-xs italic">{day.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WeekSection({ week, isCurrent }) {
  const [open, setOpen] = useState(isCurrent);

  return (
    <div
      className="overflow-hidden rounded-xl border transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: isCurrent ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.07)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/3"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
            style={{
              background: isCurrent ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
              color: isCurrent ? "#ef4444" : "rgba(255,255,255,0.3)",
              border: `1px solid ${isCurrent ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {week.weekNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white/85 font-bold text-sm">
                Week {week.weekNumber}
                {week.weekName && <span className="text-white/35 font-light"> — {week.weekName}</span>}
              </p>
              {isCurrent && <Badge color="red">Current</Badge>}
            </div>
            <p className="text-white/25 text-xs mt-0.5">{week.days?.length || 0} days</p>
          </div>
        </div>
        <span className="text-white/20 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-white/5 p-4 space-y-2">
          {week.days?.map((day, i) => <DayCard key={i} day={day} />)}
          {week.notes && <p className="text-white/25 text-xs italic px-1 pt-1">{week.notes}</p>}
        </div>
      )}
    </div>
  );
}

export default function TrainerStudentDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingWorkout, setLoadingWorkout] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get(`/trainer/fetchAllUser`);
        const found = (res.data.data || []).find((u) => u._id === userId);
        setUser(found || null);
      } catch {
        toast.error("Failed to load student details");
      } finally {
        setLoadingUser(false);
      }
    };
    const loadWorkout = async () => {
      try {
        const res = await api.get(`/trainer/user/${userId}/workout`);
        setWorkout(res.data.data || null);
      } catch {
        toast.error("Failed to load workout");
      } finally {
        setLoadingWorkout(false);
      }
    };
    loadUser();
    loadWorkout();
  }, [userId]);

  const subs = user?.subscription?.subscription || [];
  const sub = subs.length > 0 ? subs[subs.length - 1] : null;
  const isSubActive = sub?.status?.toLowerCase() === "active";

  const workoutStatusColor =
    workout?.status === "Active" ? "green" : workout?.status === "Paused" ? "yellow" : "neutral";

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808" }}>

      <div
        className="sticky top-0 z-20 border-b"
        style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] text-white/20 tracking-[0.25em] uppercase font-medium">Student Profile</span>
          {user && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-sm text-white/50 font-medium">{user.username}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {loadingUser ? (
          <div className="h-36 rounded-2xl animate-pulse border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }} />
        ) : !user ? (
          <div className="rounded-2xl p-14 text-center border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-white/25 text-sm tracking-widest uppercase">Student not found</p>
          </div>
        ) : (
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 100%)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="absolute top-0 left-0 w-64 h-32 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(239,68,68,0.1), transparent 70%)" }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: "linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative p-6 flex items-center gap-6">
              <div className="relative shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black overflow-hidden"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.25)", color: "#ef4444" }}
                >
                  {user?.avatar?.url
                    ? <img src={user?.avatar?.url} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: isSubActive ? "#22c55e" : "#374151",
                    borderColor: "#080808",
                    boxShadow: isSubActive ? "0 0 8px rgba(34,197,94,0.6)" : "none",
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    {user.username}
                  </h1>
                  <Badge color={isSubActive ? "green" : "neutral"}>
                    {sub?.status || "No Sub"}
                  </Badge>
                  {sub?.plan && <Badge color="neutral">{sub.plan}</Badge>}
                </div>
                {user.phoneNumber && (
                  <p className="text-white/50 text-sm font-medium">{user.phoneNumber}</p>
                )}
                <p className="text-white/25 text-xs mt-0.5">{user.email}</p>
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase font-medium mb-1">Member Since</p>
                <p className="text-white/70 text-sm font-semibold">{fmt(user.createdAt)}</p>
              </div>
            </div>

            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, #ef4444, rgba(239,68,68,0.2), transparent)" }} />
          </div>
        )}

        {user && (
          <div className="grid md:grid-cols-3 gap-5">

            <div className="space-y-5">
              <div
                className="rounded-2xl border p-5"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <SectionTitle accent="#ef4444">Subscription</SectionTitle>
                {!sub ? (
                  <p className="text-white/20 text-sm">No subscription found.</p>
                ) : (
                  <>
                    <InfoRow label="Plan" value={<span className="capitalize font-semibold text-white">{sub.plan}</span>} />
                    <InfoRow label="Status" value={<Badge color={isSubActive ? "green" : "neutral"}>{sub.status}</Badge>} />
                    <InfoRow label="Amount" value={sub.finalAmount ? `₹${sub.finalAmount}` : null} />
                    <InfoRow label="Start" value={fmt(sub.startDate)} />
                    <InfoRow label="Expires" value={fmt(sub.endDate)} />
                    <InfoRow label="Payment" value={sub.paymentMethod} />
                  </>
                )}
              </div>

            </div>

            <div className="md:col-span-2">
              <div
                className="rounded-2xl border p-5"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <SectionTitle accent="#f97316">Workout Plan</SectionTitle>
                  {workout && <Badge color={workoutStatusColor}>{workout.status}</Badge>}
                </div>

                {loadingWorkout ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 rounded-xl animate-pulse border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }} />
                    ))}
                  </div>
                ) : !workout ? (
                  <div
                    className="rounded-xl p-12 text-center border"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <p className="text-3xl mb-3 opacity-20">◎</p>
                    <p className="text-white/20 text-sm tracking-widest uppercase">No active workout plan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl p-4"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}
                    >
                      {[
                        { label: "Name", value: workout.name || workout.template?.name },
                        { label: "Goal", value: workout.goal },
                        { label: "Level", value: workout.difficultyLevel },
                        { label: "Duration", value: workout.duration ? `${workout.duration} wks` : null },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase mb-1">{s.label}</p>
                          <p className="text-sm text-white/80 font-semibold capitalize">{s.value || "—"}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Start Date", value: fmt(workout.startDate) },
                        { label: "Current Week", value: `Week ${workout.currentWeek}` },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                          <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase mb-1.5">{s.label}</p>
                          <p className="text-sm text-white/80 font-semibold">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {workout.weeks?.map((week) => (
                        <WeekSection
                          key={week.weekNumber}
                          week={week}
                          isCurrent={week.weekNumber === workout.currentWeek}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}