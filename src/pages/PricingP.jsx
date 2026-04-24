import { useState, useEffect, useRef } from "react";
import PricingCard from "../components/pricing/PricingCard";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchAllPlans } from "../api/general.api.js";
import useRazorpay from "../hooks/useRazorpay";
import toast from "react-hot-toast";
import api from "../api/axios.api.js";

export default function PricingP() {
  const navigate = useNavigate();
  const { handlePayment, loading, error, setError } = useRazorpay();
  const avatarInputRef = useRef(null);

  const ADMISSION_FEE = 1099;

  const [billing, setBilling] = useState("SUBSCRIPTION");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [offerDetails, setOfferDetails] = useState([]);

  const [avatarFile, setAvatarFile] = useState(null); // raw File object for FormData upload

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: null, // base64 preview only
    discount: 0,
    discountType: "flat",
    discountTypeOnAdFee: "flat",
    discountOnAdFee: 0,
    paymentMethod: "razorpay",
  });

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchAllPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans");
      }
    };

    const fetchOfferAvailable = async () => {
      try {
        const d = await api.get("/general/offer/fetch/all");
        setOfferDetails(d.data.data);
      } catch (error) {
        console.error("failed to load available offers", error);
      }
    };

    loadPlans();
    fetchOfferAvailable();
  }, []);

  const filteredPlans = plans?.filter((plan) => plan.category === billing);

  const handleStartNow = (plan) => {
    if (plan.category === "PT") {
      toast("An active membership is required before purchasing a PT plan.", {
        icon: "⚠️",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });
      navigate("/login");
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      avatar: null,
      discount: 0,
      discountType: "flat",
      discountTypeOnAdFee: "flat",
      discountOnAdFee: 0,
      paymentMethod: "razorpay",
    });
    setAvatarFile(null);
    setRegistrationStatus(null);
    setCouponCode(plan.duration === "yearly" ? "ADD1099" : "");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be under 2MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP images are allowed");
      e.target.value = "";
      return;
    }

    // Store raw File — sent via FormData to the backend (multer expects this)
    setAvatarFile(file);

    // Store base64 — used only for the preview circle in the UI
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.avatar) {
      toast.error("Profile photo is required");
      return false;
    }
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      toast.error("Valid phone number is required");
      return false;
    }
    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!selectedPlan) {
      setCouponError("No plan selected");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    setCouponDiscount(0);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/coupon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode.trim() }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid coupon");
      }

      const coupon = data.data;

      if (!coupon.isActive) {
        throw new Error("This coupon is inactive");
      }
      if (coupon.category !== "SUBSCRIPTION") {
        throw new Error("This coupon is not valid for subscriptions");
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        throw new Error("This coupon has expired");
      }

      if (coupon.minCartAmount > selectedPlan.finalPrice) {
        throw new Error("Coupon is not applicable for this plan");
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("This coupon has reached its usage limit");
      }

      let discountAmount = 0;
      if (coupon.typeOfCoupon === "flat") {
        discountAmount = coupon.value;
      } else if (coupon.typeOfCoupon === "percentage") {
        const percentage = (selectedPlan.finalPrice * coupon.value) / 100;
        discountAmount = Math.min(percentage, coupon.maxDiscount || percentage);
      }

      setAppliedCoupon(coupon);
      setCouponDiscount(discountAmount);
      setCouponError("");

      toast.success(`Coupon applied! You saved ₹${discountAmount}`);
    } catch (err) {
      console.error("Coupon error:", err);
      setCouponError(err.message);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const getFinalPlanPrice = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.finalPrice - couponDiscount;
  };

  const calculateAdmissionFeeDiscount = () => {
    if (formData.discountTypeOnAdFee === "percentage") {
      return (ADMISSION_FEE * formData.discountOnAdFee) / 100;
    } else if (formData.discountTypeOnAdFee === "flat") {
      return formData.discountOnAdFee;
    }
    return 0;
  };

  const finalAdmissionFee = ADMISSION_FEE - calculateAdmissionFeeDiscount();
  const finalPlanPrice = getFinalPlanPrice();
  const totalPayableAmount = selectedPlan
    ? finalAdmissionFee + finalPlanPrice
    : 0;

  const checkUserExistence = async () => {
    try {
      setCheckingUser(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/check/existance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phoneNumber: formData.phoneNumber,
          }),
        },
      );

      const data = await response.json();

      if (data.data === true) {
        setRegistrationStatus({
          status: "error",
          message: `User with this email or phone number already exists. Please use different credentials or log in.`,
        });
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.error("❌ Error checking user:", err);
      setRegistrationStatus({
        status: "error",
        message: `Error verifying user: ${err.message}`,
      });
      return false;
    } finally {
      setCheckingUser(false);
    }
  };

  const handlePaymentAndRegistration = async () => {
    if (!validateForm()) return;
    if (!selectedPlan) return;

    const userExists = await checkUserExistence();
    if (!userExists) return;

    await handlePayment({
      amount: totalPayableAmount,
      productName: `${selectedPlan.title} - ${selectedPlan.duration}`,
      userEmail: formData.email,
      userName: formData.fullName,
      userPhone: formData.phoneNumber,
      onSuccess: async (paymentResult) => {
        setRegistrationStatus({
          status: "registering",
          message: "Registering your account...",
        });

        try {
          // Build FormData so multer on the backend receives the file via req.file
          const payload = new FormData();
          payload.append("username", formData.fullName);
          payload.append("email", formData.email);
          payload.append("phoneNumber", formData.phoneNumber);
          payload.append("planId", selectedPlan._id);
          if (appliedCoupon?.code) payload.append("coupon", appliedCoupon.code);
          payload.append("admissionFee", ADMISSION_FEE);
          payload.append("discountTypeOnAdFee", formData.discountTypeOnAdFee);
          payload.append("discountOnAdFee", formData.discountOnAdFee);
          payload.append("paymentStatus", "paid");
          payload.append("paymentMethod", "razorpay");
          payload.append("paymentId", paymentResult.paymentId);
          payload.append("orderId", paymentResult.orderId);
          // Append the actual File object — multer reads this as req.file
          if (avatarFile) payload.append("avatar", avatarFile);

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/user/register`,
            {
              method: "POST",
              // Do NOT set Content-Type manually — browser sets it with the
              // correct multipart boundary automatically when body is FormData
              body: payload,
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Registration failed");
          }

          setRegistrationStatus({
            status: "success",
            message: "Account created successfully!",
          });

          setTimeout(() => {
            setShowModal(false);
            navigate("/login");
          }, 2000);
        } catch (err) {
          console.error("❌ Registration error:", err);
          setRegistrationStatus({
            status: "error",
            message: `Registration failed: ${err.message}`,
          });
        }
      },
      onError: (err) => {
        console.error("❌ Payment error:", err);
        setRegistrationStatus({
          status: "error",
          message: `Payment failed: ${err.message}`,
        });
      },
    });
  };

  return (
    <div className="bg-neutral-950 text-white">
      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          INVEST IN YOUR
          <span className="text-red-600"> BODY</span>
        </h1>

        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Strong bodies are built with commitment — choose a plan that matches
          your mindset.
        </p>

        <div className="mt-10 inline-flex border border-white/10">
          <button
            onClick={() => setBilling("SUBSCRIPTION")}
            className={`px-6 py-3 font-bold ${
              billing === "SUBSCRIPTION" ? "bg-red-600" : "text-gray-400"
            }`}
          >
            SUBSCRIPTION
          </button>

          <button
            onClick={() => setBilling("PT")}
            className={`px-6 py-3 font-bold ${
              billing === "PT" ? "bg-red-600" : "text-gray-400"
            }`}
          >
            PERSONAL TRAINING
          </button>
        </div>
      </section>

      <section className="container pb-28">
        <div className="grid md:grid-cols-3 gap-10">
          {filteredPlans?.map((plan) => (
            <PricingCard
              key={plan._id}
              title={plan.title}
              duration={plan.duration}
              subtext={plan.bio}
              price={plan.finalPrice}
              basePrice={plan.basePrice}
              category={plan.category}
              features={plan.benefits.map((b) => b.heading)}
              onStartNow={() => handleStartNow(plan)}
            />
          ))}
        </div>
      </section>

      <section className="bg-black border-t border-white/10 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-black mb-4">
            NO CONTRACTS. NO EXCUSES.
          </h2>

          <p className="text-gray-400 mb-8">
            Start today. Quit someday — or never.
          </p>

          <NavLink to="/contacts">
            <button className="bg-red-600 px-12 py-4 font-extrabold tracking-widest">
              JOIN THE GRIND
            </button>
          </NavLink>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#1a0000] to-neutral-900 px-8 py-6 border-b border-white/7 rounded-t-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-24 bg-red-600/10 blur-2xl pointer-events-none rounded-full" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-[3px] h-4 bg-red-600 rounded-full" />
                    <p className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                      New Membership
                    </p>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Complete Registration
                  </h2>
                  <p className="text-sm text-white/40 mt-1">
                    {selectedPlan?.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={
                    registrationStatus?.status === "registering" || checkingUser
                  }
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Offer Banners */}
            {offerDetails.filter((o) => o.category === billing && o.isActive)
              .length > 0 && (
              <div className="px-8 pt-5 flex flex-col gap-2">
                {offerDetails
                  .filter((o) => o.category === billing && o.isActive)
                  .map((offer) => (
                    <div
                      key={offer._id}
                      className="flex items-center justify-between bg-yellow-500/[0.06] border border-yellow-500/25 rounded-xl px-4 py-3 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0 text-yellow-400">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-yellow-400 font-bold text-xs tracking-wider uppercase">
                            {offer.title}
                          </p>
                          <p className="text-white/40 text-xs truncate mt-0.5">
                            {offer.description}
                          </p>
                        </div>
                      </div>
                      {offer.coupon && (
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCode(offer.coupon);
                            toast.success("Coupon code filled in!");
                          }}
                          className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-500/20 transition shrink-0 tracking-widest"
                        >
                          {offer.coupon} →
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="p-8">
              {!registrationStatus ? (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePaymentAndRegistration();
                  }}
                >
                  {/* ── Profile Photo (mandatory) ── */}
                  <div>
                    <label className="block text-[11px] font-semibold tracking-widest text-white/40 uppercase mb-3">
                      Profile Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Avatar preview circle */}
                      <div
                        onClick={() => avatarInputRef.current?.click()}
                        className="relative w-16 h-16 rounded-full bg-white/[0.04] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group hover:border-red-500/50 transition"
                      >
                        {formData.avatar ? (
                          <>
                            <img
                              src={formData.avatar}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="text-white/30 group-hover:text-white/50 transition"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                        )}
                      </div>

                      {/* Upload button & hint */}
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm font-semibold text-white cursor-pointer hover:bg-white/10 hover:border-white/20 transition">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          {formData.avatar ? "Change Photo" : "Upload Photo"}
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={loading || checkingUser}
                          />
                        </label>
                        <p className="mt-1.5 text-xs text-white/30">
                          JPG, PNG or WEBP · max 2MB
                        </p>
                        {!formData.avatar && (
                          <p className="mt-0.5 text-xs text-red-400/60">
                            Required to proceed
                          </p>
                        )}
                        {formData.avatar && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, avatar: null }));
                              setAvatarFile(null);
                              if (avatarInputRef.current)
                                avatarInputRef.current.value = "";
                            }}
                            className="mt-1 text-xs text-white/30 hover:text-red-400 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Name & Phone ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-widest text-white/40 uppercase mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition text-sm"
                        disabled={loading || checkingUser}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold tracking-widest text-white/40 uppercase mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="XXXXX-XXXXX"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition text-sm"
                        disabled={loading || checkingUser}
                      />
                    </div>
                  </div>

                  {/* ── Email ── */}
                  <div>
                    <label className="block text-[11px] font-semibold tracking-widest text-white/40 uppercase mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition text-sm"
                      disabled={loading || checkingUser}
                    />
                  </div>

                  {/* ── Coupon ── */}
                  <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
                    <label className="block text-[11px] font-semibold tracking-widest text-white/40 uppercase mb-3">
                      Coupon Code
                    </label>
                    {!appliedCoupon ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/40 font-mono tracking-widest text-sm transition"
                          disabled={couponLoading || loading || checkingUser}
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={
                            couponLoading ||
                            loading ||
                            checkingUser ||
                            !couponCode.trim()
                          }
                          className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-40 transition whitespace-nowrap tracking-wide"
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/25 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold font-mono tracking-widest text-sm">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-white/40 text-xs">
                            — ₹{couponDiscount} off
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          disabled={loading || checkingUser}
                          className="text-white/30 hover:text-red-400 transition text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="mt-2 text-xs text-red-400">{couponError}</p>
                    )}
                  </div>

                  {/* ── Payment Breakdown ── */}
                  <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 space-y-2.5">
                    <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-3">
                      Payment Breakdown
                    </p>

                    <div className="flex justify-between text-sm text-white/50">
                      <span>Plan price</span>
                      <span>₹{selectedPlan?.finalPrice}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span>−₹{couponDiscount}</span>
                      </div>
                    )}

                    {calculateAdmissionFeeDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Admission discount</span>
                        <span>−₹{calculateAdmissionFeeDiscount()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-white/50">
                      <span>Admission fee</span>
                      <span>₹{finalAdmissionFee}</span>
                    </div>

                    <div className="border-t border-white/8 pt-3 flex justify-between font-black text-white text-base">
                      <span>Total payable</span>
                      <span className="text-red-500">₹{totalPayableAmount}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* ── Action Buttons ── */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading || checkingUser}
                      className="flex-1 px-6 py-3 border border-white/10 text-white/50 rounded-lg font-semibold text-sm hover:border-white/20 hover:text-white disabled:opacity-40 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || checkingUser}
                      className="flex-[2] px-6 py-3 bg-red-600 text-white rounded-lg font-black text-sm hover:bg-red-700 disabled:opacity-40 transition tracking-wide flex items-center justify-center gap-2"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      {checkingUser
                        ? "Verifying..."
                        : loading
                          ? "Processing..."
                          : `Pay ₹${totalPayableAmount}`}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`p-6 rounded-xl border ${
                    registrationStatus.status === "success"
                      ? "bg-green-500/10 border-green-500/25"
                      : registrationStatus.status === "registering"
                        ? "bg-blue-500/10 border-blue-500/25"
                        : "bg-red-500/10 border-red-500/25"
                  }`}
                >
                  <p
                    className={`text-center font-semibold text-sm ${
                      registrationStatus.status === "success"
                        ? "text-green-400"
                        : registrationStatus.status === "registering"
                          ? "text-blue-400"
                          : "text-red-400"
                    }`}
                  >
                    {registrationStatus.message}
                  </p>

                  {registrationStatus.status === "registering" && (
                    <div className="mt-4 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
                    </div>
                  )}

                  {registrationStatus.status === "error" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => setRegistrationStatus(null)}
                        className="flex-1 px-4 py-2.5 border border-white/10 text-white/50 rounded-lg font-semibold text-sm hover:border-white/20 hover:text-white transition"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {registrationStatus.status === "success" && (
                    <p className="text-center text-white/40 text-xs mt-4">
                      Redirecting to login...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}