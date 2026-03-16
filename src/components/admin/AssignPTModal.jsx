import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Loader, ChevronRight, Award, Clock, Sparkles, AlertCircle } from "lucide-react";
import { fetchAllTrainers, assignPT } from "../../api/admin.api.js";
import api from "../../api/axios.api";

export default function AssignPTModal({ userId, onClose, onSuccess }) {
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [trainerId, setTrainerId] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    loadInitialData();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      setFinalPrice(selectedPlan.finalPrice);
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponInput("");
    }
  }, [selectedPlan]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [trainersRes, plansRes] = await Promise.all([
        fetchAllTrainers(),
        api.get("/admin/plan/pt/fetch/all"),
      ]);
      setTrainers(trainersRes.data.data || []);
      setPlans(plansRes.data.data || []);
      if (plansRes.data.data?.length > 0) {
        setSelectedPlan(plansRes.data.data[0]);
        setFinalPrice(plansRes.data.data[0].finalPrice);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setInitialLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Enter coupon code");
      return;
    }

    if (!selectedPlan) {
      toast.error("Select a plan first");
      return;
    }

    try {
      setCouponLoading(true);
      const res = await api.post("/admin/coupon", {
        code: couponInput,
      });

      const coupon = res.data.data;

      if (!coupon) {
        throw new Error("Coupon not found. Contact administration!");
      }

      if (!coupon.isActive) {
        throw new Error("Coupon is inactive. Contact administrator.");
      }

      if (coupon.category !== "PERSONAL TRAINING") {
        throw new Error("Coupon not applicable for this category");
      }

      if (coupon.minCartAmount > selectedPlan.finalPrice) {
        throw new Error(
          `Minimum cart amount must be ₹${coupon.minCartAmount}`
        );
      }

      let discountAmount = 0;
      let final = selectedPlan.finalPrice;

      if (coupon.typeOfCoupon === "flat") {
        discountAmount = coupon.value;
        final = selectedPlan.finalPrice - discountAmount;
      } else if (coupon.typeOfCoupon === "percentage") {
        const percentageDiscount = (selectedPlan.finalPrice * coupon.value) / 100;
        discountAmount = Math.min(percentageDiscount, coupon.maxDiscount);
        final = selectedPlan.finalPrice - discountAmount;
      }

      setDiscount(discountAmount);
      setFinalPrice(final);
      setAppliedCoupon(coupon);
      toast.success("Coupon applied successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setDiscount(0);
    setFinalPrice(selectedPlan.finalPrice);
    toast("Coupon removed");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!trainerId) {
      toast.error("Select a trainer");
      return;
    }

    if (!selectedPlan) {
      toast.error("Select a plan");
      return;
    }

    try {
      setLoading(true);

      const formData = {
        price: finalPrice,
        coupon: appliedCoupon?.code || "",
        paymentMethod,
        ref: refId || "",
      };

      await api.post(
        `/admin/personal-training/${userId}/${trainerId}/${selectedPlan._id}`,
        formData
      );

      toast.success("Personal training assigned successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign PT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 z-[9999] flex items-center justify-end pointer-events-none pr-4 md:pr-8">
        <div className="pointer-events-auto w-full max-w-2xl md:max-w-3xl max-h-[95vh] overflow-hidden rounded-3xl bg-gradient-to-br from-black via-neutral-900 to-black border border-red-600/20 shadow-2xl shadow-red-600/20 flex flex-col">
          
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');

            * {
              font-family: 'Poppins', sans-serif;
            }

            .text-title {
              font-family: 'Space Grotesk', sans-serif;
            }

            .plan-card {
              transition: all 0.3s ease;
              cursor: pointer;
            }

            .plan-card:hover {
              transform: translateY(-4px);
              border-color: rgba(239, 68, 68, 0.5);
            }

            .plan-card.active {
              background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
              border-color: rgba(239, 68, 68, 0.6);
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
            }

            .input-field {
              transition: all 0.3s ease;
            }

            .input-field:focus {
              border-color: #ef4444 !important;
              box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }

            .benefit-item {
              animation: slideInUp 0.4s ease-out forwards;
            }

            .benefit-item:nth-child(1) { animation-delay: 0.05s; }
            .benefit-item:nth-child(2) { animation-delay: 0.1s; }
            .benefit-item:nth-child(3) { animation-delay: 0.15s; }
            .benefit-item:nth-child(4) { animation-delay: 0.2s; }

            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .button-glow {
              position: relative;
              overflow: hidden;
            }

            .button-glow::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.5s ease;
            }

            .button-glow:hover::before {
              left: 100%;
            }

            .modal-scroll {
              overflow-y: auto;
              scroll-behavior: smooth;
            }

            .modal-scroll::-webkit-scrollbar {
              width: 6px;
            }

            .modal-scroll::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }

            .modal-scroll::-webkit-scrollbar-thumb {
              background: rgba(239, 68, 68, 0.3);
              border-radius: 10px;
            }

            .modal-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(239, 68, 68, 0.5);
            }
          `}</style>

          <div className="sticky top-0 z-50 backdrop-blur bg-gradient-to-b from-black/95 to-black/50 border-b border-red-600/10 px-6 lg:px-8 py-5 flex-shrink-0">
            <div className="flex justify-between items-start gap-6">
              <div>
                <h2 className="text-title text-2xl lg:text-3xl font-black tracking-tighter text-white mb-1">
                  ASSIGN PERSONAL TRAINING
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 tracking-widest uppercase font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Complete the form to assign PT to member
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="modal-scroll flex-1 overflow-hidden">
            {initialLoading ? (
              <div className="flex justify-center items-center h-96 px-6 lg:px-8 py-10">
                <div className="text-center">
                  <Loader className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-semibold">LOADING DATA...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  <div className="lg:col-span-2 space-y-8">

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
                        <label className="block text-xs uppercase font-black text-white tracking-widest">
                          Step 1: Select Trainer
                        </label>
                      </div>
                      <select
                        value={trainerId}
                        onChange={(e) => setTrainerId(e.target.value)}
                        className="input-field w-full bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-xl text-sm lg:text-base text-white outline-none hover:border-red-600/30 focus:border-red-600 transition-all"
                      >
                        <option value="" className="bg-neutral-900">
                          Choose a trainer...
                        </option>
                        {trainers.map((trainer) => (
                          <option key={trainer._id} value={trainer._id} className="bg-neutral-900">
                            {trainer.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
                        <label className="block text-xs uppercase font-black text-white tracking-widest">
                          Step 2: Select Training Plan
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map((plan, idx) => (
                          <div
                            key={plan._id}
                            onClick={() => setSelectedPlan(plan)}
                            className={`plan-card group relative p-4 lg:p-5 rounded-2xl border-2 transition-all overflow-hidden ${
                              selectedPlan?._id === plan._id
                                ? "border-red-600/60 bg-gradient-to-br from-red-500/10 to-red-600/5"
                                : "border-red-600/20 bg-neutral-800/30 hover:bg-neutral-800/50"
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {idx === 1 && (
                              <div className="absolute -top-3 right-4 z-10">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-50" />
                                  <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/40">
                                    <Award className="w-2.5 h-2.5" />
                                    POPULAR
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedPlan?._id === plan._id && (
                              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 z-5">
                                <span className="text-white font-black text-sm">✓</span>
                              </div>
                            )}

                            <div className="relative z-10">
                              <div className="mb-3">
                                <h3 className="font-black text-white text-base lg:text-lg tracking-tight mb-1">
                                  {plan.title}
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                  {plan.bio}
                                </p>
                              </div>

                              <div className="mb-3 pb-3 border-b border-red-600/10">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl lg:text-3xl font-black text-red-400">
                                    ₹{plan.finalPrice.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {plan.duration}
                                  </span>
                                </div>
                              </div>

                              {plan.benefits && plan.benefits.length > 0 && (
                                <div className="space-y-1.5">
                                  {plan.benefits.slice(0, 2).map((benefit, bidx) => (
                                    <div
                                      key={benefit._id}
                                      className="benefit-item flex items-start gap-2"
                                      style={{ animationDelay: `${bidx * 0.1}s` }}
                                    >
                                      <ChevronRight className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-gray-300 line-clamp-1">
                                        {benefit.heading}
                                      </span>
                                    </div>
                                  ))}
                                  {plan.benefits.length > 2 && (
                                    <p className="text-xs text-gray-500 italic">
                                      +{plan.benefits.length - 2} more
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPlan && (
                      <div className="space-y-3 p-4 lg:p-5 rounded-2xl border border-red-600/15 bg-gradient-to-br from-red-500/5 to-red-600/5">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-800 rounded-full"></div>
                          <label className="block text-xs uppercase font-black text-white tracking-widest">
                            Step 3: Apply Coupon (Optional)
                          </label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            placeholder="Enter coupon code..."
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            disabled={appliedCoupon}
                            className="input-field flex-1 bg-neutral-800/50 border border-white/10 px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          />

                          {!appliedCoupon ? (
                            <button
                              type="button"
                              onClick={applyCoupon}
                              disabled={couponLoading || !couponInput.trim()}
                              className="button-glow px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/50 text-white font-black text-xs lg:text-sm rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
                            >
                              {couponLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader className="w-3 h-3 animate-spin" /> CHECKING
                                </span>
                              ) : (
                                "APPLY"
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={removeCoupon}
                              className="px-6 py-2.5 bg-neutral-800/50 border border-red-500/50 text-red-400 font-black text-xs lg:text-sm rounded-lg hover:bg-red-500/10 transition-all duration-300 whitespace-nowrap"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>

                        {appliedCoupon && (
                          <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-green-400 font-black">
                                Coupon Applied!
                              </p>
                              <p className="text-xs text-green-300 mt-0.5">
                                {appliedCoupon.code} • Save ₹{discount.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="lg:col-span-1 space-y-5">
                    {selectedPlan && (
                      <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-red-600/20 rounded-2xl p-5 space-y-4">
                        <div>
                          <p className="text-xs uppercase font-black text-gray-500 tracking-widest mb-3">
                            💰 Price Breakdown
                          </p>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Plan Price</span>
                              <span className="font-bold text-white">
                                ₹{selectedPlan.finalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {discount > 0 && (
                              <>
                                <div className="h-px bg-gradient-to-r from-green-600/20 to-transparent"></div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-green-400 font-medium">Discount</span>
                                  <span className="font-bold text-green-400">
                                    - ₹{discount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </>
                            )}

                            <div className="h-px bg-gradient-to-r from-red-600/20 to-transparent"></div>

                            <div className="flex justify-between items-center pt-1">
                              <span className="text-title font-black text-sm text-white">Total</span>
                              <span className="text-title font-black text-lg bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                                ₹{finalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {discount > 0 && (
                          <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-lg p-3">
                            <p className="text-xs text-green-400 font-black">
                              💚 You're saving ₹{discount.toLocaleString('en-IN')}!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <label className="block text-xs uppercase font-black text-white tracking-widest">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="input-field w-full bg-neutral-800/50 border border-white/10 px-4 py-2.5 rounded-lg text-sm text-white outline-none hover:border-red-600/30 focus:border-red-600"
                      >
                        <option value="cash" className="bg-neutral-900">
                          💵 Cash Payment
                        </option>
                        <option value="upi" className="bg-neutral-900">
                          📱 UPI Transfer
                        </option>
                        <option value="card" className="bg-neutral-900">
                          💳 Card Payment
                        </option>
                        <option value="netbanking" className="bg-neutral-900">
                          🏦 Netbanking
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-xs uppercase font-black text-white tracking-widest">
                        Reference ID <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Transaction ID / UTR..."
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                        className="input-field w-full bg-neutral-800/50 border border-white/10 px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 text-white outline-none hover:border-red-600/30 focus:border-red-600"
                      />
                    </div>

                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3.5">
                      <p className="text-xs text-blue-300 leading-relaxed">
                        <span className="font-black block mb-1">ℹ️ Important</span>
                        Verify all details before submitting. Member will be notified upon assignment.
                      </p>
                    </div>

                  </div>

                </div>
              </form>
            )}
          </div>

          <div className="sticky bottom-0 z-50 border-t border-red-600/10 bg-gradient-to-t from-black/95 to-black/50 backdrop-blur px-6 lg:px-8 py-4 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-white/20 text-white font-black text-sm hover:bg-white/5 transition-all duration-300 uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={loading || !trainerId || !selectedPlan}
              className="button-glow px-8 py-3 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-black text-sm rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wider flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> ASSIGNING...
                </>
              ) : (
                <>
                  ASSIGN TRAINING <span>→</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}