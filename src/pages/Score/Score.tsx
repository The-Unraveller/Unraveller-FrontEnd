import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Award, Search, Sparkles } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';
import { getLeaderboard } from '../../services/api';
import type { LeaderboardEntry } from '../../services/api';

const Score = () => {
  const { user } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getLeaderboard()
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error('Failed to load leaderboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const badgeMock = [
    { 
      id: 1, 
      name: 'Gọi đồ uống tại Cafe', 
      desc: 'Vượt qua Ải 1 trò chuyện với Barista quán cà phê.', 
      earned: user?.missionProgresses?.some(p => p.missionId === 1 && p.status === 'Completed') ?? false, 
      emoji: '☕' 
    },
    { 
      id: 2, 
      name: 'Diễn đạt chính xác', 
      desc: 'Hoàn thành kịch bản báo cáo công việc (Stage 2).', 
      earned: user?.missionProgresses?.some(p => p.missionId === 2 && p.status === 'Completed') ?? false, 
      emoji: '📋' 
    },
    { 
      id: 3, 
      name: 'Thành viên Tích cực', 
      desc: 'Sử dụng thành công các công cụ hỗ trợ hoặc sở hữu gói Premium.', 
      earned: user?.isPremium || (user?.missionProgresses?.some(p => p.xpEarned > 50) ?? false), 
      emoji: '⚡' 
    },
    { 
      id: 4, 
      name: 'Nhà đàm phán', 
      desc: 'Hoàn thành màn đàm phán và thuyết phục (Stage 3).', 
      earned: user?.missionProgresses?.some(p => p.missionId === 3 && p.status === 'Completed') ?? false, 
      emoji: '💼' 
    },
    { 
      id: 5, 
      name: 'Cấp bậc Vàng', 
      desc: 'Tích lũy đạt tổng số dư 2,500 XP trở lên.', 
      earned: (user?.xpBalance ?? 0) >= 2500, 
      emoji: '👑' 
    },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'User'} showBottomNav>
    <Seo title="Bang Xep Hang" description="Xem bang xep hang toan cau cua cac hoc vien trong The Unraveller. So sanh diem XP va thanh tuu cua ban." keywords="bang xep hang, diem so, leaderboard, XP, global ranking" canonical="/score" noIndex />
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <Trophy className="text-gold" /> BẢNG XẾP HẠNG & ĐIỂM SỐ
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Bảng xếp hạng toàn cầu của các học viên hoạt động và danh hiệu thành tích đã đạt được.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Global Leaderboard */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              🏆 BẢNG XẾP HẠNG HỌC VIÊN TOÀN CẦU
            </h2>
            {loading ? (
              <p className="text-white/40 text-xs py-4 text-center">Đang tải danh sách học viên...</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      entry.isYou
                        ? 'bg-purple-brand/10 border-purple-brand/40 shadow-glow-purple/10'
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-6 text-center font-black text-sm ${entry.rank === 1 ? 'text-gold' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-orange-400' : 'text-white/40'}`}>
                        #{entry.rank}
                      </span>
                      <span className="text-lg">{entry.badge || '👤'}</span>
                      <span className="text-white font-bold text-xs truncate max-w-[150px] sm:max-w-xs">{entry.name}</span>
                      {entry.isYou && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-brand text-white">BẠN</span>
                      )}
                    </div>
                    <span className="text-cyan-brand font-bold text-xs">{entry.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges unlocked */}
          <div className="lg:col-span-1 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              🏅 HUY HIỆU THÀNH TỰU
            </h2>
            <div className="space-y-3">
              {badgeMock.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-colors ${
                    b.earned
                      ? 'bg-purple-brand/5 border-purple-brand/20 opacity-100'
                      : 'bg-white/5 border-white/5 opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${
                    b.earned ? 'bg-purple-brand/15 border-purple-brand/35 text-white' : 'bg-white/5 border-white/10 text-white/20'
                  }`}>
                    {b.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs font-bold leading-none">{b.name}</h4>
                    <p className="text-white/40 text-[9px] mt-1 leading-tight line-clamp-2">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Score;
