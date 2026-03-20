import { useEffect, useState } from "react";
import { ChevronDown, Flame, Beef, Wheat, Droplet, Trophy, Target, Apple, Calendar } from "lucide-react";
import api from "../../api/axios.api.js";
import "./DietChart.css"; 

export default function DietChart() {
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0
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
    
    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    
    dietData.meals.forEach(meal => {
      meal.foods.forEach(food => {
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
      totalFats
    });
  };

  if (loading) return <DietSkeleton />;
  if (!diet) return <ErrorState />;

  return (
    <div className="diet-chart-container">
      <div className="diet-bg-blur diet-blur-1"></div>
      <div className="diet-bg-blur diet-blur-2"></div>
      <div className="diet-bg-blur diet-blur-3"></div>

      <header className="diet-header animate-fade-in">
        <div className="diet-header-content">
          <div className="diet-header-left">
            <div className="diet-header-icon">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="diet-header-text">
              <h1 className="diet-title">Your Diet Plan</h1>
              <p className="diet-subtitle">
                {diet.goal} • {diet.dietType} • {diet.mealsPerDay} Meals/Day
              </p>
            </div>
          </div>
          <div className={`diet-status-badge ${diet.status}`}>
            <span className="diet-status-dot"></span>
            <span className="diet-status-text">{diet.status}</span>
          </div>
        </div>
      </header>

      <section className="diet-metrics-section animate-slide-up">
        <h2 className="diet-section-title">Daily Overview</h2>
        <div className="diet-metrics-grid">
          <MetricCard
            icon={<Flame className="w-6 h-6" />}
            label="Daily Calories"
            value={Math.round(diet.calories)}
            unit="kcal"
            color="orange"
            actual={Math.round(stats.totalCalories)}
          />
          <MetricCard
            icon={<Beef className="w-6 h-6" />}
            label="Protein"
            value={Math.round(diet.desiredMacros?.protein?.grams || 0)}
            unit="g"
            color="red"
            actual={Math.round(stats.totalProtein)}
          />
          <MetricCard
            icon={<Wheat className="w-6 h-6" />}
            label="Carbs"
            value={Math.round(diet.desiredMacros?.carbs?.grams || 0)}
            unit="g"
            color="yellow"
            actual={Math.round(stats.totalCarbs)}
          />
          <MetricCard
            icon={<Droplet className="w-6 h-6" />}
            label="Fats"
            value={Math.round(diet.desiredMacros?.fats?.grams || 0)}
            unit="g"
            color="green"
            actual={Math.round(stats.totalFats)}
          />
        </div>
      </section>

      <section className="diet-chart-section animate-slide-up">
        <h2 className="diet-section-title">Macro Distribution</h2>
        <MacroChart 
          protein={Math.round(diet.desiredMacros?.protein?.grams || 0)}
          carbs={Math.round(diet.desiredMacros?.carbs?.grams || 0)}
          fats={Math.round(diet.desiredMacros?.fats?.grams || 0)}
        />
      </section>

      <section className="diet-meals-section animate-slide-up">
        <h2 className="diet-section-title">Your Meal Plan</h2>
        
        {!diet.meals || diet.meals.length === 0 ? (
          <div className="diet-empty-state">
            <Apple className="w-16 h-16" />
            <p>No meals scheduled yet</p>
          </div>
        ) : (
          <div className="diet-meals-list">
            {diet.meals.map((meal, idx) => (
              <MealCardExpanded
                key={idx}
                meal={meal}
                index={idx}
                isExpanded={expandedMeal === idx}
                onToggle={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="diet-footer">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, color, actual }) {
  const percentage = Math.min((actual / value) * 100, 100);
  const colorClass = `metric-${color}`;

  return (
    <div className={`metric-card ${colorClass}`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <p className="metric-label">{label}</p>
      </div>

      <div className="metric-value">
        <span className="metric-number">{value}</span>
        <span className="metric-unit">{unit}</span>
      </div>

      <div className="metric-progress">
        <div className="metric-progress-bar">
          <div 
            className="metric-progress-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="metric-progress-text">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

function MacroChart({ protein, carbs, fats }) {
  const total = protein + carbs + fats;
  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatsPercent = (fats / total) * 100;

  return (
    <div className="macro-chart">
      <div className="macro-visual">
        <div className="macro-pie">
          <svg viewBox="0 0 100 100" className="macro-svg">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradRed)"
              strokeWidth="30"
              strokeDasharray={`${proteinPercent * 2.51} 251`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className="macro-segment"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradYellow)"
              strokeWidth="30"
              strokeDasharray={`${carbsPercent * 2.51} 251`}
              strokeDashoffset={`-${proteinPercent * 2.51}`}
              transform="rotate(-90 50 50)"
              className="macro-segment"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradGreen)"
              strokeWidth="30"
              strokeDasharray={`${fatsPercent * 2.51} 251`}
              strokeDashoffset={`-${(proteinPercent + carbsPercent) * 2.51}`}
              transform="rotate(-90 50 50)"
              className="macro-segment"
            />
            
            <defs>
              <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="macro-center">
            <p className="macro-center-label">Total</p>
            <p className="macro-center-value">{Math.round(protein + carbs + fats)}g</p>
          </div>
        </div>
      </div>

      <div className="macro-legend">
        <MacroLegendItem label="Protein" value={protein} unit="g" color="red" />
        <MacroLegendItem label="Carbs" value={carbs} unit="g" color="yellow" />
        <MacroLegendItem label="Fats" value={fats} unit="g" color="green" />
      </div>
    </div>
  );
}

function MacroLegendItem({ label, value, unit, color }) {
  const colorClasses = {
    red: "legend-red",
    yellow: "legend-yellow",
    green: "legend-green"
  };

  return (
    <div className={`macro-legend-item ${colorClasses[color]}`}>
      <div className="legend-dot"></div>
      <div className="legend-content">
        <p className="legend-label">{label}</p>
        <p className="legend-value">{Math.round(value)}{unit}</p>
      </div>
    </div>
  );
}

function MealCardExpanded({ meal, index, isExpanded, onToggle }) {
  const mealIcons = {
    breakfast: "🌅",
    lunch: "🍽️",
    dinner: "🌙",
    snack: "🥤",
    pre_workout: "💪",
    post_workout: "⚡"
  };

  const icon = mealIcons[meal.meal.toLowerCase()] || "🍴";

  const mealCalories = meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const mealProtein = meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0);

  return (
    <div className={`meal-card ${isExpanded ? "expanded" : ""}`}>
      <button className="meal-card-header" onClick={onToggle}>
        <div className="meal-header-left">
          <span className="meal-icon">{icon}</span>
          <div className="meal-info">
            <h3 className="meal-title">{meal.meal}</h3>
            <p className="meal-subtitle">{meal.foods.length} items</p>
          </div>
        </div>

        <div className="meal-header-right">
          <div className="meal-quick-stats">
            <span className="meal-stat">
              <Flame className="w-4 h-4" /> {Math.round(mealCalories)}
            </span>
            <span className="meal-stat">
              <Beef className="w-4 h-4" /> {Math.round(mealProtein)}g
            </span>
          </div>
          <ChevronDown className={`meal-chevron ${isExpanded ? "rotated" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="meal-card-content animate-expand">
          {meal.foods.length === 0 ? (
            <p className="meal-empty">No foods in this meal</p>
          ) : (
            <div className="food-items-list">
              {meal.foods.map((food, idx) => (
                <FoodItemRow key={idx} food={food} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FoodItemRow({ food }) {
  return (
    <div className="food-item">
      <div className="food-name">
        <p className="food-title">{food.foodName}</p>
        {food.servingSize && <p className="food-serving">{food.servingSize}</p>}
      </div>

      <div className="food-macros">
        <div className="food-macro food-calories">
          <span className="macro-icon">🔥</span>
          <span className="macro-value">{Math.round(food.calories)}</span>
        </div>
        <div className="food-macro food-protein">
          <span className="macro-icon">💪</span>
          <span className="macro-value">{Math.round(food.protein)}g</span>
        </div>
        <div className="food-macro food-carbs">
          <span className="macro-icon">🍞</span>
          <span className="macro-value">{Math.round(food.carbs)}g</span>
        </div>
        <div className="food-macro food-fats">
          <span className="macro-icon">🧈</span>
          <span className="macro-value">{Math.round(food.fats)}g</span>
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="diet-error-state">
      <Trophy className="w-16 h-16" />
      <h2>No Diet Plan Yet</h2>
      <p>Ask your trainer to create a personalized diet plan for you</p>
    </div>
  );
}

function DietSkeleton() {
  return (
    <div className="diet-chart-container">
      <div className="skeleton-header"></div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)}
      </div>
      <div className="skeleton-section"></div>
      <div className="skeleton-section"></div>
    </div>
  );
}