import { Menu, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { adminLogout } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header
      className="h-16 flex items-center justify-between
                 px-4 md:px-6
                 border-b border-white/10 bg-black
                 sticky top-0 z-20"
    >
      <div className="flex items-center gap-3">

        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-400 hover:text-red-500"
        >
          <Menu />
        </button>

        <h2 className="font-bold tracking-wide">
          Admin Dashboard
        </h2>
      </div>


      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-bold
                   text-gray-400 hover:text-red-500"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}
