import React from 'react';
import { HelpCircle, BookOpen, AlertTriangle, Zap, Star, Shield } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

const Guide = () => {
  const { user } = useGameStore();

  const rules = [
    {
      title: '🕵️‍♂️ dialogue gameplay rules',
      icon: BookOpen,
      desc: 'Enter your custom written response to the NPC. You will receive AI evaluated feedback in three categories: Sửa lỗi (Typo correction), Diễn đạt tự nhiên hơn (More natural expression), and Giải thích ngắn gọn (Short explanation).',
    },
    {
      title: '⚠️ suspicion level system',
      icon: AlertTriangle,
      desc: 'Each turn, your message is evaluated. If you use poor grammar, make typos, or choose inappropriate phrasing, suspicion increases. If suspicion reaches 100%, you are exposed and fail the mission!',
    },
    {
      title: '⚡ inventory tools',
      icon: Zap,
      desc: 'Purchase tools from the shop using your XP: InGameHint helps you frame a natural response, and BribeNpc reduces suspicion during active dialogue. Use them carefully in mid-game!',
    },
    {
      title: '🏆 cefr English level target',
      icon: Shield,
      desc: 'Choose your level target (A1 to C2) in User Profile. The AI coach will adjust the strictness of vocabulary and syntactic evaluation based on your selected level. Higher levels require sophisticated phrasing.',
    },
  ];

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <HelpCircle className="text-purple-brand" /> AGENT MANUAL & GUIDELINES
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Documentation on dialogue systems, suspicion controls, items logic, and CEFR ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="ur-card p-6 bg-navy-2 border border-white/5 relative overflow-hidden flex gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-cyan-brand flex-shrink-0 h-fit">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase mb-2 tracking-wider">{rule.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Progression FAQ */}
        <div className="ur-card p-6 bg-navy-2 border border-white/5">
          <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
            🛡️ RANK & XP PROGRESSION SYSTEM
          </h2>
          <div className="space-y-4 text-xs text-white/70">
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Q: How do I earn XP?</h4>
              <p className="text-white/45">A: Submit high-quality, CEFR-appropriate dialogue messages. Lower suspicion changes yield higher XP reward multipliers at the end of each round.</p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Q: What happens if I fail a mission?</h4>
              <p className="text-white/45">A: You can always use the "Làm lại (Retry)" button mid-game or click reset to clear your session dialogue history and start again without penalties.</p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <h4 className="font-bold text-white uppercase mb-1">Q: How does energy affect gameplay?</h4>
              <p className="text-white/45">A: Starting a dialogue mission costs 20 energy. Energy automatically restores over time, keeping your daily practice cycle balanced.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Guide;
