export default function Hero() {
  return (
    <section className="bg-[#050505] text-white min-h-[95vh] flex items-center relative overflow-hidden">
      
      {/* Background brutal text */}
      <h1 className="absolute -top-10 left-1/2 -translate-x-1/2 text-[20rem] font-black text-white/5 select-none pointer-events-none">
        TRAIN
      </h1>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-14 items-center">
        
        {/* Text */}
        <div className="space-y-8">
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.05] uppercase">
            Build
            <span className="block text-red-600">Real Power</span>
            Not Excuses
          </h1>

          <p className="text-gray-400 max-w-xl text-base">
            No fluff. No shortcuts. Just disciplined training, real programs,
            and brutal consistency.
          </p>

          <div className="flex gap-4 flex-wrap">
            <button className="bg-red-600 hover:bg-red-700 px-8 py-4 font-extrabold uppercase tracking-wide">
              Start Training
            </button>
            <button className="border-2 border-white/30 hover:border-red-600 px-8 py-4 uppercase font-bold">
              View Programs
            </button>
          </div>
        </div>

        {/* Brutal visual block */}
        <div className="hidden lg:block">
          <div className="relative w-full h-[480px] border-2 border-white/10">
            <div className="absolute inset-4 border border-red-600/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
