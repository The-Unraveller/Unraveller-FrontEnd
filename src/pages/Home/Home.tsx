import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, MessageSquare, Play, Info } from 'lucide-react';
import { Button } from '../../components/common/Button';

const Home = () => {
  return (
    <div className="min-h-screen bg-spy-black text-white font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none text-[8px] leading-tight select-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap overflow-hidden">
            {Math.random().toString(36).substring(2).repeat(20)}
          </div>
        ))}
      </div>

      <main className="z-10 max-w-5xl text-center space-y-12">
        <header>
          <h1 className="text-7xl md:text-9xl font-bold mb-4 tracking-tighter glitch-text">
            UNRAVELLER
          </h1>
          <div className="h-1 w-48 bg-spy-green mx-auto mb-4" />
          <p className="text-spy-green text-lg uppercase tracking-[0.4em] opacity-80">
            Social Engineering / Linguistic Training
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature icon={<MessageSquare />} title="Neural Chat" desc="Interact with custom NPCs using natural language." />
          <Feature icon={<Shield />} title="Suspicion Logic" desc="Maintain cover by using proper English grammar." />
          <Feature icon={<Terminal />} title="Agent Status" desc="Track your progress through organization ranks." />
        </section>

        <footer className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link to="/auth">
            <Button variant="primary" className="px-12 py-5 text-lg">
              <Play className="fill-black" /> Enter Operation
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" className="px-12 py-5 text-lg">
              <Info /> Project Dossier
            </Button>
          </Link>
        </footer>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, desc }: any) => (
  <div className="p-8 border border-spy-green/20 bg-spy-black/40 backdrop-blur-md hover:border-spy-green/60 transition-all group">
    <div className="text-spy-green mb-4 flex justify-center scale-125 group-hover:scale-150 transition-transform">{icon}</div>
    <h3 className="text-spy-green font-bold mb-3 uppercase tracking-widest">{title}</h3>
    <p className="text-[10px] text-gray-500 leading-relaxed uppercase">{desc}</p>
  </div>
);

export default Home;
