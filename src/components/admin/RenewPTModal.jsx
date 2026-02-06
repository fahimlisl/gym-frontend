import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  fetchAllTrainers,
  renewPT,
} from "../../api/admin.api";

export default function RenewPTModal({
  userId,
  currentPT,
  onClose,
  onSuccess,
}) {
  const [trainers, setTrainers] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [loading, setLoading] = useState(false);

  const latest =
    currentPT.subscription[currentPT.subscription.length - 1];

  const [form, setForm] = useState({
    plan: latest.plan || "monthly",
    price: latest.price || "",
    startDate: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllTrainers();
        setTrainers(res.data.data || []);

        setTrainerId(latest.trainer?._id);
      } catch (err) {
        toast.error("Failed to load trainers");
      }
    };

    load();
  }, []);


  const submit = async (e) => {
    e.preventDefault();

    if (!trainerId) {
      toast.error("Trainer is required");
      return;
    }

    if (!form.price) {
      toast.error("Price is required");
      return;
    }

    try {
      setLoading(true);

      await renewPT(userId, trainerId, form);

      toast.success("PT renewed successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to renew PT"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur
                    flex items-center justify-center">

      <div className="w-full max-w-xl rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 p-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black tracking-widest">
            RENEW PERSONAL TRAINING
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="border border-white/10 p-4 mb-6 text-sm">
          <p className="text-gray-400 text-xs tracking-widest">
            CURRENT TRAINER
          </p>
          <p className="font-bold mt-1">
            {latest.trainer?.fullName}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5 text-black">

          <Field label="TRAINER">
            <select
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              className="input"
            >
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="PLAN">
            <select
              value={form.plan}
              onChange={(e) =>
                setForm({ ...form, plan: e.target.value })
              }
              className="input"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
          <Field label="PRICE">
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="input"
            />
          </Field>

          <Field label="START DATE (OPTIONAL)">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="input"
            />
          </Field>

          <Field label="PAYMENT METHOD">
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod: e.target.value,
                })
              }
              className="input"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
            </select>
          </Field>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="border border-white/20 px-6 py-3 text-xs font-extrabold tracking-widest text-white "
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
              {loading ? "RENEWING..." : "RENEW PT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
};