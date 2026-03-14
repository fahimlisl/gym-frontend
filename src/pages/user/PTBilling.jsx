import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import UserDashboardLayout from "../../components/layout/UserDashboardLayout";

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
      <UserDashboardLayout>

        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">

          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <span className="text-4xl text-green-400">✔</span>
          </div>

          <h2 className="text-2xl font-black tracking-widest mb-3 text-green-400">
            REQUEST SUBMITTED
          </h2>

          <p className="text-gray-400 max-w-md">
            Your personal training request has been submitted successfully.
            Our team will review your payment and approve it shortly.
          </p>

          <p className="mt-6 text-sm text-gray-500">
            Redirecting to dashboard...
          </p>

        </div>

      </UserDashboardLayout>
    );
  }

  if (!plan) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          LOADING PLAN...
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

        <div className="border border-red-600/30 bg-black rounded-xl p-6">

          <h2 className="text-xl font-black tracking-widest text-red-500 mb-6">
            PERSONAL TRAINING PLAN
          </h2>

          <h3 className="text-2xl font-bold mb-2">
            {plan.title}
          </h3>

          <p className="text-gray-400 mb-6">
            {plan.bio}
          </p>

          <div className="text-4xl font-black mb-4">
            ₹{plan.finalPrice}
          </div>

          <p className="text-xs text-gray-400 uppercase mb-6">
            {plan.duration}
          </p>

          <div className="border-t border-white/10 pt-4 space-y-2">

            {plan.benefits?.map((b) => (

              <div key={b._id} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✔</span>
                <span>{b.heading}</span>
              </div>

            ))}

          </div>

        </div>

        <div className="border border-red-600/30 bg-black rounded-xl p-6">

          <h2 className="text-xl font-black tracking-widest mb-6">
            PAYMENT DETAILS
          </h2>

          <div className="flex gap-2 mb-4">

            <input
              placeholder="COUPON CODE"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              disabled={appliedCoupon}
              className="flex-1 bg-neutral-900 border border-white/10 px-4 py-3 rounded"
            />

            {!appliedCoupon ? (
              <button
                onClick={applyCoupon}
                disabled={couponLoading}
                className="px-4 border border-green-500 text-green-400 font-bold"
              >
                {couponLoading ? "CHECKING..." : "APPLY"}
              </button>
            ) : (
              <button
                onClick={removeCoupon}
                className="px-4 border border-red-500 text-red-400 font-bold"
              >
                REMOVE
              </button>
            )}

          </div>

          <input
            placeholder="PAYMENT REFERENCE"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 px-4 py-3 rounded mb-4"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 px-4 py-3 rounded mb-4"
          >
            <option value="upi">UPI</option>
            <option value="cash">CASH</option>
          </select>

          <div className="border border-dashed border-white/20 p-4 rounded text-center mb-6">

            <input
              type="file"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />

            {preview && (
              <img
                src={preview}
                className="mt-4 rounded border border-white/10 max-h-40 mx-auto"
              />
            )}

          </div>

          <div className="border-t border-white/10 pt-4 text-sm mb-6">

            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Base Price</span>
              <span>₹{plan.finalPrice}</span>
            </div>

            <div className="flex justify-between mb-1 text-green-400">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>

            <div className="flex justify-between font-black text-lg mt-3">
              <span>Total</span>
              <span>₹{finalPrice}</span>
            </div>

          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 font-extrabold tracking-widest
                       bg-gradient-to-r from-red-700 via-red-600 to-red-700
                       text-black hover:brightness-110 transition rounded"
          >
            {loading ? "SUBMITTING..." : "SUBMIT REQUEST"}
          </button>

        </div>

      </div>

    </UserDashboardLayout>
  );
}