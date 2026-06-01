import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Award, Clock, Star, Zap } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';
import { getUserProfile } from '../../services/api';

const Report = () => {
  const { user, setUser } = useGameStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserProfile()
      .then((profile) => {
        setUser(profile);
      })
      .catch((err) => console.error('Failed to load profile for report:', err))
      .finally(() => setLoading(false));
  }, [setUser]);

  const stats = [
    { label: 'CEFR Level', value: user?.englishLevel || 'B1', sub: 'Active Level', icon: Award, color: 'text-purple-brand' },
    { label: 'Total Intel', value: `${user?.xpBalance || 0} XP`, sub: 'Accumulated', icon: Star, color: 'text-gold' },
    { label: 'Streak Status', value: `${user?.streakCount || 0} Days`, sub: 'Consistent', icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Energy Load', value: `${user?.energy}/${user?.maxEnergy}`, sub: 'Ready for action', icon: Zap, color: 'text-yellow-400' },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <FileText className="text-purple-brand" /> AGENT PERFORMANCE REPORT
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Analyzing dialogue patterns, spelling correctness, and lexical achievements.
          </p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="ur-card p-6 border border-white/5 bg-navy-3 flex items-center justify-between shadow-glow-purple/5">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                  <h3 className="text-white font-black text-2xl leading-none">{s.value}</h3>
                  <p className="text-white/30 text-[9px] mt-1.5 uppercase">{s.sub}</p>
                </div>
                <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${s.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detailed analysis card */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              📊 COGNITIVE ANALYSIS & DIAGNOSTICS
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Grammar & Syntax Reliability</span>
                  <span className="text-cyan-brand text-xs font-bold">92%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-brand rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-white/40 text-[9px] mt-1.5">Minor spelling typos observed occasionally. Natural expression flow matches targeted level.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Lexical Diversity Index</span>
                  <span className="text-purple-brand text-xs font-bold">85%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-brand rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-white/40 text-[9px] mt-1.5">Vocabulary range matches target CEFR bounds. Recommended: use more transitional phrases.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Suspicion Threshold Control</span>
                  <span className="text-green-400 text-xs font-bold">Excellent (10-30% avg)</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: '95%' }} />
                </div>
                <p className="text-white/40 text-[9px] mt-1.5">High adaptability to NPC prompts. Suspicion level spikes are quickly controlled with correct wording.</p>
              </div>
            </div>
          </div>

          {/* Goals Card */}
          <div className="lg:col-span-1 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              🎯 NEXT OBJECTIVES
            </h2>
            <ul className="space-y-3.5 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <span className="text-purple-brand mt-0.5">▶</span>
                <div>
                  <p className="font-bold text-white uppercase">Coffee Shop Mastery</p>
                  <p className="text-white/40 text-[10px] mt-0.5">Reach 3 stars on Stage 1 cafe dialogues.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-purple-brand mt-0.5">▶</span>
                <div>
                  <p className="font-bold text-white uppercase">Expand Vocabulary</p>
                  <p className="text-white/40 text-[10px] mt-0.5">Learn 15 new professional business phrases.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-purple-brand mt-0.5">▶</span>
                <div>
                  <p className="font-bold text-white uppercase">Increase CEFR Level</p>
                  <p className="text-white/40 text-[10px] mt-0.5">Upgrade target level configuration in profile profile settings.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
