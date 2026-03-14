import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserDashboardLayout from "../../components/layout/UserDashboardLayout";

export default function PTPlans() {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await api.get("/user/plans/pt/fetch/all");
      setPlans(res.data.data);
    } catch {
      toast.error("Failed to load PT plans");
    }
  };

  return (
    <UserDashboardLayout>
    <div className="min-h-screen bg-neutral-950 text-white p-8">

      <h1 className="text-2xl font-black tracking-widest mb-10 text-center">
        PERSONAL TRAINING PLANS
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {plans.map((plan) => (
          <div
            key={plan._id}
            className="border border-red-600/30 bg-black p-6 rounded-xl flex flex-col"
          >
            <h2 className="text-xl font-black mb-2">
              {plan.title}
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              {plan.bio}
            </p>

            <div className="text-3xl font-black mb-4">
              ₹{plan.finalPrice}
            </div>

            <p className="text-xs text-gray-400 mb-6 uppercase">
              {plan.duration}
            </p>

            <div className="space-y-2 text-sm mb-6">
              {plan.benefits?.map((b) => (
                <div key={b._id} className="text-gray-300">
                  • {b.heading}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/member/pt-billing/${plan._id}`)}
              className="mt-auto border border-red-600
                         py-3 font-extrabold tracking-widest
                         hover:bg-red-600 transition"
            >
              SELECT PLAN
            </button>

          </div>
        ))}

      </div>
    </div>
  </UserDashboardLayout>
  );
}