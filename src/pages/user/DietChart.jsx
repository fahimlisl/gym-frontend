// import { useEffect, useState } from "react";
// import { ChevronDown, Flame, Beef, Wheat, Droplet, Trophy, Target, Apple, Calendar } from "lucide-react";
// import api from "../../api/axios.api.js";
// import "./DietChart.css";

// export default function DietChart() {
//   const [diet, setDiet] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [expandedMeal, setExpandedMeal] = useState(null);
//   const [stats, setStats] = useState({
//     totalCalories: 0,
//     totalProtein: 0,
//     totalCarbs: 0,
//     totalFats: 0
//   });

//   useEffect(() => {
//     fetchDiet();
//   }, []);

//   const fetchDiet = async () => {
//     try {
//       const res = await api.get("/user/diet/my");
//       setDiet(res.data.data);
//       calculateStats(res.data.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to load diet:", err);
//       setLoading(false);
//     }
//   };

//   const calculateStats = (dietData) => {
//     if (!dietData.meals) return;

//     let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

//     dietData.meals.forEach(meal => {
//       meal.foods.forEach(food => {
//         totalCals += food.calories || 0;
//         totalProtein += food.protein || 0;
//         totalCarbs += food.carbs || 0;
//         totalFats += food.fats || 0;
//       });
//     });

//     setStats({
//       totalCalories: totalCals,
//       totalProtein,
//       totalCarbs,
//       totalFats
//     });
//   };

//   if (loading) return <DietSkeleton />;
//   if (!diet) return <ErrorState />;

//   return (
//     <div className="diet-chart-container">
//       <div className="diet-bg-blur diet-blur-1"></div>
//       <div className="diet-bg-blur diet-blur-2"></div>
//       <div className="diet-bg-blur diet-blur-3"></div>

//       <header className="diet-header animate-fade-in">
//         <div className="diet-header-content">
//           <div className="diet-header-left">
//             <div className="diet-header-icon">
//               <Trophy className="w-8 h-8" />
//             </div>
//             <div className="diet-header-text">
//               <h1 className="diet-title">Your Diet Plan</h1>
//               <p className="diet-subtitle">
//                 {diet.goal} • {diet.dietType} • {diet.mealsPerDay} Meals/Day
//               </p>
//             </div>
//           </div>
//           <div className={`diet-status-badge ${diet.status}`}>
//             <span className="diet-status-dot"></span>
//             <span className="diet-status-text">{diet.status}</span>
//           </div>
//         </div>
//       </header>

//       <section className="diet-metrics-section animate-slide-up">
//         <h2 className="diet-section-title">Daily Overview</h2>
//         <div className="diet-metrics-grid">
//           <MetricCard
//             icon={<Flame className="w-6 h-6" />}
//             label="Daily Calories"
//             value={Math.round(diet.calories)}
//             unit="kcal"
//             color="orange"
//             actual={Math.round(stats.totalCalories)}
//           />
//           <MetricCard
//             icon={<Beef className="w-6 h-6" />}
//             label="Protein"
//             value={Math.round(diet.desiredMacros?.protein?.grams || 0)}
//             unit="g"
//             color="red"
//             actual={Math.round(stats.totalProtein)}
//           />
//           <MetricCard
//             icon={<Wheat className="w-6 h-6" />}
//             label="Carbs"
//             value={Math.round(diet.desiredMacros?.carbs?.grams || 0)}
//             unit="g"
//             color="yellow"
//             actual={Math.round(stats.totalCarbs)}
//           />
//           <MetricCard
//             icon={<Droplet className="w-6 h-6" />}
//             label="Fats"
//             value={Math.round(diet.desiredMacros?.fats?.grams || 0)}
//             unit="g"
//             color="green"
//             actual={Math.round(stats.totalFats)}
//           />
//         </div>
//       </section>

//       <section className="diet-chart-section animate-slide-up">
//         <h2 className="diet-section-title">Macro Distribution</h2>
//         <MacroChart
//           protein={Math.round(diet.desiredMacros?.protein?.grams || 0)}
//           carbs={Math.round(diet.desiredMacros?.carbs?.grams || 0)}
//           fats={Math.round(diet.desiredMacros?.fats?.grams || 0)}
//         />
//       </section>

//       <section className="diet-meals-section animate-slide-up">
//         <h2 className="diet-section-title">Your Meal Plan</h2>

//         {!diet.meals || diet.meals.length === 0 ? (
//           <div className="diet-empty-state">
//             <Apple className="w-16 h-16" />
//             <p>No meals scheduled yet</p>
//           </div>
//         ) : (
//           <div className="diet-meals-list">
//             {diet.meals.map((meal, idx) => (
//               <MealCardExpanded
//                 key={idx}
//                 meal={meal}
//                 index={idx}
//                 isExpanded={expandedMeal === idx}
//                 onToggle={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
//               />
//             ))}
//           </div>
//         )}
//       </section>

