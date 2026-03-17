import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

export default function PTBilling() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [ref, setRef] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const submit = async () => {
    if (!image) {
      toast.error("Upload payment proof");
      return;
    }

    const form = new FormData();
    form.append("coupon", appliedCoupon?.code || "");
    form.append("paymentMethod", paymentMethod);
    form.append("ref", ref);
    form.append("image", image);

    try {
      setLoading(true);
      await api.post(`/user/pt/request/${planId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/member/dashboard");
      }, 4000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-green-500/30 rounded-full blur-2xl"></div>
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/40 flex items-center justify-center animate-pulse">
              <span className="text-5xl">✓</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4 text-center">
            REQUEST SUBMITTED
          </h2>

          <p className="text-gray-300 max-w-lg text-center text-sm sm:text-base leading-relaxed mb-8">
            Your personal training request has been submitted successfully. Our team will review your payment and approve it shortly.
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
        <div className="min-h-screen flex items-center justify-center">
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

        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #1a1a1a, #0f0f0f) border-box;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          padding: 1px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(239, 68, 68, 0.2));
          border-radius: 12px;
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

        .file-input-wrapper {
          position: relative;
        }

        .file-input-wrapper input[type='file'] {
          display: none;
        }

        .file-upload-zone {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-upload-zone:hover {
          background-color: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .file-upload-zone.active {
          background-color: rgba(239, 68, 68, 0.1);
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
      `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/member/pt-plans")}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 text-sm font-semibold"
          >
            <span className="text-lg">←</span>
            BACK TO PLANS
          </button>

          <div className="mb-12 sm:mb-16 animate-in-up">
            <h1 className="text-title text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-3">
              Personal Training
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Complete your payment to unlock your training journey
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="animate-in-left">
              <div className="group relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 card-hover">
                  <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Premium Plan</span>
                  </div>

                  <h2 className="text-title text-2xl sm:text-3xl font-black mb-3 text-white">
                    {plan.title}
                  </h2>

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
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
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">
                      What's Included
                    </p>
                    {plan.benefits?.map((b, idx) => (
                      <div
                        key={b._id}
                        className="benefit-item flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                            <span className="text-xs font-bold text-black">✓</span>
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

            <div className="animate-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="group relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative bg-gradient-to-br from-neutral-900/80 to-black border border-red-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 flex flex-col">
                  <h3 className="text-title text-xl sm:text-2xl font-black mb-8 text-white">
                    Payment Details
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
                            'APPLY'
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
                          ✓ Coupon <span className="font-bold">{appliedCoupon.code}</span> applied
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Payment Reference
                    </label>
                    <input
                      placeholder="E.G., TRANSACTION ID OR UTR"
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      className="input-field w-full bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm placeholder-gray-500 text-white outline-none"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="input-field w-full bg-neutral-800/50 border border-white/10 px-4 py-3 rounded-lg text-sm text-white outline-none"
                    >
                      <option value="upi" className="bg-neutral-900">
                        UPI Transfer
                      </option>
                      <option value="cash" className="bg-neutral-900">
                        Cash Payment
                      </option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Payment Proof
                    </label>
                    <div className="file-input-wrapper">
                      <input
                        id="payment-proof-input"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImage(e.target.files[0]);
                            setPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="hidden"
                        accept="image/*"
                      />
                      <label
                        htmlFor="payment-proof-input"
                        className="file-upload-zone block border-2 border-dashed border-red-600/30 bg-red-500/5 p-6 sm:p-8 rounded-xl text-center cursor-pointer transition-all duration-300"
                      >
                        {preview ? (
                          <div className="space-y-4">
                            <img
                              src={preview}
                              className="h-24 sm:h-32 w-auto mx-auto rounded-lg border border-white/10 object-contain"
                              alt="Preview"
                            />
                            <p className="text-xs text-gray-400">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-3xl sm:text-4xl">📸</div>
                            <p className="text-sm font-semibold text-white">
                              Click to upload
                            </p>
                            <p className="text-xs text-gray-400">
                              or drag and drop
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-neutral-800/30 border border-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-4">
                      Price Breakdown
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Base Price</span>
                        <span className="font-semibold text-white">
                          ₹{plan.finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="h-px bg-gradient-to-r from-green-600/20 to-transparent"></div>
                      )}

                      {discount > 0 && (
                        <div className="flex justify-between items-center text-green-400">
                          <span>Discount Applied</span>
                          <span className="font-bold">
                            - ₹{discount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      <div className="h-px bg-gradient-to-r from-red-600/20 to-transparent"></div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-title font-black text-lg">Total</span>
                        <span className="text-title font-black text-lg bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={loading}
                    className="button-glow w-full py-4 px-4 font-extrabold tracking-wider uppercase text-sm bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="animate-spin">⟳</span>
                        SUBMITTING REQUEST
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        SUBMIT REQUEST
                        <span>→</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}