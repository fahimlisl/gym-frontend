import { useEffect, useState } from "react";
import api from "../../api/axios.api.js";
import toast from "react-hot-toast";
import { Loader2, Gift } from "lucide-react";

export default function SupplementBillsTable({ refreshKey, filterType = "all" }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/fetch/supp/bill/all")
      .then((res) => {
        let data = res.data.data || [];
        
        // Apply filter
        if (filterType === "sponsor") {
          data = data.filter(bill => bill.isSponsor === true);
        } else if (filterType === "regular") {
          data = data.filter(bill => bill.isSponsor !== true);
        }
        
        setBills(data);
      })
      .catch(() => toast.error("Failed to load bills"))
      .finally(() => setLoading(false));
  }, [refreshKey, filterType]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-red-600" size={28} />
      </div>
    );
  }

  // Show empty state with filter info
  if (bills.length === 0) {
    let message = "No bills yet";
    if (filterType === "sponsor") message = "No sponsor bills found";
    if (filterType === "regular") message = "No regular bills found";
    
    return (
      <div className="border border-white/10 rounded-xl px-4 py-8 text-center text-gray-600 text-sm">
        {message}
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
              <th className="px-4 py-3 text-left">Original Amount</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-400">
                  {new Date(bill.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white">
                  {bill.isSponsor ? (
                    <div>
                      <div className="font-bold text-purple-400 flex items-center gap-2">
                        <Gift size={14} className="text-purple-400" />
                        {bill.trainerInfo?.name || "Sponsored Trainer"}
                      </div>
                      {bill.trainerInfo?.phone && (
                        <div className="text-xs text-gray-500">{bill.trainerInfo.phone}</div>
                      )}
                    </div>
                  ) : (
                    bill.userId?.name || bill.guestInfo?.fullName || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {bill.items?.map((i) => i.productName).join(", ")}
                </td>
                <td className="px-4 py-3 uppercase text-xs text-gray-400">
                  {bill.isSponsor ? (
                    <span className="text-purple-400 font-bold">SPONSOR</span>
                  ) : (
                    bill.paymentMethod
                  )}
                </td>
                <td className="px-4 py-3 text-gray-200">
                  ₹{bill?.subtotal}
                </td>
                <td className="px-4 py-3 text-red-400 font-bold">
                  {bill?.discountAmount ? `₹${bill.discountAmount}` : "—"}
                  {bill.isSponsor && " (100%)"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-500">
                  ₹{bill.total}
                </td>
                <td className="px-4 py-3">
                  {bill.isSponsor ? (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full border border-purple-600/20">
                      SPONSOR
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded-full border border-gray-600/20">
                      REGULAR
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {bills.map((bill) => (
          <div
            key={bill._id}
            className={`border rounded-xl p-4 space-y-3 bg-black/40 ${
              bill.isSponsor ? "border-purple-600/30" : "border-white/10"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                {bill.isSponsor ? (
                  <div className="font-bold text-purple-400 flex items-center gap-2">
                    <Gift size={14} className="text-purple-400 flex-shrink-0" />
                    <span className="truncate">{bill.trainerInfo?.name || "Sponsored Trainer"}</span>
                  </div>
                ) : (
                  <span className="text-white font-bold text-sm truncate block">
                    {bill.userId?.name || bill.guestInfo?.fullName || "—"}
                  </span>
                )}
                {bill.isSponsor && bill.trainerInfo?.phone && (
                  <div className="text-xs text-gray-500">{bill.trainerInfo.phone}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-green-500 text-base block">
                  ₹{bill.total}
                </span>
                {bill.isSponsor && (
                  <span className="text-[10px] text-purple-400 font-bold">SPONSOR</span>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {bill.items?.map((i) => i.productName).join(", ")}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">Original Amount</p>
                <p className="text-xs font-semibold text-gray-200">₹{bill?.subtotal ?? "—"}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">Discount</p>
                <p className={`text-xs font-semibold ${bill.isSponsor ? "text-purple-400" : "text-red-500"}`}>
                  {bill?.discountAmount ? `₹${bill.discountAmount}` : "—"}
                  {bill.isSponsor && " (100%)"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-[10px] text-gray-500">
                {new Date(bill.createdAt).toLocaleString()}
              </span>
              <span className={`text-[10px] uppercase font-bold ${
                bill.isSponsor ? "text-purple-400" : "text-gray-400"
              } bg-white/5 px-2 py-1 rounded`}>
                {bill.isSponsor ? "SPONSOR" : bill.paymentMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}