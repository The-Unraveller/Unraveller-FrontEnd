import React from 'react';

interface Message {
  role: 'player' | 'npc';
  text: string;
  timestamp: Date;
  xp?: number;
  feedback?: string;
}

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, isSpeaking }) => {
  const isPlayer = message.role === 'player';

  const parseFeedback = (feedback: string) => {
    const lines = feedback.split('\n').filter(line => line.trim());
    return lines.map((line, idx) => {
      // Remove markdown asterisks and clean up
      const cleanLine = line.replace(/^\*\s*/, '').trim();
      return (
        <div key={idx} className="mb-1.5 last:mb-0">
          {cleanLine}
        </div>
      );
    });
  };

  return (
    <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isPlayer ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%]`}>
        {/* NPC Avatar */}
        {!isPlayer && (
          <div className="w-8 h-8 rounded-full bg-navy border border-purple-brand/40 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-[0_0_8px_rgba(124,58,237,0.3)]">
            🤖
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl ${
              isPlayer
                ? 'bg-gradient-brand text-white rounded-br-sm shadow-glow-purple/20'
                : 'bg-navy-2/90 border border-purple-brand/25 text-white rounded-bl-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>

          {/* XP Badge */}
          {message.xp && !isPlayer && (
            <div className="flex items-center gap-1 text-xs text-cyan-brand font-bold ml-2 font-mono">
              <span>+{message.xp} XP</span>
            </div>
          )}

          {/* Feedback */}
          {!isPlayer && message.feedback && (
            <div className="mt-2 p-3 bg-purple-brand/10 border border-purple-brand/20 rounded-xl text-xs text-text-secondary leading-relaxed">
              {parseFeedback(message.feedback)}
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-[9px] text-text-muted font-mono ${isPlayer ? 'text-right mr-1' : 'ml-1'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Speak Button */}
        {!isPlayer && onSpeak && (
          <button
            onClick={() => onSpeak(message.text)}
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isSpeaking ? 'bg-purple-brand/25 text-cyan-light border border-cyan-brand/35' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            title="Nghe phát âm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
