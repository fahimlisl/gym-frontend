import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";
import { Plus, X, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout.jsx";

export default function AdminInventory() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/fetchEquipmentsExpenses");
      setExpenses(res.data.data || []);
    } catch {
      toast.error("Failed to fetch equipment expenses");
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

      return date >= fromDate && date <= toDate;
    });
  }, [expenses, fromDate, toDate]);

  const exportExcel = () => {
    if (!filteredExpenses.length) {
      return toast.error("No data to export");
    }

    const data = filteredExpenses.map((e) => ({
      Date: new Date(e.createdAt).toLocaleDateString(),
      Title: e.title,
      Amount: e.amount,
      Category: e.category,
      PaymentMethod: e.paymentMethod,
      TransactionId: e.transactionId || "",
      Remarks: e.remarks || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment Expenses");

    XLSX.writeFile(
      wb,
      `Equipment_Expenses_${fromDate}_to_${toDate}.xlsx`
    );

    toast.success("Excel exported");
  };

  const addExpense = async () => {
    if (!title || !amount || !paymentMethod) {
      return toast.error("Title, amount & payment method required");
    }

    if (paymentMethod === "UPI" && !transactionId) {
      return toast.error("UPI Transaction ID required");
    }

    try {
      await api.post("/admin/add-expense", {
        title,
        amount: Number(amount),
        remarks,
        category: "EQUIPMENT",
        paymentMethod,
        transactionId,
      });

      toast.success("Expense added");
      setOpen(false);
      setTitle("");
      setAmount("");
      setRemarks("");
      setTransactionId("");
      fetchExpenses();
    } catch {
      toast.error("Failed to add expense");
    }
  };

  const totalSpent = filteredExpenses.reduce(
    (s, e) => s + e.amount,
    0
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-widest">
              ASSETS
            </h1>
            <p className="text-sm text-gray-400">
              Equipment expenses & purchases
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2
                         border border-emerald-600 px-5 py-2
                         font-extrabold tracking-widest
                         hover:bg-emerald-600 transition"
            >
              <FileSpreadsheet size={16} />
              EXPORT
            </button>

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2
                         border border-red-600 px-5 py-2
                         font-extrabold tracking-widest
                         hover:bg-red-600 transition"
            >
              <Plus size={16} /> ADD EXPENSE
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-black border px-3 py-2"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-black border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat
            label="TOTAL EQUIPMENT EXPENSES"
            value={`₹ ${totalSpent}`}
          />
          <Stat
            label="ITEMS BOUGHT"
            value={filteredExpenses.length}
          />
          <Stat label="CATEGORY" value="EQUIPMENT" />
        </div>

        {loading && (
          <p className="text-gray-500 tracking-widest">
            LOADING EXPENSES...
          </p>
        )}

        {!loading && filteredExpenses.length === 0 && (
          <div className="border border-white/10 p-10 text-center text-gray-500">
            NO EQUIPMENT EXPENSES FOUND
          </div>
        )}

        {!loading && filteredExpenses.length > 0 && (
          <div className="space-y-3">
            {filteredExpenses.map((e) => (
              <div
                key={e._id}
                className="border border-neutral-800 rounded-xl
                           bg-black p-5 flex justify-between"
              >
                <div>
                  <p className="font-bold tracking-wide">
                    {e.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {e.remarks || "—"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {new Date(e.createdAt).toLocaleDateString()} ·{" "}
                    {e.paymentMethod}
                  </p>
                </div>

                <p className="text-xl font-black text-red-500">
                  ₹ {e.amount}
                </p>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 bg-black/80
                          flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-black
                            border border-red-600/40
                            rounded-2xl p-6 space-y-5">

              <div className="flex justify-between items-center">
                <h2 className="font-black tracking-widest">
                  ADD EQUIPMENT EXPENSE
                </h2>
                <button onClick={() => setOpen(false)}>
                  <X />
                </button>
              </div>

              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border px-3 py-2"
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black border px-3 py-2"
              />

              <textarea
                placeholder="Remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-black border px-3 py-2"
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-black border px-3 py-2"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NETBANKING">Net Banking</option>
              </select>

              {paymentMethod === "UPI" && (
                <input
                  placeholder="UPI Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-black border px-3 py-2"
                />
              )}

              <button
                onClick={addExpense}
                className="w-full border border-red-600 py-3
                           font-extrabold tracking-widest
                           hover:bg-red-600"
              >
                ADD EXPENSE
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-black p-5 rounded-xl">
      <p className="text-xs text-gray-400 tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black mt-2">
        {value}
      </p>
    </div>
  );
}
