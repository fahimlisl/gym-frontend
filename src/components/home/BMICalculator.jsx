import { useState } from "react";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    if (!height || !weight) return;

    const h = height / 100;
    const value = (weight / (h * h)).toFixed(1);

    setBmi(value);

    if (value < 18.5) setCategory("UNDERWEIGHT");
    else if (value < 25) setCategory("NORMAL");
    else if (value < 30) setCategory("OVERWEIGHT");
    else setCategory("OBESE");
  };

  const categoryStyles = {
    UNDERWEIGHT: "text-yellow-400 border-yellow-400/40",
    NORMAL: "text-green-400 border-green-400/40",
    OVERWEIGHT: "text-orange-400 border-orange-400/40",
    OBESE: "text-red-500 border-red-500/40",
  };

  return (
    <div className="relative max-w-5xl mx-auto">

      <div className="absolute -inset-1 bg-red-600/20 blur-3xl rounded-3xl" />

      <div className="relative bg-black/80 backdrop-blur-xl
                      border border-red-600/30
                      rounded-3xl p-10 md:p-14">

        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] text-red-500 mb-3">
            BODY METRICS
          </p>

          <h2 className="text-4xl md:text-5xl font-black tracking-widest">
            BMI CALCULATOR
          </h2>

          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm">
            Instantly analyze your body composition.
            Designed for athletes — not casuals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <label className="text-xs tracking-widest text-gray-400">
              HEIGHT
            </label>

            <div className="relative mt-2">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-neutral-950
                           border border-neutral-700
                           px-5 py-4 rounded-2xl
                           text-lg font-bold
                           focus:border-red-600 outline-none"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2
                               text-gray-500 text-sm">
                cm
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400">
              WEIGHT
            </label>

            <div className="relative mt-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="72"
                className="w-full bg-neutral-950
                           border border-neutral-700
                           px-5 py-4 rounded-2xl
                           text-lg font-bold
                           focus:border-red-600 outline-none"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2
                               text-gray-500 text-sm">
                kg
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={calculateBMI}
          className="w-full py-5 rounded-2xl
                     border border-red-600
                     font-extrabold tracking-widest
                     hover:bg-red-600 transition-all
                     active:scale-[0.98]"
        >
          CALCULATE BMI
        </button>

        {bmi && (
          <div className="mt-14 animate-fade-in">

            <div className="flex flex-col items-center gap-6">

              <div
                className={`w-48 h-48 rounded-full
                            border-4 flex flex-col
                            items-center justify-center
                            ${categoryStyles[category]}`}
              >
                <p className="text-5xl font-black">
                  {bmi}
                </p>
                <p className="text-xs tracking-widest text-gray-400 mt-1">
                  BMI
                </p>
              </div>

              <p className={`text-xl font-black tracking-widest
                              ${categoryStyles[category]}`}>
                {category}
              </p>
              <p className="text-center text-xs text-gray-500 max-w-md">
                BMI is a general indicator and doesn’t factor muscle mass.
                For accurate body composition, consult a professional trainer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
