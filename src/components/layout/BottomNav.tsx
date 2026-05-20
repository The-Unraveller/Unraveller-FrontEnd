import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Award, User } from 'lucide-react';

const navItems = [
  { icon: Home,     label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'Courses',   to: '/courses' },
  { icon: Award,    label: 'Badges',    to: '/badges' },
  { icon: User,     label: 'Profile',   to: '/profile' },
];

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              id={`bottom-nav-${label.toLowerCase()}`}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-gradient-to-br from-purple-brand to-purple-light shadow-glow-purple'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon
                  size={20}
                  className={active ? 'text-white' : 'text-white/40'}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors leading-none ${
                  active ? 'text-purple-soft' : 'text-white/35'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
