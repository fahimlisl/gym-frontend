import { useEffect, useState } from "react";
import api from "../../api/axios.api.js";
import toast from "react-hot-toast";

export default function TrainerDietManager({ studentId }) {
  const [diet, setDiet] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [weight, setWeight] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(5);

  useEffect(() => {
    const checkDiet = async () => {
      try {
        const res = await api.get(`/trainer/diet/check/${studentId}`);

        if (res.data.data.exists) {
          const dietRes = await api.get(`/trainer/diet/show/${studentId}`);
          setDiet(dietRes.data.data);
        }
      } catch (err) {
        toast.error("Failed to check diet");
      } finally {
        setChecking(false);
      }
    };

    checkDiet();
  }, [studentId]);

  const createDiet = async () => {
    if (!goal || !dietType || !weight) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const res = await api.post("/trainer/diet/generate", {
        userId: studentId,
        goal,
        dietType,
        weight: Number(weight),
        mealsPerDay,
      });

      setDiet(res.data.data);
      toast.success("Diet created");
    } catch {
      toast.error("Failed to create diet");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <p className="text-center text-gray-400">Checking diet…</p>;
  }

  if (!diet) {
    return (
      <div className="space-y-4">
        <h3 className="font-black tracking-widest">CREATE DIET</h3>

        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full bg-black border px-3 py-2"
        >
          <option value="">Goal</option>
          <option value="fat loss">Fat Loss</option>
          <option value="muscle gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select
          value={dietType}
          onChange={(e) => setDietType(e.target.value)}
          className="w-full bg-black border px-3 py-2"
        >
          <option value="">Diet Type</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="vegan">Vegan</option>
          <option value="general">General</option>
        </select>

        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full bg-black border px-3 py-2"
        />

        <input
          type="number"
          placeholder="Meals per day"
          value={mealsPerDay}
          onChange={(e) => setMealsPerDay(e.target.value)}
          className="w-full bg-black border px-3 py-2"
        />

        <button
          onClick={createDiet}
          disabled={loading}
          className="w-full border border-red-600 py-2
                     font-black tracking-widest
                     hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE DIET"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs text-gray-400 tracking-widest">DESIRED CALORIES</p>

      <p className="text-3xl font-black">{diet.calories} kcal</p>

      <p className="text-xs text-gray-500">
        Diet Status:{" "}
        <span className="text-white font-bold">
          {diet.status.toUpperCase()}
        </span>
      </p>

      <p className="text-xs text-gray-500">Food insertion comes next</p>
    </div>
  );
}
