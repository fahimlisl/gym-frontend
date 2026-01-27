import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";

import { fetchAdminSupplements , deleteSupplement } from "../../api/supplement.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminSupplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminSupplements()
      .then(setSupplements)
      .catch(() => toast.error("Failed to load supplements"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplement?")) return;

    try {
      await deleteSupplement(id);
      setSupplements((prev) =>
        prev.filter((s) => s._id !== id)
      );
      toast.success("Supplement deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold">
          Supplements
        </h1>
        <button
          onClick={() => navigate("/admin/supplements/add")}
          className="bg-red-600 px-5 py-2 font-bold"
        >
          + Add Supplement
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplements.map((s) => (
            <div
              key={s._id}
              className="border border-white/10 bg-black p-4"
            >
              <img
                src={
                  s.images?.find((i) => i.isThumbnail)?.url
                }
                className="h-40 w-full object-cover mb-3"
              />

              <h3 className="font-bold">{s.productName}</h3>
              <p className="text-sm text-gray-400">
                {s.category}
              </p>
              <p className="font-bold mt-2">
                ₹{s.price}
              </p>

              <button
                onClick={() => handleDelete(s._id)}
                className="mt-4 w-full bg-red-600 py-2 font-bold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminDashboardLayout>
  );
}
