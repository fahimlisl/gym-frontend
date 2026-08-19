import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { registerAdmin } from "../../api/admin.api.js";

export default function AddAdminModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.phoneNumber) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      await registerAdmin(form);
      toast.success("Admin created");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-neutral-950 border border-red-600/30 rounded-2xl shadow-[0_0_60px_rgba(255,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-t-2xl" />

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black tracking-widest text-red-600">
              ADD ADMIN
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition text-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="USERNAME"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm rounded-lg focus:outline-none focus:border-red-500 transition"
            />

            <input
              type="email"
              placeholder="EMAIL"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm rounded-lg focus:outline-none focus:border-red-500 transition"
            />

            <input
              type="tel"
              placeholder="PHONE NUMBER"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm rounded-lg focus:outline-none focus:border-red-500 transition"
            />

            <input
              type="password"
              placeholder="PASSWORD"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm rounded-lg focus:outline-none focus:border-red-500 transition"
            />

            <p className="text-xs text-gray-500">
              New admins start with no permissions enabled. Set their access from the admin list after creation.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 font-bold tracking-widest text-sm bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "CREATING..." : "CREATE ADMIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}