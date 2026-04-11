import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import api from "../../api/axios.api";

const GYM_QR_PAYLOAD = "ALPHA_GYM_CHECKIN";

export default function MemberScanGymQR() {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scannedRef = useRef(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startScanner = async () => {
    stopScanner(); 
    scannedRef.current = false;

    const reader = new BrowserQRCodeReader();
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result && !scannedRef.current) {
            const text = result.getText();
            console.log("Scanned:", text);
            if (text === GYM_QR_PAYLOAD) {
              scannedRef.current = true;
              stopScanner();
              handleCheckin();
            } else {
              scannedRef.current = true;
              stopScanner();
              setStatus("error");
              setMessage("Invalid QR code");
            }
          }
        }
      );
      controlsRef.current = controls;
    } catch {
      setStatus("error");
      setMessage("Camera access denied");
    }
  };

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const handleCheckin = async () => {
    setStatus("loading");
    try {
      const res = await api.post("/user/attendance/gym-qr");
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      console.error("Checkin error:", err.response?.data);
      const msg = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 400) setStatus("already");
      else if (err.response?.status === 403) setStatus("inactive");
      else setStatus("error");
      setMessage(msg);
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
    startScanner();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-white font-black tracking-widest text-sm uppercase">
        Scan Gym QR to Check In
      </p>

      {status === "idle" || status === "loading" ? (
        <div className="relative w-72 h-72 rounded-2xl overflow-hidden border border-white/10">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {status === "loading" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-red-600 rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-red-600 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-red-600 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-red-600 rounded-br" />
        </div>
      ) : (
        <div
          className={`w-72 rounded-2xl border p-6 flex flex-col items-center gap-4 ${
            status === "success"
              ? "border-green-500/30 bg-green-500/10"
              : status === "already"
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <span className="text-4xl">
            {status === "success" ? "✅" : status === "already" ? "⚠️" : "❌"}
          </span>
          <p
            className={`text-sm font-bold tracking-wide text-center ${
              status === "success"
                ? "text-green-400"
                : status === "already"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
          <button
            onClick={reset}
            className="mt-2 px-5 py-2 bg-white/10 text-white text-xs font-black tracking-widest rounded-xl hover:bg-white/20 transition"
          >
            SCAN AGAIN
          </button>
        </div>
      )}

      <p className="text-white/20 text-xs tracking-widest">
        Point camera at the gym's QR code
      </p>
    </div>
  );
}