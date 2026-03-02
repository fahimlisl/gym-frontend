import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
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

        <h2 className="font-bold tracking-wide text-white">
          Admin Dashboard
        </h2>
      </div>
    </header>
  );
}