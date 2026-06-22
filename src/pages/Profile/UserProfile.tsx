import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Zap, Flame, Star, Mail, Calendar, Shield, CreditCard, ShoppingBag, Loader2, RefreshCw, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';
import { getUserProfile, getUserInventory, getPaymentHistory, updateEnglishLevel, updateUserProfile } from '../../services/api';
import type { UserInventoryDto, PaymentHistoryDto } from '../../services/api';

import { PageLoader } from '../../components/common/PageLoader';

const missionNames: Record<number, string> = {
  1: "Stage 1: Giao tiếp tại Quán Cà phê",
  2: "Stage 2: Làm theo Chỉ dẫn",
  3: "Stage 3: Tranh luận & Đàm phán",
  4: "Stage 4: Phỏng vấn Xin việc",
  5: "Stage 5: Báo cáo Điều tra",
  6: "Stage 6: Nhập vai Nâng cao"
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useGameStore();

  const [inventory, setInventory] = useState<UserInventoryDto[]>([]);
  const [payments, setPayments] = useState<PaymentHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      // Refresh profile data
      const updatedProfile = await getUserProfile();
      setUser(updatedProfile);

      // Fetch inventory & payment history
      const [invData, payData] = await Promise.all([
        getUserInventory(),
        getPaymentHistory(),
      ]);

      setInventory(invData);
      setPayments(payData);
    } catch (err: any) {
      console.error('Error fetching profile sub-data:', err);
      setError('Could not connect to service. Try refreshing or logging in again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    try {
      setRefreshing(true);
      await updateEnglishLevel(newLevel);
      if (user) {
        setUser({ ...user, englishLevel: newLevel });
      }
      toast.success(`Đã cập nhật trình độ tiếng Anh sang ${newLevel}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trình độ.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartEdit = () => {
    if (user) {
      setEditUsername(user.username);
      setEditEmail(user.email);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateUserProfile(editUsername.trim(), editEmail.trim());
      toast.success(res.message || "Đã cập nhật hồ sơ cá nhân thành công.");
      
      if (user) {
        setUser({ ...user, username: editUsername.trim(), email: editEmail.trim() });
      }
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật thông tin hồ sơ.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <PageLoader message="Đang tải thông tin hồ sơ..." />;
  }

  return (
    <Layout isLoggedIn username={user?.username || 'User'} showBottomNav>
      <Seo title="Thong Tin Ca Nhan" description="Xem va chinh sua ho so ca nhan cua ban trong The Unraveller." keywords="ho so, profile, tai khoan, nguoi hoc" canonical="/profile" noIndex />
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24">
        {/* Top Header Row with Username & Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
              <span className="text-purple-brand">👤</span> THÔNG TIN CÁ NHÂN
            </h1>
            <p className="text-white/45 text-xs font-mono uppercase tracking-wider mt-1">
              Trạng thái tài khoản: Hoạt động
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-purple-brand/45 rounded-xl text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-brand/20 hover:bg-purple-brand text-purple-brand hover:text-white border border-purple-brand/40 hover:border-transparent rounded-xl text-xs font-mono uppercase tracking-wider transition-all font-bold"
            >
              Khóa Học
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-2xl flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: User details, membership card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Identity Card */}
            <div className="ur-card p-6 rounded-2xl border border-purple-brand/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-brand/10 to-transparent pointer-events-none rounded-bl-full" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-brand to-purple-light flex items-center justify-center text-3xl shadow-glow-purple border border-white/10">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg leading-tight truncate">{user?.username}</h3>
                  <div className="flex items-center justify-between mt-1">
                    {user?.isPremium ? (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-400">
                        PREMIUM
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                        BASIC
                      </span>
                    )}
                    <button
                      onClick={handleStartEdit}
                      className="text-[10px] font-mono text-cyan-brand hover:underline font-bold"
                    >
                      [Sửa hồ sơ]
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/40 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Cấp độ học lực:</span>
                  <span className="text-cyan-brand font-bold">Cấp {Math.floor((user?.xpBalance || 0) / 1000) + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Trình độ CEFR:</span>
                  <select
                    value={user?.englishLevel || 'B1'}
                    onChange={handleLevelChange}
                    className="bg-navy-3 border border-white/10 text-cyan-brand rounded px-2 py-0.5 text-xs outline-none focus:border-cyan-brand/50 cursor-pointer font-bold font-mono"
                  >
                    <option value="A1">A1 - Sơ cấp (A1)</option>
                    <option value="A2">A2 - Sơ trung cấp (A2)</option>
                    <option value="B1">B1 - Trung cấp (B1)</option>
                    <option value="B2">B2 - Trung cấp trên (B2)</option>
                    <option value="C1">C1 - Cao cấp (C1)</option>
                    <option value="C2">C2 - Thành thạo (C2)</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ngày gia nhập:</span>
                  <span className="text-white/70">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Không rõ'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Bento Box */}
            <div className="grid grid-cols-2 gap-4">
              {/* Energy */}
              <div className="ur-card p-4 rounded-xl border border-white/5 bg-navy-3 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/45 text-[10px] font-mono uppercase tracking-wider">Năng lượng</span>
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{user?.energy}/{user?.maxEnergy}</p>
                  <p className="text-white/30 text-[9px] font-mono mt-1 uppercase">Tự phục hồi theo thời gian</p>
                </div>
              </div>

              {/* Streak */}
              <div className="ur-card p-4 rounded-xl border border-white/5 bg-navy-3 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/45 text-[10px] font-mono uppercase tracking-wider">Chuỗi ngày</span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{user?.streakCount} ngày</p>
                  <p className="text-white/30 text-[9px] font-mono mt-1 uppercase">Chuỗi hoạt động liên tiếp</p>
                </div>
              </div>

              {/* XP Balance */}
              <div className="ur-card p-4 rounded-xl border border-white/5 bg-navy-3 flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/45 text-[10px] font-mono uppercase tracking-wider">Hồ sơ XP</span>
                  <Star className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-white font-bold text-2xl tracking-tight">{user?.xpBalance}</p>
                  <span className="text-white/30 text-xs font-mono uppercase">Tổng XP</span>
                </div>
                {/* Visual indicator of next level */}
                <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-cyan-brand rounded-full shadow-glow-cyan"
                    style={{ width: `${((user?.xpBalance || 0) % 1000) / 10}%` }}
                  />
                </div>
                <p className="text-white/30 text-[9px] font-mono mt-1.5 text-right uppercase">
                  Còn {1000 - ((user?.xpBalance || 0) % 1000)} XP để lên cấp bậc tiếp theo
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Inventory Items & Payments History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificates Container */}
            <div className="ur-card p-6 rounded-2xl border border-white/5 bg-navy-2">
              <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-cyan-brand" /> CHỨNG CHỈ GIẢI MÃ
              </h2>

              {(user?.missionProgresses?.filter(p => p.status === 'Completed' || p.completedAt != null) || []).length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white/5 border border-white/5">
                  <p className="text-white/45 text-xs font-mono">Bạn chưa sở hữu chứng chỉ giải mã nào.</p>
                  <p className="text-white/25 text-[10px] font-mono mt-1 uppercase">Hoàn thành các kịch bản với điểm nghi ngờ dưới 50% để nhận chứng nhận</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="mt-4 px-5 py-2 bg-cyan-brand/20 hover:bg-cyan-brand border border-cyan-brand/40 hover:text-black text-cyan-brand rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all"
                  >
                    Giải Mã Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(user?.missionProgresses?.filter(p => p.status === 'Completed' || p.completedAt != null) || []).map((p) => (
                    <div
                      key={p.missionId}
                      className="p-4 rounded-xl bg-navy-3 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-cyan-brand/35 transition-all animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-brand/10 border border-cyan-brand/20 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                          📜
                        </div>
                        <div>
                          <h4 className="text-white text-xs font-bold leading-snug">
                            {missionNames[p.missionId] || `Kịch bản Stage ${p.missionId}`}
                          </h4>
                          <p className="text-white/45 text-[9px] font-mono mt-0.5 uppercase tracking-wide">
                            Mã: {p.completionToken || `UNRV-SEED-${user?.id || 2}-${p.missionId}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/certificate/${p.completionToken || `UNRV-SEED-${user?.id || 2}-${p.missionId}`}`)}
                        className="px-4 py-2 bg-cyan-brand/15 hover:bg-cyan-brand border border-cyan-brand/35 text-cyan-brand hover:text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(6,182,212,0.05)] text-center shrink-0"
                      >
                        Xem & Chia Sẻ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inventory Container */}
            <div className="ur-card p-6 rounded-2xl border border-white/5 bg-navy-2">
              <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-purple-brand" /> KHO ĐỒ CỦA BẠN
              </h2>

              {inventory.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white/5 border border-white/5">
                  <p className="text-white/40 text-xs font-mono">Không tìm thấy vật phẩm nào trong kho đồ của bạn.</p>
                  <p className="text-white/25 text-[10px] font-mono mt-1 uppercase">Mua các công cụ hỗ trợ trong cửa hàng để vượt qua các thử thách dễ dàng hơn</p>
                  <button
                    onClick={() => navigate('/market')}
                    className="mt-4 px-5 py-2 bg-purple-brand hover:bg-purple-brand/80 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all"
                  >
                    Ghé Cửa Hàng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {inventory.map((item, index) => (
                    <div
                      key={item.itemId}
                      className="p-3.5 rounded-xl bg-navy-3 border border-white/5 flex items-center gap-3.5 hover:border-purple-brand/30 transition-all"
                    >
                      <div className="w-11 h-11 rounded-lg bg-purple-brand/10 border border-purple-brand/20 flex items-center justify-center text-xl">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-xs font-bold truncate leading-snug">{item.name}</h4>
                        <p className="text-white/40 text-[10px] line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                      <div className="px-2 py-1 bg-white/5 rounded-md border border-white/10 text-center min-w-[32px]">
                        <span className="text-white/30 text-[8px] font-mono uppercase block leading-none">SL</span>
                        <span className="text-cyan-brand font-bold text-xs font-mono">{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Logs */}
            <div className="ur-card p-6 rounded-2xl border border-white/5 bg-navy-2">
              <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-cyan-brand" /> LỊCH SỬ GIAO DỊCH
              </h2>

              {payments.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-white/5 border border-white/5">
                  <p className="text-white/40 text-xs font-mono">Chưa có bản ghi giao dịch nào cho tài khoản này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-wider">
                        <th className="pb-3.5 font-bold">Mã Giao Dịch</th>
                        <th className="pb-3.5 font-bold">Gói dịch vụ</th>
                        <th className="pb-3.5 font-bold">Số tiền</th>
                        <th className="pb-3.5 font-bold">Trạng thái</th>
                        <th className="pb-3.5 font-bold text-right">Ngày lập</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {payments.map((pay) => {
                        const statusColors: Record<string, string> = {
                          success: 'bg-green-500/10 border border-green-500/30 text-green-400',
                          completed: 'bg-green-500/10 border border-green-500/30 text-green-400',
                          failed: 'bg-red-500/10 border border-red-500/30 text-red-400',
                          pending: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
                          created: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
                        };

                        const statusLabels: Record<string, string> = {
                          success: 'THÀNH CÔNG',
                          completed: 'HOÀN TẤT',
                          failed: 'THẤT BẠI',
                          pending: 'ĐANG XỬ LÝ',
                          created: 'ĐÃ KHỞI TẠO',
                        };

                        return (
                          <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-semibold text-white/70 max-w-[120px] truncate" title={pay.orderId}>
                              {pay.orderId || `TX-${pay.id}`}
                            </td>
                            <td className="py-3 font-bold uppercase text-[10px]">
                              {pay.planId}
                            </td>
                            <td className="py-3 font-bold text-cyan-brand">
                              {pay.amount.toLocaleString()}₫
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${statusColors[pay.status.toLowerCase()] || 'bg-white/10 border border-white/20 text-white/70'}`}>
                                {statusLabels[pay.status.toLowerCase()] || pay.status}
                              </span>
                            </td>
                            <td className="py-3 text-right text-white/40">
                              {new Date(pay.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-md bg-navy-2 border border-purple-brand/30 p-8 rounded-2xl relative shadow-glow-purple animate-fade-in">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="text-purple-brand">⚡</span> Cập Nhật Thông Tin Cá Nhân
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-xs uppercase mb-2 text-white/60">Tên người học (Username)</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="ur-input"
                  placeholder="AG_USER_X"
                />
              </div>
              <div>
                <label className="block text-xs uppercase mb-2 text-white/60">Email người học</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="ur-input"
                  placeholder="AGENT@UNRAVELLER.IO"
                />
              </div>
 
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all uppercase text-xs font-bold font-mono bg-transparent"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-full bg-gradient-brand text-white font-bold uppercase hover:opacity-90 transition-all text-xs font-mono shadow-glow-purple disabled:opacity-50"
                >
                  {savingProfile ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserProfile;
