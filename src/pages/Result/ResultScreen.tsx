import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Zap, Award, RotateCcw, Home, TrendingUp, Trophy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/common/Button';
import type { ScenarioListDto, MedalDto } from '../../types/dto';

/* ─── Mock Scenario Data ─── */
const mockScenario: ScenarioListDto = {
  id: '1',
  title: 'Coffee Shop Conversations',
  description: 'Practice ordering, small talk, and natural conversations in a café environment.',
  difficulty: 'Easy',
  xpReward: 150,
  isUnlocked: true,
  thumbnailUrl: '/scenario_coffee.png',
};

/* ─── Medal Data ─── */
const medals: Record<string, MedalDto> = {
  '1': {
    id: 'medal-first-victory',
    name: 'First Victory',
    description: 'Awarded for completing your very first stage. This marks the beginning of your journey.',
    icon: '🏅',
    color: '#f5c842',
    earnedAt: new Date().toISOString(),
  },
  '2': {
    id: 'medal-listener',
    name: 'Master Listener',
    description: 'Awarded for successfully following all instructions with precision.',
    icon: '🎧',
    color: '#a78bfa',
    earnedAt: new Date().toISOString(),
  },
  '5': {
    id: 'medal-detective',
    name: 'Sharp Eye Detective',
    description: 'Awarded for completing the Detective Writing stage. Your observation skills unraveled the mystery.',
    icon: '🔍',
    color: '#60a5fa',
    earnedAt: new Date().toISOString(),
  },
};

/* ─── Animated XP Counter Component ─── */
const XPCounter: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1500 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = duration / 30;
    const increment = Math.ceil(target / 30);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span className="font-black text-5xl md:text-6xl text-gradient-gold">
      {current.toLocaleString()}
    </span>
  );
};

/* ─── Animated Progress Bar Component ─── */
interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, label }) => {
  const [animated, setAnimated] = useState(0);
  const pct = Math.min(100, Math.round((current / max) * 100));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(current);
    }, 500);
    return () => clearTimeout(timer);
  }, [current]);

  const animatedPct = Math.min(100, Math.round((animated / max) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white/60">{label}</span>
        <span className="text-sm font-bold text-xp-orange">
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${animatedPct}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]"
        />
      </div>
    </motion.div>
  );
};

/* ─── Medal Card Component with Shine Effect ─── */
const MedalCard: React.FC<{ medal: MedalDto }> = ({ medal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
      className="relative"
    >
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/60 to-navy-2 border border-purple-500/30 overflow-hidden">
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        />

        <div className="flex items-center gap-4 relative z-10">
          {/* Medal Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,200,66,0.3)]"
          >
            <span className="text-4xl">{medal.icon}</span>
          </motion.div>

          {/* Medal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className="text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                New Achievement!
              </span>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{medal.name}</h3>
            <p className="text-white/60 text-xs leading-relaxed">{medal.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Confetti Particles ─── */
const ConfettiParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}%` }}
          animate={{ opacity: 0, y: 300, rotate: 360 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

/* ─── Main Component ─── */
const ResultScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const scenarioId = id || '1';
  const status = searchParams.get('status') || 'success';
  const sessionXp = parseInt(searchParams.get('xp') || '0', 10) || 150;
  const isSuccess = status === 'success';

  const [showMedal, setShowMedal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const finalSuspicion = parseInt(searchParams.get('suspicion') || '30', 10);

  // User profile for progress calculation
  const userCurrentXp = 4520;
  const userLevel = 5;
  const xpToNextLevel = 5000;

  const medal = medals[scenarioId] || medals['1'];

  useEffect(() => {
    if (isSuccess) {
      const timer1 = setTimeout(() => setShowConfetti(true), 300);
      const timer2 = setTimeout(() => setShowMedal(true), 1200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isSuccess]);

  // Failure state
  if (!isSuccess) {
    return (
      <div className="flex flex-col h-screen app-bg text-white">
        <ConfettiParticles />

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-sm w-full"
          >
            <div className="p-8 rounded-3xl bg-gradient-to-br from-red-900/40 to-navy-2 border border-red-500/30 text-center">
              {/* Sad Face */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">😰</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-heading font-black text-3xl text-white mb-2"
              >
                Busted!
              </motion.h1>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/55 text-sm leading-relaxed mb-4"
              >
                Your suspicion level reached {finalSuspicion}%. Try speaking in longer, more natural
                sentences next time.
              </motion.p>

              {/* Suspicion Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 mb-6"
              >
                <Trophy size={14} className="text-red-400" />
                <span className="text-sm font-bold text-red-400">SUSPICION {finalSuspicion}%</span>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/scenario/${scenarioId}`)}
                  className="py-3"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/')}
                  className="py-3"
                >
                  <Home size={16} className="mr-2" />
                  Dashboard
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col h-screen app-bg text-white relative overflow-hidden">
      {/* Confetti Background */}
      <AnimatePresence>
        {showConfetti && <ConfettiParticles />}
      </AnimatePresence>

      {/* Background Glow Effects */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-0 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm w-full"
        >
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
              <CheckCircle2 size={18} className="text-green-400" />
              <span className="text-sm font-bold text-green-400">Scenario Completed!</span>
            </div>

            <h1 className="font-heading font-black text-3xl text-white mb-2">
              Congratulations! 🎉
            </h1>
            <p className="text-white/55 text-sm">
              {mockScenario.title}
            </p>
          </motion.div>

          {/* XP Earned Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30 mb-5 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Zap size={32} className="text-xp-orange fill-xp-orange" />
              </motion.div>
              <div>
                <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  XP Earned
                </div>
                <XPCounter target={sessionXp} />
              </div>
            </div>
            <p className="text-white/45 text-xs">Experience points earned this session</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-5">
            <ProgressBar
              current={userCurrentXp + sessionXp}
              max={xpToNextLevel}
              label={`Progress to Level ${userLevel + 1}`}
            />
          </div>

          {/* Medal Award */}
          <AnimatePresence>
            {showMedal && medal && (
              <div className="mb-5">
                <MedalCard medal={medal} />
              </div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-3"
          >
            <Button
              variant="cyan"
              fullWidth
              onClick={() => navigate('/')}
              className="py-3"
            >
              <Home size={18} className="mr-2" />
              Continue to Dashboard
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate(`/scenario/${scenarioId}`)}
              className="py-3"
            >
              <RotateCcw size={16} className="mr-2" />
              Replay Scenario
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ResultScreen;