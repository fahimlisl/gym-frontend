import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertCircle, ArrowLeft, ArrowRight, CalendarClock, CheckCheck,
  ChevronDown, ClipboardList, Clock3, ExternalLink, Filter,
  Loader2, Mail, Phone, RefreshCw, Search, ShieldCheck,
  UserRound, X, XCircle,
} from "lucide-react";
import api from "../../api/axios.api";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORY_OPTIONS = [
  { value: "trainer", label: "Trainer" },
  { value: "equipment", label: "Equipment" },
  { value: "membership", label: "Membership" },
  { value: "personal_training", label: "Personal Training" },
  { value: "payment", label: "Payment" },
  { value: "website", label: "Website" },
  { value: "staff", label: "Staff" },
  { value: "other", label: "Other" },
];

const LABELS = Object.fromEntries(
  [...STATUS_OPTIONS, ...CATEGORY_OPTIONS].map((item) => [item.value, item.label])
);

const STATUS_STYLE = {
  open: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const inputClass =
  "w-full min-h-11 rounded-xl border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10";

function formatDate(value, withTime = true) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  });
}

function getError(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[status] || "border-white/20 bg-white/5 text-gray-300"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, selected, onClick, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition sm:p-5 ${selected ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-neutral-900/70 hover:border-white/20 hover:bg-neutral-900"}`}
      aria-pressed={selected}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-gray-400">{label}</span>
        <span className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
    </button>
  );
}

function MemberAvatar({ name }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-black text-red-300">
      {initials(name)}
    </span>
  );
}