//       <footer className="diet-footer">
//         <p>Last updated: {new Date().toLocaleDateString()}</p>
//       </footer>
//     </div>
//   );
// }

// function MetricCard({ icon, label, value, unit, color, actual }) {
//   const percentage = Math.min((actual / value) * 100, 100);
//   const colorClass = `metric-${color}`;

//   return (
//     <div className={`metric-card ${colorClass}`}>
//       <div className="metric-header">
//         <div className="metric-icon">{icon}</div>
//         <p className="metric-label">{label}</p>
//       </div>

//       <div className="metric-value">
//         <span className="metric-number">{value}</span>
//         <span className="metric-unit">{unit}</span>
//       </div>

//       <div className="metric-progress">
//         <div className="metric-progress-bar">
//           <div
//             className="metric-progress-fill"
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <span className="metric-progress-text">{Math.round(percentage)}%</span>
//       </div>
//     </div>
//   );
// }

// function MacroChart({ protein, carbs, fats }) {
//   const total = protein + carbs + fats;
//   const proteinPercent = (protein / total) * 100;
//   const carbsPercent = (carbs / total) * 100;
//   const fatsPercent = (fats / total) * 100;

//   return (
//     <div className="macro-chart">
//       <div className="macro-visual">
//         <div className="macro-pie">
//           <svg viewBox="0 0 100 100" className="macro-svg">
//             <circle
//               cx="50"
//               cy="50"
//               r="40"
//               fill="none"
//               stroke="url(#gradRed)"
//               strokeWidth="30"
//               strokeDasharray={`${proteinPercent * 2.51} 251`}
//               strokeDashoffset="0"
//               transform="rotate(-90 50 50)"
//               className="macro-segment"
//             />
//             <circle
//               cx="50"
//               cy="50"
//               r="40"
//               fill="none"
//               stroke="url(#gradYellow)"
//               strokeWidth="30"
//               strokeDasharray={`${carbsPercent * 2.51} 251`}
//               strokeDashoffset={`-${proteinPercent * 2.51}`}
//               transform="rotate(-90 50 50)"
//               className="macro-segment"
//             />
//             <circle
//               cx="50"
//               cy="50"
//               r="40"
//               fill="none"
//               stroke="url(#gradGreen)"
//               strokeWidth="30"
//               strokeDasharray={`${fatsPercent * 2.51} 251`}
//               strokeDashoffset={`-${(proteinPercent + carbsPercent) * 2.51}`}
//               transform="rotate(-90 50 50)"
//               className="macro-segment"
//             />

//             <defs>
//               <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#ef4444" />
//                 <stop offset="100%" stopColor="#dc2626" />
//               </linearGradient>
//               <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#eab308" />
//                 <stop offset="100%" stopColor="#ca8a04" />
//               </linearGradient>
//               <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#10b981" />
//                 <stop offset="100%" stopColor="#059669" />
//               </linearGradient>
//             </defs>
//           </svg>
//           <div className="macro-center">
//             <p className="macro-center-label">Total</p>
//             <p className="macro-center-value">{Math.round(protein + carbs + fats)}g</p>
//           </div>
//         </div>
//       </div>

//       <div className="macro-legend">
//         <MacroLegendItem label="Protein" value={protein} unit="g" color="red" />
//         <MacroLegendItem label="Carbs" value={carbs} unit="g" color="yellow" />
//         <MacroLegendItem label="Fats" value={fats} unit="g" color="green" />
//       </div>
//     </div>
//   );
// }

// function MacroLegendItem({ label, value, unit, color }) {
//   const colorClasses = {
//     red: "legend-red",
//     yellow: "legend-yellow",
//     green: "legend-green"
//   };

//   return (
//     <div className={`macro-legend-item ${colorClasses[color]}`}>
//       <div className="legend-dot"></div>
//       <div className="legend-content">
//         <p className="legend-label">{label}</p>
//         <p className="legend-value">{Math.round(value)}{unit}</p>
//       </div>
//     </div>
//   );
// }

// function MealCardExpanded({ meal, index, isExpanded, onToggle }) {
//   const mealIcons = {
//     breakfast: "🌅",
//     lunch: "🍽️",
//     dinner: "🌙",
//     snack: "🥤",
//     pre_workout: "💪",
//     post_workout: "⚡"
//   };

//   const icon = mealIcons[meal.meal.toLowerCase()] || "🍴";

//   const mealCalories = meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
//   const mealProtein = meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0);

