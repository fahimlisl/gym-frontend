import { X } from "lucide-react";

export default function FullDietModal({ diet, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm
                    flex items-end md:items-center justify-center">

      <div className="w-full md:max-w-3xl max-h-[90vh]
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30
                      rounded-t-2xl md:rounded-2xl
                      overflow-y-auto">

        <div className="sticky top-0 bg-black/80 backdrop-blur
                        flex justify-between items-center
                        p-5 border-b border-neutral-800">
          <h2 className="font-black tracking-widest text-red-500">
            YOUR DIET PLAN
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <Meta label="Goal" value={diet.goal} />
          <Meta label="Calories" value={`${diet.calories} kcal`} />
          <Meta label="Diet Type" value={diet.dietType} />
          <Meta label="Meals / Day" value={diet.mealsPerDay} />
        </div>

        <div className="p-5">
          <h3 className="font-black tracking-widest mb-4 text-gray-300">
            FOODS INCLUDED
          </h3>

          {diet.foods.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No foods added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {diet.foods.map((food, i) => (
                <FoodRow key={i} food={food} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function Meta({ label, value }) {
  return (
    <div className="bg-neutral-900 p-3 rounded">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function FoodRow({ food }) {
  return (
    <div className="border border-neutral-800 rounded-lg p-4
                    flex justify-between items-center">
      <div>
        <p className="font-bold uppercase tracking-wide">
          {food.foodName}
        </p>
        <p className="text-xs text-gray-400">
          {food.servingSize}
        </p>
      </div>

      <div className="text-right text-xs text-gray-300 space-y-1">
        <p>🔥 {food.calories} kcal</p>
        <p>💪 {food.protein} g protein</p>
        <p>🍞 {food.carbs} g carbs</p>
        <p>🧈 {food.fats} g fats</p>
      </div>
    </div>
  );
}
