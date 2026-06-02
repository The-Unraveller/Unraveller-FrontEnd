import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, Zap, Lock, Star, TrendingUp,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { StreakBadge, StatPill } from '../../components/common/GameStats';
import XPBar from '../../components/common/GameStats';
import { getMissions } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';

/* ─── Mock user data ─── */
const USER_PROFILE = {
  name: 'Learner',
  avatar: '🎭',
  badges: 2,
  completedStages: 2,
};

/* ─── Scenarios ─── */
const scenarios = [
  {
    id: 1,
    stage: 1,
    label: 'STAGE 1',
    title: 'Trò chuyện Quán Cà phê',
    desc: 'Luyện tập gọi món, trò chuyện xã giao và đối thoại tự nhiên trong môi trường quán cà phê.',
    img: '/scenario_coffee.png',
    difficulty: 'Beginner',
    diffColor: 'badge-success',
    xpReward: 150,
    locked: false,
    completed: true,
    stars: 3,
  },
  {
    id: 2,
    stage: 2,
    label: 'STAGE 2',
    title: 'Làm theo Chỉ dẫn',
    desc: 'Lắng nghe, thấu hiểu các chỉ dẫn phức tạp và thực hiện nhiệm vụ với độ chính xác cao.',
    img: '/scenario_classroom.png',
    difficulty: 'Beginner',
    diffColor: 'badge-success',
    xpReward: 200,
    locked: false,
    completed: false,
    stars: 0,
  },
  {
    id: 3,
    stage: 3,
    label: 'STAGE 3',
    title: 'Biện luận & Đàm phán',
    desc: 'Bảo vệ quan điểm và đạt được thỏa thuận bằng tiếng Anh chuyên nghiệp.',
    img: '',
    difficulty: 'Intermediate',
    diffColor: 'badge-cyan',
    xpReward: 300,
    locked: true,
    completed: false,
    stars: 0,
  },
  {
    id: 4,
    stage: 4,
    label: 'STAGE 4',
    title: 'Phỏng vấn Xin việc',
    desc: 'Vượt qua cuộc phỏng vấn xin việc bằng tiếng Anh với sự tự tin và từ vựng chuẩn xác.',
    img: '',
    difficulty: 'Intermediate',
    diffColor: 'badge-cyan',
    xpReward: 350,
    locked: true,
    completed: false,
    stars: 0,
  },
  {
    id: 5,
    stage: 5,
    label: 'STAGE 5',
    title: 'Thám tử Điều tra',
    desc: 'Giải mã vụ án bằng cách viết báo cáo chi tiết và thẩm vấn các nghi phạm.',
    img: '/scenario_detective.png',
    difficulty: 'Advanced',
    diffColor: 'badge-purple',
    xpReward: 500,
    locked: true,
    completed: false,
    stars: 0,
  },
];

const faqs = [
  {
    q: 'Các khóa học của Unraveller có miễn phí không?',
    a: <>Có các <strong className="text-white">khóa học và kịch bản miễn phí</strong> có sẵn với tối đa 3 lượt chơi thử mỗi ngày. Bạn có thể nâng cấp lên gói Premium để không giới hạn quyền truy cập.</>,
  },
  {
    q: 'Tôi có cần tài khoản để chơi không?',
    a: 'Có — việc tạo tài khoản giúp bạn lưu tiến trình học tập, điểm XP, chuỗi ngày liên tục và bộ sưu tập huy chương của mình qua các phiên học.',
  },
  {
    q: 'Ứng dụng này có phù hợp với người mới bắt đầu không?',
    a: 'Hoàn toàn phù hợp. Stage 1 bắt đầu bằng các cuộc đối thoại đơn giản hàng ngày. Bạn có thể tiến bộ theo tốc độ của riêng mình mà không gặp áp lực nào.',
  },
];

/* ─── Components ─── */
const DifficultyBadge = ({ label, cls }: { label: string; cls: string }) => {
  const translated: Record<string, string> = {
    Beginner: 'CƠ BẢN',
    Intermediate: 'TRUNG CẤP',
    Advanced: 'CAO CẤP',
    Easy: 'DỄ',
    Medium: 'TRUNG BÌNH',
    Hard: 'KHÓ'
  };
  return <span className={`badge ${cls}`}>{translated[label] || label}</span>;
};

