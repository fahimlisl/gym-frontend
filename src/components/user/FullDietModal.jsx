import { X } from "lucide-react";

export default function FullDietModal({ diet, onClose }) {
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

        <div className="px-5 pb-2">
          <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3">
            TARGET MACROS
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <MacroCard
              label="Protein"
              grams={diet.desiredMacros?.protein?.grams || 0}
              color="red"
            />
            <MacroCard
              label="Carbs"
              grams={diet.desiredMacros?.carbs?.grams || 0}
              color="yellow"
            />
            <MacroCard
              label="Fats"
              grams={diet.desiredMacros?.fats?.grams || 0}
              color="green"
            />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-black tracking-widest mb-4 text-gray-300">
            MEALS
          </h3>

          {(!diet.meals || diet.meals.length === 0) ? (
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

function Meta({ label, value }) {
  return (
    <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-bold text-white capitalize">{value}</p>
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