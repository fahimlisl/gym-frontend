import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { registerMember } from "../../api/admin.api";
import { X, Loader, ChevronRight, AlertCircle } from "lucide-react";
import api from "../../api/axios.api";

// hardcoded admission fee
const ADMISSION_FEE = 1099;

function Modal({ title, children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur
                    flex items-center justify-center px-4">
      <div className="w-full max-w-3xl max-h-[90vh]
                      overflow-hidden
                      rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30">
        <div className="flex justify-between items-center
                        px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-black tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AddMemberModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [avatar, setAvatar] = useState(null);
  
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    planId: "",
    paymentMethod: "cash",
    discountTypeOnAdFee: "none",
    discountOnAdFee: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      setCouponInput("");
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  }, [selectedPlan]);

  const fetchPlans = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      
      const plansRes = await api.get("/admin/plans/sub/fetch/all")
      
      const subscriptionPlans = plansRes.data.data?.filter(
        plan => plan.category === "SUBSCRIPTION"
      ) || [];
      
      setPlans(subscriptionPlans);

      if (subscriptionPlans.length > 0) {
        setSelectedPlan(subscriptionPlans[0]);
        setForm(prev => ({ ...prev, planId: subscriptionPlans[0]._id }));
      }
    } catch (err) {
      console.error("Error loading plans:", err);
      if (err.response?.status === 401) {
        toast.error("Unauthorized - Please login again");
        onClose();
      } else if (err.response?.status === 403) {
        toast.error("Forbidden - Admin access required");
        onClose();
      } else {
        toast.error(err?.response?.data?.message || "Failed to load plans");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setForm({ ...form, planId: plan._id });
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
      const token = localStorage.getItem("token");
      
      const res = await api.post("/general/coupon", {
        code: couponInput,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const coupon = res.data.data;

      if (!coupon) {
        throw new Error("Coupon not found. Contact administration!");
      }

      if (!coupon.isActive) {
        throw new Error("Coupon is inactive. Contact administrator.");
      }

      if (coupon.category !== "SUBSCRIPTION") {
        throw new Error("Coupon not applicable for subscription plans");
      }

      if (coupon.minCartAmount > selectedPlan.finalPrice) {
        throw new Error(
          `Minimum cart amount must be ₹${coupon.minCartAmount}`
        );
      }

      let discountAmount = 0;

      if (coupon.typeOfCoupon === "flat") {
        discountAmount = coupon.value;
      } else if (coupon.typeOfCoupon === "percentage") {
        const percentageDiscount = (selectedPlan.finalPrice * coupon.value) / 100;
        discountAmount = Math.min(percentageDiscount, coupon.maxDiscount || percentageDiscount);
      }

      setCouponDiscount(discountAmount);
      setAppliedCoupon(coupon);
      toast.success("Coupon applied successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized - Please login again");
      } else if (err.response?.status === 403) {
        toast.error("Forbidden - Admin access required");
      } else {
        toast.error(err?.response?.data?.message || err.message);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast("Coupon removed");
  };

  const getFinalPlanPrice = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.finalPrice - couponDiscount;
  };

  const calculateAdmissionDiscount = () => {
    if (form.discountTypeOnAdFee === "percentage") {
      return (ADMISSION_FEE * Number(form.discountOnAdFee || 0)) / 100;
    } else if (form.discountTypeOnAdFee === "flat") {
      return Number(form.discountOnAdFee || 0);
    }
    return 0;
  };

  const admissionDiscount = calculateAdmissionDiscount();
  const finalAdmissionFee = ADMISSION_FEE - admissionDiscount;
  const finalPlanPrice = getFinalPlanPrice();
  const totalAmount = finalPlanPrice + finalAdmissionFee;

  const submit = async (e) => {
    e.preventDefault();

    // if (!avatar) {
    //   toast.error("Avatar is required");
    //   return;
    // }

    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      
      fd.append("username", form.username);
      fd.append("email", form.email || "");
      fd.append("phoneNumber", form.phoneNumber);
      
      fd.append("planId", selectedPlan._id);
      
      fd.append("admissionFee", ADMISSION_FEE);
      fd.append("discountTypeOnAdFee", form.discountTypeOnAdFee);
      fd.append("discountOnAdFee", form.discountOnAdFee || "0");
      
      fd.append("paymentMethod", form.paymentMethod);
      fd.append("paymentStatus", "paid");
      
      if (appliedCoupon) {
        fd.append("coupon", appliedCoupon.code);
      }
      
      fd.append("avatar", avatar);

      await registerMember(fd);

      toast.success("Member added successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="ADD MEMBER" onClose={onClose}>
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">LOADING PLANS...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6">
          <TwoCol>
            <Input 
              label="USERNAME" 
              name="username" 
              value={form.username}
              onChange={handleChange} 
              required 
            />
            <Input 
              label="PHONE NUMBER" 
              name="phoneNumber" 
              value={form.phoneNumber}
              onChange={handleChange} 
              required 
            />
          </TwoCol>

          <Input 
            label="EMAIL *" 
            name="email" 
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <FileInput 
            label="AVATAR" 
            onChange={(e) => setAvatar(e.target.files[0])} 
          />

          <div className="space-y-3">
            <label className="text-xs tracking-widest text-gray-400">
              SELECT PLAN
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan?._id === plan._id
                      ? "border-red-600 bg-red-600/10"
                      : "border-white/10 bg-neutral-900 hover:border-red-600/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{plan.title}</h3>
                    {selectedPlan?._id === plan._id && (
                      <span className="text-red-500 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{plan.bio}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-red-400">
                      ₹{plan.finalPrice}
                    </span>
                    <span className="text-xs text-gray-500">{plan.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <div className="border border-white/10 p-4 rounded-xl space-y-3">
              <p className="text-xs tracking-widest text-green-500">APPLY COUPON</p>
              
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-green-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm rounded-lg hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
                  >
                    {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : "APPLY"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                  <div>
                    <span className="text-green-400 font-bold">{appliedCoupon.code}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      (₹{couponDiscount} off)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="border border-white/10 p-4 rounded-xl space-y-3">
            <p className="text-xs tracking-widest text-red-500">ADMISSION FEE</p>
            
            <div className="bg-neutral-900/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Base Admission Fee:</span>
                <span className="font-bold text-white">₹{ADMISSION_FEE}</span>
              </div>
            </div>

            <TwoCol>
              <Select
                label="DISCOUNT TYPE"
                name="discountTypeOnAdFee"
                value={form.discountTypeOnAdFee}
                onChange={handleChange}
                options={["none", "percentage", "flat"]}
              />

              {form.discountTypeOnAdFee !== "none" && (
                <Input
                  label={form.discountTypeOnAdFee === "percentage" ? "DISCOUNT %" : "DISCOUNT ₹"}
                  name="discountOnAdFee"
                  value={form.discountOnAdFee}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max={form.discountTypeOnAdFee === "percentage" ? "100" : ADMISSION_FEE}
                />
              )}
            </TwoCol>

            {form.discountTypeOnAdFee !== "none" && Number(form.discountOnAdFee) > 0 && (
              <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-2 mt-2">
                <p className="text-xs text-green-400">
                  Admission discount: ₹{admissionDiscount}
                </p>
              </div>
            )}
          </div>

          <Select
            label="PAYMENT METHOD"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            options={["cash", "upi", "card", "netbanking", "razorpay"]}
          />

          {selectedPlan && (
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-red-600/20 rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase font-black text-gray-400">💰 PRICE BREAKDOWN</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan Price ({selectedPlan.duration}):</span>
                  <span className="text-white">₹{selectedPlan.finalPrice}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Final Plan Price:</span>
                  <span className="text-white">₹{finalPlanPrice}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Admission Fee:</span>
                  <span className="text-white">₹{ADMISSION_FEE}</span>
                </div>

                {admissionDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Admission Discount:</span>
                    <span>-₹{admissionDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Final Admission Fee:</span>
                  <span className="text-white">₹{finalAdmissionFee}</span>
                </div>

                <div className="h-px bg-gradient-to-r from-red-600/20 to-transparent my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">TOTAL AMOUNT:</span>
                  <span className="font-black text-lg bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {couponDiscount > 0 && (
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-2 mt-2">
                  <p className="text-xs text-green-400">
                    🎉 You saved ₹{couponDiscount + admissionDiscount} total!
                  </p>
                </div>
              )}
            </div>
          )}

          <Actions loading={loading} onClose={onClose} />
        </form>
      )}
    </Modal>
  );
}

function TwoCol({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <input
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none rounded-lg"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <select
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none rounded-lg"
      >
        {options.map(o => (
          <option key={o} value={o}>{o.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <input type="file" accept="image/*" onChange={onChange}
             className="mt-2 text-sm text-gray-300" />
    </div>
  );
}

function Actions({ loading, onClose }) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <button type="button" onClick={onClose}
              className="border border-white/20 px-6 py-3 text-xs font-bold">
        CANCEL
      </button>
      <button type="submit" disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-8 py-3
                         text-xs font-extrabold tracking-widest rounded-lg">
        {loading ? "ADDING..." : "ADD MEMBER"}
      </button>
    </div>
  );
}