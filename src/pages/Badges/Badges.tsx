import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { useGameStore } from '../../store/useGameStore';

interface Badge {
  id: number;
  name: string;
  desc: string;
  earned: boolean;
  color: string;
}

const BadgeCell = ({ badge }: { badge: Badge }) => (
  <div
    id={`badge-cell-${badge.id}`}
    title={badge.earned ? `${badge.name}: ${badge.desc}` : 'Hoàn thành thêm màn chơi để mở khóa'}
    className={`rounded-xl aspect-square flex flex-col items-center justify-center transition-all ${
      badge.earned
        ? 'bg-gradient-to-br from-purple-800/60 to-purple-900/40 border border-purple-500/40 cursor-pointer hover:border-purple-400/70 hover:shadow-[0_0_16px_rgba(124,58,237,0.3)]'
        : 'bg-purple-900/25 border border-purple-900/30'
    }`}
  >
    {badge.earned ? (
      <div className="badge-shine flex flex-col items-center">
        <svg width="42" height="50" viewBox="0 0 44 52" fill="none">
          <rect x="14" y="30" width="7" height="22" fill="#dc2626" transform="rotate(-5 14 30)" rx="1" />
          <rect x="23" y="30" width="7" height="22" fill="#dc2626" transform="rotate(5 23 30)" rx="1" />
          <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill={badge.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <polygon points="22,8 35,15 35,29 22,36 9,29 9,15" fill={badge.color} opacity="0.5" />
          <text x="22" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">★</text>
          <circle cx="36" cy="10" r="2" fill="white" opacity="0.6" />
        </svg>
      </div>
    ) : (
      <span className="text-white/15 text-2xl">🔒</span>
    )}
  </div>
);

const Badges = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const badges: Badge[] = [
    { 
      id: 1, 
      name: 'Huy hiệu Chiến thắng Đầu tiên', 
      desc: 'Hoàn thành màn chơi đầu tiên của bạn.', 
      earned: user?.missionProgresses?.some(p => p.status === 'Completed') ?? false, 
      color: '#f5c842' 
    },
    { 
      id: 2, 
      name: 'Bậc thầy Cà phê', 
      desc: 'Hoàn thành Stage 1.', 
      earned: user?.missionProgresses?.some(p => p.missionId === 1 && p.status === 'Completed') ?? false, 
      color: '#a78bfa' 
    },
    { 
      id: 3, 
      name: 'Học nhanh siêu tốc', 
      desc: 'Hoàn thành từ 3 màn chơi trở lên.', 
      earned: (user?.missionProgresses?.filter(p => p.status === 'Completed').length ?? 0) >= 3, 
      color: '#34d399' 
    },
    { 
      id: 4, 
      name: 'Thám tử Tinh mắt', 
      desc: 'Hoàn thành màn chơi Thám tử Điều tra (Stage 5).', 
      earned: user?.missionProgresses?.some(p => p.missionId === 5 && p.status === 'Completed') ?? false, 
      color: '#60a5fa' 
    },
    { 
      id: 5, 
      name: 'Đặc vụ Cao cấp (Premium)', 
      desc: 'Sở hữu tài khoản đặc quyền Premium.', 
      earned: user?.isPremium ?? false, 
      color: '#dc2626' 
    },
    { 
      id: 6, 
      name: 'Bậc thầy Chuỗi ngày', 
      desc: 'Duy trì chuỗi học tập liên tục từ 7 ngày.', 
      earned: (user?.streakCount ?? 0) >= 7, 
      color: '#f97316' 
    },
    { 
      id: 7, 
      name: 'Giao tiếp Tự tin', 
      desc: 'Vượt qua thành công 5 màn chơi trở lên.', 
      earned: (user?.missionProgresses?.filter(p => p.status === 'Completed').length ?? 0) >= 5, 
      color: '#ec4899' 
    },
    { 
      id: 8, 
      name: 'Đặc vụ Ưu tú', 
      desc: 'Hoàn thành tất cả các màn chơi hiện có.', 
      earned: user?.missionProgresses?.filter(p => p.status === 'Completed').length === (user?.missionProgresses?.length ?? 0) && (user?.missionProgresses?.length ?? 0) > 0, 
      color: '#8b5cf6' 
    },
    { 
      id: 9, 
      name: 'Người kể chuyện', 
      desc: 'Hoàn thành màn chơi Storytelling (Stage 4).', 
      earned: user?.missionProgresses?.some(p => p.missionId === 4 && p.status === 'Completed') ?? false, 
      color: '#14b8a6' 
    },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'}>
    <Seo title="Bo Suu Tap Huy Chuong" description="Xem bo suu tap huy chuong cua ban trong The Unraveller. Hoan thanh cac man choi de mo khoa tat ca huy chuong." keywords="huy chuong, bo suu tap, thanh tuu, gamification" canonical="/badges" noIndex />
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        <div className="ur-card rounded-2xl p-6 md:p-8">
          <h1 className="text-white text-2xl font-bold text-center mb-1">Bộ Sưu Tập Của Bạn</h1>
          <p className="text-white/45 text-sm text-center mb-7">
            Hoàn thành thêm các màn chơi để nhận huy chương
          </p>

          {/* Badge grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {badges.map(badge => (
              <BadgeCell key={badge.id} badge={badge} />
            ))}
          </div>

          {/* First badge info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/30 border border-purple-700/30 mb-7">
            <div className="badge-shine flex-shrink-0">
              <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
                <rect x="14" y="30" width="7" height="22" fill="#dc2626" transform="rotate(-5 14 30)" rx="1" />
                <rect x="23" y="30" width="7" height="22" fill="#dc2626" transform="rotate(5 23 30)" rx="1" />
                <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="#f5c842" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <polygon points="22,8 35,15 35,29 22,36 9,29 9,15" fill="#f5c842" opacity="0.5" />
                <text x="22" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">★</text>
                <circle cx="36" cy="10" r="2" fill="white" opacity="0.6" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Huy hiệu Chiến thắng Đầu tiên</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed">
                Được trao khi hoàn thành màn chơi đầu tiên của bạn. Cuộc hành trình của bạn bắt đầu từ đây!
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
    </Layout>
  );
};

export default Badges;
