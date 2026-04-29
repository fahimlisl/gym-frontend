import { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard.jsx";
import toast from "react-hot-toast";
import { TrendingUp } from "lucide-react";
import {
  fetchDashboardRevenue,
  fetchRevenueBySource,
  fetchRecentTransactions,
  fetchAllTransactions,
} from "../../api/admin.api.js";
import RevenueTimeline from "./RevenueTimeline.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lifetimeNetRevenue, setLifetimeNetRevenue] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [rev, src, tx, allTx] = await Promise.all([
          fetchDashboardRevenue(),
          fetchRevenueBySource(),
          fetchRecentTransactions(),
          fetchAllTransactions(), 
        ]);
        
        const netRevenue = calculateLifetimeNetRevenue(allTx.data.data);
        setLifetimeNetRevenue(netRevenue);
        
        setStats(rev.data.data);
        setSources(src.data.data);
        setRecent(tx.data.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calculate Lifetime Net Revenue: Total Credits - Total Debits
  const calculateLifetimeNetRevenue = (transactions) => {
    if (!transactions || transactions.length === 0) return 0;
    
    let totalCredits = 0; // Money coming IN
    let totalDebits = 0;  // Money going OUT (refunds, expenses, etc.)
    
    transactions.forEach(t => {
      const amount = t.amount || 0;
      const type = t.type; // 'credit' or 'debit' from getTransactionType()
      const status = t.status;
      const source = t.source;
      
      // Skip failed transactions
      if (status === "failed") return;
      
      // For refunded transactions, treat as debit
      if (status === "refunded") {
        totalDebits += Math.abs(amount);
        return;
      }
      
      // Based on transaction type from getTransactionType()
      if (type === "credit") {
        // Credits: subscription, supplement, personal-training, paymentin, cafe
        totalCredits += amount;
      } else if (type === "debit") {
        // Debits: expense, refunds
        totalDebits += Math.abs(amount);
      }
      
      // Additional check based on source
      if (source === "expense") {
        totalDebits += Math.abs(amount);
      }
    });
    
    const netRevenue = totalCredits - totalDebits;
    
    return netRevenue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">
            LOADING DASHBOARD...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            DASHBOARD
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Performance overview & revenue analytics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <StatCard
            title="Lifetime Revenue (Net)"
            value={`₹${Math.round(lifetimeNetRevenue).toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            title="Today Revenue"
            value={`₹${Math.round(stats?.today?.totalAmount || 0).toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            title="Weekly Revenue"
            value={`₹${Math.round(stats?.weekly?.totalAmount || 0).toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${Math.round(stats?.monthly?.totalAmount || 0).toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            title="Yearly Revenue"
            value={`₹${Math.round(stats?.yearly?.totalAmount || 0).toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="REVENUE OVERVIEW" className="lg:col-span-2">
            <RevenueTimeline data={stats || {}} />
          </Card>

          <Card title="PAYMENT SOURCES">
            <div className="space-y-5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {sources.map((s) => (
                <Progress
                  key={s._id}
                  label={formatSource(s._id)}
                  value={s.totalAmount}
                  max={stats?.monthly?.totalAmount || 1}
                />
              ))}
            </div>
          </Card>
        </div>

        <Card title="RECENT TRANSACTIONS">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="text-gray-400 border-b border-red-600/20">
                <tr>
                  <th className="py-4 text-left">S.No</th>
                  <th className="text-left">USER</th>
                  <th className="text-left hidden sm:table-cell">SOURCE</th>
                  <th className="text-left">TYPE</th>
                  <th className="text-left">AMOUNT</th>
                  <th className="text-left hidden md:table-cell">METHOD</th>
                  <th className="text-left">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((t, idx) => {
                  const amount = t.amount || 0;
                  const type = t.type; // 'credit' or 'debit' from API
                  const status = t.status;
                  const isRefund = status === "refunded";
                  const isDebit = type === "debit" || isRefund || t.source === "expense";
                  const displayAmount = isDebit ? -Math.abs(amount) : amount;
                  
                  return (
                    <tr key={t._id} className="hover:bg-red-600/5 transition">
                      <td className="py-4 text-gray-400">{idx + 1}</td>
                      <td className="font-medium text-white truncate max-w-xs">
                        {t.user?.username || "System"}
                      </td>
                      <td className="hidden sm:table-cell text-xs">
                        <span className={`px-2 py-1 rounded ${
                          isDebit 
                            ? "bg-orange-600/10 text-orange-400" 
                            : "bg-green-600/10 text-green-400"
                        }`}>
                          {formatSource(t.source)}
                        </span>
                      </td>
                      <td className="text-xs">
                        <span className={`px-2 py-1 rounded ${
                          isDebit 
                            ? "bg-red-600/10 text-red-400" 
                            : "bg-green-600/10 text-green-400"
                        }`}>
                          {isDebit ? "DEBIT" : "CREDIT"}
                        </span>
                      </td>
                      <td className={`font-bold ${isDebit ? "text-orange-400" : "text-green-400"}`}>
                        {isDebit ? "-" : "+"}₹{Math.abs(Math.round(displayAmount)).toLocaleString("en-IN")}
                      </td>
                      <td className="hidden md:table-cell text-gray-400 uppercase text-xs">
                        {t.paymentMethod || "—"}
                      </td>
                      <td className="text-gray-400">
                        {new Date(t.paidAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.6);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`border border-red-600/20 bg-black p-6 rounded-2xl
                  shadow-[0_0_30px_rgba(220,38,38,0.08)]
                  hover:border-red-600/40 transition
                  ${className}`}
    >
      <h3 className="font-black tracking-widest mb-6 text-white text-lg">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Progress({ label, value, max }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">
          ₹{Math.round(value).toLocaleString("en-IN")}
        </span>
      </div>
      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-500"
        />
      </div>
    </div>
  );
}

const formatSource = (s) => {
  if (s === "personal-training") return "PERSONAL TRAINING";
  if (s === "subscription") return "SUBSCRIPTION";
  if (s === "supplement") return "SUPPLEMENTS";
  if (s === "cafe") return "CAFE";
  if (s === "expense") return "EXPENSE";
  if (s === "paymentin") return "PAYMENT IN";
  return s.toUpperCase();
};