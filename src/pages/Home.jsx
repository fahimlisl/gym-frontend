import Hero, { PerformanceCafe } from "../components/home/Hero";
import BMICalculator from "../components/home/BMICalculator";
import OfferModal from "../components/home/OfferModal";
import NewsletterPopup from "../components/home/NewsletterPopup";
// import TrialPopup from "../components/home/TrialPopup";
import ExitIntentPopup from "../components/home/ExitIntentPopup";

export default function Home() {
  return (
    <>
      <OfferModal />
      {/* <NewsletterPopup /> */}
      {/* <TrialPopup /> */}
      {/* <ExitIntentPopup /> */}

      <Hero />

      <section className="bg-neutral-950 text-white py-24">
        <div className="container mx-auto px-4">
          <BMICalculator />
        </div>
      </section>

      <PerformanceCafe />

      <section className="bg-neutral-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {["Modern Equipment", "Certified Trainers", "Flexible Plans"].map(
              (title) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl bg-black
                             border border-white/10
                             hover:border-red-500 transition"
                >
                  <h3 className="text-2xl font-extrabold mb-3 tracking-wide">
                    {title.toUpperCase()}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Built for people who take training seriously — no shortcuts.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}