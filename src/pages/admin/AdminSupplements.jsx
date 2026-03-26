import { useEffect, useState } from "react";
import { fetchAdminSupplements, deleteSupplement } from "../../api/supplement.api.js";
import EditSupplementModal from "../../components/admin/EditSupplementModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminSupplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
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

  const handleUpdate = (updatedSupplement) => {
    setSupplements((prev) =>
      prev.map((s) =>
        s._id === updatedSupplement._id ? updatedSupplement : s
      )
    );
  };

  return (
    <>
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
      ) : supplements.length === 0 ? (
        <p className="text-gray-400">No supplements added yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplements.map((s) => (
            <div
              key={s._id}
              className="border border-white/10 bg-black p-4"
            >
              <img
                src={
                  s.images?.find((i) => i.isThumbnail)?.url ||
                  "https://via.placeholder.com/200"
                }
                alt={s.productName}
                className="h-40 w-full object-cover mb-3"
              />

              <h3 className="font-bold text-lg">{s.productName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {s.category}
              </p>

              <div className="space-y-1 text-sm mb-3">
                <p className="text-gray-300">
                  Sale Price: <span className="font-bold">₹{s.salePrice}</span>
                </p>
                <p className="text-gray-300">
                  Purchase Price: <span className="font-bold">₹{s.purchasePrice}</span>
                </p>
                <p className="text-gray-300">
                  Stock: <span className="font-bold">{s.quantity}</span>
                </p>
                {s.barcode && (
                  <p className="text-gray-300">
                    Barcode: <span className="font-bold text-xs">{s.barcode}</span>
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {s.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(s._id)}
                  className="flex-1 bg-blue-600 py-2 font-bold text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="flex-1 bg-red-600 py-2 font-bold text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <EditSupplementModal
          supplementId={editingId}
          onClose={() => setEditingId(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}
