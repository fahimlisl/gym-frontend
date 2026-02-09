import { useState } from "react";
import PricingCard from "../components/pricing/PricingCard";
import { NavLink } from "react-router-dom";

export default function PricingP() {
  const [billing, setBilling] = useState("subscription");

  const plans = {
    subscription: [
  {
    title: "BASIC",
    price: 999,
    duration: "month",
    subtext: "Essential gym access",
    features: [
      "Unlimited gym floor access",
      "Locker and changing room access",
      "Initial fitness assessment",
    ],
  },
  {
    title: "PRO",
    price: 1999,
    duration: "quarter",
    badge: "MOST POPULAR",
    highlighted: true,
    subtext: "Enhanced training support",
    features: [
      "All Basic plan benefits",
      "Workout guidance and training support",
      "Access to structured workout routines",
      "Priority member assistance",
    ],
  },
  {
    title: "ELITE",
    price: 3999,
    duration: "yearly",
    subtext: "Premium gym experience",
    features: [
      "Advanced workout programming support",
      "Priority equipment and time-slot access",
      "VIP member assistance",
    ],
  },
],

    personalTraining: [
  {
    title: "BASIC",
    price: 9999,
    duration: "month",
    subtext: "Guided personal training",
    features: [
      "Dedicated personal training sessions",
      "Gym access during training hours",
      "Initial fitness and posture assessment",
          "Diet planning and nutritional guidance"
      
    ],
  },
  {
    title: "PRO",
    price: 19999,
    duration: "quarter",
    badge: "BEST VALUE",
    highlighted: true,
    subtext: "Result-focused coaching",
    features: [
      "All Basic plan benefits",
      "Customized workout programming",
      "Diet planning and nutritional guidance",
      "Progress tracking and regular reviews",
    ],
  },
  {
    title: "ELITE",
    price: 39999,
    duration: "year",
    subtext: "Transformation program",
    features: [
      "Unlimited personal training sessions",
      "Fully personalized training and nutrition plans",
      "Advanced recovery protocols",
      "Continuous progress monitoring and support",
    ],
  },
],

  };

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
            onClick={() => setBilling("subscription")}
            className={`px-6 py-3 font-bold ${
              billing === "subscription"
                ? "bg-red-600"
                : "text-gray-400"
            }`}
          >
            SUBSCRIPTION
          </button>
          <button
            onClick={() => setBilling("personalTraining")}
            className={`px-6 py-3 font-bold ${
              billing === "personalTraining"
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
          {plans[billing].map((plan) => (
            <PricingCard
              key={plan.title}
              {...plan}
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