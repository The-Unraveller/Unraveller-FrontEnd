import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Flame, Star, LogOut, User as UserIcon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

const Header = () => {
  const { user, logout } = useGameStore();

  if (!user) return null; // Không hiển thị nếu chưa đăng nhập

  return (
    <header className="w-full h-16 bg-navy-2 border-b border-spy-green/30 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md bg-navy-2/80">
      <div className="flex items-center gap-8">
        {/* Logo/Home Link */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-spy-green text-black flex items-center justify-center font-bold rotate-45 group-hover:rotate-0 transition-all">
            U
          </div>
          <span className="font-bold tracking-tighter text-spy-green uppercase text-sm">The Unraveller</span>
        </Link>

        {/* Quick Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase font-medium text-gray-400">
          <Link to="/courses" className="hover:text-spy-green transition-colors">Missions</Link>
          <Link to="/badges" className="hover:text-spy-green transition-colors">Badges</Link>
          <Link to="/premium" className="hover:text-spy-green transition-colors">Premium</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Stats Section */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Energy Meter */}
          <div className="flex items-center gap-2 px-3 py-1 bg-spy-black border border-spy-green/20 rounded-full">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-gray-400 uppercase">Energy:</span>
            <span className="text-spy-green font-bold">{user.energy}/{user.maxEnergy}</span>
          </div>

          {/* Streak Meter */}
          <div className="flex items-center gap-2 px-3 py-1 bg-spy-black border border-spy-green/20 rounded-full">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-gray-400 uppercase">Streak:</span>
            <span className="text-spy-green font-bold">{user.streakCount}d</span>
          </div>

          {/* XP Balance */}
          <div className="flex items-center gap-2 px-3 py-1 bg-spy-black border border-spy-green/20 rounded-full">
            <Star className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-400 uppercase">XP:</span>
            <span className="text-spy-green font-bold">{user.xpBalance}</span>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-6 border-l border-spy-green/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-spy-green/20 border border-spy-green/50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-spy-green" />
            </div>
            <span className="text-xs font-bold uppercase text-spy-green hidden sm:block">
              {user.username}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all group"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
