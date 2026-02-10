import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar.jsx";
import Topbar from "../dashboard/Topbar.jsx";

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
