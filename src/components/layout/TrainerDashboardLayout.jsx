import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { trainerLogout } from "../../api/trainer.api.js";

export default function TrainerDashboardLayout({ trainer }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await trainerLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const NavItem = ({ to, label }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `block px-4 py-3 rounded text-sm font-bold tracking-wide
         ${isActive ? "bg-red-600" : "hover:bg-red-600/20"}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      <header className="md:hidden h-14 px-4 flex items-center justify-between
                         border-b border-red-600/30 bg-black">
        <h1 className="font-black tracking-widest uppercase">
          Trainer
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="border border-red-600 p-2 rounded"
        >
          <Menu size={18} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72
                            bg-black border-r border-red-600/30
                            flex flex-col animate-slide-in">
            <div className="px-6 py-5 border-b border-red-600/30
                            flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 tracking-widest">
                  TRAINER
                </p>
                <p className="font-black">
                  {trainer?.fullName}
                </p>
              </div>

              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <NavItem to="/trainer/dashboard" label="DASHBOARD" />
              <NavItem to="/trainer/trainer-members" label="MEMBERS" />
              <NavItem to="/trainer/foods" label="FOODS" />
              <NavItem to="/trainer/diets" label="DIET PLANS" />
            </nav>

            <div className="px-4 py-4 border-t border-red-600/30">
              <button
                onClick={logout}
                className="w-full border border-red-600 py-2
                           text-xs font-extrabold tracking-widest
                           hover:bg-red-600"
              >
                LOGOUT
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="hidden md:flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="w-64 bg-black border-r border-red-600/30 flex flex-col">
          <div className="px-6 py-5 border-b border-red-600/30">
            <div className="flex items-center gap-4">
              <img
                src={trainer?.avatar?.url}
                className="w-12 h-12 rounded-full
                           border-2 border-red-600 object-cover"
              />
              <div>
                <p className="text-[10px] text-gray-400 tracking-widest">
                  TRAINER
                </p>
                <p className="font-black">
                  {trainer?.fullName}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem to="/trainer/dashboard" label="DASHBOARD" />
            <NavItem to="/trainer/trainer-members" label="MEMBERS" />
            <NavItem to="/trainer/foods" label="FOODS" />
            <NavItem to="/trainer/diets" label="DIET PLANS" />
          </nav>

          <div className="px-4 py-4 border-t border-red-600/30">
            <button
              onClick={logout}
              className="w-full border border-red-600 py-2
                         text-xs font-extrabold tracking-widest
                         hover:bg-red-600"
            >
              LOGOUT
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="h-16 px-6 flex items-center
                             border-b border-red-600/30 bg-neutral-900">
            <h1 className="text-lg font-black tracking-widest uppercase">
              Trainer Panel
            </h1>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <main className="md:hidden p-4">
        <Outlet />
      </main>
    </div>
  );
}
