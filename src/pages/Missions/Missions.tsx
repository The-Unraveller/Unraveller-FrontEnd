import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, Play, ChevronRight, User, Terminal, Database, Shield } from 'lucide-react';
import { Button } from '../../components/common/Button';

const missions = [
  { id: 1, title: 'The Gatekeeper', desc: 'Thuyết phục bảo vệ cho bạn vào tòa nhà bí mật.', status: 'available', level: 1 },
  { id: 2, title: 'Data Extraction', desc: 'Hỏi thông tin mật khẩu từ nhân viên thực tập.', status: 'locked', level: 2 },
  { id: 3, title: 'The Double Agent', desc: 'Nhận biết và đối phó với kẻ phản bội.', status: 'locked', level: 3 },
  { id: 4, title: 'Final Unravelling', desc: 'Giải mã bí mật cuối cùng của tổ chức.', status: 'locked', level: 4 },
];

const Missions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spy-black text-spy-green font-mono p-8 md:p-12 overflow-x-hidden">
      {/* Side decoration */}
      <div className="fixed left-0 top-0 bottom-0 w-1 bg-spy-green/30 opacity-50" />
      <div className="fixed right-0 top-0 bottom-0 w-1 bg-spy-green/30 opacity-50" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">MISSION CONTROL // HQ</h1>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
            <Database size={12} /> SECURE LINK ESTABLISHED // DATA UPDATED: {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-6 border-l border-spy-green/20 pl-8">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">AGENT_NAME: <span className="text-spy-green">KHOA_TUAN_07</span></p>
            <p className="text-[10px] text-gray-500 uppercase font-bold">STATUS: <span className="text-spy-blue italic animate-pulse">ACTIVE_DUTY</span></p>
            <p className="text-[10px] text-gray-500 uppercase font-bold">XP: <span className="text-white">1,250 / 5,000</span></p>
          </div>
          <div className="w-14 h-14 border border-spy-green rounded-sm flex items-center justify-center bg-spy-green/5 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <User className="w-8 h-8" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-12">
        <section>
          <h2 className="text-xl font-bold uppercase mb-10 flex items-center gap-4 text-white">
            <span className="bg-white text-black px-2 py-1 text-sm font-black">CH-1</span> SELECT OPERATIONAL OBJECTIVE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {missions.map((mission) => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                onClick={() => mission.status === 'available' && navigate(`/game/${mission.id}`)}
              />
            ))}
          </div>
        </section>

        <section className="mt-16 pt-16 border-t border-spy-green/10 grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-60">
           <div className="p-6 border border-spy-green/10 bg-spy-black/40">
              <h3 className="text-xs font-black uppercase text-gray-500 mb-4 flex items-center gap-2"><Shield size={14} /> SECURITY PROTOCOL</h3>
              <p className="text-[10px] leading-relaxed uppercase text-gray-700 font-bold">Always maintain proper grammar. Mistakes increase suspicion levels. If suspicion exceeds 100%, mission is terminated.</p>
           </div>
           <div className="p-6 border border-spy-green/10 bg-spy-black/40">
              <h3 className="text-xs font-black uppercase text-gray-500 mb-4 flex items-center gap-2"><Terminal size={14} /> RECENT LOGS</h3>
              <p className="text-[10px] leading-relaxed uppercase text-gray-700 font-bold">Mission 01 completed with 85% score. New encryption techniques unlocked.</p>
           </div>
        </section>
      </div>
    </div>
  );
};

const MissionCard = ({ mission, onClick }: any) => {
  const isLocked = mission.status === 'locked';
  
  return (
    <div 
      onClick={onClick}
      className={`group relative p-8 border-2 transition-all cursor-pointer overflow-hidden ${isLocked ? 'border-gray-900 bg-black/50 grayscale' : 'border-spy-green/20 bg-spy-black hover:border-spy-green hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]'}`}
    >
      <div className="mb-6 flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-gray-700' : 'text-spy-green/50'}`}>CHAPTER 0{mission.id}</span>
          <h3 className={`text-xl font-black uppercase leading-tight ${isLocked ? 'text-gray-700' : 'text-spy-green'}`}>
            {mission.title}
          </h3>
        </div>
        {isLocked ? <Lock className="w-5 h-5 text-gray-800" /> : <Unlock className="w-5 h-5 text-spy-green animate-pulse" />}
      </div>
      
      <p className={`text-[10px] uppercase font-bold mb-12 h-14 overflow-hidden leading-relaxed ${isLocked ? 'text-gray-800' : 'text-gray-500'}`}>
        {mission.desc}
      </p>

      {!isLocked && (
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-black px-3 py-1 bg-spy-green/10 border border-spy-green/40 text-spy-green uppercase">LVL: {mission.level}</span>
          <Play className="w-5 h-5 fill-spy-green transition-transform group-hover:scale-125" />
        </div>
      )}

      {/* Grid background effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="border border-spy-green/20" />
        ))}
      </div>
    </div>
  );
};

export default Missions;
