import { useState, useEffect } from "react";
import PricingCard from "../components/pricing/PricingCard";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchAllPlans } from "../api/general.api.js";
import useRazorpay from "../hooks/useRazorpay";
import toast from "react-hot-toast";

export default function PricingP() {
  const navigate = useNavigate();
  const { handlePayment, loading, error, setError } = useRazorpay();

  // hard coded admission fee
  const ADMISSION_FEE = 1000;

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

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
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

    loadPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => plan.category === billing);

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
    discount: 0,
    discountType: "flat",
    discountTypeOnAdFee: "flat",
    discountOnAdFee: 0,
    paymentMethod: "razorpay",
  });
  setRegistrationStatus(null);
  setCouponCode("");
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

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      alert("Valid phone number is required");
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
        }
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
        throw new Error(`Minimum purchase of ₹${coupon.minCartAmount} required`);
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
      console.log("🔍 Checking if user exists...");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/check/existance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phoneNumber: formData.phoneNumber,
          }),
        }
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

    const planType = billing === "SUBSCRIPTION" ? selectedPlan.duration : "pt";
    
    console.log("💰 Payment Summary:");
    console.log(`Plan: ${selectedPlan.title}`);
    console.log(`Original Plan Price: ₹${selectedPlan.finalPrice}`);
    if (couponDiscount > 0) {
      console.log(`Coupon Discount: -₹${couponDiscount}`);
    }
    console.log(`Final Plan Price: ₹${finalPlanPrice}`);
    console.log(`Admission Fee: ₹${ADMISSION_FEE}`);
    console.log(`Admission Discount: ₹${calculateAdmissionFeeDiscount()}`);
    console.log(`Final Admission Fee: ₹${finalAdmissionFee}`);
    console.log(`Total Payable: ₹${totalPayableAmount}`);

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
          console.log("📝 Calling registration endpoint...");

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/user/register`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                // user data
                username: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,

                planId: selectedPlan._id,
                
                coupon: appliedCoupon?.code || null,

                admissionFee: ADMISSION_FEE,
                discountTypeOnAdFee: formData.discountTypeOnAdFee,
                discountOnAdFee: formData.discountOnAdFee,

                paymentStatus: "paid",
                paymentMethod: "razorpay",
                paymentId: paymentResult.paymentId,
                orderId: paymentResult.orderId,

                avatar: null,
              }),
            }
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
          {filteredPlans.map((plan) => (
            <PricingCard
              key={plan._id}
              title={plan.title}
              duration={plan.duration}
              subtext={plan.bio}
              price={plan.finalPrice}
              basePrice={plan.basePrice}
              features={plan.benefits.map((b) => b.heading)}
              onStartNow={() => handleStartNow(plan)}
            />
          ))}
        </div>
      </section>

      <section className="bg-black border-t border-white/10 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-black mb-4">NO CONTRACTS. NO EXCUSES.</h2>

          <p className="text-gray-400 mb-8">Start today. Quit someday — or never.</p>

          <NavLink to="/contacts">
            <button className="bg-red-600 px-12 py-4 font-extrabold tracking-widest">
              JOIN THE GRIND
            </button>
          </NavLink>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl border border-white/10 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Complete Your Registration
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedPlan?.title}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
                disabled={registrationStatus?.status === "registering" || checkingUser}
              >
                ✕
              </button>
            </div>

            {!registrationStatus ? (
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                handlePaymentAndRegistration();
              }}>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    disabled={loading || checkingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    disabled={loading || checkingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    disabled={loading || checkingUser}
                  />
                </div>

                <div className="bg-neutral-800/30 border border-white/10 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Have a coupon code?
                  </label>
                  
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                        disabled={couponLoading || loading || checkingUser}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || loading || checkingUser || !couponCode.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div>
                        <span className="text-green-400 font-semibold">{appliedCoupon.code}</span>
                        <span className="text-gray-300 text-sm ml-2">
                          (₹{couponDiscount} off)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-gray-400 hover:text-red-400 transition"
                        disabled={loading || checkingUser}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {couponError && (
                    <p className="mt-2 text-sm text-red-400">{couponError}</p>
                  )}
                </div>

                <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-white mb-3">💰 Payment Breakdown</h3>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Plan Price:</span>
                    <span>₹{selectedPlan?.finalPrice}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Final Plan Price:</span>
                    <span>₹{finalPlanPrice}</span>
                  </div>
                  
                  {/* Admission Fee */}
                  {/* <div className="flex justify-between text-sm text-gray-300">
                    <span>Admission Fee:</span>
                    <span>₹{ADMISSION_FEE}</span>
                  </div> */}
                  
                  {/* Admission Discount */}
                  {calculateAdmissionFeeDiscount() > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Admission Discount:</span>
                      <span>-₹{calculateAdmissionFeeDiscount()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Admission Fee:</span>
                    <span>₹{finalAdmissionFee}</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                    <span>Total Payable:</span>
                    <span className="text-red-500">₹{totalPayableAmount}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={loading || checkingUser}
                    className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:border-red-500 hover:bg-red-600/10 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || checkingUser}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {checkingUser ? "Verifying..." : loading ? "Processing..." : `Pay ₹${totalPayableAmount}`}
                  </button>
                </div>
              </form>
            ) : (
              <div className={`p-6 rounded-lg border ${
                registrationStatus.status === "success"
                  ? "bg-green-500/10 border-green-500/30"
                  : registrationStatus.status === "registering"
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <p className={`text-center font-semibold ${
                  registrationStatus.status === "success"
                    ? "text-green-400"
                    : registrationStatus.status === "registering"
                    ? "text-blue-400"
                    : "text-red-400"
                }`}>
                  {registrationStatus.message}
                </p>

                {registrationStatus.status === "registering" && (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {registrationStatus.status === "error" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setRegistrationStatus(null)}
                      className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg font-semibold hover:border-red-500 hover:bg-red-600/10 transition"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Close
                    </button>
                  </div>
                )}

                {registrationStatus.status === "success" && (
                  <p className="text-center text-gray-300 text-sm mt-4">
                    Redirecting to login...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}