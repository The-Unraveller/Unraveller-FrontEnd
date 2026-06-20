import * as React from 'react';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';

interface Message {
  role: 'player' | 'npc';
  text: string;
  timestamp: Date;
  xp?: number;
  feedback?: string;
}

interface ChatHistoryProps {
  messages: Message[];
  isTyping: boolean;
  /** Tên chủ đề (ví dụ: "Email khiếu nại", "Phỏng vấn xin việc") */
  topicName?: string;
  /** Tên NPC (ví dụ: "Mr. Vance", "Barista") */
  npcName?: string;
  onSpeak?: (text: string, index: number) => void;
  speakingIndex?: number | null;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isTyping, topicName = 'Hội thoại', npcName = 'NPC', onSpeak, speakingIndex }) => {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-center mb-2">
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
          Chủ đề: {topicName}
        </span>
      </div>
      <AnimatePresence>
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            onSpeak={onSpeak ? (text) => onSpeak(text, i) : undefined}
            isSpeaking={speakingIndex === i}
            npcName={npcName}
          />
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-text-muted">
                  Đang trả lời
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};