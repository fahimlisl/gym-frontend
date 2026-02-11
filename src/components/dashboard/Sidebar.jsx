import { NavLink, useLocation } from "react-router-dom";
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
  ChevronDown,
  CalendarCog,
} from "lucide-react";
import { useState, useEffect } from "react";


const mainMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Trainers", to: "/admin/trainers", icon: UserCog },
];

const attendanceMenu = {
  label: "Attendance",
  icon: CalendarCog,
  base: "/admin/attendence",
  items: [
    { label: "Dashboard", to: "/admin/attendence/dashboard" },
    { label: "Today", to: "/admin/attendence/today" },
    { label: "Monthly", to: "/admin/attendence/month" },
  ],
};

const paymentsMenu = {
  label: "Payments",
  icon: CreditCard,
  base: "/admin/payments",
  items: [
    { label: "All Payments", to: "/admin/payments/all" },
    { label: "Cafe Payments", to: "/admin/payments/cafe" },
  ],
};

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
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <div className="text-xl font-black tracking-widest">
          ALPHA<span className="text-red-600 ml-1">GYM</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-red-500"
        >
          <X />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <Section title="CORE">
          {mainMenu.map(renderLink)}
          <CollapsibleGroup config={attendanceMenu} />
          <CollapsibleGroup config={paymentsMenu} />
        </Section>

        <Section title="CAFE" icon={Coffee} accent="emerald">
          {cafeMenu.map(renderLink)}
        </Section>

        <Section title="INVENTORY">
          {otherMenu.map(renderLink)}
        </Section>
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

function CollapsibleGroup({ config }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(config.base);
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const Icon = config.icon;

  return (
    <div>
      <NavLink
        to={`${config.base}/${config.items[0].to.split("/").pop()}`}
        className={() =>
          `flex items-center justify-between px-4 py-3
          text-sm font-bold tracking-wide rounded-lg transition
          ${
            isActive
              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`
        }
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          {config.label}
        </div>
        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </NavLink>

      {open && (
        <div className="ml-6 mt-1 space-y-1">
          {config.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm rounded-md transition
                ${
                  isActive
                    ? "text-red-400 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
