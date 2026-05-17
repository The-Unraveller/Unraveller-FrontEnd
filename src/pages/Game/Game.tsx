import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Zap, Send, Volume2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getMissions, sendGameMessage } from '../../services/api';

/* ─── Scenario data ─── */
const scenarioData: Record<string, {
  title: string;
  stage: string;
  bg: string;
  npcName: string;
  npcEmoji: string;
  difficulty: string;
  xpReward: number;
  intro: string;
  choices: string[];
}> = {
  '1': {
    title: 'Coffee Shop Conversations',
    stage: 'Stage 1',
    bg: '/scenario_coffee.png',
    npcName: 'Barista',
    npcEmoji: '☕',
    difficulty: 'Beginner',
    xpReward: 150,
    intro: `"Hello! Welcome to your English learning journey. Don't worry if you're not perfect yet — everyone starts somewhere. We'll learn together in a way that's simple, comfortable, and fun. A little progress every day will take you further than you think. Are you ready to start?"`,
    choices: ["Yes, let's go!", "I'm a bit nervous…", "What do we do first?", "Sounds great!"],
  },
  '2': {
    title: 'Following Instructions',
    stage: 'Stage 2',
    bg: '/scenario_classroom.png',
    npcName: 'Supervisor',
    npcEmoji: '📋',
    difficulty: 'Beginner',
    xpReward: 200,
    intro: `"You've been assigned several tasks today. Listen carefully to each instruction and complete everything with minimal mistakes. Your performance will be tracked and scored. Understood? Let's begin."`,
    choices: ["Understood, ready!", "Can you repeat that?", "What's the first task?", "I'll do my best."],
  },
  '5': {
    title: 'The Detective',
    stage: 'Stage 5',
    bg: '/scenario_detective.png',
    npcName: 'Chief Detective',
    npcEmoji: '🔍',
    difficulty: 'Advanced',
    xpReward: 500,
    intro: `"A crime has been committed. As the lead detective, you must gather evidence, interview suspects, and file your report in precise English. Every word in your report matters — a poorly written brief could let the culprit escape. Are you sharp enough?"`,
    choices: ["I'm on the case.", "Give me the details.", "Where do I start?", "Understood. Let's solve this."],
  },
};

const defaultScenario = scenarioData['1'];

const startChoicesMap: Record<number, string[]> = {
  1: ["Yes, let's go!", "I'm a bit nervous…", "What do we do first?", "Sounds great!"],
  2: ["Understood, ready!", "Can you repeat that?", "What's the first task?", "I'll do my best."],
  3: ["I'm ready to debate.", "Let's start the negotiation.", "What is the topic?", "Ready!"],
  4: ["Good morning, Mr. Vance.", "Let's start the interview.", "I'm ready for the questions.", "Thank you for having me."],
  5: ["I'm on the case.", "Give me the details.", "Where do I start?", "Understood. Let's solve this."]
};

interface Message {
  role: 'npc' | 'player';
  text: string;
  xp?: number;
}

const npcGoodResponses = [
  `"Excellent answer! Your sentence structure is spot on. The locals are impressed — suspicion dropping!"`,
  `"Well done! That was natural and fluent. You're blending in perfectly."`,
  `"Great response! Using proper grammar really helps. Keep this up!"`,
  `"Perfect! That sounded completely natural. You're doing brilliantly."`,
];

const npcBadResponses = [
  `"Hmm… that sounded a bit off. Try to use a complete sentence with a subject and verb."`,
  `"Watch your verb tense there. Mistakes like that raise suspicion — be more careful."`,
  `"Short answers feel suspicious here. Try to elaborate a little more."`,
  `"That phrasing was unusual. Speak naturally — use everyday English, not just keywords."`,
];

