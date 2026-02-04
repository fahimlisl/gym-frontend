import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { trainerLogout } from "../../api/trainer.api.js";

export default function TrainerDashboardLayout({ trainer, children }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await trainerLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">

      <aside className="w-64 bg-black border-r border-red-600/30 flex flex-col">

        <div className="px-6 py-5 border-b border-red-600/30">
          <div className="flex items-center gap-4">
            <img
              src={trainer?.avatar?.url}
              alt="Trainer"
              className="w-12 h-12 rounded-full border-2 border-red-600 object-cover"
            />
            <div>
              <p className="text-[10px] text-gray-400 tracking-widest">
                TRAINER
              </p>
              <p className="font-black tracking-wide leading-tight">
                {trainer?.fullName}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 text-sm font-bold tracking-wide">

          <NavLink
            to="/trainer/dashboard"
            className={({ isActive }) =>
              `block px-4 py-3 rounded
               ${isActive ? "bg-red-600" : "hover:bg-red-600/20"}`
            }
          >
            DASHBOARD
          </NavLink>

          <NavLink
            to="/trainer/students"
            className={({ isActive }) =>
              `block px-4 py-3 rounded
               ${isActive ? "bg-red-600" : "hover:bg-red-600/20"}`
            }
          >
            STUDENTS
          </NavLink>

          <NavLink
            to="/trainer/foods"
            className={({ isActive }) =>
              `block px-4 py-3 rounded
               ${isActive ? "bg-red-600" : "hover:bg-red-600/20"}`
            }
          >
            FOODS
          </NavLink>

          <NavLink
            to="/trainer/diets"
            className={({ isActive }) =>
              `block px-4 py-3 rounded
               ${isActive ? "bg-red-600" : "hover:bg-red-600/20"}`
            }
          >
            DIET PLANS
          </NavLink>

        </nav>

        <div className="px-4 py-4 border-t border-red-600/30">
          <button
            onClick={logout}
            className="w-full border border-red-600 py-2 text-xs
                       font-extrabold tracking-widest
                       hover:bg-red-600"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">

        <header className="h-16 px-6 flex items-center justify-between
                           border-b border-red-600/30 bg-neutral-900">

          <h1 className="text-lg font-black tracking-widest uppercase">
            Trainer Panel
          </h1>

          <span className="text-xs text-gray-400">
            Manage students • diets • nutrition
          </span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
