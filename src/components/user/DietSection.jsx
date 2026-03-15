import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Activity, Flame, Target, Sun, Moon, Apple, Beef, Wheat, Droplet } from "lucide-react";
import api from "../../api/axios.api.js";

export default function DietSection() {
  const [diet, setDiet] = useState(null);
  const [state, setState] = useState("loading");
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

  if (state === "loading") return <DietSkeleton />;

  if (state === "error") {
    return (
      <Card error>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black tracking-widest mb-3">DIET PLAN</h3>
          <p className="text-red-400/80 max-w-xs">
            Failed to load your diet plan. Please refresh or try again later.
          </p>
          <button 
            onClick={init}
            className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (state === "pending") {
    return (
      <Card pending>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Sun className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-black tracking-widest mb-3">DIET PLAN</h3>
          <div className="flex items-center gap-2 text-yellow-400 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="font-medium">In Preparation</span>
          </div>
          <p className="text-gray-400 max-w-xs">
            Your trainer is crafting a personalized diet plan for you. 
            It will appear here once approved.
          </p>
          <div className="mt-8 w-full max-w-xs bg-neutral-800/50 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card approved>
        <div className="relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black tracking-widest bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                YOUR DIET PLAN
              </h3>
              <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <span className="text-xs font-medium text-green-400">ACTIVE</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard 
                icon={<Target className="w-4 h-4" />}
                label="Goal" 
                value={diet.goal} 
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard 
                icon={<Flame className="w-4 h-4" />}
                label="Daily Calories" 
                value={`${diet.calories} kcal`} 
                gradient="from-orange-500 to-red-500"
              />
              <StatCard 
                icon={<Apple className="w-4 h-4" />}
                label="Diet Type" 
                value={diet.dietType} 
                gradient="from-purple-500 to-pink-500"
              />
              <StatCard 
                icon={<Activity className="w-4 h-4" />}
                label="Meals / Day" 
                value={diet.mealsPerDay} 
                gradient="from-teal-500 to-emerald-500"
              />
            </div>

            {/* Macros Section */}
            {diet.desiredMacros && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
                  <h4 className="text-sm font-bold text-gray-300 tracking-wider">TARGET MACROS</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <MacroPill
                    icon={<Beef className="w-4 h-4" />}
                    label="Protein"
                    value={diet.desiredMacros.protein?.grams || 0}
                    color="red"
                  />
                  <MacroPill
                    icon={<Wheat className="w-4 h-4" />}
                    label="Carbs"
                    value={diet.desiredMacros.carbs?.grams || 0}
                    color="yellow"
                  />
                  <MacroPill
                    icon={<Droplet className="w-4 h-4" />}
                    label="Fats"
                    value={diet.desiredMacros.fats?.grams || 0}
                    color="green"
                  />
                </div>
              </div>
            )}

            {/* View Full Diet Button */}
            <button
              onClick={() => setOpen(true)}
              className="mt-8 w-full group relative overflow-hidden rounded-xl
                       bg-gradient-to-r from-green-600 to-emerald-600 p-[2px]"
            >
              <div className="relative bg-black/90 group-hover:bg-transparent transition-colors duration-300 rounded-xl py-4">
                <span className="font-black tracking-widest text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                  VIEW FULL DIET PLAN
                </span>
              </div>
            </button>
          </div>
        </div>
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

// Modal Component
function FullDietModal({ diet, onClose }) {
  const [activeMeal, setActiveMeal] = useState(null);

  const statusConfig = {
    approved: { color: "text-green-400", bg: "bg-green-500/10", label: "Active" },
    draft: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Draft" },
    pending: { color: "text-orange-400", bg: "bg-orange-500/10", label: "Pending" }
  };

  const status = statusConfig[diet.status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent md:bg-black/80 md:backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full md:max-w-4xl max-h-[90vh] bg-gradient-to-b from-neutral-900 via-black to-neutral-900 
                    border-t md:border border-green-500/20 rounded-t-2xl md:rounded-2xl overflow-hidden
                    animate-slide-up shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl 
                            flex items-center justify-center shadow-lg shadow-green-500/20">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-widest text-white">DIET PLAN</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-red-500/20 
                       flex items-center justify-center transition-all group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-400 group-hover:rotate-90 transition-all" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <QuickStat label="Goal" value={diet.goal} icon={<Target className="w-4 h-4" />} />
            <QuickStat label="Calories" value={`${diet.calories}kcal`} icon={<Flame className="w-4 h-4" />} />
            <QuickStat label="Diet Type" value={diet.dietType} icon={<Apple className="w-4 h-4" />} />
            <QuickStat label="Meals" value={diet.mealsPerDay} icon={<Activity className="w-4 h-4" />} />
          </div>

          {/* Macros */}
          {diet.desiredMacros && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4">DAILY MACROS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MacroProgress
                  label="Protein"
                  value={diet.desiredMacros.protein?.grams || 0}
                  total={diet.desiredMacros.protein?.grams || 0}
                  color="red"
                  icon={<Beef className="w-4 h-4" />}
                />
                <MacroProgress
                  label="Carbs"
                  value={diet.desiredMacros.carbs?.grams || 0}
                  total={diet.desiredMacros.carbs?.grams || 0}
                  color="yellow"
                  icon={<Wheat className="w-4 h-4" />}
                />
                <MacroProgress
                  label="Fats"
                  value={diet.desiredMacros.fats?.grams || 0}
                  total={diet.desiredMacros.fats?.grams || 0}
                  color="green"
                  icon={<Droplet className="w-4 h-4" />}
                />
              </div>
            </div>
          )}

          {/* Meals Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4">MEAL PLAN</h3>
            {!diet.meals || diet.meals.length === 0 ? (
              <div className="text-center py-12 bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-700">
                <Moon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No meals added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {diet.meals.map((meal, idx) => (
                  <MealCard 
                    key={idx} 
                    meal={meal} 
                    isActive={activeMeal === idx}
                    onToggle={() => setActiveMeal(activeMeal === idx ? null : idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function Card({ children, approved, pending, error }) {
  const getStyles = () => {
    if (approved) return "border-green-500/30 from-green-950/30 via-black to-green-950/30";
    if (pending) return "border-yellow-500/30 from-yellow-950/30 via-black to-yellow-950/30";
    if (error) return "border-red-500/30 from-red-950/30 via-black to-red-950/30";
    return "border-red-600/30 from-neutral-900 via-black to-neutral-900";
  };

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${getStyles()} 
                    shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl`}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="group bg-neutral-800/50 hover:bg-neutral-800/80 rounded-xl p-4 
                    transition-all duration-300 border border-neutral-700/50 hover:border-neutral-600">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="font-bold text-lg capitalize text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MacroPill({ icon, label, value, color }) {
  const colors = {
    red: "from-red-500 to-rose-500 border-red-500/30",
    yellow: "from-yellow-500 to-amber-500 border-yellow-500/30",
    green: "from-green-500 to-emerald-500 border-green-500/30"
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} bg-opacity-10 p-3 
                    rounded-xl border ${colors[color]} flex items-center gap-3`}>
      <div className="p-2 bg-black/30 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold">{value}g</p>
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon }) {
  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-bold text-white capitalize">{value}</p>
    </div>
  );
}

function MacroProgress({ label, value, total, color, icon }) {
  const percentage = Math.min((value / total) * 100, 100);
  
  const colors = {
    red: "from-red-500 to-rose-500",
    yellow: "from-yellow-500 to-amber-500",
    green: "from-green-500 to-emerald-500"
  };

  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors[color]} bg-opacity-10`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value}g</span>
      </div>
      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MealCard({ meal, isActive, onToggle }) {
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden 
                    bg-gradient-to-br from-neutral-900 to-black">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-black text-green-400">
              {meal.meal.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-white uppercase tracking-wider">{meal.meal}</h4>
            <p className="text-xs text-gray-400">{meal.foods.length} items</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isActive && (
        <div className="p-4 border-t border-neutral-800 space-y-2 animate-slide-down">
          {meal.foods.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No foods in this meal</p>
          ) : (
            meal.foods.map((food, idx) => (
              <FoodItem key={idx} food={food} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FoodItem({ food }) {
  return (
    <div className="group bg-neutral-800/30 hover:bg-neutral-800/50 rounded-lg p-3 
                    transition-all duration-300 border border-neutral-700/30 hover:border-neutral-600">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p className="font-bold text-sm text-white uppercase tracking-wide">
            {food.foodName}
          </p>
          {food.servingSize && (
            <p className="text-xs text-gray-400 mt-1">{food.servingSize}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-full text-orange-400">
            <Flame className="w-3 h-3" /> {food.calories}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full text-red-400">
            <Beef className="w-3 h-3" /> {food.protein}g
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full text-yellow-400">
            <Wheat className="w-3 h-3" /> {food.carbs}g
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full text-green-400">
            <Droplet className="w-3 h-3" /> {food.fats}g
          </span>
        </div>
      </div>
    </div>
  );
}

function DietSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-black">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-800 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-neutral-800 rounded-lg"></div>
          ))}
        </div>
        <div className="h-12 bg-neutral-800 rounded-lg"></div>
      </div>
    </div>
  );
}

// Add to your global CSS or tailwind config
const styles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-down {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .animate-slide-down {
    animation: slide-down 0.2s ease-out;
  }
`;