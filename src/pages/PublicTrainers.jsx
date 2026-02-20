import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAllPublicTrainers } from "../api/general.api.js";

function TrainerSkeleton() {
  return (
    <div className="rounded-3xl p-[1px] bg-gradient-to-br from-red-600/20 to-transparent animate-pulse">
      <div className="bg-black/70 rounded-3xl p-10 text-center">
        <div className="w-36 h-36 mx-auto rounded-full bg-zinc-800" />
        <div className="h-6 w-40 bg-zinc-800 rounded mt-8 mx-auto" />
        <div className="h-4 w-32 bg-zinc-800 rounded mt-3 mx-auto" />
        <div className="h-8 w-28 bg-zinc-800 rounded mt-8 mx-auto" />
      </div>
    </div>
  );
}

export default function PublicTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPublicTrainers()
      .then((res) => {
        setTrainers(res.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-black via-zinc-900 to-black text-white py-28 overflow-hidden">
      
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-red-600/10 blur-[180px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Meet Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              Elite Trainers
            </span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
            Certified professionals shaping strength, discipline, and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {loading ? (
            [...Array(6)].map((_, i) => <TrainerSkeleton key={i} />)
          ) : trainers.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400 text-lg">
                Elite trainers will be revealed soon.
              </p>
            </div>
          ) : (
            trainers.map((trainer) => (
              <div
                key={trainer._id}
                onClick={() => navigate(`/trainers/${trainer._id}`)}
                className="
                  group relative cursor-pointer
                  rounded-3xl p-[1px]
                  bg-gradient-to-br from-red-600/40 via-red-600/10 to-transparent
                  hover:scale-[1.05] hover:shadow-[0_0_60px_rgba(239,68,68,0.25)]
                  transition-all duration-500
                "
              >
                <div className="relative bg-black/70 backdrop-blur-xl rounded-3xl p-10 text-center">

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-600/15 to-transparent opacity-0 group-hover:opacity-100 transition" />

                  <div className="relative flex justify-center">
                    <div className="absolute inset-0 w-40 h-40 bg-red-600/25 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition" />
                    <img
                      src={trainer.avatar?.url || "/default-trainer.png"}
                      alt={trainer.fullName}
                      className="
                        w-36 h-36 rounded-full object-cover relative z-10
                        border-4 border-red-600
                        shadow-[0_0_35px_rgba(239,68,68,0.6)]
                      "
                    />
                  </div>
                  <h2 className="text-2xl font-bold mt-8 relative z-10">
                    {trainer.fullName}
                  </h2>

                  <p className="text-gray-400 mt-2 text-sm uppercase tracking-wide relative z-10">
                    {trainer.experience || "Certified Fitness Trainer"}
                  </p>

                  <div className="mt-8 flex items-center justify-center gap-2 text-red-500 relative z-10 font-semibold">
                    <span className="text-sm tracking-wide">
                      View Profile
                    </span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-28 flex justify-center">
          <div className="relative text-center px-12 py-8">
            <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full"></div>

            <div className="relative border border-red-600/30 bg-black/60 backdrop-blur-xl rounded-2xl px-10 py-8">
              <p className="text-red-500 text-sm tracking-[0.35em] font-semibold mb-2">
                EXPANDING ROSTER
              </p>
              <p className="text-gray-300 text-lg font-medium">
                More elite trainers joining soon.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Handpicked professionals. Premium coaching experience.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}