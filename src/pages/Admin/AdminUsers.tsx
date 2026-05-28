import React, { useState, useEffect } from 'react';
import { Users, Search, Edit3, ShieldAlert, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/Admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">User Management</h1>
          <p className="text-white/40 text-sm">Manage players, adjust XP, and handle roles.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search user..." 
            className="bg-navy-2 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-purple-brand outline-none transition-all w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="ur-card rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">XP</th>
              <th className="px-6 py-4">Energy</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-white/30">Loading users...</td></tr>
            ) : users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-brand/20 flex items-center justify-center text-xs font-bold text-purple-brand">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{u.username}</div>
                      <div className="text-white/30 text-[10px]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'Admin' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/80 font-mono">{u.xpBalance.toLocaleString()}</td>
                <td className="px-6 py-4 text-white/80">{u.energy}/{u.maxEnergy || 100}</td>
                <td className="px-6 py-4">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isPremium ? 'bg-gold' : 'bg-white/20'}`} />
                  <span className="text-white/60 text-xs">{u.isPremium ? 'Premium' : 'Free'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-white/30 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
