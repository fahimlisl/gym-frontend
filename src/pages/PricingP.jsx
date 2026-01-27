import { useState } from "react";
import PricingCard from "../components/pricing/PricingCard";

export default function PricingP() {
  const [billing, setBilling] = useState("monthly");

  const plans = {
    monthly: [
      {
        title: "BASIC",
        price: 999,
        duration: "month",
        subtext: "For beginners",
        features: [
          "Gym access",
          "Locker access",
          "Free assessment",
        ],
      },
      {
        title: "PRO",
        price: 1999,
        duration: "month",
        badge: "MOST POPULAR",
        highlighted: true,
        subtext: "For serious lifters",
        features: [
          "Everything in Basic",
          "Personal trainer (2x/week)",
          "Diet consultation",
          "Priority support",
        ],
      },
      {
        title: "ELITE",
        price: 3999,
        duration: "month",
        subtext: "For total transformation",
        features: [
          "Unlimited trainer access",
          "Custom diet & workout",
          "Recovery & supplements",
          "VIP support",
        ],
      },
    ],
    yearly: [
      {
        title: "BASIC",
        price: 9999,
        duration: "year",
        subtext: "Save ₹2,000 yearly",
        features: [
          "Gym access",
          "Locker access",
          "Free assessment",
        ],
      },
      {
        title: "PRO",
        price: 19999,
        duration: "year",
        badge: "BEST VALUE",
        highlighted: true,
        subtext: "Save ₹4,000 yearly",
        features: [
          "Everything in Basic",
          "Personal trainer (2x/week)",
          "Diet consultation",
          "Priority support",
        ],
      },
      {
        title: "ELITE",
        price: 39999,
        duration: "year",
        subtext: "Save ₹8,000 yearly",
        features: [
          "Unlimited trainer access",
          "Custom diet & workout",
          "Recovery & supplements",
          "VIP support",
        ],
      },
    ],
  };

  return (
    <div className="bg-neutral-950 text-white">
      
      {/* Hero */}
      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          INVEST IN YOUR
          <span className="text-red-600"> BODY</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Strong bodies are built with commitment —
          choose a plan that matches your mindset.
        </p>

        {/* Billing Toggle */}
        <div className="mt-10 inline-flex border border-white/10">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-6 py-3 font-bold ${
              billing === "monthly"
                ? "bg-red-600"
                : "text-gray-400"
            }`}
          >
            MONTHLY
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-6 py-3 font-bold ${
              billing === "yearly"
                ? "bg-red-600"
                : "text-gray-400"
            }`}
          >
            YEARLY (SAVE MORE)
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-28">
        <div className="grid md:grid-cols-3 gap-10">
          {plans[billing].map((plan) => (
            <PricingCard
              key={plan.title}
              {...plan}
            />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black border-t border-white/10 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-black mb-4">
            NO CONTRACTS. NO EXCUSES.
          </h2>
          <p className="text-gray-400 mb-8">
            Start today. Quit someday — or never.
          </p>
          <button className="bg-red-600 px-12 py-4 font-extrabold tracking-widest">
            JOIN THE GRIND
          </button>
        </div>
      </section>
    </div>
  );
}
