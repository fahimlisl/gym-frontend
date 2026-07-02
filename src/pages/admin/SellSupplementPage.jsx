import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import SellSupplementModal from "../../components/admin/SellSupplementModal.jsx";
import SupplementBillsTable from "../../components/admin/SupplementBillsTable.jsx";

export default function SellSupplementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white">
          SUPPLEMENT <span className="text-red-600">SALES</span>
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide px-4 py-2.5 rounded-lg transition w-full sm:w-auto"
        >
          <ShoppingCart size={16} /> Sell Supplement
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-full inline-block align-middle">
          <SupplementBillsTable refreshKey={refreshKey} />
        </div>
      </div>

      {modalOpen && (
        <SellSupplementModal
          onClose={() => setModalOpen(false)}
          onSaleComplete={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}