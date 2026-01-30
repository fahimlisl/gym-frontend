import Sidebar from "../dashboard/Sidebar.jsx";
import Topbar from "../dashboard/Topbar.jsx";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
