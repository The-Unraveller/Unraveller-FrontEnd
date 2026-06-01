import React, { useState } from 'react';
import { Users, Search, UserPlus, MessageSquare } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

const Friends = () => {
  const { user } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');

  const initialFriends = [
    { name: 'Minh Khôi', status: 'Online', role: 'Elite Agent', emoji: '👑', xp: 4800 },
    { name: 'Lan Anh', status: 'In Mission', role: 'Advanced Spy', emoji: '🥈', xp: 3950 },
    { name: 'Tuấn Khoa', status: 'Offline', role: 'Field Agent', emoji: '🥉', xp: 3200 },
    { name: 'Hoàng Long', status: 'Online', role: 'Rookie Agent', emoji: '🏃‍♂️', xp: 950 },
  ];

  const filteredFriends = initialFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'} showBottomNav>
      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24 font-mono">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-2.5">
            <Users className="text-purple-brand" /> AGENT NETWORKS (FRIENDS)
          </h1>
          <p className="text-white/45 text-xs uppercase tracking-wider mt-1">
            Maintain active links with other agents and coordinate practice operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Friends list container */}
          <div className="lg:col-span-2 ur-card p-6 bg-navy-2 border border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 mb-6">
              <h2 className="text-white font-bold text-base tracking-widest uppercase flex items-center gap-2">
                👥 LINKED AGENTS
              </h2>
              {/* Search bar */}
              <div className="ur-search w-full sm:w-60 flex-shrink-0">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-xs w-full"
                />
              </div>
            </div>

            {filteredFriends.length === 0 ? (
              <p className="text-white/40 text-xs py-8 text-center">No agents match your search filter.</p>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-navy-3 flex items-center justify-between hover:border-purple-brand/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{f.emoji}</span>
                      <div>
                        <h4 className="text-white text-xs font-bold leading-none mb-1 flex items-center gap-2">
                          {f.name}
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            f.status === 'Online' ? 'bg-green-400 animate-pulse'
                            : f.status === 'In Mission' ? 'bg-yellow-400' : 'bg-white/10'
                          }`} />
                        </h4>
                        <p className="text-white/40 text-[9px] uppercase leading-none">{f.role} — {f.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-brand font-bold text-xs">{f.xp} XP</span>
                      <button className="p-2 bg-white/5 hover:bg-purple-brand/10 border border-white/10 hover:border-purple-brand/35 rounded-lg text-white/60 hover:text-white transition-all">
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add friends card */}
          <div className="lg:col-span-1 ur-card p-6 bg-navy-2 border border-white/5">
            <h2 className="text-white font-bold text-base tracking-widest uppercase mb-4 flex items-center gap-2">
              <UserPlus className="w-4.5 h-4.5 text-purple-brand" /> REQUEST LINK
            </h2>
            <p className="text-white/40 text-[10px] mb-4 uppercase">Enter agent username or email to send an invite.</p>
            <div className="space-y-3">
              <input
                className="ur-input"
                placeholder="AGENT_NAME_OR_EMAIL"
              />
              <button className="btn btn-primary w-full py-2.5 text-xs rounded-xl uppercase font-bold tracking-wider font-mono">
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Friends;
