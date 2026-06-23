import * as React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, LogOut, ShieldCheck, Store } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useGameStore();

  return (
    <div className="flex h-screen bg-navy-3 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-2 border-r border-purple-brand/20 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-purple-brand rounded-lg shadow-glow-purple">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">
            {user?.role === 'Admin' ? '🛡️ Bảng Admin' : '⚙️ Bảng Moderator'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {user?.role === 'Admin' && (
            <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-brand/10 transition-all text-white/60 hover:text-white group">
              <Users className="w-5 h-5 group-hover:text-purple-brand" />
              <span className="font-medium">Quản lý người dùng</span>
            </Link>
          )}
          <Link to="/admin/missions" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-brand/10 transition-all text-white/60 hover:text-white group">
            <BookOpen className="w-5 h-5 group-hover:text-purple-brand" />
            <span className="font-medium">
              {user?.role === 'Admin' ? 'Duyệt nhiệm vụ' : 'Tạo nhiệm vụ'}
            </span>
          </Link>
          <Link to="/admin/npcs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-brand/10 transition-all text-white/60 hover:text-white group">
            <Users className="w-5 h-5 group-hover:text-purple-brand" />
            <span className="font-medium">Quản lý NPC</span>
          </Link>
          <Link to="/admin/shop-items" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-brand/10 transition-all text-white/60 hover:text-white group">
            <Store className="w-5 h-5 group-hover:text-purple-brand" />
            <span className="font-medium">Quản lý Shop</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
              logout();
              navigate('/dashboard');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              {user?.role === 'Admin' ? 'Thoát Admin' : 'Thoát Moderator'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-navy-3 via-navy-3 to-navy-2">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
