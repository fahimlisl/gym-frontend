import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import useRazorpay from "../../hooks/useRazorpay";

export default function PTBilling() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { handlePayment, loading: paymentLoading, error: paymentError, setError: setPaymentError } = useRazorpay();

  const [plan, setPlan] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const res = await api.get(`/user/plans/pt/fetch/${planId}`);
      const p = res.data.data;
      setPlan(p);
      setFinalPrice(p.finalPrice);
    } catch {
      toast.error("Failed to load plan");
    }
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
        throw new Error("coupon isn't able to find, contact administration!");
      }

      if (!c.isActive) {
        throw new Error("coupon is not active! contact administrator");
      }

      if (c.category !== "PERSONAL TRAINING") {
        throw new Error("coupon is not applicable on this category");
      }

      if (c.minCartAmount > plan.finalPrice) {
        throw new Error(
          "coupon is not applicable, minimum Cart amount must exceed!"
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
          discountAmount = Math.round((plan.finalPrice * c.value) / 100);
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
    const generatedRef = `PT-${Date.now()}`;
    setRef(generatedRef);
    const user = await api.get(`/user/${"getProfile"}`)
    const d = user.data.data;

    await handlePayment({
      amount: Math.round(finalPrice),
      productName: `Personal Training - ${plan.title}`,
      userEmail: d.email,
      userName: d.username,
      userPhone: d.phoneNumber,
      onSuccess: async (paymentResult) => {
        setPaymentStatus({
          status: "processing",
          message: "Processing your request...",
        });

        try {
          if(process.env.NODE_ENV === "development"){
            console.log("📝 Creating PT request after payment...");
            console.log("Payment ID:", paymentResult.paymentId);
            console.log("Order ID:", paymentResult.orderId);
          }

          const billResponse = await api.post(
            `/user/pt/request/${planId}`,
            {
              coupon: appliedCoupon?.code || "",
              paymentMethod: "razorpay",
              ref: generatedRef,
              paymentId: paymentResult.paymentId,
              orderId: paymentResult.orderId,
            }
          );
          if(process.env.NODE_ENV==="development"){
            console.log("✅ PT Bill created:", billResponse.data.data);
          }

          if (!billResponse.ok && billResponse.status !== 200) {
            throw new Error("Failed to create PT request");
          }

          const tempBillId = billResponse.data.data._id;

          if(process.env.NODE_ENV==="development"){
            console.log("📝 Auto-approving PT request...");
          }
          const approveResponse = await api.post(
            `/user/pt/request/approval/${tempBillId}`,
            {}
          );
          if(process.env.NODE_ENV==="development"){
            console.log("✅ PT request approved:", approveResponse.data.data);
          }

          setPaymentStatus({
            status: "success",
            message: "Payment successful! Your PT plan is now active.",
          });

          toast.success("PT plan activated successfully!");

          setTimeout(() => {
            navigate("/member/dashboard");
          }, 2000);
        } catch (err) {
          console.error("❌ Error processing request:", err);
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

  if (success) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');
          .pt-billing-root, .pt-billing-root * {
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
          }
          .pt-billing-root {
            font-family: 'Poppins', sans-serif;
            overflow-x: hidden;
            max-width: 100%;
          }
        `}</style>
        <div className="pt-billing-root min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-green-500/30 rounded-full blur-2xl"></div>
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/40 flex items-center justify-center animate-pulse">
              <span className="text-5xl">✓</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4 text-center">
            PAYMENT SUCCESSFUL
          </h2>

          <p className="text-gray-300 max-w-lg text-center text-sm sm:text-base leading-relaxed mb-8 px-4">
            Your personal training plan has been activated successfully. You can now select your trainer from the dashboard.
          </p>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="animate-spin">⚙️</div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <style>{`
          .pt-billing-root, .pt-billing-root * { box-sizing: border-box; }
          .pt-billing-root { overflow-x: hidden; max-width: 100%; }
        `}</style>
        <div className="pt-billing-root min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin text-red-500 text-4xl mb-4">⟳</div>
            </div>
            <p className="text-gray-400 font-medium">LOADING PLAN...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');

        /* ── Reset: fix horizontal overflow on all browsers incl. Safari ── */
        .pt-billing-root,
        .pt-billing-root * {
          box-sizing: border-box;
          -webkit-text-size-adjust: 100%;
          min-width: 0;
        }

        .pt-billing-root {
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
          width: 100%;
          max-width: 100%;
        }

        .pt-text-title {
          font-family: 'Space Grotesk', sans-serif;
        }

        .pt-input-field {
          transition: all 0.3s ease;
          width: 100%;
          min-width: 0;
        }

        .pt-input-field:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
          outline: none;
        }

        /* Safari: remove default input appearance */
        .pt-input-field {
          -webkit-appearance: none;
          appearance: none;
        }

        .pt-button-glow {
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .pt-button-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .pt-button-glow:hover::before {
          left: 100%;
        }

        @keyframes pt-slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pt-slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .pt-animate-in-up   { animation: pt-slideInUp  0.6s ease-out forwards; }
        .pt-animate-in-left { animation: pt-slideInLeft 0.6s ease-out forwards; }

        .pt-card-hover { transition: all 0.3s ease; }
        @media (hover: hover) {
          .pt-card-hover:hover {
            transform: translateY(-5px);
            border-color: rgba(239, 68, 68, 0.5);
          }
        }

        .pt-benefit-item { animation: pt-slideInUp 0.4s ease-out forwards; opacity: 0; }
        .pt-benefit-item:nth-child(1) { animation-delay: 0.1s; }
        .pt-benefit-item:nth-child(2) { animation-delay: 0.2s; }
        .pt-benefit-item:nth-child(3) { animation-delay: 0.3s; }
        .pt-benefit-item:nth-child(4) { animation-delay: 0.4s; }
        .pt-benefit-item:nth-child(5) { animation-delay: 0.5s; }

        /* ── Coupon row: stack on small screens ── */
        .pt-coupon-row {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }

        .pt-coupon-row input {
          flex: 1 1 0%;
          min-width: 0;
        }

        .pt-coupon-btn {
          flex-shrink: 0;
          white-space: nowrap;
        }

        @media (max-width: 400px) {
          .pt-coupon-row {
            flex-direction: column;
          }
          .pt-coupon-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="pt-billing-root min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black py-8 sm:py-12"
           style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

          {/* Back button */}
          <button
            onClick={() => navigate("/member/pt-plans")}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 text-sm font-semibold pt-button-glow"
          >
            <span className="text-lg">←</span>
            BACK TO PLANS
          </button>

          {/* Heading */}
          <div className="mb-10 sm:mb-14 pt-animate-in-up">
            <h1 className="pt-text-title text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-3">
              Personal Training
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Complete your payment to activate your training plan
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(1, 1fr)' }}
               className="lg:!grid-cols-2">

            {/* ── Plan Card ── */}
            <div className="pt-animate-in-left">
              <div className="group relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-5 sm:p-8 pt-card-hover h-full">

                  <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Premium Plan</span>
                  </div>

                  <h2 className="pt-text-title text-2xl sm:text-3xl font-black mb-3 text-white break-words">
                    {plan.title}
                  </h2>

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 break-words">
                    {plan.bio}
                  </p>

                  <div className="mb-2">
                    <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                      ₹{plan.finalPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="inline-block bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-2 mb-8">
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-widest">
                      {plan.duration}
                    </p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-red-600/20 via-red-600/10 to-transparent mb-8"></div>

                  <div className="space-y-4">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">What's Included</p>
                    {plan.benefits?.map((b) => (
                      <div key={b._id} className="pt-benefit-item flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                            <span className="text-xs font-bold text-black">✓</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-300 leading-relaxed break-words min-w-0">
                          {b.heading}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Payment Card ── */}
            <div className="pt-animate-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="group relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-5 sm:p-8 flex flex-col">

                  <h3 className="pt-text-title text-xl sm:text-2xl font-black mb-8 text-white">
                    Payment Details
                  </h3>

                  {/* Coupon */}
                  <div className="mb-6">
                    <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Apply Coupon Code
                    </label>

                    <div className="pt-coupon-row">
                      <input
                        placeholder="ENTER COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={!!appliedCoupon}
                        className="pt-input-field bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm placeholder-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />

                      {!appliedCoupon ? (
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="pt-coupon-btn pt-button-glow px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/50 text-white font-bold text-sm rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {couponLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⟳</span> CHECKING
                            </span>
                          ) : 'APPLY'}
                        </button>
                      ) : (
                        <button
                          onClick={removeCoupon}
                          className="pt-coupon-btn px-6 py-3 bg-neutral-800/50 border border-red-500/50 text-red-400 font-bold text-sm rounded-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>

                    {appliedCoupon && (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-xs text-green-400 font-semibold break-words">
                          ✓ Coupon <span className="font-bold">{appliedCoupon.code}</span> applied
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment method */}
                  <div className="mb-6">
                    <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Payment Method
                    </label>
                    <div className="bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm text-white">
                      Razorpay (Secure Payment)
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-neutral-800/30 border border-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-4">
                      Price Breakdown
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-gray-400">Base Price</span>
                        <span className="font-semibold text-white flex-shrink-0">
                          ₹{plan.finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {discount > 0 && (
                        <>
                          <div className="h-px bg-gradient-to-r from-green-600/20 to-transparent"></div>
                          <div className="flex justify-between items-center gap-4 text-green-400">
                            <span>Discount Applied</span>
                            <span className="font-bold flex-shrink-0">
                              - ₹{discount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="h-px bg-gradient-to-r from-red-600/20 to-transparent"></div>

                      <div className="flex justify-between items-center pt-2 gap-4">
                        <span className="pt-text-title font-black text-lg">Total</span>
                        <span className="pt-text-title font-black text-lg bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent flex-shrink-0">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment status */}
                  {paymentStatus && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      paymentStatus.status === "success"
                        ? "bg-green-500/10 border border-green-500/30"
                        : paymentStatus.status === "processing"
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}>
                      <p className={`text-sm font-semibold break-words ${
                        paymentStatus.status === "success"
                          ? "text-green-400"
                          : paymentStatus.status === "processing"
                          ? "text-blue-400"
                          : "text-red-400"
                      }`}>
                        {paymentStatus.message}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={handleProceedToPayment}
                    disabled={paymentLoading || loading}
                    className="pt-button-glow w-full py-4 px-4 font-extrabold tracking-wider uppercase text-sm bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="animate-spin">⟳</span>
                        PROCESSING PAYMENT
                      </span>
                    ) : loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="animate-spin">⟳</span>
                        ACTIVATING PLAN
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
                      <p className="text-xs text-red-400 break-words">{paymentError}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}