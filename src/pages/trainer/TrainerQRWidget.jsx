import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Download, RefreshCw, Shield, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function TrainerMyQRPage() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQR = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get("/trainer/attendance/my-qr"); // trainer route
      setQr(res.data.qr);
    } catch {
      toast.error("Failed to load QR code");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  const handleDownload = () => {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr;
    link.download = "alpha-gym-trainer-qr.png"; // trainer filename
    link.click();
    toast.success("QR saved!");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 bg-red-600/20 border border-red-600/40 rounded-lg">
            <QrCode className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-white">
            TRAINER <span className="text-red-600">QR CODE</span> {/* trainer label */}
          </h1>
        </div>
        <p className="text-gray-500 text-sm tracking-widest">
          SHOW THIS TO SCAN IN AT THE GYM ENTRANCE
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative w-full max-w-sm"
      >
        <div className="absolute inset-0 rounded-2xl bg-red-600/10 blur-2xl pointer-events-none" />

        <div className="relative border border-red-600/30 bg-gradient-to-b from-neutral-900 to-black rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.15)]">
          <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

          <div className="p-8 flex flex-col items-center gap-6">
            <div className="relative w-56 h-56 bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-8 h-8 text-red-500" />
                    </motion.div>
                    <span className="text-xs text-gray-500 tracking-widest">GENERATING...</span>
                  </motion.div>
                ) : qr ? (
                  <motion.img
                    key="qr"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={qr}
                    alt="Trainer QR Code"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2 px-4 text-center"
                  >
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <span className="text-xs text-gray-400 tracking-widest">FAILED TO LOAD</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-600/60 rounded-tl" />
              <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-600/60 rounded-tr" />
              <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-600/60 rounded-bl" />
              <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-600/60 rounded-br" />
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-xs text-gray-400 tracking-wide">
                Unique to your account · Don't share
              </span>
            </div>

            <div className="flex gap-3 w-full">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={!qr || loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 hover:border-red-600/40 bg-white/5 hover:bg-red-600/10 text-white text-sm font-bold tracking-widest rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                SAVE
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fetchQR(true)}
                disabled={loading || refreshing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black text-sm font-extrabold tracking-widest rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <motion.span
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.span>
                REFRESH
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-xs text-gray-600 tracking-widest text-center"
      >
        TIP: SAVE AS SCREENSHOT SO IT WORKS OFFLINE
      </motion.p>
    </div>
  );
}