const ScenarioCard: React.FC<{ s: typeof scenarios[0]; featured?: boolean }> = ({ s, featured }) => {
  const content = (
    <div className={`scenario-card ${featured ? 'featured' : ''} flex flex-col h-full`}>
      {/* Image */}
      <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-52' : 'h-36'}`}>
        {s.img && !s.locked ? (
          <>
            <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-3 to-navy-2">
            {s.locked ? (
              <div className="flex flex-col items-center gap-2 opacity-30">
                <Lock size={28} className="text-white" />
                <span className="text-white text-xs font-semibold">Đã khóa</span>
              </div>
            ) : (
              <span className="text-5xl opacity-40">📖</span>
            )}
          </div>
        )}

        {/* Stage label */}
        <span className="absolute top-3 left-3 badge badge-purple text-[10px]">{s.label}</span>

        {/* Stars (if completed) */}
        {s.completed && (
          <div className="absolute bottom-3 left-3 flex gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star key={i} size={13} className={i < s.stars ? 'text-gold fill-gold' : 'text-white/20'} fill={i < s.stars ? '#f5c842' : 'none'} />
            ))}
          </div>
        )}

        {/* XP reward chip */}
        {!s.locked && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Zap size={10} className="text-xp-orange" />
            <span className="text-xp-orange text-[10px] font-bold">+{s.xpReward} XP</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge label={s.difficulty} cls={s.diffColor} />
          {s.completed && <span className="badge badge-success">✓ Đã xong</span>}
        </div>
        <h3 className={`font-bold text-white leading-tight font-heading ${featured ? 'text-base' : 'text-sm'}`}>
          {s.title}
        </h3>
        {featured && <p className="text-white/55 text-xs leading-relaxed flex-1">{s.desc}</p>}
        {!s.locked && (
          <div className="flex items-center gap-1 text-purple-soft text-xs font-semibold mt-auto pt-1">
            {s.completed ? 'Chơi lại' : 'Bắt đầu ngay'} <ChevronRight size={12} />
          </div>
        )}
      </div>
    </div>
  );

  if (s.locked) return <div className="flex-1 min-w-0 cursor-not-allowed opacity-60">{content}</div>;

  return (
    <Link to={`/scenario/${s.id}`} id={`scenario-card-${s.id}`} className="flex-1 min-w-0 group block no-underline">
      {content}
    </Link>
  );
};

