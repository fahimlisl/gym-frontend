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
      className="border border-red-600/30 bg-gradient-to-br from-neutral-900 to-black rounded-xl overflow-hidden"
    >
      <div className="h-0.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

      <div className="p-5 flex items-center gap-5">
        <div className="relative w-20 h-20 flex-shrink-0 bg-black border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-5 h-5 text-red-500" />
            </motion.div>
          ) : qr ? (
            <img src={qr} alt="QR Code" className="w-full h-full object-contain p-1" />
          ) : (
            <QrCode className="w-6 h-6 text-gray-600" />
          )}

          <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-red-600/60" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-red-600/60" />
          <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-red-600/60" />
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-red-600/60" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-white font-bold tracking-widest text-sm">GYM CHECK-IN</span>
          </div>
          <p className="text-gray-500 text-xs tracking-wide leading-relaxed">
            Show this at the entrance to mark your attendance instantly.
          </p>
        </div>

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/member/my-qr")}
          className="flex-shrink-0 p-2 border border-white/10 hover:border-red-600/40 hover:bg-red-600/10 rounded-lg transition-all"
        >
          <ChevronRight className="w-5 h-5 text-red-500" />
        </motion.button>
      </div>
    </motion.div>
  );
}