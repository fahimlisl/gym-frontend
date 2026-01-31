import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import toast from "react-hot-toast";

import {
  fetchDashboardRevenue,
  fetchRevenueBySource,
  fetchRecentTransactions,
} from "../../api/admin.api.js"
import RevenueTimeline from "./RevenueTimeline.jsx"



export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  let i = 1;

  useEffect(() => {
    const load = async () => {
      try {
        const [rev, src, tx] = await Promise.all([
          fetchDashboardRevenue(),
          fetchRevenueBySource(),
          fetchRecentTransactions(),
        ]);

        setStats(rev.data.data);
        setSources(src.data.data);
        setRecent(tx.data.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center
                      text-gray-500 tracking-widest">
        LOADING DASHBOARD...
      </div>
    );
  }

  return (
    <AdminDashboardLayout>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Today Revenue" value={`₹${stats.today.totalAmount}`} />
        <StatCard title="Weekly Revenue" value={`₹${stats.weekly.totalAmount}`} />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthly.totalAmount}`} />
        <StatCard title="Yearly Revenue" value={`₹${stats.yearly.totalAmount}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        <Card title="REVENUE OVERVIEW">
  <RevenueTimeline data={stats} />
</Card>


        <Card title="PAYMENT SOURCES">
          <div className="space-y-4">
            {sources.map((s) => (
              <Progress
                key={s._id}
                label={formatSource(s._id)}
                value={s.totalAmount}
                max={stats.monthly.totalAmount || 1}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card title="RECENT TRANSACTIONS">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2 text-left">S.No</th>
                <th className="py-2 text-left">USER</th>
                <th className="text-left">SOURCE</th>
                <th className="text-left">AMOUNT</th>
                <th className="text-left">METHOD</th>
                <th className="text-left">DATE</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td>{i++}</td>
                  <td className="py-3">
                    {t.user?.username || "—"}
                  </td>
                  <td>{formatSource(t.source)}</td>
                  <td className="font-bold">₹{t.amount}</td>
                  <td className="uppercase text-xs">{t.paymentMethod}</td>
                  <td>{new Date(t.paidAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </AdminDashboardLayout>
  );
}


function Card({ title, children }) {
  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl">
      <h3 className="font-extrabold tracking-widest mb-6">
        {title}
      </h3>
      {children}
    </div>
  );
}


function Bars({ values, labels }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-4 h-48">
      {values.map((v, i) => (
        <div key={i} className="flex-1 text-center">
          <div
            style={{ height: `${(v / max) * 160}px` }}
            className="bg-gradient-to-t from-red-700 to-red-500
                       rounded-t transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">
            {labels[i]}
          </p>
        </div>
      ))}
    </div>
  );
}


function Progress({ label, value, max }) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold">₹{value}</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded">
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-red-600 rounded transition-all"
        />
      </div>
    </div>
  );
}


const formatSource = (s) => {
  if (s === "personal-training") return "PERSONAL TRAINING";
  if (s === "subscription") return "SUBSCRIPTION";
  if (s === "supplement") return "SUPPLEMENTS";
  return s.toUpperCase();
};
