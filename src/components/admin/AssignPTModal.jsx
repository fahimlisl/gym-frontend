import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  fetchAllTrainers,
  assignPT,
} from "../../api/admin.api.js";


export default function AssignPTModal({ userId, onClose, onSuccess }) {
  const [trainers, setTrainers] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    plan: "monthly",
    price: "",
    startDate: "",
    paymentMethod: "cash",
  });

  /* ================= LOAD TRAINERS ================= */

  useEffect(() => {

    const loadTrainers = async () => {

      try {
        const res = await fetchAllTrainers();
        console.log(res)
        setTrainers(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load trainers");
      }
    };

    loadTrainers();
  }, []);

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();

    if (!trainerId) {
      toast.error("Please select a trainer");
      return;
    }

    if (!form.price) {
      toast.error("Price is required");
      return;
    }

    try {
      setLoading(true);

      await assignPT(userId, trainerId, form);

      toast.success("Personal training assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to assign PT"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black tracking-widest">
            ASSIGN PERSONAL TRAINING
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-5">

          {/* TRAINER */}
          <Field label="TRAINER">
            <select
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              className="input text-black"
            >
              <option value="">Select Trainer</option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </Field>

          {/* PLAN */}
          <Field label="PLAN">
            <select
              value={form.plan}
              onChange={(e) =>
                setForm({ ...form, plan: e.target.value })
              }
              className="input text-black"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>

          {/* PRICE */}
          <Field label="PRICE">
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="input text-black"
              required
            />
          </Field>

          {/* START DATE */}
          <Field label="START DATE (OPTIONAL)">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="input text-black"
            />
          </Field>

          {/* PAYMENT METHOD */}
          <Field label="PAYMENT METHOD">
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod: e.target.value,
                })
              }
              className="input text-black"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
            </select>
          </Field>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6">
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
              {loading ? "ASSIGNING..." : "ASSIGN PT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= SMALL UI ================= */

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
