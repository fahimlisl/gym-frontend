// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import toast from "react-hot-toast";

// import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
// import UserHeader from "../../components/admin/UserHeader";
// // import SubscriptionSection from "../../components/admin/SubscriptionSection";
// import SubscriptionCard from "../../components/admin/SubscriptionCard";

// import PTSection from "../../components/admin/PTSection";

// import AssignPTModal from "../../components/admin/AssignPTModal";
// import RenewPTModal from "../../components/admin/RenewPTModal";

// import { fetchParticularUser } from "../../api/admin.api";

// export default function UserDetail() {
//   const { id } = useParams();

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [assignPTOpen, setAssignPTOpen] = useState(false);
//   const [renewPTOpen, setRenewPTOpen] = useState(false);

//   /* ================= LOAD USER ================= */

//   const loadUser = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchParticularUser(id);
//       setUser(res.data.data);
//     } catch (err) {
//       toast.error("Failed to load member");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUser();
//   }, [id]);

//   /* ================= STATES ================= */

//   if (loading) {
//     return (
//       <AdminDashboardLayout>
//         <div className="p-8 text-gray-400 tracking-widest">
//           LOADING MEMBER...
//         </div>
//       </AdminDashboardLayout>
//     );
//   }

//   if (!user) {
//     return (
//       <AdminDashboardLayout>
//         <div className="p-8 text-red-500 tracking-widest">
//           MEMBER NOT FOUND
//         </div>
//       </AdminDashboardLayout>
//     );
//   }

//   /* ================= UI ================= */

//   return (
//     <AdminDashboardLayout>
//       <div className="space-y-10">

//         {/* HEADER */}
//         <div className="border border-red-600/30
//                         bg-gradient-to-br from-black via-neutral-900 to-black
//                         p-6 md:p-8 rounded-xl">
//           <h1 className="text-3xl font-black tracking-widest">
//             MEMBER DETAILS
//           </h1>
//           <p className="text-sm text-gray-400 mt-2">
//             Manage subscription & personal training
//           </p>
//         </div>

//         {/* CONTENT */}
//         <div className="grid lg:grid-cols-2 gap-8">

//           {/* LEFT */}
//           <div className="space-y-6">
//             <UserHeader user={user} />

//             <SubscriptionCard
//               subscription={user.subscription}
//             />
//           </div>

//           {/* RIGHT */}
//           <div className="space-y-6">
//             <PTSection
//               pt={user.personalTraning}
//               onAssign={() => setAssignPTOpen(true)}
//               onRenew={() => setRenewPTOpen(true)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ================= MODALS ================= */}

//       {assignPTOpen && (
//         <AssignPTModal
//           userId={user._id}
//           onClose={() => setAssignPTOpen(false)}
//           onSuccess={loadUser}
//         />
//       )}

//       {renewPTOpen && user.personalTraning && (
//         <RenewPTModal
//           userId={user._id}
//           currentPT={user.personalTraning}
//           onClose={() => setRenewPTOpen(false)}
//           onSuccess={loadUser}
//         />
//       )}
//     </AdminDashboardLayout>
//   );
// }



import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";

import UserHeader from "../../components/admin/UserHeader";
import SubscriptionCard from "../../components/admin/SubscriptionCard";
import PTSection from "../../components/admin/PTSection";

import AssignPTModal from "../../components/admin/AssignPTModal";
import RenewPTModal from "../../components/admin/RenewPTModal";
import RenewMembershipModal from "../../components/admin/RenewMembershipModal";

import { fetchParticularUser } from "../../api/admin.api";

export default function UserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [assignPTOpen, setAssignPTOpen] = useState(false);
  const [renewPTOpen, setRenewPTOpen] = useState(false);
  const [renewMembershipOpen, setRenewMembershipOpen] =
    useState(false);

  /* ================= LOAD USER ================= */

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetchParticularUser(id);
      setUser(res.data.data);
    } catch (err) {
      toast.error("Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-8 text-gray-400 tracking-widest">
          LOADING MEMBER...
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!user) {
    return (
      <AdminDashboardLayout>
        <div className="p-8 text-red-500 tracking-widest">
          MEMBER NOT FOUND
        </div>
      </AdminDashboardLayout>
    );
  }

  /* ================= UI ================= */

  return (
    <AdminDashboardLayout>
      <div className="space-y-10">

        {/* HEADER */}
        <div className="border border-red-600/30
                        bg-gradient-to-br from-black via-neutral-900 to-black
                        p-6 md:p-8 rounded-xl">
          <h1 className="text-3xl font-black tracking-widest">
            MEMBER DETAILS
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Manage subscription & personal training
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="space-y-6">
            <UserHeader user={user} />

            <SubscriptionCard
              subscription={user.subscription}
              onRenew={() => setRenewMembershipOpen(true)}
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <PTSection
              pt={user.personalTraning}
              onAssign={() => setAssignPTOpen(true)}
              onRenew={() => setRenewPTOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {assignPTOpen && (
        <AssignPTModal
          userId={user._id}
          onClose={() => setAssignPTOpen(false)}
          onSuccess={loadUser}
        />
      )}

      {renewPTOpen && user.personalTraning && (
        <RenewPTModal
          userId={user._id}
          currentPT={user.personalTraning}
          onClose={() => setRenewPTOpen(false)}
          onSuccess={loadUser}
        />
      )}

      {renewMembershipOpen && (
        <RenewMembershipModal
          userId={user._id}
          onClose={() => setRenewMembershipOpen(false)}
          onSuccess={loadUser}
        />
      )}
    </AdminDashboardLayout>
  );
}
