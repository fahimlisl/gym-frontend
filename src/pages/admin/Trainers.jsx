import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

import TrainerCard from "../../components/admin/TrainerCard";
import AddTrainerModal from "../../components/admin/AddTrainerModal";

import { fetchAllTrainers } from "../../api/admin.api";
import api from "../../api/axios.api";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/admin/get/me");
        setAdmin(data?.admin ?? null);
      } catch {
        setAdmin(null);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isAllowed = isSuperAdmin || !!admin?.trainer?.allow;
  const isReadOnly = !isSuperAdmin && !!admin?.trainer?.isReadOnly;
  const canEdit = isAllowed && !isReadOnly;
  const lockTitle = isReadOnly ? "Read-only access" : "";

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllTrainers();
      setTrainers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) loadTrainers();
  }, [isAllowed]);

  if (adminLoading) {
    return <p className="text-gray-500 tracking-widest p-6">LOADING...</p>;
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Lock size={40} className="text-red-600 mb-4" />
        <h2 className="text-lg font-bold mb-1">Access restricted</h2>
        <p className="text-gray-500 text-sm">
          You don't have permission to view trainers.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">

        <div className="border border-red-600/30
                        bg-gradient-to-br from-black via-neutral-900 to-black
                        p-6 md:p-8 rounded-xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-widest">
                TRAINERS
              </h1>
              {isReadOnly && (
                <span className="flex items-center gap-1 text-xs font-bold tracking-wide text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                  <Lock size={12} />
                  READ ONLY
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Manage gym trainers & assignments
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            disabled={!canEdit}
            title={lockTitle}
            className="bg-red-600 hover:bg-red-700
                       px-8 py-4 text-xs font-extrabold tracking-widest
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ADD TRAINER
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="TOTAL TRAINERS" value={trainers.length} />
          <Stat
            label="ACTIVE"
            value={trainers.length}
          />
          <Stat
            label="WITH STUDENTS"
            value={trainers.filter(t => t.students?.length).length}
          />
          <Stat label="SALARY BASED" value="—" />
        </div>

        {loading && (
          <p className="text-gray-500 tracking-widest">
            LOADING TRAINERS...
          </p>
        )}

        {!loading && trainers.length === 0 && (
          <div className="border border-white/10 p-10 text-center text-gray-500">
            NO TRAINERS FOUND
          </div>
        )}

        {!loading && trainers.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trainers.map((t) => (
              <TrainerCard
                key={t._id}
                trainer={t}
                onUpdate={loadTrainers}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && canEdit && (
        <AddTrainerModal
          onClose={() => setAddOpen(false)}
          onSuccess={loadTrainers}
        />
      )}
    </>
  );
}


function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-black p-4 rounded-lg">
      <p className="text-[10px] text-gray-400 tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black mt-2">
        {value}
      </p>
    </div>
  );
}