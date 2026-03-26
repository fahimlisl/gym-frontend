import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  confirmed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  shipped:   "bg-blue-500/10  text-blue-400  border-blue-500/30",
  delivered: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/10   text-red-400   border-red-500/30",
  pending:   "bg-zinc-500/10  text-zinc-400  border-zinc-500/30",
};

const NEXT_LABEL = {
  confirmed: "Mark Shipped",
  shipped:   "Mark Delivered",
  delivered: "Reset",
};

export default function SuppBillsAdmin() {
  const [bills, setBills]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // billId being toggled

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/fetch/supp/bill/all");
      setBills(data.data);
    } catch (err) {
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const handleToggle = async (billId) => {
    setToggling(billId);
    try {
      const { data } = await api.get(`/admin/supp/bill/toggle/${billId}`);
      // update locally — no need to refetch
      setBills((prev) =>
        prev.map((b) => (b._id === billId ? data.data : b))
      );
      toast.success(`Status → ${data.data.status}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            SUPPLEMENT <span className="text-red-600">ORDERS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">{bills.length} total orders</p>
        </div>
        <button
          onClick={fetchBills}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold transition"
        >
          ↻ Refresh
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-gray-500 font-mono">
                    #{bill._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-white font-bold mt-0.5">
                    {bill.guestInfo?.fullName || "Registered User"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {bill.guestInfo?.phone || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[bill.status]}`}>
                    {bill.status}
                  </span>

                  {/* Toggle button */}
                  {bill.status !== "cancelled" && (
                    <button
                      onClick={() => handleToggle(bill._id)}
                      disabled={toggling === bill._id}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                    >
                      {toggling === bill._id ? "..." : NEXT_LABEL[bill.status]}
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {bill.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-zinc-800 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{item.productName}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm font-bold">₹{item.subtotal}</p>
                  </div>
                ))}
              </div>

              {/* Bill summary */}
              <div className="border-t border-zinc-800 pt-3 flex flex-wrap gap-4 justify-between items-end">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Subtotal: <span className="text-gray-300">₹{bill.subtotal}</span></p>
                  {bill.discountAmount > 0 && (
                    <p>
                      Discount ({bill.discount?.code}):
                      <span className="text-green-400"> -₹{bill.discountAmount}</span>
                    </p>
                  )}
                  <p>Payment: <span className="text-gray-300 capitalize">{bill.paymentMethod}</span></p>
                  <p>Date: <span className="text-gray-300">
                    {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span></p>
                </div>

                <p className="text-2xl font-black text-red-500">₹{bill.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}