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
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/cafe/admin/fetchAllCafeItem");
      setItems(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch cafe items");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get("/cafe/admin/fetchCart");
      setCart(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch cart");
    }
  };

  const handleAddToCart = async () => {
    if (!itemId) return toast.error("Select an item");

    try {
      setLoading(true);
      await axios.post("/cafe/admin/addToCart", {
        itemId,
        quantity,
        paymentMethod,
      });
      toast.success("Item added to cart");
      setQuantity(1);
      fetchCart(); // 🔥 ALWAYS refresh cart
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return toast.error("Cart is empty");

    if (paymentMethod === "upi" && !upiRef)
      return toast.error("UPI reference required");

    try {
      setLoading(true);
      await axios.post("/cafe/admin/checkout", {
        paymentMethod,
        upiRef,
      });
      toast.success("Order placed successfully");
      setCart(null);
      setUpiRef("");
    } catch (err) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCart();
  }, []);

  return (
    <CafeAdminDashboardLayout title="Cafe POS">
      <div className="h-[calc(100vh-80px)] grid grid-cols-1 xl:grid-cols-3 gap-6 bg-gray-100 p-2">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Products</h2>
            <span className="text-sm text-gray-500">Tap to add</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <select
              className="flex-1 min-w-[220px] border border-gray-300 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-black outline-none"
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
              className="w-24 border border-gray-300 rounded-xl px-3 py-3 text-center text-black focus:ring-2 focus:ring-black outline-none"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 active:scale-[0.98]"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
            {items.map((i) => (
              <div
                key={i._id}
                onClick={() => setItemId(i._id)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all duration-150
              ${
                itemId === i._id
                  ? "border-black bg-black text-white shadow-md scale-[1.02]"
                  : "border-gray-200 hover:border-grey-300 hover:shadow text-black"
              }
            `}
              >
                <h3 className="font-semibold text-base">{i.name}</h3>
                <p
                  className={`text-sm mt-1 ${
                    itemId === i._id ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  ₹{i.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Bill</h2>
            <p className="text-sm text-gray-500">Live order summary</p>
          </div>

          {!cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
              Cart is empty
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {cart.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-black">{i.name}</p>
                      <p className="text-xs text-gray-600">
                        {i.quantity} × ₹{i.price}
                      </p>
                    </div>
                    <span className="font-bold text-black">
                      ₹{i.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 flex justify-between items-center text-xl font-bold text-black">
                <span>Total</span>
                <span>₹{cart.totalAmount}</span>
              </div>

              <div className="mt-6 space-y-4">
                <select
                  className="w-full border border-gray-300 text-black rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>

                {paymentMethod === "upi" && (
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none text-black"
                    placeholder="UPI Reference ID"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                  />
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-xl font-bold active:scale-[0.98]"
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
