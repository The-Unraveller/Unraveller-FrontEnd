import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Search, Edit3, ShieldAlert, Zap, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';

const AdminUsers: React.FC = () => {
  const { user } = useGameStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  /* Edit Modal state variables */
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editXp, setEditXp] = useState<number>(0);
  const [editEnergy, setEditEnergy] = useState<number>(100);
  const [editRole, setEditRole] = useState<number>(0);
  const [editIsPremium, setEditIsPremium] = useState<boolean>(false);
  const [editEnglishLevel, setEditEnglishLevel] = useState<string>("B1");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (user?.role !== 'Admin') {
    return <Navigate to="/admin/missions" replace />;
  }

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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/Admin/users/${editingUser.id}`, {
        xpBalance: editXp,
        energy: editEnergy,
        role: editRole,
        isPremium: editIsPremium,
        englishLevel: editEnglishLevel
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
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
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isPremium ? 'bg-gold' : 'bg-white/20'}`} />
                      <span className="text-white/60 text-xs font-semibold">{u.isPremium ? 'Premium' : 'Free'}</span>
                    </div>
                    <span className="text-[10px] text-cyan-brand font-mono font-bold mt-0.5">CEFR: {u.englishLevel || 'B1'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => {
                      setEditingUser(u);
                      setEditXp(u.xpBalance);
                      setEditEnergy(u.energy);
                      setEditIsPremium(u.isPremium);
                      setEditEnglishLevel(u.englishLevel || "B1");
                      setEditRole(u.role === 'Admin' ? 2 : u.role === 'Moderator' ? 1 : 0);
                    }}
                    className="p-2 text-white/30 hover:text-white transition-colors animate-pulse-slow"
                    title="Edit player database fields"
                  >
                    <Edit3 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="ur-card border border-white/10 max-w-md w-full mx-4 p-6 rounded-3xl relative shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-navy-1/95">
            <button 
              onClick={() => setEditingUser(null)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              disabled={isSaving}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-purple-brand" /> Edit Player Profile
              </h2>
              <p className="text-white/40 text-xs mt-1">
                Updating credentials for <span className="text-purple-light font-semibold">{editingUser.username}</span>
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Profile Details (Read Only) */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/60">
                <div>
                  <span className="text-[10px] text-white/30 block uppercase tracking-wider mb-0.5">Username</span>
                  <span className="font-mono text-white font-medium">{editingUser.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/30 block uppercase tracking-wider mb-0.5">Email Address</span>
                  <span className="font-mono text-white font-medium truncate block" title={editingUser.email}>
                    {editingUser.email}
                  </span>
                </div>
              </div>

              {/* XP Balance input */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">XP Balance</label>
                <input 
                  type="number"
                  min="0"
                  required
                  className="bg-navy-2 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-purple-brand outline-none transition-all w-full font-mono"
                  value={editXp}
                  onChange={(e) => setEditXp(parseInt(e.target.value, 10) || 0)}
                  disabled={isSaving}
                />
              </div>

              {/* Energy Level Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-white/70">Energy Level</label>
                  <span className="text-xs font-mono text-cyan-brand font-bold">{editEnergy}/100</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-cyan-brand bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                  value={editEnergy}
                  onChange={(e) => setEditEnergy(parseInt(e.target.value, 10) || 0)}
                  disabled={isSaving}
                />
              </div>

              {/* Role Dropdown selection */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Security Role</label>
                <select
                  className="bg-navy-2 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-purple-brand outline-none transition-all w-full"
                  value={editRole}
                  onChange={(e) => setEditRole(parseInt(e.target.value, 10))}
                  disabled={isSaving}
                >
                  <option value={0}>User (Role 0)</option>
                  <option value={1}>Moderator (Role 1)</option>
                  <option value={2}>Admin (Role 2)</option>
                </select>
              </div>

              {/* CEFR level selection dropdown */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">CEFR English Level</label>
                <select
                  className="bg-navy-2 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-purple-brand outline-none transition-all w-full font-mono font-bold text-cyan-brand"
                  value={editEnglishLevel}
                  onChange={(e) => setEditEnglishLevel(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper-Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Mastery</option>
                </select>
              </div>

              {/* VIP / Premium Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-xs font-semibold text-white block">VIP Premium Status</span>
                  <span className="text-[10px] text-white/40 block">Unlock all course materials and bonuses</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPremium(!editIsPremium)}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${editIsPremium ? 'bg-gold' : 'bg-white/10'}`}
                  disabled={isSaving}
                >
                  <div className={`bg-navy-1 w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${editIsPremium ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-purple-brand text-white hover:bg-purple-light text-sm font-semibold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
