import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  addCafeItem,
  getCafeCategories,
  addCafeCategory,
} from "../../../api/admin.api.js";

export default function AddCafeItemModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    purchasePrice: "",
    price: "",
    quantity: "",
    calories: "",
    protien: "",
    carbs: "",
    fat: "",
    isVeg: true,
    available: true,
    tags: "",
    barcode: "",
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCafeCategories();
        setCategories(data);

        if (data.length > 0) {
          setForm((prev) => ({ ...prev, category: data[0].name }));
        }
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddCategory = async () => {
    if (!newCategory.trim())
      return toast.error("Category name required");

    try {
      const created = await addCafeCategory(newCategory.trim());

      setCategories((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, category: created.name }));

      toast.success("Category added");
      setNewCategory("");
      setShowAddCategory(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to add category"
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!image) return toast.error("Image is required");

    try {
      setLoading(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (
          ["purchasePrice", "price", "quantity", "calories", "protien", "carbs", "fat"].includes(
            key
          )
        ) {
          fd.append(key, Number(value));
        } else {
          fd.append(key, value);
        }
      });

      form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => fd.append("tags", tag));

      fd.append("image", image);

      await addCafeItem(fd);

      toast.success("Cafe item added");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to add item"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal title="ADD CAFE ITEM" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        <TwoCol>
          <Input
            label="ITEM NAME"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <div>
            <label className="text-xs tracking-widest text-gray-400">
              CATEGORY
            </label>

            <div className="flex gap-2 mt-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-white/10
                           px-4 py-3 text-sm text-white
                           focus:border-red-600 outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="bg-red-600 px-4 text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>
        </TwoCol>

        {showAddCategory && (
          <div className="border border-white/10 p-4 rounded-lg bg-neutral-900">
            <p className="text-xs tracking-widest text-red-500 mb-3">
              ADD NEW CATEGORY
            </p>

            <div className="flex gap-3">
              <input
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value)
                }
                placeholder="Enter category name"
                className="flex-1 bg-black border border-white/20
                           px-4 py-3 text-sm text-white"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-emerald-600 px-6 text-xs font-bold"
              >
                ADD
              </button>
            </div>
          </div>
        )}

        <Textarea
          label="DESCRIPTION"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <FileInput
          label="ITEM IMAGE"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
        />

        <ThreeCol>
          <Input
            label="PURCHASE PRICE (₹)"
            name="purchasePrice"
            type="number"
            value={form.purchasePrice}
            onChange={handleChange}
            required
          />
          <Input
            label="SELL PRICE (₹)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />
          <Input
            label="PRODUCT ID (BARCODE)"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            required
          />
        </ThreeCol>

        <TwoCol>
          <Input
            label="QUANTITY"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            required
          />
          <Input
            label="CALORIES"
            name="calories"
            type="number"
            value={form.calories}
            onChange={handleChange}
            required
          />
        </TwoCol>

        <div className="border border-white/10 p-4 rounded-lg">
          <p className="text-xs tracking-widest text-red-500 mb-3">
            MACROS (GRAMS)
          </p>

          <ThreeCol>
            <Input
              label="PROTEIN"
              name="protien"
              type="number"
              value={form.protien}
              onChange={handleChange}
              required
            />
            <Input
              label="CARBS"
              name="carbs"
              type="number"
              value={form.carbs}
              onChange={handleChange}
              required
            />
            <Input
              label="FATS"
              name="fat"
              type="number"
              value={form.fat}
              onChange={handleChange}
              required
            />
          </ThreeCol>
        </div>

        <Input
          label="TAGS (comma separated)"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          required
        />

        <TwoCol>
          <Toggle
            label="VEGETARIAN"
            checked={form.isVeg}
            onChange={() =>
              setForm({
                ...form,
                isVeg: !form.isVeg,
              })
            }
          />
          <Toggle
            label="AVAILABLE"
            checked={form.available}
            onChange={() =>
              setForm({
                ...form,
                available: !form.available,
              })
            }
          />
        </TwoCol>

        <Actions
          loading={loading}
          onClose={onClose}
          submitText="ADD ITEM"
        />
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center">
      <div className="w-full max-w-3xl bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-black tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const TwoCol = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">
    {children}
  </div>
);

const ThreeCol = ({ children }) => (
  <div className="grid md:grid-cols-3 gap-4">
    {children}
  </div>
);

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm text-white
                   focus:border-red-600 outline-none"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm text-white
                   focus:border-red-600 outline-none"
      />
    </div>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="mt-2 text-sm text-gray-300"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`border px-4 py-3 text-xs font-bold tracking-widest
        ${
          checked
            ? "border-emerald-500 text-emerald-400"
            : "border-white/20 text-gray-400"
        }`}
    >
      {label}: {checked ? "YES" : "NO"}
    </button>
  );
}

const Actions = ({ loading, onClose, submitText }) => (
  <div className="flex justify-end gap-4 pt-6">
    <button
      type="button"
      onClick={onClose}
      className="border border-white/20 px-6 py-3 text-xs font-extrabold"
    >
      CANCEL
    </button>
    <button
      disabled={loading}
      className="bg-red-600 px-8 py-3 text-xs font-extrabold"
    >
      {loading ? "ADDING..." : submitText}
    </button>
  </div>
);