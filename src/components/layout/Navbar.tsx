import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Zap } from 'lucide-react';

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const navLinks = [
  { label: 'Homepage', to: '/' },
  { label: 'Premium',  to: '/premium' },
  { label: 'Courses',  to: '/courses' },
  { label: 'Badges',   to: '/badges' },
  { label: 'About us', to: '/about' },
];

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, username = 'USERNAME' }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="ur-navbar">
      <div className="max-w-screen-xl mx-auto px-5 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group" id="navbar-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow-gold transition-transform group-hover:scale-105">
            <span className="text-navy font-black text-xs font-heading">UR</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
                isActive(link.to)
                  ? 'text-gold font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-gold rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Search — desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="ur-search w-52 xl:w-60 flex-shrink-0">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input placeholder="Search scenarios…" id="navbar-search" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 flex-shrink-0">
          {isLoggedIn ? (
            /* User pill (logged in) */
            <button
              id="navbar-user-btn"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-brand/40 hover:border-purple-soft/60 transition-all text-sm font-semibold text-white/80 hover:text-white"
            >
              <span className="w-6 h-6 rounded-full bg-purple-brand/40 flex items-center justify-center text-xs">🎭</span>
              {username}
              <Zap size={12} className="text-xp-orange" />
            </button>
          ) : (
            <>
              <Link to="/auth?mode=register" className="hidden sm:block">
                <button id="navbar-signup" className="btn btn-primary btn-sm">Sign Up</button>
              </Link>
              <Link to="/auth?mode=login" className="hidden sm:block">
                <span className="text-white/60 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                  Login
                </span>
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            id="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-purple-brand/15 px-5 py-4 space-y-1 animate-slide-up">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                isActive(link.to)
                  ? 'text-gold bg-gold/8 font-semibold'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/5 flex gap-3">
            <Link to="/auth?mode=register" onClick={() => setMenuOpen(false)}>
              <button className="btn btn-primary btn-sm">Sign Up</button>
            </Link>
            <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)}>
              <button className="btn btn-outline btn-sm">Login</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
