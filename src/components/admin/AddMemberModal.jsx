import { useState } from "react";
import toast from "react-hot-toast";
import { registerMember } from "../../api/admin.api";

export default function AddMemberModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    plan: "monthly",
    price: "",
    admissionFee: "",
    paymentMethod: "cash",
  });

  const [avatar, setAvatar] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      toast.error("Avatar is required");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        fd.append(key, value)
      );
      fd.append("avatar", avatar);

      await registerMember(fd);

      toast.success("Member added successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">

      <div className="w-full max-w-2xl rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-widest">
            ADD MEMBER
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="grid gap-5">

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Email (optional)"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* AVATAR */}
          <div>
            <label className="text-xs tracking-widest text-gray-400">
              AVATAR
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="mt-2 w-full text-sm text-gray-300"
            />
          </div>

          {/* SUBSCRIPTION */}
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="PLAN"
              name="plan"
              value={form.plan}
              onChange={handleChange}
              options={[
                "monthly",
                "quarterly",
                "half-yearly",
                "yearly",
              ]}
            />
            <Input
              label="PRICE"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
            <Input
              label="ADMISSION FEE"
              name="admissionFee"
              value={form.admissionFee}
              onChange={handleChange}
              required
            />
          </div>

          <Select
            label="PAYMENT METHOD"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            options={["cash", "upi", "card", "netbanking"]}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="border border-white/20 px-6 py-3 text-xs font-extrabold tracking-widest"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700
                         px-8 py-3 text-xs font-extrabold tracking-widest
                         disabled:opacity-50"
            >
              {loading ? "ADDING..." : "ADD MEMBER"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ---------- SMALL INPUTS ---------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <select
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
