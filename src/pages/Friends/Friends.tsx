import * as React from 'react';
import { useState } from 'react';
import { Users, Search, UserPlus, MessageSquare, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';
import { toast } from 'react-toastify';

const initialFriends = [
  { name: 'Minh Khôi',  status: 'Trực tuyến',      role: 'Học viên Ưu tú',        emoji: '👑', xp: 4800 },
  { name: 'Lan Anh',    status: 'Đang Luyện tập',   role: 'Học viên Xuất sắc',     emoji: '🥈', xp: 3950 },
  { name: 'Tuấn Khoa',  status: 'Ngoại tuyến',      role: 'Thành viên Tích cực',   emoji: '🥉', xp: 3200 },
  { name: 'Hoàng Long', status: 'Trực tuyến',        role: 'Học viên Tập sự',       emoji: '🏃‍♂️', xp: 950 },
];

const Friends = () => {
  const { user } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [pendingSent, setPendingSent] = useState<string[]>([]);
  const [messaged, setMessaged] = useState<string[]>([]);

  const filteredFriends = initialFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = () => {
    const target = inviteInput.trim();
    if (!target) {
      toast.warning('Vui lòng nhập tên hoặc email người học.');
      return;
    }
    if (pendingSent.includes(target)) {
      toast.info(`Lời mời đến "${target}" đã được gửi trước đó.`);
      return;
    }
    setPendingSent((prev) => [...prev, target]);
    setInviteInput('');
    toast.success(`✅ Lời mời kết bạn đã gửi đến "${target}"!`);
  };

  const handleMessage = (name: string) => {
    if (!messaged.includes(name)) {
      setMessaged((prev) => [...prev, name]);
    }
    toast.info(`💬 Đã mở hội thoại với ${name} (tính năng đang phát triển).`);
  };

  return (
    <Layout isLoggedIn username={user?.username || 'User'} showBottomNav>
      <Seo
        title="Mạng Lưới Bạn Bè"
        description="Quản lý mạng lưới bạn bè trong The Unraveller."
        keywords="bạn bè, mạng lưới, kết nối"
        canonical="/friends"
        noIndex
      />
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <Users className="text-purple-brand" /> MẠNG LƯỚI BẠN BÈ
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Duy trì kết nối hoạt động với những người học khác để cùng phối hợp thực hành giao tiếp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Friends list ── */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 mb-6">
              <h2 className="text-white font-bold text-base tracking-widest uppercase flex items-center gap-2">
                👥 BẠN BÈ ĐÃ LIÊN KẾT
              </h2>
              {/* Search bar */}
              <div className="ur-search w-full sm:w-60 flex-shrink-0">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-xs w-full"
                />
              </div>
            </div>

            {filteredFriends.length === 0 ? (
              <p className="text-white/40 text-xs py-8 text-center">Không tìm thấy người bạn nào khớp với bộ lọc.</p>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-navy-3 flex items-center justify-between hover:border-purple-brand/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{f.emoji}</span>
                      <div>
                        <h4 className="text-white text-xs font-bold leading-none mb-1 flex items-center gap-2">
                          {f.name}
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.status === 'Trực tuyến'
                                ? 'bg-green-400 animate-pulse'
                                : f.status === 'Đang Luyện tập'
                                ? 'bg-yellow-400'
                                : 'bg-white/10'
                            }`}
                          />
                        </h4>
                        <p className="text-white/40 text-[9px] uppercase leading-none">
                          {f.role} — {f.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-brand font-bold text-xs">{f.xp} XP</span>
                      <button
                        onClick={() => handleMessage(f.name)}
                        title="Nhắn tin"
                        className={`p-2 border rounded-lg text-white/60 hover:text-white transition-all ${
                          messaged.includes(f.name)
                            ? 'bg-purple-brand/15 border-purple-brand/35 text-purple-soft'
                            : 'bg-white/5 hover:bg-purple-brand/10 border-white/10 hover:border-purple-brand/35'
                        }`}
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Add friends card ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="ur-card p-6 bg-navy-2 border border-white/5">
              <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-brand" /> YÊU CẦU KẾT NỐI
              </h2>
              <p className="text-white/40 text-[10px] mb-4 uppercase">
                Nhập biệt danh hoặc email người học để gửi lời mời.
              </p>
              <div className="space-y-3">
                <input
                  className="ur-input"
                  placeholder="TEN_HOAC_EMAIL_NGUOI_HOC"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                />
                <button
                  onClick={handleSendRequest}
                  className="btn btn-primary w-full py-2.5 text-xs rounded-xl uppercase font-bold tracking-wider font-mono"
                >
                  Gửi Lời Mời
                </button>
              </div>

              {/* Pending invites list */}
              {pendingSent.length > 0 && (
                <div className="mt-5 border-t border-white/5 pt-4">
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mb-3">Đã gửi lời mời:</p>
                  <div className="space-y-2">
                    {pendingSent.map((name, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20"
                      >
                        <CheckCircle size={12} className="text-success flex-shrink-0" />
                        <span className="text-success text-[11px] font-semibold truncate">{name}</span>
                        <span className="ml-auto text-white/30 text-[9px] uppercase">Chờ xác nhận</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="ur-card p-5 bg-navy-2 border border-white/5">
              <h3 className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-3">Thống kê mạng lưới</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xl font-black text-white">{initialFriends.length}</div>
                  <div className="text-[9px] text-white/40 uppercase">Bạn bè</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-green-400">
                    {initialFriends.filter((f) => f.status === 'Trực tuyến').length}
                  </div>
                  <div className="text-[9px] text-white/40 uppercase">Trực tuyến</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-purple-soft">{pendingSent.length}</div>
                  <div className="text-[9px] text-white/40 uppercase">Đang chờ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Friends;
