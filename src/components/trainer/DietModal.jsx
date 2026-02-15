import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

// ===== REUSABLE COMPONENTS =====
const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <div className={`${sizes[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
  );
};

const MacroCard = ({ macro, activeMacro, onAdjust, isApproved }) => (
  <div
    className={`relative rounded-2xl border ${activeMacro === macro.type ? macro.border : "border-white/5"} 
      ${macro.bg} backdrop-blur-sm p-3 sm:p-4 transition-all duration-200 active:scale-[0.98]
      ${activeMacro === macro.type ? `shadow-lg ${macro.activeGlow}` : ""} flex flex-col items-center`}
  >
    <div className="flex items-center justify-between w-full mb-1">
      <span className="text-lg sm:text-xl">{macro.icon}</span>
      <span className={`text-[8px] sm:text-[9px] tracking-wider ${macro.color} font-bold`}>
        {macro.label}
      </span>
    </div>
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => !isApproved && onAdjust(macro.type, "up")}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center transition-all hover:border-red-500/50 hover:bg-red-500/10 active:scale-90 disabled:opacity-50"
        disabled={isApproved}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 5L12 19M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="relative my-0.5 sm:my-1">
        <span className={`text-3xl sm:text-4xl font-black ${macro.color} tabular-nums leading-none`}>
          {macro.value}
        </span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 ml-0.5 font-medium">g</span>
      </div>
      <button
        onClick={() => !isApproved && onAdjust(macro.type, "down")}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center transition-all hover:border-red-500/50 hover:bg-red-500/10 active:scale-90 disabled:opacity-50"
        disabled={isApproved}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 19L12 5M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
    <div className="text-[9px] sm:text-[10px] text-gray-500/80 mt-2">{macro.kcal} kcal</div>
  </div>
);

const StatusBanner = ({ icon, title, subtitle, color = "blue", children }) => (
  <div className={`bg-gradient-to-r from-${color}-500/10 to-${color === "blue" ? "cyan" : color}-500/10 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center shrink-0`}>
        <span className={`text-${color}-400 text-xl`}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] tracking-wider text-gray-500">{title}</p>
        <p className={`text-xs sm:text-sm font-black text-${color}-400`}>{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

const FoodItem = ({ food, onRemove, showRemove = false }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all">
    <div className="flex-1">
      <p className="text-sm font-bold text-white">{food.foodName}</p>
      <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
        <span className="text-gray-500">{food.servingSize}</span>
        <span className="text-red-400">{food.protein}g P</span>
        <span className="text-yellow-400">{food.carbs}g C</span>
        <span className="text-green-400">{food.fats}g F</span>
      </div>
    </div>
    <div className="text-right flex items-center gap-3">
      <div>
        <p className="text-sm font-bold text-white tabular-nums">{food.calories}</p>
        <p className="text-[8px] text-gray-500">kcal</p>
      </div>
      {showRemove && (
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 text-red-400 text-sm flex items-center justify-center hover:bg-red-600/30 transition-all"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

// ===== MAIN COMPONENT =====
export default function DietModal({ studentId, onClose }) {
  const [diet, setDiet] = useState(null);
  const [step, setStep] = useState("loading");
  const [loading, setLoading] = useState(false);
  const [savingMacros, setSavingMacros] = useState(false);
  const [approving, setApproving] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [creatingMeal, setCreatingMeal] = useState(false);
  const [activeMacro, setActiveMacro] = useState(null);

  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [weight, setWeight] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState(5);

  const [macroProtein, setMacroProtein] = useState(0);
  const [macroCarbs, setMacroCarbs] = useState(0);
  const [macroFats, setMacroFats] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const [tempGrams, setTempGrams] = useState({});
  const [activeMeal, setActiveMeal] = useState(null);
  const [showMealInput, setShowMealInput] = useState(false);
  const [newMealName, setNewMealName] = useState("");

  // ===== COMPUTED VALUES =====
  const macroCalories = macroProtein * 4 + macroCarbs * 4 + macroFats * 9;
  const targetCalories = diet?.calories || 0;
  const macroDifference = targetCalories - macroCalories;
  const macroProgress = targetCalories ? (macroCalories / targetCalories) * 100 : 0;
  const isApproved = diet?.status === "approved";

  const macros = [
    { label: "PRO", value: macroProtein, type: "protein", kcal: macroProtein * 4, color: "text-red-500", bg: "bg-red-500/8", border: "border-red-500/30", icon: "🥩", activeGlow: "shadow-red-500/20" },
    { label: "CRB", value: macroCarbs, type: "carbs", kcal: macroCarbs * 4, color: "text-yellow-400", bg: "bg-yellow-400/8", border: "border-yellow-400/30", icon: "🍚", activeGlow: "shadow-yellow-400/20" },
    { label: "FAT", value: macroFats, type: "fats", kcal: macroFats * 9, color: "text-green-400", bg: "bg-green-400/8", border: "border-green-400/30", icon: "🥑", activeGlow: "shadow-green-400/20" },
  ];

  const presets = [
    { name: "BAL", p: 0.3, c: 0.4, f: 0.3, icon: "⚖️" },
    { name: "PRO", p: 0.4, c: 0.35, f: 0.25, icon: "💪" },
    { name: "LC", p: 0.35, c: 0.2, f: 0.45, icon: "🥑" },
    { name: "KETO", p: 0.25, c: 0.05, f: 0.7, icon: "🔥" },
    { name: "END", p: 0.2, c: 0.6, f: 0.2, icon: "⚡" },
  ];

  const foodMap = useMemo(() => {
    const map = {};
    foodDatabase.forEach((food) => (map[food._id] = food));
    return map;
  }, [foodDatabase]);

  const addedMacros = useMemo(() => {
    let protein = 0, carbs = 0, fats = 0, calories = 0;
    diet?.meals?.forEach((meal) => {
      meal.foods.forEach((food) => {
        protein += food.protein || 0;
        carbs += food.carbs || 0;
        fats += food.fats || 0;
        calories += food.calories || 0;
      });
    });
    return { protein, carbs, fats, calories };
  }, [diet?.meals]);

  const selectedMacros = useMemo(() => {
    let protein = 0, carbs = 0, fats = 0, calories = 0;
    Object.values(selectedFoods).forEach((item) => {
      const food = foodMap[item.foodId];
      if (!food) return;
      const scale = (item.grams || 100) / (food.baseQuantity || 100);
      protein += (food.nutrition?.protein_g || 0) * scale;
      carbs += (food.nutrition?.carbs_g || 0) * scale;
      fats += (food.nutrition?.fat_g || 0) * scale;
      calories += (food.nutrition?.calories || 0) * scale;
    });
    return { protein, carbs, fats, calories };
  }, [selectedFoods, foodMap]);

  const totalMacros = useMemo(() => ({
    protein: addedMacros.protein + selectedMacros.protein,
    carbs: addedMacros.carbs + selectedMacros.carbs,
    fats: addedMacros.fats + selectedMacros.fats,
    calories: addedMacros.calories + selectedMacros.calories,
  }), [addedMacros, selectedMacros]);

  // ===== EFFECTS =====
  useEffect(() => {
    const init = async () => {
      try {
        const check = await api.get(`/trainer/diet/check/${studentId}`);
        if (check.data.data.exists) {
          const dietRes = await api.get(`/trainer/diet/show/${studentId}`);
          const dietData = dietRes.data.data;
          setDiet(dietData);

          if (dietData.desiredMacros) {
            setMacroProtein(dietData.desiredMacros.protein?.grams || 0);
            setMacroCarbs(dietData.desiredMacros.carbs?.grams || 0);
            setMacroFats(dietData.desiredMacros.fats?.grams || 0);
          }

          const hasMacros = dietData.desiredMacros && (
            dietData.desiredMacros.protein?.grams > 0 ||
            dietData.desiredMacros.carbs?.grams > 0 ||
            dietData.desiredMacros.fats?.grams > 0
          );

          if (dietData.status === "approved") {
            setStep("approved");
          } else {
            if (hasMacros) {
              setStep("food-insertion");
              if (dietData.meals?.length > 0) setActiveMeal(dietData.meals[0]._id);
              fetchAllFoods();
            } else {
              setStep("macros");
            }
          }
        } else {
          setStep("create");
        }
      } catch (err) {
        console.error(err);
        setStep("create");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [studentId]);

  // ===== HANDLERS =====
  const fetchAllFoods = async () => {
    try {
      const res = await api.get("/trainer/getAllFoods");
      setFoodDatabase(res.data.data);
    } catch (err) {
      console.error("Failed to fetch foods", err);
      toast.error("Could not load food database");
    }
  };

  const searchFoods = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const filtered = foodDatabase.filter((food) =>
      food.foodName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setSearching(false);
  };

  const adjustMacro = (type, direction) => {
    if (isApproved) return toast.error("Cannot edit approved diet");
    const amount = direction === "up" ? 1 : -1;
    const setter = { protein: setMacroProtein, carbs: setMacroCarbs, fats: setMacroFats }[type];
    if (setter) {
      setter((prev) => Math.max(0, prev + amount));
      setActiveMacro(type);
      setTimeout(() => setActiveMacro(null), 300);
    }
  };

  const applyPreset = (p, c, f) => {
    if (isApproved) return toast.error("Cannot edit approved diet");
    if (!diet) return;
    const total = diet.calories;
    setMacroProtein(Math.max(0, Math.floor((total * p) / 4)));
    setMacroCarbs(Math.max(0, Math.floor((total * c) / 4)));
    setMacroFats(Math.max(0, Math.floor((total * f) / 9)));
    toast.success("Preset applied", { icon: "⚡" });
  };

  const createDiet = async () => {
    if (!goal || !dietType || !weight) return toast.error("All fields required");
    try {
      setLoading(true);
      const res = await api.post("/trainer/diet/generate", {
        userId: studentId, goal, dietType, weight: Number(weight), mealsPerDay,
      });
      setDiet(res.data.data);
      setStep("macros");
      toast.success("Diet generated! 🚀");
    } catch {
      toast.error("Failed to create diet");
    } finally {
      setLoading(false);
    }
  };

  const saveMacros = async () => {
    if (isApproved) return toast.error("Cannot edit approved diet");
    if (!diet) return toast.error("No diet found");
    if (Math.abs(macroDifference) > 50) return toast.error("Macros must be within 50kcal of target");

    try {
      setSavingMacros(true);
      const res = await api.patch(`/trainer/diet/setMacros/${diet._id}`, {
        protein: macroProtein, carbs: macroCarbs, fats: macroFats,
      });
      setDiet(res.data.data);
      toast.success("Macros locked! 🔥");
      setStep("food-insertion");
      fetchAllFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save macros");
    } finally {
      setSavingMacros(false);
    }
  };

  const createNewMeal = async () => {
    if (!newMealName.trim()) return toast.error("Please enter a meal name");
    try {
      setCreatingMeal(true);
      const res = await api.patch(`/trainer/diet/add/meal/${diet._id}`, { meal: newMealName });
      setDiet(res.data.data);
      const newMeal = res.data.data.meals[res.data.data.meals.length - 1];
      setActiveMeal(newMeal._id);
      toast.success(`Meal "${newMealName}" created`);
      setNewMealName("");
      setShowMealInput(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create meal");
    } finally {
      setCreatingMeal(false);
    }
  };

  const addFoodsToDiet = async () => {
    if (!activeMeal) return toast.error("Please select a meal first");
    const foodsArray = Object.values(selectedFoods).map(({ foodId, grams }) => ({ foodId, grams }));
    if (foodsArray.length === 0) return;

    try {
      setAddingFood(true);
      const res = await api.post(`/trainer/addFood/${activeMeal}`, { userId: studentId, foods: foodsArray });
      setDiet(res.data.data);
      setSelectedFoods({});
      setTempGrams({});
      toast.success("Foods added successfully 🔥");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add foods");
    } finally {
      setAddingFood(false);
    }
  };

  const removeFood = async (foodId, mealId) => {
    try {
      const res = await api.patch(`/trainer/diet/${studentId}/food/remove/${foodId}/${mealId}`, { data: { userId: studentId } });
      setDiet(res.data.data);
      toast.success("Food removed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove food");
    }
  };

  const approveDiet = async () => {
    try {
      setApproving(true);
      const res = await api.patch(`/trainer/diet/approve/${diet._id}`);
      setDiet(res.data.data);
      setStep("approved");
      toast.success("Diet approved! ✅");
    } catch {
      toast.error("Failed to approve diet");
    } finally {
      setApproving(false);
    }
  };

  const editDiet = async () => {
    try {
      // Change status back to draft
      const res = await api.patch(`/trainer/diet/approve/${diet._id}`, { status: "draft" });
      setDiet(res.data.data);
      setStep("food-insertion");
      toast.success("Diet unlocked for editing 🔓");
    } catch {
      toast.error("Failed to unlock diet");
    }
  };

  const editMacros = async () => {
    try {
      const res = await api.patch(`/trainer/diet/approve/${diet._id}`, { status: "draft" });
      setDiet(res.data.data);
      setStep("macros");
      toast.success("Editing macros 📊");
    } catch {
      toast.error("Failed to unlock diet");
    }
  };

  const editMeals = async () => {
    try {
      const res = await api.patch(`/trainer/diet/approve/${diet._id}`, { status: "draft" });
      setDiet(res.data.data);
      setStep("food-insertion");
      if (diet.meals?.length > 0) setActiveMeal(diet.meals[0]._id);
      toast.success("Editing meals 🍽️");
    } catch {
      toast.error("Failed to unlock diet");
    }
  };

  // ===== RENDER LOADING =====
  if (step === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 text-xl animate-pulse">⚡</span>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg md:max-w-2xl lg:max-w-4xl h-[95vh] md:h-[90vh] bg-gradient-to-b from-black via-neutral-950 to-black rounded-t-3xl md:rounded-3xl border-t md:border border-red-600/30 shadow-[0_0_100px_rgba(239,68,68,0.1)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-red-600/30 flex justify-between items-center bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="text-2xl animate-pulse-slow">⚡</div>
            <h2 className="text-sm font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
              {step === "approved" ? "APPROVED DIET" : "DIET ENGINE"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-red-600/30 active:border-red-500 flex items-center justify-center text-gray-400 active:text-red-500 active:scale-90 transition-all duration-200"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-6">
          
          {/* ===== STEP: CREATE ===== */}
          {step === "create" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse-slow" />
                  <div className="relative text-5xl animate-bounce-slow">🥗</div>
                </div>
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  NEW DIET PROTOCOL
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: "GOAL", value: goal, onChange: setGoal, options: [
                    { value: "", label: "Select goal" },
                    { value: "fat loss", label: "🔥 FAT LOSS" },
                    { value: "muscle gain", label: "💪 MUSCLE GAIN" },
                    { value: "maintenance", label: "⚖️ MAINTENANCE" },
                  ]},
                  { label: "DIET TYPE", value: dietType, onChange: setDietType, options: [
                    { value: "", label: "Select type" },
                    { value: "veg", label: "🌱 VEG" },
                    { value: "non-veg", label: "🥩 NON-VEG" },
                    { value: "vegan", label: "🌿 VEGAN" },
                    { value: "general", label: "⚡ GENERAL" },
                  ]},
                ].map((field) => (
                  <div key={field.label} className="relative">
                    <label className="block text-[10px] tracking-wider text-gray-500 mb-1 ml-1">{field.label}</label>
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full bg-black/90 border border-red-600/30 rounded-xl px-4 py-3.5 text-sm text-gray-300 appearance-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    >
                      {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <div className="absolute right-4 bottom-4 text-gray-500 pointer-events-none text-xs">▼</div>
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] tracking-wider text-gray-500 mb-1 ml-1">WEIGHT (KG)</label>
                  <input
                    type="number"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-black/90 border border-red-600/30 rounded-xl px-4 py-3.5 text-sm text-gray-300 placeholder:text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-wider text-gray-500 mb-1 ml-1">MEALS</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMealsPerDay(num)}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          mealsPerDay === num
                            ? "border-red-500 bg-red-500/20 text-red-500"
                            : "border-red-600/30 text-gray-400 active:border-red-500/50"
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={createDiet}
                disabled={loading}
                className="relative w-full mt-4 py-4 rounded-xl font-black tracking-[0.15em] text-sm border border-red-500 bg-gradient-to-r from-red-600/20 to-red-500/20 active:from-red-600/30 active:to-red-500/30 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> GENERATING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span> GENERATE DIET
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ===== STEP: MACROS ===== */}
          {step === "macros" && diet && (
            <div className="space-y-5 sm:space-y-6">
              <StatusBanner icon="⚡" title="DIET STATUS" subtitle="DRAFT · SET MACROS" color="yellow">
                <div className="text-right shrink-0">
                  <p className="text-[9px] sm:text-[10px] text-gray-500">TARGET</p>
                  <p className="text-base sm:text-lg font-black text-white">{diet.calories}</p>
                  <p className="text-[7px] sm:text-[8px] text-gray-500">KCAL</p>
                </div>
              </StatusBanner>

              {/* Progress Circle */}
              <div className="flex justify-center py-1 sm:py-2">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-full h-full -rotate-90 drop-shadow-xl">
                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="6" />
                    <circle
                      cx="50%" cy="50%" r="45%" fill="none" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}%`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(macroProgress / 100, 1))}%`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f87171" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums">{macroCalories}</span>
                    <span className="text-[7px] sm:text-[8px] tracking-wider text-gray-500/80">OF {diet.calories}</span>
                  </div>
                </div>
              </div>

              {/* Macro Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {macros.map((macro) => (
                  <MacroCard key={macro.type} macro={macro} activeMacro={activeMacro} onAdjust={adjustMacro} isApproved={isApproved} />
                ))}
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] tracking-wider text-gray-500/80">PRESETS</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-red-500/30 to-transparent" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.p, preset.c, preset.f)}
                      className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 transition-all active:scale-95 active:bg-red-500/20 active:border-red-500/50 hover:bg-white/10"
                    >
                      <span className="text-sm sm:text-base mr-1">{preset.icon}</span>
                      <span className="text-[8px] sm:text-[10px] font-bold text-gray-400">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calorie Balance */}
              <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                macroDifference === 0 ? "bg-green-500/10 border-green-500/30" :
                macroDifference > 0 ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/30"
              }`}>
                <span className="text-xs sm:text-sm text-gray-400">CALORIE BALANCE</span>
                <span className={`text-sm sm:text-base font-black tabular-nums ${
                  macroDifference === 0 ? "text-green-400" :
                  macroDifference > 0 ? "text-red-500" : "text-yellow-400"
                }`}>
                  {macroDifference > 0 ? "+" : ""}{macroDifference} kcal
                </span>
              </div>

              {/* Save Button */}
              <button
                onClick={saveMacros}
                disabled={savingMacros || Math.abs(macroDifference) > 50}
                className="relative w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black tracking-wider text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-500 overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {savingMacros ? (
                  <span className="flex items-center justify-center gap-2"><Spinner /> LOCKING MACROS...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🔒</span>
                    {Math.abs(macroDifference) > 50 ? "BALANCE MACROS FIRST" : "SAVE & CONTINUE"}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ===== STEP: FOOD INSERTION ===== */}
          {step === "food-insertion" && diet && (
            <div className="space-y-6">
              <StatusBanner icon="🍽️" title="STEP 2/2" subtitle="BUILD YOUR MEALS" color="blue" />

              {/* Macro Summary */}
              <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium text-white/40 tracking-wide">TARGET</span>
                  <span className="text-[11px] font-mono text-white/40">{macroProtein}P · {macroCarbs}C · {macroFats}F</span>
                </div>

                <div className="flex justify-between gap-2 mb-5">
                  {[
                    { label: "Protein", value: totalMacros.protein, target: macroProtein, color: "red", icon: "💪", gradient: "from-red-500/20 to-red-500/5" },
                    { label: "Carbs", value: totalMacros.carbs, target: macroCarbs, color: "yellow", icon: "🍚", gradient: "from-yellow-500/20 to-yellow-500/5" },
                    { label: "Fats", value: totalMacros.fats, target: macroFats, color: "green", icon: "🫒", gradient: "from-green-500/20 to-green-500/5" },
                  ].map((macro) => {
                    const percent = (macro.value / macro.target) * 100;
                    const isOver = percent > 100;
                    const isUnder = percent < 100;
                    return (
                      <div key={macro.label} className={`flex-1 bg-gradient-to-br ${macro.gradient} rounded-xl p-3 flex flex-col items-center border border-white/10 backdrop-blur-sm`}>
                        <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider mb-1">{macro.label}</span>
                        <span className="text-2xl font-light text-white tabular-nums leading-none mb-0.5">{Math.round(macro.value)}</span>
                        <span className="text-[9px] text-white/30">/ {macro.target}g</span>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-sm opacity-70">{macro.icon}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            isOver ? "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]" :
                            isUnder ? "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]" :
                            "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-medium text-white/40">Calories</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-light text-white tabular-nums">{Math.round(totalMacros.calories)}</span>
                    <span className="text-[11px] text-white/20">/ {macroCalories}</span>
                    <div className={`text-[10px] font-medium px-3 py-1 rounded-full bg-gradient-to-r ${
                      totalMacros.calories === macroCalories ? "from-green-500/30 to-green-400/20 text-green-300 border border-green-500/30" :
                      totalMacros.calories > macroCalories ? "from-red-500/30 to-red-400/20 text-red-300 border border-red-500/30" :
                      "from-yellow-500/30 to-yellow-400/20 text-yellow-300 border border-yellow-500/30"
                    }`}>
                      {macroCalories - Math.round(totalMacros.calories) > 0 ? "+" : ""}
                      {macroCalories - Math.round(totalMacros.calories)} left
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-2 text-[9px] text-white/20">
                  <span>Projected: {Math.round(totalMacros.protein)}P · {Math.round(totalMacros.carbs)}C · {Math.round(totalMacros.fats)}F</span>
                </div>
              </div>

              {/* Meal Tabs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {diet.meals?.map((meal) => (
                    <button
                      key={meal._id}
                      onClick={() => setActiveMeal(meal._id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        activeMeal === meal._id
                          ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                          : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {meal.meal}
                    </button>
                  ))}
                  
                  {!showMealInput ? (
                    <button
                      onClick={() => setShowMealInput(true)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-all text-lg"
                    >
                      +
                    </button>
                  ) : (
                    <div className="flex-shrink-0 flex items-center gap-2 bg-black/60 border border-green-500/30 rounded-full pl-4 pr-2 py-1.5">
                      <input
                        type="text"
                        placeholder="Meal name..."
                        value={newMealName}
                        onChange={(e) => setNewMealName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createNewMeal();
                          if (e.key === "Escape") {
                            setShowMealInput(false);
                            setNewMealName("");
                          }
                        }}
                        autoFocus
                        className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-32"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={createNewMeal}
                          disabled={creatingMeal || !newMealName.trim()}
                          className="w-6 h-6 rounded-full bg-green-500/30 border border-green-500/50 text-green-400 flex items-center justify-center hover:bg-green-500/40 transition-all disabled:opacity-50 text-sm"
                        >
                          {creatingMeal ? <Spinner size="sm" /> : "✓"}
                        </button>
                        <button
                          onClick={() => {
                            setShowMealInput(false);
                            setNewMealName("");
                          }}
                          className="w-6 h-6 rounded-full bg-red-500/30 border border-red-500/50 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Foods in Active Meal */}
                {activeMeal && (
                  <div className="space-y-3">
                    {diet.meals?.find((m) => m._id === activeMeal)?.foods?.map((food) => (
                      <FoodItem key={food._id} food={food} onRemove={() => removeFood(food.foodId, activeMeal)} showRemove />
                    ))}
                    {diet.meals?.find((m) => m._id === activeMeal)?.foods?.length === 0 && (
                      <p className="text-center text-xs text-gray-500 py-4">No foods in this meal yet. Search and add below.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Food Search */}
              {activeMeal ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] tracking-wider text-gray-500 ml-1">SEARCH FOODS</label>
                    {Object.keys(selectedFoods).length > 0 && (
                      <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                        <span className="text-[10px] text-green-400 font-bold">{Object.keys(selectedFoods).length} SELECTED</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g., chicken, rice..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchFoods()}
                        className="w-full bg-black/90 border border-red-600/30 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-300 placeholder:text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400">✕</button>
                      )}
                    </div>
                    <button
                      onClick={searchFoods}
                      disabled={searching}
                      className="px-5 py-3 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 font-bold text-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {searching ? <><Spinner size="sm" /> <span className="hidden sm:inline">SEARCHING</span></> : <><span>🔍</span> <span className="hidden sm:inline">SEARCH</span></>}
                    </button>
                  </div>

                  {/* Selected Foods Preview */}
                  {Object.keys(selectedFoods).length > 0 && (
                    <div className="mt-2 p-2 rounded-xl bg-green-500/5 border border-green-500/30 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] tracking-wider text-green-400/80 font-medium">SELECTED ITEMS</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-green-500/30 to-transparent" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(selectedFoods).map((item) => (
                          <div key={item.foodId} className="group relative flex items-center gap-1.5 bg-black/40 border border-green-500/20 rounded-full pl-2 pr-0.5 py-0.5 hover:bg-green-500/10 transition-all">
                            <span className="text-[11px] font-medium text-white/90 whitespace-nowrap">{item.foodName}</span>
                            <span className="text-[9px] font-bold text-green-400/90">{item.grams}g</span>
                            <button
                              onClick={() => {
                                const newSelected = { ...selectedFoods };
                                delete newSelected[item.foodId];
                                setSelectedFoods(newSelected);
                              }}
                              className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:bg-red-500/30"
                            >
                              <span className="text-red-400 text-[9px] leading-none">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-wider text-gray-500">RESULTS</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-red-500/30 to-transparent" />
                      </div>
                      <div className="space-y-3">
                        {searchResults.map((food) => {
                          const inputValue = tempGrams[food._id] !== undefined ? tempGrams[food._id] : 100;
                          const grams = Number(inputValue) || 0;
                          const baseQty = food.baseQuantity || 100;
                          const scale = grams / baseQty;
                          const calories = Math.round((food.nutrition?.calories || 0) * scale);
                          const protein = ((food.nutrition?.protein_g || 0) * scale).toFixed(1);
                          const carbs = ((food.nutrition?.carbs_g || 0) * scale).toFixed(1);
                          const fats = ((food.nutrition?.fat_g || 0) * scale).toFixed(1);
                          const isSelected = !!selectedFoods[food._id];

                          return (
                            <div key={food._id} className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                              isSelected ? "border-green-500 bg-gradient-to-br from-green-500/20 to-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.2)]" :
                              "border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/30"
                            }`}>
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              <div className="relative p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-base font-bold text-white">{food.foodName}</h4>
                                      {isSelected && <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded-full">SELECTED</span>}
                                    </div>
                                    <p className="text-[11px] text-gray-400">{calories} kcal · P {protein}g · C {carbs}g · F {fats}g</p>
                                    <p className="text-[9px] text-gray-600 mt-1">per {grams}g ({baseQty}g base)</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min="1"
                                        step="5"
                                        value={inputValue}
                                        onChange={(e) => setTempGrams((prev) => ({ ...prev, [food._id]: e.target.value }))}
                                        className="w-24 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">g</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (isSelected) {
                                          const newSelected = { ...selectedFoods };
                                          delete newSelected[food._id];
                                          setSelectedFoods(newSelected);
                                        } else {
                                          const gramsToUse = Number(tempGrams[food._id]) || 100;
                                          setSelectedFoods((prev) => ({
                                            ...prev,
                                            [food._id]: { foodId: food._id, foodName: food.foodName, grams: gramsToUse },
                                          }));
                                        }
                                      }}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                        isSelected ? "bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-green-500" :
                                        "bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 hover:border-red-500"
                                      }`}
                                    >
                                      {isSelected ? "✓ SELECTED" : "+ SELECT"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add All Selected Foods Button */}
                      {Object.keys(selectedFoods).length > 0 && (
                        <button
                          onClick={addFoodsToDiet}
                          disabled={addingFood}
                          className="relative w-full mt-4 py-4 rounded-xl font-black tracking-wider text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden group"
                        >
                          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          {addingFood ? (
                            <span className="flex items-center justify-center gap-2"><Spinner /> ADDING...</span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>➕</span> ADD {Object.keys(selectedFoods).length} TO {diet.meals?.find((m) => m._id === activeMeal)?.meal}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery && searchResults.length === 0 && !searching && (
                    <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-4xl mb-2 block">🔍</span>
                      <p className="text-sm text-gray-500">No foods found</p>
                      <p className="text-[10px] text-gray-600 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-4xl mb-2 block">🍽️</span>
                  <p className="text-sm text-gray-500">Select or create a meal to add foods</p>
                </div>
              )}

              {/* Approve Button */}
              <button
                onClick={approveDiet}
                disabled={approving}
                className="relative w-full py-5 rounded-xl font-black tracking-wider text-base border-2 border-green-500 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden group animate-pulse-slow"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/30 to-green-600/0 group-hover:translate-x-full transition-transform duration-1000" />
                {approving ? (
                  <span className="flex items-center justify-center gap-3"><Spinner /> APPROVING DIET...</span>
                ) : (
                  <span className="flex items-center justify-center gap-3"><span>✅</span> APPROVE DIET <span>⚡</span></span>
                )}
              </button>
            </div>
          )}

          {/* ===== STEP: APPROVED ===== */}
          {step === "approved" && diet && (
            <div className="space-y-6">
              <StatusBanner icon="✅" title="APPROVED DIET" subtitle={`${diet.calories} kcal`} color="green">
                <p className="text-[10px] text-gray-500 mt-1">{diet.goal?.toUpperCase()} · {diet.dietType?.toUpperCase()}</p>
              </StatusBanner>

              {/* Daily Targets */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <p className="text-[10px] tracking-wider text-gray-500 mb-4">DAILY TARGETS</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: "🥩", value: diet.desiredMacros?.protein?.grams || 0, label: "PROTEIN", color: "red" },
                    { icon: "🍚", value: diet.desiredMacros?.carbs?.grams || 0, label: "CARBS", color: "yellow" },
                    { icon: "🥑", value: diet.desiredMacros?.fats?.grams || 0, label: "FATS", color: "green" },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div className={`w-10 h-10 rounded-full bg-${macro.color}-500/20 flex items-center justify-center mx-auto mb-2`}>
                        <span className={`text-${macro.color}-500 text-lg`}>{macro.icon}</span>
                      </div>
                      <p className={`text-xl font-black text-${macro.color}-500`}>{macro.value}g</p>
                      <p className="text-[8px] text-gray-500">{macro.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Plan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-wider text-gray-500">MEAL PLAN</p>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                    {diet.meals?.length || 0} {diet.meals?.length === 1 ? "meal" : "meals"}
                  </span>
                </div>

                {diet.meals && diet.meals.length > 0 ? (
                  <div className="space-y-4">
                    {diet.meals.map((meal, mealIndex) => (
                      <div key={meal._id || mealIndex} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-blue-500 rounded-full" />
                          <h4 className="text-xs font-bold text-blue-400 tracking-wider">{meal.meal}</h4>
                          <span className="text-[8px] text-gray-500 ml-auto">{meal.foods?.length || 0} items</span>
                        </div>
                        {meal.foods && meal.foods.length > 0 ? (
                          <div className="space-y-2 pl-3">
                            {meal.foods.map((food) => <FoodItem key={food._id} food={food} />)}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 italic pl-3 py-1">No foods in this meal</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-4xl mb-2 block">🍽️</span>
                    <p className="text-sm text-gray-500">No meals created</p>
                  </div>
                )}
              </div>

              {/* Total Nutrition */}
              <div className="bg-gradient-to-r from-red-600/10 to-red-500/10 rounded-xl p-4 border border-red-500/30 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">TOTAL NUTRITION</span>
                  <span className="text-lg font-black text-white">
                    {diet.meals?.reduce((sum, meal) => sum + meal.foods.reduce((s, f) => s + (f.calories || 0), 0), 0) || 0} kcal
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>{diet.meals?.reduce((sum, meal) => sum + meal.foods.reduce((s, f) => s + (f.protein || 0), 0), 0).toFixed(1)}g Protein</span>
                  <span>{diet.meals?.reduce((sum, meal) => sum + meal.foods.reduce((s, f) => s + (f.carbs || 0), 0), 0).toFixed(1)}g Carbs</span>
                  <span>{diet.meals?.reduce((sum, meal) => sum + meal.foods.reduce((s, f) => s + (f.fats || 0), 0), 0).toFixed(1)}g Fats</span>
                </div>
              </div>

              {/* Edit Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={editMacros}
                  className="relative py-4 rounded-xl font-black tracking-wider text-sm bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] hover:from-purple-600/30 hover:to-pink-600/30 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="flex items-center justify-center gap-2">
                    <span>📊</span> EDIT MACROS
                  </span>
                </button>

                <button
                  onClick={editMeals}
                  className="relative py-4 rounded-xl font-black tracking-wider text-sm bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] hover:from-yellow-600/30 hover:to-orange-600/30 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/20 to-yellow-600/0 group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="flex items-center justify-center gap-2">
                    <span>🍽️</span> EDIT MEALS
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}