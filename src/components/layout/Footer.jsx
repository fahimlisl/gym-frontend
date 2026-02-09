import { Instagram, Youtube, Twitter, Facebook } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-black text-gray-400 overflow-hidden">
      
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-red-600/20 blur-[160px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-600/10 blur-[140px]" />

      <div className="relative container py-16 grid gap-12 md:grid-cols-3">
        
        <div>
          <h3 className="text-white font-black text-2xl tracking-widest">
            <span className="text-red-600">ALPHA </span>GYM
          </h3>

          <p className="mt-4 text-sm text-gray-500 max-w-sm leading-relaxed">
            Built for people who take training seriously.
            No shortcuts. No excuses. Just results.
          </p>

          <p className="mt-6 text-xs font-bold tracking-widest text-red-600">
            TRAIN • EAT • REPEAT
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="space-y-3">
            <p className="text-white font-extrabold tracking-wide">
              COMPANY
            </p>
            <NavLink to="/about">
            <p className="hover:text-white cursor-pointer mt-3">
              About Us
            </p>
            </NavLink>
            <NavLink to="/programs">
            <p className="hover:text-white cursor-pointer mt-3">
              Programs
            </p>
            </NavLink>
            <NavLink to="/pricing">
            <p className="hover:text-white cursor-pointer mt-3">
              Pricing
            </p>
            </NavLink>
          </div>

          <div className="space-y-3">
            <p className="text-white font-extrabold tracking-wide">
              SUPPORT
            </p>
            <NavLink to="/contacts">
            <p className="hover:text-white cursor-pointer mt-3">
              Contact
            </p>
            </NavLink>
            <NavLink to="/about">
            <p className="hover:text-white cursor-pointer mt-3">
              FAQs
            </p>
            </NavLink>
            <NavLink to="/about">
            <p className="hover:text-white cursor-pointer mt-3">
              Terms & Policy
            </p>
            </NavLink>
          </div>
        </div>

        <div className="border border-white/10 p-6 bg-neutral-950 flex flex-col justify-between">
          <div>
            <p className="text-white font-extrabold text-lg mb-3">
              READY TO LEVEL UP?
            </p>

            <p className="text-sm text-gray-400 mb-6">
              Your body won’t change unless you do.
              Start today.
            </p>

            <NavLink to="/contacts">

            <button className="w-full bg-red-600 py-3 font-extrabold tracking-widest hover:bg-red-700">
              JOIN THE GRIND
            </button>
            </NavLink>
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href="https://www.instagram.com/asialpha2026?igsh=djBhejZhaHpxYnEx&utm_source=qr"
              className="p-2 border border-white/20 hover:border-red-600 hover:text-white transition"
            >
              <Instagram size={18} />
            </a>
            {/* <a
              href="#"
              className="p-2 border border-white/20 hover:border-red-600 hover:text-white transition"
            >
              <Youtube size={18} />
            </a> */}
            <a
              href="https://www.facebook.com/people/Asi-Alpha/pfbid02nG2nwzRgRbGy8TY4zfH3nHLdqaq6AuakXBnbRp2Y9KBrTJseNCvb3h8MxjTVpojpl/?mibextid=wwXIfr&rdid=chij3R9FrZ5FmXJ7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18GywuH7jX%2F%3Fmibextid%3DwwXIfr%26wa_logging_event%3Dvideo_play_open"
              className="p-2 border border-white/20 hover:border-red-600 hover:text-white transition"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          
          <p>
            © {new Date().getFullYear()} alphagym. All rights reserved.
          </p>

          <p className="relative z-10">
  Developed & maintained by{" "}
  <a
    href="https://fahim.in"
    target="_blank"
    rel="noopener noreferrer"
    className="text-red-600 font-semibold hover:underline"
  >
    Fahim Abdullah
  </a>
</p>

        </div>
      </div>
    </footer>
  );
}
