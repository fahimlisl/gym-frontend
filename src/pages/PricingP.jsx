import { useState, useEffect } from "react";
import PricingCard from "../components/pricing/PricingCard";
import { NavLink } from "react-router-dom";
import { fetchAllPlans } from "../api/general.api.js";

export default function PricingP() {

  const [billing, setBilling] = useState("SUBSCRIPTION");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchAllPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans");
      }
    };

    loadPlans();
  }, []);

  const filteredPlans = plans.filter(
    (plan) => plan.category === billing
  );

  return (
    <div className="bg-neutral-950 text-white">

      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          INVEST IN YOUR
          <span className="text-red-600"> BODY</span>
        </h1>

        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Strong bodies are built with commitment —
          choose a plan that matches your mindset.
        </p>

        <div className="mt-10 inline-flex border border-white/10">

          <button
            onClick={() => setBilling("SUBSCRIPTION")}
            className={`px-6 py-3 font-bold ${
              billing === "SUBSCRIPTION"
                ? "bg-red-600"
                : "text-gray-400"
            }`}
          >
            SUBSCRIPTION
          </button>

          <button
            onClick={() => setBilling("PT")}
            className={`px-6 py-3 font-bold ${
              billing === "PT"
                ? "bg-red-600"
                : "text-gray-400"
            }`}
          >
            PERSONAL TRAINING
          </button>

        </div>
      </section>

      <section className="container pb-28">
        <div className="grid md:grid-cols-3 gap-10">

          {filteredPlans.map((plan) => (
            <PricingCard
              key={plan._id}
              title={plan.title}
              duration={plan.duration}
              subtext={plan.bio}
              price={plan.finalPrice}
              basePrice={plan.basePrice}
              features={plan.benefits.map((b) => b.heading)}
            />
          ))}

        </div>
      </section>

      <section className="bg-black border-t border-white/10 py-20">
        <div className="container text-center">

          <h2 className="text-3xl font-black mb-4">
            NO CONTRACTS. NO EXCUSES.
          </h2>

          <p className="text-gray-400 mb-8">
            Start today. Quit someday — or never.
          </p>

          <NavLink to="/contacts">
            <button className="bg-red-600 px-12 py-4 font-extrabold tracking-widest">
              JOIN THE GRIND
            </button>
          </NavLink>

        </div>
      </section>

    </div>
  );
}