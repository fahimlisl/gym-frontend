import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import SellSupplementModal from "../../components/admin/SellSupplementModal.jsx";
import SupplementBillsTable from "../../components/admin/SupplementBillsTable.jsx";

export default function SellSupplementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-widest text-white">
          SUPPLEMENT <span className="text-red-600">SALES</span>
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide px-5 py-2.5 rounded-lg transition"
        >
          <ShoppingCart size={16} /> Sell Supplement
        </button>
      </div>

      <SupplementBillsTable refreshKey={refreshKey} />

      <SellSupplementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaleComplete={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}