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
            <button
              onClick={() => window.location.href = "/admin/cafe/items"}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} /> BACK TO CAFE
            </button>

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
    <div className="flex flex-col overflow-hidden rounded-2xl
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    border border-white/10 hover:border-red-600/40
                    transition">

      <div className="h-48 overflow-hidden">
        <img
          src={item.image?.url}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition"
        />
      </div>

      <div className="p-5 space-y-3 flex-1">

        <div className="space-y-1">

  <div className="flex items-center gap-2">
    <span
      className={`w-3 h-3 rounded-full
                  ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`}
    />
    <h3 className="text-lg font-black tracking-wide">
      {item.name}
    </h3>
  </div>

  <p className="text-xs text-gray-400 tracking-widest uppercase">
    {item.category}
  </p>
</div>


        <p className="text-sm text-gray-300 line-clamp-2">
          {item.description}
        </p>

        <div className="grid grid-cols-3 text-xs text-gray-400 pt-2">
          <span>P {item.macros?.protein || 0}g</span>
          <span>C {item.macros?.carbs || 0}g</span>
          <span>F {item.macros?.fats || 0}g</span>
        </div>

        <div className="flex justify-between items-center pt-3">
          <p className="text-xl font-black text-red-500">
            ₹{item.price}
          </p>
          <span className="text-xs text-gray-400">
            {item.calories} kcal
          </span>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-5 py-4
                    font-extrabold tracking-widest text-xs
                    ${
                      available
                        ? "bg-emerald-500/90 text-black"
                        : "bg-red-600 text-white"
                    }`}
      >
        <div className="flex items-center gap-2">
          {available ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {available ? "AVAILABLE" : "OUT OF STOCK"}
        </div>

        <button
          onClick={toggle}
          disabled={loading}
          className={`px-4 py-2 text-xs font-black tracking-widest
                      border transition
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

