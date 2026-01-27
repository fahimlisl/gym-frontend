import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { adminLogout } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black">
      <h2 className="font-bold tracking-wide">
        Admin Dashboard
      </h2>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}