function DetailModal({ complaint, onClose, onSaved }) {
  const [nextStatus, setNextStatus] = useState(complaint.status);
  const [saving, setSaving] = useState(false);
  const member = complaint.member;

  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, saving]);

  const saveStatus = async () => {
    if (saving || nextStatus === complaint.status) return;
    setSaving(true);
    try {
      const { data } = await api.patch(
        `/admin/member-complaints/${encodeURIComponent(complaint.id)}/status`,
        { status: nextStatus }
      );
      if (!data?.success || !data?.data?.id) throw new Error("Unexpected response from server");
      toast.success("Complaint status updated");
      onSaved(data.data);
    } catch (error) {
      toast.error(getError(error, "Failed to update complaint"));
    } finally {
      setSaving(false);
    }
  };

  const tel = member?.phoneNumber ? String(member.phoneNumber).replace(/[^+\d]/g, "") : "";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="complaint-detail-heading"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        className="flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusPill status={complaint.status} />
              <span className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</span>
            </div>
            <h2 id="complaint-detail-heading" className="text-xl font-black text-white">Complaint details</h2>
            <p className="mt-1 break-all font-mono text-xs text-gray-400">{complaint.complaintId}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close details" className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">Member information</p>
            {member ? (
              <div className="flex items-start gap-3">
                <MemberAvatar name={member.username} />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-semibold text-white">{member.username || "Unknown member"}</p>
                  {tel ? (
                    <a href={`tel:${tel}`} className="flex items-center gap-2 break-all text-sm text-gray-300 hover:text-red-300">
                      <Phone className="h-4 w-4 shrink-0" />{member.phoneNumber}<ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <p className="text-sm text-gray-500">Phone not available</p>}
                  {member.email ? (
                    <a href={`mailto:${encodeURIComponent(member.email)}`} className="flex items-center gap-2 break-all text-sm text-gray-300 hover:text-red-300">
                      <Mail className="h-4 w-4 shrink-0" />{member.email}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-300">The linked member account is unavailable. This complaint is still preserved.</p>
            )}
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-200">{LABELS[complaint.category] || complaint.category}</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">Source: Member AI</span>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">Complaint description</p>
            <p className="whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-gray-200">{complaint.description}</p>
          </section>

          <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 p-4 text-sm sm:grid-cols-2">
            <div><p className="mb-1 text-xs text-gray-500">Submitted (IST)</p><p className="text-gray-200">{formatDate(complaint.confirmedAt || complaint.createdAt)}</p></div>
            <div><p className="mb-1 text-xs text-gray-500">Last updated (IST)</p><p className="text-gray-200">{formatDate(complaint.updatedAt)}</p></div>
            {complaint.resolvedAt && <div><p className="mb-1 text-xs text-gray-500">Resolved (IST)</p><p className="text-emerald-300">{formatDate(complaint.resolvedAt)}</p></div>}
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-red-400" /> Manage complaint</div>
            <label htmlFor="new-complaint-status" className="mb-2 block text-xs text-gray-400">Set status</label>
            <div className="relative">
              <select id="new-complaint-status" disabled={saving} value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
                {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-500" />
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">Resolved automatically records the resolution time. Changing away from Resolved clears that timestamp.</p>
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-black/30 px-5 py-4 sm:px-7">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40">Close</button>
          <button type="button" onClick={saveStatus} disabled={saving || nextStatus === complaint.status} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            {saving ? "Saving..." : "Save status"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MemberComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => setPage(1), [search, status, category]);

  const refresh = useCallback(() => setRefreshTick((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let valid = true;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [listResponse, statsResponse] = await Promise.all([
          api.get("/admin/member-complaints", {
            params: { page, limit: 15, status, category, search },
            signal: controller.signal,
          }),
          api.get("/admin/member-complaints/stats", { signal: controller.signal }),
        ]);
        if (!valid) return;
        if (!listResponse.data?.success || !statsResponse.data?.success) throw new Error("Invalid server response");
        setComplaints(listResponse.data.data?.complaints || []);
        setPagination(listResponse.data.data?.pagination || { page: 1, total: 0, totalPages: 1, limit: 15 });
        setStats(statsResponse.data.data || { total: 0, open: 0, in_progress: 0, resolved: 0, rejected: 0 });
      } catch (error) {
        if (!valid || error?.code === "ERR_CANCELED") return;
        setLoadError(getError(error, "Couldn't load member complaints"));
      } finally {
        if (valid) setLoading(false);
      }
    };
    load();
    return () => { valid = false; controller.abort(); };
  }, [page, status, category, search, refreshTick]);

  const onSaved = (updated) => {
    setSelected(updated);
    refresh();
  };

  const setStatusFilter = (value) => { setStatus(value); setPage(1); };
  const setCategoryFilter = (value) => { setCategory(value); setPage(1); };

  return (
    <div className="min-h-screen w-full min-w-0 bg-neutral-950 px-3 pb-12 pt-5 text-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400"><ShieldCheck className="h-4 w-4" /> AlphaGym Admin</div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Member Complaints</h1>
            <p className="mt-2 text-sm text-gray-400">Review issues raised through member AI and update their resolution status.</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-gray-200 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-40 sm:self-auto">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Total complaints" value={stats.total} icon={ClipboardList} selected={status === "all"} onClick={() => setStatusFilter("all")} tone="bg-white/10 text-white" />
          <StatCard label="Open" value={stats.open} icon={AlertCircle} selected={status === "open"} onClick={() => setStatusFilter("open")} tone="bg-amber-500/10 text-amber-400" />
          <StatCard label="In progress" value={stats.in_progress} icon={Clock3} selected={status === "in_progress"} onClick={() => setStatusFilter("in_progress")} tone="bg-sky-500/10 text-sky-400" />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCheck} selected={status === "resolved"} onClick={() => setStatusFilter("resolved")} tone="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} selected={status === "rejected"} onClick={() => setStatusFilter("rejected")} tone="bg-rose-500/10 text-rose-400" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50">
          <div className="space-y-4 border-b border-white/10 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-bold"><Filter className="h-4 w-4 text-red-400" /> All Member Complaints</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
              <label className="relative block">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} maxLength={100} placeholder="Search ID, issue, name, email or full phone..." aria-label="Search complaints" className={`${inputClass} pl-10 pr-9`} />
                {searchInput && <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-3 top-3 text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>}
              </label>
              <select aria-label="Filter by status" value={status} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select aria-label="Filter by category" value={category} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500">{pagination.total} matching complaint{pagination.total === 1 ? "" : "s"} · Newest first · All dates in IST</p>
          </div>

          {loadError ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-gray-300">{loadError}</p>
              <button type="button" onClick={refresh} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500">Try again</button>
            </div>
          ) : loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-400"><Loader2 className="h-5 w-5 animate-spin text-red-500" /> Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
              <ClipboardList className="mb-2 h-9 w-9 text-gray-600" />
              <p className="font-semibold">No complaints found</p>
              <p className="text-sm text-gray-500">Try another search or filter.</p>
              {(searchInput || status !== "all" || category !== "all") && (
                <button type="button" onClick={() => { setSearchInput(""); setStatusFilter("all"); setCategoryFilter("all"); }} className="mt-2 text-sm font-semibold text-red-400 hover:text-red-300">Clear filters</button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 font-bold">Complaint</th>
                      <th className="whitespace-nowrap px-5 py-4 font-bold">Member</th>
                      <th className="whitespace-nowrap px-5 py-4 font-bold">Category</th>
                      <th className="whitespace-nowrap px-5 py-4 font-bold">Status</th>
                      <th className="whitespace-nowrap px-5 py-4 font-bold">Submitted</th>
                      <th className="whitespace-nowrap px-5 py-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {complaints.map((item) => (
                      <tr key={item.id} className="transition hover:bg-white/[0.035]">
                        <td className="max-w-[290px] px-5 py-4 align-top">
                          <p className="mb-1 truncate font-mono text-xs font-bold text-red-300" title={item.complaintId}>{item.complaintId}</p>
                          <p className="line-clamp-2 break-words text-xs leading-5 text-gray-400">{item.description}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <MemberAvatar name={item.member?.username} />
                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate font-semibold text-white">{item.member?.username || "Deleted member"}</p>
                              <p className="mt-0.5 text-xs text-gray-400">{item.member?.phoneNumber || "No phone"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-gray-300">{LABELS[item.category] || item.category}</td>
                        <td className="px-5 py-4 align-top"><StatusPill status={item.status} /></td>
                        <td className="whitespace-nowrap px-5 py-4 align-top text-xs text-gray-400">{formatDate(item.createdAt)}</td>
                        <td className="px-5 py-4 text-right align-top">
                          <button type="button" onClick={() => setSelected(item)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20">View / Update</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/10 lg:hidden">
                {complaints.map((item) => (
                  <button type="button" key={item.id} onClick={() => setSelected(item)} className="w-full p-4 text-left transition hover:bg-white/5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-bold text-red-300">{item.complaintId}</p>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <div className="mb-2 flex items-center gap-2"><UserRound className="h-4 w-4 text-gray-500" /><span className="text-sm font-semibold">{item.member?.username || "Deleted member"}</span><span className="ml-auto text-xs text-gray-500">{LABELS[item.category] || item.category}</span></div>
                    <p className="line-clamp-2 break-words text-sm leading-6 text-gray-400">{item.description}</p>
                    <p className="mt-3 text-xs font-semibold text-red-400">View details & update status →</p>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total matching
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((n) => Math.max(1, n - 1))} disabled={loading || page <= 1} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-35"><ArrowLeft className="h-4 w-4" /> Previous</button>
              <button type="button" onClick={() => setPage((n) => n + 1)} disabled={loading || page >= pagination.totalPages} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-35">Next <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <p className="flex items-center gap-2 text-xs text-gray-600"><CalendarClock className="h-3.5 w-3.5" /> Complaint details are linked to the current member profile. Status changes are saved to MongoDB.</p>
      </div>

      <AnimatePresence>
        {selected && <DetailModal key={selected.id} complaint={selected} onClose={() => setSelected(null)} onSaved={onSaved} />}
      </AnimatePresence>
    </div>
  );
}