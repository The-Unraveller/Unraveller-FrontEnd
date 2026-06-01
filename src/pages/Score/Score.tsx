import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Award, Search, Sparkles } from 'lucide-react';
import Layout from '../../components/layout/Layout';
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
    { id: 1, name: 'Cafe ordering', desc: 'Pass Stage 1 with coffee shop barista.', earned: true, emoji: '☕' },
    { id: 2, name: 'Precision agent', desc: 'Complete instructions stage perfectly.', earned: true, emoji: '📋' },
    { id: 3, name: 'Hacker badge', desc: 'Use items in gameplay successfully.', earned: true, emoji: '⚡' },
    { id: 4, name: 'Negotiator', desc: 'Reach negotiation completion state.', earned: false, emoji: '💼' },
    { id: 5, name: 'Gold level', desc: 'Gain 2,500 XP total balance.', earned: false, emoji: '👑' },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <Trophy className="text-gold" /> LEADERBOARD & SCOREBOARD
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Global rankings of active field agents and unlocked achievement medals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Global Leaderboard */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              🏆 GLOBAL AGENT RANKINGS
            </h2>
            {loading ? (
              <p className="text-white/40 text-xs py-4 text-center">Syncing agent network...</p>
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
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-brand text-white">YOU</span>
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
              🏅 ACHIEVEMENT BADGES
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
