import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, Lock, Plus, Search, ShieldCheck, Users, UserRoundCheck } from "lucide-react";
import TrainerCard from "../../components/admin/TrainerCard";
import AddTrainerModal from "../../components/admin/AddTrainerModal";
import { fetchAllTrainers } from "../../api/admin.api";
import api from "../../api/axios.api";

const Stat = ({ icon: Icon, label, value, accent = "text-red-400" }) => (
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151518] to-[#0d0d0f] p-4 sm:p-5">
    <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-zinc-500">{label}</p><Icon size={17} className={accent}/></div>
    <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
  </div>
);

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/admin/get/me");
        const nextAdmin = data?.data?.admin ?? data?.data ?? data?.admin ?? null;
        if (active) setAdmin(nextAdmin);
      } catch {
        if (active) setAdmin(null);
      } finally {
        if (active) setAdminLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const isSuperAdmin = !!admin?.isSuperAdmin;
  const isAllowed = isSuperAdmin || !!admin?.trainer?.allow;
  const isReadOnly = !isSuperAdmin && !!admin?.trainer?.isReadOnly;
  const canEdit = isAllowed && !isReadOnly;

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetchAllTrainers();
      setTrainers(res.data.data || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load trainers.");
      toast.error("Failed to fetch trainers");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAllowed) loadTrainers(); }, [isAllowed, loadTrainers]);

  const filtered = useMemo(() => trainers.filter((t) =>
    [t.fullName, t.email, String(t.phoneNumber ?? "")].some((value) =>
      String(value || "").toLowerCase().includes(search.trim().toLowerCase())
    )), [trainers, search]);

  if (adminLoading) return <div className="p-8 text-xs font-bold tracking-widest text-zinc-500">LOADING TRAINER MANAGEMENT...</div>;
  if (!isAllowed) return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center text-white">
      <Lock size={38} className="mb-4 text-red-500"/>
      <h2 className="text-lg font-black">Access restricted</h2>
      <p className="mt-2 text-sm text-zinc-500">You don't have permission to view trainers.</p>
    </div>
  );

  return (
    <div className="space-y-7 text-white">
      <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#231014] via-[#121114] to-[#0c0c0e] px-5 py-7 sm:px-8">
        <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl"/>
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold tracking-[.22em] text-red-400"><CalendarClock size={14}/> STAFF OPERATIONS</div>
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">TRAINERS</h1>{isReadOnly && <span className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400"><Lock size={12}/> READ ONLY</span>}</div>
            <p className="mt-2 text-sm text-zinc-400">Manage trainers, assign shifts, and personalize break schedules.</p>
          </div>
          <button type="button" onClick={() => setAddOpen(true)} disabled={!canEdit} title={!canEdit ? "Read-only access" : "Add trainer"} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-xs font-black tracking-widest text-white shadow-[0_10px_40px_rgba(220,38,38,.2)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={17}/> ADD TRAINER</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Users} label="Total trainers" value={trainers.length}/>
        <Stat icon={UserRoundCheck} label="With students" value={trainers.filter((t) => t.students?.length).length} accent="text-emerald-400"/>
        <Stat icon={ShieldCheck} label="Access mode" value={canEdit ? "EDITOR" : "VIEWER"} accent="text-amber-400"/>
        <Stat icon={CalendarClock} label="Schedule management" value="READY"/>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-lg font-black tracking-tight">Team directory</h2><p className="text-xs text-zinc-500">Open a trainer card to configure their weekly schedule.</p></div>
        <div className="relative w-full sm:w-72"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trainers..." aria-label="Search trainers" className="w-full rounded-xl border border-white/10 bg-[#111114] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/50"/></div>
      </div>

      {fetchError && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{fetchError} <button onClick={loadTrainers} className="ml-2 underline">Retry</button></div>}
      {loading ? <p className="py-12 text-center text-xs font-bold tracking-widest text-zinc-500">LOADING TRAINERS...</p> : !filtered.length ? <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center text-sm text-zinc-500">{trainers.length ? "No trainers match your search." : "No trainers found."}</div> : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trainer) => <TrainerCard key={trainer._id} trainer={trainer} onUpdate={loadTrainers} canEdit={canEdit}/>) }
        </div>
      )}

      {addOpen && canEdit && <AddTrainerModal onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); loadTrainers(); }}/>} 
    </div>
  );
}
