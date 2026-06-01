import * as React from 'react';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield } from 'lucide-react';

interface Message {
  role: 'player' | 'npc';
  text: string;
  timestamp: Date;
}

interface ChatHistoryProps {
  messages: Message[];
  isTyping: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isTyping }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 scrollbar-hide">
      <AnimatePresence>
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[85%] md:max-w-[70%] space-y-4">
              <div className={`flex items-center gap-3 mb-2 uppercase text-[10px] font-black tracking-widest ${msg.role === 'player' ? 'flex-row-reverse text-spy-blue' : 'text-spy-green'}`}>
                {msg.role === 'player' ? <User size={14} /> : <Shield size={14} />}
                <span>{msg.role === 'player' ? 'ĐẶC VỤ_07' : 'ĐỐI TƯỢNG_MỤC TIÊU'}</span>
                <span className="opacity-30 font-normal">{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              
              <div className={`p-6 border-2 relative ${msg.role === 'player' ? 'border-spy-blue bg-spy-blue/5 text-spy-blue' : 'border-spy-green bg-spy-green/5 text-white'}`}>
                {/* Decorative corners for each bubble */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-spy-green/40" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-spy-green/40" />
                
                <p className="text-sm leading-relaxed tracking-wide font-medium">{msg.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="p-6 border border-spy-green bg-spy-green/5 animate-pulse text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
              [ ĐANG PHÂN TÍCH TÍN HIỆU... ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
};
