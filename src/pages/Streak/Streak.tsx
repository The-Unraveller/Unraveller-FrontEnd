import React from 'react';
import { Flame, Calendar, Trophy, Star } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

const Streak = () => {
  const { user } = useGameStore();

  const milestones = [
    { target: 3, label: '3-Day Scout', reward: 50, icon: '🔥' },
    { target: 7, label: '7-Day Specialist', reward: 150, icon: '🏃‍♂️' },
    { target: 14, label: 'Fortnight Shadow', reward: 300, icon: '🕵️‍♂️' },
    { target: 30, label: '30-Day Spectre', reward: 1000, icon: '👑' },
  ];

  // Mock days grid
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const mockDays = Array.from({ length: 28 }).map((_, idx) => ({
    dayNumber: idx + 1,
    active: idx < (user?.streakCount || 0) || [2, 5, 6, 8, 12, 13].includes(idx),
    isToday: idx === 14,
  }));

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <Flame className="text-orange-500 animate-pulse" /> STREAK MONITOR
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Tracking learning frequency and maintaining active operational status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-brand" /> ACTIVITY LOG (28-DAY GRID)
            </h2>
            <div className="grid grid-cols-7 gap-2.5 text-center mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-white/30 text-[9px] font-bold tracking-wider">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2.5 text-center">
              {mockDays.map((d) => (
                <div
                  key={d.dayNumber}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                    d.active
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.1)]'
                      : 'bg-white/5 border-white/5 text-white/20'
                  } ${d.isToday ? 'border-cyan-brand focus:scale-105' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="leading-none">{d.dayNumber}</span>
                    {d.active && <span className="text-[7px] mt-0.5 leading-none">🔥</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-[9px] mt-4 uppercase text-right">
              Today is marked with a cyan border. Do your daily missions to keep the fire burning!
            </p>
          </div>

          {/* Side Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current status */}
            <div className="ur-card p-6 bg-navy-3 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)] relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none rounded-bl-full" />
              <Flame size={45} className="text-orange-500 mx-auto mb-3 animate-bounce" />
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Current Active Link</p>
              <h2 className="text-white font-black text-4xl leading-none">{user?.streakCount || 0} DAYS</h2>
              <p className="text-white/30 text-[9px] mt-2 uppercase tracking-wide">
                Keep practicing every day to earn streak XP multipliers!
              </p>
            </div>

            {/* Milestones progress */}
            <div className="ur-card p-6 bg-navy-2 border border-white/5">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                🏆 STREAK MILESTONES
              </h3>
              <div className="space-y-3.5">
                {milestones.map((m) => {
                  const currentStreak = user?.streakCount || 0;
                  const isCompleted = currentStreak >= m.target;
                  return (
                    <div
                      key={m.target}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isCompleted
                          ? 'bg-orange-500/5 border-orange-500/20'
                          : 'bg-white/5 border-white/5 opacity-55'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{m.icon}</span>
                        <div>
                          <p className="text-white text-xs font-bold">{m.label}</p>
                          <p className="text-white/45 text-[9px] uppercase">{m.target} Days target</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-gold font-bold text-xs">+{m.reward} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Streak;
