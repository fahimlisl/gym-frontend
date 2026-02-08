import { useState } from "react";
import toast from "react-hot-toast";
import { addCafeItem } from "../../../api/admin.api";

export default function AddCafeItemModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "protien shake",
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
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!image) return toast.error("Image is required");

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("purchasePrice", Number(form.purchasePrice));
      fd.append("price", Number(form.price));
      fd.append("quantity", Number(form.quantity));
      fd.append("calories", Number(form.calories));
      fd.append("protien", Number(form.protien));
      fd.append("carbs", Number(form.carbs));
      fd.append("fat", Number(form.fat));
      fd.append("isVeg", form.isVeg);
      fd.append("available", form.available);

      // convert comma separated tags → array
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
        err?.response?.data?.message || "Failed to add item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="ADD CAFE ITEM" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">

        <TwoCol>
          <Input label="ITEM NAME" name="name" onChange={handleChange} required />
          <Select
            label="CATEGORY"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={["protien shake", "coffee", "energy drink"]}
          />
        </TwoCol>

        <Textarea
          label="DESCRIPTION"
          name="description"
          onChange={handleChange}
        />

        <FileInput
          label="ITEM IMAGE"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <TwoCol>
          <Input
            label="PURCHASE PRICE (₹)"
            name="purchasePrice"
            type="number"
            onChange={handleChange}
            required
          />
          <Input
            label="SELL PRICE (₹)"
            name="price"
            type="number"
            onChange={handleChange}
            required
          />
        </TwoCol>

        <TwoCol>
          <Input
            label="QUANTITY (STOCK)"
            name="quantity"
            type="number"
            onChange={handleChange}
            required
          />
          <Input
            label="CALORIES"
            name="calories"
            type="number"
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
              onChange={handleChange}
              required
            />
            <Input
              label="CARBS"
              name="carbs"
              type="number"
              onChange={handleChange}
              required
            />
            <Input
              label="FATS"
              name="fat"
              type="number"
              onChange={handleChange}
              required
            />
          </ThreeCol>
        </div>

        <Input
          label="TAGS (comma separated)"
          name="tags"
          placeholder="high-protein, fat-loss"
          onChange={handleChange}
          required
        />

        <TwoCol>
          <Toggle
            label="VEGETARIAN"
            checked={form.isVeg}
            onChange={() => setForm({ ...form, isVeg: !form.isVeg })}
          />
          <Toggle
            label="AVAILABLE"
            checked={form.available}
            onChange={() => setForm({ ...form, available: !form.available })}
          />
        </TwoCol>

        <Actions loading={loading} onClose={onClose} submitText="ADD ITEM" />
      </form>
    </Modal>
  );
}

/* ================= UI COMPONENTS ================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center">
      <div className="w-full max-w-3xl bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-black tracking-widest">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const TwoCol = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const ThreeCol = ({ children }) => (
  <div className="grid md:grid-cols-3 gap-4">{children}</div>
);

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
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
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
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

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <select
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm text-white
                   focus:border-red-600 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
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
        ${checked
          ? "border-emerald-500 text-emerald-400"
          : "border-white/20 text-gray-400"}`}
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
