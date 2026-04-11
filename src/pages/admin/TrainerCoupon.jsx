import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";

export default function TrainerCoupon() {
  const [coupons, setCoupons] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const defaultForm = {
    trainerId: "",
    code: "",
    typeOfCoupon: "flat",
    minCartAmount: "",
    maxDiscount: "",
    expiryDate: "",
    isActive: true,
    value: "",
  };

  const [form, setForm] = useState(defaultForm);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("/admin/fetch/trainer/coupon/all");
      setCoupons(res.data.data);
    } catch {
      toast.error("Failed to fetch trainer coupons");
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await axios.get("/admin/fetchAllTrainer");
      setTrainers(res.data.data || []);
    } catch {
      toast.error("Failed to fetch trainers");
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchTrainers();
  }, []);

  const resetForm = () => setForm(defaultForm);

  const handleSubmit = async () => {
    if (!form.code || !form.expiryDate || !form.value) {
      return toast.error("Code, value and expiry date are required");
    }
    if (!form.trainerId) {
      return toast.error("Please select a trainer");
    }

    try {
      setLoading(true);
      if (editId) {
        await axios.patch(`/admin/edit/trainer/coupon/${editId}`, form);
        toast.success("Trainer coupon updated");
      } else {
        await axios.post(`/admin/add/trainer/coupon/${form.trainerId}`, form);
        toast.success("Trainer coupon created");
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    setForm({
      trainerId: coupon.trainerId?._id || coupon.trainerId || "",
      code: coupon.code,
      typeOfCoupon: coupon.typeOfCoupon,
      minCartAmount: coupon.minCartAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      expiryDate: coupon.expiryDate?.slice(0, 10) || "",
      isActive: coupon.isActive,
      // category: coupon.category,
      value: coupon.value,
    });
    setShowModal(true);
  };

  const handleToggle = async (coupon) => {
    try {
      await axios.patch(`/admin/toggle/trainer/coupon/${coupon._id}`, {
        expiryDate: coupon.expiryDate,
      });
      toast.success(`Coupon ${coupon.isActive ? "deactivated" : "activated"}`);
      fetchCoupons();
    } catch {
      toast.error("Failed to toggle coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trainer coupon?")) return;
    try {
      await axios.delete(`/admin/destroy/trainer/coupon/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const getTrainerName = (trainerId) => {
    const t = trainers.find(
      (tr) => tr._id === (trainerId?._id || trainerId)
    );
    return t ? t.fullName : "—";
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-white rounded-xl shadow text-black">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Trainer Coupon Management</h2>
          <button
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowModal(true);
            }}
            className="bg-black text-white px-5 py-2 rounded-lg w-full sm:w-auto"
          >
            + Add Trainer Coupon
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Trainer</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Min Cart</th>
                <th className="p-3">Max Discount</th>
                <th className="p-3">Expiry</th>
                {/* <th className="p-3">Category</th> */}
                <th className="p-3">Used</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-gray-400">
                    No trainer coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-semibold">{c.code}</td>
                    <td className="p-3">{getTrainerName(c.trainerId)}</td>
                    <td className="p-3 capitalize">{c.typeOfCoupon}</td>
                    <td className="p-3">
                      {c.typeOfCoupon === "percentage" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="p-3">{c.minCartAmount ? `₹${c.minCartAmount}` : "—"}</td>
                    <td className="p-3">{c.maxDiscount ? `₹${c.maxDiscount}` : "—"}</td>
                    <td className="p-3">{new Date(c.expiryDate).toLocaleDateString("en-IN")}</td>
                    {/* <td className="p-3">{c.category}</td> */}
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {c.usedCount || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggle(c)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-500 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {coupons.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No trainer coupons found</p>
          ) : (
            coupons.map((c) => (
              <div key={c._id} className="border rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-base">{c.code}</span>
                  <button
                    onClick={() => handleToggle(c)}
                    className={`text-xs px-2 py-1 rounded ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Trainer: <span className="text-black font-medium">{getTrainerName(c.trainerId)}</span>
                </div>
                <div className="text-sm">Type: {c.typeOfCoupon}</div>
                <div className="text-sm">
                  Value: {c.typeOfCoupon === "percentage" ? `${c.value}%` : `₹${c.value}`}
                </div>
                <div className="text-sm">Min Cart: {c.minCartAmount ? `₹${c.minCartAmount}` : "—"}</div>
                <div className="text-sm">Max Discount: {c.maxDiscount ? `₹${c.maxDiscount}` : "—"}</div>
                <div className="text-sm">
                  Expiry: {new Date(c.expiryDate).toLocaleDateString("en-IN")}
                </div>
                {/* <div className="text-sm">Category: {c.category}</div> */}
                <div className="text-sm">Used: {c.usedCount || 0} times</div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600 font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-bold">
                {editId ? "Edit Trainer Coupon" : "Add Trainer Coupon"}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Trainer dropdown */}
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">
                  Assign Trainer *
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.trainerId}
                  onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                >
                  <option value="">— Select Trainer —</option>
                  {trainers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} {t.phoneNumber ? `· ${t.phoneNumber}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <input
                className="w-full border p-2 rounded uppercase"
                placeholder="Coupon Code *"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />

              <select
                className="w-full border p-2 rounded"
                value={form.typeOfCoupon}
                onChange={(e) => setForm({ ...form, typeOfCoupon: e.target.value })}
              >
                <option value="flat">Flat (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
              <input
                className="w-full border p-2 rounded"
                placeholder={`Value * ${form.typeOfCoupon === "percentage" ? "(%)" : "(₹)"}`}
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Min Cart Amount (Optional)"
                type="number"
                value={form.minCartAmount}
                onChange={(e) => setForm({ ...form, minCartAmount: e.target.value })}
              />

              {form.typeOfCoupon === "percentage" && (
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Max Discount Cap in ₹ (Optional)"
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                />
              )}

              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 border rounded w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded w-full sm:w-auto disabled:opacity-50"
              >
                {loading ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}