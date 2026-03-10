import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Terminal, Database, Shield } from 'lucide-react';
import { SuspicionMeter } from '../../components/game/SuspicionMeter';
import { ChatHistory } from '../../components/game/ChatHistory';
import { AgentConsole } from '../../components/game/AgentConsole';

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'npc', text: 'HALT! Identify yourself. This area is under strict military surveillance. State your purpose immediately.', timestamp: new Date() }
  ]);
  const [suspicion, setSuspicion] = useState(15);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    const playerMsg = { role: 'player', text, timestamp: new Date() };
    setMessages(prev => [...prev, playerMsg]);
    
    // Simulate AI Processing
    setIsTyping(true);
    setTimeout(() => {
      // Mock logic for Demo
      const isBadEnglish = text.length < 10 || !text.includes(' ');
      const change = isBadEnglish ? 30 : -5;
      const newSus = Math.min(100, Math.max(0, suspicion + change));
      setSuspicion(newSus);
      
      const npcResponse = isBadEnglish 
        ? "Your speech pattern is erratic, agent. My internal sensors are flagging you. Explain yourself better or be detained."
        : "Hmph. Your credentials seem to check out, but I'm still keeping an eye on you. Move along, but stay within the yellow lines.";
      
      setMessages(prev => [...prev, { role: 'npc', text: npcResponse, timestamp: new Date() }]);
      setIsTyping(false);

      if (newSus >= 100) {
        setTimeout(() => navigate(`/result/${id}?status=failed`), 1000);
      } else if (messages.length > 5 && newSus < 30) {
        setTimeout(() => navigate(`/result/${id}?status=success`), 1000);
      }
    }, 2000);
  };

  return (
    <div className="h-screen bg-spy-black text-spy-green font-mono flex flex-col overflow-hidden relative">
      {/* HUD Background Effect */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-spy-green/5 opacity-40 z-10 shadow-[inset_0_0_100px_rgba(0,255,65,0.05)]" />

      {/* Header / Game Stats */}
      <header className="p-6 md:p-8 border-b border-spy-green/10 flex flex-col md:flex-row justify-between items-center bg-spy-black/95 z-20 gap-8">
        <button onClick={() => navigate('/missions')} className="flex items-center gap-3 text-[10px] font-black uppercase hover:text-white transition-all bg-spy-green/5 px-4 py-2 border border-spy-green/20">
          <ChevronLeft size={14} /> ABORT_OP
        </button>
        
        <SuspicionMeter level={suspicion} />

        <div className="flex items-center gap-6 border-l border-spy-green/10 pl-8 hidden md:flex">
           <div className="text-right">
             <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">TARGET: GATE_SENTINEL_A1</p>
             <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">INTEL: 85%_ACCURACY</p>
           </div>
           <div className="w-12 h-12 border-2 border-spy-green rounded-sm flex items-center justify-center bg-spy-green/5 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
             <Shield className="w-7 h-7" />
           </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <ChatHistory messages={messages} isTyping={isTyping} />

      {/* Input Area */}
      <AgentConsole onSendMessage={handleSendMessage} isTyping={isTyping} />
    </div>
  );
};

export default Game;
