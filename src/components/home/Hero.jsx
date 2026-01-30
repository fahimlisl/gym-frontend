import { useNavigate } from "react-router-dom";
export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen bg-[#040404] text-white overflow-hidden flex items-center">

      <h1 className="absolute -top-32 left-1/2 -translate-x-1/2
                     text-[22rem] font-black tracking-widest
                     text-white/5 select-none pointer-events-none">
        TRAIN
      </h1>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff0d_1px,transparent_0)] bg-[size:24px_24px]" />


      <div className="absolute -top-40 -right-40 w-[600px] h-[600px]
                      bg-red-600/20 blur-[140px]" />


      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px]
                      bg-emerald-500/10 blur-[140px]" />

      <div className="container relative z-10 grid lg:grid-cols-2 gap-20 items-center pt-32 pb-24">


        <div className="space-y-10">
          <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black leading-[0.95] uppercase">
            Build
            <span className="block text-red-600">Real Power</span>
            <span className="block text-white/80">Not Excuses</span>
          </h1>

          <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
            No motivation quotes. No shortcuts.
            <span className="text-white"> Discipline, structured programs,</span>
            and performance-driven training.
          </p>

          <div className="flex gap-6 flex-wrap">
            <button className="bg-red-600 hover:bg-red-700
                               px-10 py-5 font-extrabold uppercase
                               tracking-widest shadow-lg shadow-red-600/30"
                               onClick={() => navigate("/pricing")}
                               >
              Start Training
            </button>

            <button className="border border-white/30
                               hover:border-emerald-500 hover:text-emerald-400
                               px-10 py-5 uppercase font-bold tracking-widest"
                               onClick={() => navigate("/programs")}>
              View Programs
            </button>
          </div>

          <div className="flex gap-10 pt-6">
            <Stat value="10+" label="Years Experience" />
            <Stat value="2K+" label="Members Trained" />
            <Stat value="100%" label="Real Results" accent />
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="relative h-[560px] border border-white/10">
            <div className="absolute inset-6 border border-red-600/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-emerald-500/10" />
            <div className="absolute bottom-6 left-6 text-xs tracking-widest text-white/40">
              PERFORMANCE ZONE
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


function Stat({ value, label, accent }) {
  return (
    <div>
      <p className={`text-2xl font-black ${accent ? "text-emerald-400" : ""}`}>
        {value}
      </p>
      <p className="text-xs tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}


export function PerformanceCafe() {
  return (
    <section className="relative bg-[#030303] text-white py-40 overflow-hidden">

      <h2 className="absolute top-10 left-1/2 -translate-x-1/2
                     text-[16rem] font-black tracking-widest
                     text-white/5 select-none pointer-events-none">
        FUEL
      </h2>

      <div className="absolute -top-40 left-0 w-[500px] h-[500px]
                      bg-red-600/20 blur-[160px]" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px]
                      bg-emerald-500/15 blur-[160px]" />

      <div className="container relative z-10">

        <div className="max-w-4xl mb-28">
          <p className="text-xs tracking-[0.4em] text-red-500 mb-6">
            PERFORMANCE NUTRITION
          </p>
          <span className="text-emerald-400 font-bold">
      AVAILABLE INSIDE THE GYM
    </span>

          <h2 className="text-6xl sm:text-7xl xl:text-8xl font-black uppercase leading-[0.95]">
            Fuel
            <span className="block text-emerald-400">The Machine</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mt-8 leading-relaxed">
            This is not a café.  
            This is a **fuel station** designed for strength, recovery,
            endurance, and longevity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          <FuelBlock
            title="PROTEIN & RECOVERY"
            tag="POST TRAINING"
            accent="green"
            points={[
              "Whey & isolate blends",
              "Muscle recovery formulas",
              "Zero sugar garbage",
              "Fast absorption"
            ]}
          />

          <FuelBlock
            title="ENERGY & FOCUS"
            tag="PRE WORKOUT"
            accent="red"
            points={[
              "Clean caffeine sources",
              "No crash formulas",
              "Strength & focus stacks",
              "Hard session ready"
            ]}
          />

          <FuelBlock
            title="MEALS & SUPPLEMENTS"
            tag="ALL DAY"
            accent="neutral"
            points={[
              "Macro balanced meals",
              "Creatine, BCAA, Omega",
              "Fat loss support",
              "Performance longevity"
            ]}
          />

        </div>
      </div>
    </section>
  );
}


function FuelBlock({ title, tag, points, accent }) {
  const accentStyles = {
    red: "border-red-600/40 text-red-500",
    green: "border-emerald-500/40 text-emerald-400",
    neutral: "border-white/20 text-white/70",
  };

  return (
    <div
      className={`relative border bg-black/60 backdrop-blur
                  p-10 min-h-[380px]
                  ${accentStyles[accent]}`}
    >

      {/* Corner line */}
      <div className={`absolute top-0 left-0 w-16 h-1
        ${accent === "red"
          ? "bg-red-600"
          : accent === "green"
          ? "bg-emerald-400"
          : "bg-white/30"
        }`} />

      <p className="text-xs tracking-[0.3em] mb-4">
        {tag}
      </p>

      <h3 className="text-3xl font-black mb-8 uppercase">
        {title}
      </h3>

      <ul className="space-y-4 text-gray-400">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded-full
                             bg-current opacity-80" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
