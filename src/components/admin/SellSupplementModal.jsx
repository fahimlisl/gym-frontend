import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Minus, ShoppingCart, Loader, Gift } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";

function Modal({ title, children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur
                    flex items-center justify-center px-4">
      <div className="w-full max-w-3xl max-h-[90vh]
                      overflow-hidden
                      rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30">
        <div className="flex justify-between items-center
                        px-4 sm:px-6 py-4 border-b border-white/10">
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

        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[calc(90vh-64px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function SellSupplementModal({ onClose, onSaleComplete }) {
  const [supplements, setSupplements] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountMode, setDiscountMode] = useState("none");

  // Sponsor states
  const [isSponsor, setIsSponsor] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [trainerLoading, setTrainerLoading] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const revalidateTimer = useRef(null);
  const [manualType, setManualType] = useState("percentage");
  const [manualValue, setManualValue] = useState("");

  useEffect(() => {
    fetchSupplements();
  }, []);

  useEffect(() => {
    if (isSponsor) {
      fetchTrainers();
      setDiscountMode("none");
      setPaymentMethod("cash");
    } else {
      setSelectedTrainer("");
      setTrainers([]);
    }
  }, [isSponsor]);

  const fetchSupplements = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get("/admin/fetch-supplements");
      setSupplements(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized - Please login again");
        onClose();
      } else if (err.response?.status === 403) {
        toast.error("Forbidden - Admin access required");
        onClose();
      } else {
        toast.error(err?.response?.data?.message || "Failed to load supplements");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      setTrainerLoading(true);
      const res = await api.get("/admin/fetchAllTrainer");
      setTrainers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load trainers");
    } finally {
      setTrainerLoading(false);
    }
  };
  console.log("list of all trainers ",trainers)

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

  const subtotal = cart.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);

  const manualDiscountAmount = (() => {
    const v = Number(manualValue);
    if (!v || v <= 0) return 0;
    const amount = manualType === "percentage" ? (subtotal * v) / 100 : v;
    return Math.min(amount, subtotal);
  })();

  // For sponsor, discount is 100%
  const activeDiscount = isSponsor 
    ? subtotal 
    : discountMode === "coupon" 
      ? couponDiscount 
      : discountMode === "manual" 
        ? manualDiscountAmount 
        : 0;

  const totalAmount = Math.max(subtotal - activeDiscount, 0);

  const applyCoupon = async ({ silent = false } = {}) => {
    const code = couponInput.trim();
    if (!code) {
      if (!silent) toast.error("Enter coupon code");
      return;
    }
    if (subtotal <= 0) {
      if (!silent) toast.error("Add items to the cart first");
      return;
    }
    try {
      setCouponLoading(true);
      const res = await api.post("/admin/validate-coupon/supplement", {
        code,
        cartTotal: subtotal,
      });
      const discountAmount = res.data.coupon.discountAmount;
      setCouponDiscount(discountAmount);
      setAppliedCoupon({ code, discountAmount });
      if (!silent) toast.success("Coupon applied successfully!");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      if (!silent) toast.error(err?.response?.data?.message || "Invalid coupon");
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

  const clearManualDiscount = () => {
    setManualValue("");
  };

  const switchDiscountMode = (mode) => {
    if (isSponsor) {
      toast.error("Discounts not available for sponsor bills");
      return;
    }
    if (mode === discountMode) return;
    if (discountMode === "coupon") removeCoupon();
    if (discountMode === "manual") clearManualDiscount();
    setDiscountMode(mode);
  };

  useEffect(() => {
    if (discountMode !== "coupon" || !appliedCoupon || isSponsor) return;
    if (subtotal <= 0) {
      removeCoupon();
      return;
    }
    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
    revalidateTimer.current = setTimeout(() => applyCoupon({ silent: true }), 400);
    return () => clearTimeout(revalidateTimer.current);
  }, [subtotal, isSponsor]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (isSponsor && !selectedTrainer) {
      toast.error("Please select a trainer for sponsor bill");
      return;
    }

    if (discountMode === "manual" && manualValue && Number(manualValue) < 0) {
      toast.error("Discount value cannot be negative");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        cart: cart.map((i) => ({ _id: i._id, quantity: i.quantity })),
        paymentMethod: isSponsor ? "cash" : paymentMethod,
        couponCode: discountMode === "coupon" && !isSponsor ? appliedCoupon?.code || undefined : undefined,
        manualDiscount:
          discountMode === "manual" && !isSponsor && Number(manualValue) > 0
            ? { type: manualType, value: Number(manualValue) }
            : undefined,
        customerInfo: customerName ? { fullName: customerName } : undefined,
        isSponsor,
        ...(isSponsor && { trainerId: selectedTrainer }),
      };
      
      const res = await api.post("/admin/checkout/supplement", payload);
      toast.success(res.data.message || "Sale completed successfully");
      onSaleComplete?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="SELL SUPPLEMENT" onClose={onClose}>
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">LOADING SUPPLEMENTS...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Sponsor Toggle */}
          <div className="border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSponsor(!isSponsor)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isSponsor ? "bg-green-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isSponsor ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift size={16} className="text-green-400" />
                  SPONSOR BILL
                </p>
                <p className="text-xs text-gray-400">
                  Free supplements for trainers (100% discount)
                </p>
              </div>
            </div>
          </div>

          {isSponsor && (
            <div className="space-y-3">
              <label className="text-xs tracking-widest text-gray-400">
                SELECT TRAINER *
              </label>
              {trainerLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-5 h-5 text-red-500 animate-spin" />
                </div>
              ) : (
                <select
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10
                           px-4 py-3 text-sm focus:border-green-600 outline-none rounded-lg text-white"
                >
                  <option value="">Select a trainer...</option>
                  {trainers.map((trainer) => (
                    <option className="text-white" key={trainer._id} value={trainer._id}>
                      {trainer.fullName} {trainer.phoneNumber ? `(${trainer.phoneNumber})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs tracking-widest text-gray-400">
              SELECT SUPPLEMENTS
            </label>

            <input
              type="text"
              placeholder="Search supplements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10
                         px-4 py-3 text-sm focus:border-red-600 outline-none rounded-lg"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {filtered.map((product) => {
                const inCart = cart.find((i) => i._id === product._id);
                return (
                  <div
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      inCart
                        ? "border-red-600 bg-red-600/10"
                        : "border-white/10 bg-neutral-900 hover:border-red-600/30"
                    } ${product.quantity <= 0 ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-sm">{product.productName}</h3>
                      {inCart && (
                        <span className="text-red-500 text-sm">✓ {inCart.quantity}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-red-400">
                        ₹{product.salePrice}
                      </span>
                      <span className="text-xs text-gray-500">Stock: {product.quantity}</span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-gray-500 text-sm col-span-2 text-center py-8">
                  No supplements found
                </p>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border border-white/10 p-4 rounded-xl space-y-3">
              <p className="text-xs tracking-widest text-gray-400 flex items-center gap-2">
                <ShoppingCart size={14} /> CART ({cart.length})
              </p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-neutral-900/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">₹{item.salePrice} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => decrementItem(item._id)}
                        className="w-7 h-7 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 text-white"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 text-white"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            label="CUSTOMER NAME (OPTIONAL)"
            name="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          {/* Discount Section - Disabled for Sponsor */}
          {!isSponsor ? (
            <div className="border border-white/10 p-4 rounded-xl space-y-3">
              <p className="text-xs tracking-widest text-gray-400">DISCOUNT</p>

              <div className="flex gap-2">
                {[
                  { key: "none", label: "NO DISCOUNT" },
                  { key: "coupon", label: "COUPON" },
                  { key: "manual", label: "MANUAL" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchDiscountMode(key)}
                    className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold tracking-widest transition ${
                      discountMode === key
                        ? "bg-red-600 text-white"
                        : "bg-neutral-900 border border-white/10 text-gray-400 hover:border-red-600/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {discountMode === "coupon" && (
                <>
                  {!appliedCoupon ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-green-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => applyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm rounded-lg hover:brightness-110 disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
                      >
                        {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : "APPLY"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-600/10 border border-green-600/30 rounded-lg p-3 flex-wrap gap-2">
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
                </>
              )}

              {discountMode === "manual" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {["percentage", "flat"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setManualType(t)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold tracking-widest transition ${
                          manualType === t
                            ? "bg-white/10 border border-white/30 text-white"
                            : "bg-neutral-900 border border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {t === "percentage" ? "PERCENTAGE (%)" : "FLAT (₹)"}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder={manualType === "percentage" ? "e.g. 10" : "e.g. 100"}
                      value={manualValue}
                      onChange={(e) => setManualValue(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-red-600 outline-none"
                    />
                    <span className="text-sm text-gray-400 shrink-0">
                      {manualType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>

                  {manualDiscountAmount > 0 && (
                    <p className="text-xs text-green-400">
                      Discount applied: ₹{manualDiscountAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-green-600/30 bg-green-600/10 p-4 rounded-xl">
              <p className="text-center text-green-400 font-bold">
                🎁 SPONSOR BILL - 100% DISCOUNT APPLIED
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Free supplements for trainer
              </p>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs tracking-widest text-gray-400">PAYMENT METHOD</label>
            <div className="flex gap-2">
              {["cash", "upi"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    if (isSponsor && method !== "cash") {
                      toast.error("Sponsor bills must use cash payment");
                      return;
                    }
                    setPaymentMethod(method);
                  }}
                  className={`flex-1 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition ${
                    paymentMethod === method
                      ? "bg-red-600 text-white"
                      : "bg-neutral-900 border border-white/10 text-gray-400 hover:border-red-600/30"
                  } ${isSponsor && method !== "cash" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {method}
                </button>
              ))}
            </div>
            {isSponsor && (
              <p className="text-xs text-gray-500 text-center">Sponsor bills use cash payment by default</p>
            )}
          </div>

          {cart.length > 0 && (
            <div className={`bg-gradient-to-br from-neutral-900 to-black border rounded-xl p-4 space-y-2 ${
              isSponsor ? "border-green-600/20" : "border-red-600/20"
            }`}>
              <p className="text-xs uppercase font-black text-gray-400">💰 PRICE BREAKDOWN</p>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>

                {activeDiscount > 0 && (
                  <div className={`flex justify-between ${
                    isSponsor ? "text-green-400" : "text-green-400"
                  }`}>
                    <span>
                      {isSponsor ? "Sponsor Discount (100%):" : 
                        discountMode === "coupon" ? "Coupon Discount:" : "Manual Discount:"}
                    </span>
                    <span>-₹{activeDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className={`h-px bg-gradient-to-r ${
                  isSponsor ? "from-green-600/20" : "from-red-600/20"
                } to-transparent my-2`}></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">TOTAL AMOUNT:</span>
                  <span className={`font-black text-lg bg-gradient-to-r ${
                    isSponsor ? "from-green-400 to-green-500" : "from-red-400 to-red-500"
                  } bg-clip-text text-transparent`}>
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {activeDiscount > 0 && !isSponsor && (
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-2 mt-2">
                  <p className="text-xs text-green-400">
                    🎉 You saved ₹{activeDiscount.toFixed(2)}!
                  </p>
                </div>
              )}
            </div>
          )}

          <Actions 
            loading={loading} 
            onClose={onClose} 
            onSubmit={handleCheckout}
            isSponsor={isSponsor}
          />
        </div>
      )}
    </Modal>
  );
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

function Actions({ loading, onClose, onSubmit, isSponsor }) {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="w-full sm:w-auto border border-white/20 px-6 py-3 text-xs font-bold disabled:opacity-40 rounded-lg"
      >
        CANCEL
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`w-full sm:w-auto px-8 py-3 text-xs font-extrabold tracking-widest rounded-lg disabled:opacity-40 ${
          isSponsor 
            ? "bg-green-600 hover:bg-green-700" 
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? "PROCESSING..." : (isSponsor ? "CREATE SPONSOR BILL" : "COMPLETE SALE")}
      </button>
    </div>
  );
}