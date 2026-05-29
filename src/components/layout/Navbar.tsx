import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Zap, LogOut, ChevronDown } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getMissions } from '../../services/api';

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

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useGameStore();

  const displayIsLoggedIn = isLoggedIn || !!user;
  const displayUsername = user?.username || username || 'USERNAME';

  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [missionsList, setMissionsList] = useState<any[]>([]);

  useEffect(() => {
    if (displayIsLoggedIn) {
      getMissions()
        .then(data => {
          setMissionsList(data || []);
        })
        .catch(err => console.error("Failed to load missions for navbar dropdown:", err));
    }
  }, [displayIsLoggedIn]);

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
          {navLinks.map(link => {
            if (link.label === 'Courses') {
              return (
                <div
                  key={link.to}
                  className="relative group py-1"
                  onMouseEnter={() => setCoursesDropdownOpen(true)}
                  onMouseLeave={() => setCoursesDropdownOpen(false)}
                >
                  <Link
                    to={link.to}
                    className={`relative text-sm font-medium px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      isActive(link.to)
                        ? 'text-gold font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    <ChevronDown size={12} className="opacity-60 group-hover:rotate-180 transition-transform" />
                    {isActive(link.to) && (
                      <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-gold rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {coursesDropdownOpen && missionsList.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-navy-2 border border-purple-brand/25 rounded-2xl p-2 shadow-glow-purple/20 z-50 animate-slide-up select-none font-mono">
                      <div className="text-[10px] text-white/30 px-3 py-1.5 border-b border-white/5 uppercase tracking-wider">
                        Select Mission
                      </div>
                      <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                        {missionsList.map((m) => (
                          <Link
                            key={m.id}
                            to={m.locked ? '#' : `/game/${m.id}`}
                            onClick={() => setCoursesDropdownOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                              m.locked
                                ? 'text-white/20 cursor-not-allowed'
                                : 'text-white/70 hover:text-gold hover:bg-white/5'
                            }`}
                          >
                            <span className="text-sm">{m.npcEmoji || '☕'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate leading-none">{m.title}</p>
                              <p className="text-[9px] text-white/35 mt-0.5 truncate uppercase">{m.stage} — {m.difficulty}</p>
                            </div>
                            {m.locked ? (
                              <span className="text-[9px] text-white/20">🔒</span>
                            ) : (
                              <span className="text-[9px] text-spy-green">PLAY</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
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
            );
          })}
          {(user?.role === 'Admin' || user?.role === 'Moderator') && (
            <Link
              to="/admin"
              className="relative text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 shadow-glow-red/20 font-mono flex items-center gap-1.5 ml-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {user?.role === 'Admin' ? 'Admin Portal' : 'Moderator Portal'}
            </Link>
          )}
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
          {displayIsLoggedIn ? (
            /* User pill (logged in) + Logout button */
            <div className="flex items-center gap-2">
              {/* Energy Meter */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-purple-brand/20 rounded-full text-xs font-mono select-none">
                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Energy:</span>
                <span className="text-white font-black">{user?.energy ?? 100}/{user?.maxEnergy ?? 100}</span>
              </div>

              <Link
                to="/profile"
                id="navbar-user-btn"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-brand/40 hover:border-purple-soft/60 transition-all text-sm font-semibold text-white/80 hover:text-white"
              >
                <span className="w-6 h-6 rounded-full bg-purple-brand/40 flex items-center justify-center text-xs">🎭</span>
                {displayUsername}
                <Zap size={12} className="text-xp-orange" />
              </Link>
              <button
                onClick={() => useGameStore.getState().logout()}
                className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all group text-white/60 hover:text-red-500"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
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
          {(user?.role === 'Admin' || user?.role === 'Moderator') && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold py-2.5 px-3 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 font-mono"
            >
              🚨 {user?.role === 'Admin' ? 'Admin Portal' : 'Moderator Portal'}
            </Link>
          )}
          {/* Only show auth buttons when NOT logged in */}
          {!displayIsLoggedIn ? (
            <div className="pt-3 border-t border-white/5 flex gap-3">
              <Link to="/auth?mode=register" onClick={() => setMenuOpen(false)}>
                <button className="btn btn-primary btn-sm">Đăng ký</button>
              </Link>
              <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)}>
                <button className="btn btn-outline btn-sm">Đăng nhập</button>
              </Link>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/5 flex gap-3">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="btn btn-outline btn-sm w-full">👤 {displayUsername}</button>
              </Link>
              <button
                onClick={() => { useGameStore.getState().logout(); setMenuOpen(false); }}
                className="btn btn-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
