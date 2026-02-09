import { useState } from "react";

import {NavLink} from "react-router-dom"
export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Is there any contract or lock-in period?",
      a: "No. We believe results should keep you here, not contracts."
    },
    {
      q: "Is this gym suitable for beginners?",
      a: "Yes. All programs are structured to scale from beginner to advanced."
    },
    {
      q: "Do you provide personal training?",
      a: "Yes. Personal training is included in Pro and Elite plans."
    },
    {
      q: "Do you provide diet or nutrition plans?",
      a: "Yes. Nutrition guidance is part of our structured programs."
    },
    {
      q: "What if I miss workouts?",
      a: "Our coaches help adjust your plan so you stay consistent."
    }
  ];

  return (
    <div className="bg-neutral-950 text-white overflow-hidden">

      <section className="container py-28 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
          BUILT FOR
          <span className="text-red-600"> DISCIPLINE</span>
        </h1>
        <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
          Not a motivational gym. A system for real change.
        </p>
      </section>

      <div className="h-px bg-white/10" />

      <section className="container py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-black mb-6">
            WHO
            <span className="text-red-600"> WE ARE</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We are a results-driven training space built for people who
            are tired of guessing and ready for structure.
            <br /><br />
            Every workout, meal, and recovery plan is intentional.
          </p>
        </div>

        <div className="bg-black border border-white/10 p-10">
          <ul className="space-y-6 text-sm font-semibold tracking-wide">
            <li className="flex items-center gap-4">
              <span className="text-red-600">■</span> Program-based training
            </li>
            <li className="flex items-center gap-4">
              <span className="text-red-600">■</span> Certified coaches
            </li>
            <li className="flex items-center gap-4">
              <span className="text-red-600">■</span> Progress tracking
            </li>
            <li className="flex items-center gap-4">
              <span className="text-red-600">■</span> Nutrition & recovery
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-black border-y border-white/10 py-24">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl font-black mb-6">
            OUR
            <span className="text-red-600"> PHILOSOPHY</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Motivation fades. Discipline compounds.
            <br /><br />
            We build systems that work when motivation doesn’t.
          </p>
        </div>
      </section>

      <section className="container py-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: "500+", label: "ACTIVE MEMBERS" },
          { value: "10+", label: "YEARS EXPERIENCE" },
          { value: "30+", label: "PROGRAMS BUILT" },
          { value: "100%", label: "RESULT-FOCUSED" },
        ].map((stat, i) => (
          <div key={i} className="border border-white/10 bg-black py-10">
            <p className="text-4xl font-black text-red-600">{stat.value}</p>
            <p className="mt-2 text-gray-400 text-xs tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <div className="h-px bg-white/10" />

      <section className="container py-24 max-w-4xl">
        <h2 className="text-3xl font-black mb-10 text-center">
          FAQ
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 bg-black">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 flex justify-between font-semibold"
              >
                {faq.q}
                <span className="text-red-600">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-gray-400 text-sm">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="container py-24 max-w-5xl">
        <h2 className="text-3xl font-black mb-6">
          TERMS &
          <span className="text-red-600"> CONDITIONS</span>
        </h2>
        <div className="text-gray-400 text-sm space-y-4">
          <p>Membership fees are non-refundable once activated.</p>
          <p>Members must follow safety guidelines and trainer instructions.</p>
          <p>Misconduct may lead to membership termination.</p>
          <p>The gym is not responsible for injuries caused by negligence.</p>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="container py-24 max-w-5xl">
        <h2 className="text-3xl font-black mb-6">
          PRIVACY
          <span className="text-red-600"> POLICY</span>
        </h2>
        <div className="text-gray-400 text-sm space-y-4">
          <p>We collect only necessary member information.</p>
          <p>Your data is stored securely and never sold.</p>
          <p>Payment data is handled via secure providers.</p>
        </div>
      </section>

      <section className="container py-32 text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-6">
          READY TO
          <span className="text-red-600"> COMMIT?</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10">
          Structure. Accountability. Results.
        </p>
        <NavLink to="/contacts">
        <button className="bg-red-600 hover:bg-red-700 px-14 py-4 font-extrabold tracking-widest">
          JOIN THE GRIND
        </button>
        </NavLink>
      </section>

    </div>
  );
}
