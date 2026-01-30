import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import PaymentStats from "../../components/admin/PaymentStats";
import TransactionsTable from "../../components/admin/TransactionsTable";

import {
  fetchAllTransactions,
  calculateTotalInLet,
} from "../../api/admin.api";

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, totalRes] = await Promise.all([
          fetchAllTransactions(),
          calculateTotalInLet(),
        ]);

        setTransactions(txRes.data.data || []);
        setTotal(totalRes.data.data || 0);
      } catch {
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">

        <div className="border border-red-600/30 bg-black p-6">
          <h1 className="text-3xl font-black tracking-widest">
            PAYMENTS
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Complete transaction history & revenue tracking
          </p>
        </div>

        <PaymentStats
          total={total}
          transactions={transactions}
        />

        {loading ? (
          <p className="text-gray-500 tracking-widest">
            LOADING TRANSACTIONS...
          </p>
        ) : (
          <TransactionsTable transactions={transactions} />
        )}
      </div>
    </AdminDashboardLayout>
  );
}
