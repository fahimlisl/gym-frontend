import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Zap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Only trigger if mouse leaves from top of page
      if (e.clientY <= 0) {
        const hasSeenExitIntent = sessionStorage.getItem("exitIntentSeen");
        if (!hasSeenExitIntent) {
          setIsOpen(true);
          sessionStorage.setItem("exitIntentSeen", "true");
        }
      }
    };

    // Only add on desktop
    if (window.innerWidth > 768) {
      document.addEventListener("mouseleave", handleMouseLeave);
      return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }
  }, []);

  const handleClaim = () => {
    navigate("/pricing");
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
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
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-orange-600/30">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
              </div>

              {/* Border glow */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-orange-600 to-transparent" />
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
              <div className="relative z-10 p-8 sm:p-12">
                {/* Top Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-600/50">
                    <Gift className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-black text-orange-400 tracking-wider">
                      WAIT! SPECIAL OFFER
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black mb-3 text-white">
                    Don't Leave Without Your
                    <br />
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      30% DISCOUNT
                    </span>
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    Join 500+ members this month and transform your fitness journey
                  </p>
                </motion.div>

                {/* Split Layout - Offer + Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid sm:grid-cols-2 gap-4 mb-8"
                >
                  {/* Left - What They Get */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      WITH THIS OFFER
                    </h3>
                    <div className="space-y-2">
                      {[
                        "Unlimited gym access",
                        "All equipment & classes",
                        "Personal trainer intro",
                        "Nutrition guide",
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className="flex items-center gap-2 text-xs text-gray-300"
                        >
                          <div className="w-1 h-1 rounded-full bg-green-500" />
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right - Pricing */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-600/20 to-red-600/10 border border-orange-600/30">
                    <h3 className="text-sm font-black text-white mb-4">PRICING</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Original Price</p>
                        <p className="text-lg font-black text-gray-300 line-through">
                          ₹4,999
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Your Price</p>
                        <p className="text-2xl font-black text-orange-400">
                          ₹3,499
                        </p>
                        <p className="text-xs text-green-400 font-black">SAVE ₹1,500</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Countdown Timer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 p-4 rounded-xl bg-red-600/10 border border-red-600/30 text-center"
                >
                  <p className="text-xs text-gray-400 mb-2 font-medium">
                    OFFER EXPIRES IN
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl font-black text-red-500"
                  >
                    59:59
                  </motion.div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClaim}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 font-black text-white tracking-wider text-sm transition-all duration-300"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2">
                      CLAIM 30% DISCOUNT NOW
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-black text-white text-sm transition-all duration-300"
                  >
                    NO THANKS
                  </motion.button>
                </motion.div>

                {/* Trust Message */}
                <p className="text-center text-xs text-gray-600 mt-6">
                  ✓ Secure • ✓ Fast signup • ✓ Money-back guarantee
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}