import { useEffect, useState } from "react";
import api from "../../api/axios.api.js";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function SupplementBillsTable({ refreshKey }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/fetch/supp/bill/all")
      .then((res) => setBills(res.data.data))
      .catch(() => toast.error("Failed to load bills"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-red-600" size={28} />
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black text-gray-500 text-xs tracking-widest uppercase border-b border-white/10">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-400">
                  {new Date(bill.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white">
                  {bill.userId?.name || bill.guestInfo?.fullName || "—"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {bill.items?.map((i) => i.productName).join(", ")}
                </td>
                <td className="px-4 py-3 uppercase text-xs text-gray-400">
                  {bill.paymentMethod}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-500">
                  ₹{bill.total}
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  No bills yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {bills.length === 0 && (
          <div className="border border-white/10 rounded-xl px-4 py-8 text-center text-gray-600 text-sm">
            No bills yet
          </div>
        )}
        {bills.map((bill) => (
          <div
            key={bill._id}
            className="border border-white/10 rounded-xl p-4 space-y-2 bg-black/40"
          >
            <div className="flex justify-between items-start">
              <span className="text-white font-bold text-sm">
                {bill.userId?.name || bill.guestInfo?.fullName || "—"}
              </span>
              <span className="font-bold text-red-500 text-sm shrink-0 ml-2">
                ₹{bill.total}
              </span>
            </div>

            <p className="text-xs text-gray-400">
              {bill.items?.map((i) => i.productName).join(", ")}
            </p>

            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="text-[10px] text-gray-500">
                {new Date(bill.createdAt).toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">
                {bill.paymentMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}