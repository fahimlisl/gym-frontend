import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ menuOpen, setMenuOpen }) {
  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-bold tracking-wide transition
     ${isActive ? "text-red-600" : "text-white hover:text-red-500"}`;

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-extrabold tracking-widest">
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
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/store" className={navLinkClass}>Store</NavLink>
          <NavLink to="/programs" className={navLinkClass}>Programs</NavLink>
          <NavLink to="/pricing" className={navLinkClass}>Gym Plan</NavLink>
          <NavLink to="/contacts" className={navLinkClass}>Contacts</NavLink>
          <NavLink to="/about" className={navLinkClass}>About Us</NavLink>
          <NavLink to="/trainers" className={navLinkClass}>Our Trainers</NavLink>
          <NavLink to="/login" className={navLinkClass}>Login</NavLink>
        </ul>

        <div className="hidden md:block">
          <Link
            to="/pricing"
            className="bg-red-600 hover:bg-red-700 px-6 py-2 text-sm font-extrabold tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.45)]"
          >
            JOIN
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <div className="flex flex-col p-6 gap-5 text-sm font-bold tracking-wide">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>Home</NavLink>
            <NavLink to="/store" onClick={() => setMenuOpen(false)} className={navLinkClass}>Store</NavLink>
            <NavLink to="/programs" onClick={() => setMenuOpen(false)} className={navLinkClass}>Programs</NavLink>
            <NavLink to="/contacts" onClick={() => setMenuOpen(false)} className={navLinkClass}>Contacts</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)} className={navLinkClass}>About Us</NavLink>
            <Link
              to="/pricing"
              onClick={() => setMenuOpen(false)}
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