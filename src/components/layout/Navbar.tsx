import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, LogOut, ChevronDown, User, FileText, Star, BookOpen, Flame, ShoppingBag, HelpCircle, Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getMissions } from '../../services/api';

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const navLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Premium', to: '/premium' },
  { label: 'Nhiệm vụ', to: '/courses' },
  { label: 'Huy chương', to: '/badges' },
  { label: 'Giới thiệu', to: '/about' },
];

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useGameStore();

  const displayIsLoggedIn = isLoggedIn || !!user;
  const displayUsername = user?.username || username || 'ĐẶC VỤ';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="The Unraveller"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3 flex-1">
          {navLinks.map(link => {
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                  isActive(link.to)
                    ? 'text-accent bg-accent/5'
                    : 'text-text-secondary hover:text-accent hover:bg-gray-50'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
          {isAuthenticated && user !== null && (user.role === 'Admin' || user.role === 'Moderator') && (
            <Link
              to="/admin"
              className="relative text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-all text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 font-mono flex items-center gap-1.5 ml-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {user.role === 'Admin' ? '🛡️ Admin' : '⚙️ Moderator'}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto md:ml-0 flex-shrink-0">
          {displayIsLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Energy */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-warning fill-warning/20" />
                <span className="text-text-muted">{user?.energy ?? 100}/{user?.maxEnergy ?? 100}</span>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-accent transition-all text-sm font-medium text-text-primary hover:bg-gray-50"
                >
                  <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs">👤</span>
                  {displayUsername}
                  <ChevronDown size={12} className="opacity-60" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full pt-1.5 w-56 z-50">
                    <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-lg animate-slide-up">
                      <div className="text-xs text-text-muted px-3 py-1.5 border-b border-gray-100 uppercase tracking-wider font-semibold">
                        TÀI KHOẢN
                      </div>
                      <div className="mt-2 space-y-1">
                        {[
                          { icon: User, label: 'Hồ sơ', to: '/profile' },
                          { icon: FileText, label: 'Báo cáo', to: '/report' },
                          { icon: Star, label: 'Điểm số', to: '/score' },
                          { icon: BookOpen, label: 'Kịch bản', to: '/courses' },
                          { icon: Flame, label: 'Chuỗi ngày', to: '/streak' },
                          { icon: ShoppingBag, label: 'Cửa hàng', to: '/market' },
                          { icon: HelpCircle, label: 'Hướng dẫn', to: '/guide' },
                          { icon: Users, label: 'Bạn bè', to: '/friends' },
                        ].map(({ icon: Icon, label, to }) => {
                          const active = pathname === to;
                          return (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                active
                                  ? 'text-accent bg-accent/5 font-medium'
                                  : 'text-text-secondary hover:text-accent hover:bg-gray-50'
                              }`}
                            >
                              <Icon size={14} />
                              <span>{label}</span>
                            </Link>
                          );
                        })}
                        <div className="w-full h-px bg-gray-100 my-1.5" />
                        <button
                          onClick={() => useGameStore.getState().logout()}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                        >
                          <LogOut size={14} />
                          <span>Đăng xuất</span>
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
                <button className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-dark transition-colors">Đăng ký</button>
              </Link>
              <Link to="/auth?mode=login" className="hidden sm:block">
                <span className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">Đăng nhập</span>
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-text-secondary hover:text-accent transition-colors p-2 rounded-lg hover:bg-gray-50 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-4 space-y-1 bg-white animate-slide-up">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                isActive(link.to)
                  ? 'text-accent bg-accent/5'
                  : 'text-text-secondary hover:text-accent hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user !== null && (user.role === 'Admin' || user.role === 'Moderator') && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold py-2.5 px-3 rounded-lg transition-all text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
            >
              🚨 {user.role === 'Admin' ? 'Admin Portal' : 'Moderator Portal'}
            </Link>
          )}
          {!displayIsLoggedIn ? (
            <div className="pt-3 border-t border-gray-200 flex gap-3">
              <Link to="/auth?mode=register" onClick={() => setMenuOpen(false)}>
                <button className="btn btn-primary btn-sm flex-1">Đăng ký</button>
              </Link>
              <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)}>
                <button className="btn btn-outline btn-sm flex-1">Đăng nhập</button>
              </Link>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-200 flex gap-3">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="btn btn-outline btn-sm w-full">👤 {displayUsername}</button>
              </Link>
              <button
                onClick={() => { useGameStore.getState().logout(); setMenuOpen(false); }}
                className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex-1"
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
