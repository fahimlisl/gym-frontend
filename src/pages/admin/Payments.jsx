import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { X, Download, Eye } from "lucide-react";

import { fetchAllTransactions } from "../../api/admin.api";

const getTransactionType = (tx) => {
  const creditSources = [
    "cafe",
    "supplement",
    "subscription",
    "personal-training",
    "paymentin"
  ];
  return creditSources.includes(tx.source) ? "credit" : "debit";
};

const StatCard = ({ label, value, color, trend }) => (
  <div className="group relative flex flex-col rounded-xl overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 hover:border-red-600/40 transition p-4 md:p-6">
    <p className="text-[9px] md:text-xs text-gray-500 tracking-widest uppercase font-semibold">
      {label}
    </p>
    <p className={`text-2xl md:text-3xl font-black mt-3 ${color} tracking-tight`}>
      {value}
    </p>
    {trend && (
      <p className="text-xs text-gray-500 mt-2 font-medium">{trend}</p>
    )}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <span className="font-semibold text-gray-100 text-sm">{value || "—"}</span>
  </div>
);

const TransactionModal = ({ tx, onClose }) => {
  if (!tx) return null;

  const isCafe = tx.source === "cafe" && tx.referenceId;
  const isPersonalTraining = tx.source === "personal-training" && tx.referenceId;

  const subTotal = isCafe
    ? tx.referenceId.items.reduce(
        (sum, i) => sum + i.quantity * i.priceAtPurchase,
        0
      )
    : 0;

  const discount = tx.referenceId?.discount;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 py-6">
      <div className="bg-gradient-to-br from-black via-neutral-900 to-black w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex justify-between items-center px-5 md:px-7 py-5 border-b border-white/10 bg-black/95 backdrop-blur">
          <h2 className="text-base md:text-lg font-black tracking-widest uppercase text-white">
            {tx.source} <span className="text-red-600">Details</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 md:p-7 space-y-6">
          <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-0">
            <InfoRow label="Payment Method" value={tx.paymentMethod} />
            <InfoRow label="Status" value={
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                tx.status === 'success' ? 'bg-green-900/30 text-green-400' :
                tx.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {tx.status}
              </span>
            } />
            <InfoRow
              label="Date"
              value={new Date(tx.createdAt).toLocaleString()}
            />
          </div>

          {isPersonalTraining && tx.referenceId && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💪</span>
                <p className="text-xs tracking-widest text-gray-500 font-bold uppercase">
                  PERSONAL TRAINING SUBSCRIPTION
                </p>
              </div>

              {(() => {
                const subscription = tx.referenceId.subscription?.find(
                  sub => sub.finalPrice === tx.amount ||
                        sub.basePrice === tx.amount ||
                        (sub.finalPrice && Math.abs(sub.finalPrice - tx.amount) < 1)
                ) || tx.referenceId.subscription?.[0];

                if (!subscription) return null;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Plan</p>
                        <p className="text-lg font-black text-white capitalize">{subscription.plan}</p>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          subscription.status === 'active' ? 'bg-green-900/30 text-green-400' :
                          subscription.status === 'paused' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>

                    {subscription.trainer && (
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Trainer</p>
                        <p className="text-base font-bold text-white">{subscription.trainer}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
                        <p className="text-sm font-semibold text-white">
                          {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : '—'}
                        </p>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">End Date</p>
                        <p className="text-sm font-semibold text-white">
                          {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 bg-black/40 border border-white/5 rounded-lg p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Payment Breakdown</p>
                      <InfoRow label="Base Price" value={`₹${subscription.basePrice?.toLocaleString('en-IN') || 0}`} />
                      {subscription.discount?.amount > 0 && (
                        <InfoRow
                          label={`Discount${subscription.discount.code ? ` (${subscription.discount.code})` : ''}`}
                          value={`−₹${subscription.discount.amount.toLocaleString('en-IN')}`}
                        />
                      )}
                      <div className="flex justify-between items-center font-black text-base md:text-lg pt-3 border-t border-white/10">
                        <span className="tracking-widest text-gray-500 uppercase">Final Price</span>
                        <span className="text-red-600">
                          ₹{subscription.finalPrice?.toLocaleString('en-IN') || tx.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                        <p className="text-sm font-bold text-white capitalize">{subscription.paymentMethod || tx.paymentMethod}</p>
                      </div>
                      {subscription.ref && (
                        <div className="bg-black/40 border border-white/5 rounded-lg p-4 col-span-2">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Transaction Reference</p>
                          <p className="text-xs font-mono text-gray-300 break-all">{subscription.ref}</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {tx.subDetail && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-0">
              <p className="text-xs tracking-widest text-gray-500 font-bold mb-4 uppercase">
                📋 Subscription Details
              </p>
              <InfoRow label="Plan" value={tx.subDetail.plan} />
              <InfoRow label="Price" value={`₹${tx.subDetail.finalAmount?.toLocaleString('en-IN') || tx.amount.toLocaleString('en-IN')}`} />
              <InfoRow
                label="Start Date"
                value={tx.subDetail.startDate ? new Date(tx.subDetail.startDate).toLocaleDateString() : "—"}
              />
              <InfoRow
                label="End Date"
                value={tx.subDetail.endDate ? new Date(tx.subDetail.endDate).toLocaleDateString() : "—"}
              />
              <InfoRow label="Status" value={
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  tx.subDetail.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700/30 text-gray-300'
                }`}>
                  {tx.subDetail.status}
                </span>
              } />
            </div>
          )}

          {tx.source === "expense" && tx.referenceId && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-0">
              <p className="text-xs tracking-widest text-gray-500 font-bold mb-4 uppercase">💰 Expense Details</p>
              <InfoRow label="Title" value={tx.referenceId.title} />
              <InfoRow label="Category" value={tx.referenceId.category} />
              <InfoRow label="Remarks" value={tx.referenceId.remarks} />
              <InfoRow label="Amount" value={`₹${tx.amount.toLocaleString('en-IN')}`} />
            </div>
          )}

          {tx.source === "paymentin" && tx.referenceId && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-0">
              <p className="text-xs tracking-widest text-gray-500 font-bold mb-4 uppercase">💳 Payment In Details</p>
              <InfoRow label="Title" value={tx.referenceId.title} />
              <InfoRow label="Category" value={tx.referenceId.category || "—"} />
              <InfoRow label="Remarks" value={tx.referenceId.remarks} />
              {tx.referenceId.transactionId && (
                <InfoRow label="UPI Ref" value={tx.referenceId.transactionId} />
              )}
              <InfoRow
                label="Amount"
                value={<span className="text-green-400 font-black">+₹{tx.amount.toLocaleString("en-IN")}</span>}
              />
            </div>
          )}

          {isCafe && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-5 space-y-4">
              <p className="text-xs tracking-widest text-gray-500 font-bold uppercase">☕ Cafe Order Items</p>
              <div className="space-y-3">
                {tx.referenceId.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start md:items-center gap-3 bg-black/40 border border-white/5 rounded-lg p-4 hover:bg-black/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold uppercase tracking-wide text-sm md:text-base text-white break-words">{it.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Qty: {it.quantity} × ₹{it.priceAtPurchase.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="font-black text-gray-100 whitespace-nowrap">
                      ₹{(it.quantity * it.priceAtPurchase).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-neutral-900/40 border-t border-white/10 pt-4 space-y-3 text-sm">
                <InfoRow label="Sub Total" value={`₹${subTotal.toLocaleString('en-IN')}`} />
                {discount?.amount > 0 && (
                  <InfoRow
                    label={`Discount${discount.code ? ` (${discount.code})` : ""}`}
                    value={`−₹${discount.amount.toLocaleString('en-IN')}`}
                  />
                )}
                <div className="flex justify-between items-center font-black text-base md:text-lg pt-3 border-t border-white/10">
                  <span className="tracking-widest text-gray-500 uppercase">Total</span>
                  <span className="text-red-600">₹{tx.referenceId.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("all");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [entryType, setEntryType] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllTransactions();
        setTransactions(res.data.data || []);
      } catch {
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sources = useMemo(() => {
    return ["all", "subscription", "supplement", "personal-training", "cafe", "expense", "paymentin"];
  }, []);

  // ─── Opening & Closing Balance ────────────────────────────────────────────────
  // Opening Balance = cumulative net of ALL transactions strictly BEFORE fromDate
  // Closing Balance = Opening + net of ALL transactions from fromDate to toDate
  // (uses ALL transactions, ignoring source/method/type filters — balance is always total)
  const { openingBalance, closingBalance } = useMemo(() => {
    const fromDateStr = fromDate; // "YYYY-MM-DD"
    const toDateStr = toDate;

    let opening = 0;
    let periodNet = 0;

    transactions.forEach((t) => {
      const txDate = new Date(t.createdAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const type = getTransactionType(t);
      const signed = type === "credit" ? t.amount : -t.amount;

      if (txDate < fromDateStr) {
        // Before the selected range → contributes to opening balance
        opening += signed;
      } else if (txDate >= fromDateStr && txDate <= toDateStr) {
        // Within selected range → contributes to period net
        periodNet += signed;
      }
    });

    return {
      openingBalance: opening,
      closingBalance: opening + periodNet,
    };
  }, [transactions, fromDate, toDate]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const type = getTransactionType(t);

      return (
        txDate >= fromDate &&
        txDate <= toDate &&
        (entryType === "all" || type === entryType) &&
        (source === "all" || t.source === source) &&
        (paymentMethod === "all" || t.paymentMethod === paymentMethod)
      );
    });
  }, [transactions, fromDate, toDate, entryType, source, paymentMethod]);

  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;
    filtered.forEach((t) => {
      const type = getTransactionType(t);
      if (type === "credit") credit += t.amount;
      else debit += t.amount;
    });
    return { credit, debit, net: credit - debit };
  }, [filtered]);

  const exportExcel = () => {
    if (!filtered.length) return toast.error("No data to export");

    const rows = [];

    rows.push({
      Date: fromDate,
      Source: "— OPENING BALANCE —",
      Credit: "",
      Debit: "",
      Balance: openingBalance.toFixed(2),
      Method: "",
      Status: "",
    });

    filtered.forEach((t) => {
      const type = getTransactionType(t);
      rows.push({
        Date: new Date(t.createdAt).toLocaleDateString(),
        Source: t.source,
        Credit: type === "credit" ? t.amount : "",
        Debit: type === "debit" ? t.amount : "",
        Balance: "",
        Method: t.paymentMethod,
        Status: t.status,
      });
    });

    rows.push({
      Date: toDate,
      Source: "— CLOSING BALANCE —",
      Credit: "",
      Debit: "",
      Balance: closingBalance.toFixed(2),
      Method: "",
      Status: "",
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Payments_${fromDate}_to_${toDate}.xlsx`, { bookType: "xlsx" });
    toast.success("Excel exported successfully!");
  };

  const balanceColor = (val) => (val >= 0 ? "text-green-500" : "text-red-600");
  const fmt = (val) =>
    `${val < 0 ? "−" : ""}₹${Math.abs(Math.round(val)).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-black py-4 md:py-8 space-y-6">
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black p-5 md:p-8 rounded-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">
              PAYMENTS <span className="text-red-600">LEDGER</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Credit & Debit Accounting Overview
            </p>
          </div>
          <button
            onClick={exportExcel}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto h-fit"
          >
            <Download size={16} />
            EXPORT EXCEL
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-widest uppercase">
            Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Type</label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Entries</option>
                <option value="credit">Credit Only</option>
                <option value="debit">Debit Only</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors appearance-none cursor-pointer uppercase"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Netbanking</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-red-600/40 transition-colors appearance-none cursor-pointer uppercase"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Sources" : s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportExcel}
                className="w-full bg-red-600 hover:bg-red-700 transition px-4 py-2.5 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-2"
              >
                <Download size={14} />
                EXPORT
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {/* Row 1: Opening / Closing balance */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <StatCard
            label="Opening Balance"
            value={fmt(openingBalance)}
            color={balanceColor(openingBalance)}
            trend={`Start of ${fromDate}`}
          />
          <StatCard
            label="Closing Balance"
            value={fmt(closingBalance)}
            color={balanceColor(closingBalance)}
            trend={`End of ${toDate}`}
          />
        </div>

        {/* Row 2: Credit / Debit / Count / Net */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="Total Credit"
            value={fmt(totals.credit)}
            color="text-green-500"
            trend={`${filtered.filter(t => getTransactionType(t) === 'credit').length} txns`}
          />
          <StatCard
            label="Total Debit"
            value={fmt(totals.debit)}
            color="text-red-600"
            trend={`${filtered.filter(t => getTransactionType(t) === 'debit').length} txns`}
          />
          <StatCard
            label="Transactions"
            value={filtered.length}
            color="text-yellow-500"
            trend="in range"
          />
          <StatCard
            label="Period Net"
            value={fmt(totals.net)}
            color={totals.net >= 0 ? "text-green-500" : "text-red-600"}
            trend={totals.net >= 0 ? "↑ Positive" : "↓ Negative"}
          />
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 font-medium">Loading transactions...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl">

            {/* ── Mobile cards ── */}
            <div className="lg:hidden space-y-3 p-4">

              {/* Opening balance pill */}
              <div className="flex items-center justify-between bg-neutral-900/60 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Opening Balance</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fromDate}</p>
                </div>
                <span className={`text-lg font-black ${balanceColor(openingBalance)}`}>
                  {fmt(openingBalance)}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-8 text-center">
                  <p className="text-gray-500 font-semibold">NO TRANSACTIONS FOUND</p>
                </div>
              ) : (
                filtered.map((tx, index) => {
                  const type = getTransactionType(tx);
                  return (
                    <div
                      key={tx._id}
                      className="group relative flex flex-col rounded-xl overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 hover:border-red-600/40 transition"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">
                              #{index + 1} · {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-base sm:text-lg font-black text-white mt-1 truncate uppercase">
                              {tx.source}
                            </p>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap ${
                            type === 'credit' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-600'
                          }`}>
                            {type === "credit" ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Method: <span className="text-gray-300">{tx.paymentMethod}</span></p>
                          <p>Status: <span className={`font-semibold ${
                            tx.status === 'success' ? 'text-green-400' :
                            tx.status === 'pending' ? 'text-yellow-400' : 'text-red-600'
                          }`}>{tx.status}</span></p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-extrabold rounded-none transition"
                      >
                        <Eye size={14} />
                        VIEW
                      </button>
                    </div>
                  );
                })
              )}

              {/* Closing balance pill */}
              <div className="flex items-center justify-between bg-neutral-900/60 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Closing Balance</p>
                  <p className="text-xs text-gray-400 mt-0.5">{toDate}</p>
                </div>
                <span className={`text-lg font-black ${balanceColor(closingBalance)}`}>
                  {fmt(closingBalance)}
                </span>
              </div>
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase text-gray-500 border-b border-white/10 bg-neutral-900 font-extrabold tracking-wider">
                    <th className="p-4 text-left">SI</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Source</th>
                    <th className="p-4 text-right">Credit</th>
                    <th className="p-4 text-right">Debit</th>
                    <th className="p-4 text-left">Method</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {/* ── Opening Balance pinned row ── */}
                  <tr className="border-b border-white/10 bg-neutral-900/60">
                    <td className="p-4 text-gray-500 font-medium">—</td>
                    <td className="p-4 text-gray-400 text-xs">{fromDate}</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">
                        Opening Balance
                      </span>
                    </td>
                    <td className="p-4 text-right" colSpan={2}>
                      <span className={`font-black text-base ${balanceColor(openingBalance)}`}>
                        {fmt(openingBalance)}
                      </span>
                    </td>
                    <td className="p-4" />
                    <td className="p-4" />
                  </tr>

                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500 font-semibold">
                        NO TRANSACTIONS FOUND
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx, index) => {
                      const type = getTransactionType(tx);
                      return (
                        <tr
                          key={tx._id}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition"
                        >
                          <td className="p-4 text-gray-400 font-medium">{index + 1}</td>
                          <td className="p-4 text-gray-300">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 uppercase font-semibold text-gray-300">
                            {tx.source}
                          </td>
                          <td className="p-4 text-right">
                            {type === "credit" ? (
                              <span className="font-bold text-green-500">
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {type === "debit" ? (
                              <span className="font-bold text-red-600">
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="p-4 uppercase text-gray-300 text-xs font-semibold">
                            {tx.paymentMethod}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="bg-red-600/20 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-extrabold transition"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* ── Closing Balance pinned row ── */}
                  <tr className="border-t-2 border-white/10 bg-neutral-900/60">
                    <td className="p-4 text-gray-500 font-medium">—</td>
                    <td className="p-4 text-gray-400 text-xs">{toDate}</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">
                        Closing Balance
                      </span>
                    </td>
                    <td className="p-4 text-right" colSpan={2}>
                      <span className={`font-black text-base ${balanceColor(closingBalance)}`}>
                        {fmt(closingBalance)}
                      </span>
                    </td>
                    <td className="p-4" />
                    <td className="p-4" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}