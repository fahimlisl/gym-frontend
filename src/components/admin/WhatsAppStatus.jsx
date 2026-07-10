import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../api/axios.api";

export default function WhatsAppStatus() {
  const [status, setStatus] = useState(null); 

  const checkStatus = async () => {
    try {
      const { data } = await api.get("/whatsapp/status");
      setStatus(data);
    } catch (err) {
      console.error("Failed to check WhatsApp status", err);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); 
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div className="text-gray-400">Checking WhatsApp...</div>;

  if (status.connected) {
    return (
      <>
      <div className="text-green-400 font-bold text-sm">
        ✅ WhatsApp connected 
      </div>
        <span className="bg-white-700 text-red-600">Usually its not recommended to log out the session from your whatsapp app, it might affect the server</span>
      </>
    );
  }

  return (
    <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-6 text-center">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">
        WhatsApp Disconnected
      </h2>
      <p className="text-gray-300 mb-4">
        Scan the QR code with your WhatsApp to link the device.
      </p>
      {status.qr ? (
        <div className="inline-block p-4 bg-white rounded-lg">
          <QRCodeSVG value={status.qr} size={256} />
        </div>
      ) : (
        <p className="text-red-400">No QR code available. Restart the server.</p>
      )}
      <button
        onClick={checkStatus}
        className="mt-4 px-4 py-2 bg-yellow-600 text-black font-bold rounded"
      >
        Retry
      </button>
    </div>
  );
}