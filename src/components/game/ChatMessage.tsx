import React from 'react';
import { Volume2 } from 'lucide-react';

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
  npcName?: string;
}

/**
 * Loại bỏ roleplay verbs dạng *verb* khỏi text.
 * Ví dụ: *laughs*, *sighs nervously*, *nods*
 * Chuyển thành chữ nghiêng thay vì xóa hẳn để giữ ngữ cảnh.
 */
export function formatRoleplayVerbs(text: string): React.ReactNode[] {
  // Regex tìm tất cả các cụm *...*
  const regex = /\*([^*]+)\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text trước match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Roleplay verb → chữ nghiêng, màu nhạt, kích thước nhỏ
    parts.push(
      <em
        key={match.index}
        className="italic text-text-muted text-xs"
        style={{ fontStyle: 'italic' }}
      >
        ({match[1].trim()})
      </em>
    );
    lastIndex = match.index + match[0].length;
  }

  // Phần còn lại sau match cuối
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, isSpeaking, npcName }) => {
  const isPlayer = message.role === 'player';

  const parseFeedback = (feedback: string) => {
    const lines = feedback.split('\n').filter(line => line.trim());
    return lines.map((line, idx) => {
      // Remove markdown asterisks and clean up
      const cleanLine = line.replace(/^\*\s*/, '').trim();
      // Also filter roleplay verbs in feedback
      const formatted = formatRoleplayVerbs(cleanLine);
      return (
        <div key={idx} className="mb-1.5 last:mb-0 text-text-secondary">
          {formatted}
        </div>
      );
    });
  };

  return (
    <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isPlayer ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%]`}>
        {/* NPC Avatar - dùng SVG thay vì emoji */}
        {!isPlayer && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 border border-indigo-300/25 flex items-center justify-center flex-shrink-0">
            <Volume2 size={14} className="text-indigo-400" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Sender label - educational style */}
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isPlayer ? 'text-right text-indigo-400/70 mr-1' : 'text-indigo-400/70 ml-1'}`}>
            {isPlayer ? 'Bạn' : (npcName || 'NPC')}
          </span>

          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl ${
              isPlayer
                ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-br-sm shadow-md'
                : 'bg-white/[0.06] border border-white/[0.08] text-white rounded-bl-sm shadow-sm backdrop-blur-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {formatRoleplayVerbs(message.text)}
            </p>
          </div>

          {/* XP Badge */}
          {message.xp && !isPlayer && (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold ml-2">
              <span>+{message.xp} XP</span>
            </div>
          )}

          {/* Feedback */}
          {!isPlayer && message.feedback && (
            <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl text-xs text-text-secondary leading-relaxed">
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
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isSpeaking ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
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