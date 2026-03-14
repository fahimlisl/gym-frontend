import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function GetTrainerUI() {

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get("/general/fetchAllTrainer");
      setTrainers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-white/10 p-10 text-gray-400 text-center rounded-xl">
        LOADING TRAINERS...
      </div>
    );
  }

  return (
    <div className="border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-6 rounded-xl">

      <h3 className="font-black tracking-widest text-red-500 mb-5">
        PERSONAL TRAINING
      </h3>

      <div className="border border-white/10 bg-neutral-900/40 rounded-lg p-6 mb-8">

        <h4 className="font-extrabold text-lg mb-3">
          Get Your Personal Trainer
        </h4>

        <p className="text-sm text-gray-400 mb-6">
          Unlock faster progress with expert guidance.
          A personal trainer helps you stay consistent,
          improve technique and reach your fitness goals quicker.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">

          <Benefit icon="🏋️" text="Custom Workout Plan" />
          <Benefit icon="🥗" text="Diet Support" />
          <Benefit icon="📈" text="Progress Tracking" />
          <Benefit icon="⚡" text="Faster Results" />

        </div>

        <button
          onClick={() => navigate("/member/pt-plans")}
          className="w-full sm:w-auto px-8 py-3 font-extrabold tracking-widest
                     bg-gradient-to-r from-red-700 via-red-600 to-red-700
                     text-white rounded-lg
                     hover:from-red-600 hover:via-red-500 hover:to-red-600
                     transition-all duration-200
                     shadow-md shadow-red-900/30"
        >
          APPLY FOR PERSONAL TRAINER
        </button>

      </div>

      {trainers.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          No trainers available right now
        </p>
      ) : (
        <>
          <h4 className="font-bold tracking-widest mb-4 text-sm text-gray-400">
            AVAILABLE TRAINERS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {trainers.map((trainer) => (
              <TrainerCard key={trainer._id} trainer={trainer} />
            ))}

          </div>
        </>
      )}

    </div>
  );
}

function TrainerCard({ trainer }) {

  const viewTrainer = async () => {
    try {
      const res = await api.get(`/general/fetchParticularTrainer/${trainer._id}`);
      console.log(res.data.data);
    } catch {
      toast.error("Failed to load trainer profile");
    }
  };

  return (
    <div
      className="group border border-white/10 rounded-lg
                 bg-neutral-900/40 p-5
                 hover:border-red-500
                 hover:shadow-lg hover:shadow-red-900/20
                 transition-all duration-200"
    >

      <div className="flex items-center gap-3 mb-4">

        <img
          src={trainer.avatar?.url}
          className="w-12 h-12 rounded-full object-cover border border-red-600"
        />

        <div>
          <p className="font-bold text-sm">
            {trainer.fullName}
          </p>

          <p className="text-xs text-gray-400">
            {trainer.experience}
          </p>
        </div>

      </div>

      {trainer.specialization && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {trainer.specialization}
        </p>
      )}

      <button
        onClick={viewTrainer}
        className="w-full border border-red-600
                   py-2 text-xs font-extrabold tracking-widest
                   rounded-md text-red-400
                   hover:bg-red-600 hover:text-white
                   transition-all duration-200"
      >
        VIEW PROFILE
      </button>

    </div>
  );
}

function Benefit({ icon, text }) {

  return (
    <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">

      <span className="text-sm">{icon}</span>

      <span>{text}</span>

    </div>
  );

}