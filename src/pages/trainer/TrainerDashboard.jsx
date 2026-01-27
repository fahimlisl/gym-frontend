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

      {/* HEADER */}
      <div className="border border-red-600/30 bg-black p-6">
        <h1 className="text-3xl font-black tracking-widest">
          TRAINER DASHBOARD
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Assigned members & training access
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="TOTAL STUDENTS" value={students.length} />
        <Stat label="ACTIVE" value={students.length} />
        <Stat label="DIET ACCESS" value="LIMITED" />
        <Stat label="PT MODE" value="ON" />
      </div>

      {/* CONTENT */}
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

/* ---------------- STAT BOX ---------------- */

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


// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import TrainerDashboardLayout from "../../components/layout/TrainerDashboardLayout";
// import StudentCard from "../../components/trainer/StudentCard";
// import { fetchAssignedStudents } from "../../api/trainer.api";
// import api from "../../api/axios.api.js";

// export default function TrainerDashboard() {
//   const [trainer, setTrainer] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         // ✅ CORRECT endpoint
//         const trainerRes = await api.get("/trainer/fetchSelf");
//         setTrainer(trainerRes.data.data);

//         const studentsRes = await fetchAssignedStudents();
//         setStudents(studentsRes.data.data || []);
//       } catch (err) {
//         toast.error("Failed to load trainer dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-neutral-950
//                       flex items-center justify-center
//                       text-gray-500 tracking-widest">
//         LOADING DASHBOARD...
//       </div>
//     );
//   }

//   return (
//     <TrainerDashboardLayout trainer={trainer}>

//       {/* STATS */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         <Stat label="TOTAL STUDENTS" value={students.length} />
//         <Stat label="ACTIVE PT" value={students.length} />
//         <Stat label="DIET ACCESS" value="LIMITED" />
//         <Stat label="STATUS" value="ONLINE" />
//       </div>

//       {/* STUDENTS */}
//       {students.length === 0 ? (
//         <div className="border border-white/10
//                         p-10 text-center text-gray-500">
//           NO STUDENTS ASSIGNED
//         </div>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//           {students.map((s) => (
//             <StudentCard key={s._id} student={s} />
//           ))}
//         </div>
//       )}
//     </TrainerDashboardLayout>
//   );
// }

// /* ---------- STAT ---------- */
// function Stat({ label, value }) {
//   return (
//     <div className="border border-white/10 bg-black p-5">
//       <p className="text-xs text-gray-400 tracking-widest">{label}</p>
//       <p className="text-2xl font-black mt-2">{value}</p>
//     </div>
//   );
// }
