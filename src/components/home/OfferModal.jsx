import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Gift, ArrowRight, Flame, Tag, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.api";

export default function OfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenOffer, setHasSeenOffer] = useState(false);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [associatedCoupon, setAssociatedCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffersAndCoupons();
  }, []);

  useEffect(() => {
    const seenOffer = sessionStorage.getItem("offerSeen");

    if (!seenOffer && offers.length > 0 && !loading) {
      const now = new Date();
      const activeOffers = offers.filter((o) => {
        if (o.isActive !== true) return false;
        if (o.startDate && new Date(o.startDate) > now) return false;
        if (o.expiryDate && new Date(o.expiryDate) < now) return false;
        return true;
      });

      if (activeOffers.length > 0) {
        const timer = setTimeout(() => {
          const randomOffer =
            activeOffers[Math.floor(Math.random() * activeOffers.length)];
          setSelectedOffer(randomOffer);

          const coupon = coupons.find((c) => c.code === randomOffer.coupon);
          setAssociatedCoupon(coupon || null);

          setIsOpen(true);
          sessionStorage.setItem("offerSeen", "true");
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [offers, coupons, loading]);

  const fetchOffersAndCoupons = async () => {
    try {
      setLoading(true);
      const offersRes = await api.get("/general/offer/fetch/all");
      const offersData = offersRes.data.data || [];
      setOffers(offersData);
      const couponCodes = [
        ...new Set(offersData.map((o) => o.coupon).filter(Boolean)),
      ];

      if (couponCodes.length > 0) {
        const couponPromises = couponCodes.map((code) =>
          api.post("/general/coupon", { code }).catch(() => null)
        );

        const couponResults = await Promise.all(couponPromises);
        const fetchedCoupons = couponResults
          .filter((res) => res && res.data && res.data.data)
          .map((res) => res.data.data);

        setCoupons(fetchedCoupons);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingSlots = (offer) => {
    if (!offer || !offer.totalSlots) return 0;
    const coupon = coupons.find((c) => c.code === offer.coupon);
    if (coupon && coupon.usageLimit) {
      return Math.max(0, coupon.usageLimit - (coupon.usedCount || 0));
    }
    return offer.totalSlots;
  };

  const calculatePercentage = (offer) => {
    const remaining = calculateRemainingSlots(offer);
    const total = offer?.totalSlots || 100;
    const used = total - remaining;
    return Math.min(100, (used / total) * 100);
  };

  const getDiscountText = (offer) => {
    if (!offer) return "";
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    } else {
      return `₹${offer.discountValue} OFF`;
    }
  };

  const handleGetOffer = () => {
    setIsOpen(false);
    navigate("/pricing");
  };

  if (!selectedOffer || loading) return null;

  const remainingSlots = calculateRemainingSlots(selectedOffer);
  const percentageUsed = calculatePercentage(selectedOffer);
  const discountText = getDiscountText(selectedOffer);

  const isExpiringSoon =
    selectedOffer.expiryDate &&
    new Date(selectedOffer.expiryDate) - new Date() < 7 * 24 * 60 * 60 * 1000;
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.92,
      y: 40,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 24,
        stiffness: 350,
        duration: 0.5,
        filter: { duration: 0.3 },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 20,
      filter: "blur(4px)",
      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { delay: 0.2, duration: 0.4, ease: "easeOut" },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.25,
        duration: 0.5,
        ease: [0.21, 0.78, 0.35, 1.02],
      },
    },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.35, duration: 0.4, ease: "easeOut" },
    },
  };

  const infoCardVariants = {
    hidden: { opacity: 0, x: -15, scale: 0.98 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        delay: 0.4 + custom * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  const slotsVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 0.6, duration: 0.45, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.7, duration: 0.4, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const secondaryButtonVariants = {
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.85, duration: 0.3 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none"
          >
            <div className="relative w-full max-w-md max-h-[98vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/20 shadow-2xl pointer-events-auto">

              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-red-500 to-transparent" />
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </motion.button>

              <div className="relative z-10 p-8 sm:p-10">
                <motion.div
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-600/50 shadow-lg"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Flame className="w-4 h-4 text-red-500" />
                  </motion.div>
                  <span className="text-xs font-black text-red-400 tracking-wider">
                    {selectedOffer.badgeText || "LIMITED TIME OFFER"}
                  </span>
                </motion.div>

                <motion.div
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-3xl sm:text-4xl font-black mb-2 text-white tracking-tight">
                    <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                      {selectedOffer.title}
                    </span>
                  </h2>
                </motion.div>

                <motion.p
                  variants={descriptionVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-base text-gray-300 mb-6 leading-relaxed"
                >
                  {selectedOffer.description || `Get ${discountText} on membership`}
                </motion.p>

                <motion.div className="space-y-3 mb-8">
                  {[
                    {
                      icon: Tag,
                      color: "green",
                      title: discountText,
                      subtitle:
                        selectedOffer.discountType === "percentage"
                          ? `Max discount ₹${selectedOffer.maxDiscount || "∞"}`
                          : `Flat ₹${selectedOffer.discountValue} off`,
                    },
                    selectedOffer.minAmount > 0 && {
                      icon: Zap,
                      color: "blue",
                      title: "MINIMUM PURCHASE",
                      subtitle: `₹${selectedOffer.minAmount} or more`,
                    },
                    isExpiringSoon && {
                      icon: Clock,
                      color: "purple",
                      title: "EXPIRING SOON",
                      subtitle: new Date(
                        selectedOffer.expiryDate
                      ).toLocaleDateString(),
                    },
                    {
                      icon: Gift,
                      color: "red",
                      title: "TOTAL SLOTS",
                      subtitle: `${selectedOffer.totalSlots} memberships available`,
                    },
                  ]
                    .filter(Boolean)
                    .map((item, idx) => (
                      <motion.div
                        key={idx}
                        custom={idx}
                        variants={infoCardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.02, x: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <motion.div
                          className={`p-2 rounded-lg bg-${item.color}-600/20`}
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <item.icon
                            className={`w-4 h-4 text-${item.color}-400`}
                          />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400">{item.subtitle}</p>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>

                <motion.div
                  variants={slotsVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-600/30 backdrop-blur-sm"
                >
                  <p className="text-xs text-gray-400 mb-1 font-medium tracking-wider">
                    MEMBERSHIPS REMAINING
                  </p>
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-3xl font-black text-red-500"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.65,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      {selectedOffer.totalSlots - remainingSlots}
                    </motion.span>
                    <span className="text-gray-500 font-medium">
                      /{selectedOffer.totalSlots}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-neutral-800/80 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageUsed}%` }}
                      transition={{
                        delay: 0.7,
                        duration: 1.2,
                        ease: [0.34, 1.2, 0.64, 1],
                      }}
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                    />
                  </div>

                  {associatedCoupon && associatedCoupon.usageLimit > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.85 }}
                      className="text-xs text-gray-400 mt-2"
                    >
                      Coupon used: {associatedCoupon.usedCount || 0}/
                      {associatedCoupon.usageLimit} times
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleGetOffer}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 font-black text-white tracking-wider text-sm shadow-lg shadow-red-600/30"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-red-800 via-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <motion.span
                      className="relative flex items-center justify-center gap-2"
                      whileHover={{ gap: "0.75rem" }}
                    >
                      CLAIM YOUR {discountText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.span>
                  </motion.button>

                  <motion.button
                    variants={secondaryButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-black text-white text-sm transition-all duration-200"
                  >
                    MAYBE LATER
                  </motion.button>
                </motion.div>

                <motion.p
                  variants={footerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 text-center text-xs text-gray-500"
                >
                  Limited time offer • Valid for{" "}
                  {selectedOffer.category.toLowerCase()}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}