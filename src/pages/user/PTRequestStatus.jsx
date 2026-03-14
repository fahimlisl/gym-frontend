import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

export default function PTRequestStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [trainers, setTrainers] = useState([]);
  const [openTrainerModal, setOpenTrainerModal] = useState(false);

  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get("/user/pt/request/status");
      const data = res.data.data;

      setStatus(data);

      if (data.isApproved) {
        loadTrainers();
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setStatus(null);
      } else {
        toast.error("Failed to fetch PT status");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => {
    try {
      const res = await api.get("/general/fetchAllTrainer");
      setTrainers(res.data.data);
    } catch {
      toast.error("Failed to load trainers");
    }
  };

  const assignTrainer = async (trainerId) => {
    try {
      setAssigning(true);

      await api.patch(`/user/pt/assign/trainer/${trainerId}`);

      toast.success("Trainer assigned successfully");

      setOpenTrainerModal(false);

      loadStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign trainer");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-neutral-950 p-10 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />

        <p className="text-sm text-gray-400 tracking-widest">
          LOADING TRAINING STATUS...
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-xl border border-white/10 bg-neutral-950 p-10 text-center">
        <h3 className="font-black tracking-widest text-gray-300 mb-2">
          NO PERSONAL TRAINING REQUEST
        </h3>

        <p className="text-sm text-gray-500">
          Purchase a PT plan to request a personal trainer.
        </p>
      </div>
    );
  }

  if (!status.isApproved) {
    return (
      <div
        className="relative rounded-2xl border border-yellow-500/30 
    bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent 
    p-8 sm:p-10 overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-40 h-40 
      bg-yellow-500/20 blur-3xl rounded-full"
        />

        <div className="relative">
          <h3 className="font-black tracking-widest text-yellow-400 text-lg mb-4">
            REQUEST UNDER REVIEW
          </h3>

          <p className="text-sm text-gray-400 mb-8 max-w-lg leading-relaxed">
            Your payment proof has been submitted successfully. Our admin team
            is currently verifying the payment. This process usually takes only
            a few minutes.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full 
            rounded-full bg-yellow-400 opacity-75"
              ></span>

              <span
                className="relative inline-flex rounded-full h-3 w-3 
            bg-yellow-400"
              ></span>
            </span>

            <span className="text-yellow-400 font-bold tracking-wide text-sm">
              WAITING FOR ADMIN APPROVAL
            </span>
          </div>

          <div className="text-xs text-gray-500 border-t border-white/10 pt-4">
            Submitted on{" "}
            <span className="text-gray-300">
              {new Date(status.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-8">
        <h3 className="font-black tracking-widest text-green-400 mb-3">
          REQUEST APPROVED
        </h3>

        <p className="text-sm text-gray-400 mb-6 max-w-xl">
          Your personal training request has been approved. Choose your trainer
          and start your transformation.
        </p>

        <button
          onClick={() => setOpenTrainerModal(true)}
          className="px-8 py-3 text-xs font-extrabold tracking-widest
          border border-green-500 rounded-lg
          hover:bg-green-500 hover:text-black
          transition-all duration-200"
        >
          SELECT YOUR TRAINER
        </button>
      </div>

      {openTrainerModal && (
        <TrainerModal
          trainers={trainers}
          onClose={() => setOpenTrainerModal(false)}
          onSelect={assignTrainer}
          assigning={assigning}
        />
      )}
    </>
  );
}

function TrainerModal({ trainers, onClose, onSelect, assigning }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-6xl bg-neutral-950 border border-red-600/30 rounded-2xl p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-black text-xl tracking-widest text-red-500">
            CHOOSE YOUR TRAINER
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trainers.map((t) => (
            <div
              key={t._id}
              className="group border border-white/10 rounded-xl bg-neutral-900
              hover:border-red-500 hover:shadow-lg hover:shadow-red-600/10
              transition p-6 flex flex-col items-center text-center"
            >
              <img
                src={t.avatar?.url}
                className="w-20 h-20 rounded-full object-cover border-2 border-red-600 mb-4
                group-hover:scale-105 transition"
              />

              <h4 className="font-bold text-lg mb-1">{t.fullName}</h4>

              <p className="text-xs text-gray-400 mb-4">{t.experience}</p>

              <button
                disabled={assigning}
                onClick={() => onSelect(t._id)}
                className="w-full py-2 text-xs font-extrabold tracking-widest
                border border-red-600 rounded-lg
                hover:bg-red-600 hover:text-white
                transition"
              >
                {assigning ? "ASSIGNING..." : "SELECT TRAINER"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
