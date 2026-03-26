import { useState } from "react";
import { addSupplement } from "../../api/supplement.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddSupplement() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData();

    formData.append("productName", form.productName.value);
    formData.append("category", form.category.value);
    formData.append("salePrice", form.salePrice.value);
    formData.append("purchasePrice", form.purchasePrice.value);
    formData.append("quantity", form.quantity.value);
    formData.append("description", form.description.value);
    
    // Barcode is optional
    if (form.barcode.value) {
      formData.append("barcode", form.barcode.value);
    }

    // Append images
    for (let file of form.images.files) {
      formData.append("images", file);
    }

    try {
      await addSupplement(formData);
      toast.success("Supplement added successfully");
      navigate("/admin/supplements");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to add supplement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold mb-6">
        Add Supplement
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-5"
      >
        <input
          name="productName"
          placeholder="Product Name"
          className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
          required
        />

        <select
          name="category"
          className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
          required
        >
          <option value="">Select Category</option>
          <option>Pre WorkOut</option>
          <option>Protien</option>
          <option>Creatien</option>
          <option>BCAA</option>
          <option>L-Arginine</option>
          <option>Fish Oil</option>
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="salePrice"
            placeholder="Sale Price"
            step="0.01"
            min="0"
            className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
            required
          />

          <input
            type="number"
            name="purchasePrice"
            placeholder="Purchase Price"
            step="0.01"
            min="0"
            className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
            required
          />
        </div>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          min="1"
          className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
          required
        />

        <input
          type="text"
          name="barcode"
          placeholder="Barcode (Optional)"
          className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full bg-neutral-900 border border-white/10 px-4 py-3"
          rows={4}
          required
        />

        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          className="w-full"
          required
        />

        <button
          disabled={loading}
          className="bg-red-600 w-full py-3 font-extrabold disabled:opacity-50"
        >
          {loading ? "ADDING..." : "ADD SUPPLEMENT"}
        </button>
      </form>
    </>
  );
}
