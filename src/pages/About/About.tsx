import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Github, Cpu, Users, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spy-black text-spy-green font-mono p-12 md:p-24 relative overflow-hidden">
      {/* HUD Lines Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-spy-green" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-spy-green" />
      </div>

      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-spy-green/20 pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">PROJECT DOSSIER // UNRAVELLER</h1>
          <p className="text-xs uppercase text-gray-500 tracking-[0.5em] font-bold italic">Top Secret Information // Classified Level 7</p>
        </div>
        <Button onClick={() => navigate('/')} variant="outline" className="px-8 py-3">
          <ChevronLeft size={16} /> RETURN_TO_EXT_NET
        </Button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        <section className="space-y-12">
          <div className="space-y-4">
             <h2 className="text-xl font-black uppercase text-white flex items-center gap-3"><Globe size={20} /> MISSION OBJECTIVE</h2>
             <p className="text-sm leading-relaxed uppercase text-gray-500 font-bold italic">Biến việc học Tiếng Anh trở thành một nội dung giải trí/ phiêu lưu thông qua AI. Giúp người học ghi nhớ lâu hơn thông qua cảm xúc hưng phấn và các kịch bản thực tế không bị gò bó bởi lập trình cứng.</p>
          </div>

          <div className="space-y-4">
             <h2 className="text-xl font-black uppercase text-white flex items-center gap-3"><Cpu size={20} /> OPERATIONAL TECH</h2>
             <div className="grid grid-cols-2 gap-4">
                <TechBadge label="FRONTEND: REACT + TAILWIND" />
                <TechBadge label="BACKEND: .NET 9 CORE" />
                <TechBadge label="LOGIC: AI NEURAL NETS" />
                <TechBadge label="DB: SQLITE + EF CORE" />
             </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="space-y-6">
             <h2 className="text-xl font-black uppercase text-white flex items-center gap-3"><Users size={20} /> AGENT DIRECTORY (TEAM)</h2>
             <div className="space-y-4 border-l-2 border-spy-green/20 pl-8">
                <AgentName role="Introduction / Lead" name="Anh Khoa" />
                <AgentName role="Strategy / Design" name="Đinh Quang Huy" />
                <AgentName role="Customer Insight" name="Phạm Việt Dũng" />
                <AgentName role="Solution Architect" name="Nguyễn Khánh Lê" />
                <AgentName role="Execution / Dev" name="Tuấn Khoa" />
             </div>
          </div>

          <div className="p-8 bg-spy-green/5 border border-spy-green/20">
             <h3 className="text-xs font-black uppercase mb-4 text-spy-green tracking-[0.3em]">SECURE_STORAGE_ACCESS</h3>
             <p className="text-[10px] uppercase text-gray-700 font-black mb-6">Source code is managed under encrypted repositories. Regular backups performed by HQ servers.</p>
             <a href="#" className="text-xs font-black uppercase text-spy-blue hover:text-white flex items-center gap-2 transition-all group">
                <Github size={16} className="group-hover:rotate-12" /> VIEW_ON_GITHUB // NO_ACCESS
             </a>
          </div>
        </section>
      </div>

      <footer className="mt-24 text-center text-[10px] text-gray-800 font-black uppercase tracking-[1em]">
        END OF DOSSIER // VERSION 1.0.0_BETA
      </footer>
    </div>
  );
};

const TechBadge = ({ label }: any) => (
  <div className="p-3 border border-spy-green/10 bg-spy-green/5 text-[10px] font-black uppercase text-spy-green/60 text-center">
    {label}
  </div>
);

const AgentName = ({ role, name }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-gray-700 font-black uppercase">{role}</span>
    <span className="text-spy-green font-black uppercase tracking-widest">{name}</span>
  </div>
);

export default About;
