import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const RESET_DELAY = 3500;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const statusConfig = {
  success: {
    bg: "from-emerald-950/90 to-black/95",
    border: "border-emerald-500/40",
    bar: "from-emerald-600 via-emerald-400 to-emerald-600",
    label: "CHECKED IN",
    labelColor: "text-emerald-400",
    ringColor: "ring-emerald-500/40",
    icon: "✓",
    iconBg: "bg-emerald-500/20 border-emerald-500/50",
    iconColor: "text-emerald-400",
    message: (name) => `WELCOME, ${name?.toUpperCase()}`,
  },
  already: {
    bg: "from-amber-950/90 to-black/95",
    border: "border-amber-500/40",
    bar: "from-amber-600 via-amber-400 to-amber-600",
    label: "ALREADY CHECKED IN",
    labelColor: "text-amber-400",
    ringColor: "ring-amber-500/40",
    icon: "↩",
    iconBg: "bg-amber-500/20 border-amber-500/50",
    iconColor: "text-amber-400",
    message: (name) => `HEY ${name?.toUpperCase()}, YOU'RE ALREADY IN`,
  },
  inactive: {
    bg: "from-red-950/90 to-black/95",
    border: "border-red-500/50",
    bar: "from-red-700 via-red-500 to-red-700",
    label: "ACCESS DENIED",
    labelColor: "text-red-400",
    ringColor: "ring-red-500/40",
    icon: "✕",
    iconBg: "bg-red-500/20 border-red-500/50",
    iconColor: "text-red-400",
    message: (name) => `${name?.toUpperCase()} — MEMBERSHIP INACTIVE`,
  },
  checkout_success: {
    bg: "from-sky-950/90 to-black/95",
    border: "border-sky-500/40",
    bar: "from-sky-600 via-sky-400 to-sky-600",
    label: "CHECKED OUT",
    labelColor: "text-sky-400",
    ringColor: "ring-sky-500/40",
    icon: "↗",
    iconBg: "bg-sky-500/20 border-sky-500/50",
    iconColor: "text-sky-400",
    message: (name) => `SEE YOU, ${name?.toUpperCase()}`,
  },
  checkout_error: {
    bg: "from-neutral-900/90 to-black/95",
    border: "border-white/20",
    bar: "from-neutral-500 via-neutral-300 to-neutral-500",
    label: "CHECKOUT FAILED",
    labelColor: "text-gray-400",
    ringColor: "ring-white/10",
    icon: "!",
    iconBg: "bg-white/10 border-white/20",
    iconColor: "text-gray-300",
    message: (msg) => msg || "CHECKOUT FAILED — TRY AGAIN",
  },
  error: {
    bg: "from-neutral-900/90 to-black/95",
    border: "border-white/20",
    bar: "from-neutral-500 via-neutral-300 to-neutral-500",
    label: "ERROR",
    labelColor: "text-gray-400",
    ringColor: "ring-white/10",
    icon: "!",
    iconBg: "bg-white/10 border-white/20",
    iconColor: "text-gray-300",
    message: (msg) => msg || "SCAN FAILED — TRY AGAIN",
  },
};

function parseQRPayload(raw) {
  if (raw.startsWith("TRAINER::")) {
    return { type: "trainer", id: raw.replace("TRAINER::", "").trim() };
  }
  return { type: "member", id: raw.trim() };
}

function normaliseResponse(data, type) {
  return {
    displayName: type === "trainer" ? data.fullName : data.username,
    avatar: data.avatar || null,
    alreadyMarked: data.alreadyMarked || false,
  };
}

