import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Members" value="1,248" />
        <StatCard title="Active Trainers" value="18" />
        <StatCard title="Monthly Revenue" value="₹4.2L" />
        <StatCard title="Supplements Sold" value="312" />
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        
        {/* REVENUE GRAPH */}
        <div className="border border-red-600/30 bg-black p-6">
          <h3 className="font-extrabold tracking-widest mb-6">
            REVENUE TREND
          </h3>

          <div className="flex items-end gap-3 h-40">
            {[40, 70, 55, 90, 65, 110, 85].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className="w-full bg-gradient-to-t from-red-600 to-red-400
                           hover:from-red-500 transition-all"
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 tracking-widest">
            LAST 7 DAYS (DUMMY)
          </p>
        </div>

        {/* MEMBERS GROWTH */}
        <div className="border border-white/10 bg-black p-6">
          <h3 className="font-extrabold tracking-widest mb-6">
            MEMBER GROWTH
          </h3>

          <div className="flex items-end gap-2 h-40">
            {[30, 50, 45, 70, 60, 80, 100].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className="w-full bg-white/10 hover:bg-white/20 transition"
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 tracking-widest">
            NEW JOINS (DUMMY)
          </p>
        </div>
      </div>

      {/* PAYMENTS SPLIT */}
      <div className="border border-white/10 bg-black p-6">
        <h3 className="font-extrabold tracking-widest mb-6">
          PAYMENT SOURCES
        </h3>

        <div className="space-y-4">
          <Progress label="Subscriptions" value={70} />
          <Progress label="Personal Training" value={20} />
          <Progress label="Supplements" value={10} />
        </div>

        <p className="text-xs text-gray-400 mt-6 tracking-widest">
          DATA IS FOR VISUAL PURPOSE ONLY
        </p>
      </div>

    </AdminDashboardLayout>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Progress({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-white/10">
        <div
          style={{ width: `${value}%` }}
          className="h-full bg-red-600"
        />
      </div>
    </div>
  );
}
