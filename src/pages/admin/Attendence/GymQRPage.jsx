import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Lock } from "lucide-react"; 
import api from "../../../api/axios.api.js";

const GYM_QR_PAYLOAD = "ALPHA_GYM_CHECKIN";

export default function GymQRPage() {
  const [qr, setQr] = useState("");

  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/admin/get/me");
        setAdmin(data?.admin ?? null);
      } catch {
        setAdmin(null);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isAllowed = isSuperAdmin || !!admin?.check_in_qr?.allow;
  useEffect(() => {
    if (isAllowed) {
      QRCode.toDataURL(GYM_QR_PAYLOAD, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }).then(setQr).catch(console.error);
    }
  }, [isAllowed]);

  if (adminLoading) {
    return <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center">Loading...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Lock size={40} className="text-red-600" />
        <h2 className="text-lg font-bold text-white">Access restricted</h2>
        <p className="text-gray-500 text-sm">You don't have permission to view the check-in QR.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <p className="text-white/40 font-black tracking-widest text-xs uppercase">
        Gym Check‑in QR
      </p>
      <div className="bg-white p-4 rounded-2xl">
        {qr && <img src={qr} alt="Gym QR" className="w-72 h-72" />}
      </div>
      <p className="text-white/20 text-xs tracking-widest">ALPHA GYM · SCAN TO MARK ATTENDANCE</p>
      <button
        onClick={() => {
          const a = document.createElement("a");
          a.href = qr;
          a.download = "alpha-gym-qr.png";
          a.click();
        }}
        className="mt-2 px-6 py-2 bg-red-600 text-white text-sm font-black tracking-widest rounded-xl hover:bg-red-700 transition"
      >
        DOWNLOAD & PRINT
      </button>
    </div>
  );
}