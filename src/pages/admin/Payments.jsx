import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

import { fetchAllTransactions } from "../../api/admin.api";

const getTransactionType = (tx) => {
  const creditSources = [
    "cafe",
    "supplement",
    "subscription",
    "personal-training",
  ];
  return creditSources.includes(tx.source) ? "credit" : "debit";
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-black p-5 border border-white/10">
    <p className="text-xs text-gray-400 tracking-widest">{label}</p>
    <p className={`text-2xl font-black mt-2 ${color}`}>{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold">{value || "-"}</span>
  </div>
);

const TransactionModal = ({ tx, onClose }) => {
  if (!tx) return null;

  const isCafe = tx.source === "cafe" && tx.referenceId;

  const subTotal = isCafe
    ? tx.referenceId.items.reduce(
        (sum, i) => sum + i.quantity * i.priceAtPurchase,
        0,
      )
    : 0;

  const discount = tx.referenceId?.discount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
      <div className="bg-[#0b0b0b] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-black tracking-widest uppercase">
            {tx.source} DETAILS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="bg-black border border-white/10 rounded-xl p-4 space-y-2">
            <InfoRow label="Payment Method" value={tx.paymentMethod} />
            <InfoRow label="Status" value={tx.status} />
            <InfoRow
              label="Date"
              value={new Date(tx.createdAt).toLocaleString()}
            />
          </div>

          {tx.subDetail && (
            <div className="bg-black border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-xs tracking-widest text-gray-400">
                SUBSCRIPTION DETAILS
              </p>
              <InfoRow label="Plan" value={tx.subDetail.plan} />
              <InfoRow label="Price" value={`₹${tx.subDetail.price}`} />
              <InfoRow
                label="Start"
                value={
                  tx.subDetail.startDate
                    ? new Date(tx.subDetail.startDate).toLocaleDateString()
                    : "-"
                }
              />
              <InfoRow
                label="End"
                value={
                  tx.subDetail.endDate
                    ? new Date(tx.subDetail.endDate).toLocaleDateString()
                    : "-"
                }
              />
              <InfoRow label="Status" value={tx.subDetail.status} />
            </div>
          )}

          {tx.source === "expense" && tx.referenceId && (
            <div className="bg-black border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-xs tracking-widest text-gray-400">
                EXPENSE DETAILS
              </p>
              <InfoRow label="Title" value={tx.referenceId.title} />
              <InfoRow label="Category" value={tx.referenceId.category} />
              <InfoRow label="Remarks" value={tx.referenceId.remarks} />
              <InfoRow label="Amount" value={`₹${tx.amount}`} />
            </div>
          )}

          {isCafe && (
            <div className="bg-black border border-white/10 rounded-xl p-4 space-y-4">
              <p className="text-xs tracking-widest text-gray-400">
                CAFE ORDER ITEMS
              </p>

              <div className="space-y-3">
                {tx.referenceId.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center
                               border border-white/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-bold uppercase tracking-wide">
                        {it.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {it.quantity} × ₹{it.priceAtPurchase}
                      </p>
                    </div>

                    <p className="font-black text-gray-200">
                      ₹{it.quantity * it.priceAtPurchase}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                <InfoRow label="Sub Total" value={`₹${subTotal}`} />

                {discount?.amount > 0 && (
                  <InfoRow
                    label={`Discount${discount.code ? ` (${discount.code})` : ""}`}
                    value={`- ₹${discount.amount}`}
                  />
                )}

                <div className="flex justify-between font-black text-lg pt-2">
                  <span className="tracking-widest text-gray-400">
                    FINAL TOTAL
                  </span>
                  <span className="text-green-500">
                    ₹{tx.referenceId.totalAmount}
                  </span>
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

  const today = new Date().toISOString().split("T")[0];
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
    const unique = new Set(transactions.map((t) => t.source));
    return ["all", ...Array.from(unique)];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt).toISOString().split("T")[0];
      const type = getTransactionType(t);

      return (
        txDate >= fromDate &&
        txDate <= toDate &&
        (entryType === "all" || type === entryType) &&
        (source === "all" || t.source === source)
      );
    });
  }, [transactions, fromDate, toDate, entryType, source]);

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

    const data = filtered.map((t) => {
      const type = getTransactionType(t);
      return {
        Date: new Date(t.createdAt).toLocaleDateString(),
        Source: t.source,
        Credit: type === "credit" ? t.amount : "",
        Debit: type === "debit" ? t.amount : "",
        Method: t.paymentMethod,
        Status: t.status,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");

    XLSX.writeFile(wb, `Payments_${fromDate}_to_${toDate}.xlsx`, {
      bookType: "xlsx",
    });

    toast.success("Excel exported");
  };

  let si = 1;

  return (
    <>
      <div className="space-y-8">
        <div className="border border-red-600/30 bg-black p-6">
          <h1 className="text-3xl font-black tracking-widest">
            PAYMENTS LEDGER
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Credit & Debit accounting view
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-black border border-white/20 px-3 py-2"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-black border border-white/20 px-3 py-2"
          />

          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
            className="bg-black border border-white/20 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-black border border-white/20 px-3 py-2 uppercase"
          >
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={exportExcel}
            className="ml-auto bg-green-600 px-6 py-2 font-bold"
          >
            EXPORT EXCEL
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="TOTAL CREDIT"
            value={`₹${totals.credit.toFixed(2)}`}
            color="text-green-500"
          />
          <StatCard
            label="TOTAL DEBIT"
            value={`₹${totals.debit.toFixed(2)}`}
            color="text-red-500"
          />
          <StatCard
            label="TRANSACTIONS"
            value={filtered.length}
            color="text-yellow-500"
          />
          <StatCard
            label="NET BALANCE"
            value={`₹${totals.net.toFixed(2)}`}
            color={totals.net >= 0 ? "text-green-500" : "text-red-500"}
          />
        </div>

        {loading ? (
          <p className="text-gray-500">LOADING...</p>
        ) : (
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-white/10">
                  <th className="p-3">SI</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3">SOURCE</th>
                  <th className="p-3 text-right">CREDIT</th>
                  <th className="p-3 text-right">DEBIT</th>
                  <th className="p-3">METHOD</th>
                  <th className="p-3">VIEW</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const type = getTransactionType(tx);
                  return (
                    <tr key={tx._id} className="border-t border-white/5">
                      <td className="p-3">{si++}</td>
                      <td className="p-3">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 uppercase">{tx.source}</td>
                      <td className="p-3 text-right text-green-500">
                        {type === "credit" ? `₹${tx.amount}` : ""}
                      </td>
                      <td className="p-3 text-right text-red-500">
                        {type === "debit" ? `₹${tx.amount}` : ""}
                      </td>
                      <td className="p-3 uppercase">{tx.paymentMethod}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="text-blue-400 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}
