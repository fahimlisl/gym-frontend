import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";
import CafeAdminDashboardLayout from "../../components/layout/CafeAdminDashboardLayout";

export default function CafeAdminDashboard() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(null);

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [upiRef, setUpiRef] = useState("");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const fetchItems = async () => {
    const res = await axios.get("/cafe/admin/fetchAllCafeItem");
    setItems(res.data.data);
  };

  const fetchCart = async () => {
    const res = await axios.get("/cafe/admin/fetchCart");
    setCart(res.data.data);
  };

  useEffect(() => {
    fetchItems();
    fetchCart();
  }, []);

  const handleAddToCart = async () => {
    if (!itemId) return toast.error("Select an item");
    setLoading(true);
    await axios.post("/cafe/admin/addToCart", { itemId, quantity });
    setQuantity(1);
    fetchCart();
    setLoading(false);
  };

  const handleIncrementItem = async (itemId) => {
    await axios.patch("/cafe/admin/incrementCartItem", { itemId });
    fetchCart();
  };

  const handleDecrementItem = async (itemId) => {
    await axios.patch("/cafe/admin/decrementCartItem", { itemId });
    fetchCart();
  };

  const handleRemoveItem = async (itemId) => {
    await axios.patch("/cafe/admin/removeFromCart", { itemId });
    fetchCart();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter coupon code");

    try {
      setCouponLoading(true);
      await axios.patch("/cafe/admin/applyCoupon", {
        code: couponCode.trim().toUpperCase(),
      });
      toast.success("Coupon applied");
      fetchCart();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Coupon cannot be applied"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setCouponLoading(true);
      await axios.patch("/cafe/admin/removeCoupon");
      setCouponCode("");
      fetchCart();
    } catch {
      toast.error("Failed to remove coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0)
      return toast.error("Cart is empty");

    // if (!name.trim()) return toast.error("Customer name is required");
    if (!phoneNumber.trim())
      return toast.error("Phone number is required");

    if (paymentMethod === "upi" && !upiRef)
      return toast.error("UPI reference required");

    setLoading(true);
    await axios.post("/cafe/admin/checkout", {
      paymentMethod,
      upiRef,
      name,
      phoneNumber,
      email,
    });
    setCart(null);
    setCouponCode("");
    setUpiRef("");
    setName("");
    setPhoneNumber("");
    setEmail("");

    setLoading(false);
    toast.success("Order placed");
  };

  return (
    <CafeAdminDashboardLayout title="Cafe POS">
      <div className="h-[calc(100vh-80px)] grid grid-cols-1 xl:grid-cols-3 gap-6 bg-gray-100 p-4 text-black">

        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Products</h2>

          <div className="flex gap-3 mb-6">
            <select
              className="flex-1 border rounded-xl px-4 py-3"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              <option value="">Select Item</option>
              {items.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} — ₹{i.price}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="w-24 border rounded-xl px-3 py-3 text-center"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="bg-black text-white px-8 rounded-xl font-semibold"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((i) => (
              <div
                key={i._id}
                onClick={() => setItemId(i._id)}
                className={`p-4 rounded-xl border cursor-pointer ${
                  itemId === i._id
                    ? "bg-black text-white"
                    : "bg-white hover:shadow"
                }`}
              >
                <p className="font-semibold">{i.name}</p>
                <p className="text-sm">₹{i.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Bill</h2>

          {!cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Cart is empty
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {cart.items.map((i) => (
                  <div
                    key={i._id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold">{i.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{i.price} × {i.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrementItem(i.item)}
                        className="w-8 h-8 rounded-full border font-bold"
                      >
                        −
                      </button>

                      <span className="min-w-[80px] text-right font-bold">
                        ₹{i.price * i.quantity}
                      </span>

                      <button
                        onClick={() => handleIncrementItem(i.item)}
                        className="w-8 h-8 rounded-full border font-bold"
                      >
                        +
                      </button>

                      <button
                        onClick={() => handleRemoveItem(i.item)}
                        className="text-red-600 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {cart.discount
                      ? cart.totalAmount + cart.discount.amount
                      : cart.totalAmount}
                  </span>
                </div>

                {cart.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({cart.discount.code})</span>
                    <span>-₹{cart.discount.amount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{cart.totalAmount}</span>
                </div>
              </div>

              <div className="mt-4">
                {!cart.discount ? (
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border rounded-xl px-4 py-3"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-black text-white px-5 rounded-xl"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 border rounded-xl px-4 py-3">
                    <span className="text-green-700 font-semibold">
                      {cart.discount.code} applied
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mt-6 space-y-4">
                <select
                  className="w-full border rounded-xl px-4 py-3"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>

                {paymentMethod === "upi" && (
                  <input
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="UPI Reference ID"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                  />
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-xl font-bold"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </CafeAdminDashboardLayout>
  );
}
