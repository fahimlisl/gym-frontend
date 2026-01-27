import toast from "react-hot-toast";

export default function DietSection() {
  const openDiet = () => {
    toast("Diet module coming soon 🔥", {
      icon: "🥗",
    });
  };

  return (
    <div className="border border-red-600/30
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    p-6 rounded-xl">

      <h3 className="font-black tracking-widest mb-4">
        FAT LOSS DIET (PREVIEW)
      </h3>

      <ul className="text-sm text-gray-300 space-y-2 mb-6">
        <li>🥣 Morning: Warm water + oats</li>
        <li>🍳 Breakfast: Eggs / Paneer</li>
        <li>🍗 Lunch: High protein meal</li>
        <li>🥗 Evening: Salad</li>
        <li>🍽 Dinner: Light protein</li>
      </ul>

      <button
        onClick={openDiet}
        className="w-full border border-red-600 py-3
                   font-extrabold tracking-widest
                   hover:bg-red-600 transition"
      >
        VIEW FULL DIET
      </button>
    </div>
  );
}
