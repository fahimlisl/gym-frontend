import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../../api/axios.api.js";

export default function SuperAdminRoute({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "allowed" | "denied"

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await axios.get("/admin/get/me");
        setStatus(data?.admin?.isSuperAdmin ? "allowed" : "denied");
      } catch {
        setStatus("denied");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}