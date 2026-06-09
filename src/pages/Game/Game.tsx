import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, AlertTriangle, Zap, Send, Check, X, Sparkles, Volume2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Seo from '../../components/seo/Seo';
import Footer from '../../components/layout/Footer';
import { getMissions, sendGameMessage, getUserInventory, useItem, getGameSession, resetGameSession } from '../../services/api';
import type { UserInventoryDto, GameSessionDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';

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

/* ─── Grammar Syntax Puzzles for Terminal Hack ─── */
const syntaxPuzzlesMap: Record<number, { question: string; scrambled: string[]; answer: string; hint: string }[]> = {
  1: [
    {
      question: "Sắp xếp để tạo thành câu yêu cầu gọi món lịch sự trong quán cà phê:",
      scrambled: ["like", "order", "cup", "I", "would", "coffee.", "to", "a", "of"],
      answer: "I would like to order a cup of coffee.",
      hint: "Bắt đầu bằng chủ ngữ 'I' tiếp theo là cụm 'would like' và động từ 'to order'."
    },
    {
      question: "Sắp xếp để tạo câu hỏi xin xem thực đơn một cách lịch sự:",
      scrambled: ["menu,", "please?", "I", "see", "the", "Could"],
      answer: "Could I see the menu, please?",
      hint: "Dùng từ khuyết thiếu 'Could' đứng đầu câu hỏi xin phép lịch sự."
    }
  ],
  2: [
    {
      question: "Sắp xếp câu bị động xác nhận báo cáo đã được bạn nộp:",
      scrambled: ["report", "the", "by", "submitted", "was", "me."],
      answer: "The report was submitted by me.",
      hint: "Thể bị động ở quá khứ: S + was/were + V3/ed + by O."
    }
  ],
  3: [
    {
      question: "Sắp xếp câu điều kiện loại 1 hợp lệ để đàm phán:",
      scrambled: ["If", "help", "me,", "I", "will", "you", "bypass", "the", "server."],
      answer: "If you help me, I will bypass the server.",
      hint: "Mệnh đề If ở hiện tại đơn (If S + V), mệnh đề chính dùng (S + will + V)."
    }
  ],
  4: [
    {
      question: "Sắp xếp câu chứa liên từ 'because' để trả lời lý do:",
      scrambled: ["because", "I", "applied", "this", "job", "I", "the", "want", "challenges.", "for"],
      answer: "I applied for this job because I want the challenges.",
      hint: "Cấu trúc: Mệnh đề kết quả + because + Mệnh đề nguyên nhân."
    }
  ],
  5: [
    {
      question: "Sắp xếp câu mô tả hiện trường vụ án sử dụng trạng từ và thì quá khứ đơn:",
      scrambled: ["quickly", "evidence.", "gathered", "The", "detective", "the"],
      answer: "The detective quickly gathered the evidence.",
      hint: "Trạng từ chỉ cách thức 'quickly' thường đứng trước động từ thường 'gathered'."
    }
  ],
  6: [
    {
      question: "Sắp xếp câu trần thuật gián tiếp hợp lệ để báo cáo cuộc hội thoại:",
      scrambled: ["She", "told", "she", "ready", "was", "the", "mission.", "me", "for"],
      answer: "She told me she was ready for the mission.",
      hint: "Câu gián tiếp: S + told + me + S + was + adj..."
    }
  ]
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
  grammarTarget: '',
};

/* ─── Feedback Parser Helper ─── */
const parseFeedback = (feedbackStr: string) => {
  let typos = "Không phát hiện lỗi.";
  let natural = "";
  let explanation = "";

  if (!feedbackStr) return { typos, natural, explanation };

  const typoMarker = "* Sửa lỗi (nếu có):";
  const naturalMarker = "* Diễn đạt tự nhiên hơn:";
  const explanationMarker = "* Giải thích ngắn gọn:";

  let typoIdx = feedbackStr.indexOf(typoMarker);
  let naturalIdx = feedbackStr.indexOf(naturalMarker);
  let explanationIdx = feedbackStr.indexOf(explanationMarker);

  if (typoIdx === -1) typoIdx = feedbackStr.indexOf("Sửa lỗi");
  if (naturalIdx === -1) naturalIdx = feedbackStr.indexOf("Diễn đạt tự nhiên");
  if (explanationIdx === -1) explanationIdx = feedbackStr.indexOf("Giải thích ngắn gọn");

  if (typoIdx !== -1) {
    let endIdx = naturalIdx !== -1 ? naturalIdx : (explanationIdx !== -1 ? explanationIdx : feedbackStr.length);
    typos = feedbackStr.substring(typoIdx + (feedbackStr.includes(typoMarker) ? typoMarker.length : 8), endIdx).trim();
  }
  if (naturalIdx !== -1) {
    let endIdx = explanationIdx !== -1 ? explanationIdx : feedbackStr.length;
    natural = feedbackStr.substring(naturalIdx + (feedbackStr.includes(naturalMarker) ? naturalMarker.length : 22), endIdx).trim();
  }
  if (explanationIdx !== -1) {
    explanation = feedbackStr.substring(explanationIdx + (feedbackStr.includes(explanationMarker) ? explanationMarker.length : 19)).trim();
  }

  const clean = (str: string) => str.replace(/^[:\s\-*]+/, '').trim();

  return {
    typos: clean(typos) || "Không phát hiện lỗi.",
    natural: clean(natural),
    explanation: clean(explanation) || clean(feedbackStr)
  };
};

const formatRoleplayText = (text: string) => {
  if (!text) return '';
  const parts = text.split('*');
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} className="text-white/50 italic font-sans font-normal">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
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
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const speakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ đọc âm thanh (Text-to-Speech).');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Đọc tốc độ hơi chậm để dễ nghe tiếng Anh chuẩn

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en-') && v.name.includes('Natural'))
      || voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* Terminal Syntax Hack Mini-game States */
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [puzzleResult, setPuzzleResult] = useState<'success' | 'failed' | null>(null);
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);

  /* Session Resume/Retry States */
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [sessionData, setSessionData] = useState<GameSessionDto | null>(null);


  const chatRef = useRef<HTMLDivElement>(null);



  /* ─── Terminal Syntax Hack Puzzles ─── */
  const startTerminalHack = () => {
    const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
    const puzzle = puzzles[0];
    setCurrentPuzzleIdx(0);
    setSelectedWords([]);
    setScrambledWords([...puzzle.scrambled].sort(() => Math.random() - 0.5));
    setPuzzleResult(null);
    setShowPuzzleHint(false);
    setShowTerminalModal(true);
  };

  const handleWordClick = (word: string, index: number) => {
    if (puzzleResult === 'success') return;
    setSelectedWords(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectedWordClick = (word: string, index: number) => {
    if (puzzleResult === 'success') return;
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setScrambledWords(prev => [...prev, word]);
  };

  const handleCheckPuzzle = () => {
    const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
    const puzzle = puzzles[currentPuzzleIdx];
    const userSentence = selectedWords.join(' ');
    
    const normalize = (str: string) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").replace(/\s+/g," ").trim().toLowerCase();

    if (normalize(userSentence) === normalize(puzzle.answer)) {
      setPuzzleResult('success');
      setTotalXP(prev => prev + 50);
      toast.success("HACK THÀNH CÔNG! Thưởng +50 XP & Phục hồi Năng lượng!");
    } else {
      setPuzzleResult('failed');
      toast.error("HACK THẤT BẠI! Hãy kiểm tra kỹ cú pháp.");
    }
  };

  const handleResetPuzzle = () => {
    const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
    const puzzle = puzzles[currentPuzzleIdx];
    setSelectedWords([]);
    setScrambledWords([...puzzle.scrambled].sort(() => Math.random() - 0.5));
    setPuzzleResult(null);
  };

  const handleNextPuzzle = () => {
    const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
    const nextIdx = currentPuzzleIdx + 1;
    if (nextIdx < puzzles.length) {
      setCurrentPuzzleIdx(nextIdx);
      setSelectedWords([]);
      setScrambledWords([...puzzles[nextIdx].scrambled].sort(() => Math.random() - 0.5));
      setPuzzleResult(null);
      setShowPuzzleHint(false);
    } else {
      setShowTerminalModal(false);
    }
  };

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
        if (response.newSuspicionLevel !== undefined) {
          setSuspicion(response.newSuspicionLevel);
        }
        if (response.hint) {
          setActiveHint(response.hint);
        }
        loadInventory();
      } else {
        toast.error(response.message || 'Không thể sử dụng vật phẩm.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối khi sử dụng vật phẩm.');
    }
  };

  const handleResume = () => {
    if (!sessionData) return;

    const restoredMessages: Message[] = [];
    restoredMessages.push({ role: 'npc', text: scenario.intro });

    for (const h of sessionData.history) {
      if (h.playerMessage) {
        restoredMessages.push({ role: 'player', text: h.playerMessage });
      }
      if (h.npcResponse) {
        restoredMessages.push({
          role: 'npc',
          text: h.npcResponse,
          feedback: h.feedback || undefined
        });
      }
    }

    setMessages(restoredMessages);
    setSuspicion(sessionData.currentSuspicion);
    setTurnCount(sessionData.turnCount);
    setTotalXP(sessionData.xpEarned);
    setShowResumeModal(false);
    toast.success("Đã khôi phục tiến độ nhiệm vụ trước đó!");
  };

  const handleReset = async () => {
    try {
      await resetGameSession(missionId);
      setMessages([{ role: 'npc', text: scenario.intro }]);
      setSuspicion(10); 
      setTurnCount(0);
      setTotalXP(0);
      setShowResumeModal(false);
      toast.success("Đã khởi động lại nhiệm vụ!");
    } catch (err) {
      console.error('Failed to reset session:', err);
      toast.error("Không thể khởi động lại nhiệm vụ.");
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
            grammarTarget: found.grammarTarget || '',
          };
          setScenario(transformed);
          // Now check for active session before setting initial messages
          getGameSession(missionId)
            .then((session) => {
              if (session && session.hasActiveSession && session.history.length > 0) {
                setSessionData(session);
                setShowResumeModal(true);
              } else {
                // No active session, start from intro
                setMessages([{ role: 'npc', text: transformed.intro }]);
              }
            })
            .catch((err) => {
              console.error('Failed to load session, falling back to intro:', err);
              setMessages([{ role: 'npc', text: transformed.intro }]);
            });
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

    // Clear active hint when sending a message
    setActiveHint(null);

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

          // Synchronize user energy state from the server response
          if (res.updatedEnergy !== undefined && res.updatedMaxEnergy !== undefined) {
            useGameStore.getState().updateUser({
              energy: res.updatedEnergy,
              maxEnergy: res.updatedMaxEnergy
            });
          }

          const npcMsg: Message = {
            role: 'npc',
            text: res.npcResponse,
            xp: res.xpEarned,
            feedback: res.feedback || undefined,
          };
          setMessages(prev => [...prev, npcMsg]);

          if (newSus >= 100 || res.isLose) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1800);
          } else if (res.isWin) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + res.xpEarned}&token=${res.completionToken || ''}`), 1800);
          } else if (newTurn >= 10) {
            setGameOver(true);
            const status = newSus < 50 ? 'success' : 'failed';
            const tokStr = status === 'success' ? `&token=${res.completionToken || ''}` : '';
            setTimeout(() => navigate(`/result/${id}?status=${status}&xp=${totalXP + res.xpEarned}${tokStr}`), 1800);
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
          setIsTyping(false);

          if (newSus >= 100) {
            setGameOver(true);
            setTimeout(() => navigate(`/result/${id}?status=failed`), 1800);
          } else if (newTurn >= 10 && newSus < 50) {
            setGameOver(true);
            const mockToken = `UNRV-MOCK-${Math.floor(Math.random() * 900000 + 100000)}`;
            setTimeout(() => navigate(`/result/${id}?status=success&xp=${totalXP + xpGain}&token=${mockToken}`), 1800);
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
    <>
      <Seo title="Dang Choi - Mo Phong Thuc Te" description="Dang trai nghiem kich ban hoc tieng Anh tuong tac voi NPC AI. Kiem tra do tu nhien cua loi noi cua ban." keywords="tro choi, NPC AI, tuong tac, ky nang noi" canonical="/game" noIndex />
      <div className="app-bg min-h-screen flex flex-col">
      <Navbar isLoggedIn username={useGameStore.getState().user?.username || 'Learner'} />

      <main className="max-w-screen-xl mx-auto w-full px-3 py-4 flex-1">

        {/* ── Back + stage ── */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors"
            id="game-back-btn"
          >
            <ChevronLeft size={15} /> Courses
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={startTerminalHack}
              className="text-[10px] font-mono border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 px-2 py-0.5 rounded transition-all hover:bg-cyan-500/10 flex items-center gap-1 animate-pulse"
              title="Hack lỗi cú pháp để nhận năng lượng & XP miễn phí"
            >
              🔌 Hack Cú Pháp
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] font-mono border border-red-500/30 hover:border-red-500 text-red-400 px-2 py-0.5 rounded transition-all hover:bg-red-500/10"
              title="Khởi động lại nhiệm vụ này từ đầu"
            >
              🔄 Làm lại
            </button>
            <span className="badge badge-purple text-[10px]">{scenario.stage}</span>
            <span className="badge badge-xp text-[10px]">
              <Zap size={9} /> +{totalXP} XP
            </span>
          </div>
        </div>

        {/* ── Immersive Split-Panel Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch mb-3">

          {/* ========================================================================= */}
          {/* LEFT PANEL: NPC HOLOGRAM ARENA (KHUNG NHÂN VẬT NPC & BACKGROUND) */}
          {/* ========================================================================= */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div 
              className={`ur-card relative rounded-3xl overflow-hidden shadow-glow-cyan flex flex-col min-h-[380px] md:min-h-[460px] transition-transform duration-500 ${shouldShake ? 'animate-shake' : ''}`}
            >
              {/* Sci-fi Backdrop (Scenario blurred bg) */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${scenario.npcEmoji === '☕' ? 'opacity-100 blur-0 scale-100' : 'filter blur-[4px] opacity-25 scale-105'}`} 
                style={{ backgroundImage: `url(${scenario.bg})` }} 
              />
              {/* Standing NPC in foreground for Coffee Stage */}
              {scenario.npcEmoji === '☕' && (() => {
                const getMoodUrl = () => {
                  if (suspicion <= 30) return '/npc/barista/happy.png';
                  if (suspicion <= 60) return '/npc/barista/normal.png';
                  if (suspicion <= 80) return '/npc/barista/suspect.png';
                  return '/npc/barista/angry.png';
                };
                return (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 md:w-72 h-[320px] md:h-[385px] pointer-events-none z-0">
                    <img 
                      src={getMoodUrl()}
                      alt="Barista standing in foreground"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.35)] animate-float"
                    />
                  </div>
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-navy/40 pointer-events-none" />

              {/* HUD readout bars */}
              <div className="relative p-4 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-sm z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-cyan-brand">
                    [GIAO DIỆN PHÂN TÍCH ĐANG HOẠT ĐỘNG]
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{scenario.npcName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  <span className="text-[9px] font-mono text-white/50 tracking-wider">HUD_v2.05</span>
                </div>
              </div>

              {/* NPC Sprite Container (Reacting to 4 Emotional States) */}
              {(() => {
                const getEmotion = () => {
                  if (suspicion <= 30) return { key: 'happy', label: 'VUI VẺ 🟢', color: '#10b981', icon: '😊', desc: 'Tín nhiệm cao - Không phát hiện hoạt động nghi ngờ.' };
                  if (suspicion <= 60) return { key: 'normal', label: 'BÌNH THƯỜNG 🟡', color: '#f59e0b', icon: '😐', desc: 'Trạng thái ổn định - Đang giám sát diễn tiến cuộc hội thoại.' };
                  if (suspicion <= 80) return { key: 'puzzled', label: 'BĂN KHOĂN 🟠', color: '#f97316', icon: '🤔', desc: 'Phát hiện bất thường - Đang xác minh dữ liệu cú pháp.' };
                  return { key: 'angry', label: 'TỰC GIẬN 🔴', color: '#ef4444', icon: '😡', desc: 'MỨC NGHI NGỜ ĐẠT ĐỈNH - HỆ THỐNG AN NINH ĐANG ĐƯỢC KÍCH HOẠT!' };
                };
                const emotion = getEmotion();

                return (
                  <div className="relative flex-1 flex flex-col items-center justify-center p-6 select-none z-10">
                    
                    {/* Radar ripple rings */}
                    <div 
                      className="absolute w-44 h-44 rounded-full border border-dashed animate-radar transition-colors duration-500" 
                      style={{ borderColor: `${emotion.color}45` }} 
                    />
                    <div 
                      className="absolute w-32 h-32 rounded-full border border-double animate-ping transition-colors duration-500" 
                      style={{ animationDuration: '3.5s', borderColor: `${emotion.color}25` }} 
                    />

                    {/* NPC Digital Target Reticle */}
                    <div className="absolute border border-cyan-brand/10 w-48 h-48 rounded-xl flex items-center justify-between p-1 opacity-40 pointer-events-none">
                      <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-brand/40" />
                      <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-brand/40" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-brand/40" />
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-brand/40" />
                    </div>

                    {/* NPC Character Face/Avatar */}
                    {/* NPC Character Face/Avatar */}
                    {scenario.npcEmoji === '☕' ? (
                      /* For cafe stage, the NPC is rendered behind the counter (handled via the absolute standing NPC box).
                         We display a holographic scan frame targeting her. */
                      <div className="w-36 h-44 flex items-center justify-center relative pointer-events-none">
                        <div 
                          className="absolute w-36 h-36 border border-dashed rounded-xl flex flex-col items-center justify-center animate-pulse z-10"
                          style={{ borderColor: emotion.color, boxShadow: `0 0 20px ${emotion.color}25` }}
                        >
                          <span className="absolute top-2 left-2 text-[7px] font-mono opacity-50" style={{ color: emotion.color }}>
                            LOCK_ON
                          </span>
                          <span className="absolute bottom-2 right-2 text-[7px] font-mono opacity-50" style={{ color: emotion.color }}>
                            [HUD_SCAN]
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Standard Avatar circle for other stages */
                      <div 
                        className="w-36 h-36 rounded-full border-2 border-dashed flex flex-col items-center justify-center bg-navy-3/80 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative animate-hologram animate-float transition-all duration-500 group"
                        style={{ borderColor: emotion.color, boxShadow: `0 0 35px ${emotion.color}35` }}
                      >
                        {/* Interactive scanned data points */}
                        <span className="absolute top-2 left-2 text-[8px] font-mono opacity-40" style={{ color: emotion.color }}>
                          [EMO_{emotion.key.toUpperCase()}]
                        </span>
                        <span className="absolute bottom-2 right-2 text-[8px] font-mono opacity-40" style={{ color: emotion.color }}>
                          SYS_OK
                        </span>

                        <span className="text-7xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] transform transition-transform duration-500 active:scale-95 cursor-pointer">
                          {emotion.icon}
                        </span>
                      </div>
                    )}

                    {/* Emotion analyzer summary HUD overlay */}
                    <div className="mt-6 w-full text-center">
                      <span 
                        className="inline-block text-[10px] font-bold font-mono tracking-wider px-3 py-1 rounded-full border mb-2 transition-all duration-500 shadow-sm"
                        style={{ backgroundColor: `${emotion.color}15`, borderColor: `${emotion.color}40`, color: emotion.color }}
                      >
                        TÂM TRẠNG: {emotion.label}
                      </span>
                      <p className="text-[11px] text-white/60 px-4 leading-normal font-sans font-medium min-h-[32px]">
                        {emotion.desc}
                      </p>
                    </div>

                    {/* Suspicion Bar hud frame inside Left Panel */}
                    <div 
                      className="w-full mt-4 p-3 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1 text-white/50 font-bold font-mono text-[10px]">
                          <AlertTriangle size={11} style={{ color: emotion.color }} />
                          GIÁM SÁT MỨC NGHI NGỜ
                        </span>
                        <span className="font-bold text-xs" style={{ color: emotion.color }}>
                          {suspicion}%
                        </span>
                      </div>
                      <div className="sus-bar-track bg-white/5 h-2">
                        <div
                          className="sus-bar-fill transition-all duration-700 h-full rounded-full"
                          style={{ width: `${suspicion}%`, backgroundColor: emotion.color, boxShadow: `0 0 10px ${emotion.color}` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-white/40">
                        <div>TÍN NHIỆM: <span className="font-bold text-white/75">{100 - suspicion}%</span></div>
                        <div className="text-right">AN NINH: <span className="font-bold text-white/75">{suspicion >= 80 ? 'BỊ ĐỘC' : 'ỔN ĐỊNH'}</span></div>
                      </div>
                    </div>

                    <GoogleAd type="sidebar" className="mt-4 w-full animate-fade-in" />
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: CYBERPUNK CHAT BOX & ACTIONS STATION (KHUNG CHAT BOX) */}
          {/* ========================================================================= */}
          <div className="md:col-span-7 flex flex-col gap-3">
            
            {/* ── Grammar target banner ── */}
            {scenario.grammarTarget && (
              <div className="p-3 rounded-2xl bg-cyan-brand/10 border border-cyan-brand/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm animate-fade-in flex items-start gap-2.5">
                <span className="text-sm text-cyan-brand flex-shrink-0 mt-0.5">🎯</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold font-mono tracking-widest text-cyan-brand uppercase block mb-0.5">
                    MỤC TIÊU NGỮ PHÁP (GRAMMAR QUEST)
                  </span>
                  <p className="text-xs text-white/95 leading-relaxed font-sans font-semibold">
                    {scenario.grammarTarget}
                  </p>
                </div>
              </div>
            )}

            {/* Chat timelines card */}
            <div className="ur-card rounded-2xl overflow-hidden flex flex-col flex-1">
              
              <div className="p-2 px-4 bg-white/5 border-b border-white/5 flex items-center justify-between text-[9px] font-mono text-white/35">
                <span>[KÊNH LIÊN LẠC ĐÃ ĐƯỢC MÃ HÓA]</span>
                <span>LƯỢT THOẠI: {turnCount}/10</span>
              </div>

              {/* ── Chat messages timeline ── */}
              <div className="p-4 max-h-[300px] md:max-h-[360px] overflow-y-auto space-y-4 flex-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'player' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} w-full`}>
                      {msg.role === 'npc' && (
                        <div className="w-7 h-7 rounded-full bg-purple-brand/40 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5 border border-purple-light/25 font-bold">
                          {scenario.npcEmoji}
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed rounded-2xl relative group ${
                          msg.role === 'npc'
                            ? 'rounded-tl-sm bg-navy-3/80 border border-purple-brand/20 text-white/90 pr-9'
                            : 'rounded-tr-sm bg-purple-brand/60 border border-purple-light/30 text-white shadow-md'
                        }`}
                      >
                        {formatRoleplayText(msg.text)}

                        {/* Speaker Button for Text to Speech */}
                        {msg.role === 'npc' && (
                          <button
                            onClick={() => speakText(msg.text, i)}
                            className={`absolute top-2.5 right-2.5 p-1 rounded-lg transition-all duration-200 ${
                              speakingIndex === i
                                ? 'bg-cyan-brand/20 border border-cyan-brand/50 text-cyan-brand scale-110 animate-pulse opacity-100'
                                : 'bg-[#0f0c1e]/75 hover:bg-cyan-brand/20 border border-white/5 hover:border-cyan-brand/35 text-white/40 hover:text-cyan-brand opacity-0 group-hover:opacity-100 focus:opacity-100'
                            }`}
                            title={speakingIndex === i ? "Dừng đọc" : "Nghe phát âm (TTS)"}
                            type="button"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}

                        {/* XP badge */}
                        {msg.xp != null && msg.role === 'npc' && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <Zap size={10} className="text-xp-orange" />
                            <span className="text-xp-orange text-[10px] font-bold">+{msg.xp} XP đã nhận</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback coaching tip under NPC message */}
                    {msg.role === 'npc' && msg.feedback && (() => {
                      const parsed = parseFeedback(msg.feedback);
                      const hasTypos = parsed.typos && !parsed.typos.includes("Không phát hiện lỗi") && !parsed.typos.includes("Không có lỗi");

                      return (
                        <div className="ml-9 mt-2 mb-1 p-3.5 rounded-2xl bg-navy-2/95 border border-purple-brand/20 shadow-[0_4px_20px_rgba(124,58,237,0.08)] max-w-[82%] flex flex-col gap-2.5 animate-fade-in backdrop-blur-md">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[9px] font-bold font-mono tracking-wider text-cyan-brand flex items-center gap-1">
                              <Sparkles size={11} className="animate-pulse" />
                              SYSTEM SYNTAX SHIELD v1.0.4
                            </span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${hasTypos ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                              {hasTypos ? '⚠️ PHÁT HIỆN BẤT THƯỜNG' : '🛡️ CÚ PHÁP AN TOÀN'}
                            </span>
                          </div>

                          {/* 🔴 Section: Typos & Errors */}
                          <div className="flex items-start gap-2 text-xs">
                            <span className="text-sm mt-0.5">{hasTypos ? '🔴' : '🟢'}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-bold font-mono text-white/30 uppercase block mb-0.5">Cú pháp & Chính tả</span>
                              <p className={`font-sans leading-normal text-xs ${hasTypos ? 'text-red-400 font-medium' : 'text-white/80'}`}>
                                {parsed.typos}
                              </p>
                            </div>
                          </div>

                          {/* 🟡 Section: Recommended Patch */}
                          {parsed.natural && (
                            <div className="flex items-start gap-2 text-xs border-t border-white/5 pt-2">
                              <span className="text-sm mt-0.5">🟡</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-bold font-mono text-white/30 uppercase block mb-0.5">Đề xuất bản xứ (Patch)</span>
                                <p 
                                  className="font-mono text-cyan-brand leading-normal text-xs font-semibold bg-cyan-brand/5 p-1.5 rounded border border-cyan-brand/10 select-all cursor-pointer hover:bg-cyan-brand/10 transition-colors"
                                  title="Click để copy câu mẫu"
                                  onClick={() => {
                                    navigator.clipboard.writeText(parsed.natural);
                                    toast.success("Đã sao chép câu mẫu đề xuất!");
                                  }}
                                >
                                  {parsed.natural}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* 🔵 Section: Logic Explanation */}
                          {parsed.explanation && (
                            <div className="flex items-start gap-2 text-xs border-t border-white/5 pt-2">
                              <span className="text-sm mt-0.5">🔵</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-bold font-mono text-white/30 uppercase block mb-0.5">Nhật ký phân tích (Log)</span>
                                <p className="font-sans text-white/70 leading-relaxed text-xs">
                                  {parsed.explanation}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-purple-brand/40 flex items-center justify-center text-sm flex-shrink-0 mr-2 border border-purple-light/20">
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
              <div className="p-3 rounded-2xl bg-navy-2 border border-white/5 flex flex-col gap-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">🧰 ĐỒ DÙNG HACKER</span>
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

            {/* ── AI Hint Card ── */}
            {activeHint && (
              <div className="p-4 rounded-2xl bg-cyan-brand/10 border border-cyan-brand/35 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-fade-in relative backdrop-blur-md">
                <button 
                  onClick={() => setActiveHint(null)} 
                  className="absolute top-3.5 right-3.5 text-white/40 hover:text-white transition-colors"
                  type="button"
                >
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-brand font-bold">GỢI Ý TỪ AI MASTER</span>
                </div>
                <p className="text-xs text-white/95 leading-relaxed font-sans">{activeHint}</p>
              </div>
            )}

            {/* ── Free-text input ── */}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Viết câu trả lời tiếng Anh của bạn..."
                className="ur-input flex-1 text-sm py-2.5 px-4 rounded-full"
                id="game-custom-input"
                disabled={isTyping || gameOver}
                autoComplete="off"
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

            {/* Game over readout */}
            {gameOver && (
              <div className="text-center mt-2 text-white/50 text-xs animate-fade-in font-mono">
                {suspicion >= 100 ? '⚠️ PHÁT HIỆN MỐI ĐE DỌA AN NINH — ĐANG TỰ ĐỘNG NGẮT KẾT NỐI...' : '✅ GIẢI MÃ THÀNH CÔNG — ĐANG ĐĂNG XUẤT...'}
              </div>
            )}

            {/* Turn progress footer */}
            {!gameOver && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/35 text-[10px] font-mono">TIẾN TRÌNH QUÉT MÃ HÓA</span>
                <div className="flex-1 xp-bar-track h-1.5">
                  <div
                    className="h-full rounded-full bg-cyan-brand/70 transition-all duration-500"
                    style={{ width: `${Math.min(100, (turnCount / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-white/35 text-xs font-mono">{turnCount}/10</span>
              </div>
            )}

          </div>

        </div>

        {/* Resume Mission Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-white">
            <div className="w-full max-w-md bg-navy-2 border border-purple-brand/30 p-8 rounded-2xl relative shadow-glow-purple animate-fade-in text-center">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center justify-center gap-2 tracking-wider">
                <span className="text-purple-brand">🕵️‍♂️</span> TIẾP TỤC NHIỆM VỤ?
              </h3>
              <p className="text-white/60 text-xs mb-6 leading-relaxed">
                Phát hiện tiến trình chơi dở dang của nhiệm vụ này. Bạn có muốn tiếp tục hay muốn chơi lại từ đầu?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-full border border-red-500/40 hover:border-red-500 text-red-400 font-bold uppercase transition-all text-xs font-mono bg-transparent"
                >
                  Chơi lại (Reset)
                </button>
                <button
                  onClick={handleResume}
                  className="w-full py-2.5 rounded-full bg-gradient-brand text-white font-bold uppercase hover:opacity-90 transition-all text-xs font-mono shadow-glow-purple"
                >
                  Tiếp tục (Resume)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Terminal Syntax Hack Modal */}
        {showTerminalModal && (() => {
          const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
          const puzzle = puzzles[currentPuzzleIdx];

          return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono text-white animate-fade-in">
              <div className="w-full max-w-lg bg-navy-2 border border-cyan-brand/40 p-6 rounded-2xl relative shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col gap-4">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-brand animate-ping" />
                    <span className="text-sm font-bold text-cyan-brand tracking-wider">
                      🔌 TERMINAL SYNTAX BYPASS v2.4
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowTerminalModal(false)}
                    className="text-white/40 hover:text-white transition-colors text-xs"
                  >
                    [THOÁT X]
                  </button>
                </div>

                {/* Subtitle / Quest details */}
                <div>
                  <span className="text-[10px] font-bold text-white/40 block mb-1">
                    CÂU HỎI {currentPuzzleIdx + 1}/{puzzles.length}
                  </span>
                  <p className="text-xs text-white/90 leading-relaxed font-sans font-semibold">
                    {puzzle.question}
                  </p>
                </div>

                {/* Workspace area (Selected sentence) */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 min-h-[70px] flex flex-wrap gap-2 items-center justify-center relative">
                  {selectedWords.length === 0 ? (
                    <span className="text-[10px] text-white/20 select-none">
                      (Nhấp vào các khối từ bên dưới để bắt đầu sắp xếp câu)
                    </span>
                  ) : (
                    selectedWords.map((word, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectedWordClick(word, i)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-brand/20 border border-cyan-brand/40 text-xs text-cyan-brand font-bold font-mono hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all shadow-[0_2px_8px_rgba(6,182,212,0.1)]"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Scrambled words warehouse */}
                <div className="p-4 rounded-xl bg-navy-3/40 border border-white/5 flex flex-wrap gap-2 items-center justify-center min-h-[80px]">
                  {scrambledWords.length === 0 && selectedWords.length > 0 ? (
                    <span className="text-[10px] text-white/20 select-none">
                      (Đã xếp hết các từ vào bảng giải)
                    </span>
                  ) : (
                    scrambledWords.map((word, i) => (
                      <button
                        key={i}
                        onClick={() => handleWordClick(word, i)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-brand hover:bg-cyan-brand/10 transition-all text-xs font-mono font-bold"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Puzzle hint */}
                {showPuzzleHint && (
                  <div className="p-3 rounded-lg bg-purple-brand/5 border border-purple-brand/20 text-[10px] font-sans text-white/80 leading-relaxed animate-fade-in flex items-start gap-2">
                    <span>💡</span>
                    <span>{puzzle.hint}</span>
                  </div>
                )}

                {/* Result alerts */}
                {puzzleResult === 'success' && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center text-xs font-bold font-mono flex items-center justify-center gap-1.5 animate-bounce">
                    <span>🛡️ ĐÃ CẤP QUYỀN TRUY CẬP: GIẢI MÃ THÀNH CÔNG (+50 XP)</span>
                  </div>
                )}
                {puzzleResult === 'failed' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs font-bold font-mono flex items-center justify-center gap-1.5 animate-pulse">
                    <span>⚠️ LỖI CÚ PHÁP: KÍCH HOẠT CHẶN BẢO MẬT AN NINH</span>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="flex gap-2.5 border-t border-white/5 pt-3.5">
                  <button
                    onClick={() => setShowPuzzleHint(!showPuzzleHint)}
                    className="px-3 py-2 rounded-xl border border-purple-brand/30 hover:border-purple-brand text-xs font-bold font-sans text-purple-light flex-1"
                  >
                    {showPuzzleHint ? "Ẩn gợi ý" : "Xem gợi ý 💡"}
                  </button>
                  <button
                    onClick={handleResetPuzzle}
                    className="px-3 py-2 rounded-xl border border-white/10 hover:border-white text-xs font-bold font-sans text-white/60 flex-1"
                  >
                    Xếp lại 🔄
                  </button>
                  {puzzleResult === 'success' ? (
                    <button
                      onClick={handleNextPuzzle}
                      className="px-3 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold font-sans shadow-glow-purple flex-1"
                    >
                      {currentPuzzleIdx + 1 < puzzles.length ? "Câu tiếp theo ➡️" : "Hoàn tất [Đóng]"}
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckPuzzle}
                      disabled={selectedWords.length === 0}
                      className="px-3 py-2 rounded-xl bg-cyan-brand/80 hover:bg-cyan-brand text-black text-xs font-bold font-sans flex-1 disabled:opacity-40 disabled:hover:bg-cyan-brand/80"
                    >
                      Kiểm tra Cú pháp ✔️
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
      </main>

      <Footer />
    </div>
    </>
  );
};

export default Game;