//   return (
//     <div className={`meal-card ${isExpanded ? "expanded" : ""}`}>
//       <button className="meal-card-header" onClick={onToggle}>
//         <div className="meal-header-left">
//           <span className="meal-icon">{icon}</span>
//           <div className="meal-info">
//             <h3 className="meal-title">{meal.meal}</h3>
//             <p className="meal-subtitle">{meal.foods.length} items</p>
//           </div>
//         </div>

//         <div className="meal-header-right">
//           <div className="meal-quick-stats">
//             <span className="meal-stat">
//               <Flame className="w-4 h-4" /> {Math.round(mealCalories)}
//             </span>
//             <span className="meal-stat">
//               <Beef className="w-4 h-4" /> {Math.round(mealProtein)}g
//             </span>
//           </div>
//           <ChevronDown className={`meal-chevron ${isExpanded ? "rotated" : ""}`} />
//         </div>
//       </button>

//       {isExpanded && (
//         <div className="meal-card-content animate-expand">
//           {meal.foods.length === 0 ? (
//             <p className="meal-empty">No foods in this meal</p>
//           ) : (
//             <div className="food-items-list">
//               {meal.foods.map((food, idx) => (
//                 <FoodItemRow key={idx} food={food} />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function FoodItemRow({ food }) {
//   return (
//     <div className="food-item">
//       <div className="food-name">
//         <p className="food-title">{food.foodName}</p>
//         {food.servingSize && <p className="food-serving">{food.servingSize}</p>}
//       </div>

//       <div className="food-macros">
//         <div className="food-macro food-calories">
//           <span className="macro-icon">🔥</span>
//           <span className="macro-value">{Math.round(food.calories)}</span>
//         </div>
//         <div className="food-macro food-protein">
//           <span className="macro-icon">💪</span>
//           <span className="macro-value">{Math.round(food.protein)}g</span>
//         </div>
//         <div className="food-macro food-carbs">
//           <span className="macro-icon">🍞</span>
//           <span className="macro-value">{Math.round(food.carbs)}g</span>
//         </div>
//         <div className="food-macro food-fats">
//           <span className="macro-icon">🧈</span>
//           <span className="macro-value">{Math.round(food.fats)}g</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ErrorState() {
//   return (
//     <div className="diet-error-state">
//       <Trophy className="w-16 h-16" />
//       <h2>No Diet Plan Yet</h2>
//       <p>Ask your trainer to create a personalized diet plan for you</p>
//     </div>
//   );
// }

// function DietSkeleton() {
//   return (
//     <div className="diet-chart-container">
//       <div className="skeleton-header"></div>
//       <div className="skeleton-grid">
//         {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)}
//       </div>
//       <div className="skeleton-section"></div>
//       <div className="skeleton-section"></div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Flame,
  Trophy,
  Apple,
  Target,
  TrendingUp,
  Activity,
  Calendar,
  Utensils,
} from "lucide-react";
import api from "../../api/axios.api.js";

