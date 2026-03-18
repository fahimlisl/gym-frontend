import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show after 30 seconds of being on page
    const timer = setTimeout(() => {
      const hasSeenNewsletter = sessionStorage.getItem("newsletterSeen");
      if (!hasSeenNewsletter) {
        setIsOpen(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      sessionStorage.setItem("newsletterSeen", "true");
      setIsLoading(false);

      // Close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("newsletterSeen", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-red-600/30">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
              </div>

              {/* Border glow */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-red-600 to-transparent" />
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10">
                {isSubmitted ? (
                  <>
                    {/* Success State */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 border-2 border-green-600 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </motion.div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        YOU'RE IN!
                      </h3>
                      <p className="text-gray-400">
                        Check your email for exclusive tips and offers
                      </p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Form State */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-600/50">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-black text-blue-400 tracking-wider">
                          WEEKLY TIPS
                        </span>
                      </div>

                      <h2 className="text-3xl font-black mb-2 text-white">
                        Get Fitness Tips Weekly
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Join 5000+ members getting expert fitness advice, workout
                        plans, and exclusive member-only deals delivered to your inbox.
                      </p>

                      {/* Perks */}
                      <div className="space-y-2 mb-6">
                        {[
                          "Expert workout routines",
                          "Nutrition guidance",
                          "15% discount on first month",
                        ].map((perk, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            {perk}
                          </motion.div>
                        ))}
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600/50 transition-colors"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-sm tracking-wider hover:from-red-800 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              SEND ME TIPS
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      </form>

                      <p className="text-xs text-gray-600 text-center mt-4">
                        We respect your inbox. Unsubscribe anytime.
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}