const Game = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(scenarioData[id ?? '1'] ?? defaultScenario);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'npc', text: scenario.intro },
  ]);
  const [suspicion, setSuspicion] = useState(10);
  const [shouldShake, setShouldShake] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const missionId = id ? parseInt(id, 10) : 1;
    getMissions()
      .then((data) => {
        const found = data.find(m => m.id === missionId);
        if (found) {
          const transformed = {
            title: found.title,
            stage: found.stage.toUpperCase(),
            bg: found.imageUrl || (missionId === 1 ? '/scenario_coffee.png' : missionId === 2 ? '/scenario_classroom.png' : missionId === 5 ? '/scenario_detective.png' : ''),
            npcName: found.npcName || 'NPC',
            npcEmoji: found.npcName?.toLowerCase().includes('barista') ? '☕' 
                      : found.npcName?.toLowerCase().includes('supervisor') ? '📋'
                      : found.npcName?.toLowerCase().includes('detective') ? '🔍' : '👤',
            difficulty: found.difficulty,
            xpReward: found.xpReward,
            intro: found.description || found.goal,
            choices: startChoicesMap[missionId] || ["Hello!", "Ready!"],
          };
          setScenario(transformed);
          setMessages([{ role: 'npc', text: transformed.intro }]);
        }
      })
      .catch((err) => {
        console.error('Failed to load mission details from API:', err);
      });
  }, [id]);

  const processMessage = (text: string) => {
    if (isTyping || gameOver || !text.trim()) return;

    setMessages(prev => [...prev, { role: 'player', text }]);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    setIsTyping(true);

    const missionId = id ? parseInt(id, 10) : 1;

    sendGameMessage({
      userId: 1, // KHOA_PRO seeded user
      missionId,
      message: text
    })
      .then((res) => {
        setIsTyping(false);
        if (res) {
          const newSus = res.newSuspicionLevel;
          if (newSus > suspicion) {
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 500);
          }
          setSuspicion(newSus);
          setTotalXP(prev => prev + res.xpEarned);

          setMessages(prev => [
            ...prev,
            {
              role: 'npc',
              text: res.npcResponse,
              xp: res.xpEarned
            }
          ]);

          if (newSus >= 100 || res.isLose) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1500);
          } else if (res.isWin) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + res.xpEarned}`), 1500);
          } else if (newTurn >= 5) {
            setGameOver(true);
            const status = newSus < 50 ? 'success' : 'failed';
            setTimeout(() => navigate(`/result/${id}?status=${status}&xp=${totalXP + res.xpEarned}`), 1500);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to submit message to game engine API, using mock response fallback:', err);
        setTimeout(() => {
          const wordCount = text.trim().split(/\s+/).length;
          const isGood = wordCount >= 4 && text.length > 14;
          const susChange = isGood ? -10 : 22;
          const xpGain = isGood ? Math.floor(scenario.xpReward / 5) : 5;
          const newSus = Math.min(100, Math.max(0, suspicion + susChange));
          if (newSus > suspicion) {
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 500);
          }
          setSuspicion(newSus);
          setTotalXP(prev => prev + xpGain);

          const pool = isGood ? npcGoodResponses : npcBadResponses;
          const npcText = pool[Math.floor(Math.random() * pool.length)];

          setMessages(prev => [...prev, { role: 'npc', text: npcText, xp: xpGain }]);
          setIsTyping(false);

          if (newSus >= 100) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1500);
          } else if (newTurn >= 5 && newSus < 50) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + xpGain}`), 1500);
          }
        }, 1200);
      });
  };

  const handleChoice = (choice: string) => processMessage(choice);
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(inputValue.trim());
    setInputValue('');
  };

  /* Suspicion color logic */
  const susColor = suspicion > 70 ? '#ef4444' : suspicion > 45 ? '#f59e0b' : '#10b981';
  const susLabel = suspicion > 70 ? 'HIGH' : suspicion > 45 ? 'MEDIUM' : 'LOW';

  return (
    <div className="app-bg min-h-screen flex flex-col">
      <Navbar isLoggedIn username="USERNAME" />

      <main className="max-w-screen-sm mx-auto w-full px-3 py-4 flex-1">
        {/* ── Back + stage info ── */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors"
            id="game-back-btn"
          >
            <ChevronLeft size={15} /> Courses
          </button>
          <div className="flex items-center gap-2">
            <span className="badge badge-purple text-[10px]">{scenario.stage}</span>
            <span className="badge badge-xp text-[10px]">
              <Zap size={9} /> +{totalXP} XP
            </span>
          </div>
        </div>

        {/* ── Title bar ── */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{scenario.npcEmoji}</span>
          <div>
            <h1 className="text-white font-heading font-bold text-base leading-tight">{scenario.title}</h1>
            <p className="text-white/40 text-xs">{scenario.npcName}</p>
          </div>
          <button className="ml-auto text-white/30 hover:text-cyan-brand transition-colors" title="Audio (coming soon)">
            <Volume2 size={18} />
          </button>
        </div>

        {/* ── Main game card ── */}
        <div className="ur-card rounded-2xl overflow-hidden mb-3">
          {/* Scenario image */}
          <div className="relative h-56 md:h-72 overflow-hidden">
            <img
              src={scenario.bg}
              alt={scenario.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />

            {/* Suspicion overlay */}
            <div className={`absolute top-3 left-3 right-3 transition-transform ${shouldShake ? 'animate-shake' : ''}`}>
              <div
                className="rounded-2xl px-3 py-2 backdrop-blur-md"
                style={{ background: 'rgba(15,12,30,0.7)' }}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/70 font-semibold">
                    <AlertTriangle size={12} style={{ color: susColor }} />
                    Suspicion Level
                  </span>
                  <span className="font-black text-xs" style={{ color: susColor }}>
                    {suspicion}% — {susLabel}
                  </span>
                </div>
                <div className="sus-bar-track">
                  <div
                    className="sus-bar-fill"
                    style={{ width: `${suspicion}%`, backgroundColor: susColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Chat messages ── */}
          <div className="p-4 max-h-52 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'npc' && (
                  <div className="w-7 h-7 rounded-full bg-purple-brand/40 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                    {scenario.npcEmoji}
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                    msg.role === 'npc'
                      ? 'rounded-tl-sm bg-navy-3/80 border border-purple-brand/20 text-white/85'
                      : 'rounded-tr-sm bg-purple-brand/60 border border-purple-light/30 text-white'
                  }`}
                >
                  {msg.text}
                  {msg.xp && msg.role === 'npc' && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <Zap size={10} className="text-xp-orange" />
                      <span className="text-xp-orange text-[10px] font-bold">+{msg.xp} XP earned</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-purple-brand/40 flex items-center justify-center text-sm flex-shrink-0 mr-2">
                  {scenario.npcEmoji}
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-sm text-white/50 text-sm"
                  style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatRef} />
          </div>
        </div>

        {/* ── Choice buttons ── */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {scenario.choices.map((choice, i) => (
            <button
              key={i}
              id={`choice-btn-${i}`}
              onClick={() => handleChoice(choice)}
              disabled={isTyping || gameOver}
              className="choice-btn text-sm"
            >
              {choice}
            </button>
          ))}
        </div>

        {/* ── Free-text input ── */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Or type your own response…"
            className="ur-input flex-1 text-sm py-2.5 px-4 rounded-full"
            id="game-custom-input"
            disabled={isTyping || gameOver}
          />
          <button
            type="submit"
            id="game-send-btn"
            className="btn btn-primary btn-sm rounded-full px-4 flex-shrink-0"
            disabled={isTyping || gameOver || !inputValue.trim()}
          >
            <Send size={15} />
          </button>
        </form>

        {/* Game over state */}
        {gameOver && (
          <div className="text-center mt-4 text-white/50 text-xs animate-fade-in">
            {suspicion >= 100 ? '⚠️ Mission failed — redirecting…' : '✅ Stage complete — well done!'}
          </div>
        )}

        {/* Turn progress */}
        {!gameOver && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-white/35 text-xs">Progress</span>
            <div className="flex-1 xp-bar-track h-1.5">
              <div
                className="h-full rounded-full bg-cyan-brand/70 transition-all duration-500"
                style={{ width: `${Math.min(100, (turnCount / 5) * 100)}%` }}
              />
            </div>
            <span className="text-white/35 text-xs">{turnCount}/5</span>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Game;
