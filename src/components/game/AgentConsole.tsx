import React, { useState } from 'react';
import { Send, Terminal, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface AgentConsoleProps {
  onSendMessage: (msg: string) => void;
  isTyping: boolean;
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <footer className="p-8 md:p-12 bg-spy-black border-t border-spy-green/10">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-spy-green/40 group-focus-within:text-spy-green transition-colors" />
          <input 
            type="text" 
            value={inputValue}
            disabled={isTyping}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="TRANSMIT MESSAGE..."
            className="w-full bg-spy-black border-2 border-spy-green/20 p-6 pl-16 text-spy-green focus:border-spy-green focus:shadow-[0_0_25px_rgba(0,255,65,0.15)] outline-none placeholder:text-spy-green/10 transition-all font-bold tracking-widest uppercase text-sm"
          />
        </div>
        <Button 
          type="submit" 
          disabled={!inputValue.trim() || isTyping}
          className="px-12 py-6 text-sm"
        >
          {isTyping ? <Loader2 className="animate-spin" /> : 'TRANSMIT'} <Send size={16} />
        </Button>
      </form>
      <div className="text-center text-[10px] text-gray-700 mt-6 flex items-center justify-center gap-6 font-black uppercase tracking-[0.5em]">
        <span>ENCRYPTION: AES-256</span>
        <span>NODE: LOCAL_SEC_GATE</span>
        <span>LATENCY: 12ms</span>
      </div>
    </footer>
  );
};
