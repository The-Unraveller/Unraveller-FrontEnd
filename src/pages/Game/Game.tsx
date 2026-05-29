import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, AlertTriangle, Zap, Send, Volume2, VolumeX, Mic, MicOff, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getMissions, sendGameMessage, getUserInventory, useItem } from '../../services/api';
import type { UserInventoryDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';

/* ─── Types ─── */
interface Message {
  role: 'npc' | 'player';
  text: string;
  xp?: number;
  feedback?: string;
}

/* ─── Scenario fallback data (populated from API) ─── */
const startChoicesMap: Record<number, string[]> = {
  1: ["Yes, let's go!", "I'm a bit nervous…", "What do we do first?", "Sounds great!"],
  2: ["Understood, ready!", "Can you repeat that?", "What's the first task?", "I'll do my best."],
  3: ["I'm ready to debate.", "Let's start the negotiation.", "What is the topic?", "Ready!"],
  4: ["Good morning, Mr. Vance.", "Let's start the interview.", "I'm ready for the questions.", "Thank you for having me."],
  5: ["I'm on the case.", "Give me the details.", "Where do I start?", "Understood. Let's solve this."]
};

const defaultScenario = {
  title: 'Loading…',
  stage: 'STAGE',
  bg: '/scenario_coffee.png',
  npcName: 'NPC',
  npcEmoji: '🤖',
  difficulty: 'Beginner',
  xpReward: 100,
  intro: 'Preparing your mission…',
  choices: ["Hello!", "Ready!"],
};

/* ─── Web Speech API (types provided by @types/dom-speech-recognition) ─── */

/* ─── Helper: speak text via TTS ─── */
const speakText = (text: string, onEnd?: () => void) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*_`#>~]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Prefer a natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

/* ─── Component ─── */
const Game = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const missionId = id ? parseInt(id, 10) : 1;

  /* Scenario state */
  const [scenario, setScenario] = useState(defaultScenario);

  /* Game state */
  const [messages, setMessages] = useState<Message[]>([
    { role: 'npc', text: defaultScenario.intro }
  ]);
  const [suspicion, setSuspicion] = useState(10);
  const [shouldShake, setShouldShake] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [inventory, setInventory] = useState<UserInventoryDto[]>([]);

  /* Voice — TTS */
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  /* Voice — STT */
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const chatRef = useRef<HTMLDivElement>(null);

  /* ─── STT setup ─── */
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSttSupported(false); return; }
    setSttSupported(true);
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };
    rec.onerror = (e: any) => {
      setIsListening(false);
      const errorMsg = e.error === 'not-allowed'
        ? 'Permission denied. Please allow microphone access in browser settings.'
        : e.error === 'no-speech'
        ? 'No speech detected. Please try speaking again.'
        : `Voice recognition error: ${e.error}. Try again.`;
      toast.error(errorMsg);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;

    return () => { rec.abort(); window.speechSynthesis?.cancel(); };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis?.cancel();
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('🎤 Listening… speak now!', { autoClose: 3000 });
    }
  };

  /* ─── TTS for a specific message ─── */
  const handleSpeak = useCallback((text: string, idx: number) => {
    if (speakingIndex === idx) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
      return;
    }
    setSpeakingIndex(idx);
    speakText(text, () => setSpeakingIndex(null));
  }, [speakingIndex]);

  /* ─── Inventory ─── */
  const loadInventory = () => {
    getUserInventory()
      .then((data) => setInventory(data.filter(item => item.quantity > 0)))
      .catch((err) => console.error('Failed to load inventory:', err));
  };

  const handleUseItem = async (itemId: number) => {
    if (isTyping || gameOver) return;
    try {
      const response = await useItem({ itemId, missionId });
      if (response.success) {
        toast.success(response.message);
        if (itemId === 2) setSuspicion(prev => Math.max(0, prev - 20));
        else if (itemId === 1) setSuspicion(prev => Math.max(0, prev - 10));
        loadInventory();
      } else {
        toast.error(response.message || 'Failed to use item.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Network error using item.');
    }
  };

  /* ─── Load mission from API ─── */
  useEffect(() => {
    getMissions()
      .then((data) => {
        const found = data.find(m => m.id === missionId);
        if (found) {
          const transformed = {
            title: found.title,
            stage: found.stage.toUpperCase(),
            bg: found.imageUrl || (missionId === 1 ? '/scenario_coffee.png' : missionId === 2 ? '/scenario_classroom.png' : '/scenario_detective.png'),
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
          const introMsg: Message = { role: 'npc', text: transformed.intro };
          setMessages([introMsg]);
          if (autoSpeak) speakText(transformed.intro);
        }
      })
      .catch((err) => console.error('Failed to load mission:', err));

    loadInventory();
  }, [missionId]);

  /* Auto-scroll */
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ─── Main send logic ─── */
  const processMessage = (text: string) => {
    if (isTyping || gameOver || !text.trim()) return;

    // Stop any ongoing TTS / STT
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);

    setMessages(prev => [...prev, { role: 'player', text }]);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    setIsTyping(true);

    sendGameMessage({ missionId, message: text })
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

          const npcMsg: Message = {
            role: 'npc',
            text: res.npcResponse,
            xp: res.xpEarned,
            feedback: res.feedback || undefined,
          };
          setMessages(prev => [...prev, npcMsg]);

          // Auto-speak NPC response if enabled
          if (autoSpeak) {
            const idx = messages.length + 1; // approximate next index
            speakText(res.npcResponse);
          }

          if (newSus >= 100 || res.isLose) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1800);
          } else if (res.isWin) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + res.xpEarned}`), 1800);
          } else if (newTurn >= 5) {
            setGameOver(true);
            const status = newSus < 50 ? 'success' : 'failed';
            setTimeout(() => navigate(`/result/${id}?status=${status}&xp=${totalXP + res.xpEarned}`), 1800);
          }
        }
      })
      .catch((err) => {
        console.error('API error, using mock fallback:', err);
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

          const fallbackText = isGood
            ? `That sounded quite natural! Your word choice fits the context perfectly. Keep going like this and you'll have people fooled easily.`
            : `Hmm, that felt a bit unnatural. Try using a complete sentence with more context. For example, add a polite opener.`;

          const npcMsg: Message = {
            role: 'npc',
            text: fallbackText,
            xp: xpGain,
            feedback: isGood ? 'Great use of natural phrasing!' : "Try starting with 'Could I...' or 'I was wondering if...' for a more natural tone."
          };
          setMessages(prev => [...prev, npcMsg]);
          if (autoSpeak) speakText(fallbackText);
          setIsTyping(false);

          if (newSus >= 100) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1800);
          } else if (newTurn >= 5 && newSus < 50) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + xpGain}`), 1800);
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

  /* Suspicion colour */
  const susColor = suspicion > 70 ? '#ef4444' : suspicion > 45 ? '#f59e0b' : '#10b981';
  const susLabel = suspicion > 70 ? 'CAO 🔴' : suspicion > 45 ? 'TRUNG BÌNH 🟡' : 'THẤP 🟢';

  return (
    <div className="app-bg min-h-screen flex flex-col">
      <Navbar isLoggedIn username={useGameStore.getState().user?.username || 'Learner'} />

      <main className="max-w-screen-sm mx-auto w-full px-3 py-4 flex-1">

        {/* ── Back + stage ── */}
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

          {/* Auto-speak toggle */}
          <button
            onClick={() => setAutoSpeak(v => !v)}
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border ${
              autoSpeak
                ? 'bg-cyan-brand/20 border-cyan-brand text-cyan-brand'
                : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
            }`}
            title={autoSpeak ? 'Auto-speak ON (click to mute)' : 'Auto-speak OFF (click to enable)'}
            id="auto-speak-toggle"
          >
            {autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{autoSpeak ? 'SPEAK ON' : 'MUTE'}</span>
          </button>
        </div>

        {/* ── Main game card ── */}
        <div className="ur-card rounded-2xl overflow-hidden mb-3">
          {/* Scenario image */}
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src={scenario.bg}
              alt={scenario.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

            {/* Suspicion bar */}
            <div className={`absolute top-3 left-3 right-3 transition-transform ${shouldShake ? 'animate-shake' : ''}`}>
              <div
                className="rounded-2xl px-3 py-2 backdrop-blur-md"
                style={{ background: 'rgba(15,12,30,0.75)' }}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/70 font-semibold">
                    <AlertTriangle size={12} style={{ color: susColor }} />
                    Mức Nghi Ngờ
                  </span>
                  <span className="font-black text-xs" style={{ color: susColor }}>
                    {suspicion}% — {susLabel}
                  </span>
                </div>
                <div className="sus-bar-track">
                  <div
                    className="sus-bar-fill transition-all duration-700"
                    style={{ width: `${suspicion}%`, backgroundColor: susColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Chat messages ── */}
          <div className="p-4 max-h-72 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'player' ? 'items-end' : 'items-start'}`}>
                <div className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} w-full`}>
                  {msg.role === 'npc' && (
                    <div className="w-7 h-7 rounded-full bg-purple-brand/40 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                      {scenario.npcEmoji}
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                      msg.role === 'npc'
                        ? 'rounded-tl-sm bg-navy-3/80 border border-purple-brand/20 text-white/90'
                        : 'rounded-tr-sm bg-purple-brand/60 border border-purple-light/30 text-white'
                    }`}
                  >
                    {msg.text}

                    {/* XP badge */}
                    {msg.xp != null && msg.role === 'npc' && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Zap size={10} className="text-xp-orange" />
                        <span className="text-xp-orange text-[10px] font-bold">+{msg.xp} XP đã nhận</span>
                      </div>
                    )}
                  </div>

                  {/* Speaker button for NPC messages */}
                  {msg.role === 'npc' && (
                    <button
                      onClick={() => handleSpeak(msg.text, i)}
                      className={`ml-1.5 mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        speakingIndex === i
                          ? 'bg-cyan-brand text-navy-1 animate-pulse'
                          : 'bg-white/5 text-white/30 hover:bg-cyan-brand/20 hover:text-cyan-brand'
                      }`}
                      title={speakingIndex === i ? 'Stop speaking' : 'Hear this message'}
                      id={`speak-btn-${i}`}
                    >
                      {speakingIndex === i ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    </button>
                  )}
                </div>

                {/* Feedback coaching tip under NPC message */}
                {msg.role === 'npc' && msg.feedback && (
                  <div className="ml-9 mt-1.5 flex items-start gap-1.5 max-w-[82%]">
                    <Check size={10} className="text-cyan-brand mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-cyan-brand/70 leading-snug italic">{msg.feedback}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
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

        {/* ── Inventory Tools ── */}
        {inventory.length > 0 && (
          <div className="mb-3 p-3 rounded-2xl bg-navy-2 border border-white/5 flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">🧰 ĐỒ DÙNG</span>
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => handleUseItem(item.itemId)}
                  disabled={item.quantity <= 0 || isTyping || gameOver}
                  className="px-3 py-1.5 rounded-xl bg-purple-brand/20 border border-purple-brand/30 hover:border-cyan-brand/80 text-xs font-mono flex items-center gap-1.5 transition-all text-white/90 disabled:opacity-30 disabled:hover:border-purple-brand/30"
                  title={item.description}
                >
                  <span>{item.emoji}</span>
                  <span className="font-bold">{item.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-cyan-brand">{item.quantity}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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

        {/* ── Free-text input + mic ── */}
        <form onSubmit={handleSend} className="flex gap-2 items-center">

          {/* Microphone button */}
          {sttSupported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={isTyping || gameOver}
              id="mic-btn"
              className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
                isListening
                  ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-purple-brand/20 hover:border-purple-brand hover:text-white'
              } disabled:opacity-30`}
              title={isListening ? 'Stop listening' : 'Speak your answer (English)'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={isListening ? '🎤 Đang nghe...' : 'Nhập hoặc nói câu trả lời tiếng Anh...'}
            className={`ur-input flex-1 text-sm py-2.5 px-4 rounded-full transition-all ${isListening ? 'border-red-400/50 bg-red-500/5' : ''}`}
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

        {/* STT status hint */}
        {sttSupported && (
          <p className="text-center text-[10px] text-white/20 mt-2 font-mono">
            {isListening
              ? '🔴 Đang ghi âm... hãy nói rõ bằng tiếng Anh'
              : '🎤 Nhấn micro để nói câu trả lời'}
          </p>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="text-center mt-4 text-white/50 text-xs animate-fade-in">
            {suspicion >= 100 ? '⚠️ Nhiệm vụ thất bại — đang chuyển trang...' : '✅ Hoàn thành giai đoạn — xuất sắc!'}
          </div>
        )}

        {/* Turn progress */}
        {!gameOver && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-white/35 text-xs">Tiến độ</span>
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
