import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "../../api/axios.api";
import CafeAdminDashboardLayout from "../../components/layout/CafeAdminDashboardLayout";

export default function CafePayments() {
  let i = 1;
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
      const paymentDate = new Date(p.createdAt);

      if (methodFilter !== "all" && p.paymentMethod !== methodFilter) {
        return false;
      }

      if (fromDate && paymentDate < new Date(fromDate)) {
        return false;
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        if (paymentDate > endDate) return false;
      }

      return true;
    });
  }, [payments, fromDate, toDate, methodFilter]);

  const exportToExcel = () => {
    const excelData = filteredPayments.map((order, index) => {
      const itemsSummary = order.items
        .map(
          (item) =>
            `${item.name} (${item.quantity} × ₹${item.priceAtPurchase})`,
        )
        .join(", ");

      return {
        SlNo: index + 1,
        OrderID: order._id,
        Date: new Date(order.createdAt).toLocaleString(),

        Items: itemsSummary,

        TotalAmount: order.totalAmount,
        PaymentMethod: order.paymentMethod.toUpperCase(),
        TransactionID: order.paymentMethod === "upi" ? order.upiRef : "-",
        Status: order.status,

        DiscountAmount: order.discount?.amount || 0,
        DiscountType: order.discount?.typeOfDiscount || "none",
        DiscountValue: order.discount?.value || 0,
        DiscountCode: order.discount?.code || "",

        HandledBy: order.handledBy,
      };
    });

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
      "cafe-payments.xlsx",
    );
  };

  return (
    <CafeAdminDashboardLayout title="Cafe Payments">
      <div className="bg-black text-white p-6 rounded-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-red-500">Payments</h2>

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
            <label className="text-xs text-gray-400 block mb-1">To Date</label>
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
                  <th>Si.no</th>
                  <th className="p-2">Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Txn ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-800">
                    <td className="p-2">{i++}</td>
                    <td className="p-2">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="text-green-400">₹{p.totalAmount}</td>
                    <td className="uppercase">{p.paymentMethod}</td>
                    <td className="text-xs">
                      {p.paymentMethod === "upi" ? p.upiRef : "-"}
                    </td>
                    <td className="text-green-500">{p.status}</td>
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
            <div className="flex justify-between mb-4">
              <h3 className="text-red-500 font-semibold">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)}>✕</button>
            </div>

            {selectedPayment && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-gray-900 text-white w-full max-w-2xl rounded-lg p-6 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-red-500">
                      Payment Details
                    </h3>
                    <button
                      onClick={() => setSelectedPayment(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <p>
                      <span className="text-gray-400">Order ID:</span>
                      <br />
                      {selectedPayment._id}
                    </p>
                    <p>
                      <span className="text-gray-400">Date:</span>
                      <br />
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-gray-400">Status:</span>
                      <br />
                      {selectedPayment.status}
                    </p>
                    <p>
                      <span className="text-gray-400">Payment Method:</span>
                      <br />
                      {selectedPayment.paymentMethod.toUpperCase()}
                    </p>

                    {selectedPayment.paymentMethod === "upi" && (
                      <p className="col-span-2">
                        <span className="text-gray-400">Transaction ID:</span>
                        <br />
                        {selectedPayment.upiRef}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="text-red-400 font-semibold mb-2">Items</h4>
                    <div className="space-y-2">
                      {selectedPayment.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between border-b border-gray-700 pb-2 text-sm"
                        >
                          <div>
                            <p>{item.name}</p>
                            <p className="text-gray-400">
                              Qty: {item.quantity} × ₹{item.priceAtPurchase}
                            </p>
                          </div>
                          <p className="text-green-400">
                            ₹{item.quantity * item.priceAtPurchase}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 text-sm">
                    <h4 className="text-red-400 font-semibold mb-2">
                      Discount
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <p>
                        <span className="text-gray-400">Type:</span>{" "}
                        {selectedPayment.discount?.typeOfDiscount || "none"}
                      </p>
                      <p>
                        <span className="text-gray-400">Value:</span>{" "}
                        {selectedPayment.discount?.value || 0}
                      </p>
                      <p>
                        <span className="text-gray-400">Amount:</span> ₹
                        {selectedPayment.discount?.amount || 0}
                      </p>
                      <p>
                        <span className="text-gray-400">Code:</span>{" "}
                        {selectedPayment.discount?.code || "-"}
                      </p>
                    </div>
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
          </div>
        </div>
      )}
    </CafeAdminDashboardLayout>
  );
}