export default function DietChart() {
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });

  useEffect(() => {
    fetchDiet();
  }, []);

  const fetchDiet = async () => {
    try {
      const res = await api.get("/user/diet/my");
      setDiet(res.data.data);
      calculateStats(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load diet:", err);
      setLoading(false);
    }
  };

  const calculateStats = (dietData) => {
    if (!dietData.meals) return;

    let totalCals = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFats = 0;

    dietData.meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        totalCals += food.calories || 0;
        totalProtein += food.protein || 0;
        totalCarbs += food.carbs || 0;
        totalFats += food.fats || 0;
      });
    });

    setStats({
      totalCalories: totalCals,
      totalProtein,
      totalCarbs,
      totalFats,
    });
  };

  if (loading) return <DietSkeleton />;
  if (!diet) return <ErrorState />;

  const caloriePercentage = Math.min(
    100,
    (stats.totalCalories / diet.calories) * 100,
  );
  const remainingCalories = Math.max(0, diet.calories - stats.totalCalories);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4 md:p-6 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[100px] -top-48 -left-48 pointer-events-none"></div>
      <div className="fixed w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] -bottom-48 -right-48 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Your Diet Plan
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {diet.goal} • {diet.dietType} • {diet.mealsPerDay} Meals/Day
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm capitalize">
                {diet.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 mb-6 animate-slideUp">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${caloriePercentage * 2.83} 283`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500 mb-1" />
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {Math.round(stats.totalCalories)}
                  </span>
                  <span className="text-gray-400 text-sm">/</span>
                  <span className="text-gray-400 text-sm">
                    {Math.round(diet.calories)}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">kcal</span>
              </div>
            </div>

            {/* Calorie Stats */}
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  Consumed
                </p>
                <p className="text-xl font-bold text-white">
                  {Math.round(stats.totalCalories)}{" "}
                  <span className="text-sm text-gray-400">kcal</span>
                </p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  Remaining
                </p>
                <p className="text-xl font-bold text-orange-500">
                  {remainingCalories}{" "}
                  <span className="text-sm text-gray-400">kcal</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 mb-6 animate-slideUp">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Macro Distribution
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm font-medium">
                    Protein
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-semibold">
                    {Math.round(stats.totalProtein)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    / {Math.round(diet.desiredMacros?.protein?.grams || 0)}g
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (stats.totalProtein / (diet.desiredMacros?.protein?.grams || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm font-medium">
                    Carbs
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-semibold">
                    {Math.round(stats.totalCarbs)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    / {Math.round(diet.desiredMacros?.carbs?.grams || 0)}g
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (stats.totalCarbs / (diet.desiredMacros?.carbs?.grams || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm font-medium">
                    Fats
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-semibold">
                    {Math.round(stats.totalFats)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    / {Math.round(diet.desiredMacros?.fats?.grams || 0)}g
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (stats.totalFats / (diet.desiredMacros?.fats?.grams || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Plan */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-red-500" />
              Meal Plan
            </h2>
            <span className="text-sm text-gray-400">
              {diet.meals?.length || 0} meals today
            </span>
          </div>

          {!diet.meals || diet.meals.length === 0 ? (
            <div className="text-center py-12">
              <Apple className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No meals scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diet.meals.map((meal, idx) => {
                const mealCalories = meal.foods.reduce(
                  (sum, food) => sum + (food.calories || 0),
                  0,
                );
                const mealProtein = meal.foods.reduce(
                  (sum, food) => sum + (food.protein || 0),
                  0,
                );
                const mealCarbs = meal.foods.reduce(
                  (sum, food) => sum + (food.carbs || 0),
                  0,
                );
                const mealFats = meal.foods.reduce(
                  (sum, food) => sum + (food.fats || 0),
                  0,
                );

                const mealIcons = {
                  breakfast: "🌅",
                  lunch: "🍽️",
                  dinner: "🌙",
                  snack: "🥤",
                  pre_workout: "💪",
                  post_workout: "⚡",
                };
                const icon = mealIcons[meal.meal.toLowerCase()] || "🍴";

                return (
                  <div
                    key={idx}
                    className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() =>
                        setExpandedMeal(expandedMeal === idx ? null : idx)
                      }
                      className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div className="text-left ">
                          <h3 className="text-white font-semibold capitalize">
                            {meal.meal}
                          </h3>
                          <p className="text-gray-500 text-xs">
                            {meal.foods.length} items •{" "}
                            {Math.round(mealCalories)} kcal
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedMeal === idx ? "rotate-180" : ""}`}
                      />
                    </button>

                    {expandedMeal === idx && (
                      <div className="border-t border-white/10 p-2 space-y-3 animate-slideDown">
                        {meal.foods.map((food, foodIdx) => (
                          <div
                            key={foodIdx}
                            className="relative overflow-hidden bg-gradient-to-r from-gray-900/50 to-transparent rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-500"></div>
                            <div className="p-3 pl-4">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <p className="text-white font-semibold text-base">
                                      {food.foodName}
                                    </p>
                                    {food.servingSize && (
                                      <p className="text-gray-500 text-xs">
                                        {food.servingSize}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="px-2 py-1 bg-orange-500/10 rounded-lg min-w-[60px] text-center">
                                    <p className="text-orange-400 text-[10px] uppercase tracking-wider">
                                      Calories
                                    </p>
                                    <p className="text-white font-bold text-sm">
                                      {Math.round(food.calories)}
                                    </p>
                                  </div>
                                  <div className="px-2 py-1 bg-red-500/10 rounded-lg min-w-[60px] text-center">
                                    <p className="text-red-400 text-[10px] uppercase tracking-wider">
                                      Protein
                                    </p>
                                    <p className="text-white font-bold text-sm">
                                      {Math.round(food.protein)}g
                                    </p>
                                  </div>
                                  <div className="px-2 py-1 bg-yellow-500/10 rounded-lg min-w-[60px] text-center">
                                    <p className="text-yellow-400 text-[10px] uppercase tracking-wider">
                                      Carbs
                                    </p>
                                    <p className="text-white font-bold text-sm">
                                      {Math.round(food.carbs)}g
                                    </p>
                                  </div>
                                  <div className="px-2 py-1 bg-green-500/10 rounded-lg min-w-[60px] text-center">
                                    <p className="text-green-400 text-[10px] uppercase tracking-wider">
                                      Fats
                                    </p>
                                    <p className="text-white font-bold text-sm">
                                      {Math.round(food.fats)}g
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="text-center mt-6 pb-4">
          <p className="text-gray-600 text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          No Diet Plan Yet
        </h2>
        <p className="text-gray-400">
          Ask your trainer to create a personalized diet plan for you
        </p>
      </div>
    </div>
  );
}

function DietSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out;
  }
  
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
