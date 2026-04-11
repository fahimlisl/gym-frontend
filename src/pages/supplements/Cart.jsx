import { useState } from "react";
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../api/axios.api";
import useRazorpay from "../../hooks/useRazorpay";

export default function Cart({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart, onOrderSuccess, total }) {
  const { handlePayment, loading: razorpayLoading } = useRazorpay();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    phoneNumber: "",
    email: "",
    fullName: "",
    userId: null,
  });
  const [showFullForm, setShowFullForm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, total - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post("/general/supplements/validate-coupon", {
        code: couponCode,
        cartTotal: total,
      });
      setAppliedCoupon(data.coupon);
      toast.success(data.message);
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast("Coupon removed", { icon: "🗑️" });
  };

  const applyReferral = async () => {
    if (!referralCode.trim()) return;
    setReferralLoading(true);
    try {
      const { data } = await api.post("/general/fetch/trainer/coupon", {
        code: referralCode.toUpperCase(),
      });

      const coupon = data.data;

      if (!coupon.isActive) {
        toast.error("Referral code is inactive");
        return;
      }
      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        toast.error("Referral code has expired");
        return;
      }
      // if (coupon.category !== "SUPPLEMENT") {
      //   toast.error("Referral code not valid for supplements");
      //   return;
      // }
      if (coupon.minCartAmount && total < coupon.minCartAmount) {
        toast.error(`Minimum cart amount of ₹${coupon.minCartAmount} required`);
        return;
      }

      setAppliedReferral(coupon);
      toast.success("Referral code applied!");
    } catch (error) {
      setAppliedReferral(null);
      toast.error(error.response?.data?.message || "Invalid referral code");
    } finally {
      setReferralLoading(false);
    }
  };

  const removeReferral = () => {
    setAppliedReferral(null);
    setReferralCode("");
    toast("Referral removed", { icon: "🗑️" });
  };

  const handlePhoneNumberChange = async (phone) => {
    setCustomerInfo({ ...customerInfo, phoneNumber: phone, userId: null });

    if (phone.length === 10) {
      try {
        const response = await api.get(`/general/user/check-phone/${phone}`);
        const userData = response.data;

        if (userData.success === true && userData.data) {
          const user = userData.data;
          setExistingUser(user);
          setCustomerInfo({
            phoneNumber: phone,
            fullName: user.username || user.fullName || "",
            email: user.email || "",
            userId: user._id,
          });
          setShowFullForm(false);
          toast.success(`Welcome back ${user.username || user.fullName}!`, { icon: "👋" });
        } else {
          setExistingUser(null);
          setCustomerInfo({ ...customerInfo, phoneNumber: phone, userId: null });
          setShowFullForm(true);
          toast("Complete your details", { icon: "⚠️" });
        }
      } catch {
        setExistingUser(null);
        setShowFullForm(true);
      }
    } else {
      setShowFullForm(false);
      setExistingUser(null);
    }
  };

  const handleCheckout = async () => {
    if (!customerInfo.phoneNumber || customerInfo.phoneNumber.length !== 10) {
      toast.error("Valid 10-digit phone number required");
      return;
    }
    if (showFullForm && !customerInfo.fullName) {
      toast.error("Full name is required for new customers");
      return;
    }

    setCheckoutLoading(true);

    await handlePayment({
      amount: finalTotal,
      productName: "Supplement Order",
      userEmail: customerInfo.email || "guest@alphagym.com",
      userName: customerInfo.fullName || "Customer",
      userPhone: customerInfo.phoneNumber,

      onSuccess: async (paymentResult) => {
        try {
          const { data } = await api.post("/general/supplements/checkout", {
            cart,
            customerInfo: {
              phoneNumber: customerInfo.phoneNumber,
              fullName: customerInfo.fullName,
              email: customerInfo.email,
              userId: customerInfo.userId,
            },
            couponCode: appliedCoupon?.code || null,
            ReferralCode: appliedReferral?.code || null,
            paymentMethod: "razorpay",
            paymentId: paymentResult.paymentId,
            orderId: paymentResult.orderId,
            subtotal: total,
          });

          toast.success("Order placed successfully!");
          onClearCart(); 
          onOrderSuccess();  
          setAppliedCoupon(null);
          setCouponCode("");
          setAppliedReferral(null);
          setReferralCode("");
          setCustomerInfo({ phoneNumber: "", email: "", fullName: "", userId: null });
          setExistingUser(null);
          setShowFullForm(false);
          onClose();
        } catch (error) {
          console.error("Checkout 400 error details:", error.response?.data);
          toast.error(
            "Payment done but order failed. Please contact support with your payment ID: " +
              paymentResult.paymentId
          );
          console.error("Post-payment checkout error:", error);
        } finally {
          setCheckoutLoading(false);
        }
      },

      onError: (err) => {
        toast.error(
          err.message === "Payment modal closed by user"
            ? "Payment cancelled"
            : "Payment failed. Please try again."
        );
        setCheckoutLoading(false);
      },
    });
  };

  if (!isOpen) return null;

  const isLoading = checkoutLoading || razorpayLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 shadow-2xl flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-2xl font-black text-white tracking-tight">
            FUEL<span className="text-red-600"> CART</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">🛒</div>
              <p className="text-gray-500">Empty. Add fuel to your machine.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 bg-zinc-800 rounded-lg">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{item.productName}</h3>
                    <p className="text-red-600 font-bold mt-1">₹{item.salePrice}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        className="bg-black p-1.5 rounded-md hover:bg-zinc-700 transition"
                      >
                        <MinusIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                      <span className="font-medium text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        className="bg-black p-1.5 rounded-md hover:bg-zinc-700 transition"
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item._id)}
                        className="ml-auto text-red-500 hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-zinc-800 p-6 space-y-4 shrink-0">

            {appliedCoupon ? (
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border border-red-600/40 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-red-500">{appliedCoupon.code} applied</p>
                  <p className="text-xs text-gray-400">-₹{appliedCoupon.discountAmount} off</p>
                </div>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-red-500 transition">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Coupon Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white placeholder-gray-500 uppercase text-sm"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold transition text-sm"
                  >
                    {couponLoading ? "..." : "APPLY"}
                  </button>
                </div>
              </div>
            )}

            {appliedReferral ? (
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border border-yellow-500/40 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-yellow-400">{appliedReferral.code} · Referral applied</p>
                  <p className="text-xs text-gray-400">Trainer reward activated 🎯</p>
                </div>
                <button onClick={removeReferral} className="text-gray-500 hover:text-yellow-400 transition">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Referral Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="TRAINER CODE"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500 uppercase text-sm"
                  />
                  <button
                    onClick={applyReferral}
                    disabled={referralLoading}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-lg font-bold transition text-sm"
                  >
                    {referralLoading ? "..." : "APPLY"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="tel"
                placeholder="PHONE NUMBER *"
                value={customerInfo.phoneNumber}
                maxLength={10}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white placeholder-gray-500"
              />
              {existingUser && !showFullForm && (
                <div className="px-4 py-2 bg-green-900/20 border border-green-600/40 rounded-lg">
                  <p className="text-sm text-green-500 font-medium">Welcome back!</p>
                  <p className="text-white text-sm">{existingUser.username || existingUser.fullName}</p>
                  {existingUser.email && (
                    <p className="text-gray-400 text-xs">{existingUser.email}</p>
                  )}
                </div>
              )}
              {showFullForm && (
                <>
                  <input
                    type="text"
                    placeholder="FULL NAME *"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
                  />
                  <input
                    type="email"
                    placeholder="EMAIL (OPTIONAL)"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
                  />
                </>
              )}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 text-sm">SUBTOTAL</span>
                <span className="text-white font-bold">₹{total}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">DISCOUNT</span>
                  <span className="text-green-500 font-bold">-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              {appliedReferral && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">REFERRAL</span>
                  <span className="text-yellow-400 font-bold text-sm">✓ {appliedReferral.code}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4 border-t border-zinc-700 pt-2">
                <span className="text-gray-400">TOTAL</span>
                <span className="text-2xl font-black text-red-600">₹{finalTotal}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold tracking-wide transition"
              >
                {isLoading ? "PROCESSING..." : `PAY ₹${finalTotal}`}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}