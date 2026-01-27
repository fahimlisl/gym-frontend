import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { trainerLogout } from "../../api/trainer.api";

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
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* HEADER */}
      <header className="border-b border-red-600/30
                         bg-black px-6 py-4
                         flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src={trainer?.avatar?.url}
            className="w-12 h-12 rounded-full
                       border-2 border-red-600 object-cover"
          />

          <div>
            <p className="text-xs text-gray-400 tracking-widest">
              TRAINER
            </p>
            <p className="font-black tracking-wide">
              {trainer?.fullName}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <button
          onClick={logout}
          className="border border-red-600
                     px-5 py-2 text-xs
                     font-extrabold tracking-widest
                     hover:bg-red-600"
        >
          LOGOUT
        </button>
      </header>

      {/* PAGE CONTENT */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
