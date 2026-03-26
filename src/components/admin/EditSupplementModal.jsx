import { useEffect, useState } from "react";
import { fetchPublicSupplementById, editSupplement } from "../../api/supplement.api";
import toast from "react-hot-toast";

export default function EditSupplementModal({ supplementId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [supplement, setSupplement] = useState(null);

  useEffect(() => {
    const loadSupplement = async () => {
      try {
        const data = await fetchPublicSupplementById(supplementId);
        setSupplement(data);
      } catch (err) {
        toast.error("Failed to load supplement");
        onClose();
      } finally {
        setFetching(false);
      }
    };

    loadSupplement();
  }, [supplementId, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData();

    // Only append fields that have values
    if (form.productName.value) {
      formData.append("productName", form.productName.value);
    }
    if (form.category.value) {
      formData.append("category", form.category.value);
    }
    if (form.salePrice.value) {
      formData.append("salePrice", form.salePrice.value);
    }
    if (form.purchasePrice.value) {
      formData.append("purchasePrice", form.purchasePrice.value);
    }
    if (form.quantity.value) {
      formData.append("quantity", form.quantity.value);
    }
    if (form.description.value) {
      formData.append("description", form.description.value);
    }
    if (form.barcode.value) {
      formData.append("barcode", form.barcode.value);
    }

    try {
      const updatedSupplement = await editSupplement(supplementId, formData);
      toast.success("Supplement updated successfully");
      onUpdate(updatedSupplement);
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update supplement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold">Edit Supplement</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {fetching ? (
          <p className="text-gray-400">Loading supplement...</p>
        ) : !supplement ? (
          <p className="text-gray-400">Supplement not found</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="productName"
              placeholder="Product Name"
              defaultValue={supplement.productName}
              className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
            />

            <select
              name="category"
              defaultValue={supplement.category}
              className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
            >
              <option value="">Select Category</option>
              <option>Pre WorkOut</option>
              <option>Protien</option>
              <option>Creatien</option>
              <option>BCAA</option>
              <option>L-Arginine</option>
              <option>Fish Oil</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="salePrice"
                placeholder="Sale Price"
                defaultValue={supplement.salePrice}
                step="0.01"
                min="0"
                className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
              />

              <input
                type="number"
                name="purchasePrice"
                placeholder="Purchase Price"
                defaultValue={supplement.purchasePrice}
                step="0.01"
                min="0"
                className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
              />
            </div>

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              defaultValue={supplement.quantity}
              min="1"
              className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
            />

            <input
              type="text"
              name="barcode"
              placeholder="Barcode (Optional)"
              defaultValue={supplement.barcode || ""}
              className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
            />

            <textarea
              name="description"
              placeholder="Description"
              defaultValue={supplement.description}
              className="w-full bg-neutral-800 border border-white/10 px-4 py-2 text-sm"
              rows={3}
            />

            {/* Current Images */}
            {supplement.images && supplement.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Current Images:</p>
                <div className="grid grid-cols-4 gap-2">
                  {supplement.images.map((img) => (
                    <div key={img.public_id} className="relative">
                      <img
                        src={img.url}
                        alt="Supplement"
                        className="w-full h-16 object-cover border border-white/10 rounded"
                      />
                      {img.isThumbnail && (
                        <span className="absolute top-0 right-0 bg-red-600 text-xs px-1 py-0.5 rounded">
                          Thumb
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 py-2 font-extrabold text-sm disabled:opacity-50"
              >
                {loading ? "UPDATING..." : "UPDATE"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 py-2 font-extrabold text-sm"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
