import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";

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
    category: "CAFE",
    value: 0,
    usageLimit: "", 
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
      category: "CAFE",
      value: "",
      usageLimit: "", 
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
      value: coupon.value,
      usageLimit: coupon.usageLimit || "",
    });

    setShowModal(true);
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-white rounded-xl shadow text-black">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Coupon Management</h2>

          <button
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowModal(true);
            }}
            className="bg-black text-white px-5 py-2 rounded-lg w-full sm:w-auto"
          >
            + Add Coupon
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
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
                <th className="p-3">Usage Limit</th> 
                <th className="p-3">Used</th> 
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

                  <td className="p-3">{c.category || "-"}</td>

                  <td className="p-3"> 
                    {c.usageLimit || "∞"}
                  </td>

                  <td className="p-3"> 
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.usageLimit && c.usedCount >= c.usageLimit
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {c.usedCount || 0}
                      {c.usageLimit ? `/${c.usageLimit}` : ""}
                    </span>
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
            </tbody>
          </table>
        </div>

        <div className="space-y-4 md:hidden">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="border rounded-lg p-4 shadow-sm space-y-2"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{c.code}</span>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Type: {c.typeOfCoupon}
              </div>

              <div className="text-sm">
                Value:{" "}
                {c.typeOfCoupon === "percentage"
                  ? `${c.value}%`
                  : `₹${c.value}`}
              </div>

              <div className="text-sm">Min Cart: {c.minCartAmount || "—"}</div>

              <div className="text-sm">
                Max Discount: {c.maxDiscount || "—"}
              </div>

              <div className="text-sm">
                Expiry: {new Date(c.expiryDate).toLocaleDateString("en-IN")}
              </div>

              <div className="text-sm">Category: {c.category || "-"}</div>

              <div className="text-sm"> 
                Usage: {c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ""}
              </div>

              <button
                onClick={() => handleEdit(c)}
                className="text-blue-600 font-semibold pt-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-bold">
                {editId ? "Edit Coupon" : "Add Coupon"}
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                  setForm({
                    ...form,
                    typeOfCoupon: e.target.value,
                  })
                }
              >
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>

              <select
                className="w-full border p-2 rounded"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="CAFE">CAFE</option>
                <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                <option value="PERSONAL TRAINING">PERSONAL TRAINING</option>
                <option value="ADMISSION">ADMISSION</option>
                <option value="SUPPLEMENT">SUPPLEMENT</option>
              </select>

              <input
                className="w-full border p-2 rounded"
                placeholder="Value"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Min Cart Amount (Optional)"
                type="number"
                value={form.minCartAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minCartAmount: e.target.value,
                  })
                }
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Max Discount (Optional)"
                type="number"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxDiscount: e.target.value,
                  })
                }
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Usage Limit (Optional - Leave empty for unlimited)"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    usageLimit: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="w-full border p-2 rounded"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiryDate: e.target.value,
                  })
                }
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.checked,
                    })
                  }
                />
                Active
              </label>
              {form.usageLimit && (
                <p className="text-xs text-gray-500">
                  This coupon can be used {form.usageLimit} times
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded w-full sm:w-auto"
              >
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}