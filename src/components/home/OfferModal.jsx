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
      const activeOffers = offers.filter(o => {
        if (o.isActive !== true) return false;
        
        if (o.startDate && new Date(o.startDate) > now) return false;
        if (o.expiryDate && new Date(o.expiryDate) < now) return false;
        
        return true;
      });
      
      
      if (activeOffers.length > 0) {
        const timer = setTimeout(() => {
          const randomOffer = activeOffers[Math.floor(Math.random() * activeOffers.length)];
          setSelectedOffer(randomOffer);
          
          const coupon = coupons.find(c => c.code === randomOffer.coupon);
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
      const couponCodes = [...new Set(offersData.map(o => o.coupon).filter(Boolean))];
      
      if (couponCodes.length > 0) {
        const couponPromises = couponCodes.map(code => 
          api.post("/general/coupon", { code }).catch(() => null)
        );
        
        const couponResults = await Promise.all(couponPromises);
        const fetchedCoupons = couponResults
          .filter(res => res && res.data && res.data.data)
          .map(res => res.data.data);
        
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
    const coupon = coupons.find(c => c.code === offer.coupon);
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
  
  const isExpiringSoon = selectedOffer.expiryDate && 
    new Date(selectedOffer.expiryDate) - new Date() < 7 * 24 * 60 * 60 * 1000;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-red-600/30 shadow-2xl">
              <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
              </div>

              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-red-600 to-transparent" />
              </div>

              {/* Close Button */}
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {/* <X className="w-5 h-5 text-gray-400" /> */}
              {/* </motion.button> */} 

              <div className="relative z-10 p-8 sm:p-10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/50"
                >
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-black text-red-400 tracking-wider">
                    {selectedOffer.badgeText || "LIMITED TIME OFFER"}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-black mb-2 text-white tracking-tight">
                    <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent">
                      {selectedOffer.title}
                    </span>
                  </h2>
                  <p className="text-base text-gray-300 mb-6">
                    {selectedOffer.description || `Get ${discountText} on membership`}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 mb-8"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-green-600/20">
                      <Tag className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white">{discountText}</p>
                      <p className="text-xs text-gray-500">
                        {selectedOffer.discountType === "percentage" 
                          ? `Max discount ₹${selectedOffer.maxDiscount || '∞'}` 
                          : `Flat ₹${selectedOffer.discountValue} off`}
                      </p>
                    </div>
                  </div>

                  {selectedOffer.minAmount > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="p-2 rounded-lg bg-blue-600/20">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">MINIMUM PURCHASE</p>
                        <p className="text-xs text-gray-500">₹{selectedOffer.minAmount} or more</p>
                      </div>
                    </div>
                  )}

                  {isExpiringSoon && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="p-2 rounded-lg bg-purple-600/20">
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">EXPIRING SOON</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedOffer.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-red-600/20">
                      <Gift className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white">TOTAL SLOTS</p>
                      <p className="text-xs text-gray-500">{selectedOffer.totalSlots} memberships available</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 p-4 rounded-xl bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-600/30"
                >
                  <p className="text-xs text-gray-400 mb-1 font-medium">MEMBERSHIPS REMAINING</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-red-500">{associatedCoupon.usedCount}</span>
                    <span className="text-gray-500">/{selectedOffer.totalSlots}</span>
                  </div>
                  <div className="mt-3 w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageUsed}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                    />
                  </div>

                  {associatedCoupon && associatedCoupon.usageLimit > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Coupon used: {associatedCoupon.usedCount || 0}/{associatedCoupon.usageLimit} times
                    </p>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGetOffer}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 font-black text-white tracking-wider text-sm transition-all duration-300"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2">
                      CLAIM YOUR {discountText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="w-full px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-black text-white text-sm transition-all duration-300"
                  >
                    MAYBE LATER
                  </motion.button>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 text-center text-xs text-gray-500"
                >
                  Limited time offer • Valid for {selectedOffer.category.toLowerCase()}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}