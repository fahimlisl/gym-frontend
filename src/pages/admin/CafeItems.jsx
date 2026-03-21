import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

import AddCafeItemModal from "../../components/admin/cafe/AddCafeItemModal";
import EditCafeItemModal from "../../components/admin/cafe/EditCafeItemModal";

import {
  fetchAllCafeItem,
  toggleCafeItemAvailability,
  destroyCafeItem,
} from "../../api/admin.api.js";

function Macro({ label, value }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-md p-2 text-center">
      <p className="text-[9px] tracking-widest text-gray-500">{label}</p>
      <p className="font-bold text-xs text-gray-300">{value}</p>
    </div>
  );
}
function CafeItemCard({ item, onEdit, onDelete }) {
  const [available, setAvailable] = useState(item.available);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLowStock = item.quantity < 5;

  const handleToggle = async () => {
    try {
      setToggling(true);
      const res = await toggleCafeItemAvailability(item._id);
      setAvailable(res.data.data.available);
      toast.success("Availability updated");
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      setDeleting(true);
      await destroyCafeItem(item._id);
      toast.success(`"${item.name}" deleted`);
      onDelete(item._id);
    } catch {
      toast.error("Failed to delete item");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden
        bg-gradient-to-br from-black via-neutral-900 to-black
        border border-white/10 hover:border-red-600/40 transition-all duration-200"
    >
      <div className="relative h-36 overflow-hidden bg-neutral-800">
        {item.image?.url ? (
          <img
            src={item.image.url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs tracking-widest">
            NO IMAGE
          </div>
        )}

        <span className="absolute top-2 right-2 bg-black/70 px-2 py-1 text-[9px] tracking-widest uppercase rounded-full text-gray-300">
          {item.category}
        </span>
        {isLowStock && (
          <span className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 text-[9px] font-bold rounded">
            LOW STOCK
          </span>
        )}
        <span
          className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-white
            ${item.isVeg ? "bg-green-500" : "bg-red-500"}`}
        />
      </div>
      <div className="flex-1 p-3 sm:p-4 space-y-2">
        <h3 className="text-sm sm:text-base font-black leading-tight">{item.name}</h3>

        {item.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2">{item.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Macro label="PROTEIN" value={`${item.macros?.protein ?? 0}g`} />
          <Macro label="CARBS"   value={`${item.macros?.carbs   ?? 0}g`} />
          <Macro label="FATS"    value={`${item.macros?.fats    ?? 0}g`} />
        </div>

        <div className="flex justify-between items-end pt-1">
          <div>
            <p className="text-[10px] text-gray-500 tracking-widest">SELL PRICE</p>
            <p className="text-xl font-black text-red-500">₹{item.price}</p>
          </div>

          <div className="text-right text-[11px] text-gray-400 space-y-0.5">
            <p>{item.calories} kcal</p>
            <p className={isLowStock ? "text-red-500 font-bold" : ""}>
              Stock: {item.quantity}
            </p>
            {item.barcode && <p>#{item.barcode}</p>}
            <p className="text-gray-500">Cost: ₹{item.purchasePrice}</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-3 py-2.5
          text-[10px] font-extrabold tracking-widest
          ${available ? "bg-emerald-500 text-black" : "bg-red-700 text-white"}`}
      >
        {/* <div className="flex items-center gap-1">
          {available ? <CheckCircle size={13} /> : <XCircle size={13} />}
          {available ? "AVAILABLE" : "OUT OF STOCK"}
        </div> */}

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`min-w-[52px] h-7 px-3 text-[9px] rounded border cursor-pointer
              ${available ? "border-black/40 text-black" : "border-white/40 text-white"}`}
          >
            {toggling ? "···" : "TOGGLE"}
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="min-w-[44px] h-7 px-3 text-[9px] rounded border border-yellow-400 text-yellow-400 flex items-center gap-1 cursor-pointer"
          >
            <Pencil size={11} />
            EDIT
          </button>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="min-w-[36px] h-7 px-3 text-[9px] rounded border border-white/40 text-white/70 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={11} />
            DEL
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/90 rounded-xl">
          <Trash2 size={28} className="text-red-500" />
          <p className="text-white font-black text-sm tracking-wide text-center px-4">
            Delete "{item.name}"?
          </p>
          <p className="text-gray-400 text-[11px] text-center px-6">
            Permanently removes item and image from Cloudinary.
          </p>
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-xs font-bold cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirmed}
              disabled={deleting}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-xs font-black cursor-pointer disabled:opacity-60"
            >
              {deleting ? "DELETING···" : "YES, DELETE"}
            </button>
          </div>
        </div>
      )}
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
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.tags?.join(" ").toLowerCase().includes(q)
    );
  }, [search, items]);

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

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
    toast.success("Exported successfully");
  };

  return (
    <>
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row gap-4 justify-between border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-5 rounded-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">CAFE ITEMS</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by name, category, tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 pl-9 pr-3 py-2 text-sm text-white rounded-lg outline-none focus:border-red-600/50"
              />
            </div>

            <button
              onClick={exportExcel}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto transition"
            >
              <FileSpreadsheet size={15} />
              EXPORT
            </button>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 text-[11px] font-extrabold rounded-lg w-full sm:w-auto transition"
            >
              <Plus size={15} />
              ADD ITEM
            </button>
          </div>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black animate-pulse"
              >
                <div className="h-36 bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-10 bg-white/5 rounded-md" />
                    ))}
                  </div>
                </div>
                <div className="h-9 bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="border border-white/10 rounded-xl p-16 text-center text-gray-500 tracking-widest text-sm">
            {search ? `NO RESULTS FOR "${search.toUpperCase()}"` : "NO CAFE ITEMS FOUND"}
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
                onDelete={handleDelete}
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
      {openEdit && editItem && (
        <EditCafeItemModal
          item={editItem}
          onClose={() => { setOpenEdit(false); setEditItem(null); }}
          onSuccess={loadItems}
        />
      )}
    </>
  );
}