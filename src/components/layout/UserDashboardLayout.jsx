import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function UserDashboardLayout({ children }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post("/user/logout");
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      
      {/* TOP BAR */}
      <header
        className="sticky top-0 z-40
                   border-b border-red-600/30
                   bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4
                        flex items-center justify-between">

          {/* BRAND */}
          <div
            className="font-black tracking-widest text-lg cursor-pointer"
            onClick={() => navigate("/user/dashboard")}
          >
            ALPHA <span className="text-red-600">GYM</span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="border border-red-600
                         px-5 py-2 text-xs font-extrabold tracking-widest
                         hover:bg-red-600 transition"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6
                        text-center text-xs text-gray-500 tracking-widest">
          MEMBER DASHBOARD • POWERED BY ALPHA GYM
        </div>
      </footer>
    </div>
  );
}
