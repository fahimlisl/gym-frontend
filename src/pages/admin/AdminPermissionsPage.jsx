import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";
import { togglePermission } from "../../api/admin.api.js";

const MODULES = [
  "members", "payments", "trainer", "attendance", "plans", "offers",
  "supplement", "sell_supplement", "coupons", "trainer_coupon",
  "expense", "assets", "check_in_qr", "workout_templates",
];

export default function AdminPermissionsPage() {
  const { adminId } = useParams();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null); 
  console.log("do we have the adminId ? ",adminId)
  const loadAdmin = async () => {
    try {
      const { data } = await api.get(`/admin/get/a/${adminId}`);
      console.log(data)
      setAdmin(data?.data ?? data?.admin);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [adminId]);

  const handleToggle = async (module, field) => {
    const key = `${module}-${field}`;
    setPending(key);
    try {
      const { data } = await togglePermission(module, adminId, field);
      setAdmin(data?.data);
      toast.success(`${module}.${field} updated`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle");
    } finally {
      setPending(null);
    }
  };

  if (loading) return <div className="text-gray-400 p-6">Loading...</div>;
  if (!admin) return <div className="text-gray-400 p-6">Admin not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-black tracking-widest text-red-600 mb-1">
        {admin.username}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{admin.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULES.map((module) => {
          const perm = admin[module] || { allow: false, isReadOnly: false };
          return (
            <div
              key={module}
              className="p-4 rounded-xl bg-neutral-950 border border-white/10"
            >
              <p className="text-white font-bold text-sm mb-3 capitalize">
                {module.replace(/_/g, " ")}
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Allow access</span>
                <Toggle
                  checked={perm.allow}
                  disabled={pending === `${module}-allow`}
                  onChange={() => handleToggle(module, "allow")}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Read only</span>
                <Toggle
                  checked={perm.isReadOnly}
                  disabled={!perm.allow || pending === `${module}-isReadOnly`}
                  onChange={() => handleToggle(module, "isReadOnly")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition relative
        ${checked ? "bg-red-600" : "bg-white/10"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}