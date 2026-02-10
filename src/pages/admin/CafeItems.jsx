import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import AddCafeItemModal from "../../components/admin/cafe/AddCafeItemModal";
import {
  fetchAllCafeItem,
  toggleCafeItemAvailability,
} from "../../api/admin.api.js";

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
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden
                 bg-gradient-to-br from-black via-neutral-900 to-black
                 border border-white/10 hover:border-red-600/40 transition"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image?.url}
          alt={item.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition duration-300"
        />

        <span
          className="absolute top-3 right-3 bg-black/70 px-3 py-1
                     text-[10px] tracking-widest uppercase rounded-full"
        >
          {item.category}
        </span>
      </div>

      <div className="flex-1 p-5 space-y-4">
        <h3 className="text-lg font-black">{item.name}</h3>

        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <Macro label="PROTEIN" value={`${item.macros?.protein || 0}g`} />
          <Macro label="CARBS" value={`${item.macros?.carbs || 0}g`} />
          <Macro label="FATS" value={`${item.macros?.fats || 0}g`} />
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">SELL PRICE</p>
            <p className="text-2xl font-black text-red-500">₹{item.price}</p>
          </div>

          <div className="text-right text-xs text-gray-300">
            <p>{item.calories} kcal</p>
            <p>Stock: {item.quantity}</p>
            <p>Buy: ₹{item.purchasePrice}</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-5 py-4
        text-xs font-extrabold tracking-widest
        ${available ? "bg-emerald-500 text-black" : "bg-red-600 text-white"}`}
      >
        <div className="flex items-center gap-2">
          {available ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {available ? "AVAILABLE" : "OUT OF STOCK"}
        </div>

        <button
          onClick={toggle}
          disabled={loading}
          className="border px-4 py-2"
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
      <p className="text-[10px] tracking-widest text-gray-500">{label}</p>
      <p className="font-bold text-gray-300">{value}</p>
    </div>
  );
}

export default function CafeItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCafeItem();
      setItems(res.data.data || []);
    } catch {
      toast.error("Failed to load cafe items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.tags?.join(" ").toLowerCase().includes(q),
    );
  }, [search, items]);

  const exportExcel = () => {
    if (!filtered.length) return toast.error("No items to export");

    const data = filtered.map((i) => ({
      Name: i.name,
      Category: i.category,
      Description: i.description,
      SellPrice: i.price,
      PurchasePrice: i.purchasePrice,
      Quantity: i.quantity,
      Calories: i.calories,
      Protein: i.macros?.protein,
      Carbs: i.macros?.carbs,
      Fats: i.macros?.fats,
      IsVeg: i.isVeg ? "YES" : "NO",
      Available: i.available ? "YES" : "NO",
      Tags: i.tags?.join(", "),
      ImageURL: i.image?.url,
      CreatedAt: new Date(i.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cafe Items");
    XLSX.writeFile(wb, "Cafe_Items.xlsx");

    toast.success("Cafe items exported");
  };

  return (
    <>
      <div className="space-y-8">
        <div
          className="flex flex-col lg:flex-row gap-6 justify-between
                     border border-red-600/30 bg-gradient-to-br
                     from-black via-neutral-900 to-black
                     p-6 rounded-xl"
        >
          <div>
            <h1 className="text-3xl font-black tracking-widest">CAFE ITEMS</h1>
            <p className="text-sm text-gray-400">Manage gym cafe products</p>
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
                           pl-10 pr-4 py-3 text-sm text-white rounded-lg"
              />
            </div>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-emerald-600
                         px-6 py-3 text-xs font-extrabold rounded-lg"
            >
              <FileSpreadsheet size={16} />
              EXPORT
            </button>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-2 bg-red-600
                         px-6 py-3 text-xs font-extrabold rounded-lg"
            >
              <Plus size={16} />
              ADD ITEM
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-gray-500 tracking-widest">LOADING ITEMS...</p>
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
    </>
  );
}
