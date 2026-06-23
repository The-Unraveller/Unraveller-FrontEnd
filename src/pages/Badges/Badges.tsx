import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Award, ExternalLink, Calendar, Zap, Shield, Flame } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';

interface Badge {
  id: number;
  name: string;
  desc: string;
  earned: boolean;
  color: string;
  emoji: string;
  missionId?: number;
}

const BadgeCell = ({ badge, onClick }: { badge: Badge; onClick: () => void }) => (
  <div
    id={`badge-cell-${badge.id}`}
    onClick={onClick}
    title={badge.earned ? `${badge.name}: ${badge.desc} (Bấm để xem chi tiết)` : 'Hoàn thành thêm màn chơi để mở khóa'}
    className={`rounded-xl aspect-square flex flex-col items-center justify-center transition-all ${
      badge.earned
        ? 'bg-gradient-to-br from-purple-800/60 to-purple-900/40 border border-purple-500/40 cursor-pointer hover:border-purple-400/70 hover:shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:-translate-y-1'
        : 'bg-purple-900/25 border border-purple-900/30'
    }`}
  >
    {badge.earned ? (
      <div className="badge-shine flex flex-col items-center">
        <svg width="48" height="56" viewBox="0 0 44 52" fill="none">
          <rect x="14" y="30" width="7" height="22" fill="#dc2626" transform="rotate(-5 14 30)" rx="1" />
          <rect x="23" y="30" width="7" height="22" fill="#dc2626" transform="rotate(5 23 30)" rx="1" />
          <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill={badge.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <polygon points="22,8 35,15 35,29 22,36 9,29 9,15" fill={badge.color} opacity="0.5" />
          <text x="22" y="29" textAnchor="middle" fontSize="14" fill="white">{badge.emoji}</text>
          <circle cx="36" cy="10" r="2" fill="white" opacity="0.6" />
        </svg>
      </div>
    ) : (
      <div className="flex flex-col items-center opacity-30">
        <span className="text-2xl mb-1">🔒</span>
        <span className="text-[8px] font-mono text-purple-soft/50 uppercase tracking-widest">{badge.emoji}</span>
      </div>
    )}
  </div>
);

// Map missionId to course name
const missionNames: Record<number, string> = {
  1: "Stage 1: Giao tiếp tại Quán Cà phê",
  2: "Stage 2: Làm theo Chỉ dẫn",
  3: "Stage 3: Tranh luận & Đàm phán",
  4: "Stage 4: Phỏng vấn Xin việc",
  5: "Stage 5: Báo cáo Điều tra",
  6: "Stage 6: Nhập vai Nâng cao"
};

const Badges = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Retrieve the first completed progress if a general badge needs a certificate link fallback
  const firstCompletedProgress = user?.missionProgresses?.find(p => p.status === 'Completed' || p.completedAt != null);

  const badges: Badge[] = [
    { 
      id: 1, 
      name: 'Huy hiệu Chiến thắng Đầu tiên', 
      desc: 'Hoàn thành kịch bản mô phỏng đầu tiên của bạn. Chào mừng bạn gia nhập cộng đồng người học!', 
      earned: user?.missionProgresses?.some(p => p.status === 'Completed' || p.completedAt != null) ?? false, 
      color: '#f5c842',
      emoji: '🏆',
      missionId: firstCompletedProgress?.missionId // dynamically bind to first completed mission
    },
    { 
      id: 2, 
      name: 'Bậc thầy Cà phê', 
      desc: 'Hoàn thành xuất sắc Stage 1: Giao tiếp tại Quán Cà phê.', 
      earned: user?.missionProgresses?.some(p => p.missionId === 1 && (p.status === 'Completed' || p.completedAt != null)) ?? false, 
      color: '#a78bfa',
      emoji: '☕',
      missionId: 1
    },
    { 
      id: 3, 
      name: 'Học nhanh siêu tốc', 
      desc: 'Hoàn thành từ 3 kịch bản mô phỏng trở lên trong hệ thống.', 
      earned: (user?.missionProgresses?.filter(p => p.status === 'Completed' || p.completedAt != null).length ?? 0) >= 3, 
      color: '#34d399',
      emoji: '⚡'
    },
    { 
      id: 4, 
      name: 'Người báo cáo Chi tiết', 
      desc: 'Hoàn thành xuất sắc kịch bản Báo cáo Sự cố Công việc (Stage 5).', 
      earned: user?.missionProgresses?.some(p => p.missionId === 5 && (p.status === 'Completed' || p.completedAt != null)) ?? false, 
      color: '#60a5fa',
      emoji: '📝',
      missionId: 5
    },
    { 
      id: 5, 
      name: 'Thành viên Cao cấp (Premium)', 
      desc: 'Sở hữu đặc quyền hội viên Premium VIP không giới hạn năng lượng.', 
      earned: user?.isPremium ?? false, 
      color: '#dc2626',
      emoji: '🛡️'
    },
    { 
      id: 6, 
      name: 'Bậc thầy Chuỗi ngày', 
      desc: 'Duy trì chuỗi học tập liên tục từ 7 ngày để rèn luyện tư duy phản xạ tiếng Anh nhạy bén.', 
      earned: (user?.streakCount ?? 0) >= 7, 
      color: '#f97316',
      emoji: '🔥'
    },
    { 
      id: 7, 
      name: 'Giao tiếp Tự tin', 
      desc: 'Hoàn thành 5 kịch bản mô phỏng trở lên trong hệ thống.', 
      earned: (user?.missionProgresses?.filter(p => p.status === 'Completed' || p.completedAt != null).length ?? 0) >= 5, 
      color: '#ec4899',
      emoji: '💬'
    },
    { 
      id: 8, 
      name: 'Người học Xuất sắc', 
      desc: 'Hoàn thành toàn bộ kịch bản mô phỏng có sẵn trên Unraveller.', 
      earned: user?.missionProgresses?.filter(p => p.status === 'Completed' || p.completedAt != null).length === (user?.missionProgresses?.length ?? 0) && (user?.missionProgresses?.length ?? 0) > 0, 
      color: '#8b5cf6',
      emoji: '🌌'
    },
    { 
      id: 9, 
      name: 'Người kể chuyện', 
      desc: 'Hoàn thành xuất sắc kịch bản Stage 4: Phỏng vấn Xin việc.', 
      earned: user?.missionProgresses?.some(p => p.missionId === 4 && (p.status === 'Completed' || p.completedAt != null)) ?? false, 
      color: '#14b8a6',
      emoji: '👔',
      missionId: 4
    },
  ];

  // Helper selectors for modal
  const getCompletionProgress = (badge: Badge) => {
    if (!badge.missionId) return null;
    return user?.missionProgresses?.find(p => p.missionId === badge.missionId && (p.status === 'Completed' || p.completedAt != null));
  };

  const getCompletionToken = (badge: Badge) => {
    const prog = getCompletionProgress(badge);
    return prog?.completionToken || (prog ? `UNRV-SEED-${user?.id || 2}-${badge.missionId}` : undefined);
  };

  const getCompletionDate = (badge: Badge) => {
    const prog = getCompletionProgress(badge);
    if (!prog) return null;
    const date = prog.completedAt || user?.createdAt;
    return date ? new Date(date).toLocaleDateString('vi-VN') : null;
  };

  const getCompletionXP = (badge: Badge) => {
    const prog = getCompletionProgress(badge);
    return prog ? prog.xpEarned : null;
  };

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'}>
      <Seo 
        title="Bo Suu Tap Huy Chuong" 
        description="Xem bo suu tap huy chuong cua ban trong The Unraveller. Hoan thanh cac man choi de mo khoa tat ca huy chuong." 
        keywords="huy chuong, bo suu tap, thanh tuu, gamification" 
        canonical="/badges" 
        noIndex 
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="ur-card rounded-2xl p-6 md:p-8">
          <h1 className="text-white text-2xl font-bold text-center mb-1">Bộ Sưu Tập Của Bạn</h1>
          <p className="text-white/45 text-sm text-center mb-7">
            Hoàn thành các màn chơi kịch bản và thử thách để mở khóa huy chương. Bấm vào huy chương đã mở khóa để xem chi tiết.
          </p>

          {/* Badge grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
            {badges.map(badge => (
              <BadgeCell 
                key={badge.id} 
                badge={badge} 
                onClick={() => badge.earned && setSelectedBadge(badge)}
              />
            ))}
          </div>

          {/* Bottom decorative preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/30 border border-purple-700/30 mb-7">
            <div className="badge-shine flex-shrink-0">
              <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
                <rect x="14" y="30" width="7" height="22" fill="#dc2626" transform="rotate(-5 14 30)" rx="1" />
                <rect x="23" y="30" width="7" height="22" fill="#dc2626" transform="rotate(5 23 30)" rx="1" />
                <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="#f5c842" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <polygon points="22,8 35,15 35,29 22,36 9,29 9,15" fill="#f5c842" opacity="0.5" />
                <text x="22" y="29" textAnchor="middle" fontSize="14" fill="white">🏆</text>
                <circle cx="36" cy="10" r="2" fill="white" opacity="0.6" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Hệ Thống Danh Hiệu Thành Tích</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed font-sans">
                Các học viên sau khi hoàn thành các tình huống giả lập giao tiếp sẽ được nhận huy hiệu đặc trưng tương ứng với các cột mốc tiến trình học tập.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="ur-btn-primary px-7 py-3 rounded-full font-bold"
              id="badges-next-btn"
            >
              Tiếp tục
            </button>
            <button
              onClick={() => navigate('/')}
              className="ur-btn-outline px-7 py-3 rounded-full font-bold"
              id="badges-home-btn"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </div>

      {/* Cyberpunk Modal for Badge details */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-md bg-[#0a0715] border border-purple-500/35 p-6 md:p-8 rounded-3xl relative shadow-[0_0_50px_rgba(124,58,237,0.25)] animate-fade-in text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Shield / Medal Icon in Modal */}
            <div className="w-24 h-28 mx-auto mb-5 flex items-center justify-center relative">
              <svg width="88" height="104" viewBox="0 0 44 52" fill="none" className="drop-shadow-[0_0_20px_rgba(124,58,237,0.35)]">
                <rect x="14" y="30" width="7" height="22" fill="#dc2626" transform="rotate(-5 14 30)" rx="1" />
                <rect x="23" y="30" width="7" height="22" fill="#dc2626" transform="rotate(5 23 30)" rx="1" />
                <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill={selectedBadge.color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <polygon points="22,8 35,15 35,29 22,36 9,29 9,15" fill={selectedBadge.color} opacity="0.55" />
                <text x="22" y="29" textAnchor="middle" fontSize="15" fill="white">{selectedBadge.emoji}</text>
                <circle cx="36" cy="10" r="2.5" fill="white" opacity="0.75" />
              </svg>
              <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse pointer-events-none" />
            </div>

            <span className="text-[9px] font-bold text-cyan-brand bg-cyan-brand/10 border border-cyan-brand/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              HUY CHƯƠNG ĐÃ ĐẠT
            </span>

            <h3 className="text-white text-lg font-black mt-4 mb-2 uppercase tracking-wide">
              {selectedBadge.name}
            </h3>
            
            <p className="text-white/60 text-xs leading-relaxed font-sans mb-5">
              {selectedBadge.desc}
            </p>

            {/* Achievement details */}
            <div className="bg-black/45 border border-white/5 rounded-2xl p-4 text-left text-xs space-y-2 mb-6 font-mono">
              {selectedBadge.missionId && (
                <div className="flex justify-between">
                  <span className="text-white/40">Kịch bản giải mã:</span>
                  <span className="text-white font-semibold truncate max-w-[200px]" title={missionNames[selectedBadge.missionId]}>
                    {missionNames[selectedBadge.missionId] || `Stage ${selectedBadge.missionId}`}
                  </span>
                </div>
              )}
              {getCompletionDate(selectedBadge) && (
                <div className="flex justify-between">
                  <span className="text-white/40">Ngày đạt được:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Calendar size={12} className="text-purple-soft" />
                    {getCompletionDate(selectedBadge)}
                  </span>
                </div>
              )}
              {getCompletionXP(selectedBadge) && (
                <div className="flex justify-between">
                  <span className="text-white/40">Kinh nghiệm tích lũy:</span>
                  <span className="text-[#f5c842] font-bold flex items-center gap-0.5">
                    <Zap size={11} />
                    +{getCompletionXP(selectedBadge)} XP
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {getCompletionToken(selectedBadge) && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    navigate(`/certificate/${getCompletionToken(selectedBadge)}`);
                  }}
                  className="w-full py-2.5 bg-cyan-brand hover:bg-cyan-300 text-black text-xs font-black rounded-xl tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.15)] active:scale-95"
                >
                  <ExternalLink size={13} /> Xem Chứng Chỉ & Chia Sẻ
                </button>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-brand/50 text-white/70 hover:text-white text-xs font-black rounded-xl tracking-widest uppercase transition-all active:scale-95"
              >
                ĐÓNG
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Badges;
