import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  AlertCircle, ArrowRight, CalendarDays, Check, Clock3, Coffee,
  Images, LockKeyhole, Plus, Save, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import {
  getTrainerSchedule,
  saveTrainerSchedule,
  deactivateTrainerSchedule,
} from "../../api/trainerSchedule.api.js";
import { getTrainerVerificationPhotos } from "../../api/admin.api";

const WEEK = [
  { id: 1, short: "M", name: "Monday" },
  { id: 2, short: "T", name: "Tuesday" },
  { id: 3, short: "W", name: "Wednesday" },
  { id: 4, short: "T", name: "Thursday" },
  { id: 5, short: "F", name: "Friday" },
  { id: 6, short: "S", name: "Saturday" },
  { id: 0, short: "S", name: "Sunday" },
];

const emptyForm = () => ({
  shiftStart: "09:00",
  shiftEnd: "17:00",
  gracePeriodMinutes: 10,
  daysOfWeek: [1, 2, 3, 4, 5],
  breaks: [],
});

const newBreak = () => ({
  key: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  name: "Break",
  startTime: "13:00",
  endTime: "14:00",
  gracePeriodMinutes: 5,
  paid: false,
});

const minutes = (time) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) return NaN;
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};

const duration = (value) => {
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return [hours && `${hours}h`, mins && `${mins}m`].filter(Boolean).join(" ") || "0m";
};

const integerIn = (value, min, max) =>
  Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max;

const inputClass =
  "block w-full min-w-0 rounded-xl border border-white/10 bg-[#111114] px-3 py-3 text-sm text-white outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 disabled:opacity-60 [color-scheme:dark]";

export const validateSchedule = (form) => {
  const start = minutes(form.shiftStart);
  const end = minutes(form.shiftEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return "Shift end must be after shift start. Overnight shifts are not supported yet.";
  }
  if (!Array.isArray(form.daysOfWeek) || form.daysOfWeek.length === 0) {
    return "Select at least one working day.";
  }
  if (!integerIn(form.gracePeriodMinutes, 0, 120)) {
    return "Shift grace must be between 0 and 120 minutes.";
  }

  const checkoutWindowStart = end - Number(form.gracePeriodMinutes);
  const windows = [];
  for (const [index, slot] of form.breaks.entries()) {
    const breakStart = minutes(slot.startTime);
    const breakEnd = minutes(slot.endTime);
    const grace = Number(slot.gracePeriodMinutes);
    if (!slot.name?.trim() || slot.name.trim().length > 50) {
      return `Break ${index + 1}: enter a name (up to 50 characters).`;
    }
    if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd) || breakEnd <= breakStart) {
      return `Break ${index + 1}: end time must be after start time.`;
    }
    if (!integerIn(slot.gracePeriodMinutes, 0, 60)) {
      return `Break ${index + 1}: grace must be between 0 and 60 minutes.`;
    }
    // Grace applies AFTER scheduled break end, not before break start.
    if (breakStart < start || breakEnd + grace > checkoutWindowStart) {
      return `Break ${index + 1}: break and return grace must finish before the checkout window.`;
    }
    windows.push({ start: breakStart, end: breakEnd + grace });
  }
  windows.sort((a, b) => a.start - b.start);
  for (let i = 1; i < windows.length; i++) {
    if (windows[i].start < windows[i - 1].end) {
      return "Scheduled breaks and their return-grace windows cannot overlap.";
    }
  }
  return null;
};

