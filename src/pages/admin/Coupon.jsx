import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout.jsx";

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    typeOfCoupon: "flat",
    minCartAmount: "",
    maxDiscount: "",
    expiryDate: "",
    isActive: true,
    category:"CAFE",
    value:0
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("/admin/fetchAllCoupons");
      setCoupons(res.data.data);
    } catch {
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async () => {
    if (!form.code || !form.expiryDate) {
      return toast.error("Code and expiry date are required");
    }

    try {
      setLoading(true);

      if (editId) {
        await axios.patch(`/admin/edit-coupon/${editId}`, form);
        toast.success("Coupon updated");
      } else {
        await axios.post("/admin/add-coupon", form);
        toast.success("Coupon created");
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

  const resetForm = () => {
    setForm({
      code: "",
      typeOfCoupon: "flat",
      minCartAmount: "",
      maxDiscount: "",
      expiryDate: "",
      isActive: true,
      category:"CAFE",
      value:0
    });
  };

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    setForm({
      code: coupon.code,
      typeOfCoupon: coupon.typeOfCoupon,
      minCartAmount: coupon.minCartAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      expiryDate: coupon.expiryDate.slice(0, 10),
      isActive: coupon.isActive,
      category: coupon.category,
      value: coupon.value
    });
    setShowModal(true);
  };

  return (
    <AdminDashboardLayout title="Coupons">
      <div className="p-6 bg-white rounded-xl shadow text-black">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <button
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowModal(true);
            }}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            + Add Coupon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Min Cart</th>
                <th className="p-3">Max Discount</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-3 font-semibold">{c.code}</td>
                  <td className="p-3 capitalize">{c.typeOfCoupon}</td>
                  <td className="p-3">
                    {c.typeOfCoupon === "percentage"
                      ? `${c.value}%`
                      : `₹${c.value}`}
                  </td>
                  <td className="p-3">
                    {c.minCartAmount ? `₹${c.minCartAmount}` : "—"}
                  </td>
                  <td className="p-3">
                    {c.maxDiscount ? `₹${c.maxDiscount}` : "—"}
                  </td>
                  <td className="p-3">
                    {new Date(c.expiryDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-3">
                    {c.category ? c.category : "-" }
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-blue-600 font-semibold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-black">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-bold">
              {editId ? "Edit Coupon" : "Add Coupon"}
            </h3>

            <input
              className="w-full border p-2 rounded"
              placeholder="Coupon Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            <select
              className="w-full border p-2 rounded"
              value={form.typeOfCoupon}
              onChange={(e) =>
                setForm({ ...form, typeOfCoupon: e.target.value })
              }
            >
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>

            <select
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="CAFE">CAFE</option>
              <option value="SUBSCRIPTION">SUBSCRIPTION</option>
              <option value="PERSONAL TRAINING">PERSONAL TRAINING</option>
              <option value="ADMISSION">ADMISSION</option>
            </select>

            <input
              className="w-full border p-2 rounded"
              placeholder="Min Cart Amount"
              type="number"
              value={form.minCartAmount}
              onChange={(e) =>
                setForm({ ...form, minCartAmount: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Value"
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Max Discount"
              type="number"
              value={form.maxDiscount}
              onChange={(e) =>
                setForm({ ...form, maxDiscount: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Active
            </label>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded"
              >
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
