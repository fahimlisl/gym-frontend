import Navbar from "../layout/Navbar.jsx";
import Footer from "../layout/Footer";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {!menuOpen && (
        <nav className="md:hidden bg-[#0a0a0a] border-b border-white/[0.08] sticky top-16 z-40">
          <ul className="flex items-center justify-around h-10 text-[10px] font-bold tracking-widest uppercase">
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 ${isActive ? "text-red-500" : "text-white/60 hover:text-red-500"}`
                }
              >
                Login
              </NavLink>
            </li>
            <li className="w-px h-4 bg-white/10" />
            <li>
              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `px-3 py-2 ${isActive ? "text-red-500" : "text-white/60 hover:text-red-500"}`
                }
              >
                Gym Plan
              </NavLink>
            </li>
            <li className="w-px h-4 bg-white/10" />
            <li>
              <NavLink
                to="/trainers"
                className={({ isActive }) =>
                  `px-3 py-2 ${isActive ? "text-red-500" : "text-white/60 hover:text-red-500"}`
                }
              >
                Our Trainers
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