function SectionTitle({ icon: Icon, label, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <Icon size={17} />
      </span>
      <div>
        <h3 className="text-sm font-black tracking-wide text-white">{label}</h3>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

export default function TrainerScheduleModal({ trainer, canEdit, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const initialRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const nextBreakRef = useRef(null);
  const isMounted = useRef(true);

  const busy = saving || deactivating;
  const dirty = initialRef.current !== null &&
    JSON.stringify(form) !== JSON.stringify(initialRef.current);
  const validationError = useMemo(() => validateSchedule(form), [form]);

  useEffect(() => {
    isMounted.current = true;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      isMounted.current = false;
      document.body.style.overflow = previousOverflow;
      previousFocus?.isConnected && previousFocus.focus?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      setError("");
      try {
        const schedule = await getTrainerSchedule(trainer._id);
        if (cancelled) return;
        setExisting(schedule);
        const next = schedule ? {
          shiftStart: schedule.shiftStart,
          shiftEnd: schedule.shiftEnd,
          gracePeriodMinutes: schedule.gracePeriodMinutes ?? 10,
          daysOfWeek: [...(schedule.daysOfWeek || [])].sort((a, b) => a - b),
          breaks: (schedule.breaks || []).map((slot) => ({
            key: String(slot._id ?? `${slot.startTime}-${slot.endTime}`),
            name: slot.name || "Break",
            startTime: slot.startTime,
            endTime: slot.endTime,
            gracePeriodMinutes: slot.gracePeriodMinutes ?? 5,
            paid: Boolean(slot.paid),
          })),
        } : emptyForm();
        setForm(next);
        initialRef.current = structuredClone(next);
      } catch (err) {
        if (!cancelled) {
          setLoadError(true);
          setError(err.response?.data?.message || "Could not load trainer schedule.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [trainer._id, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhotosLoading(true);
      setPhotosError("");
      try {
        const response = await getTrainerVerificationPhotos(trainer._id);
        // Accept the raw photos array or Axios/ApiResponse wrapper.
        const photos = Array.isArray(response)
          ? response
          : response?.data?.data?.photos ?? response?.data?.photos ?? response?.photos ?? [];
        if (!cancelled) setReferencePhotos(photos);
      } catch (err) {
        if (!cancelled) {
          setPhotosError(err.response?.data?.message || "Could not load trainer photos.");
        }
      } finally {
        if (!cancelled) setPhotosLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [trainer._id]);

  const requestClose = useCallback(() => {
    if (busy) return;
    if (canEdit && dirty && !window.confirm("Discard unsaved schedule changes?")) return;
    onClose();
  }, [busy, canEdit, dirty, onClose]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (photoPreview) {
          setPhotoPreview(null);
        } else {
          requestClose();
        }
        return;
      }
      if (event.key !== "Tab" || photoPreview) return;
      const controls = Array.from(dialogRef.current?.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]'
      ) || []).filter((element) => element.getClientRects().length);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [photoPreview, requestClose]);

  const update = (key, value) => {
    setError("");
    setForm((previous) => ({ ...previous, [key]: value }));
  };
  const updateBreak = (key, field, value) => {
    setError("");
    setForm((previous) => ({
      ...previous,
      breaks: previous.breaks.map((slot) =>
        slot.key === key ? { ...slot, [field]: value } : slot
      ),
    }));
  };
  const addBreak = () => {
    if (form.breaks.length >= 12) return;
    const slot = newBreak();
    nextBreakRef.current = slot.key;
    setForm((previous) => ({ ...previous, breaks: [...previous.breaks, slot] }));
    setError("");
  };
  const removeBreak = (key) => {
    setForm((previous) => ({
      ...previous,
      breaks: previous.breaks.filter((slot) => slot.key !== key),
    }));
    setError("");
  };
  const toggleDay = (id) => update(
    "daysOfWeek",
    form.daysOfWeek.includes(id)
      ? form.daysOfWeek.filter((day) => day !== id)
      : [...form.daysOfWeek, id].sort((a, b) => a - b)
  );

  useEffect(() => {
    const key = nextBreakRef.current;
    if (!key) return;
    nextBreakRef.current = null;
    const target = Array.from(scrollRef.current?.querySelectorAll("[data-break-key]") || [])
      .find((node) => node.dataset.breakKey === key);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [form.breaks.length]);

  const stats = useMemo(() => {
    const shift = Math.max(0, (minutes(form.shiftEnd) - minutes(form.shiftStart)) || 0);
    const unpaid = form.breaks
      .filter((slot) => !slot.paid)
      .reduce((sum, slot) => sum + Math.max(0, (minutes(slot.endTime) - minutes(slot.startTime)) || 0), 0);
    return { shift, unpaid, paid: Math.max(0, shift - unpaid) };
  }, [form]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canEdit || busy) return;
    const problem = validateSchedule(form);
    if (problem) { setError(problem); return; }

    const payload = {
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      gracePeriodMinutes: Number(form.gracePeriodMinutes),
      daysOfWeek: [...form.daysOfWeek].sort((a, b) => a - b),
      breaks: form.breaks.map(({ name, startTime, endTime, gracePeriodMinutes, paid }) => ({
        name: name.trim(),
        startTime,
        endTime,
        gracePeriodMinutes: Number(gracePeriodMinutes),
        paid,
      })),
    };

    setSaving(true);
    setError("");
    try {
      await saveTrainerSchedule(trainer._id, payload);
      toast.success(existing ? "Schedule updated" : "Schedule created");
      try { await onSaved?.(); } catch (refreshError) {
        console.warn("Schedule saved, but parent refresh failed:", refreshError);
      }
      onClose();
    } catch (err) {
      if (isMounted.current) setError(err.response?.data?.message || "Could not save schedule.");
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!canEdit || !existing || busy) return;
    if (!window.confirm("Deactivate this schedule? Attendance scans will stop until another schedule is assigned.")) return;
    setDeactivating(true);
    setError("");
    try {
      await deactivateTrainerSchedule(trainer._id);
      toast.success("Schedule deactivated");
      try { await onSaved?.(); } catch (refreshError) {
        console.warn("Schedule deactivated, but parent refresh failed:", refreshError);
      }
      onClose();
    } catch (err) {
      if (isMounted.current) setError(err.response?.data?.message || "Could not deactivate schedule.");
    } finally {
      if (isMounted.current) setDeactivating(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex min-h-0 items-stretch justify-center overflow-hidden bg-black/85 backdrop-blur-xl sm:items-center sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <div
        ref={dialogRef}
        id="trainer-schedule-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trainer-schedule-title"
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden border border-white/10 bg-[#0b0b0e] text-white shadow-2xl sm:h-[min(92dvh,840px)] sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-[#241015] to-[#101013] p-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="shrink-0 text-red-400" size={26} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">ALPHAGYM / STAFF PLANNING</p>
              <h2 id="trainer-schedule-title" className="text-xl font-black">
                {existing ? "Manage schedule" : "Set trainer schedule"}
              </h2>
              <p className="text-xs text-zinc-400">{trainer.fullName} · Asia/Kolkata</p>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close schedule" onClick={requestClose} disabled={busy} className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white disabled:opacity-50">
            <X size={18} />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading schedule...</div>
        ) : loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="text-red-400" />
            <p role="alert" className="text-sm text-red-300">{error}</p>
            <button type="button" onClick={() => setReloadKey((count) => count + 1)} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold">Retry loading</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div ref={scrollRef} role="region" aria-label="Trainer schedule settings" tabIndex={0} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 pb-8 focus:outline-none sm:p-7">
              {!canEdit && (
                <p className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <LockKeyhole size={15} /> Your admin role has view-only access.
                </p>
              )}
              {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

              {/* Admin-only gallery; does not change the schedule form. */}
              <section className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
                <SectionTitle
                  icon={Images}
                  label="Trainer enrollment photos"
                  description="Photos enrolled for face verification (visible to authorized admins)."
                />
                {photosLoading ? (
                  <p className="text-sm text-zinc-400">Loading reference photos...</p>
                ) : photosError ? (
                  <p role="alert" className="text-sm text-red-400">{photosError}</p>
                ) : referencePhotos.length === 0 ? (
                  <p className="text-sm text-zinc-500">No stored enrollment photos. Re-enroll the trainer to store all five images.</p>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-zinc-400">{referencePhotos.length} reference photo(s) available</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {referencePhotos.map((photo, index) => (
                        <button
                          type="button"
                          key={photo.public_id || `${index}-${photo.url}`}
                          onClick={() => setPhotoPreview(photo.url)}
                          className="overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left transition hover:border-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          aria-label={`View reference photo ${index + 1}`}
                        >
                          <img src={photo.url} alt={`Enrolled reference ${index + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                          <span className="block p-2 text-center text-xs text-zinc-300">Photo {index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
                <SectionTitle icon={Clock3} label="Shift timing" description="Start, end, and shift grace period." />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <label className="space-y-1.5 text-xs text-zinc-400">START TIME
                    <input aria-label="Shift start" type="time" required disabled={!canEdit} value={form.shiftStart} onChange={(e) => update("shiftStart", e.target.value)} className={inputClass} />
                  </label>
                  <label className="space-y-1.5 text-xs text-zinc-400">END TIME
                    <input aria-label="Shift end" type="time" required disabled={!canEdit} value={form.shiftEnd} onChange={(e) => update("shiftEnd", e.target.value)} className={inputClass} />
                  </label>
                  <label className="col-span-2 space-y-1.5 text-xs text-zinc-400 sm:col-span-1">SHIFT GRACE (MIN)
                    <input aria-label="Shift grace" type="number" required min="0" max="120" disabled={!canEdit} value={form.gracePeriodMinutes} onChange={(e) => update("gracePeriodMinutes", e.target.value)} className={inputClass} />
                  </label>
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <ShieldCheck size={14} className="text-emerald-500" /> Times use Asia/Kolkata.
                </p>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
                <SectionTitle icon={CalendarDays} label="Working days" description="Select the days this schedule applies to." />
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {WEEK.map(({ id, short, name }) => {
                    const active = form.daysOfWeek.includes(id);
                    return (
                      <button
                        key={id} type="button" disabled={!canEdit} title={name} aria-label={name} aria-pressed={active}
                        onClick={() => toggleDay(id)}
                        className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-bold disabled:opacity-50 ${active ? "border-red-500/60 bg-red-500/15 text-white" : "border-white/10 bg-black/30 text-zinc-500"}`}
                      >
                        {short}
                        {active && <Check size={12} className="text-red-400" />}
                        <span className="hidden text-[9px] sm:block">{name.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>
                {canEdit && (
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400">
                    <button type="button" onClick={() => update("daysOfWeek", [1, 2, 3, 4, 5])}>Weekdays</button>
                    <button type="button" onClick={() => update("daysOfWeek", [0, 1, 2, 3, 4, 5, 6])}>All days</button>
                    <button type="button" onClick={() => update("daysOfWeek", [0, 6])}>Weekend</button>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <SectionTitle icon={Coffee} label="Scheduled breaks" description="Break-out throughout the break; return grace follows its end." />
                  {canEdit && (
                    <button type="button" disabled={form.breaks.length >= 12} onClick={addBreak} className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-40">
                      <Plus size={15} /> ADD BREAK
                    </button>
                  )}
                </div>
                {form.breaks.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">No breaks configured.</p>
                ) : (
                  <div className="space-y-3">
                    {form.breaks.map((slot, index) => (
                      <div key={slot.key} data-break-key={slot.key} className="rounded-xl border border-white/10 bg-black/30 p-3 sm:p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">BREAK {index + 1}</span>
                          {canEdit && <button type="button" aria-label={`Remove break ${index + 1}`} onClick={() => removeBreak(slot.key)} className="text-zinc-400 hover:text-red-400"><Trash2 size={16} /></button>}
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <label className="col-span-2 space-y-1 text-xs text-zinc-400 md:col-span-1">NAME
                            <input value={slot.name} maxLength={50} required disabled={!canEdit} onChange={(e) => updateBreak(slot.key, "name", e.target.value)} className={inputClass} />
                          </label>
                          <label className="space-y-1 text-xs text-zinc-400">START
                            <input type="time" required value={slot.startTime} disabled={!canEdit} onChange={(e) => updateBreak(slot.key, "startTime", e.target.value)} className={inputClass} />
                          </label>
                          <label className="space-y-1 text-xs text-zinc-400">END
                            <input type="time" required value={slot.endTime} disabled={!canEdit} onChange={(e) => updateBreak(slot.key, "endTime", e.target.value)} className={inputClass} />
                          </label>
                          <label className="col-span-2 space-y-1 text-xs text-zinc-400 md:col-span-1">RETURN GRACE (MIN)
                            <input type="number" min="0" max="60" required disabled={!canEdit} value={slot.gracePeriodMinutes} onChange={(e) => updateBreak(slot.key, "gracePeriodMinutes", e.target.value)} className={inputClass} />
                          </label>
                        </div>
                        <label className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                          <input type="checkbox" checked={slot.paid} disabled={!canEdit} onChange={(e) => updateBreak(slot.key, "paid", e.target.checked)} className="accent-red-600" /> Paid break
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {validationError && <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">{validationError}</p>}

              <section className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-[#1f1015] to-[#101013] p-4 sm:p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-300"><Sparkles size={15} /> Schedule preview</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Shift length", duration(stats.shift)],
                    ["Unpaid breaks", duration(stats.unpaid)],
                    ["Planned paid time", duration(stats.paid)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-[10px] text-zinc-500">{label}</p>
                      <p className="mt-1 text-sm font-bold sm:text-lg">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Clock3 size={14} /> {form.shiftStart} <ArrowRight size={13} /> {form.shiftEnd}
                  <span className="ml-auto">{form.daysOfWeek.length} day(s)/week</span>
                </div>
              </section>
            </div>

            <footer className="flex shrink-0 flex-col gap-2 border-t border-white/10 bg-[#0b0b0e] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                {canEdit && existing && (
                  <button type="button" disabled={busy} onClick={deactivate} className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-red-400 disabled:opacity-50">
                    <Trash2 size={14} /> Deactivate schedule
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={requestClose} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold text-zinc-300 disabled:opacity-50">CANCEL</button>
                {canEdit && (
                  <button type="submit" disabled={busy || Boolean(validationError) || (existing && !dirty)} className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-40">
                    <Save size={16} /> {saving ? "SAVING..." : existing ? "SAVE CHANGES" : "CREATE SCHEDULE"}
                  </button>
                )}
              </div>
            </footer>
          </form>
        )}
      </div>

      {photoPreview && (
        <div role="dialog" aria-modal="true" aria-label="Enrolled photo preview" className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4" onMouseDown={(e) => e.target === e.currentTarget && setPhotoPreview(null)}>
          <button type="button" onClick={() => setPhotoPreview(null)} aria-label="Close photo preview" className="absolute right-5 top-5 rounded-xl bg-white/10 p-3 text-white"><X size={20} /></button>
          <img src={photoPreview} alt="Enrolled trainer reference" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>,
    document.body
  );
}
