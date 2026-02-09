import ProgramCard from "../components/program/ProgramCard";
import { NavLink } from "react-router-dom";
export default function Programs() {
  const programs = [
    {
      title: "Strength Training",
      level: "BEGINNER – ADVANCED",
      description:
        "Build raw strength using compound lifts, progressive overload, and proven routines.",
    },
    {
      title: "Fat Loss Program",
      level: "ALL LEVELS",
      description:
        "High-intensity workouts designed to burn fat while preserving muscle mass.",
    },
    {
      title: "Bodybuilding",
      level: "INTERMEDIATE",
      description:
        "Hypertrophy-focused training for maximum muscle growth and aesthetics.",
    },
    {
      title: "Personal Training",
      level: "CUSTOM",
      description:
        "One-on-one coaching with personalized workouts, diet plans, and accountability.",
    },
  ];

  return (
    <div className="bg-neutral-950 text-white">
      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-black">
          TRAINING
          <span className="text-red-600"> PROGRAMS</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Programs built for people who want real results,
          not excuses.
        </p>
      </section>

      <section className="container pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((p) => (
            <ProgramCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      <section className="bg-black border-t border-white/10 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-black mb-4">
            NOT SURE WHICH PROGRAM FITS YOU?
          </h2>
          <NavLink to="/trainers">
          <button className="bg-red-600 px-10 py-4 font-extrabold tracking-widest">
            TALK TO A TRAINER
          </button>
          </NavLink>
        </div>
      </section>
    </div>
  );
}
