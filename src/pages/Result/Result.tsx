import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Zap, Award, RotateCcw, Home, TrendingUp } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { XPBar } from '../../components/common/GameStats';
import { getLeaderboard } from '../../services/api';
import type { LeaderboardEntry } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';

/* ─── Medal data ─── */
const medals: Record<string, { name: string; desc: string; color: string; emoji: string }> = {
  '1': {
    name: '"Huy chương Chiến thắng Đầu tiên"',
    emoji: '🏅',
    desc: 'Được trao khi hoàn thành màn chơi đầu tiên của bạn. Đây là dấu mốc khởi đầu hành trình học tập đầy lòng quả cảm, tò mò và ý chí vươn lên. Mọi huyền thoại học tập đều bắt đầu từ một bước đi đầu tiên.',
    color: '#f5c842',
  },
  '2': {
    name: '"Bậc Thầy Lắng Nghe"',
    emoji: '🎧',
    desc: 'Được trao khi hoàn thành xuất sắc tất cả các hướng dẫn một cách chính xác. Khả năng lắng nghe của bạn là một tài sản vô cùng quý giá trong bất kỳ môi trường giao tiếp tiếng Anh nào.',
    color: '#a78bfa',
  },
  '5': {
    name: '"Thám Tử Có Mắt Tinh Tường"',
    emoji: '🔍',
    desc: 'Được trao khi hoàn thành màn chơi Viết lách Thám tử. Kỹ năng quan sát và diễn đạt của bạn đã giải mã bí ẩn một cách đầy phong cách.',
    color: '#60a5fa',
  },
};

/* Leaderboard data fetched from server API */

/* ─── SVG Medal ─── */
const MedalSVG = ({ color }: { color: string }) => (
  <svg width="90" height="108" viewBox="0 0 90 108" fill="none">
    <rect x="28" y="60" width="12" height="46" rx="3" fill="#dc2626" transform="rotate(-7 28 60)" />
    <rect x="50" y="60" width="12" height="46" rx="3" fill="#dc2626" transform="rotate(7 50 60)" />
    <ellipse cx="45" cy="52" rx="26" ry="5" fill="rgba(0,0,0,0.2)" />
    <polygon points="45,6 76,23 76,57 45,74 14,57 14,23" fill={color} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    <polygon points="45,14 68,27 68,53 45,66 22,53 22,27" fill={color} opacity="0.45" />
    <defs>
      <linearGradient id="mShine" x1="14" y1="6" x2="76" y2="60">
        <stop stopColor="white" stopOpacity="0.5" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon points="45,14 68,27 68,53 45,66 22,53 22,27" fill="url(#mShine)" />
    <text x="45" y="47" textAnchor="middle" fontSize="22" fill="white" fontWeight="bold">★</text>
    <circle cx="68" cy="20" r="3" fill="white" opacity="0.65" />
    <circle cx="60" cy="12" r="1.5" fill="white" opacity="0.4" />
  </svg>
);

