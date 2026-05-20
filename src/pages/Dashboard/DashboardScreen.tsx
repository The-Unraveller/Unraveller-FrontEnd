import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Award, TrendingUp, Lock, Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { ScenarioListDto, UserProfileDto } from '../../types/dto';

/* ─── Mock Data (plug-and-play with backend DTOs) ─── */
const mockUserProfile: UserProfileDto = {
  userId: 'user-001',
  displayName: 'Alex',
  currentLevel: 5,
  currentXp: 4520,
  xpToNextLevel: 5000,
  currentStreak: 12,
};

const mockScenarios: ScenarioListDto[] = [
  {
    id: '1',
    title: 'Coffee Shop Conversations',
    description: 'Practice ordering, small talk, and natural conversations in a café environment.',
    difficulty: 'Easy',
    xpReward: 150,
    isUnlocked: true,
    thumbnailUrl: '/scenario_coffee.png',
  },
  {
    id: '2',
    title: 'Following Instructions',
    description: 'Listen, understand complex directions, and execute tasks with precision.',
    difficulty: 'Easy',
    xpReward: 200,
    isUnlocked: true,
    thumbnailUrl: '/scenario_classroom.png',
  },
  {
    id: '3',
    title: 'Debate & Negotiation',
    description: 'Argue your position and reach agreements in professional English.',
    difficulty: 'Medium',
    xpReward: 300,
    isUnlocked: true,
    thumbnailUrl: '',
  },
  {
    id: '4',
    title: 'Job Interview',
    description: 'Ace an English job interview with proper vocabulary and confidence.',
    difficulty: 'Medium',
    xpReward: 350,
    isUnlocked: false,
    thumbnailUrl: '',
  },
  {
    id: '5',
    title: 'The Detective',
    description: 'Solve a mystery by writing detailed reports and interviewing suspects.',
    difficulty: 'Hard',
    xpReward: 500,
    isUnlocked: false,
    thumbnailUrl: '/scenario_detective.png',
  },
];

/* ─── Helper Components ─── */
const DifficultyBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    Easy: 'bg-success/20 text-success border border-success/30',
    Medium: 'bg-cyan-brand/20 text-cyan-brand border border-cyan-brand/30',
    Hard: 'bg-purple-brand/20 text-purple-brand border border-purple-brand/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colors[level] || colors.Easy}`}>
      {level}
    </span>
  );
};

const UserHeader: React.FC<{ profile: UserProfileDto }> = ({ profile }) => {
  const xpProgress = (profile.currentXp / profile.xpToNextLevel) * 100;

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
            <h2 className="font-bold text-white text-base truncate">{profile.displayName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/50">Level</span>
              <span className="text-sm font-black text-gradient-gold">Lv.{profile.currentLevel}</span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
            <span className="text-lg leading-none">🔥</span>
            <span className="text-sm font-black text-orange-400 leading-none">{profile.currentStreak}</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-white/50">XP Progress</span>
            <span className="text-xs font-bold text-xp-orange">
              {(profile.xpToNextLevel - profile.currentXp).toLocaleString()} XP to Lv.{profile.currentLevel + 1}
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

const ScenarioCard: React.FC<{ scenario: ScenarioListDto; onClick: (id: string) => void }> = ({
  scenario,
  onClick,
}) => {
  const hasImage = scenario.thumbnailUrl && scenario.isUnlocked;

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
          {hasImage ? (
            <>
              <img
                src={scenario.thumbnailUrl}
                alt={scenario.title}
                className="w-full h-full object-cover"
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
                  <span className="text-[10px] text-white font-semibold">Locked</span>
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
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="font-bold text-white text-sm leading-tight mb-1.5 line-clamp-2">
            {scenario.title}
          </h3>
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
            {scenario.isUnlocked ? 'Play' : 'Locked'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

/* ─── Main Component ─── */
const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile] = useState<UserProfileDto>(mockUserProfile);
  const [scenarios] = useState<ScenarioListDto[]>(mockScenarios);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API loading (replace with actual API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayScenario = (id: string) => {
    navigate(`/scenario/${id}`);
  };

  const unlockedCount = scenarios.filter((s) => s.isUnlocked).length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen app-bg text-white">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-brand to-purple-light flex items-center justify-center shadow-glow-purple">
              <span className="text-3xl">🎭</span>
            </div>
            <p className="text-white/50 text-sm font-medium">Loading dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen app-bg text-white">
      {/* User Header */}
      <UserHeader profile={profile} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-heading font-bold text-xl text-white">Your Scenarios</h1>
              <p className="text-white/45 text-sm mt-0.5">
                {unlockedCount} of {scenarios.length} unlocked
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