export default function ScannerPage() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const isProcessing = useRef(false);
  const resetTimer = useRef(null);

  const [status, setStatus] = useState("scanning");
  const [member, setMember] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const resetToScanning = useCallback(() => {
    setStatus("scanning");
    setMember(null);
    setErrorMsg("");
    isProcessing.current = false;
  }, []);

  // trainer checkout triggered by button
  const handleTrainerCheckout = useCallback(async () => {
    if (!member?.id || checkingOut) return;
    setCheckingOut(true);
    clearTimeout(resetTimer.current); // pause the auto-reset while request is in flight

    try {
      await axios.post(`${BASE_URL}/general/attendance/trainer/checkout`, {
        trainerId: member.id,
      });
      setStatus("checkout_success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Checkout failed";
      setErrorMsg(msg);
      setStatus("checkout_error");
    } finally {
      setCheckingOut(false);
      resetTimer.current = setTimeout(resetToScanning, RESET_DELAY);
    }
  }, [member, checkingOut, resetToScanning]);

  const handleScan = useCallback(async (rawText) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const { type, id } = parseQRPayload(rawText);

    try {
      let res;
      if (type === "trainer") {
        res = await axios.post(`${BASE_URL}/general/attendance/trainer/qr`, { trainerId: id });
      } else {
        res = await axios.post(`${BASE_URL}/general/attendance/qr`, { memberId: id });
      }

      const normalised = normaliseResponse(res.data, type);
      // store raw id so the checkout button can reference it
      setMember({ ...normalised, type, id });
      setStatus(normalised.alreadyMarked ? "already" : "success");
    } catch (err) {
      const data = err?.response?.data;
      const httpStatus = err?.response?.status;

      if (httpStatus === 400 && data?.alreadyMarked) {
        const normalised = normaliseResponse(data, type);
        setMember({ ...normalised, type, id });
        setStatus("already");
      } else if (httpStatus === 403) {
        setMember({
          displayName: data?.username || data?.fullName || null,
          avatar: data?.avatar || null,
          type,
          id,
        });
        setStatus("inactive");
      } else {
        setErrorMsg(data?.message || "Something went wrong");
        setStatus("error");
      }
    } finally {
      resetTimer.current = setTimeout(resetToScanning, RESET_DELAY);
    }
  }, [resetToScanning]);

  useEffect(() => {
    let controls = null;

    const startScanner = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        readerRef.current = codeReader;

        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !isProcessing.current) {
              handleScan(result.getText());
            }
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(err?.message || "Camera access failed");
      }
    };

    startScanner();

    return () => {
      clearTimeout(resetTimer.current);
      if (controls) {
        try { controls.stop(); } catch {}
      }
    };
  }, [handleScan]);

  const cfg = statusConfig[status];

  // show checkout button only when a trainer scanned and is in "already" state
  const showCheckoutBtn =
    member?.type === "trainer" &&
    status === "already";

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-between overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] bg-red-600/10 blur-[100px] pointer-events-none" />

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full flex items-center justify-between px-8 pt-7 pb-3"
      >
        <div className="font-black tracking-widest text-xl text-white">
          ALPHA <span className="text-red-600">GYM</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <span className="text-xs text-gray-500 tracking-widest">LIVE</span>
        </div>
      </motion.header>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black tracking-[0.18em] text-white mb-1">
            SCAN TO CHECK IN
          </h1>
          <p className="text-gray-600 text-xs tracking-widest">
            HOLD YOUR QR CODE IN FRONT OF THE CAMERA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative w-full rounded-2xl overflow-hidden border border-red-600/30 shadow-[0_0_60px_rgba(239,68,68,0.1)] bg-neutral-950"
        >
          <div className="h-0.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

          <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 px-6 text-center">
                <span className="text-4xl">📷</span>
                <p className="text-red-400 text-sm font-bold tracking-widest">CAMERA ERROR</p>
                <p className="text-gray-500 text-xs">{cameraError}</p>
                <p className="text-gray-600 text-xs tracking-wide">
                  Allow camera access in browser settings and refresh
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
              />
            )}

            <AnimatePresence>
              {status === "scanning" && !cameraError && (
                <motion.div
                  key="scan-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div
                    className="absolute inset-0"
                    style={{ boxShadow: "inset 0 0 0 9999px rgba(0,0,0,0.35)" }}
                  />
                  <div
                    className="absolute inset-[18%] rounded-lg"
                    style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
                  />
                  <motion.div
                    className="absolute left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-red-500 to-transparent z-10"
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {[
                    "top-[17%] left-[17%] border-t-2 border-l-2",
                    "top-[17%] right-[17%] border-t-2 border-r-2",
                    "bottom-[17%] left-[17%] border-b-2 border-l-2",
                    "bottom-[17%] right-[17%] border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <motion.span
                      key={i}
                      className={`absolute w-7 h-7 border-red-500 ${cls}`}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {status !== "scanning" && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute inset-0 bg-gradient-to-b ${cfg.bg} flex flex-col items-center justify-center gap-4 px-6`}
                >
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
                  >
                    {member?.avatar ? (
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.displayName}
                          className={`w-20 h-20 rounded-full object-cover ring-2 ${cfg.ringColor}`}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-black ${cfg.iconBg} ${cfg.iconColor}`}>
                          {cfg.icon}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${cfg.iconBg} ${cfg.border}`}>
                        <span className={`text-2xl font-black ${cfg.iconColor}`}>
                          {member?.displayName ? getInitials(member.displayName) : cfg.icon}
                        </span>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="text-center w-full"
                  >
                    <div className={`text-xs font-black tracking-[0.25em] mb-1 ${cfg.labelColor}`}>
                      {cfg.label}
                      {member?.type === "trainer" && (
                        <span className="ml-2 text-[9px] font-bold tracking-widest text-orange-400/80 border border-orange-500/30 px-1.5 py-0.5 rounded">
                          TRAINER
                        </span>
                      )}
                    </div>
                    <div className="text-white font-black text-base tracking-widest leading-snug">
                      {status === "checkout_error"
                        ? cfg.message(errorMsg)
                        : cfg.message(member?.displayName || errorMsg)}
                    </div>

                    {/* checkout button — trainer already-in state only */}
                    <AnimatePresence>
                      {showCheckoutBtn && (
                        <motion.button
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ delay: 0.2, duration: 0.25 }}
                          onClick={handleTrainerCheckout}
                          disabled={checkingOut}
                          className="mt-4 w-full py-2.5 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-50"
                          style={{
                            background: checkingOut
                              ? "rgba(14,165,233,0.08)"
                              : "rgba(14,165,233,0.18)",
                            border: "1px solid rgba(14,165,233,0.4)",
                            color: "#38bdf8",
                            boxShadow: checkingOut ? "none" : "0 0 16px rgba(14,165,233,0.12)",
                          }}
                        >
                          {checkingOut ? "CHECKING OUT..." : "↗ CHECK OUT NOW"}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: RESET_DELAY / 1000, ease: "linear" }}
                      className={`h-full bg-gradient-to-r ${cfg.bar}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-5 py-3 flex items-center justify-between border-t border-white/5">
            <span className="text-xs text-gray-600 tracking-widest">
              {status === "scanning" ? "READY TO SCAN" : "RESETTING..."}
            </span>
            <motion.div
              animate={status === "scanning" ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 1.5, repeat: status === "scanning" ? Infinity : 0 }}
              className={`text-xs font-bold tracking-widest ${status === "scanning" ? "text-red-500" : cfg.labelColor}`}
            >
              {status === "scanning" ? "● SCANNING" : `● ${cfg.label}`}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 w-full px-8 pb-7 pt-4 text-center"
      >
        <p className="text-xs text-gray-700 tracking-[0.2em]">
          POWERED BY ALPHA GYM • ATTENDANCE SYSTEM
        </p>
      </motion.footer>
    </div>
  );
}