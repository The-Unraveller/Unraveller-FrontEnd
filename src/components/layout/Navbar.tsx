import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Zap, LogOut, ChevronDown, User, FileText, Star, BookOpen, Flame, ShoppingBag, HelpCircle, Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getMissions } from '../../services/api';

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const navLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Premium',  to: '/premium' },
  { label: 'Nhiệm vụ',  to: '/courses' },
  { label: 'Huy chương',   to: '/badges' },
  { label: 'Giới thiệu', to: '/about' },
];

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useGameStore();

  const displayIsLoggedIn = isLoggedIn || !!user;
  const displayUsername = user?.username || username || 'ĐẶC VỤ';

  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
          <img 
            src="/logo.png" 
            alt="The Unraveller" 
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3.5 flex-1">
          {navLinks.map(link => {
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
          {/* Admin/Moderator portal — ONLY shown when user is fully loaded and has the correct role */}
          {isAuthenticated && user !== null && (user.role === 'Admin' || user.role === 'Moderator') && (
            <Link
              to="/admin"
              className="relative text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 shadow-glow-red/20 font-mono flex items-center gap-1.5 ml-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {user.role === 'Admin' ? '🛡️ Admin Portal' : '⚙️ Moderator Portal'}
            </Link>
          )}
        </div>

        {/* Search — desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="ur-search w-52 xl:w-60 flex-shrink-0">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input placeholder="Tìm kiếm kịch bản…" id="navbar-search" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto md:ml-0 flex-shrink-0">
          {displayIsLoggedIn ? (
            /* User pill (logged in) + Logout button */
            <div className="flex items-center gap-4">
              {/* Energy Meter */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-purple-brand/20 rounded-full text-xs font-mono select-none">
                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Năng lượng:</span>
                <span className="text-white font-black">{user?.energy ?? 100}/{user?.maxEnergy ?? 100}</span>
              </div>

              <div
                className="relative py-1 group"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  id="navbar-user-btn"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-brand/40 hover:border-purple-soft/60 transition-all text-sm font-semibold text-white/80 hover:text-white bg-transparent outline-none cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-brand/40 flex items-center justify-center text-xs">🎭</span>
                  {displayUsername}
                  <Zap size={12} className="text-xp-orange" />
                  <ChevronDown size={12} className="opacity-60 transition-transform group-hover:rotate-180" />
                </button>

                {/* Profile dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full pt-1.5 w-56 z-50">
                    <div className="bg-navy-2/95 border border-purple-brand/25 rounded-2xl p-2.5 shadow-[0_4px_30px_rgba(124,58,237,0.25)] animate-slide-up select-none font-mono overflow-hidden backdrop-blur-xl relative">
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-brand via-cyan-brand to-purple-brand opacity-80" />
                      <div className="text-[9px] text-white/30 px-3 py-1.5 border-b border-white/5 uppercase tracking-widest font-black">
                        AGENT CONSOLE
                      </div>
                      <div className="mt-2 space-y-1">
                        {[
                          { icon: User, label: 'Hồ sơ', enLabel: 'Profile', to: '/profile' },
                          { icon: FileText, label: 'Báo cáo', enLabel: 'Report', to: '/report' },
                          { icon: Star, label: 'Điểm số', enLabel: 'Score', to: '/score' },
                          { icon: BookOpen, label: 'Kịch bản', enLabel: 'Scenario', to: '/courses' },
                          { icon: Flame, label: 'Chuỗi ngày', enLabel: 'Streak', to: '/streak' },
                          { icon: ShoppingBag, label: 'Cửa hàng', enLabel: 'Market', to: '/market' },
                          { icon: HelpCircle, label: 'Hướng dẫn', enLabel: 'Guide', to: '/guide' },
                          { icon: Users, label: 'Bạn bè', enLabel: 'Friends', to: '/friends' },
                        ].map(({ icon: Icon, label, enLabel, to }) => {
                          const active = pathname === to;
                          return (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-300 relative group ${
                                active 
                                  ? 'bg-purple-brand/15 text-cyan-brand border-l-2 border-cyan-brand pl-[10px] rounded-l-none font-bold' 
                                  : 'text-white/60 hover:text-cyan-brand hover:bg-purple-brand/8 border-l-2 border-transparent hover:border-cyan-brand hover:pl-[10px] hover:rounded-l-none'
                              }`}
                            >
                              <Icon size={13} className={`transition-colors ${active ? 'text-cyan-brand' : 'text-white/45 group-hover:text-cyan-brand'}`} />
                              <span>{label} ({enLabel})</span>
                            </Link>
                          );
                        })}

                        {/* Integrated premium Logout option inside the dropdown console */}
                        <div className="w-full h-px bg-white/5 my-1.5" />
                        <button
                          onClick={() => useGameStore.getState().logout()}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-l-2 border-transparent hover:border-red-500 hover:pl-[10px] hover:rounded-l-none transition-all duration-300 relative group font-mono text-left"
                        >
                          <LogOut size={13} className="text-red-500/60 group-hover:text-red-400" />
                          <span>Đăng xuất (Logout)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/auth?mode=register" className="hidden sm:block">
                <button id="navbar-signup" className="btn btn-primary btn-sm">Đăng ký</button>
              </Link>
              <Link to="/auth?mode=login" className="hidden sm:block">
                <span className="text-white/60 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                  Đăng nhập
                </span>
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            id="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 md:hidden"
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
          {/* Mobile: only show portal for confirmed Admin/Moderator */}
          {isAuthenticated && user !== null && (user.role === 'Admin' || user.role === 'Moderator') && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold py-2.5 px-3 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 font-mono"
            >
              🚨 {user.role === 'Admin' ? 'Admin Portal' : 'Moderator Portal'}
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
