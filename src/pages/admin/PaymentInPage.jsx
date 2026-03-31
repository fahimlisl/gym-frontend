import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, Plus, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { fetchAllTransactions, createPaymentIn } from "../../api/admin.api.js";

const CREDIT_SOURCES = [
  "subscription",
  "supplement",
  "personal-training",
  "cafe",
  "paymentin",
];

const SOURCE_LABELS = {
  all: "All Sources",
  subscription: "Subscription",
  supplement: "Supplement",
  "personal-training": "Personal Training",
  cafe: "Cafe",
  expense: "Expense",
  paymentin: "Payment In",
};

const fmt = (n) => Math.round(n).toLocaleString("en-IN");

const StatCard = ({ label, value, sub, color = "text-white" }) => (
  <div className="flex flex-col rounded-xl bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 p-5">
    <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">
      {label}
    </p>
    <p className={`text-2xl font-black mt-2 ${color}`}>₹{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

const AddPaymentModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    remarks: "",
    paymentMethod: "cash",
    category: "",
    transactionId: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.remarks.trim()) {
      return toast.error("Title and remarks are required");
    }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return toast.error("Enter a valid amount");
    }
    setLoading(true);
    try {
      await createPaymentIn({
        ...form,
        amount: Number(form.amount),
      });
      toast.success("Payment added successfully!");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors placeholder:text-gray-600";
  const labelCls = "text-xs text-gray-400 font-semibold uppercase";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 py-6">
      <div className="bg-gradient-to-br from-black via-neutral-900 to-black w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <h2 className="text-base font-black tracking-widest uppercase text-white">
            Add <span className="text-red-600">Payment In</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              placeholder="Title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls}>Amount (₹) *</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Payment Method</label>
              <select
                className={inputCls + " appearance-none cursor-pointer"}
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Netbanking</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Category</label>
            <input
              className={inputCls}
              placeholder="e.g. Investment, Donation, Advance…"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>

          {form.paymentMethod === "upi" && (
            <div className="space-y-1.5">
              <label className={labelCls}>UPI Transaction ID</label>
              <input
                className={inputCls}
                placeholder="e.g. 3456789012345678"
                value={form.transactionId}
                onChange={(e) => set("transactionId", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelCls}>Remarks *</label>
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Brief note about this payment…"
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-xs font-extrabold hover:bg-white/5 transition"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition disabled:opacity-50"
          >
            {loading ? "SAVING…" : "ADD PAYMENT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PaymentInPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [view, setView] = useState("paymentin");

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [method, setMethod] = useState("all");
  const [source, setSource] = useState("all");

  const load = async () => {
    try {
      const res = await fetchAllTransactions();
      setTransactions(res.data.data || []);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const baseFiltered = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const matchesView =
        view === "paymentin" ? t.source === "paymentin" : true;
      const matchesSource = source === "all" || t.source === source;
      const matchesMethod = method === "all" || t.paymentMethod === method;
      return (
        txDate >= fromDate &&
        txDate <= toDate &&
        matchesView &&
        matchesSource &&
        matchesMethod
      );
    });
  }, [transactions, view, fromDate, toDate, source, method]);

  const statBlocks = useMemo(() => {
    const inRange = transactions.filter((t) => {
      const txDate = new Date(t.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return txDate >= fromDate && txDate <= toDate;
    });

    if (view === "paymentin") {
      const paymentins = inRange.filter((t) => t.source === "paymentin");
      const cash = paymentins
        .filter((t) => t.paymentMethod === "cash")
        .reduce((s, t) => s + t.amount, 0);
      const upi = paymentins
        .filter((t) => t.paymentMethod === "upi")
        .reduce((s, t) => s + t.amount, 0);
      const razorpay = paymentins
        .filter((t) => t.paymentMethod === "razorpay")
        .reduce((s, t) => s + t.amount, 0);
      return { cash, upi, razorpay };
    }

    const netByMethod = (m) => {
      const credits = inRange
        .filter(
          (t) =>
            CREDIT_SOURCES.includes(t.source) &&
            (m === "all" || t.paymentMethod === m),
        )
        .reduce((s, t) => s + t.amount, 0);
      const debits = inRange
        .filter(
          (t) =>
            t.source === "expense" && (m === "all" || t.paymentMethod === m),
        )
        .reduce((s, t) => s + t.amount, 0);
      return credits - debits;
    };

    return {
      cash: netByMethod("cash"),
      upi: netByMethod("upi"),
      razorpay: netByMethod("razorpay"),
    };
  }, [transactions, view, fromDate, toDate]);

  const exportExcel = () => {
    if (!baseFiltered.length) return toast.error("No data to export");
    const data = baseFiltered.map((t) => ({
      Date: new Date(t.createdAt).toLocaleDateString("en-IN"),
      Source: t.source,
      Title: t.referenceId?.title || "—",
      Amount: t.amount,
      Method: t.paymentMethod,
      Status: t.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PaymentIn");
    XLSX.writeFile(wb, `PaymentIn_${fromDate}_to_${toDate}.xlsx`, {
      bookType: "xlsx",
    });
    toast.success("Exported!");
  };

  const inputCls =
    "w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors";

  let si = 1;

  return (
    <div className="min-h-screen bg-black py-4 md:py-8 space-y-6">
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row gap-4 justify-between border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black p-5 md:p-8 rounded-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">
              PAYMENT <span className="text-red-600">IN</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Track incoming payments & credits
            </p>
          </div>
          <div className="flex gap-3 h-fit">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition px-4 py-2 text-[11px] font-extrabold rounded-lg text-gray-300"
            >
              <Download size={14} />
              EXPORT
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition px-4 py-2 text-[11px] font-extrabold rounded-lg text-white"
            >
              <Plus size={14} />
              ADD PAYMENT
            </button>
          </div>
        </div>

        <div className="flex gap-2 border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-3">
          {[
            { key: "paymentin", label: "Payment In Only" },
            { key: "all", label: "All Transactions" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setView(key);
                setSource("all");
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold transition ${
                view === key
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label={
              view === "paymentin"
                ? "Total Cash (Payment In)"
                : "Net Cash (All)"
            }
            value={fmt(statBlocks.cash)}
            color={statBlocks.cash >= 0 ? "text-green-400" : "text-red-500"}
            sub={
              view === "all"
                ? statBlocks.cash >= 0
                  ? "↑ Positive"
                  : "↓ Negative"
                : undefined
            }
          />
          <StatCard
            label={
              view === "paymentin" ? "Total UPI (Payment In)" : "Net UPI (All)"
            }
            value={fmt(statBlocks.upi)}
            color={statBlocks.upi >= 0 ? "text-green-400" : "text-red-500"}
            sub={
              view === "all"
                ? statBlocks.upi >= 0
                  ? "↑ Positive"
                  : "↓ Negative"
                : undefined
            }
          />
          <div className="col-span-2 md:col-span-1 flex flex-col rounded-xl bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 p-5">
            <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">
              {view === "paymentin"
                ? "Total Digital (Payment In)"
                : "Net Digital (All)"}
            </p>
            <p
              className={`text-2xl font-black mt-2 ${statBlocks.upi + statBlocks.razorpay >= 0 ? "text-green-400" : "text-red-500"}`}
            >
              ₹{fmt(statBlocks.upi + statBlocks.razorpay)}
            </p>
            {view === "all" && (
              <p className="text-xs text-gray-500 mt-1">
                {statBlocks.upi + statBlocks.razorpay >= 0
                  ? "↑ Positive"
                  : "↓ Negative"}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-500">
                UPI ₹{fmt(statBlocks.upi)}
              </span>
              <span className="text-[10px] text-gray-600">+</span>
              <span className="text-[10px] text-gray-500">
                Razorpay ₹{fmt(statBlocks.razorpay)}
              </span>
            </div>
            <p className="text-[10px] text-yellow-500/70 mt-2 leading-relaxed">
              ⚠ Razorpay settlements go directly to bank — not reflected in
              physical cash.
            </p>
          </div>
        </div>

        <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="text-xs font-extrabold text-white tracking-widest uppercase">
            Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={inputCls + " appearance-none cursor-pointer"}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Netbanking</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
            {view === "all" && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                  setMethod("all");
                  setSource("all");
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition px-4 py-2.5 text-[11px] font-extrabold rounded-lg text-gray-300"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 text-sm">Loading…</p>
            </div>
          </div>
        ) : baseFiltered.length === 0 ? (
          <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-12 text-center">
            <p className="text-gray-500 font-semibold text-sm">
              NO RECORDS FOUND
            </p>
            {view === "paymentin" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 mx-auto bg-red-600 hover:bg-red-700 transition px-4 py-2 text-[11px] font-extrabold rounded-lg text-white"
              >
                <Plus size={13} />
                ADD YOUR FIRST PAYMENT
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl">
            <div className="lg:hidden space-y-3 p-4">
              {baseFiltered.map((tx) => {
                const isCredit = CREDIT_SOURCES.includes(tx.source);
                return (
                  <div
                    key={tx._id}
                    className="flex flex-col rounded-xl bg-black border border-white/10 p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                        </p>
                        <p className="text-sm font-black text-white uppercase mt-0.5 truncate">
                          {tx.referenceId?.title ||
                            SOURCE_LABELS[tx.source] ||
                            tx.source}
                        </p>
                        {tx.referenceId?.category && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {tx.referenceId.category}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-sm font-black whitespace-nowrap ${
                          isCredit ? "text-green-400" : "text-red-500"
                        }`}
                      >
                        {isCredit ? "+" : "−"}₹{fmt(tx.amount)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="uppercase">{tx.paymentMethod}</span>
                      <span>•</span>
                      <span className="uppercase">{tx.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase text-gray-500 border-b border-white/10 bg-neutral-900 font-extrabold tracking-wider">
                    <th className="p-4 text-left">SI</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Title</th>
                    {view === "all" && (
                      <th className="p-4 text-left">Source</th>
                    )}
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-left">Method</th>
                    <th className="p-4 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {baseFiltered.map((tx) => {
                    const isCredit = CREDIT_SOURCES.includes(tx.source);
                    return (
                      <tr
                        key={tx._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition"
                      >
                        <td className="p-4 text-gray-500 text-xs">{si++}</td>
                        <td className="p-4 text-gray-300 text-xs whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4 text-white font-semibold text-xs uppercase max-w-[160px] truncate">
                          {tx.referenceId?.title || "—"}
                        </td>
                        {view === "all" && (
                          <td className="p-4 text-gray-400 text-xs uppercase">
                            {SOURCE_LABELS[tx.source] || tx.source}
                          </td>
                        )}
                        <td className="p-4 text-gray-400 text-xs">
                          {tx.referenceId?.category || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`font-black text-sm ${
                              isCredit ? "text-green-400" : "text-red-500"
                            }`}
                          >
                            {isCredit ? "+" : "−"}₹{fmt(tx.amount)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 text-xs uppercase font-semibold">
                          {tx.paymentMethod}
                        </td>
                        <td className="p-4 text-gray-500 text-xs max-w-[200px] truncate">
                          {tx.referenceId?.remarks || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="border-t border-white/10 bg-neutral-900/60">
                    <td
                      colSpan={view === "all" ? 5 : 4}
                      className="p-4 text-xs text-gray-500 font-extrabold uppercase tracking-widest"
                    >
                      Total ({baseFiltered.length} records)
                    </td>
                    <td className="p-4 text-right font-black text-white">
                      ₹
                      {fmt(
                        baseFiltered.reduce((s, t) => {
                          const isCredit = CREDIT_SOURCES.includes(t.source);
                          return s + (isCredit ? t.amount : -t.amount);
                        }, 0),
                      )}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPaymentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}