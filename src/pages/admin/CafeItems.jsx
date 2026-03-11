import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

import AddCafeItemModal from "../../components/admin/cafe/AddCafeItemModal";
import EditCafeItemModal from "../../components/admin/cafe/EditCafeItemModal";

import {
  fetchAllCafeItem,
  toggleCafeItemAvailability,
} from "../../api/admin.api.js";

function CafeItemCard({ item, onEdit }) {
  const [available, setAvailable] = useState(item.available);
  const [loading, setLoading] = useState(false);

  const isLowStock = item.quantity < 5;

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
      className="group relative flex flex-col rounded-xl overflow-hidden
      bg-gradient-to-br from-black via-neutral-900 to-black
      border border-white/10 hover:border-red-600/40 transition"
    >
      <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden">
        <img
          src={item.image?.url}
          alt={item.name}
          className="w-full h-full object-cover
          group-hover:scale-105 transition duration-300"
        />

        <span
          className="absolute top-2 right-2 bg-black/70 px-2 py-1
          text-[9px] tracking-widest uppercase rounded-full"
        >
          {item.category}
        </span>
        {isLowStock && (
          <span
            className="absolute bottom-2 left-2
            bg-red-600 text-white px-2 py-1
            text-[9px] font-bold rounded"
          >
            LOW STOCK
          </span>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-4 space-y-2">
        <h3 className="text-sm sm:text-base font-black">{item.name}</h3>

        <p className="text-[11px] text-gray-400 line-clamp-2">
          {item.description}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Macro label="PROTEIN" value={`${item.macros?.protein || 0}g`} />
          <Macro label="CARBS" value={`${item.macros?.carbs || 0}g`} />
          <Macro label="FATS" value={`${item.macros?.fats || 0}g`} />
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-gray-500">SELL</p>
            <p className="text-lg sm:text-xl font-black text-red-500">
              ₹{item.price}
            </p>
          </div>

          <div className="text-right text-[11px] text-gray-300 space-y-0.5">
            <p>{item.calories} kcal</p>

            <p className={`${isLowStock ? "text-red-500 font-bold" : ""}`}>
              Stock: {item.quantity}
            </p>

            <p>Barcode: {item.barcode}</p>

            <p>Buy: ₹{item.purchasePrice}</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-4 py-2
        text-[10px] font-extrabold tracking-widest
        ${available ? "bg-emerald-500 text-black" : "bg-red-600 text-white"}`}
      >
        <div className="flex items-center gap-1">
          {available ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {available ? "AVAILABLE" : "OUT"}
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggle}
            disabled={loading}
            className="border px-2 py-1 text-[9px]"
          >
            {loading ? "..." : "TOGGLE"}
          </button>

          <button
            onClick={() => onEdit(item)}
            className="border border-yellow-400 text-yellow-400 px-2 py-1 text-[9px] flex items-center gap-1"
          >
            <Pencil size={12} />
            EDIT
          </button>
        </div>
      </div>
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-md p-2 text-center">
      <p className="text-[9px] tracking-widest text-gray-500">{label}</p>
      <p className="font-bold text-xs text-gray-300">{value}</p>
    </div>
  );
}

export default function CafeItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

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
        i.tags?.join(" ").toLowerCase().includes(q)
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
      <div className="space-y-6">
        <div
          className="flex flex-col lg:flex-row gap-4 justify-between
          border border-red-600/30 bg-gradient-to-br
          from-black via-neutral-900 to-black
          p-5 rounded-xl"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">
              CAFE ITEMS
            </h1>

            <p className="text-xs sm:text-sm text-gray-400">
              Manage gym cafe products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10
                pl-9 pr-3 py-2 text-sm text-white rounded-lg"
              />
            </div>

            <button
              onClick={exportExcel}
              className="flex items-center justify-center gap-2 bg-emerald-600
              px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto"
            >
              <FileSpreadsheet size={16} />
              EXPORT
            </button>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center justify-center gap-2 bg-red-600
              px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto"
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
          <div className="border border-white/10 p-10 text-center text-gray-500">
            NO CAFE ITEMS FOUND
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <CafeItemCard
                key={item._id}
                item={item}
                onEdit={(item) => {
                  setEditItem(item);
                  setOpenEdit(true);
                }}
              />
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
      {openEdit && (
        <EditCafeItemModal
          item={editItem}
          onClose={() => setOpenEdit(false)}
          onSuccess={loadItems}
        />
      )}
    </>
  );
}
