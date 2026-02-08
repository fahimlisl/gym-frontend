import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAllPublicTrainers } from "../api/general.api.js";

export default function PublicTrainers() {
  const [trainers, setTrainers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPublicTrainers().then((res) => {
      setTrainers(res.data.data || []);
    });
  }, []);

  return (
    <section className="bg-gradient-to-br from-black via-zinc-900 to-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Meet Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Elite Trainers
            </span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Certified professionals dedicated to transforming your strength,
            confidence, and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {trainers.map((trainer) => (
            <div
              key={trainer._id}
              onClick={() => navigate(`/trainers/${trainer._id}`)}
              className="group relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center cursor-pointer 
                         hover:scale-[1.03] hover:shadow-2xl hover:border-yellow-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition" />

              <div className="relative flex justify-center">
                <img
                  src={trainer.avatar?.url}
                  alt={trainer.fullName}
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>

              <h2 className="text-2xl font-bold mt-6 relative z-10">
                {trainer.fullName}
              </h2>

              <p className="text-gray-300 mt-2 relative z-10">
                {trainer.experience || "Certified Fitness Trainer"}
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition relative z-10">
                <span className="text-sm font-medium">View Profile</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
