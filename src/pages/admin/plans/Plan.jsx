import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, Package, Check, X } from "lucide-react";

import {
  fetchAllPlans,
  addPlan,
  editPlan,
  destroyPlan,
  addBenefit,
  removeBenefit,
} from "../../../api/admin.api.js";
import api from "../../../api/axios.api.js";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [benefitInputs, setBenefitInputs] = useState({});

  const [editModal, setEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "SUBSCRIPTION",
    duration: "monthly",
    basePrice: "",
    finalPrice: "",
    bio: "",
  });const [isSuperAdmin, setIsSuperAdmin] = useState(false);

useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const { data } = await api.get("/admin/get/me");
      setIsSuperAdmin(data?.admin?.isSuperAdmin ?? false);
    } catch {
      setIsSuperAdmin(false);
    }
  };
  fetchAdmin();
}, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPlans();
      setPlans(data.data.data);
    } catch {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreate = async () => {
    try {
      await addPlan(form);
      toast.success("Plan created");
      setForm({
        title: "",
        category: "SUBSCRIPTION",
        duration: "monthly",
        basePrice: "",
        finalPrice: "",
        bio: "",
      });
      loadPlans();
    } catch {
      toast.error("Failed to create plan");
    }
  };

  const handleDelete = async (id) => {
    try {
      await destroyPlan(id);
      toast.success("Plan deleted");
      loadPlans();
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const handleAddBenefit = async (planId) => {
    const value = benefitInputs[planId];
    if (!value) return;

    try {
      await addBenefit(planId, { title: value });
      toast.success("Benefit added");

      setBenefitInputs((prev) => ({
        ...prev,
        [planId]: "",
      }));

      loadPlans();
    } catch {
      toast.error("Failed to add benefit");
    }
  };

  const handleRemoveBenefit = async (planId, benefitId) => {
    try {
      await removeBenefit(planId, benefitId);
      toast.success("Benefit removed");
      loadPlans();
    } catch {
      toast.error("Failed removing benefit");
    }
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await editPlan(editingPlan._id, editingPlan);
      toast.success("Plan updated");
      setEditModal(false);
      loadPlans();
    } catch {
      toast.error("Failed updating plan");
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <Package />
        <h1 className="text-2xl font-bold">Plan Management</h1>
      </div>

      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">Create New Plan</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Title"
            className="bg-black border border-white/10 p-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="bg-black border border-white/10 p-2 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="PT">Personal Training</option>
          </select>

          <select
            className="bg-black border border-white/10 p-2 rounded"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half-yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>

          <input
            placeholder="Base Price"
            type="number"
            className="bg-black border border-white/10 p-2 rounded"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
          />

          <input
            placeholder="Final Price"
            type="number"
            className="bg-black border border-white/10 p-2 rounded"
            value={form.finalPrice}
            onChange={(e) => setForm({ ...form, finalPrice: e.target.value })}
          />

          <input
            placeholder="Bio"
            className="bg-black border border-white/10 p-2 rounded"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <button
  onClick={handleCreate}
  disabled={!isSuperAdmin}
  title={!isSuperAdmin ? "Super admin only" : ""}
  className="mt-4 flex items-center gap-2 bg-red-600 px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
>
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{plan.title}</h3>

                  <p className="text-sm text-gray-400">
                    {plan.category} • {plan.duration}
                  </p>
                </div>

                <div className="flex gap-3">
                 <button
  onClick={() => openEdit(plan)}
  disabled={!isSuperAdmin}
  title={!isSuperAdmin ? "Super admin only" : ""}
  className="text-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
>
                    <Pencil size={18} />
                  </button>

                  <button
  onClick={() => handleDelete(plan._id)}
  disabled={!isSuperAdmin}
  title={!isSuperAdmin ? "Super admin only" : ""}
  className="text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                {plan.basePrice && (
                  <span className="line-through text-gray-500 mr-2">
                    ₹{plan.basePrice}
                  </span>
                )}

                <span className="text-xl font-bold text-red-500">
                  ₹{plan.finalPrice}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4">{plan.bio}</p>
              <p className="text-xs text-gray-500 mb-4">
                Updated:{" "}
                {new Date(plan.updatedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                •{" "}
                {new Date(plan.updatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-2">Benefits</h4>

                <ul className="space-y-2 text-sm">
                  {plan.benefits.map((b) => (
                    <li
                      key={b._id}
                      className="flex justify-between items-center"
                    >
                      <span className="flex items-center gap-2">
                        <Check size={14} />
                        {b.heading}
                      </span>

                      <button
  onClick={() => handleRemoveBenefit(plan._id, b._id)}
  disabled={!isSuperAdmin}
  title={!isSuperAdmin ? "Super admin only" : ""}
  className="disabled:opacity-40 disabled:cursor-not-allowed"
>
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  placeholder="New benefit"
                  disabled={!isSuperAdmin}
                  className="flex-1 bg-black border border-white/10 p-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  value={benefitInputs[plan._id] || ""}
                  onChange={(e) =>
                    setBenefitInputs((prev) => ({
                      ...prev,
                      [plan._id]: e.target.value,
                    }))
                  }
                />

                <button
  onClick={() => handleAddBenefit(plan._id)}
  disabled={!isSuperAdmin}
  title={!isSuperAdmin ? "Super admin only" : ""}
  className="bg-red-600 px-3 rounded disabled:opacity-40 disabled:cursor-not-allowed"
>
                  <Plus size={16} />
                </button>

                <p className="text-sm text-gray-400 mb-2"></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal && editingPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-neutral-900 p-6 rounded-xl w-[400px] space-y-3">
            <h2 className="text-lg font-bold">Edit Plan</h2>

            <input
              className="w-full p-2 bg-black border border-white/10 rounded"
              value={editingPlan.title}
              onChange={(e) =>
                setEditingPlan({
                  ...editingPlan,
                  title: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="w-full p-2 bg-black border border-white/10 rounded"
              value={editingPlan.basePrice}
              onChange={(e) =>
                setEditingPlan({
                  ...editingPlan,
                  basePrice: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="w-full p-2 bg-black border border-white/10 rounded"
              value={editingPlan.finalPrice}
              onChange={(e) =>
                setEditingPlan({
                  ...editingPlan,
                  finalPrice: e.target.value,
                })
              }
            />

            <input
              className="w-full p-2 bg-black border border-white/10 rounded"
              value={editingPlan.bio}
              onChange={(e) =>
                setEditingPlan({
                  ...editingPlan,
                  bio: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 border border-white/20 rounded"
              >
                Cancel
              </button>

              <button
  onClick={handleEditSave}
  disabled={!isSuperAdmin}
  className="px-4 py-2 bg-red-600 rounded disabled:opacity-40 disabled:cursor-not-allowed"
>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
