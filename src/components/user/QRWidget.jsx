import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QrCode, ChevronRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function QRWidget() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get("/user/attendance/my-qr");
        setQr(res.data.qr);
      } catch {
        toast.error("Failed to load QR");
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-red-600/30 bg-gradient-to-br from-neutral-900 to-black rounded-2xl overflow-hidden"
    >
      <div className="h-0.5 bg-gradient-to-r from-red-900 via-red-500 to-red-900" />

      <div className="p-5 flex items-center gap-4">

        {/* QR Frame */}
        <div className="relative w-[80px] h-[80px] flex-shrink-0 bg-white rounded-xl flex items-center justify-center overflow-hidden">

          {/* Pulse ring */}
          <motion.span
            animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl border border-red-500/50 pointer-events-none"
          />

          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-5 h-5 text-red-500" />
            </motion.div>
          ) : qr ? (
            <>
              <img src={qr} alt="QR Code" className="w-[68px] h-[68px] object-contain" />
              {/* Animated scan line */}
              <motion.span
                className="absolute left-1 right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-red-500/80 to-transparent pointer-events-none"
                animate={{ top: ["8px", "calc(100% - 10px)"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute" }}
              />
            </>
          ) : (
            <QrCode className="w-6 h-6 text-gray-400" />
          )}

          {/* Corner brackets */}
          <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-red-500 rounded-tl" />
          <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-red-500 rounded-tr" />
          <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-red-500 rounded-bl" />
          <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-red-500 rounded-br" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-white font-semibold tracking-widest text-[11px] uppercase">
              Gym Check-In
            </span>
          </div>
          <p className="text-gray-500 text-[11.5px] leading-relaxed">
            Show at entrance to mark attendance instantly.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-[10px] font-medium tracking-wide">Active</span>
          </div>
        </div>

        {/* Navigate button */}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/member/scan-qr")}
          className="flex-shrink-0 w-9 h-9 border border-white/10 hover:border-red-600/50 hover:bg-red-600/10 rounded-xl flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-4 h-4 text-red-500" />
        </motion.button>

      </div>
    </motion.div>
  );
}