import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, Shield, ChevronLeft, User, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'npc', text: 'Chào cưng, đến đây làm gì thế? Khu vực này không dành cho người lạ đâu nhé!', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [suspicion, setSuspicion] = useState(20);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const playerMsg = { role: 'player', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, playerMsg]);
    setInputValue('');

    // Simulate NPC Response & Suspicion Change
    setIsTyping(true);
    setTimeout(() => {
      const isSus = inputValue.toLowerCase().includes('hack') || inputValue.length < 5;
      const change = isSus ? 25 : -5;
      setSuspicion(prev => Math.min(100, Math.max(0, prev + change)));

      const npcMsg = {
        role: 'npc',
        text: isSus ? 'Này! Cậu nói cái gì thế? Nghe có vẻ mờ ám đấy...' : 'Hừm, nghe cũng có vẻ hợp lý. Nhưng tôi vẫn cần kiểm tra thêm.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, npcMsg]);
      setIsTyping(false);

      if (suspicion + change >= 100) {
        alert("BẠN ĐÃ BỊ BẮT! Độ nghi ngờ quá cao.");
        navigate('/missions');
      }
    }, 1500);
  };

  return (
    <div className="h-screen bg-spy-black text-spy-green font-mono flex flex-col overflow-hidden">
      {/* Header / Game Stats */}
      <header className="p-4 border-b border-spy-green/20 flex justify-between items-center bg-spy-black/90 z-20">
        <button onClick={() => navigate('/missions')} className="flex items-center gap-2 text-xs hover:text-white">
          <ChevronLeft className="w-4 h-4" /> ABORT MISSION
        </button>

        <div className="flex-1 flex justify-center px-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between text-[10px] uppercase mb-1">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SUSPICION_LEVEL</span>
              <span className={suspicion > 70 ? 'text-spy-red animate-pulse' : ''}>{suspicion}%</span>
            </div>
            <div className="h-2 bg-gray-900 border border-spy-green/20 relative overflow-hidden">
              <motion.div
                initial={{ width: '20%' }}
                animate={{ width: `${suspicion}%` }}
                className={`h-full transition-colors duration-500 ${suspicion > 70 ? 'bg-spy-red' : suspicion > 40 ? 'bg-yellow-500' : 'bg-spy-green'}`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-gray-500 uppercase">NPC: GUARD_01</p>
            <p className="text-[10px] text-gray-500 uppercase">LOCATION: GATE_A</p>
          </div>
          <div className="w-8 h-8 border border-spy-green rounded-sm flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] p-4 border ${msg.role === 'player' ? 'border-spy-blue bg-spy-blue/10 text-spy-blue' : 'border-spy-green bg-spy-green/5'}`}>
                <div className="text-[10px] uppercase mb-1 opacity-50">{msg.role === 'player' ? 'YOU' : 'NPC'}</div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className="text-[8px] mt-2 opacity-30 text-right">{msg.timestamp.toLocaleTimeString()}</div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-4 border border-spy-green bg-spy-green/5 animate-pulse text-[10px]">
                NPC IS ANALYZING SPEECH...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-spy-black border-t border-spy-green/20">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
          <div className="flex-1 relative">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-spy-green/50" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ENTER TRANSMISSION..."
              className="w-full bg-spy-black border border-spy-green p-4 pl-12 text-spy-green focus:shadow-[0_0_15px_rgba(0,255,65,0.2)] outline-none placeholder:text-spy-green/30"
            />
          </div>
          <button
            type="submit"
            className="px-8 bg-spy-green text-black font-bold uppercase hover:bg-white transition-all flex items-center gap-2"
          >
            SEND <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[8px] text-gray-600 mt-4 uppercase tracking-[0.3em]">
          SECURE CONNECTION ESTABLISHED // ALL MESSAGES ARE MONITORED BY AI UNIT
        </p>
      </footer>
    </div>
  );
};

export default GamePage;
