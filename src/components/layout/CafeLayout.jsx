import { NavLink, useNavigate } from "react-router-dom";
import {
  Coffee,
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut
} from "lucide-react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

const menu = [
  {
    label: "Dashboard",
    to: "/cafe/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    to: "/cafe/orders",
    icon: ClipboardList,
  },
  {
    label: "Items",
    to: "/cafe/items",
    icon: Package,
  },
];

export default function CafeLayout({ children }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post("/cafe/logout");
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">

      <aside className="w-64 border-r border-white/10 bg-black hidden md:flex flex-col">

        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <Coffee className="text-red-600" size={22} />
          <span className="font-black tracking-widest text-lg">
            ALPHA <span className="text-red-600">CAFE</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide transition
                ${
                  isActive
                    ? "bg-red-600 text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* <button
          onClick={logout}
          className="m-4 flex items-center gap-3 px-4 py-3
                     border border-red-600/40 text-red-500
                     hover:bg-red-600 hover:text-black
                     text-sm font-extrabold tracking-widest transition"
        >
          <LogOut size={18} />
          LOGOUT
        </button> */}
      </aside>

      <div className="flex-1 flex flex-col">

        <header className="h-16 border-b border-white/10
                           flex items-center justify-end
                           px-8 bg-black">

          <span className="text-[10px] font-bold tracking-widest
                           px-3 py-1 border border-emerald-500/40
                           text-emerald-400">
            CAFE ADMIN
          </span>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
