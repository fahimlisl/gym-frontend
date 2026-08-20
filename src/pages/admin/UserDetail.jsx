import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import api from "../../api/axios.api";

import UserHeader from "../../components/admin/UserHeader";
import SubscriptionCard from "../../components/admin/SubscriptionCard";
import PTSection from "../../components/admin/PTSection";

import AssignPTModal from "../../components/admin/AssignPTModal";
import RenewPTModal from "../../components/admin/RenewPTModal";
import RenewMembershipModal from "../../components/admin/RenewMembershipModal";
import AssignWorkoutModal from "./AssignWorkoutModal";
import DietManagementModal from "../../components/admin/DietManagementModal";
import EditMemberModal from "../../components/admin/EditMemberModal";
import ChangeTrainerModal from "../../components/admin/ChangeTrainerModal";

import { fetchParticularUser } from "../../api/admin.api";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkTempBill, setCheckTempBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userWorkout, setUserWorkout] = useState(null);
  const [userDiet, setUserDiet] = useState(null);

  const [assignPTOpen, setAssignPTOpen] = useState(false);
  const [renewPTOpen, setRenewPTOpen] = useState(false);
  const [renewMembershipOpen, setRenewMembershipOpen] = useState(false);
  const [assignWorkoutOpen, setAssignWorkoutOpen] = useState(false);
  const [dietModalOpen, setDietModalOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [showChangeTrainer, setShowChangeTrainer] = useState(false);

  // ---- admin permission state ----
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

  // Base access
  const isAllowed = isSuperAdmin || !!admin?.members?.allow;

  // Granular permissions
  const canEditMember = isSuperAdmin || (admin?.members?.allow && !admin?.members?.isReadOnly);
  const canRenew = isSuperAdmin || (admin?.can_renew?.allow && !admin?.can_renew?.isReadOnly);
  const canAssignWorkout = isSuperAdmin || (admin?.can_assign_workout?.allow && !admin?.can_assign_workout?.isReadOnly);
  const canAssignDiet = isSuperAdmin || (admin?.can_assign_diet?.allow && !admin?.can_assign_diet?.isReadOnly);
  const canChangeTrainer = isSuperAdmin || (admin?.can_change_trainer?.allow && !admin?.can_change_trainer?.isReadOnly);

  // ---- load user data ----
  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetchParticularUser(id);
      setUser(res.data.data);
      const checkptbill = await api.get(`/admin/personal-training/check/self/pt/${id}`);
      setCheckTempBill(checkptbill.data.data);
      await Promise.all([fetchUserWorkout(), fetchUserDiet()]);
    } catch {
      toast.error("Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkout = async () => {
    try {
      const res = await api.get(`/admin/user/${id}/workout`);
      setUserWorkout(res.data.data);
    } catch {
      setUserWorkout(null);
    }
  };

  const fetchUserDiet = async () => {
    try {
      const res = await api.get(`/admin/diet/check/${id}`);
      if (res.data.data.exists) {
        const dietRes = await api.get(`/admin/diet/show/${id}`);
        setUserDiet(dietRes.data.data);
      } else {
        setUserDiet(null);
      }
    } catch {
      setUserDiet(null);
    }
  };

  const handleRemovePT = async () => {
    try {
      await api.patch(`/admin/personal-training/remove/${id}`);
      toast.success("Personal training removed successfully");
      loadUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove PT");
    }
  };

  useEffect(() => {
    if (isAllowed) loadUser();
  }, [id, isAllowed]);

  // ---- loading / blocked states ----
  if (adminLoading || loading) {
    return (
      <div className="p-8 text-gray-400 tracking-widest">LOADING MEMBER...</div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Lock size={40} className="text-red-600 mb-4" />
        <h2 className="text-lg font-bold mb-1">Access restricted</h2>
        <p className="text-gray-500 text-sm">
          You don't have permission to view member details.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-red-500 tracking-widest">MEMBER NOT FOUND</div>
    );
  }

  // ---- main render ----
  return (
    <>
      <div className="space-y-10">
        {/* Back button – always active */}
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
          <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition duration-500" />
          <span className="relative text-red-500 transform group-hover:-translate-x-1 transition">←</span>
          <span className="relative">BACK TO MEMBERS</span>
        </button>

        <div className="border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-6 md:p-8 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-widest">MEMBER DETAILS</h1>
              {!canEditMember && (
                <span className="flex items-center gap-1 text-xs font-bold tracking-wide text-yellow-500">
                  <Lock size={12} /> READ ONLY
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Manage subscription, personal training & workout plans
            </p>
          </div>
          <button
            onClick={() => setEditMemberOpen(true)}
            disabled={!canEditMember}
            title={!canEditMember ? "You don't have permission to edit member details" : ""}
            className="
              group relative overflow-hidden
              flex items-center gap-2
              px-5 py-2.5
              text-[11px] font-black tracking-widest
              rounded-lg
              transition-all duration-300
              hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            style={{
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fff",
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition duration-300" />
            <span className="relative">✎</span>
            <span className="relative">EDIT MEMBER</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UserHeader user={user} />
            <SubscriptionCard
              userId={user._id}
              subscription={user.subscription}
              onRenew={() => setRenewMembershipOpen(true)}
              onRefresh={loadUser}
              canRenew={canRenew}         
              isSuperAdmin={isSuperAdmin}   
            />
          </div>

          <div className="space-y-6">
            <PTSection
              pt={user.personalTraning}
              onAssign={() => setAssignPTOpen(true)}
              onRenew={() => setRenewPTOpen(true)}
              onChangeTrainer={() => setShowChangeTrainer(true)}
              subscription={user.subscription}
              onRemove={handleRemovePT}
              userId={user._id}
              canRenew={canRenew}                
              canChangeTrainer={canChangeTrainer} 
            />

            <div className="border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-6 rounded-xl">
              <h2 className="text-2xl font-black tracking-widest mb-4">WORKOUT PLAN</h2>

              {userWorkout ? (
                <div className="space-y-4">
                  <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-light mb-2">{userWorkout.name}</h3>
                    <div className="text-xs text-neutral-400 space-y-1">
                      <p><span className="text-white">Status:</span> {userWorkout.status}</p>
                      <p><span className="text-white">Current Week:</span> {userWorkout.currentWeek} / {userWorkout.duration}</p>
                      <p><span className="text-white">Difficulty:</span> {userWorkout.difficultyLevel}</p>
                      <p><span className="text-white">Goal:</span> {userWorkout.goal}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/admin/workout/${userWorkout._id}`)}
                      disabled={!canAssignWorkout}
                      title={!canAssignWorkout ? "You don't have permission to edit workout plans" : ""}
                      className="flex-1 py-2 px-4 border border-white/10 text-white text-xs font-light hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-white"
                    >
                      EDIT PLAN
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Replace current workout plan?")) setAssignWorkoutOpen(true); }}
                      disabled={!canAssignWorkout}
                      title={!canAssignWorkout ? "You don't have permission to change workout plans" : ""}
                      className="flex-1 py-2 px-4 border border-white/10 text-white text-xs font-light hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-white"
                    >
                      CHANGE PLAN
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-neutral-400 text-sm">No workout plan assigned</p>
                  <button
                    onClick={() => setAssignWorkoutOpen(true)}
                    disabled={!canAssignWorkout}
                    title={!canAssignWorkout ? "You don't have permission to assign workout plans" : ""}
                    className="w-full py-3 px-4 bg-red-500 text-white text-xs font-light tracking-wider hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    PROVIDE WORKOUT PLAN
                  </button>
                </div>
              )}
            </div>

            <div className="border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-6 rounded-xl">
              <h2 className="text-2xl font-black tracking-widest mb-4">DIET CHART</h2>

              {userDiet ? (
                <div className="space-y-4">
                  <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          userDiet.status === "approved"
                            ? "bg-green-500 animate-pulse"
                            : "bg-yellow-500"
                        }`} />
                        <span className={`text-sm font-bold tracking-wider ${
                          userDiet.status === "approved"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}>
                          {userDiet.status === "approved" ? "APPROVED" : "DRAFT"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {userDiet.photos?.length || 0} file(s)
                      </div>
                    </div>
                    
                    {userDiet.status === "draft" && (
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        <span>⏳</span> Pending approval from admin
                      </p>
                    )}
                    
                    {userDiet.status === "approved" && (
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        <span>✅</span> Active diet plan
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setDietModalOpen(true)}
                    disabled={!canAssignDiet}
                    title={!canAssignDiet ? "You don't have permission to manage diet charts" : ""}
                    className="w-full py-2.5 px-4 border border-white/10 text-white text-xs font-light tracking-wider hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-white"
                  >
                    <span>📋</span>
                    MANAGE DIET CHART
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-neutral-800/30 border border-white/5 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">🥗</div>
                    <p className="text-neutral-400 text-sm">No diet chart assigned</p>
                  </div>
                  <button
                    onClick={() => setDietModalOpen(true)}
                    disabled={!canAssignDiet}
                    title={!canAssignDiet ? "You don't have permission to assign diet charts" : ""}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-light tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>+</span>
                    CREATE DIET CHART
                  </button>
                </div>
              )}
            </div>
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
          subscription={user?.subscription}
        />
      )}

      {assignWorkoutOpen && (
        <AssignWorkoutModal
          userId={user._id}
          onClose={() => setAssignWorkoutOpen(false)}
          onSuccess={loadUser}
        />
      )}

      {dietModalOpen && (
        <DietManagementModal
          userId={user._id}
          onClose={() => {
            setDietModalOpen(false);
            fetchUserDiet();
          }}
        />
      )}

      {showChangeTrainer && (
        <ChangeTrainerModal
          userId={user._id}
          currentTrainerId={user.personalTraning?.subscription?.[user.personalTraning.subscription.length - 1]?.trainer?._id}
          onClose={() => setShowChangeTrainer(false)}
          onSuccess={loadUser}
          tempBillExist={checkTempBill}
        />
      )}

      {editMemberOpen && (
        <EditMemberModal
          user={user}
          onClose={() => setEditMemberOpen(false)}
          onSuccess={loadUser}
        />
      )}
    </>
  );
}