import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import UserHeader from "../../components/admin/UserHeader";
import SubscriptionCard from "../../components/admin/SubscriptionCard";
import PTSection from "../../components/admin/PTSection";

import AssignPTModal from "../../components/admin/AssignPTModal";
import RenewPTModal from "../../components/admin/RenewPTModal";
import RenewMembershipModal from "../../components/admin/RenewMembershipModal";

import { fetchParticularUser } from "../../api/admin.api";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [assignPTOpen, setAssignPTOpen] = useState(false);
  const [renewPTOpen, setRenewPTOpen] = useState(false);
  const [renewMembershipOpen, setRenewMembershipOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="p-8 text-gray-400 tracking-widest">LOADING MEMBER...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-red-500 tracking-widest">MEMBER NOT FOUND</div>
    );
  }

  return (
    <>
      <div className="space-y-10">

        <button
          onClick={() => navigate("/admin/members")}
          className="
    group relative overflow-hidden
    flex items-center gap-3
    px-5 py-2.5
    text-[11px] font-black tracking-widest
    border border-red-600/30
    bg-gradient-to-r from-black via-neutral-900 to-black
    rounded-lg
    transition-all duration-300
    hover:border-red-600
    hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]
    w-fit
  "
        >
          <span
            className="
    absolute inset-0
    bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0
    opacity-0 group-hover:opacity-100
    transition duration-500
  "
          />

          <span
            className="
    relative text-red-500
    transform group-hover:-translate-x-1
    transition
  "
          >
            ←
          </span>

          <span className="relative">BACK TO MEMBERS</span>
        </button>


        <div
          className="border border-red-600/30
          bg-gradient-to-br from-black via-neutral-900 to-black
          p-6 md:p-8 rounded-xl"
        >
          <h1 className="text-3xl font-black tracking-widest">
            MEMBER DETAILS
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Manage subscription & personal training
          </p>
        </div>


        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UserHeader user={user} />

            <SubscriptionCard
              subscription={user.subscription}
              onRenew={() => setRenewMembershipOpen(true)}
            />
          </div>

          <div className="space-y-6">
            <PTSection
              pt={user.personalTraning}
              onAssign={() => setAssignPTOpen(true)}
              onRenew={() => setRenewPTOpen(true)}
            />
          </div>
        </div>
      </div>


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
    </>
  );
}
