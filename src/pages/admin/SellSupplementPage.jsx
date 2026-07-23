import { useState } from "react";
import { ShoppingCart, Filter, Gift } from "lucide-react";
import SellSupplementModal from "../../components/admin/SellSupplementModal.jsx";
import SupplementBillsTable from "../../components/admin/SupplementBillsTable.jsx";

export default function SellSupplementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterType, setFilterType] = useState("all"); 

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

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-xs font-bold tracking-widest text-gray-400">FILTER:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
              filterType === "all"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-transparent text-gray-400 border border-transparent hover:border-white/10 hover:text-white/80"
            }`}
          >
            ALL BILLS
          </button>
          <button
            onClick={() => setFilterType("sponsor")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              filterType === "sponsor"
                ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                : "bg-transparent text-gray-400 border border-transparent hover:border-purple-600/20 hover:text-purple-400/80"
            }`}
          >
            <Gift size={12} />
            SPONSOR
          </button>
          <button
            onClick={() => setFilterType("regular")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
              filterType === "regular"
                ? "bg-red-600/20 text-red-400 border border-red-600/30"
                : "bg-transparent text-gray-400 border border-transparent hover:border-red-600/20 hover:text-red-400/80"
            }`}
          >
            REGULAR
          </button>
        </div>
        {filterType !== "all" && (
          <button
            onClick={() => setFilterType("all")}
            className="text-xs text-gray-500 hover:text-white transition-colors ml-auto"
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-full inline-block align-middle">
          <SupplementBillsTable 
            refreshKey={refreshKey} 
            filterType={filterType}
          />
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