/* ─── Star ─── */
const StarSVG = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <polygon points="30,5 36,22 54,22 40,34 46,52 30,41 14,52 20,34 6,22 24,22" fill="#f5c842" stroke="#e0a800" strokeWidth="1" />
    <polygon points="30,12 34,22 45,22 37,29 40,40 30,34 20,40 23,29 15,22 26,22" fill="#fde68a" opacity="0.5" />
  </svg>
);

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useGameStore();
  const username = user?.username || 'Learner';

  const status = searchParams.get('status');
  const earnedXP = parseInt(searchParams.get('xp') || '0', 10) || 150;
  const isSuccess = status === 'success';
  const medal = medals[id || '1'] || medals['1'];
  const xp = user?.xpBalance || 0;

  const [starsShown, setStarsShown] = useState([false, false, false]);
  const [xpAnimated, setXpAnimated] = useState(0);
  const [showLeader, setShowLeader] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (isSuccess) {
      getLeaderboard()
        .then(data => setLeaderboardData(data))
        .catch(err => console.error("Failed to load dynamic leaderboard data:", err));
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isSuccess) return;
    // Stars
    [0, 1, 2].forEach(i => setTimeout(() => setStarsShown(p => { const n = [...p]; n[i] = true; return n; }), 200 + i * 280));
    // XP counter animation
    let current = 0;
    const step = Math.ceil(earnedXP / 30);
    const timer = setInterval(() => {
      current = Math.min(current + step, earnedXP);
      setXpAnimated(current);
      if (current >= earnedXP) { clearInterval(timer); setTimeout(() => setShowLeader(true), 400); }
    }, 40);
    return () => clearInterval(timer);
  }, [isSuccess, earnedXP]);

  /* ── FAILURE ── */
  if (!isSuccess) {
    return (
      <Layout isLoggedIn username={username}>
        <div className="max-w-screen-sm mx-auto px-4 py-10">
          <div className="ur-card rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center mx-auto mb-5 text-4xl">
              😰
            </div>
            <h1 className="font-heading font-black text-3xl text-white mb-2">Bị phát hiện!</h1>
            <p className="text-white/55 text-sm leading-relaxed mb-3 max-w-xs mx-auto">
              Mức nghi ngờ chạm 100%. Hãy thử nói các câu dài và tự nhiên hơn lần sau nhé.
            </p>
            <div className="badge badge-danger mx-auto mb-7 inline-flex">NGhi NGờ 100%</div>

            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => navigate(`/scenario/${id || '1'}`)} className="btn btn-primary" id="result-retry">
                <RotateCcw size={16} /> Thử lại
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline" id="result-courses">
                <Home size={16} /> Trang chủ
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── SUCCESS ── */
  return (
    <Layout isLoggedIn username="USERNAME">
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="ur-card rounded-3xl p-6 md:p-8 animate-fade-in">
          {/* Title */}
          <h1 className="font-heading font-black text-3xl text-white text-center mb-5">
            Chúc mừng! 🎉
          </h1>

          {/* Stars */}
          <div className="flex justify-center items-end gap-2 mb-4">
            {[{ d: 0, s: 52 }, { d: 280, s: 64 }, { d: 560, s: 52 }].map((cfg, i) => (
              <div
                key={i}
                className={cfg.s === 64 ? 'mb-[-6px]' : ''}
                style={{
                  opacity: starsShown[i] ? 1 : 0,
                  animation: starsShown[i] ? 'starPop 0.5s ease forwards' : 'none',
                  animationDelay: `${cfg.d}ms`,
                }}
              >
                <StarSVG size={cfg.s} />
              </div>
            ))}
          </div>

          <p className="text-white/65 text-sm text-center mb-5">
            Bạn đã hoàn thành chương trình — đây là phần thưởng của bạn!
          </p>

          {/* ── XP gained ── */}
          <div
            className="flex items-center justify-center gap-3 p-4 rounded-2xl mb-5 animate-bounce-in"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Zap size={28} className="text-xp-orange" />
            <div>
              <div className="font-heading font-black text-3xl text-gradient-gold">+{xpAnimated} XP</div>
              <div className="text-white/50 text-xs">Kinh nghiệm nhận được trong phiên này</div>
            </div>
          </div>

          {/* XP to next level */}
          <div className="mb-5">
            <XPBar current={xp % 1000} max={1000} />
            <p className="text-white/35 text-xs text-center mt-1">
              {1000 - (xp % 1000) > 0 ? `Còn ${(1000 - (xp % 1000)).toLocaleString()} XP để lên cấp ${Math.floor(xp / 1000) + 2}` : '🎊 Lên cấp!'}
            </p>
          </div>

          {/* ── Medal ── */}
          <div
            className="flex items-start gap-4 rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(46,42,93,0.6)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <div className="badge-shine flex-shrink-0">
              <MedalSVG color={medal.color} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{medal.emoji}</span>
                <Award size={14} className="text-gold" />
                <span className="badge badge-xp text-[10px]">NEW!</span>
              </div>
              <h3 className="font-heading font-bold text-white text-sm mb-1.5">{medal.name}</h3>
              <p className="text-white/60 text-xs leading-relaxed">{medal.desc}</p>
            </div>
          </div>

          {/* ── Mini Leaderboard ── */}
          {showLeader && (
            <div className="mb-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-cyan-brand" />
                <h3 className="font-heading font-semibold text-white text-sm">Bảng xếp hạng</h3>
              </div>
              <div className="space-y-2">
                {leaderboardData.map(player => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${player.isYou
                        ? 'bg-purple-brand/25 border border-purple-brand/40'
                        : 'bg-white/4'
                      }`}
                  >
                    <span className="text-base w-6 text-center">{player.badge}</span>
                    <span className={`flex-1 text-sm font-semibold ${player.isYou ? 'text-purple-soft' : 'text-white/75'}`}>
                      {player.name}
                    </span>
                    <span className={`text-sm font-bold ${player.isYou ? 'text-xp-orange' : 'text-white/45'}`}>
                      {player.xp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/')} className="btn btn-primary" id="result-continue">
              Tiếp tục
            </button>
            <button onClick={() => navigate('/badges')} className="btn btn-outline" id="result-badges">
              <Award size={15} /> Xem huy hiệu
            </button>
            <button onClick={() => navigate(`/scenario/${id || '1'}`)} className="btn btn-ghost btn-sm" id="result-replay">
              <RotateCcw size={14} /> Chơi lại
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Result;
