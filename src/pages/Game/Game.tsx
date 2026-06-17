import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Send, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Seo from '../../components/seo/Seo';
import Footer from '../../components/layout/Footer';
import { getMissions, sendGameMessage, getUserInventory, useItem, getGameSession, resetGameSession, checkMissionAccess } from '../../services/api';
import type { UserInventoryDto, GameSessionDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';
import { ChatMessage } from '../../components/game/ChatMessage';

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
  1: ["Yes, let's go!", "I'm a bit nervous…", "What do we do first?", "Sounds great!"],
  2: ["Understood, ready!", "Can you repeat that?", "What's the first task?", "I'll do my best."],
  3: ["I'm ready to debate.", "Let's start the negotiation.", "What is the topic?", "Ready!"],
  4: ["Good morning, Mr. Vance.", "Let's start the interview.", "I'm ready for the questions.", "Thank you for having me."],
  5: ["I'm on the case.", "Give me the details.", "Where do I start?", "Understood. Let's solve this."]
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
  bg: '/scenario_coffee.png',
  npcName: 'NPC',
  npcEmoji: '🤖',
  difficulty: 'Beginner',
  xpReward: 100,
  intro: 'Preparing your mission…',
  choices: ["Hello!", "Ready!"],
  grammarTarget: '',
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

  const chatRef = useRef<HTMLDivElement>(null);
  const { user } = useGameStore();

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
      setShowResumeModal(false);
      toast.success("Đã khởi động lại nhiệm vụ!");
    } catch (err) {
      toast.error("Không thể khởi động lại nhiệm vụ.");
    }
  };

  /* ─── Load mission & check access ─── */
  useEffect(() => {
    const loadMission = async () => {
      try {
        const data = await getMissions();
        const found = data.find(m => m.id === missionId);
        if (found) {
          const transformed = {
            title: found.title,
            stage: found.stage.toUpperCase(),
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

  // Cuộn xuống cuối khung chat tự động
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  /* ─── Hàm xử lý gửi tin nhắn ─── */
  const processMessage = async (text: string) => {
    if (!text.trim() || isTyping || gameOver) return;

    setActiveHint(null);
    setMessages(prev => [...prev, { role: 'player', text, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const response = await sendGameMessage({ missionId, message: text });

      setMessages(prev => [
        ...prev,
        { role: 'npc', text: response.npcResponse, feedback: response.feedback, timestamp: new Date() }
      ]);

      if (response.newSuspicionLevel !== undefined) {
        setSuspicion(response.newSuspicionLevel);
      }

      setTurnCount(prev => prev + 1);
      setTotalXP(prev => prev + ((response as any).xpAwarded || 0));

      if (response.newSuspicionLevel >= 100) {
        setGameOver(true);
        toast.error("Bạn đã bị phát hiện! Nhiệm vụ thất bại.");
      } else if (turnCount + 1 >= 10) {
        setGameOver(true);
        toast.success("Nhiệm vụ hoàn thành!");
      }
    } catch (err) {
      toast.error("Lỗi: Không thể gửi tin nhắn.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleChoice = async (choice: string) => { await processMessage(choice); };

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
      <div className="min-h-screen bg-bg-secondary flex flex-col">
        <Navbar isLoggedIn username={user?.username || 'Learner'} />

        <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <ChevronLeft size={18} />
              Quay lại kịch bản
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <Zap size={14} className="text-warning" />
                <span className="text-xs font-semibold text-text-primary">{totalXP} XP</span>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <span className="text-xs font-medium text-text-secondary">{scenario.stage}</span>
              </div>
            </div>
          </div>

          {/* Mission Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <h1 className="text-lg font-bold text-text-primary mb-1">{scenario.npcName}</h1>
            <p className="text-sm text-text-secondary mb-3">{scenario.intro}</p>
            {scenario.grammarTarget && (
              <div className="bg-accent/5 border border-accent/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle size={14} className="text-accent" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide">Mục tiêu ngữ pháp</span>
                </div>
                <p className="text-sm text-text-primary">{scenario.grammarTarget}</p>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-y-auto shadow-sm max-h-[500px]" ref={chatRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  onSpeak={(text) => speakText(text, i)}
                  isSpeaking={speakingIndex === i}
                />
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2">NPC đang trả lời...</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Hint */}
          {activeHint && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <HelpCircle size={16} className="text-accent mt-0.5" />
                <p className="text-sm text-text-primary">{activeHint}</p>
                <button onClick={() => setActiveHint(null)} className="ml-auto text-text-muted hover:text-text-primary">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Nhập câu trả lời tiếng Anh..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
              disabled={isTyping || gameOver}
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isTyping || gameOver || !inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          {/* Turn Progress & Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-text-muted">
              Lượt: {turnCount}/10
            </div>

            <div className="flex gap-2">
              <button
                onClick={startTerminalHack}
                className="text-xs px-3 py-2 border border-accent/30 text-accent rounded-full hover:bg-accent/5 transition-colors"
                title="Luyện tập cú pháp"
              >
                🔌 Luyện cú pháp
              </button>
              <button
                onClick={handleReset}
                className="text-xs px-3 py-2 border border-gray-300 text-text-secondary rounded-full hover:bg-gray-50 transition-colors"
                title="Làm lại từ đầu"
              >
                🔄 Làm lại
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (turnCount / 10) * 100)}%`, backgroundColor: susColor }}
            />
          </div>

          <div className="text-center text-xs text-text-muted mb-4">
            {suspicion >= 80 ? '⚠️ Mức nghi ngờ cao' : suspicion >= 50 ? '⚠️ Đang bị theo dõi' : '✅ An toàn'}
          </div>

          {/* Inventory */}
          {inventory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
              <div className="text-xs text-text-secondary uppercase tracking-wide mb-2">Vật phẩm</div>
              <div className="flex flex-wrap gap-2">
                {inventory.map((item) => (
                  <button
                    key={item.itemId}
                    onClick={() => handleUseItem(item.itemId)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs hover:border-accent transition-colors"
                    title={item.description}
                  >
                    <span>{item.emoji}</span>
                    <span className="font-medium">{item.name}</span>
                    <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] rounded">{item.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <GoogleAd className="mb-4" />
        </main>

        <Footer />
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-2">Tiếp tục nhiệm vụ?</h3>
            <p className="text-sm text-text-secondary mb-6">Bạn có tiến độ chưa hoàn thành. Muốn tiếp tục hay bắt đầu lại?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleReset} className="py-2.5 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 text-sm font-medium">
                Bắt đầu lại
              </button>
              <button onClick={handleResume} className="py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark text-sm font-medium">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-primary">🔌 Bài tập cú pháp</h3>
                <button onClick={() => setShowTerminalModal(false)} className="text-text-muted hover:text-text-primary text-xl">×</button>
              </div>

              <div className="mb-4">
                <div className="text-xs text-text-muted mb-1">Câu {currentPuzzleIdx + 1}/{puzzles.length}</div>
                <p className="text-sm text-text-primary">{puzzle.question}</p>
              </div>

              {/* Selected words */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[60px] flex flex-wrap gap-2">
                {selectedWords.length === 0 ? (
                  <span className="text-sm text-text-muted">Chọn từ bên dưới...</span>
                ) : (
                  selectedWords.map((word, i) => (
                    <button key={i} onClick={() => handleSelectedWordClick(word, i)} className="px-2.5 py-1 bg-accent/20 border border-accent/30 text-accent text-sm rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled words */}
              <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg flex flex-wrap gap-2">
                {scrambledWords.map((word, i) => (
                  <button key={i} onClick={() => handleWordClick(word, i)} className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-text-primary text-sm rounded hover:bg-accent/10 hover:border-accent/30">
                    {word}
                  </button>
                ))}
              </div>

              {showPuzzleHint && (
                <div className="mb-4 p-3 bg-accent/5 border border-accent/10 rounded text-sm text-text-primary">
                  💡 {puzzle.hint}
                </div>
              )}

              {puzzleResult === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded text-center font-medium">
                  ✅ Thành công! +50 XP
                </div>
              )}
              {puzzleResult === 'failed' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded text-center font-medium">
                  ❌ Chưa đúng. Hãy thử lại.
                </div>
              )}

              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <button onClick={() => setShowPuzzleHint(!showPuzzleHint)} className="flex-1 py-2 text-xs border border-gray-300 text-text-secondary rounded hover:bg-gray-50">
                  {showPuzzleHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                </button>
                <button onClick={handleResetPuzzle} className="flex-1 py-2 text-xs border border-gray-300 text-text-secondary rounded hover:bg-gray-50">
                  Xếp lại
                </button>
                {puzzleResult === 'success' ? (
                  <button onClick={handleNextPuzzle} className="flex-1 py-2 text-xs bg-accent text-white rounded hover:bg-accent-dark">
                    {currentPuzzleIdx + 1 < puzzles.length ? 'Tiếp' : 'Hoàn tất'}
                  </button>
                ) : (
                  <button onClick={handleCheckPuzzle} disabled={selectedWords.length === 0} className="flex-1 py-2 text-xs bg-accent text-white rounded hover:bg-accent-dark disabled:opacity-50">
                    Kiểm tra
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default Game;