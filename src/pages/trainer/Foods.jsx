import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FoodCard from "../../components/trainer/FoodCard.jsx";
import { fetchAllFoods, addFoodViaN8N } from "../../api/foods.api.js";
import TrainerDashboardLayout from "../../components/layout/TrainerDashboardLayout.jsx";

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFoods = async () => {
    try {
      const res = await fetchAllFoods();
      setFoods(res.data.data);
    } catch {
      toast.error("Failed to load foods");
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const addFood = async () => {
    if (!foodName.trim()) return toast.error("Enter food name");

    try {
      setLoading(true);
      await addFoodViaN8N(foodName.toLowerCase());
      toast.success("Food added & analyzed");
      setFoodName("");
      await loadFoods(); // 🔥 instant refresh
    } catch(err) {
      toast.error("Failed to add food");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainerDashboardLayout>
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-widest uppercase">
          Foods
        </h1>
      </div>

      {/* Add Food */}
      <div className="flex gap-3">
        <input
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="e.g. chicken breast"
          className="flex-1 bg-black border border-red-600/30
                     px-4 py-3 rounded outline-none"
        />

        <button
          onClick={addFood}
          disabled={loading}
          className="bg-red-600 px-6 font-black tracking-widest
                     disabled:opacity-50"
        >
          {loading ? "ADDING..." : "ADD FOOD"}
        </button>
      </div>

      {/* Food List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {foods.map((food) => (
          <FoodCard key={food._id} food={food} />
        ))}
      </div>
    </div>
    </TrainerDashboardLayout>
  );
}
