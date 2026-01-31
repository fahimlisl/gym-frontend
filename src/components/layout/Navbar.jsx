import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-bold tracking-wide transition
     ${
       isActive
         ? "text-red-600"
         : "text-white hover:text-red-500"
     }`;

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <nav className="container flex items-center justify-between h-16">
        
        <Link
          to="/"
          className="text-xl font-extrabold tracking-widest"
        >
         <span className="text-red-600">ALPHA</span> GYM
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/supplements" className={navLinkClass}>
            Supplements
          </NavLink>
          <NavLink to="/programs" className={navLinkClass}>
            Programs
          </NavLink>
          <NavLink to="/pricing" className={navLinkClass}>
            Pricing
          </NavLink>
          <NavLink to="/contacts" className={navLinkClass}>
            Contacts
          </NavLink>

          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
        </ul>

        <div className="hidden md:block">
          <Link
            to="/login"
            className="bg-red-600 hover:bg-red-700 px-6 py-2 text-sm font-extrabold tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.45)]"
          >
            JOIN
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-black border-t border-white/10">
          <div className="flex flex-col p-6 gap-5 text-sm font-bold tracking-wide">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/supplements"
              onClick={() => setOpen(false)}
              className={navLinkClass}
            >
              Supplements
            </NavLink>
          <NavLink to="/programs" onClick={() => setOpen(false)} className={navLinkClass}>
            Programs
          </NavLink>
          <NavLink to="/pricing" onClick={() => setOpen(false)} className={navLinkClass}>
            Pricing
          </NavLink>
          <NavLink to="/contacts" onClick={() => setOpen(false)} className={navLinkClass}>
            Contacts
          </NavLink>

            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className={navLinkClass}
            >
              Login
            </NavLink>


            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="mt-4 bg-red-600 py-3 text-center font-extrabold tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              JOIN NOW
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}