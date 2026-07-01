import { useEffect, useRef, useState } from "react";
import { X, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";

export default function SellSupplementModal({ isOpen, onClose, onSaleComplete }) {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const revalidateTimer = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api
      .get("/admin/fetch-supplements") 
      .then((res) => setSupplements(res.data.data))
      .catch(() => toast.error("Failed to load supplements"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCart([]);
      setSearch("");
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponMessage("");
    }
  }, [isOpen]);

  const filtered = supplements.filter((s) =>
    s.productName.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    const stockItem = supplements.find((s) => s._id === product._id) || product;

    if (stockItem.quantity <= 0) {
      toast.error("Out of stock");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        if (existing.quantity >= stockItem.quantity) {
          toast.error("No more stock available");
          return prev;
        }
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...stockItem, quantity: 1 }];
    });
  };

  const decrementItem = (id) => {
    setCart((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
  const discount = appliedCoupon?.discountAmount || 0;
  const grandTotal = Math.max(total - discount, 0);

  const applyCoupon = async ({ silent = false } = {}) => {
    const code = couponCode.trim();
    if (!code) return;
    if (total <= 0) {
      if (!silent) toast.error("Add items to the cart first");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await api.post("/admin/validate-coupon/supplement", {
        code,
        cartTotal: total,
      });
      const discountAmount = res.data.coupon.discountAmount;
      setAppliedCoupon({ code, discountAmount });
      setCouponMessage(`Coupon applied: -₹${discountAmount}`);
      if (!silent) toast.success("Coupon applied!");
    } catch (err) {
      setAppliedCoupon(null);
      const msg = err?.response?.data?.message || "Invalid coupon";
      setCouponMessage(msg);
      if (!silent) toast.error(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  useEffect(() => {
    if (!appliedCoupon) return;

    if (total <= 0) {
      removeCoupon();
      return;
    }

    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
    revalidateTimer.current = setTimeout(() => {
      applyCoupon({ silent: true });
    }, 400);

    return () => clearTimeout(revalidateTimer.current);
  }, [total]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        cart: cart.map((i) => ({ _id: i._id, quantity: i.quantity })),
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
        customerInfo:
          customerName || customerPhone
            ? { fullName: customerName, phoneNumber: customerPhone }
            : undefined,
      };
      const res = await api.post("/admin/checkout/supplement", payload);
      toast.success("Sale completed!");
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponMessage("");
      onSaleComplete?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-3 sm:px-4 py-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-neutral-950 border border-red-600/30 rounded-2xl shadow-[0_0_60px_rgba(255,0,0,0.25)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 shrink-0" />

        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-base sm:text-lg font-black tracking-widest text-red-600">
            SELL SUPPLEMENT
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
          <div className="flex-1 overflow-y-auto p-4 border-b sm:border-b-0 sm:border-r border-white/10">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplements..."
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-red-500"
            />

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-red-600" size={28} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="text-left bg-black border border-white/10 rounded-lg p-3 hover:border-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm font-bold text-white truncate">{product.productName}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-red-500 font-bold text-sm">₹{product.salePrice}</span>
                      <span className="text-[10px] text-gray-500">Stock: {product.quantity}</span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-gray-500 text-sm col-span-2 text-center py-8">
                    No supplements found
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="w-full sm:w-80 flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-52 sm:max-h-none">
              <p className="text-xs text-gray-500 tracking-widest font-bold mb-2 flex items-center gap-2">
                <ShoppingCart size={14} /> CART ({cart.length})
              </p>
              {cart.length === 0 && (
                <p className="text-gray-600 text-xs">No items added</p>
              )}
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-black border border-white/10 rounded-lg px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-500">₹{item.salePrice} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => decrementItem(item._id)}
                      className="w-6 h-6 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 text-white"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4 space-y-3 shrink-0 overflow-y-auto">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
              {/* <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              /> */}

              <div className="flex gap-2">
                {["cash", "upi"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition ${
                      paymentMethod === method
                        ? "bg-red-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-black border border-green-600/40 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-green-500 truncate">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        -₹{appliedCoupon.discountAmount} applied
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition shrink-0 flex items-center gap-1"
                    >
                      <X size={12} /> REMOVE
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => applyCoupon()}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition disabled:opacity-40"
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponMessage && !appliedCoupon && (
                  <p className="text-[10px] text-red-500">{couponMessage}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-500">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-red-500">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
                className="w-full py-3 font-bold tracking-widest text-sm bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black rounded-lg hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "PROCESSING..." : "COMPLETE SALE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}