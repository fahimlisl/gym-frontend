import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import {
  editCafeItem,
  getCafeCategories,
  addCafeCategory,
} from "../../../api/admin.api";

export default function EditCafeItemModal({ item, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: item.name || "",
    category: item.category || "",
    description: item.description || "",
    price: item.price || "",
    calories: item.calories || "",
    protein: item.macros?.protein || "",
    carbs: item.macros?.carbs || "",
    fats: item.macros?.fats || "",
    isVeg: item.isVeg ?? true,
    stock: item.quantity ?? "",
    available: item.available ?? true,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCafeCategories();
        setCategories(data);
      } catch {
        toast.error("Failed to load categories");
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const cat = await addCafeCategory(newCategory);

      setCategories((prev) => [...prev, cat]);

      setForm((prev) => ({
        ...prev,
        category: cat.name,
      }));

      setNewCategory("");

      toast.success("Category added");
    } catch {
      toast.error("Failed to add category");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        calories: Number(form.calories),
        protien: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fats),
        isVeg: form.isVeg,
        available: form.available,
        stock: Number(form.stock),
      };

      await editCafeItem(item._id, payload);

      toast.success("Cafe item updated");

      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="w-full max-w-2xl bg-gradient-to-br from-black via-neutral-900 to-black
        border border-red-600/30 rounded-xl shadow-xl
        max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg sm:text-xl font-black tracking-widest">
            EDIT CAFE ITEM
          </h2>

          <button onClick={onClose} className="hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="overflow-y-auto px-6 py-5 space-y-5 flex-1"
        >
          <div className="space-y-3">
            <label className="text-sm">Item Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Cafe item name"
              className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm">Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
            >
              <option value="">Select Category</option>

              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}

              <option value="__add_new">+ Add New Category</option>
            </select>

            {form.category === "__add_new" && (
              <div className="flex gap-2">
                <input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
                />

                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-red-600 hover:bg-red-700 px-3 rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Short item description"
              className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Selling Price</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="₹"
                className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Calories</label>
              <input
                name="calories"
                type="number"
                value={form.calories}
                onChange={handleChange}
                placeholder="kcal"
                className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 tracking-widest mb-3">
              MACROS (grams)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                name="protein"
                type="number"
                value={form.protein}
                onChange={handleChange}
                placeholder="Protein (g)"
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
              />

              <input
                name="carbs"
                type="number"
                value={form.carbs}
                onChange={handleChange}
                placeholder="Carbs (g)"
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
              />

              <input
                name="fats"
                type="number"
                value={form.fats}
                onChange={handleChange}
                placeholder="Fats (g)"
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 tracking-widest mb-3">STOCK</p>

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-6 pt-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isVeg"
                checked={form.isVeg}
                onChange={handleChange}
              />
              Vegetarian
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />
              Available
            </label>
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="border border-white/20 px-5 py-2 text-sm rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 transition px-5 py-2 text-sm font-bold rounded-lg"
          >
            {loading ? "Updating..." : "Update Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Label({ children }) {
  return <p className="text-xs text-gray-400 tracking-widest">{children}</p>;
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-black border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-red-500 outline-none"
    />
  );
}
