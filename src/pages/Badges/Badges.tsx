import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

interface Badge {
  id: number;
  name: string;
  desc: string;
  earned: boolean;
  color: string;
}

const allBadges: Badge[] = [
  { id: 1, name: 'First Victory Medal', desc: 'Complete your very first stage.', earned: true, color: '#f5c842' },
  { id: 2, name: 'Coffee Master', desc: 'Complete Stage 1 with a perfect score.', earned: false, color: '#a78bfa' },
  { id: 3, name: 'Quick Learner', desc: 'Finish 3 stages in one day.', earned: false, color: '#34d399' },
  { id: 4, name: 'Detective Eye', desc: 'Complete the Detective Writing stage.', earned: false, color: '#60a5fa' },
  { id: 5, name: 'Silver Tongue', desc: 'Achieve A+ in speaking evaluation.', earned: false, color: '#c0c0c0' },
  { id: 6, name: 'Streak Master', desc: 'Maintain a 7-day learning streak.', earned: false, color: '#f97316' },
  { id: 7, name: 'Social Butterfly', desc: 'Pass 5 social scenarios successfully.', earned: false, color: '#ec4899' },
  { id: 8, name: 'Unraveller Elite', desc: 'Complete all available stages.', earned: false, color: '#8b5cf6' },
  { id: 9, name: 'Storyteller', desc: 'Write a complete story in English.', earned: false, color: '#14b8a6' },
];

const BadgeCell = ({ badge }: { badge: Badge }) => (
  <div
    id={`badge-cell-${badge.id}`}
    title={badge.earned ? `${badge.name}: ${badge.desc}` : 'Complete more stages to unlock'}
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

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'}>
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        <div className="ur-card rounded-2xl p-6 md:p-8">
          <h1 className="text-white text-2xl font-bold text-center mb-1">Your Collection</h1>
          <p className="text-white/45 text-sm text-center mb-7">
            Complete more stages to earn badges
          </p>

          {/* Badge grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {allBadges.map(badge => (
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
              <p className="text-white font-bold text-sm">First Victory Medal</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed">
                Awarded for completing your first stage. Your journey begins here!
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
              Continue
            </button>
            <button
              onClick={() => navigate('/')}
              className="ur-btn-outline px-7 py-3 rounded-full font-bold"
              id="badges-home-btn"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Badges;
