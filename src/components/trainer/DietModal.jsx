import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

export default function DietModal({ studentId, onClose }) {
  const [diet, setDiet] = useState(null);
  const [step, setStep] = useState("loading");
  const [loading, setLoading] = useState(false);
  const [dietStatus, setDietStatus] = useState("draft");

  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [weight, setWeight] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(5);

  const [allFoods, setAllFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const [newFoodName, setNewFoodName] = useState("");
  const [addingFood, setAddingFood] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const check = await api.get(`/trainer/diet/check/${studentId}`);
        if (check.data.data.exists) {
          const dietRes = await api.get(`/trainer/diet/show/${studentId}`);
          setDiet(dietRes.data.data);
          
          if (dietRes.data.data._id) {
            try {
              const statusRes = await api.get(`/trainer/diet/check/status/${dietRes.data.data._id}`);
              setDietStatus(statusRes.data.data);
            } catch {
              setDietStatus("draft");
            }
          }
          
          setStep("foods");
        } else {
          setStep("create");
        }
      } catch {
        setStep("create");
      }
    };
    init();
  }, [studentId]);

  useEffect(() => {
    if (step !== "foods") return;
    const fetchFoods = async () => {
      try {
        const res = await api.get("/trainer/getAllFoods");
        setAllFoods(res.data.data || []);
      } catch {
        toast.error("Failed to fetch foods");
      }
    };
    fetchFoods();
  }, [step]);

  const approveDiet = async () => {
    try {
      setLoading(true);
      const res = await api.patch(`/trainer/diet/approve/${diet._id}`);
      setDiet(res.data.data);
      setDietStatus("approved");
      toast.success("Diet approved");
    } catch {
      toast.error("Failed to approve diet");
    } finally {
      setLoading(false);
    }
  };

  const createDiet = async () => {
    if (!goal || !dietType || !weight) {
      return toast.error("All fields required");
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
      setDietStatus("draft");
      setStep("foods");
    } catch {
      toast.error("Failed to create diet");
    } finally {
      setLoading(false);
    }
  };

  const toggleFood = (foodId) => {
    setSelectedFoods((prev) => {
      const copy = { ...prev };

      if (copy.hasOwnProperty(foodId)) {
        delete copy[foodId]; 
      } else {
        copy[foodId] = 100;
      }

      return copy;
    });
  };

  const updateGrams = (foodId, grams) => {
    setSelectedFoods((p) => ({ ...p, [foodId]: Number(grams) }));
  };

  const calculateSelectedNutrition = () => {
    return Object.entries(selectedFoods).reduce((totals, [foodId, grams]) => {
      const food = allFoods.find(f => f._id === foodId);
      if (!food || !food.nutrition || grams <= 0) return totals;

      const multiplier = grams / 100;
      
      return {
        calories: totals.calories + (food.nutrition.calories * multiplier),
        protein: totals.protein + (food.nutrition.protein_g * multiplier),
        carbs: totals.carbs + (food.nutrition.carbs_g * multiplier),
        fat: totals.fat + (food.nutrition.fat_g * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const submitFoods = async () => {
    const foods = Object.entries(selectedFoods)
      .filter(([, g]) => g > 0)
      .map(([foodId, grams]) => ({ foodId, grams }));

    if (!foods.length) return toast.error("Select foods & grams");

    try {
      setLoading(true);
      const res = await api.post("/trainer/addFood", {
        userId: studentId,
        foods,
      });
      setDiet(res.data.data);
      setSelectedFoods({});
    } catch {
      toast.error("Failed to add foods");
    } finally {
      setLoading(false);
    }
  };

  const addNewFood = async () => {
    if (!newFoodName.trim()) return toast.error("Enter food name");
    try {
      setAddingFood(true);
      await api.post("/trainer/addFoodtoDB", { foodName: newFoodName });
      setNewFoodName("");
      const res = await api.get("/trainer/getAllFoods");
      setAllFoods(res.data.data || []);
      toast.success("Food added to database");
    } catch {
      toast.error("Failed to add food");
    } finally {
      setAddingFood(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[90vh] bg-black border border-red-600/40 rounded-2xl flex flex-col">
        <div className="shrink-0 px-6 py-4 border-b border-red-600/30 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-widest">DIET</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {step === "create" && (
            <div className="max-w-md mx-auto space-y-5">
              <h3 className="font-black tracking-widest">CREATE DIET</h3>

              <select
                className="w-full bg-black border p-2"
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="">Goal</option>
                <option value="fat loss">Fat Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                className="w-full bg-black border p-2"
                onChange={(e) => setDietType(e.target.value)}
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
                className="w-full bg-black border p-2"
                onChange={(e) => setWeight(e.target.value)}
              />

              <input
                type="number"
                placeholder="Meals per day"
                className="w-full bg-black border p-2"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(e.target.value)}
              />

              <button
                onClick={createDiet}
                disabled={loading}
                className="w-full border border-red-600 py-2 font-bold tracking-widest disabled:opacity-50"
              >
                {loading ? "CREATING..." : "CREATE DIET"}
              </button>
            </div>
          )}

          {step === "foods" && diet && (
            <div className="space-y-8">
              {(() => {
                const addedNutrition = {
                  calories: diet.foods?.reduce((s, f) => s + f.calories, 0) || 0,
                  protein: diet.foods?.reduce((sum, food) => sum + (food.protein || 0), 0) || 0,
                };
                const selectedNutrition = calculateSelectedNutrition();
                const totalCurrent = addedNutrition.calories + selectedNutrition.calories;
                const totalProtein = addedNutrition.protein + selectedNutrition.protein;
                const remaining = diet.calories - totalCurrent;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {[
                        {
                          label: "TARGET",
                          value: diet.calories,
                          unit: "kcal",
                        },
                        {
                          label: "CURRENT",
                          value: totalCurrent,
                          unit: "kcal",
                          highlight: selectedNutrition.calories > 0,
                        },
                        {
                          label: "REMAINING",
                          value: remaining,
                          unit: "kcal",
                          highlight: selectedNutrition.calories > 0,
                        },
                        {
                          label: "PROTEIN",
                          value: totalProtein,
                          unit: "g",
                          highlight: selectedNutrition.protein > 0,
                        },
                      ].map(({ label, value, unit, highlight }) => (
                        <div
                          key={label}
                          className={`border rounded-xl p-4 text-center transition ${
                            highlight 
                              ? 'border-red-600/60 bg-red-600/5' 
                              : 'border-neutral-800'
                          }`}
                        >
                          <p className="text-xs text-gray-400 tracking-widest">
                            {label}
                          </p>

                          <p className="text-2xl font-black mt-1">
                            {unit === "g" ? value.toFixed(1) : Math.round(value)}
                          </p>

                          <p className="text-[11px] text-gray-500 uppercase">
                            {unit}
                          </p>
                        </div>
                      ))}
                    </div>

                    {Object.keys(selectedFoods).length > 0 && (
                      <div className="bg-red-600/5 border border-red-600/30 rounded-xl p-4">
                        <p className="text-xs tracking-widest text-red-400 mb-2">
                          SELECTED FOODS (NOT YET ADDED)
                        </p>
                        <div className="flex gap-4 text-sm flex-wrap">
                          <span className="text-gray-300">
                            <span className="font-bold text-white">{Math.round(selectedNutrition.calories)}</span> kcal
                          </span>
                          <span className="text-gray-300">
                            <span className="font-bold text-white">{selectedNutrition.protein.toFixed(1)}</span>g protein
                          </span>
                          <span className="text-gray-300">
                            <span className="font-bold text-white">{selectedNutrition.carbs.toFixed(1)}</span>g carbs
                          </span>
                          <span className="text-gray-300">
                            <span className="font-bold text-white">{selectedNutrition.fat.toFixed(1)}</span>g fat
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-2">
                <p className="text-xs tracking-widest text-gray-400">
                  ADD FOOD TO DATABASE
                </p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-black border border-neutral-700 px-3 py-2 rounded"
                    value={newFoodName}
                    onChange={(e) => setNewFoodName(e.target.value)}
                    placeholder="e.g. chicken breast"
                  />
                  <button
                    onClick={addNewFood}
                    disabled={addingFood}
                    className="border border-red-600 px-5 rounded font-bold tracking-widest disabled:opacity-50"
                  >
                    {addingFood ? "ADDING..." : "ADD"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs tracking-widest text-gray-400">
                  SELECT FOODS
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allFoods.map((food) => {
                    const selected = food._id in selectedFoods;

                    return (
                      <div key={food._id}>
                        <div
                          onClick={() => toggleFood(food._id)}
                          className={`rounded-xl border p-4 cursor-pointer transition ${
                            selected
                              ? "border-green-600 bg-red-400/10"
                              : "border-neutral-800 hover:border-neutral-600"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="pointer-events-none accent-red-600"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold capitalize text-sm">
                                {food.foodName}
                              </p>

                              <p className="text-[11px] text-gray-400">
                                {food.nutrition?.calories} kcal / 100g
                              </p>

                              <p className="text-[11px] text-gray-500 mt-1">
                                P {food.nutrition?.protein_g}g · C{" "}
                                {food.nutrition?.carbs_g}g · F{" "}
                                {food.nutrition?.fat_g}g
                              </p>
                            </div>

                            <input
                              type="number"
                              min={1}
                              disabled={!selected}
                              value={selectedFoods[food._id] || ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateGrams(food._id, e.target.value)
                              }
                              placeholder="g"
                              className="w-20 bg-black border border-neutral-700 px-2 py-1 rounded text-sm disabled:opacity-40"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={submitFoods}
                disabled={loading || Object.keys(selectedFoods).length === 0}
                className="w-full border border-red-600 py-3 rounded font-extrabold tracking-widest disabled:opacity-50"
              >
                {loading ? "ADDING..." : "ADD SELECTED FOODS"}
              </button>

              {diet.foods?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs tracking-widest text-gray-400">
                    ADDED TO DIET
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {diet.foods.map((f, i) => (
                      <div
                        key={i}
                        className="border border-neutral-800 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold capitalize">
                              {f.foodName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {f.servingSize}
                            </p>
                          </div>
                          <p className="font-bold">{f.calories} kcal</p>
                        </div>

                        <p className="text-[11px] text-gray-600 mt-2">
                          Protein {f.protein}g · Carbs {f.carbs}g · Fats{" "}
                          {f.fats}g · Fiber {f.fiber}g
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dietStatus === "approved" ? (
                <button
                  disabled
                  className="w-full border border-green-600 bg-green-600/10 py-3 rounded font-extrabold tracking-widest cursor-not-allowed"
                >
                  APPROVED ✅
                </button>
              ) : (
                <button
                  onClick={approveDiet}
                  disabled={loading}
                  className="w-full border border-green-600 py-3 rounded font-extrabold tracking-widest hover:bg-green-600/10 transition disabled:opacity-50"
                >
                  {loading ? "APPROVING..." : "APPROVE DIET"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}