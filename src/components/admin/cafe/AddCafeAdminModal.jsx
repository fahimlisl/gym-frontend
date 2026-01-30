import { useState } from "react";
import toast from "react-hot-toast";
import { addCafeAdmin } from "../../../api/admin.api.js";

export default function AddCafeAdminModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    salary: "",
  });

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await addCafeAdmin(form);
      toast.success("Cafe admin added");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add cafe admin"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="ADD CAFE ADMIN" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">

        <Input label="USERNAME" name="username" onChange={change} required />
        <Input label="PHONE NUMBER" name="phoneNumber" onChange={change} required />
        <Input label="EMAIL (OPTIONAL)" name="email" onChange={change} />
        <Input label="PASSWORD" name="password" type="password" onChange={change} required />
        <Input label="SALARY (OPTIONAL)" name="salary" onChange={change} />

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/20 px-6 py-3
                       text-xs font-extrabold tracking-widest"
          >
            CANCEL
          </button>

          <button
            disabled={loading}
            className="bg-red-600 hover:bg-red-700
                       px-8 py-3 text-xs font-extrabold
                       tracking-widest disabled:opacity-50"
          >
            {loading ? "ADDING..." : "ADD ADMIN"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur
                    flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 p-8">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-black tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm text-white
                   focus:border-red-600 outline-none"
      />
    </div>
  );
}
