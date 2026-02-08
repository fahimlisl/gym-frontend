import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";
import * as XLSX from "xlsx";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";

const categories = [
  "RENT",
  "SALARY",
  "ELECTRICITY",
  "WATER",
  "EQUIPMENT",
  "MAINTENANCE",
  "MARKETING",
  "INTERNET",
  "ETC",
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    remarks: "",
    category: "",
    paymentMethod: "cash",
    transactionId: "",
  });

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/admin/fetchAllExpenses");
      setExpenses(res.data.data || []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const date = new Date(e.createdAt)
        .toISOString()
        .split("T")[0];

      return (
        date >= fromDate &&
        date <= toDate &&
        (categoryFilter === "all" ||
          e.category === categoryFilter)
      );
    });
  }, [expenses, fromDate, toDate, categoryFilter]);

  const exportExcel = () => {
    if (!filteredExpenses.length) {
      return toast.error("No data to export");
    }

    const data = filteredExpenses.map((e) => ({
      Date: new Date(e.createdAt).toLocaleDateString(),
      Title: e.title,
      Category: e.category,
      Amount: e.amount,
      PaymentMethod: e.paymentMethod,
      Remarks: e.remarks || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    XLSX.writeFile(
      wb,
      `Expenses_${fromDate}_to_${toDate}.xlsx`,
      { bookType: "xlsx" }
    );

    toast.success("Excel exported");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/admin/add-expense", form);
      toast.success("Expense added");
      setShowModal(false);
      setForm({
        title: "",
        amount: "",
        remarks: "",
        category: "",
        paymentMethod: "cash",
        transactionId: "",
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">

        <div className="border border-red-600/30 bg-black p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-widest">
              EXPENSES
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Track & manage outgoing payments
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 font-bold tracking-widest"
          >
            + ADD EXPENSE
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={exportExcel}
            className="ml-auto bg-green-600 hover:bg-green-700 px-6 py-2 font-bold"
          >
            EXPORT EXCEL
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 tracking-widest">
            LOADING EXPENSES...
          </p>
        ) : (
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-white/10">
                  <th className="p-3 text-left">DATE</th>
                  <th className="p-3 text-left">TITLE</th>
                  <th className="p-3 text-left">CATEGORY</th>
                  <th className="p-3 text-right">AMOUNT (₹)</th>
                  <th className="p-3 text-left">METHOD</th>
                  <th className="p-3 text-left">REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e) => (
                  <tr
                    key={e._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="p-3">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold">
                      {e.title}
                    </td>
                    <td className="p-3 text-xs tracking-widest">
                      {e.category}
                    </td>
                    <td className="p-3 text-right text-red-500 font-bold">
                      ₹{e.amount}
                    </td>
                    <td className="p-3 uppercase text-sm">
                      {e.paymentMethod}
                    </td>
                    <td className="p-3 text-gray-400 text-sm">
                      {e.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredExpenses.length && (
              <p className="text-center text-gray-500 py-6">
                No expenses found for selected filters
              </p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white/10 w-full max-w-lg p-6">

            <h2 className="text-xl font-black tracking-widest mb-6">
              ADD EXPENSE
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                className="w-full bg-black border border-white/20 px-4 py-3"
                placeholder="Expense title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full bg-black border border-white/20 px-4 py-3"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />

              <select
                className="w-full bg-black border border-white/20 px-4 py-3"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="w-full bg-black border border-white/20 px-4 py-3"
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>

              {form.paymentMethod === "upi" && (
                <input
                  className="w-full bg-black border border-white/20 px-4 py-3"
                  placeholder="UPI Transaction ID"
                  value={form.transactionId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      transactionId: e.target.value,
                    })
                  }
                />
              )}

              <textarea
                className="w-full bg-black border border-white/20 px-4 py-3"
                placeholder="Remarks"
                rows={3}
                value={form.remarks}
                onChange={(e) =>
                  setForm({ ...form, remarks: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-white/20"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 font-bold"
                >
                  SAVE EXPENSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
