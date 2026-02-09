import ContactForm from "../components/contact/ContactForm";

export default function Contact() {
  return (
    <div className="bg-neutral-950 text-white">
      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-black">
          GET IN
          <span className="text-red-600"> TOUCH</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Questions? Membership inquiries?  
          We’re here. Reach out.
        </p>
      </section>

      <section className="container pb-28 grid lg:grid-cols-2 gap-16">
        <div>
          <h3 className="text-2xl font-extrabold mb-4">
            Gym Information
          </h3>

          <p className="text-gray-400 mb-6">
            Visit us or contact us directly.
            Our team will guide you.
          </p>

          <ul className="space-y-4 text-gray-300">
            <li>📍 Barsatigola chow rasta more (station road), Bhagwangola, Murshidabad</li>
            <li>📞 +91 8910322642 / 8250717406</li>
            <li>📞 +91 7719161307 (reception)</li>
            <li>✉️ support@alphagym.com</li>
            <li>🕒 Mon – Sun: 5AM – 11PM</li>
          </ul>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