/* ─── Page ─── */
const Home = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scenariosList, setScenariosList] = useState(scenarios);

  const { user, isAuthenticated } = useGameStore();
  const isLoggedIn = isAuthenticated;

  const xp = user?.xpBalance || 0;
  const streak = user?.streakCount || 0;
  const level = Math.floor(xp / 1000) + 1;
  const xpMax = level * 1000;
  const badges = USER_PROFILE.badges;
  const completedStages = USER_PROFILE.completedStages;

  useEffect(() => {
    getMissions()
      .then((data) => {
        if (data && data.length > 0) {
          const transformed = data.map((m, idx) => ({
            id: m.id,
            stage: idx + 1,
            label: m.stage.toUpperCase(),
            title: m.title,
            desc: m.description || m.goal,
            img: m.imageUrl || (idx === 0 ? '/scenario_coffee.png' : idx === 1 ? '/scenario_classroom.png' : idx === 4 ? '/scenario_detective.png' : ''),
            difficulty: m.difficulty,
            diffColor: m.difficulty === 'Advanced' ? 'badge-purple' : m.difficulty === 'Intermediate' ? 'badge-cyan' : 'badge-success',
            xpReward: m.xpReward,
            locked: m.locked,
            completed: idx === 0, // mock progress for display consistency
            stars: idx === 0 ? 3 : 0,
          }));
          setScenariosList(transformed);
        }
      })
      .catch((err) => {
        console.error('Failed to load missions from API, using fallback data:', err);
      });
  }, []);

  return (
    <Layout isLoggedIn={isLoggedIn} username={user?.username} showBottomNav={isLoggedIn}>
      {/* ══════ HERO ══════ */}
      <section className="max-w-screen-lg mx-auto px-5 pt-10 pb-6 text-center">
        <div className="flex justify-center mb-5">
          <img
            src="/logo.png"
            alt="The Unraveller"
            className="h-40 md:h-52 object-contain drop-shadow-2xl animate-float"
          />
        </div>

        {/* Tagline */}
        <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-3 leading-tight">
          Học Tiếng Anh Qua{' '}
          <span className="text-gradient-brand">Mô Phỏng Thực Tế</span>
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-6">
          Phương pháp học qua mô phỏng dành cho Gen Z. Trải nghiệm các kịch bản đời thực sống động — không có lý thuyết ngữ pháp nhàm chán, chỉ học những gì thực sự hữu ích.
        </p>

        {/* Quick stats */}
        {isLoggedIn && (
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6 animate-slide-up">
            <StreakBadge count={streak} />
            <StatPill icon="⚡" value={`${xp.toLocaleString()} XP`} label="Tổng XP" color="text-xp-orange" />
            <StatPill icon="🔋" value={`${user?.energy ?? 100}/${user?.maxEnergy ?? 100}`} label="Năng lượng" color="text-yellow-400" />
            <StatPill icon="🏅" value={badges} label="Huy chương" color="text-gold" />
            <StatPill icon="📖" value={`Cấp ${level}`} label="Cấp độ" color="text-cyan-brand" />
          </div>
        )}

        {/* XP bar (logged in) */}
        {isLoggedIn && (
          <div className="max-w-sm mx-auto mb-4">
            <XPBar current={xp - ((level - 1) * 1000)} max={1000} />
          </div>
        )}

        <div className="ur-divider mt-4" />
      </section>

      {/* ══════ SCENARIO JOURNEY ══════ */}
      <section className="max-w-screen-lg mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="font-heading font-bold text-2xl text-white">
              {isLoggedIn ? 'Hành Trình Của Bạn' : "Lựa Chọn Hôm Nay"}
            </h2>
            <p className="text-white/45 text-sm mt-0.5">
              {isLoggedIn
                ? `Đã hoàn thành ${completedStages} / ${scenariosList.length} màn chơi`
                : 'Hãy chọn một kịch bản và bắt đầu học'}
            </p>
          </div>
          <Link to="/courses" className="flex items-center gap-1 text-purple-soft text-sm font-semibold hover:text-white transition-colors">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        {/* Featured card (Stage 1 or current stage) */}
        <div className="mb-5">
          <ScenarioCard s={scenariosList[0]} featured />
        </div>

        {/* Grid of remaining stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scenariosList.slice(1).map(s => (
            <ScenarioCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* ══════ STATS STRIP (Marketing for guests) ══════ */}
      {!isLoggedIn && (
        <section className="max-w-screen-lg mx-auto px-5 pb-8">
          <div className="gradient-card p-6 rounded-3xl border border-purple-brand/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🎮', value: '5+', label: 'Kịch bản' },
                { icon: '🏆', value: '9', label: 'Huy chương để chinh phục' },
                { icon: '⚡', value: '3', label: 'Lượt thử miễn phí/ngày' },
              ].map(({ icon, value, label }) => (
                <div key={label}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-heading font-black text-xl text-white">{value}</div>
                  <div className="text-white/45 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ CTA ══════ */}
      {!isLoggedIn && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-10 px-5">
          <Link to="/auth?mode=register">
            <button className="btn btn-primary btn-lg shadow-glow-purple" id="home-cta-primary">
              🚀 Bắt Đầu Miễn Phí
            </button>
          </Link>
          <Link to="/premium">
            <button className="btn btn-outline" id="home-cta-premium">
              <TrendingUp size={16} /> Xem Các Gói Premium
            </button>
          </Link>
        </div>
      )}

      {/* ══════ FAQs ══════ */}
      <section className="max-w-screen-md mx-auto px-5 pb-14">
        <h2 className="font-heading font-bold text-2xl text-white mb-5">FAQs - Câu Hỏi Thường Gặp</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="ur-card rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-purple-brand/50"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              id={`faq-item-${i}`}
            >
              <div className="flex items-center justify-between p-4 gap-3">
                <h3 className="text-white font-semibold text-sm leading-snug font-heading">{faq.q}</h3>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-cyan-brand' : 'text-white/30'}`}
                />
              </div>
              {openFaq === i && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5">
                  <p className="text-white/65 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
