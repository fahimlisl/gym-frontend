import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { fetchAssignedStudents } from "../../api/trainer.api";
import StudentCard from "../../components/trainer/StudentCard";
import TrainerDashboardLayout from "../../components/layout/TrainerDashboardLayout";

export default function TrainerDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAssignedStudents();
        setStudents(res.data.data || []);
      } catch {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <TrainerDashboardLayout>
    <div className="min-h-screen bg-neutral-950 text-white p-6 space-y-8">

      <div className="border border-red-600/30 bg-black p-6">
        <h1 className="text-3xl font-black tracking-widest">
          TRAINER DASHBOARD
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Assigned members & training access
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="TOTAL STUDENTS" value={students.length} />
        <Stat label="ACTIVE" value={students.length} />
        <Stat label="DIET ACCESS" value="LIMITED" />
        <Stat label="PT MODE" value="ON" />
      </div>

      {loading && (
        <p className="text-gray-500 tracking-widest">
          LOADING STUDENTS...
        </p>
      )}

      {!loading && students.length === 0 && (
        <div className="border border-white/10 p-10 text-center text-gray-500">
          NO STUDENTS ASSIGNED YET
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => (
            <StudentCard key={s._id} student={s} />
          ))}
        </div>
      )}
    </div>
    </TrainerDashboardLayout>
  );
}


function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-black p-5">
      <p className="text-xs text-gray-400 tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black mt-2">
        {value}
      </p>
    </div>
  );
}
