import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Package,
  Coffee,
  List,
  TicketPercent,
  BanknoteArrowDown,
  X,
  Dumbbell,
} from "lucide-react";

const mainMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Trainers", to: "/admin/trainers", icon: UserCog },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
];

const cafeMenu = [
  { label: "All Items", to: "/admin/cafe/items", icon: List },
  { label: "Cafe Admins", to: "/admin/cafe/admins", icon: UserCog },
];

const otherMenu = [
  { label: "Supplements", to: "/admin/supplements", icon: Package },
  { label: "Coupons", to: "/admin/coupons", icon: TicketPercent },
  { label: "Expenses", to: "/admin/expenses", icon: BanknoteArrowDown },
  { label: "Assets", to: "/admin/assets", icon: Dumbbell },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40
                  w-72 flex flex-col
                  border-r border-white/10 bg-black
                  transform transition-transform duration-300
                  ${open ? "translate-x-0" : "-translate-x-full"}
                  md:translate-x-0`}
    >
      <div
        className="h-16 flex items-center justify-between px-6
                      text-xl font-black tracking-widest
                      border-b border-white/10"
      >
        <div>
          ALPHA
          <span className="text-red-600 ml-1">GYM</span>
        </div>

        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-red-500"
        >
          <X />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <Section title="CORE">{mainMenu.map(renderLink)}</Section>

        <Section title="CAFE" icon={Coffee} accent="emerald">
          {cafeMenu.map(renderLink)}
        </Section>

        <Section title="INVENTORY">{otherMenu.map(renderLink)}</Section>
      </nav>
    </aside>
  );
}

function Section({ title, children, icon: Icon, accent = "red" }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-3 mb-2">
        {Icon && <Icon size={14} className={`text-${accent}-500`} />}
        <p className="text-xs text-gray-500 tracking-widest font-bold">
          {title}
        </p>
      </div>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

function renderLink(item) {
  const Icon = item.icon;

  return (
    <NavLink
      key={item.label}
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3
         text-sm font-bold tracking-wide rounded-lg transition
         ${
           isActive
             ? "bg-red-600 text-white shadow-md shadow-red-600/30"
             : "text-gray-400 hover:text-white hover:bg-white/5"
         }`
      }
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}
