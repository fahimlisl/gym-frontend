import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "../../api/axios.api";
import CafeAdminDashboardLayout from "../../components/layout/CafeAdminDashboardLayout";

export default function CafePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/cafe/admin/fetchAllCafeOrders");
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const date = new Date(p.createdAt);

      if (methodFilter !== "all" && p.paymentMethod !== methodFilter) {
        return false;
      }

      if (fromDate && date < new Date(fromDate)) return false;

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }

      return true;
    });
  }, [payments, fromDate, toDate, methodFilter]);

  const exportToExcel = () => {
    const excelData = filteredPayments.map((order, index) => ({
      SlNo: index + 1,
      OrderID: order._id,
      Date: new Date(order.createdAt).toLocaleString(),

      CustomerName: order.user?.name || "Walk-in",
      Phone: order.user?.phoneNumber || "",
      Email: order.user?.email || "",
      CustomerType: order.customer ? "Member" : "Walk-in",

      Items: order.items
        .map(
          (i) => `${i.name} (${i.quantity} × ₹${i.priceAtPurchase})`
        )
        .join(", "),

      TotalAmount: order.totalAmount,
      PaymentMethod: order.paymentMethod.toUpperCase(),
      TransactionID: order.paymentMethod === "upi" ? order.upiRef : "-",
      Status: order.status,

      DiscountAmount: order.discount?.amount || 0,
      DiscountType: order.discount?.typeOfDiscount || "none",
      DiscountValue: order.discount?.value || 0,
      DiscountCode: order.discount?.code || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cafe Payments");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "cafe-payments.xlsx"
    );
  };

  return (
    <CafeAdminDashboardLayout title="Cafe Payments">
      <div className="bg-black text-white p-6 rounded-lg">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-red-500">
            Payments
          </h2>
          <button
            onClick={exportToExcel}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Export Excel
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-3 py-1 rounded"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-3 py-1 rounded"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Payment Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-3 py-1 rounded"
            >
              <option value="all">All</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading payments...</p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-gray-400 text-center">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  <th>Sl.No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Txn ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((p, index) => (
                  <tr key={p._id} className="border-b border-gray-800">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <p className="font-medium">
                        {p.user?.name || "Walk-in"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.user?.phoneNumber || "-"}
                      </p>
                    </td>
                    <td className="text-green-400">
                      ₹{p.totalAmount}
                    </td>
                    <td className="uppercase">
                      {p.paymentMethod}
                    </td>
                    <td className="text-xs">
                      {p.paymentMethod === "upi" ? p.upiRef : "-"}
                    </td>
                    <td className="text-green-500">
                      {p.status}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="text-red-400 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full max-w-2xl rounded-lg p-6 overflow-y-auto max-h-[90vh]">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-500">
                Payment Details
              </h3>
              <button onClick={() => setSelectedPayment(null)}>✕</button>
            </div>

            <div className="mb-4 text-sm">
              <h4 className="text-red-400 font-semibold mb-2">
                Customer
              </h4>
              <p><b>Name:</b> {selectedPayment.user?.name || "Walk-in"}</p>
              <p><b>Phone:</b> {selectedPayment.user?.phoneNumber || "-"}</p>
              <p><b>Email:</b> {selectedPayment.user?.email || "-"}</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedPayment.customer ? "Registered Member" : "Walk-in Customer"}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-red-400 font-semibold mb-2">Items</h4>
              {selectedPayment.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b border-gray-700 py-2 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-green-400">
                    ₹{item.quantity * item.priceAtPurchase}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4 text-sm">
              <p><b>Method:</b> {selectedPayment.paymentMethod.toUpperCase()}</p>
              {selectedPayment.paymentMethod === "upi" && (
                <p><b>Txn ID:</b> {selectedPayment.upiRef}</p>
              )}
              <p><b>Status:</b> {selectedPayment.status}</p>
            </div>

            <div className="mb-4 text-sm">
              <h4 className="text-red-400 font-semibold mb-2">Discount</h4>
              <p>Type: {selectedPayment.discount?.typeOfDiscount || "none"}</p>
              <p>Value: {selectedPayment.discount?.value || 0}</p>
              <p>Amount: ₹{selectedPayment.discount?.amount || 0}</p>
              <p>Code: {selectedPayment.discount?.code || "-"}</p>
            </div>

            <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-400">
                ₹{selectedPayment.totalAmount}
              </span>
            </div>

          </div>
        </div>
      )}
    </CafeAdminDashboardLayout>
  );
}
