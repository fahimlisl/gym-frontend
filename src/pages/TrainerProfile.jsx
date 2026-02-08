import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Phone, BadgeCheck, Dumbbell } from "lucide-react";
import { getPublicTrainerDetails } from "../api/general.api.js";

export default function TrainerProfile() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);

  useEffect(() => {
    getPublicTrainerDetails(id).then((res) => {
      setTrainer(res.data.data);
    });
  }, [id]);

  if (!trainer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* PROFILE CARD */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/10">
          
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={trainer.avatar?.url}
                alt={trainer.fullName}
                className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <span className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-black" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-4xl font-extrabold mt-6 text-center tracking-tight">
            {trainer.fullName}
          </h1>

          {/* Experience */}
          <div className="flex justify-center mt-3">
            <span className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-sm">
              <BadgeCheck size={16} className="text-green-400" />
              {trainer.experience || "Certified Fitness Trainer"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-center">
            <div className="bg-white/5 rounded-xl p-5">
              <Dumbbell className="mx-auto mb-2 text-yellow-400" />
              <p className="text-lg font-semibold">Strength</p>
              <p className="text-sm text-gray-300">Functional & Power</p>
            </div>

            <div className="bg-white/5 rounded-xl p-5">
              <Dumbbell className="mx-auto mb-2 text-pink-400" />
              <p className="text-lg font-semibold">Conditioning</p>
              <p className="text-sm text-gray-300">HIIT & Endurance</p>
            </div>

            <div className="bg-white/5 rounded-xl p-5">
              <Dumbbell className="mx-auto mb-2 text-blue-400" />
              <p className="text-lg font-semibold">Mobility</p>
              <p className="text-sm text-gray-300">Flexibility & Rehab</p>
            </div>
          </div>

          {/* About */}
          <p className="mt-10 text-center text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Train with a certified professional who focuses on safe techniques,
            progressive overload, and sustainable fitness habits. Whether
            you're a beginner or advanced, your goals are the priority.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${trainer.phoneNumber}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 transition font-medium text-black"
            >
              <Phone size={18} />
              Call Trainer
            </a>

            <a
              href={`https://wa.me/91${trainer.phoneNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition font-medium"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
