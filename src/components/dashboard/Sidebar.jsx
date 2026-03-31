import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  KeyRound,
  Layers,
  BadgePercent,
  GitPullRequestCreateArrow,
  ChartBar,
  GitPullRequestDraft,
  Hamburger,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminLogout, changePasswordRequest } from "../../api/auth.api.js";
import { useForm } from "react-hook-form";

const mainMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Trainers", to: "/admin/trainers", icon: UserCog },
  { label: "PT Requests", to: "/admin/pt/requests", icon: GitPullRequestCreateArrow },
  { label: "Workout Template", to: "/admin/workout-templates", icon: ChartBar },
  { label: "Supplement Requests", to: "/admin/supplement/request", icon: GitPullRequestDraft },
  
];

const attendanceMenu = {
  label: "Attendance",
  icon: CalendarCog,
  base: "/admin/attendance",
  items: [
    {
      label: "Member",
      base: "/admin/attendance/member",
      items: [
        { label: "Dashboard", to: "/admin/attendance/member/dashboard" },
        { label: "Today", to: "/admin/attendance/member/today" },
        { label: "Monthly", to: "/admin/attendance/member/month" },
      ],
    },
    {
      label: "Trainer",
      base: "/admin/attendance/trainer",
      items: [
        { label: "Monthly & Today", to: "/admin/attendance/trainer/dashboard" },
        // { label: "Today", to: "/admin/attendance/trainer/today" },
        // { label: "Monthly", to: "/admin/attendance/trainer/month" },
      ],
    },
  ],
};

const paymentsMenu = {
  label: "Payments",
  icon: CreditCard,
  base: "/admin/payments",
  items: [
    { label: "All Payments", to: "/admin/payments/all" },
    { label: "Payments In", to: "/admin/payments/payments-in" },
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

const settings = [
  { label: "Plans", to: "/admin/plans", icon: Layers },
  { label: "Offers", to: "/admin/offers", icon: BadgePercent },
  { label: "Foods", to: "/admin/foods", icon: Hamburger },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangeModal, setShowChangeModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    if (open) {
      onClose?.();
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleChangePassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePasswordRequest(data);
      toast.success("Password changed successfully");
      reset();
      setShowChangeModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <>
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 flex flex-col
          border-r border-white/10 bg-black
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:opacity-100"}
          md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="text-xl font-black tracking-widest">
            <span className="inline-flex items-center gap-1">
            <img
              src="https://res.cloudinary.com/dkrwq4wvi/image/upload/v1772311625/gym/gam3nt7czytzycq9uruu.png"
              alt="logo"
              className="h-6 w-auto"
            />
            <span>
              <span className="text-red-600">ALPHA</span> GYM
            </span>
          </span>
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
            {mainMenu.map((item) => (
              <SidebarLink key={item.to} item={item} onClose={onClose} />
            ))}
            <CollapsibleGroup config={attendanceMenu} onClose={onClose} />
            <CollapsibleGroup config={paymentsMenu} onClose={onClose} />
          </Section>

          <Section title="CAFE" icon={Coffee} accent="emerald">
            {cafeMenu.map((item) => (
              <SidebarLink key={item.to} item={item} onClose={onClose} />
            ))}
          </Section>

          <Section title="INVENTORY">
            {otherMenu.map((item) => (
              <SidebarLink key={item.to} item={item} onClose={onClose} />
            ))}
          </Section>
          <Section title="SETTINGS">
            {settings.map((item) => (
              <SidebarLink key={item.to} item={item} onClose={onClose} />
            ))}
          </Section>
        </nav>

        <div className="border-t border-white/10 p-4 space-y-2">
          <button
            onClick={() => setShowChangeModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3
                       text-sm font-bold tracking-wide rounded-lg transition
                       text-gray-400 hover:text-white hover:bg-white/5"
          >
            <KeyRound size={18} />
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3
                       text-sm font-bold tracking-wide rounded-lg transition
                       text-red-500 hover:text-white hover:bg-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {showChangeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
               bg-black/80 backdrop-blur-sm
               px-4 sm:px-6
               animate-fadeIn"
          onClick={() => setShowChangeModal(false)}
        >
          <div
            className="relative w-full max-w-md
                 max-h-[90vh] overflow-y-auto
                 bg-neutral-950
                 border border-red-600/30
                 shadow-[0_0_60px_rgba(255,0,0,0.25)]
                 rounded-2xl
                 transform transition-all duration-300
                 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-t-2xl" />

            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black tracking-widest text-red-600">
                  CHANGE PASSWORD
                </h2>

                <button
                  onClick={() => setShowChangeModal(false)}
                  className="text-gray-500 hover:text-white transition text-lg"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleChangePassword)}
                className="space-y-4"
              >
                <input
                  type="password"
                  placeholder="OLD PASSWORD"
                  {...register("oldPassword", { required: true })}
                  className="w-full bg-black border border-white/10
                       px-4 py-3 sm:py-3.5
                       text-white text-sm sm:text-base
                       rounded-lg
                       focus:outline-none
                       focus:border-red-500
                       transition"
                />

                <input
                  type="password"
                  placeholder="NEW PASSWORD"
                  {...register("newPassword", { required: true })}
                  className="w-full bg-black border border-white/10
                       px-4 py-3 sm:py-3.5
                       text-white text-sm sm:text-base
                       rounded-lg
                       focus:outline-none
                       focus:border-red-500
                       transition"
                />

                <input
                  type="password"
                  placeholder="CONFIRM NEW PASSWORD"
                  {...register("confirmNewPassword", { required: true })}
                  className="w-full bg-black border border-white/10
                       px-4 py-3 sm:py-3.5
                       text-white text-sm sm:text-base
                       rounded-lg
                       focus:outline-none
                       focus:border-red-500
                       transition"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 sm:py-4
                       font-bold tracking-widest text-sm sm:text-base
                       bg-gradient-to-r from-red-700 via-red-600 to-red-700
                       text-black rounded-lg
                       hover:brightness-110
                       transition-all duration-200"
                >
                  {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs text-gray-500 tracking-widest font-bold px-3 mb-2">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarLink({ item, onClose }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClose}
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

function CollapsibleGroup({ config, onClose, level = 0 }) {
  const location = useLocation();
  const isActive = config.base
    ? location.pathname.startsWith(config.base)
    : false;

  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const Icon = config.icon;

  return (
    <div>
      {/* Parent Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3
        text-sm font-bold tracking-wide rounded-lg transition
        ${
          isActive
            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${level * 12 + 16}px` }}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} />}
          {config.label}
        </div>

        {config.items && (
          <ChevronDown
            size={16}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Children */}
      {open && config.items && (
        <div className="mt-1 space-y-1">
          {config.items.map((item, idx) =>
            item.items ? (
              // 🔁 Recursive call for nested groups
              <CollapsibleGroup
                key={idx}
                config={item}
                onClose={onClose}
                level={level + 1}
              />
            ) : (
              // 📍 Final links
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm rounded-md transition
                  ${
                    isActive
                      ? "text-red-400 bg-red-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
                style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}
              >
                {item.label}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  );
}