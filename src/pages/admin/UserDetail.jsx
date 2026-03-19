import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

import UserHeader from "../../components/admin/UserHeader";
import SubscriptionCard from "../../components/admin/SubscriptionCard";
import PTSection from "../../components/admin/PTSection";

import AssignPTModal from "../../components/admin/AssignPTModal";
import RenewPTModal from "../../components/admin/RenewPTModal";
import RenewMembershipModal from "../../components/admin/RenewMembershipModal";
import AssignWorkoutModal from "./AssignWorkoutModal";

import { fetchParticularUser } from "../../api/admin.api";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userWorkout, setUserWorkout] = useState(null);

  const [assignPTOpen, setAssignPTOpen] = useState(false);
  const [renewPTOpen, setRenewPTOpen] = useState(false);
  const [renewMembershipOpen, setRenewMembershipOpen] = useState(false);
  const [assignWorkoutOpen, setAssignWorkoutOpen] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetchParticularUser(id);
      setUser(res.data.data);
      
      // Fetch user's current workout
      await fetchUserWorkout();
    } catch (err) {
      toast.error("Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkout = async () => {
    try {
      const res = await api.get(`/admin/user/${id}/workout`);
      setUserWorkout(res.data.data);
    } catch (err) {
      setUserWorkout(null);
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
            Manage subscription, personal training & workout plans
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
              subscription={user.subscription} 
              onAssign={() => setAssignPTOpen(true)}
              onRenew={() => setRenewPTOpen(true)}
            />

            <div className="border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-6 rounded-xl">
              <h2 className="text-2xl font-black tracking-widest mb-4">WORKOUT PLAN</h2>

              {userWorkout ? (
                <div className="space-y-4">
                  <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-light mb-2">{userWorkout.name}</h3>
                    <div className="text-xs text-neutral-400 space-y-1">
                      <p>
                        <span className="text-white">Status:</span> {userWorkout.status}
                      </p>
                      <p>
                        <span className="text-white">Current Week:</span> {userWorkout.currentWeek} / {userWorkout.duration}
                      </p>
                      <p>
                        <span className="text-white">Difficulty:</span> {userWorkout.difficultyLevel}
                      </p>
                      <p>
                        <span className="text-white">Goal:</span> {userWorkout.goal}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/admin/workout/${userWorkout._id}`)}
                      className="flex-1 py-2 px-4 border border-white/10 text-white text-xs font-light hover:border-red-500 hover:text-red-500 transition-all"
                    >
                      EDIT PLAN
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Replace current workout plan?')) {
                          setAssignWorkoutOpen(true);
                        }
                      }}
                      className="flex-1 py-2 px-4 border border-white/10 text-white text-xs font-light hover:border-red-500 hover:text-red-500 transition-all"
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
                    className="w-full py-3 px-4 bg-red-500 text-white text-xs font-light tracking-wider hover:bg-red-600 transition-all"
                  >
                    PROVIDE WORKOUT PLAN
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
        />
      )}

      {assignWorkoutOpen && (
        <AssignWorkoutModal
          userId={user._id}
          onClose={() => setAssignWorkoutOpen(false)}
          onSuccess={loadUser}
        />
      )}
    </>
  );
}