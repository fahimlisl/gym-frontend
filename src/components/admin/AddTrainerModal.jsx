import { useState } from "react";
import toast from "react-hot-toast";
import { registerTrainer } from "../../api/admin.api";

export default function AddTrainerModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    experience: "",
    salary: "",
    avatar: null,
  });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.avatar) {
      toast.error("Trainer avatar is required");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    try {
      setLoading(true);
      await registerTrainer(fd);
      toast.success("Trainer added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add trainer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">

      <div className="w-full max-w-3xl
                      border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      rounded-2xl p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-widest">
            ADD TRAINER
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-8">

          {/* TOP GRID */}
          <div className="grid md:grid-cols-2 gap-6">

            <Input
              label="FULL NAME"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />

            <Input
              label="PHONE NUMBER"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />

            <Input
              label="EMAIL (OPTIONAL)"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <Input
              label="PASSWORD"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <Input
              label="EXPERIENCE"
              value={form.experience}
              onChange={(e) =>
                setForm({ ...form, experience: e.target.value })
              }
            />

            <Input
              label="SALARY (₹)"
              type="number"
              value={form.salary}
              onChange={(e) =>
                setForm({ ...form, salary: e.target.value })
              }
            />
          </div>

          {/* AVATAR UPLOAD */}
          <div className="border border-white/10 rounded-xl p-6
                          flex items-center gap-6">

            {/* PREVIEW */}
            <div className="w-24 h-24 rounded-full border-2 border-red-600 overflow-hidden bg-black">
              {form.avatar ? (
                <img
                  src={URL.createObjectURL(form.avatar)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                                text-gray-500 text-xs tracking-widest">
                  NO AVATAR
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="flex-1">
              <p className="text-xs text-gray-400 tracking-widest mb-2">
                TRAINER AVATAR
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, avatar: e.target.files[0] })
                }
                className="block w-full text-sm text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:border-0
                           file:bg-red-600 file:text-white
                           hover:file:bg-red-700"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border border-white/20
                         text-xs font-extrabold tracking-widest
                         hover:border-white"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-red-600
                         text-xs font-extrabold tracking-widest
                         hover:bg-red-700
                         disabled:opacity-50"
            >
              {loading ? "ADDING..." : "ADD TRAINER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-gray-400 tracking-widest">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-neutral-900
                   border border-white/10
                   px-4 py-3 text-sm
                   focus:border-red-600 outline-none"
      />
    </div>
  );
}
