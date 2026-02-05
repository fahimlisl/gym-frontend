import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import api from "../../api/axios.api.js"; 

export default function DietSection() {
  const [diet, setDiet] = useState(null);
  const [state, setState] = useState("loading"); 

  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchDiet();
  }, []);

  const fetchDiet = async () => {
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


  if (state === "loading") {
    return <Skeleton />;
  }


  if (state === "error") {
    return (
      <Card>
        <h3 className="title">DIET PLAN</h3>
        <p className="text-sm text-red-400">
          Failed to load diet. Please try again later.
        </p>
      </Card>
    );
  }


  if (state === "pending") {
    return (
      <Card>
        <h3 className="title">DIET PLAN</h3>

        <div className="flex items-center gap-3 text-yellow-400">
          ⏳ <span>Diet not approved yet</span>
        </div>

        <p className="text-sm text-gray-400 mt-3">
          Your trainer is preparing your diet.
          Once approved, it will appear here automatically.
        </p>
      </Card>
    );
  }


  return (
    <>
      <Card highlight>
        <h3 className="title text-green-400">
          YOUR DIET PLAN
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <Stat label="Goal" value={diet.goal} />
          <Stat label="Calories" value={`${diet.calories} kcal`} />
          <Stat label="Diet Type" value={diet.dietType} />
          <Stat label="Meals / Day" value={diet.mealsPerDay} />
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 w-full bg-green-600 hover:bg-green-700
                     py-3 rounded-lg font-black tracking-widest
                     transition"
        >
          VIEW FULL DIET
        </button>
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


function FullDietModal({ diet, onClose }) {
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

          {diet.foods?.length === 0 ? (
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


function Card({ children, highlight }) {
  return (
    <div
      className={`p-6 rounded-xl border
      ${highlight
        ? "border-green-500/40 bg-gradient-to-br from-black via-green-950 to-black"
        : "border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black"
      }`}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-neutral-900 p-3 rounded">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-bold">{value}</p>
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

function Skeleton() {
  return (
    <div className="p-6 rounded-xl border border-neutral-700 animate-pulse">
      <div className="h-4 bg-neutral-800 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-neutral-800 rounded mb-2"></div>
      <div className="h-3 bg-neutral-800 rounded mb-2"></div>
      <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
    </div>
  );
}
