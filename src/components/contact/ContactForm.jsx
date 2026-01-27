export default function ContactForm() {
  return (
    <form className="space-y-5">
      <input
        type="text"
        placeholder="Your Name"
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <input
        type="email"
        placeholder="Email Address"
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <textarea
        placeholder="Your Message"
        rows={4}
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <button
        type="button"
        className="w-full bg-red-600 py-3 font-extrabold tracking-widest"
      >
        SEND MESSAGE
      </button>
    </form>
  );
}
