import { NavLink } from "react-router-dom";

export default function CafeAdminDashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>

        <div className="flex items-center gap-4">
          <NavLink
            to="/cafe/dashboard"
            className="text-sm bg-green-600 hover:bg-white hover:text-black px-3 py-1 rounded"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/cafe/payments"
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Payments
          </NavLink>
          <span className="text-sm opacity-80">Cafe Admin</span>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
