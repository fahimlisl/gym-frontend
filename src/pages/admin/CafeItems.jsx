import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout.jsx";
import AddCafeItemModal from "../../components/admin/cafe/AddCafeItemModal";
import { fetchAllCafeItem } from "../../api/admin.api.js";

export default function CafeItems() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCafeItem();
      setItems(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch {
      toast.error("Failed to load cafe items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.tags?.join(" ").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">

        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center
                        border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black
                        p-6 rounded-xl">

          <div className="space-y-2">

            <h1 className="text-3xl font-black tracking-widest">
              CAFE ITEMS
            </h1>

            <p className="text-sm text-gray-400">
              Manage gym cafe products, nutrition & availability
            </p>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search item, category, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10
                           pl-10 pr-4 py-3 text-sm text-white
                           focus:border-red-600 outline-none rounded-lg"
              />
            </div>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700
                         px-6 py-3 text-xs font-extrabold tracking-widest
                         shadow-lg shadow-red-600/30 rounded-lg"
            >
              <Plus size={16} />
              ADD ITEM
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-gray-500 tracking-widest">
            LOADING ITEMS...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="border border-white/10 p-12 text-center text-gray-500">
            NO CAFE ITEMS FOUND
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <CafeItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {openAdd && (
        <AddCafeItemModal
          onClose={() => setOpenAdd(false)}
          onSuccess={loadItems}
        />
      )}
    </AdminDashboardLayout>
  );
}


import { CheckCircle, XCircle } from "lucide-react";
import { toggleCafeItemAvailability } from "../../api/admin.api";

function CafeItemCard({ item }) {
  const [available, setAvailable] = useState(item.available);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    try {
      setLoading(true);
      const res = await toggleCafeItemAvailability(item._id);
      setAvailable(res.data.data.available);
      toast.success("Availability updated");
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    border border-white/10 hover:border-red-600/40
                    transition-all duration-300">

      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image?.url}
          alt={item.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition duration-300"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2
                        bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full
                        ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`}
          />
          {item.isVeg ? "VEG" : "NON-VEG"}
        </div>

        <span className="absolute top-3 right-3
                         bg-black/70 px-3 py-1 text-[10px]
                         tracking-widest uppercase rounded-full text-gray-300">
          {item.category}
        </span>
      </div>

      <div className="flex-1 p-5 space-y-4">

        <h3 className="text-lg font-black tracking-wide leading-tight">
          {item.name}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-2">
          {item.description}
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <Macro label="PROTEIN" value={`${item.macros?.protein || 0}g`} />
          <Macro label="CARBS" value={`${item.macros?.carbs || 0}g`} />
          <Macro label="FATS" value={`${item.macros?.fats || 0}g`} />
        </div>

        <div className="flex justify-between items-end pt-3">
          <div>
            <p className="text-xs tracking-widest text-gray-600">
              SELL PRICE
            </p>
            <p className="text-2xl font-black text-red-500">
              ₹{item.price}
            </p>
          </div>

          <div className="text-right text-xs text-gray-200 space-y-1">
            <p>{item.calories} kcal</p>
            <p>Stock: {item.quantity ?? "—"}</p>
            {item.purchasePrice && (
              <p className="opacity-100 text-gray-50">
                Buy : ₹{item.purchasePrice}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-5 py-4
                    font-extrabold tracking-widest text-xs
                    transition
                    ${
                      available
                        ? "bg-emerald-500 text-black"
                        : "bg-red-600 text-white"
                    }`}
      >
        <div className="flex items-center gap-2">
          {available ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {available ? "AVAILABLE" : "OUT OF STOCK"}
        </div>

        <button
          onClick={toggle}
          disabled={loading}
          className={`px-4 py-2 border text-xs font-black tracking-widest
                      transition
                      ${
                        available
                          ? "border-black/40 hover:bg-black/10"
                          : "border-white/40 hover:bg-white/10"
                      }`}
        >
          {loading ? "UPDATING..." : "TOGGLE"}
        </button>
      </div>
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
      <p className="text-[10px] tracking-widest text-gray-500">
        {label}
      </p>
      <p className="font-bold text-gray-300">
        {value}
      </p>
    </div>
  );
}
