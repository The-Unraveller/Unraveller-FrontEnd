import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import { useGameStore } from '../../store/useGameStore';

// --- MOCK STATE MACHINE DATA ---
type Option = {
  text: string;
  nextNodeId: string;
  xpReward: number;
  suspicionChange: number;
};

type DialogueNode = {
  id: string;
  npcMessage: string;
  options: Option[];
};

const mockScenario: Record<string, DialogueNode> = {
  start: {
    id: 'start',
    npcMessage: "So, you claim to have experience in this field. Tell me, what was your role at the previous company?",
    options: [
      { text: "I was a Senior Systems Analyst, focusing on backend architecture.", nextNodeId: 'node2_good', xpReward: 10, suspicionChange: -10 },
      { text: "I just did some computer stuff. You know, typing.", nextNodeId: 'node2_bad', xpReward: 0, suspicionChange: 30 },
      { text: "Can we skip this question?", nextNodeId: 'node2_bad', xpReward: 0, suspicionChange: 40 }
    ]
  },
  node2_good: {
    id: 'node2_good',
    npcMessage: "Impressive. And how did you handle the database migration crisis last year?",
    options: [
      { text: "We used a blue-green deployment strategy to minimize downtime.", nextNodeId: 'node3_good', xpReward: 15, suspicionChange: -15 },
      { text: "I just restarted the server and it worked.", nextNodeId: 'node3_bad', xpReward: 0, suspicionChange: 20 },
    ]
  },
  node2_bad: {
    id: 'node2_bad',
    npcMessage: "I see... that's very vague. Are you sure you actually worked there?",
    options: [
      { text: "Of course! I have references if you need them.", nextNodeId: 'node3_good', xpReward: 10, suspicionChange: -5 },
      { text: "Uhm, maybe it was a different company...", nextNodeId: 'node3_fail', xpReward: 0, suspicionChange: 50 },
    ]
  },
  node3_good: {
    id: 'node3_good',
    npcMessage: "Excellent answers. I think you'll be a great fit for our team. Welcome aboard!",
    options: []
  },
  node3_bad: {
    id: 'node3_bad',
    npcMessage: "That doesn't sound right at all. I think we're done here.",
    options: []
  },
  node3_fail: {
    id: 'node3_fail',
    npcMessage: "I'm calling security. You're clearly an imposter.",
    options: []
  }
};

type Message = {
  id: string;
  sender: 'npc' | 'user';
  text: string;
};

const ScenarioScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateUser = useGameStore((state) => state.updateUser);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [suspicion, setSuspicion] = useState<number>(30); // 0-100
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [sessionXp, setSessionXp] = useState<number>(0);
  const maxTurns = 3;
  
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentNode = mockScenario[currentNodeId];

  // Initialize first message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ id: Date.now().toString(), sender: 'npc', text: currentNode.npcMessage }]);
      setIsTyping(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOptionSelect = (option: Option) => {
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: option.text };
    setMessages((prev) => [...prev, userMsg]);
    
    // Update Suspicion
    setSuspicion((prev) => Math.max(0, Math.min(100, prev + option.suspicionChange)));

    // Handle XP Reward and Animation
    if (option.xpReward > 0) {
      const currentXp = useGameStore.getState().user?.xpBalance || 0;
      updateUser({ xpBalance: currentXp + option.xpReward });
      setSessionXp((prev) => prev + option.xpReward);
      const popupId = Date.now();
      setXpPopups((prev) => [...prev, { id: popupId, amount: option.xpReward }]);
      setTimeout(() => {
        setXpPopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 1500);
    }

    // Set typing state and prepare NPC response
    setIsTyping(true);
    setTurnNumber((prev) => prev + 1);
    
    setTimeout(() => {
      const nextNode = mockScenario[option.nextNodeId];
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'npc', text: nextNode.npcMessage }]);
      setCurrentNodeId(option.nextNodeId);
      setIsTyping(false);
    }, 1500);
  };

  // Helper for suspicion color
  const getSuspicionColor = () => {
    if (suspicion < 40) return 'text-success'; // Using var(--success)
    if (suspicion < 75) return 'text-gold';    // Using var(--gold)
    return 'text-danger';                      // Using var(--danger)
  };

  const getSuspicionBg = () => {
    if (suspicion < 40) return 'bg-success/20 border-success/30';
    if (suspicion < 75) return 'bg-gold/20 border-gold/30';
    return 'bg-danger/20 border-danger/30';
  };

  return (
    <div className="flex flex-col h-screen app-bg text-white overflow-hidden">
      {/* --- TOP BAR --- */}
      <header className="ur-navbar px-4 py-3 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="npc avatar">👨‍💼</span>
            <span className="font-semibold text-lg">Mr. Anderson</span>
          </div>
          
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-white/60 font-medium">
              Turn {Math.min(turnNumber, maxTurns)}/{maxTurns}
            </span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${getSuspicionBg()}`}>
              <ShieldAlert className={`w-3 h-3 ${getSuspicionColor()}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${getSuspicionColor()}`}>
                {suspicion < 40 ? 'Good' : suspicion < 75 ? 'Careful' : 'Failing'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* --- CHAT AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl p-3.5 text-[15px] leading-relaxed shadow-lg
                ${msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-tr-sm' 
                  : 'bg-[#1e1b4b]/80 border border-purple-500/20 backdrop-blur-md rounded-tl-sm text-white/90'
                }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[#1e1b4b]/80 border border-purple-500/20 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 shadow-lg flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </main>

      {/* --- INTERACTIVE CHOICES (BOTTOM AREA) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy/90 backdrop-blur-xl border-t border-purple-500/20 safe-area-bottom">
        <div className="max-w-md mx-auto relative flex flex-col gap-2.5">
          {/* Floating XP Animations */}
          <AnimatePresence>
            {xpPopups.map((popup) => (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, y: -60, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute right-4 -top-12 text-gold font-black text-xl z-50 drop-shadow-[0_0_8px_rgba(245,200,66,0.8)] pointer-events-none"
              >
                +{popup.amount} XP
              </motion.div>
            ))}
          </AnimatePresence>

          {currentNode?.options.length > 0 ? (
            currentNode.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                fullWidth 
                onClick={() => handleOptionSelect(opt)}
                disabled={isTyping}
                className="text-sm py-3 justify-start text-left h-auto whitespace-normal"
              >
                {opt.text}
              </Button>
            ))
          ) : (
            <div className="text-center text-white/50 py-4 italic">
              Scenario Concluded.
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate(
                      `/result-screen/${id || '1'}?status=${
                        suspicion >= 100 ? 'failed' : 'success'
                      }&xp=${sessionXp}&suspicion=${suspicion}`
                    )
                  }
                >
                  View Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioScreen;
