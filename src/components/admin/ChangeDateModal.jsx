import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function ChangeDateModal({ userId, currentStart, currentEnd, onClose, onSuccess }) {
  const toInputFormat = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

  const [startDate, setStartDate] = useState(toInputFormat(currentStart));
  const [endDate, setEndDate] = useState(toInputFormat(currentEnd));
  const [loading, setLoading] = useState(false);

  const toBackendFormat = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Both dates are required");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    try {
      setLoading(true);
      await api.patch(`/admin/subscription/change/date/${userId}`, {
        startDate: toBackendFormat(startDate),
        endDate: toBackendFormat(endDate),
      });
      toast.success("Dates updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update dates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md border border-red-600/40 bg-neutral-950 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.15)]">
        <div className="border-b border-red-600/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-black tracking-widest text-sm">EDIT SUBSCRIPTION DATES</h2>
            <p className="text-xs text-gray-500 mt-0.5">Modifies only latest subscriptiond</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start gap-3 bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
            <span className="text-red-500 text-sm mt-0.5">⚠</span>
            <p className="text-xs text-red-400 leading-relaxed">
              This will only update subscription details
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest text-gray-400">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="
                w-full bg-black border border-white/10 rounded-lg px-4 py-2.5
                text-sm text-white
                focus:outline-none focus:border-red-600/60
                transition
                [color-scheme:dark]
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest text-gray-400">
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="
                w-full bg-black border border-white/10 rounded-lg px-4 py-2.5
                text-sm text-white
                focus:outline-none focus:border-red-600/60
                transition
                [color-scheme:dark]
              "
            />
          </div>

          {startDate && endDate && (
            <div className="bg-black border border-white/5 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 tracking-widest mb-2">PREVIEW</p>
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Validity: </span>
                {new Date(startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                <span className="text-red-500 mx-2">→</span>
                {new Date(endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-white/10 py-2.5 text-xs font-bold tracking-widest text-gray-400 hover:border-white/30 hover:text-white transition rounded-lg"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-xs font-black tracking-widest text-white transition rounded-lg"
          >
            {loading ? "UPDATING..." : "UPDATE DATES"}
          </button>
        </div>
      </div>
    </div>
  );
}