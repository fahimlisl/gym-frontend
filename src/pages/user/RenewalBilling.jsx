import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import useRazorpay from "../../hooks/useRazorpay";

const RenewalBilling = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { planId } = useParams();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [ref, setRef] = useState("");
  const {
    handlePayment,
    loading: paymentLoading,
    error: paymentError,
    setError: setPaymentError,
  } = useRazorpay();

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/plans/sub/fetch/${planId}`);
        const planData = response.data.data;
        setPlan(planData);
        setFinalPrice(planData.finalPrice);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load plan details");
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const handleBack = () => {
    navigate("/member/renewal-plans");
  };

  const applyCoupon = async () => {
    if (!couponInput) {
      toast.error("Enter coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const res = await api.post("/user/coupon", {
        code: couponInput,
      });

      const c = res.data.data;

      if (!c) {
        throw new Error("Coupon not found, contact administration!");
      }

      if (!c.isActive) {
        throw new Error("Coupon is not active! Contact administrator");
      }

      if (c.category !== "SUBSCRIPTION") {
        throw new Error("Coupon is not applicable for subscriptions");
      }

      if (c.minCartAmount > plan.finalPrice) {
        throw new Error(
          "Coupon is not applicable, minimum cart amount not met!",
        );
      }

      let final;
      let discountAmount;

      if (c.typeOfCoupon === "flat") {
        discountAmount = c.value;
        final = plan.finalPrice - discountAmount;
      } else if (c.typeOfCoupon === "percentage") {
        if (c.maxDiscount < (plan.finalPrice * c.value) / 100) {
          discountAmount = c.maxDiscount;
          final = plan.finalPrice - discountAmount;
        } else {
          discountAmount = (plan.finalPrice * c.value) / 100;
          final = plan.finalPrice - discountAmount;
        }
      }

      setDiscount(discountAmount);
      setFinalPrice(final);
      setAppliedCoupon(c);
      toast.success("Coupon applied successfully");
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
    setFinalPrice(plan.finalPrice);
    toast("Coupon removed");
  };

  const handleProceedToPayment = async () => {
    if (!plan) {
      toast.error("Plan not loaded");
      return;
    }

    const generatedRef = `RENEWAL-${Date.now()}`;
    setRef(generatedRef);

    const user = await api.get(`/user/${"getProfile"}`)
    const d = user.data.data;

    await handlePayment({
      amount: finalPrice,
      productName: `PT Renewal - ${plan.title}`,
      userEmail: d.email,
      userName: d.username, 
      userPhone: d.phoneNumber,
      onSuccess: async (paymentResult) => {
        setPaymentStatus({
          status: "processing",
          message: "Processing your renewal...",
        });

        try {
          console.log("📝 Creating renewal subscription after payment...");
          console.log("Payment ID:", paymentResult.paymentId);
          console.log("Order ID:", paymentResult.orderId);

          const renewalResponse = await api.post(
            `/user/subscription/renewal/${planId}`,
            {
              coupon: appliedCoupon?.code || "",
              paymentMethod: "razorpay",
              paymentStatus: "paid",
              // startDate: new Date().toISOString(),
            },
          );

          console.log(
            "✅ Renewal subscription created:",
            renewalResponse.data.data,
          );

          setPaymentStatus({
            status: "success",
            message:
              "Payment successful! Your PT subscription has been renewed.",
          });

          toast.success("PT subscription renewed successfully!");

          setTimeout(() => {
            navigate("/member/dashboard");
          }, 2000);
        } catch (err) {
          console.error("❌ Error processing renewal:", err);
          setPaymentStatus({
            status: "error",
            message: `Error: ${err.message}`,
          });
          toast.error(err?.response?.data?.message || err.message);
        }
      },
      onError: (err) => {
        console.error("❌ Payment error:", err);
        setPaymentStatus({
          status: "error",
          message: `Payment failed: ${err.message}`,
        });
        toast.error(`Payment failed: ${err.message}`);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-red-500 text-4xl mb-4">⟳</div>
          <p className="text-red-500 text-sm font-light tracking-wider">
            Loading plan details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-sm font-light tracking-wider">
          {error}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-sm font-light tracking-wider">
          Plan not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-12 sm:px-6 lg:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        .text-title {
          font-family: 'Space Grotesk', sans-serif;
        }

        .input-field {
          transition: all 0.3s ease;
        }

        .input-field:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
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

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .animate-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .benefit-item {
          animation: slideInUp 0.4s ease-out forwards;
        }

        .benefit-item:nth-child(1) { animation-delay: 0.1s; }
        .benefit-item:nth-child(2) { animation-delay: 0.2s; }
        .benefit-item:nth-child(3) { animation-delay: 0.3s; }
        .benefit-item:nth-child(4) { animation-delay: 0.4s; }
        .benefit-item:nth-child(5) { animation-delay: 0.5s; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 text-sm font-semibold"
        >
          <span className="text-lg">←</span>
          BACK TO PLANS
        </button>

        <div className="mb-12 sm:mb-16 animate-in-up">
          <h1 className="text-title text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-3">
            Renew Your Subscription
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Complete your payment to extend your training subscription
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="animate-in-left">
            <div className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

              <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 card-hover">
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                    Subscription Plan
                  </span>
                </div>

                <h2 className="text-title text-2xl sm:text-3xl font-black mb-3 text-white">
                  {plan.title}
                </h2>

                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                  {plan.bio}
                </p>

                <div className="mb-2">
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                    ₹{plan.finalPrice.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="inline-block bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-2 mb-8">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-widest">
                    {plan.duration}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-red-600/20 via-red-600/10 to-transparent mb-8"></div>

                <div className="space-y-4">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">
                    What's Included
                  </p>
                  {plan.benefits?.map((b) => (
                    <div
                      key={b._id}
                      className="benefit-item flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                          <span className="text-xs font-bold text-black">
                            ✓
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 leading-relaxed">
                        {b.heading}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

              <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 flex flex-col">
                <h3 className="text-title text-xl sm:text-2xl font-black mb-8 text-white">
                  Renewal Information
                </h3>

                <div className="mb-6">
                  <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                    Apply Coupon Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={appliedCoupon}
                      className="input-field flex-1 bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm placeholder-gray-500 text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    {!appliedCoupon ? (
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="button-glow w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/50 text-white font-bold text-sm rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
                      >
                        {couponLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⟳</span> CHECKING
                          </span>
                        ) : (
                          "APPLY"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={removeCoupon}
                        className="w-full sm:w-auto px-6 py-3 bg-neutral-800/50 border border-red-500/50 text-red-400 font-bold text-sm rounded-lg hover:bg-red-500/10 transition-all duration-300 whitespace-nowrap"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>

                  {appliedCoupon && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-xs text-green-400 font-semibold">
                        ✓ Coupon{" "}
                        <span className="font-bold">{appliedCoupon.code}</span>{" "}
                        applied
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                    Payment Method
                  </label>
                  <div className="bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm text-white">
                    Razorpay (Secure Payment)
                  </div>
                </div>

                <div className="bg-neutral-800/30 border border-white/5 rounded-xl p-4 sm:p-6 mb-6">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-4">
                    Renewal Amount
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Plan Price</span>
                      <span className="font-semibold text-white">
                        ₹{plan.finalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="h-px bg-gradient-to-r from-green-600/20 to-transparent"></div>
                    )}

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-400">
                        <span>Coupon Discount</span>
                        <span className="font-bold">
                          - ₹{discount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-gradient-to-r from-red-600/20 to-transparent"></div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-title font-black text-lg">
                        Total Amount
                      </span>
                      <span className="text-title font-black text-lg bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                        ₹{finalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {paymentStatus && (
                  <div
                    className={`p-4 rounded-lg mb-6 ${
                      paymentStatus.status === "success"
                        ? "bg-green-500/10 border border-green-500/30"
                        : paymentStatus.status === "processing"
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        paymentStatus.status === "success"
                          ? "text-green-400"
                          : paymentStatus.status === "processing"
                            ? "text-blue-400"
                            : "text-red-400"
                      }`}
                    >
                      {paymentStatus.message}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading}
                  className="button-glow w-full py-4 px-4 font-extrabold tracking-wider uppercase text-sm bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin">⟳</span>
                      PROCESSING PAYMENT
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      PROCEED TO PAYMENT
                      <span>→</span>
                    </span>
                  )}
                </button>

                {paymentError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400">{paymentError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalBilling;