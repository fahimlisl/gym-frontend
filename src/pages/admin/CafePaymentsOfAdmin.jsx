import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios.api";
import { Download, Eye, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CafePaymentsOfAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [adminFilter, setAdminFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/admin/fetchAllCafeOrders");
      setOrders(data.data);
    } catch {
      toast.error("Failed to fetch cafe orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
        .toISOString()
        .split("T")[0];

      const withinDate =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);

      const matchesAdmin =
        adminFilter === "all" ||
        order.handledBy?.username === adminFilter;

      return withinDate && matchesAdmin;
    });
  }, [orders, startDate, endDate, adminFilter]);

  const adminNames = [
    ...new Set(
      orders.map((o) => o.handledBy?.username).filter(Boolean)
    ),
  ];

  const exportCSV = () => {
    const headers = [
      "OrderID",
      "Date",
      "Admin",
      "PaymentMethod",
      "Status",
      "CustomerName",
      "Phone",
      "Items",
      "Discount",
      "Total",
    ];

    const rows = filteredOrders.map((o) => [
      o._id,
      new Date(o.createdAt).toLocaleString(),
      o.handledBy?.username || "Admin",
      o.paymentMethod,
      o.status,
      o.user?.name || "Walk-in",
      o.user?.phoneNumber || "",
      o.items
        .map(
          (i) =>
            `${i.name} x${i.quantity} (₹${
              i.priceAtPurchase * i.quantity
            })`
        )
        .join(" | "),
      o.discount?.amount || 0,
      o.totalAmount,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "cafe_orders_full.csv";
    link.click();
  };

  if (loading)
    return (
      <div className="p-10 text-gray-400 text-center">
        Loading Orders...
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-widest">
          CAFE <span className="text-red-600">PAYMENTS</span>
        </h1>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
        >
          <Download size={16} />
          Export Full Report
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-zinc-900 border border-white/10 p-2 rounded-lg"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-zinc-900 border border-white/10 p-2 rounded-lg"
        />

        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
          className="bg-zinc-900 border border-white/10 p-2 rounded-lg"
        >
          <option value="all">All Admins</option>
          {adminNames.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-gray-400">
            <tr>
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Admin</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr
                key={o._id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="p-4 font-mono">
                  {o._id.slice(-6)}
                </td>
                <td className="p-4">
                  {o.handledBy?.username}
                </td>
                <td className="p-4">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right text-green-500 font-bold">
                  ₹{o.totalAmount}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="bg-red-600/20 hover:bg-red-600 px-3 py-1 rounded-lg transition"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl p-6 border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-red-500">
          Order Details
        </h2>

        <div className="space-y-3 text-sm">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Admin:</strong> {order.handledBy?.username}</p>
          <p><strong>Payment:</strong> {order.paymentMethod}</p>
          {order.upiRef && (
            <p><strong>UPI Ref:</strong> {order.upiRef}</p>
          )}
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

          <div className="border-t border-white/10 pt-3 mt-3">
            <strong>Customer:</strong>
            <p>{order.user?.name || "Walk-in"}</p>
            <p>{order.user?.phoneNumber}</p>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3">
            <strong>Items:</strong>
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>₹{i.priceAtPurchase * i.quantity}</span>
              </div>
            ))}
          </div>

          {order.discount?.amount > 0 && (
            <p className="text-green-400">
              Discount: ₹{order.discount.amount} ({order.discount.code})
            </p>
          )}

          <div className="border-t border-white/10 pt-3 mt-3 text-lg font-bold text-red-500">
            Total: ₹{order.totalAmount}
          </div>
        </div>
      </div>
    </div>
  );
}