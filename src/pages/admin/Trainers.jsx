import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import TrainerCard from "../../components/admin/TrainerCard";
import AddTrainerModal from "../../components/admin/AddTrainerModal";

import { fetchAllTrainers } from "../../api/admin.api";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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
    loadTrainers();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="space-y-10">

        <div className="border border-red-600/30
                        bg-gradient-to-br from-black via-neutral-900 to-black
                        p-6 md:p-8 rounded-xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-widest">
              TRAINERS
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Manage gym trainers & assignments
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="bg-red-600 hover:bg-red-700
                       px-8 py-4 text-xs font-extrabold tracking-widest"
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
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && (
        <AddTrainerModal
          onClose={() => setAddOpen(false)}
          onSuccess={loadTrainers}
        />
      )}
    </AdminDashboardLayout>
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
