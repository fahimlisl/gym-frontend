import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  QrCode, 
  CalendarCheck, 
  UserCheck,
  Key,
  LogOut 
} from "lucide-react";
import toast from "react-hot-toast";
import { trainerLogout, trainerChangePassword, getTrainerSelf } from "../../api/trainer.api.js";
import { useForm } from "react-hook-form";

export default function TrainerDashboardLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await getTrainerSelf(); 
        setTrainer(response.data.data); 
      } catch (error) {
        console.log(error)
        toast.error("Failed to fetch trainer data");
        navigate("/login"); 
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [navigate]);

  const logout = async () => {
    try {
      await trainerLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await trainerChangePassword(data);
      toast.success("Password changed successfully");
      setShowChangeModal(false);
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
  };

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded text-sm font-bold tracking-wide transition-all duration-200
         ${isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-red-600/20 hover:text-white"}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? "text-white" : "text-red-500"} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  if (!trainer) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white">
        <header
          className="md:hidden h-14 px-4 flex items-center justify-between
                           border-b border-red-600/30 bg-black"
        >
          <h1 className="font-black tracking-widest uppercase">Trainer</h1>

          <button
            onClick={() => setOpen(true)}
            className="border border-red-600 p-2 rounded hover:bg-red-600/20 transition-colors"
          >
            <Menu size={18} />
          </button>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <aside
              className="absolute left-0 top-0 h-full w-72
                              bg-black border-r border-red-600/30
                              flex flex-col"
            >
              <div
                className="px-6 py-5 border-b border-red-600/30
                              flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] text-gray-400 tracking-widest">
                    TRAINER
                  </p>
                  <p className="font-black text-lg">{trainer?.fullName}</p>
                </div>

                <button onClick={() => setOpen(false)} className="hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                <NavItem to="/trainer/dashboard" label="DASHBOARD" icon={LayoutDashboard} />
                <NavItem to="/trainer/my-qr" label="MY QR" icon={QrCode} />
                <NavItem to="/trainer/attendence/today" label="TODAY'S ATTENDANCE" icon={CalendarCheck} />
                <NavItem to="/trainer/attendence/my" label="MY ATTENDANCE" icon={UserCheck} />
              </nav>

              <div className="px-4 py-4 border-t border-red-600/30 space-y-2">
                <button
                  onClick={() => setShowChangeModal(true)}
                  className="w-full flex items-center justify-center gap-2 border border-red-600 py-2.5
                             text-xs font-extrabold tracking-widest rounded
                             hover:bg-red-600 transition-all duration-200"
                >
                  <Key size={14} />
                  CHANGE PASSWORD
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 border border-red-600 py-2.5
                             text-xs font-extrabold tracking-widest rounded
                             hover:bg-red-600 transition-all duration-200"
                >
                  <LogOut size={14} />
                  LOGOUT
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="hidden md:flex min-h-screen">
          <aside className="w-64 bg-black border-r border-red-600/30 flex flex-col">
            <div className="px-6 py-6 border-b border-red-600/30">
              <div className="flex items-center gap-4">
                <img
                  src={trainer?.avatar?.url}
                  className="w-14 h-14 rounded-full
                             border-2 border-red-600 object-cover"
                  alt={trainer?.fullName}
                />
                <div>
                  <p className="text-[10px] text-gray-400 tracking-widest">
                    TRAINER
                  </p>
                  <p className="font-black text-base">{trainer?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{trainer?.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <NavItem to="/trainer/dashboard" label="DASHBOARD" icon={LayoutDashboard} />
              <NavItem to="/trainer/my-qr" label="MY QR" icon={QrCode} />
              <NavItem to="/trainer/attendence/today" label="TODAY'S ATTENDANCE" icon={CalendarCheck} />
              <NavItem to="/trainer/attendence/my" label="MY ATTENDANCE" icon={UserCheck} />
            </nav>

            <div className="px-4 py-4 border-t border-red-600/30 space-y-2">
              <button
                onClick={() => setShowChangeModal(true)}
                className="w-full flex items-center justify-center gap-2 border border-red-600 py-2.5
                           text-xs font-extrabold tracking-widest rounded
                           hover:bg-red-600 transition-all duration-200"
              >
                <Key size={14} />
                CHANGE PASSWORD
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 border border-red-600 py-2.5
                           text-xs font-extrabold tracking-widest rounded
                           hover:bg-red-600 transition-all duration-200"
              >
                <LogOut size={14} />
                LOGOUT
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col">
            <header
              className="h-16 px-6 flex items-center justify-between
                               border-b border-red-600/30 bg-neutral-900"
            >
              <h1 className="text-lg font-black tracking-widest uppercase">
                Trainer Panel
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  Welcome back,
                </span>
                <span className="text-sm font-bold text-red-500">
                  {trainer?.fullName?.split(' ')[0]}
                </span>
              </div>
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
      {showChangeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm
                        flex items-center justify-center z-50"
        >
          <div
            className="relative w-full max-w-md border border-red-600/30
                          bg-neutral-950 shadow-[0_0_80px_rgba(255,0,0,0.25)]"
          >
            <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            <div className="p-8">
              <h2 className="text-xl font-black tracking-widest text-red-600 mb-6 flex items-center gap-2">
                <Key size={20} />
                CHANGE PASSWORD
              </h2>

              <form onSubmit={handleSubmit(handleChangePassword)}>
                <input
                  type="password"
                  placeholder="OLD PASSWORD"
                  {...register("oldPassword", { required: true })}
                  className="w-full mb-4 bg-black border border-white/10 px-4 py-3 text-white
                             focus:border-red-500 focus:outline-none transition-colors"
                />

                <input
                  type="password"
                  placeholder="NEW PASSWORD"
                  {...register("newPassword", { required: true })}
                  className="w-full mb-4 bg-black border border-white/10 px-4 py-3 text-white
                             focus:border-red-500 focus:outline-none transition-colors"
                />

                <input
                  type="password"
                  placeholder="CONFIRM NEW PASSWORD"
                  {...register("confirmNewPassword", { required: true })}
                  className="w-full mb-6 bg-black border border-white/10 px-4 py-3 text-white
                             focus:border-red-500 focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 font-extrabold tracking-widest rounded
                             bg-gradient-to-r from-red-700 via-red-600 to-red-700
                             text-black hover:brightness-110 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>

              <button
                onClick={() => setShowChangeModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}