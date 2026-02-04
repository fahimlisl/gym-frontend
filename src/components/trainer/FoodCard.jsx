export default function FoodCard({ food }) {
  const n = food.nutrition;

  return (
    <div className="border border-red-600/30 bg-black rounded-xl p-5">
      <h3 className="text-lg font-black uppercase tracking-wide mb-2">
        {food.foodName}
      </h3>

      <p className="text-xs text-gray-400 mb-4">
        Per {food.baseQuantity}{food.baseUnit}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Calories" value={`${n.calories} kcal`} />
        <Stat label="Protein" value={`${n.protein_g} g`} />
        <Stat label="Carbs" value={`${n.carbs_g} g`} />
        <Stat label="Fat" value={`${n.fat_g} g`} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-neutral-900 rounded p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
