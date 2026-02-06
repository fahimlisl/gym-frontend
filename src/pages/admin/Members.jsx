import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import MemberCard from "../../components/admin/MemberCard";
import AddMemberModal from "../../components/admin/AddMemberModal";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";

import { fetchAllMembers } from "../../api/admin.api.js";

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);



  const getLatestSubscription = (user) => {
    const subs = user?.subscription?.subscription;
    if (!Array.isArray(subs) || subs.length === 0) return null;

    return [...subs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  };


  const getLatestStatus = (user) => {
    const latest = getLatestSubscription(user);
    return latest?.status || "none";
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllMembers();
      const fetchedUsers = res.data.data || [];


      const sortedUsers = [...fetchedUsers].sort((a, b) => {
        const statusA = getLatestStatus(a);
        const statusB = getLatestStatus(b);

        if (statusA === "expired" && statusB !== "expired") return -1;
        if (statusA !== "expired" && statusB === "expired") return 1;
        return 0;
      });

      setUsers(sortedUsers);
    } catch (err) {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="space-y-12">

        <div className="relative overflow-hidden rounded-2xl
                        bg-gradient-to-br from-black via-neutral-900 to-black
                        border border-red-600/25 p-8">

          <div className="relative z-10 flex flex-col md:flex-row
                          md:items-center md:justify-between gap-6">

            <div>
              <h1 className="text-4xl font-black tracking-widest">
                MEMBERS
              </h1>
              <p className="text-sm text-gray-400 mt-3 max-w-xl">
                Manage gym members, memberships and personal training
                from a single control panel.
              </p>
            </div>

            <button
              onClick={() => setOpenAdd(true)}
              className="bg-red-600 hover:bg-red-700
                         px-10 py-4 text-xs font-extrabold tracking-widest
                         shadow-[0_0_40px_rgba(239,68,68,0.35)]"
            >
              ADD MEMBER
            </button>
          </div>

          <div className="absolute -top-24 -right-24 w-96 h-96
                          bg-red-600/10 blur-3xl rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <StatBox label="TOTAL MEMBERS" value={users.length} />
          <StatBox
            label="WITH PT"
            value={users.filter(u => u.personalTraning).length}
          />
          <StatBox
            label="WITHOUT PT"
            value={users.filter(u => !u.personalTraning).length}
          />
          <StatBox
            label="ACTIVE"
            value={users.filter(
              u => getLatestStatus(u) === "active"
            ).length}
          />
          <StatBox
            label="EXPIRED"
            value={users.filter(
              u => getLatestStatus(u) === "expired"
            ).length}
          />
        </div>

        {loading && (
          <div className="text-gray-500 tracking-widest">
            LOADING MEMBERS...
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="rounded-xl border border-white/10
                          bg-neutral-900/40 p-14 text-center text-gray-500">
            NO MEMBERS FOUND
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-4">
            {users.map((u) => (
              <MemberCard
                key={u._id}
                user={u}
                latestStatus={getLatestStatus(u)}
                latestSubscription={getLatestSubscription(u)}
              />
            ))}
          </div>
        )}
      </div>

      {openAdd && (
        <AddMemberModal
          onClose={() => setOpenAdd(false)}
          onSuccess={loadMembers}
        />
      )}
    </AdminDashboardLayout>
  );
}


function StatBox({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-xl
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    border border-white/10 p-5">

      <p className="text-[11px] text-gray-400 tracking-widest">
        {label}
      </p>

      <p className="text-3xl font-black mt-3">
        {value}
      </p>

      <div className="absolute bottom-0 left-0 w-full h-[2px]
                      bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
    </div>
  );
}
