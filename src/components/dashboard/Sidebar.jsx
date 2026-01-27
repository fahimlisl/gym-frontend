import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Package,
} from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Trainers", to: "/admin/trainers", icon: UserCog },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Supplements", to: "/admin/supplements", icon: Package },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-6 text-xl font-extrabold tracking-widest">
        ALPHA <span className="text-red-600"> GYM</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide transition
               ${
                 isActive
                   ? "bg-red-600 text-white"
                   : "text-gray-400 hover:text-white hover:bg-white/5"
               }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
