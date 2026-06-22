import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { Zap, Lock, Play, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getMissions } from '../../services/api';
import type { MissionDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import { getMissionLockStatus, getMissionStars, isMissionCompleted } from '../../utils/missionUtils';

import { PageLoader } from '../../components/common/PageLoader';

/* ─── Helper Components ─── */
const DifficultyBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    Beginner: 'bg-success/20 text-success border border-success/30',
    Easy:     'bg-success/20 text-success border border-success/30',
    Intermediate: 'bg-cyan-brand/20 text-cyan-brand border border-cyan-brand/30',
    Medium:   'bg-cyan-brand/20 text-cyan-brand border border-cyan-brand/30',
    Advanced: 'bg-purple-brand/20 text-purple-soft border border-purple-brand/30',
    Hard:     'bg-purple-brand/20 text-purple-soft border border-purple-brand/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colors[level] || colors.Easy}`}>
      {level}
    </span>
  );
};

const StarRating: React.FC<{ stars: number }> = ({ stars }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((s) => (
      <span key={s} className={s <= stars ? 'text-yellow-400' : 'text-white/15'}>★</span>
    ))}
  </div>
);

const UserHeader: React.FC<{
  displayName: string;
  level: number;
  currentXp: number;
  xpToNext: number;
  streak: number;
  energy: number;
  maxEnergy: number;
}> = ({ displayName, level, currentXp, xpToNext, streak, energy, maxEnergy }) => {
  const xpProgress = Math.min(100, (currentXp / xpToNext) * 100);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 bg-navy/95 backdrop-blur-xl border-b border-purple-500/20 px-4 py-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Profile Row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-brand to-purple-light flex items-center justify-center text-2xl shadow-glow-purple border border-white/10">
              🎭
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-navy">
              <Zap size={12} className="text-white fill-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base truncate">{displayName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/50">Cấp độ</span>
              <span className="text-sm font-black text-gradient-gold">Lv.{level}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <span className="text-lg leading-none">🔥</span>
              <span className="text-sm font-black text-orange-400 leading-none">{streak}</span>
            </div>
            {/* Energy */}
            <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20">
              <span className="text-lg leading-none">⚡</span>
              <span className="text-xs font-black text-cyan-400 leading-none">{energy}/{maxEnergy}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-white/50">Tiến trình XP</span>
            <span className="text-xs font-bold text-xp-orange">
              Còn {Math.max(0, xpToNext - currentXp).toLocaleString()} XP để lên Cấp {level + 1}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

interface ScenarioCardData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  isUnlocked: boolean;
  imageUrl: string;
  stars: number;
  completed: boolean;
}

const ScenarioCard: React.FC<{ scenario: ScenarioCardData; onClick: (id: number) => void }> = ({
  scenario,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: scenario.isUnlocked ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant={scenario.isUnlocked ? 'glass' : 'default'}
        hover={scenario.isUnlocked}
        className={`overflow-hidden ${scenario.isUnlocked ? '' : 'opacity-60'}`}
      >
        {/* Image/Thumbnail */}
        <div className="relative h-32 overflow-hidden">
          {scenario.imageUrl ? (
            <>
              <img
                src={scenario.imageUrl}
                alt={scenario.title}
                className={`w-full h-full object-cover ${!scenario.isUnlocked ? 'blur-[3px] opacity-25 grayscale' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-2 via-navy-2/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-navy-2">
              {scenario.isUnlocked ? (
                <span className="text-4xl opacity-40">📖</span>
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <Lock size={20} className="text-white" />
                  <span className="text-[10px] text-white font-semibold">Đã khóa</span>
                </div>
              )}
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <DifficultyBadge level={scenario.difficulty} />
          </div>

          {/* XP Reward */}
          {scenario.isUnlocked && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              <Zap size={10} className="text-xp-orange fill-xp-orange" />
              <span className="text-xp-orange text-[10px] font-bold">+{scenario.xpReward}</span>
            </div>
          )}

          {/* Completed badge */}
          {scenario.completed && (
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-semibold uppercase tracking-wide">
                ✓ Hoàn thành
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">
              {scenario.title}
            </h3>
            {scenario.stars > 0 && <StarRating stars={scenario.stars} />}
          </div>
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">
            {scenario.description}
          </p>

          <Button
            variant={scenario.isUnlocked ? 'primary' : 'outline'}
            fullWidth
            disabled={!scenario.isUnlocked}
            onClick={() => scenario.isUnlocked && onClick(scenario.id)}
            className="text-sm py-2.5"
          >
            <Play size={14} className="mr-1.5 fill-current" />
            {scenario.isUnlocked ? (scenario.completed ? 'Chơi lại' : 'Chơi ngay') : 'Đã khóa'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

/* ─── Main Component ─── */
const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();
  const [scenarios, setScenarios] = useState<ScenarioCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived user stats from Zustand store
  const XP_PER_LEVEL = 1000;
  const level = user ? Math.floor(user.xpBalance / XP_PER_LEVEL) + 1 : 1;
  const currentXp = user ? user.xpBalance % XP_PER_LEVEL : 0;
  const xpToNext = XP_PER_LEVEL;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const missions = await getMissions();
        const cards: ScenarioCardData[] = missions.map((m: MissionDto) => ({
          id: m.id,
          title: m.title,
          description: m.description || m.goal || '',
          difficulty: m.difficulty || 'Beginner',
          xpReward: m.xpReward || 0,
          isUnlocked: !getMissionLockStatus(m.id, user),
          imageUrl: m.imageUrl || '',
          stars: getMissionStars(m.id, user),
          completed: isMissionCompleted(m.id, user),
        }));
        setScenarios(cards);
      } catch (err) {
        console.error('Failed to load missions for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePlayScenario = (id: number) => {
    navigate(`/game/${id}`);
  };

  const unlockedCount = scenarios.filter((s) => s.isUnlocked).length;

  if (isLoading) {
    return <PageLoader message="Đang tải bảng điều khiển..." />;
  }

  return (
    <div className="flex flex-col h-screen app-bg text-white">
      <Seo title="Kịch Bản Của Bạn" description="Quản lý và chọn kịch bản nhiệm vụ của bạn." keywords="kịch bản, nhiệm vụ, dashboard" canonical="/dashboard" noIndex />

      {/* User Header with live data */}
      <UserHeader
        displayName={user?.username || 'Học viên'}
        level={level}
        currentXp={currentXp}
        xpToNext={xpToNext}
        streak={user?.streakCount ?? 0}
        energy={user?.energy ?? 100}
        maxEnergy={user?.maxEnergy ?? 100}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-heading font-bold text-xl text-white">Kịch Bản Của Bạn</h1>
              <p className="text-white/45 text-sm mt-0.5">
                Đã mở khóa {unlockedCount} / {scenarios.length}
              </p>
            </div>
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <TrendingUp size={18} className="text-purple-soft" />
            </button>
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ScenarioCard scenario={scenario} onClick={handlePlayScenario} />
              </motion.div>
            ))}
          </div>

          {scenarios.length === 0 && (
            <div className="text-center py-16 text-white/40 text-sm">
              Chưa có kịch bản nào. Hãy kiểm tra lại kết nối!
            </div>
          )}

          {/* Bottom spacer for nav */}
          <div className="h-4" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default DashboardScreen;