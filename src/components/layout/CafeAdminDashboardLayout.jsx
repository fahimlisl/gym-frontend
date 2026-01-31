export default function CafeAdminDashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <span className="text-sm opacity-80">Cafe Admin</span>
      </header>


      <main className="p-6">{children}</main>
    </div>
  );
}
