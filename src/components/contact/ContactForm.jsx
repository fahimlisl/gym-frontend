import { useRef, useState } from "react";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";

export default function ContactForm() {
  const form = useRef();
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    if (
      !import.meta.env.VITE_EMAILJS_SERVICE_ID ||
      !import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
      !import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ) {
      toast.error("Email service is not configured properly ❌");
      return;
    }

    setLoading(true);

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (result) => {
          console.log("SUCCESS!", result.text);
          toast.success("Message sent successfully 🚀");
          e.target.reset();
        },
        (error) => {
          console.error("FAILED...", error.text);
          toast.error("Failed to send message. Try again later ⚠️");
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="space-y-5">
      <input
        type="text"
        name="from_name"
        placeholder="Your Name"
        required
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <input
        type="email"
        name="reply_to"
        placeholder="Email Address"
        required
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <input
        type="tel"
        name="phone_number"
        placeholder="Phone Number"
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <textarea
        name="message"
        placeholder="Your Message"
        rows={4}
        required
        className="w-full bg-neutral-900 border border-white/10 px-4 py-3 focus:border-red-600 outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 py-3 font-extrabold tracking-widest hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "SENDING..." : "SEND MESSAGE"}
      </button>
    </form>
  );
}