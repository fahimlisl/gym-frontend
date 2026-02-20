import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import api from "../../api/axios.api.js";

export default function DietSection() {
  const [diet, setDiet] = useState(null);
  const [state, setState] = useState("loading"); // loading | approved | pending | error
  const [open, setOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const res = await api.get("/user/diet/my");
      setDiet(res.data.data);
      setState("approved");
    } catch (err) {
      if (err.response?.status === 404) {
        setState("pending");
      } else {
        setState("error");
      }
    }
  };

  if (state === "loading") return <Skeleton />;

  if (state === "error") {
    return (
      <Card>
        <h3 className="title">DIET PLAN</h3>
        <p className="text-sm text-red-400">
          Failed to load diet. Please try again later.
        </p>
      </Card>
    );
  }

  if (state === "pending") {
    return (
      <Card>
        <h3 className="title">DIET PLAN</h3>

        <div className="flex items-center gap-3 text-yellow-400">
          ⏳ <span>Diet not approved yet</span>
        </div>

        <p className="text-sm text-gray-400 mt-3">
          Your trainer is preparing your diet.
          Once approved, it will appear here automatically.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card highlight>
        <h3 className="title text-green-400">YOUR DIET PLAN</h3>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <Stat label="Goal" value={diet.goal} />
          <Stat label="Calories" value={`${diet.calories} kcal`} />
          <Stat label="Diet Type" value={diet.dietType} />
          <Stat label="Meals / Day" value={diet.mealsPerDay} />
        </div>

        {diet.desiredMacros && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">TARGET MACROS</p>
            <div className="flex gap-2">
              <MacroBadge
                label="P"
                value={diet.desiredMacros.protein?.grams || 0}
                color="red"
              />
              <MacroBadge
                label="C"
                value={diet.desiredMacros.carbs?.grams || 0}
                color="yellow"
              />
              <MacroBadge
                label="F"
                value={diet.desiredMacros.fats?.grams || 0}
                color="green"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(true)}
          className="mt-6 w-full bg-green-600 hover:bg-green-700
                     py-3 rounded-lg font-black tracking-widest transition"
        >
          VIEW FULL DIET
        </button>
      </Card>

      {open && (
        <FullDietModal
          diet={diet}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function FullDietModal({ diet, onClose }) {
  const statusColor =
    diet.status === "approved"
      ? "text-green-400"
      : diet.status === "draft"
      ? "text-yellow-400"
      : "text-gray-400";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center">
      <div className="w-full md:max-w-4xl max-h-[90vh] bg-gradient-to-br from-black via-neutral-900 to-black border border-red-600/30 rounded-t-2xl md:rounded-2xl overflow-y-auto">
        <div className="sticky top-0 bg-black/80 backdrop-blur flex justify-between items-center p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <h2 className="font-black tracking-widest text-red-500">
              YOUR DIET PLAN
            </h2>
            <span className={`text-xs uppercase font-bold ${statusColor}`}>
              {diet.status}
            </span>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 text-sm">
          <Meta label="Goal" value={diet.goal} />
          <Meta label="Calories" value={`${diet.calories} kcal`} />
          <Meta label="Diet Type" value={diet.dietType} />
          <Meta label="Meals / Day" value={diet.mealsPerDay} />
        </div>

        {diet.desiredMacros && (
          <div className="px-5 pb-2">
            <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3">
              TARGET MACROS
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <MacroCard
                label="Protein"
                grams={diet.desiredMacros.protein?.grams || 0}
                color="red"
              />
              <MacroCard
                label="Carbs"
                grams={diet.desiredMacros.carbs?.grams || 0}
                color="yellow"
              />
              <MacroCard
                label="Fats"
                grams={diet.desiredMacros.fats?.grams || 0}
                color="green"
              />
            </div>
          </div>
        )}

        <div className="p-5">
          <h3 className="font-black tracking-widest mb-4 text-gray-300">
            MEALS
          </h3>

          {!diet.meals || diet.meals.length === 0 ? (
            <p className="text-gray-400 text-sm">No meals added yet.</p>
          ) : (
            <div className="space-y-6">
              {diet.meals.map((meal, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">
                    {meal.meal}
                  </h4>
                  {meal.foods.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No foods in this meal.</p>
                  ) : (
                    <div className="space-y-2">
                      {meal.foods.map((food, foodIdx) => (
                        <FoodRow key={foodIdx} food={food} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 text-[10px] text-gray-600 text-right">
          * Values are per serving as specified
        </div>
      </div>
    </div>
  );
}

function Card({ children, highlight }) {
  return (
    <div
      className={`p-6 rounded-xl border
      ${
        highlight
          ? "border-green-500/40 bg-gradient-to-br from-black via-green-950 to-black"
          : "border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black"
      }`}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-neutral-900 p-3 rounded">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-bold capitalize">{value}</p>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="bg-neutral-900 p-3 rounded">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-bold capitalize">{value}</p>
    </div>
  );
}

function FoodRow({ food }) {
  return (
    <div className="border border-neutral-800 rounded-lg p-3 flex justify-between items-center bg-black/20 hover:bg-neutral-900/50 transition-colors">
      <div className="flex-1">
        <p className="font-bold text-sm uppercase tracking-wide text-white">
          {food.foodName}
        </p>
        {food.servingSize && (
          <p className="text-xs text-gray-400">{food.servingSize}</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-300">
        <span className="flex items-center gap-1" title="Calories">
          <span>🔥</span> {food.calories}
        </span>
        <span className="flex items-center gap-1" title="Protein">
          <span>💪</span> {food.protein}g
        </span>
        <span className="flex items-center gap-1" title="Carbs">
          <span>🍞</span> {food.carbs}g
        </span>
        <span className="flex items-center gap-1" title="Fats">
          <span>🧈</span> {food.fats}g
        </span>
      </div>
    </div>
  );
}

function MacroBadge({ label, value, color }) {
  const colorClasses = {
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    green: "bg-green-500/10 text-green-400 border-green-500/30",
  };
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full border ${colorClasses[color]} text-xs`}
    >
      <span className="font-bold">{label}</span>
      <span>{value}g</span>
    </div>
  );
}

function MacroCard({ label, grams, color }) {
  const colorClasses = {
    red: "bg-red-500/10 border-red-500/30 text-red-400",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
  };
  return (
    <div className={`p-2 rounded-lg border ${colorClasses[color]} text-center`}>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-base font-bold">{grams}g</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-6 rounded-xl border border-neutral-700 animate-pulse">
      <div className="h-4 bg-neutral-800 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-neutral-800 rounded mb-2"></div>
      <div className="h-3 bg-neutral-800 rounded mb-2"></div>
      <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
    </div>
  );
}