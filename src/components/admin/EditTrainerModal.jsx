import { useState } from "react";
import toast from "react-hot-toast";
import { editTrainer } from "../../api/admin.api";

export default function EditTrainerModal({
  trainer,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: trainer.fullName || "",
    email: trainer.email || "",
    phoneNumber: trainer.phoneNumber || "",
    experience: trainer.experience || "",
    salary: trainer.salary || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await editTrainer(trainer._id, form);
      toast.success("Trainer updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update trainer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
      <div className="w-full max-w-md
                      border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      rounded-xl p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="font-black tracking-widest">
            EDIT TRAINER
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-4">

          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />

          <Input
            label="Experience"
            name="experience"
            value={form.experience}
            onChange={handleChange}
          />

          <Input
            label="Salary (₹)"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            type="number"
          />

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/20
                         py-3 text-xs font-extrabold tracking-widest
                         hover:border-white"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 border border-red-600
                         py-3 text-xs font-extrabold tracking-widest
                         hover:bg-red-600
                         disabled:opacity-50"
            >
              {loading ? "SAVING..." : "SAVE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= SMALL INPUT ================= */

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400 tracking-widest">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full bg-neutral-900
                   border border-white/10
                   px-4 py-3 text-sm
                   focus:border-red-600 outline-none"
      />
    </div>
  );
}
