import { useEffect, useState } from "react";
import { X, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAllTrainers } from "../../api/admin.api.js";
import api from "../../api/axios.api.js";

export default function ChangeTrainerModal({ tempBillExist, userId, currentTrainerId, onClose, onSuccess }) {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (!tempBillExist) loadTrainers();
    else setInitialLoading(false);
    return () => (document.body.style.overflow = "auto");
  }, []);

  const loadTrainers = async () => {
    try {
      setInitialLoading(true);
      const res = await fetchAllTrainers();
      const others = (res.data.data || []).filter(
        (t) => t._id !== currentTrainerId
      );
      setTrainers(others);
    } catch {
      toast.error("Failed to load trainers");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTrainerId) {
      toast.error("Please select a trainer");
      return;
    }
    try {
      setLoading(true);
      await api.patch(
        `/admin/personal-training/change/trainer/${userId}/${selectedTrainerId}`
      );
      toast.success("Trainer changed successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change trainer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-gradient-to-br from-black via-neutral-900 to-black
                        border border-white/10 rounded-2xl overflow-hidden
                        shadow-2xl shadow-black/60">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black tracking-widest text-white">
                CHANGE TRAINER
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 tracking-wide">
                Select a new trainer for this member
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {tempBillExist ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full border-2 border-yellow-500/50 bg-yellow-500/10
                                flex items-center justify-center">
                  <span className="text-yellow-400 text-2xl">⚠</span>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black tracking-widest text-sm">
                    TRAINER SELECTION PENDING
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                    This member purchased their PT plan independently and hasn't selected a trainer yet.
                    They must choose a trainer from their end before you can reassign one.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 border border-white/20 text-white/60
                             text-xs font-extrabold tracking-widest rounded-lg
                             hover:border-white/40 hover:text-white transition"
                >
                  GOT IT
                </button>
              </div>
            ) : initialLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : trainers.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-10 tracking-widest">
                NO OTHER TRAINERS AVAILABLE
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {trainers.map((trainer) => {
                  const isPremiumTrainer = trainer._id === "69eccd38d66c81dbf39edef1";
                  return (
                    <div
                      key={trainer._id}
                      onClick={() => setSelectedTrainerId(trainer._id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${selectedTrainerId === trainer._id
                          ? "border-red-600 bg-red-600/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }
                        ${isPremiumTrainer ? "relative overflow-hidden" : ""}
                      `}
                    >
                      {isPremiumTrainer && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-yellow-500/5 to-yellow-600/10" />
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-lg tracking-wider">
                              PREMIUM ⭐
                            </div>
                          </div>
                        </>
                      )}
                      <img
                        src={trainer.avatar?.url}
                        alt={trainer.fullName}
                        className={`w-12 h-12 rounded-full object-cover border-2 flex-shrink-0
                          ${isPremiumTrainer
                            ? "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            : "border-red-600/40"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm tracking-wide text-white truncate flex items-center gap-2">
                          {trainer.fullName?.toUpperCase()}
                          {isPremiumTrainer && (
                            <span className="text-[9px] bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-1.5 py-0.5 rounded font-black tracking-wider">
                              ⭐ PREMIUM
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {trainer.experience
                            ? `${trainer.experience} yrs experience`
                            : "Trainer"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {trainer.students?.length || 0} students
                        </p>
                      </div>
                      {selectedTrainerId === trainer._id && (
                        <span className="text-red-500 font-black text-lg flex-shrink-0">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!tempBillExist && (
            <div className="flex gap-3 px-6 py-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-white/20 text-white/60 px-6 py-3
                           text-xs font-extrabold tracking-widest rounded-lg
                           hover:border-white/40 hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !selectedTrainerId}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white px-6 py-3
                           text-xs font-extrabold tracking-widest rounded-lg
                           disabled:opacity-40 transition flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" /> CHANGING...</>
                  : "CONFIRM CHANGE"
                }
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}