import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Gift, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";

export default function TrainerSponsorsModal({ trainer, onClose }) {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSponsors: 0,
    totalAmount: 0,
    currentMonthAmount: 0,
  });

  useEffect(() => {
    fetchSponsors();
  }, [trainer._id]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/fetchSponsors/${trainer._id}`);
      const data = res.data.data || [];
      setSponsors(data);

      // Calculate stats
      const totalAmount = data.reduce((sum, bill) => sum + bill.total, 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthAmount = data
        .filter(bill => {
          const billDate = new Date(bill.createdAt);
          return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        })
        .reduce((sum, bill) => sum + bill.total, 0);

      setStats({
        totalSponsors: data.length,
        totalAmount,
        currentMonthAmount,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch sponsors");
    } finally {
      setLoading(false);
    }
  };

  // Group sponsors by month
  const groupByMonth = (sponsors) => {
    const grouped = {};
    sponsors.forEach(sponsor => {
      const date = new Date(sponsor.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(sponsor);
    });
    return grouped;
  };

  const groupedSponsors = groupByMonth(sponsors);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center px-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-purple-600/30">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-3">
              <Gift className="text-purple-400" size={20} />
              SPONSOR DETAILS
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {trainer.fullName} {trainer.phoneNumber ? `(${trainer.phoneNumber})` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/5">
          <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold tracking-widest text-purple-400/60 uppercase">Total Sponsors</p>
            <p className="text-2xl font-black text-white mt-1">{stats.totalSponsors}</p>
          </div>
          <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold tracking-widest text-purple-400/60 uppercase">Total Amount</p>
            <p className="text-2xl font-black text-purple-400 mt-1">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold tracking-widest text-green-400/60 uppercase">This Month</p>
            <p className="text-2xl font-black text-green-400 mt-1">₹{stats.currentMonthAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No sponsor bills found for this trainer</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSponsors).map(([monthYear, bills]) => (
                <div key={monthYear} className="space-y-2">
                  <h3 className="text-sm font-bold text-purple-400 tracking-wider border-b border-purple-600/20 pb-2">
                    {monthYear} ({bills.length} bill{bills.length > 1 ? "s" : ""})
                  </h3>
                  <div className="space-y-2">
                    {bills.map((bill) => (
                      <div
                        key={bill._id}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-purple-600/30 transition-all"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-white font-medium">
                                {bill.items?.map(i => i.productName).join(", ")}
                              </span>
                              <span className="text-[10px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-600/20">
                                SPONSOR
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-3">
                              <span>📅 {new Date(bill.createdAt).toLocaleString()}</span>
                              <span>📦 {bill.items?.length || 0} items</span>
                              {bill.notes && <span>📝 {bill.notes}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-green-400">
                              ₹{bill.total}
                            </p>
                            <p className="text-[10px] text-gray-500 line-through">
                              ₹{bill.subtotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-widest rounded-lg transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}