import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios.api";
import { Download, Eye, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CafePaymentsOfAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
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
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

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

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, avgOrderValue };
  }, [filteredOrders]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

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
    link.download = `cafe_orders_${startDate}_to_${endDate}.csv`;
    link.click();
    toast.success("CSV exported successfully!");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 mt-4 font-medium">Loading cafe orders...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black py-4 md:py-8 space-y-6">
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col lg:flex-row gap-4 justify-between border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-5 md:p-8 rounded-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">
              CAFE <span className="text-red-600">PAYMENTS</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Order Management & Revenue Tracking
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto h-fit"
          >
            <Download size={16} />
            EXPORT CSV
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
          />

          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
          />

          <StatCard
            label="Avg Order Value"
            value={`₹${stats.avgOrderValue.toFixed(2)}`}
          />
        </div>

        <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-widest uppercase">
            Filters
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Admin</label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Admins</option>
                {adminNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-8 md:p-12 text-center">
            <p className="text-gray-500 font-semibold">NO CAFE ORDERS FOUND</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl">
            <div className="lg:hidden space-y-3 p-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="group relative flex flex-col rounded-xl overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 hover:border-red-600/40 transition"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-base sm:text-lg font-black text-white mt-1 truncate">
                          {order.user?.name || "Walk-in"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Admin: {order.handledBy?.username || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <OrderStat label="Total" value={`₹${order.totalAmount}`} />
                      <OrderStat label="Items" value={order.items.length} />
                      <OrderStat label="Payment" value={order.paymentMethod} />
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[9px] text-gray-500 tracking-widest mb-2 uppercase">Items</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-300">
                            {item.name} ×{item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-extrabold rounded-none transition"
                  >
                    <Eye size={14} />
                    VIEW DETAILS
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase text-gray-500 border-b border-white/10 bg-neutral-900 font-extrabold tracking-wider">
                    <th className="p-4 text-left">Order ID</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Admin</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Payment</th>
                    <th className="p-4 text-left">Items</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition"
                    >
                      <td className="p-4 text-gray-300 font-mono text-xs">
                        {order._id.slice(-6)}
                      </td>

                      <td className="p-4 text-gray-300">
                        {order.user?.name || "Walk-in"}
                      </td>

                      <td className="p-4 text-gray-300 text-sm">
                        {order.handledBy?.username || "—"}
                      </td>

                      <td className="p-4 text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 uppercase text-gray-300 text-xs font-semibold">
                        {order.paymentMethod}
                      </td>

                      <td className="p-4 text-gray-300">
                        {order.items.length} items
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-black text-red-600">
                          ₹{order.totalAmount}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-red-600/20 hover:bg-red-600 px-3 py-1 text-[9px] font-extrabold rounded-lg transition"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

const StatCard = ({ label, value }) => (
  <div className="group relative flex flex-col rounded-xl overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 hover:border-red-600/40 transition p-4">
    <p className="text-[9px] tracking-widest text-gray-500 font-semibold uppercase">
      {label}
    </p>
    <p className="text-xl sm:text-2xl font-black text-white mt-2">
      {value}
    </p>
  </div>
);

const OrderStat = ({ label, value }) => (
  <div className="bg-black/40 border border-white/5 rounded-md p-2 text-center">
    <p className="text-[9px] tracking-widest text-gray-500">{label}</p>
    <p className="font-bold text-xs text-gray-300 mt-1">{value}</p>
  </div>
);

function OrderModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-black via-neutral-900 to-black w-full max-w-2xl rounded-2xl p-6 border border-white/10 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-white mb-6 tracking-widest uppercase">
          Order <span className="text-red-600">Details</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-[9px] tracking-widest text-gray-500 font-semibold uppercase">Order Information</p>
            <div className="border border-white/10 rounded-lg p-4 space-y-2">
              <ModalRow label="Order ID" value={order._id} />
              <ModalRow label="Admin" value={order.handledBy?.username || "—"} />
              <ModalRow label="Payment" value={order.paymentMethod} />
              {order.upiRef && (
                <ModalRow label="UPI Ref" value={order.upiRef} />
              )}
              <ModalRow label="Status" value={order.status} />
              <ModalRow label="Date" value={new Date(order.createdAt).toLocaleString()} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] tracking-widest text-gray-500 font-semibold uppercase">Customer</p>
            <div className="border border-white/10 rounded-lg p-4 space-y-2">
              <ModalRow label="Name" value={order.user?.name || "Walk-in"} />
              <ModalRow label="Phone" value={order.user?.phoneNumber || "—"} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] tracking-widest text-gray-500 font-semibold uppercase">Items</p>
            <div className="border border-white/10 rounded-lg p-4 space-y-3">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
                  <div>
                    <p className="font-bold text-white">{i.name}</p>
                    <p className="text-xs text-gray-400">×{i.quantity}</p>
                  </div>
                  <span className="font-black text-red-600">₹{i.priceAtPurchase * i.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {order.discount?.amount > 0 && (
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-green-500 font-bold text-sm">
                Discount ({order.discount.code}): ₹{order.discount.amount}
              </p>
            </div>
          )}

          <div className="border border-white/10 rounded-lg p-4 bg-neutral-900">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">TOTAL</span>
              <span className="text-2xl font-black text-red-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ModalRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="font-semibold text-white text-sm">{value}</span>
  </div>
);