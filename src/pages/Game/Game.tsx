import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Send, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Seo from '../../components/seo/Seo';
import Footer from '../../components/layout/Footer';
import { getMissions, sendGameMessage, getUserInventory, useItem, getGameSession, resetGameSession, checkMissionAccess } from '../../services/api';
import type { UserInventoryDto, GameSessionDto, WritingFeedbackDto, DialogueResponseDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';
import { ChatHistory } from '../../components/game/ChatHistory';
import { SuspicionMeter } from '../../components/game/SuspicionMeter';
import WritingFeedbackPanel from '../../components/game/WritingFeedbackPanel';
import { formatRoleplayVerbs } from '../../components/game/ChatMessage';

/* ─── Types ─── */
interface Message {
  timestamp: Date; // Đã sửa thành bắt buộc để khớp với ChatMessage
  role: 'npc' | 'player';
  text: string;
  xp?: number;
  feedback?: string;
}

/* ─── Scenario fallback data ─── */
const startChoicesMap: Record<number, string[]> = {
  1: ["I would like to order a cup of coffee, please.", "Could I see the menu, please?", "Do you recommend any house blends today?", "What kind of hot pastries do you have?"],
  2: ["Understood. What is the first task I need to do?", "I'm ready. Please give me the instructions.", "Can you guide me on what to do first?", "I will do my best to follow the guidelines."],
  3: ["I'm ready. Let's start the negotiation.", "Can you explain the main points of the agreement?", "I'd like to discuss the terms of this deal.", "Let's look at the topic from both sides."],
  4: ["Good morning. Thank you for having me today.", "I'm excited to share my experience with you.", "I'm ready for the interview questions.", "Thank you. I'm glad to have this opportunity."],
  5: ["I'm on the case. What details do we have?", "Let's start by examining the evidence.", "Where was the victim last seen?", "I'll solve this. What's our first clue."]
};

/* ─── Grammar Syntax Puzzles for Learning Mini-game ─── */
const syntaxPuzzlesMap: Record<number, { question: string; scrambled: string[]; answer: string; hint: string }[]> = {
  1: [
    { question: "Sắp xếp để tạo câu yêu cầu gọi món lịch sự:", scrambled: ["like", "order", "cup", "I", "would", "coffee.", "to", "a", "of"], answer: "I would like to order a cup of coffee.", hint: "Bắt đầu: I would like to..." },
    { question: "Sắp xếp câu hỏi xin xem thực đơn:", scrambled: ["menu,", "please?", "I", "see", "the", "Could"], answer: "Could I see the menu, please?", hint: "Dùng 'Could I' để hỏi lịch sự." }
  ],
  2: [
    { question: "Sắp xếp câu bị động:", scrambled: ["report", "the", "by", "submitted", "was", "me."], answer: "The report was submitted by me.", hint: "Cấu trúc: S + was/were + V3 + by + O." }
  ],
  3: [
    { question: "Sắp xếp câu điều kiện loại 1:", scrambled: ["If", "help", "me,", "I", "will", "you", "bypass", "the", "server."], answer: "If you help me, I will bypass the server.", hint: "If + S + V, S + will + V" }
  ],
  4: [
    { question: "Sắp xếp câu với 'because':", scrambled: ["because", "I", "applied", "this", "job", "I", "the", "want", "challenges.", "for"], answer: "I applied for this job because I want the challenges.", hint: "Because đứng sau mệnh đề chính." }
  ],
  5: [
    { question: "Sắp xếp câu mô tả hiện trường:", scrambled: ["quickly", "evidence.", "gathered", "The", "detective", "the"], answer: "The detective quickly gathered the evidence.", hint: "Trạng từ đứng trước động từ." }
  ],
  6: [
    { question: "Sắp xếp câu gián tiếp:", scrambled: ["She", "told", "she", "ready", "was", "the", "mission.", "me", "for"], answer: "She told me she was ready for the mission.", hint: "S + told + someone + S + V..." }
  ]
};

const defaultScenario = {
  title: 'Loading…',
  stage: 'STAGE',
  topic: 'Hội thoại',
  bg: '/scenario_coffee.png',
  npcName: 'NPC',
  npcEmoji: '🤖',
  difficulty: 'Beginner',
  xpReward: 100,
  intro: 'Preparing your mission…',
  choices: ["Hello!", "Ready!"],
  grammarTarget: '',
  minTurns: 5,
};

/* ─── Map stage identifiers → user-friendly topic names ─── */
const stageToTopic: Record<string, string> = {
  'COFFEE_SHOP': 'Gọi món Cà phê',
  'FOLLOW_INSTRUCTIONS': 'Làm theo Chỉ dẫn',
  'DEBATE_NEGOTIATE': 'Biện luận & Đàm phán',
  'JOB_INTERVIEW': 'Phỏng vấn Xin việc',
  'DETECTIVE': 'Điều tra Hiện trường',
  'EMAIL_COMPLAINT': 'Email khiếu nại',
  'PERSUADE_TEAM': 'Thuyết phục Đội nhóm',
  'PRESENTATION': 'Thuyết trình',
  'CUSTOMER_SERVICE': 'Chăm sóc Khách hàng',
  'SOCIAL_MEDIA': 'Viết bài Mạng xã hội',
  'NEGOTIATION': 'Đàm phán Hợp đồng',
  'ACADEMIC': 'Viết Luận Học thuật',
  'STAGE 1': 'Quán Cà phê',
  'STAGE 2': 'Chỉ dẫn Công việc',
  'STAGE 3': 'Biện luận',
  'STAGE 4': 'Phỏng vấn',
  'STAGE 5': 'Điều tra',
};

const Game = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const missionId = id ? parseInt(id, 10) : 1;

  const [scenario, setScenario] = useState(defaultScenario);
  const [messages, setMessages] = useState<Message[]>([{ role: 'npc', text: defaultScenario.intro, timestamp: new Date() }]);
  const [suspicion, setSuspicion] = useState(10);
  const [totalXP, setTotalXP] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [inventory, setInventory] = useState<UserInventoryDto[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [sessionData, setSessionData] = useState<GameSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedbackDto | null>(null);
  const [currentTurnScores, setCurrentTurnScores] = useState<WritingFeedbackDto['scores'] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [completionToken, setCompletionToken] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const { user, updateUser } = useGameStore();

  // Custom hook for mobile detection (avoid react-responsive dependency)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        if (!showFeedbackPanel) {
          setShowFeedbackPanel(true);
        }
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showFeedbackPanel]);

  /* ─── TTS ─── */
  const speakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ Text-to-Speech.');
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
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en-') && v.name.includes('Natural'))
      || voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  /* ─── Terminal Syntax Hack Mini-game ─── */
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [puzzleResult, setPuzzleResult] = useState<'success' | 'failed' | null>(null);
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);

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
    const normalize = (str: string) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

    if (normalize(userSentence) === normalize(puzzle.answer)) {
      setPuzzleResult('success');
      setTotalXP(prev => prev + 50);
      toast.success("Thành công! +50 XP");
    } else {
      setPuzzleResult('failed');
      toast.error("Chưa đúng. Thử lại!");
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
        if (response.newSuspicionLevel !== undefined) setSuspicion(response.newSuspicionLevel);
        if (response.hint) setActiveHint(response.hint);
        loadInventory();
      } else {
        toast.error(response.message || 'Không thể sử dụng vật phẩm.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối.');
    }
  };

  const handleResume = () => {
    if (!sessionData) return;
    const restoredMessages: Message[] = [{ role: 'npc', text: scenario.intro, timestamp: new Date() }];
    for (const h of sessionData.history) {
      if (h.playerMessage) restoredMessages.push({ role: 'player', text: h.playerMessage, timestamp: new Date() });
      if (h.npcResponse) restoredMessages.push({ role: 'npc', text: h.npcResponse, feedback: h.feedback || undefined, timestamp: new Date() });
    }
    setMessages(restoredMessages);
    setSuspicion(sessionData.currentSuspicion);
    setTurnCount(sessionData.turnCount);
    setTotalXP(sessionData.xpEarned);
    if (sessionData.turnCount >= scenario.minTurns || sessionData.currentSuspicion >= 100) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
    setShowResumeModal(false);
    toast.success("Đã khôi phục tiến độ!");
  };

  const handleReset = async () => {
    try {
      await resetGameSession(missionId);
      setMessages([{ role: 'npc', text: scenario.intro, timestamp: new Date() }]);
      setSuspicion(10);
      setTurnCount(0);
      setTotalXP(0);
      setGameOver(false);
      setIsWin(false);
      setIsLose(false);
      setCompletionToken(null);
      setShowCompletionModal(false);
      setWritingFeedback(null);
      setCurrentTurnScores(null);
      setShowResumeModal(false);
      setActiveHint(null);
      setShowSuggestions(false);
      setSuggestions([]);
      toast.success("Đã khởi động lại nhiệm vụ!");
    } catch (err) {
      toast.error("Không thể khởi động lại nhiệm vụ.");
    }
  };

  useEffect(() => {
    const loadMission = async () => {
      setIsLoading(true);
      setScenario(defaultScenario);
      setMessages([{ role: 'npc', text: defaultScenario.intro, timestamp: new Date() }]);
      setSuspicion(10);
      setTotalXP(0);
      setInputValue('');
      setIsTyping(false);
      setGameOver(false);
      setTurnCount(0);
      setActiveHint(null);
      setWritingFeedback(null);
      setCurrentTurnScores(null);
      setSuggestions([]);
      setShowSuggestions(false);
      setShowResumeModal(false);
      setSessionData(null);

      try {
        const data = await getMissions();
        const found = data.find(m => m.id === missionId);
        if (found) {
          const stageKey = found.stage?.toUpperCase() || '';
          const topic = stageToTopic[stageKey] || stageKey || 'Hội thoại';
          const transformed = {
            title: found.title,
            stage: stageKey,
            topic,
            bg: found.imageUrl || '/default-bg.png',
            npcName: found.npcName || 'NPC',
            npcEmoji: found.npcName?.toLowerCase().includes('barista') ? '☕'
              : found.npcName?.toLowerCase().includes('supervisor') ? '📋'
                : found.npcName?.toLowerCase().includes('detective') ? '🔍' : '👤',
            difficulty: found.difficulty || 'Trung bình',
            xpReward: found.xpReward || 50,
            choices: (found as any).choices || startChoicesMap[missionId] || startChoicesMap[1],
            intro: found.description || found.goal || '',
            grammarTarget: found.grammarTarget || '',
            minTurns: found.minTurnsToComplete || 5,
          };
          setScenario(transformed);

          // Check access before loading session
          const access = await checkMissionAccess(missionId);
          if (!access.isAccessible) {
            toast.error(access.message);
            navigate('/courses');
            return;
          }

          const session = await getGameSession(missionId);
          if (session && session.hasActiveSession && session.history.length > 0) {
            setSessionData(session);
            setShowResumeModal(true);
          } else {
            setMessages([{ role: 'npc', text: transformed.intro, timestamp: new Date() }]);
          }
        } else {
          toast.error('Nhiệm vụ không tồn tại');
          navigate('/courses');
        }
      } catch (err) {
        console.error('Failed to load mission:', err);
        toast.error('Không thể tải nhiệm vụ.');
      } finally {
        setIsLoading(false);
        loadInventory();
      }
    };

    loadMission();
  }, [missionId, navigate]);



  /* ─── Hàm xử lý gửi tin nhắn ─── */
  const processMessage = async (text: string) => {
    if (!text.trim() || isTyping || gameOver) return;

    setActiveHint(null);
    setMessages(prev => [...prev, { role: 'player', text, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const response = await sendGameMessage({ missionId, message: text }) as DialogueResponseDto;

      // Store writing feedback for this turn
      setWritingFeedback(response.writingFeedback);
      setCurrentTurnScores(response.writingFeedback.scores);

      setMessages(prev => [
        ...prev,
        { role: 'npc', text: response.npcResponse, feedback: response.writingFeedback.summary, timestamp: new Date() }
      ]);

      if (response.newSuspicionLevel !== undefined) {
        setSuspicion(response.newSuspicionLevel);
      }

      setTurnCount(prev => prev + 1);
      setTotalXP(prev => prev + response.xpEarned);

      if (response.updatedEnergy !== undefined) {
        updateUser({
          energy: response.updatedEnergy,
          maxEnergy: response.updatedMaxEnergy ?? user?.maxEnergy ?? 100
        });
      }

      if (response.isLose || response.newSuspicionLevel >= 100) {
        setGameOver(true);
        setIsLose(true);
        setShowCompletionModal(true);
        toast.error("Bạn đã bị phát hiện! Nhiệm vụ thất bại.");
        setTimeout(() => {
          navigate(`/result/${missionId}?status=fail`);
        }, 2500);
      } else if (response.isWin) {
        setGameOver(true);
        setIsWin(true);
        if (response.completionToken) setCompletionToken(response.completionToken);
        setShowCompletionModal(true);
        toast.success("Nhiệm vụ hoàn thành xuất sắc!");
        setTimeout(() => {
          navigate(`/result/${missionId}?status=success&xp=${response.xpEarned}&token=${response.completionToken || ''}`);
        }, 2500);
      } else if (response.turnCount >= scenario.minTurns || turnCount + 1 >= scenario.minTurns) {
        setGameOver(true);
        setIsWin(true);
        if (response.completionToken) setCompletionToken(response.completionToken);
        setShowCompletionModal(true);
        toast.success("Nhiệm vụ hoàn thành!");
        setTimeout(() => {
          navigate(`/result/${missionId}?status=success&xp=${response.xpEarned}&token=${response.completionToken || ''}`);
        }, 2500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Không thể gửi tin nhắn.';
      toast.error(`Lỗi: ${errorMsg}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChoice = async (choice: string) => { await processMessage(choice); };

  const suggestionMap: Record<number, string[]> = {
    1: ["I would like to order a cup of coffee, please.", "Could I see the menu, please?", "Do you recommend any house blends today?", "What kind of hot pastries do you have?"],
    2: ["Understood. What is the first task I need to do?", "I'm ready. Please give me the instructions.", "Can you guide me on what to do first?", "I will do my best to follow the guidelines."],
    3: ["I'm ready. Let's start the negotiation.", "Can you explain the main points of the agreement?", "I'd like to discuss the terms of this deal.", "Let's look at the topic from both sides."],
    4: ["Good morning. Thank you for having me today.", "I'm excited to share my experience with you.", "I'm ready for the interview questions.", "Thank you. I'm glad to have this opportunity."],
    5: ["I'm on the case. What details do we have?", "Let's start by examining the evidence.", "Where was the victim last seen?", "I'll solve this. What's our first clue."]
  };

  const toggleSuggestions = () => {
    if (!showSuggestions && suggestions.length === 0) {
      setSuggestions(suggestionMap[missionId] || suggestionMap[1]);
    }
    setShowSuggestions(prev => !prev);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await processMessage(inputValue.trim());
    setInputValue('');
  };

  const susColor = suspicion > 70 ? '#ef4444' : suspicion > 45 ? '#f59e0b' : '#10b981';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-text-secondary">Đang tải nhiệm vụ...</div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Đang chơi - The Unraveller" description="Trò chơi học tiếng Anh qua chat" noIndex />
      <div className="min-h-screen lg:h-screen bg-bg-secondary flex flex-col lg:overflow-hidden">
        <Navbar isLoggedIn username={user?.username || 'Learner'} />

        <main className="max-w-[1680px] mx-auto w-full px-4 lg:px-8 py-4 lg:py-6 flex-grow flex-1 flex flex-col min-h-0 lg:h-[calc(100vh-64px)] h-auto lg:overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors text-sm font-semibold font-mono"
            >
              <ChevronLeft size={18} />
              Quay lại kịch bản
            </button>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-navy-2/85 border border-purple-brand/30 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.15)]">
                <Zap size={14} className="text-warning fill-warning/20" />
                <span className="text-xs font-semibold text-white font-mono">{totalXP} XP</span>
              </div>
              <div className="px-3.5 py-1.5 bg-navy-2/85 border border-white/10 rounded-full shadow-sm">
                <span className="text-xs font-semibold text-indigo-300">{scenario.topic}</span>
              </div>
              {isMobile && (
                <button
                  onClick={() => setShowFeedbackPanel(!showFeedbackPanel)}
                  className="px-3 py-1.5 bg-accent text-white rounded-full text-xs font-medium"
                >
                  {showFeedbackPanel ? 'Hide Feedback' : 'Show Feedback'}
                </button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
            {/* Left Column - Chat */}
            <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
              {/* Mission Info Card */}
              <div className="ur-card border-purple-brand/20 p-4 shadow-md bg-navy-2/45 flex flex-col sm:flex-row gap-4 items-start">
                {scenario.bg && (
                  <div className="w-full sm:w-28 h-20 sm:h-auto rounded-xl overflow-hidden flex-shrink-0 border border-purple-brand/20 bg-navy-3/60">
                    <img
                      src={scenario.bg}
                      alt={scenario.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-white mb-1 font-heading flex items-center gap-2">
                    <span className="text-xl">{scenario.npcEmoji}</span>
                    {scenario.npcName}
                  </h1>
                  <p className="text-xs text-text-secondary mb-3 font-body leading-relaxed">
                    {scenario.intro ? formatRoleplayVerbs(scenario.intro) : ''}
                  </p>
                  {scenario.grammarTarget && (
                    <div className="bg-purple-brand/10 border border-purple-brand/35 rounded-xl p-3.5 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <HelpCircle size={14} className="text-cyan-brand" />
                        <span className="text-[10px] font-bold text-cyan-brand uppercase tracking-wider font-mono">Mục tiêu ngữ pháp</span>
                      </div>
                      <p className="text-xs text-text-secondary font-body leading-relaxed">{scenario.grammarTarget}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages - sử dụng ChatHistory với topic và npcName */}
              <div className="flex-1 ur-card border-purple-brand/20 flex flex-col min-h-0 shadow-md bg-navy-2/45 overflow-hidden relative">
                {scenario.bg && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.05] bg-cover bg-center" 
                    style={{ backgroundImage: `url(${scenario.bg})` }}
                  />
                )}
                {/* Scrollable Chat Area fills all remaining height */}
                <div className="flex-1 min-h-0 relative z-10 overflow-hidden flex flex-col">
                  <ChatHistory
                    messages={messages}
                    isTyping={isTyping}
                    topicName={scenario.topic}
                    npcName={scenario.npcName}
                    onSpeak={speakText}
                    speakingIndex={speakingIndex}
                  />
                </div>

                {/* Sticky Bottom Area - Controls & Inputs */}
                <div className="flex-shrink-0 space-y-3 p-4 pt-2.5 border-t border-white/5 relative z-10">
                  {/* AI Hint */}
                  {activeHint && (
                    <div className="bg-purple-brand/10 border border-purple-brand/30 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <HelpCircle size={15} className="text-cyan-brand mt-0.5" />
                        <p className="text-xs text-text-secondary font-body leading-relaxed">{activeHint}</p>
                        <button onClick={() => setActiveHint(null)} className="ml-auto text-text-muted hover:text-white text-sm">
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input Form & Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-navy-3/60 border border-white/5 max-h-24 overflow-y-auto">
                      <span className="w-full text-[10px] font-semibold text-indigo-400/70 uppercase tracking-wider mb-1">Gợi ý trả lời:</span>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputValue(s);
                            setShowSuggestions(false);
                          }}
                          className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] text-white/80 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-400/30 transition-all text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Nhập câu trả lời tiếng Anh..."
                      className="flex-1 px-5 py-3 rounded-full bg-navy-3/90 border border-white/[0.08] text-white placeholder-white/30 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30 outline-none text-sm font-body shadow-sm transition-all"
                      disabled={isTyping || gameOver}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-gradient-to-br from-indigo-500 to-blue-500 hover:shadow-md hover:scale-[1.02] text-white rounded-full font-semibold transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center flex-shrink-0"
                      disabled={isTyping || gameOver || !inputValue.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </form>

                  {/* Action Button - Gợi ý trả lời với pulse */}
                  {!isTyping && !gameOver && turnCount === 0 && (
                    <div className="flex justify-center">
                      <button
                        onClick={toggleSuggestions}
                        className="group flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-text-secondary hover:text-indigo-300 hover:border-indigo-400/30 hover:bg-indigo-500/5 transition-all text-xs font-medium animate-pulse-slow"
                      >
                        <Lightbulb size={13} className="text-amber-400/70 group-hover:text-amber-300 transition-colors" />
                        <span>Gợi ý trả lời</span>
                        <Sparkles size={11} className="text-indigo-400/50 group-hover:text-indigo-300 transition-colors" />
                      </button>
                    </div>
                  )}

                  {/* Turn Progress & Actions */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-xs text-text-secondary font-mono">
                      Lượt đối thoại: <span className="text-white font-bold">{turnCount}/{scenario.minTurns}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={startTerminalHack}
                        className="px-3.5 py-1.5 border border-purple-brand/40 text-purple-soft rounded-full hover:bg-purple-brand/10 transition-all font-semibold font-mono text-[11px]"
                        title="Luyện tập cú pháp"
                      >
                        🔌 Luyện cú pháp
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3.5 py-1.5 border border-white/10 text-text-secondary rounded-full hover:bg-white/5 transition-all font-semibold font-mono text-[11px]"
                        title="Làm lại từ đầu"
                      >
                        🔄 Làm lại
                      </button>
                    </div>
                  </div>

                  {/* Dialogue Turn progress bar */}
                  <div className="w-full bg-navy-3 border border-white/10 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                      style={{ width: `${Math.min(100, (turnCount / scenario.minTurns) * 100)}%` }}
                    />
                  </div>

                  {/* Suspicion Meter & Inventory */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex-shrink-0">
                      <SuspicionMeter level={suspicion} />
                    </div>
                    {inventory.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {inventory.map((item) => (
                          <button
                            key={item.itemId}
                            onClick={() => handleUseItem(item.itemId)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-navy-3 border border-purple-brand/30 rounded-lg text-[10px] hover:border-cyan-brand hover:bg-purple-brand/15 transition-all text-white font-medium"
                            title={item.description}
                          >
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                            <span className="ml-1 px-1 bg-purple-brand/35 text-cyan-light text-[9px] rounded font-mono font-bold">{item.quantity}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Writing Feedback Panel */}
            {(showFeedbackPanel || !isMobile) && (
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 h-full">
                <div className="ur-card border-purple-brand/20 shadow-md flex-1 overflow-hidden flex flex-col bg-navy-2/45 min-h-0">
                  {writingFeedback ? (
                    <WritingFeedbackPanel feedback={writingFeedback} missionTitle={scenario.title} />
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 text-center bg-navy-2/20">
                      <div>
                        <div className="text-4xl mb-4 animate-float">📝</div>
                        <h3 className="font-bold text-white mb-2 font-heading tracking-wide">WRITING COACH</h3>
                        <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                          Hoàn thành lượt hội thoại đầu tiên để nhận phản hồi phân tích chi tiết từ AI huấn luyện viên.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Score Display for current turn */}
                {currentTurnScores && (
                  <div className="mt-4 ur-card border-purple-brand/20 p-4 bg-navy-2/30">
                    <h4 className="text-xs font-semibold text-cyan-brand uppercase tracking-wider mb-3 font-mono">Điểm Số Lượt Này</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(currentTurnScores).map(([key, value]) => {
                        const scoreVal = value as number;
                        const scoreColor = scoreVal >= 80 ? 'text-success' : scoreVal >= 60 ? 'text-warning' : 'text-danger';
                        const glowStyle = scoreVal >= 80 ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]' : scoreVal >= 60 ? 'drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]' : 'drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]';
                        return (
                          <div key={key} className="bg-navy-3/50 border border-white/5 rounded-xl p-2.5 text-center">
                            <div className="text-[10px] text-text-secondary capitalize mb-1 font-mono">{key}</div>
                            <div className={`text-base font-black font-mono ${scoreColor} ${glowStyle}`}>
                              {scoreVal}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ad banner — slim strip below game, does not steal height */}
          {!user?.isPremium && (
            <div className="mt-3 flex-shrink-0">
              <GoogleAd type="slim" />
            </div>
          )}
        </main>
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="ur-card bg-navy/95 border border-purple-brand/40 p-6 max-w-md w-full shadow-[0_0_50px_rgba(124,58,237,0.3)]">
            <h3 className="text-lg font-bold text-white mb-2 font-heading tracking-wide">Tiếp tục nhiệm vụ?</h3>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">Bạn có tiến độ chưa hoàn thành từ trước. Bạn muốn tiếp tục giải mã hay bắt đầu lại từ đầu?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReset}
                className="py-2.5 border border-white/10 text-white/70 rounded-full hover:bg-white/5 text-xs font-semibold tracking-wider font-mono uppercase transition-all"
              >
                Bắt đầu lại
              </button>
              <button
                onClick={handleResume}
                className="py-2.5 bg-gradient-brand text-white rounded-full hover:shadow-glow-purple text-xs font-semibold tracking-wider font-mono uppercase transition-all"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Hack Modal */}
      {showTerminalModal && (() => {
        const puzzles = syntaxPuzzlesMap[missionId] || syntaxPuzzlesMap[1];
        const puzzle = puzzles[currentPuzzleIdx];
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="ur-card bg-navy-2/95 border border-cyan-brand/40 p-6 max-w-lg w-full shadow-[0_0_40px_rgba(6,182,212,0.25)] relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-brand"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-brand animate-ping"></span>
                  🔌 Terminal Hack: Cú Pháp
                </h3>
                <button onClick={() => setShowTerminalModal(false)} className="text-white/40 hover:text-white transition-colors text-lg">×</button>
              </div>

              <div className="mb-4 bg-navy-3/60 border border-white/5 rounded-xl p-4">
                <div className="text-[10px] text-cyan-brand font-mono mb-1 uppercase tracking-wider">CÂU HỎI {currentPuzzleIdx + 1}/{puzzles.length}</div>
                <p className="text-sm text-white font-medium leading-relaxed">{puzzle.question}</p>
              </div>

              {/* Selected words */}
              <div className="mb-4 p-4 bg-navy-3 border border-purple-brand/20 rounded-xl min-h-[70px] flex flex-wrap gap-2 shadow-inner">
                {selectedWords.length === 0 ? (
                  <span className="text-xs text-white/30 font-mono italic">Click từ bên dưới để ghép câu...</span>
                ) : (
                  selectedWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectedWordClick(word, i)}
                      className="px-3 py-1.5 bg-cyan-brand/20 border border-cyan-brand/40 text-cyan-light text-xs font-semibold rounded-lg hover:bg-danger/20 hover:border-danger/40 hover:text-red-400 transition-all font-mono"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled words */}
              <div className="mb-4 p-4 bg-navy-3/45 border border-white/5 rounded-xl flex flex-wrap gap-2 min-h-[70px]">
                {scrambledWords.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordClick(word, i)}
                    className="px-3 py-1.5 bg-navy border border-purple-brand/30 text-white text-xs font-medium rounded-lg hover:border-cyan-brand hover:bg-purple-brand/10 transition-all font-mono"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {showPuzzleHint && (
                <div className="mb-4 p-3 bg-purple-brand/10 border border-purple-brand/25 rounded-xl text-xs text-text-secondary leading-relaxed font-mono">
                  💡 Hướng dẫn: {puzzle.hint}
                </div>
              )}

              {puzzleResult === 'success' && (
                <div className="mb-4 p-3 bg-success/15 border border-success/45 text-success text-xs rounded-xl text-center font-bold font-mono uppercase tracking-wider animate-bounce">
                  🚀 Hack thành công! +50 XP
                </div>
              )}
              {puzzleResult === 'failed' && (
                <div className="mb-4 p-3 bg-danger/15 border border-danger/45 text-red-400 text-xs rounded-xl text-center font-bold font-mono uppercase tracking-wider">
                  🛑 Cú pháp không hợp lệ. Vui lòng kiểm tra lại.
                </div>
              )}

              <div className="flex gap-2 border-t border-white/5 pt-4 mt-6">
                <button
                  onClick={() => setShowPuzzleHint(!showPuzzleHint)}
                  className="flex-1 py-2 text-xs border border-white/10 text-white/70 rounded-full hover:bg-white/5 font-semibold font-mono transition-all"
                >
                  {showPuzzleHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                </button>
                <button
                  onClick={handleResetPuzzle}
                  className="flex-1 py-2 text-xs border border-white/10 text-white/70 rounded-full hover:bg-white/5 font-semibold font-mono transition-all"
                >
                  Xếp lại
                </button>
                {puzzleResult === 'success' ? (
                  <button
                    onClick={handleNextPuzzle}
                    className="flex-1 py-2 text-xs bg-gradient-brand text-white rounded-full hover:shadow-glow-purple font-bold font-mono tracking-wider transition-all"
                  >
                    {currentPuzzleIdx + 1 < puzzles.length ? 'Tiếp theo' : 'Hoàn tất'}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckPuzzle}
                    disabled={selectedWords.length === 0}
                    className="flex-1 py-2 text-xs bg-cyan-brand text-white rounded-full hover:shadow-glow-cyan font-bold font-mono tracking-wider transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    Kiểm tra
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="ur-card bg-navy-2/95 border border-purple-brand/40 p-6 max-w-md w-full shadow-[0_0_50px_rgba(124,58,237,0.35)] text-center relative">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isWin ? 'bg-success' : 'bg-red-500'}`}></div>
            
            <div className="text-5xl mb-4 animate-bounce">
              {isWin ? '🏆' : '💀'}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 font-heading tracking-wide">
              {isWin ? 'NHIỆM VỤ HOÀN THÀNH!' : 'NHIỆM VỤ THẤT BẠI!'}
            </h3>
            
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              {isWin 
                ? `Chúc mừng bạn đã hoàn thành xuất sắc thử thách trò chuyện với ${scenario.npcName}.`
                : `Mức độ nghi ngờ của bạn đã vượt quá giới hạn hoặc cuộc hội thoại kết thúc không như ý muốn.`}
            </p>

            {/* Stars rating based on suspicion level */}
            {isWin && (
              <div className="flex justify-center gap-2 mb-6 text-3xl">
                {suspicion < 25 ? (
                  <>⭐ ⭐ ⭐</>
                ) : suspicion < 50 ? (
                  <>⭐ ⭐ <span className="opacity-30">⭐</span></>
                ) : (
                  <>⭐ <span className="opacity-30">⭐ ⭐</span></>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-navy-3/60 border border-white/5 rounded-xl p-4 text-left">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-mono block">Năng lượng tiêu thụ</span>
                <span className="text-sm font-semibold text-white font-mono">{user?.isPremium ? '0' : '5'} Energy</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase font-mono block">Điểm kinh nghiệm</span>
                <span className="text-sm font-semibold text-warning font-mono">+{totalXP} XP</span>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-text-muted uppercase font-mono block">Lượt đối thoại</span>
                <span className="text-sm font-semibold text-white font-mono">{turnCount}/{scenario.minTurns} lượt</span>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-text-muted uppercase font-mono block">Mức độ nghi ngờ</span>
                <span className="text-sm font-semibold font-mono" style={{ color: suspicion > 70 ? '#ef4444' : suspicion > 45 ? '#f59e0b' : '#10b981' }}>
                  {suspicion}%
                </span>
              </div>
            </div>

            {/* Token */}
            {isWin && completionToken && (
              <div className="mb-6 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between text-left">
                <div className="overflow-hidden">
                  <span className="text-[9px] text-text-muted uppercase font-mono block">Mã chứng nhận (Token)</span>
                  <span className="text-xs font-mono font-bold text-indigo-300 truncate block">{completionToken}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(completionToken);
                    toast.success("Đã sao chép mã chứng nhận!");
                  }}
                  className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-400/25 hover:border-indigo-400/50 text-indigo-200 text-[10px] font-bold rounded-lg transition-all flex-shrink-0"
                >
                  Sao chép
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              {isWin && (
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    navigate(`/game/${missionId + 1}`);
                  }}
                  className="w-full py-2.5 bg-gradient-brand text-white rounded-full hover:shadow-glow-purple text-xs font-bold tracking-wider font-mono uppercase transition-all flex items-center justify-center gap-1.5"
                >
                  Kịch bản tiếp theo 🚀
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white rounded-full text-xs font-semibold tracking-wider font-mono uppercase transition-all"
              >
                Chơi lại màn này 🔄
              </button>
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate('/courses');
                }}
                className="w-full py-2.5 border border-white/10 hover:bg-white/5 text-white/80 rounded-full text-xs font-semibold tracking-wider font-mono uppercase transition-all"
              >
                Quay lại danh sách kịch bản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Game;