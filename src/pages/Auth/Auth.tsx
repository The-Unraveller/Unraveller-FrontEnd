import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Lock, Key, Mail, User } from 'lucide-react';
import { Button } from '../../components/common/Button';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spy-black flex items-center justify-center p-6 font-mono text-spy-green">
      <div className="w-full max-w-lg border border-spy-green/40 p-12 bg-spy-black shadow-[0_0_30px_rgba(0,255,65,0.1)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 text-[10px] text-spy-green/30 tracking-widest uppercase">
          SECURE_NODE_09 // LVL 4
        </div>
        
        <header className="mb-12">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 animate-pulse" /> {isLogin ? 'ESTABLISH LINK' : 'NEW AGENT ENROLLMENT'}
          </h2>
          <div className="text-[10px] uppercase text-gray-500 tracking-[0.3em]">Credentials required to access secure data.</div>
        </header>

        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); navigate('/missions'); }}>
          {!isLogin && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><User size={14} /> Agent Handle</label>
              <input 
                type="text" 
                className="w-full bg-spy-black border border-spy-green/20 p-4 text-spy-green focus:border-spy-green outline-none transition-all placeholder:text-spy-green/20"
                placeholder="UNRAVELLER_AG_01"
              />
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Mail size={14} /> Neural Interface (Email)</label>
            <input 
              type="email" 
              className="w-full bg-spy-black border border-spy-green/20 p-4 text-spy-green focus:border-spy-green outline-none transition-all placeholder:text-spy-green/20"
              placeholder="AGENT@HQ.INTEL"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Key size={14} /> Encryption Key (Password)</label>
            <input 
              type="password" 
              className="w-full bg-spy-black border border-spy-green/20 p-4 text-spy-green focus:border-spy-green outline-none transition-all placeholder:text-spy-green/20"
              placeholder="••••••••••••"
            />
          </div>

          <Button type="submit" className="w-full py-5 text-md">
            {isLogin ? 'Verify Credentials' : 'Initialize Profile'} <ChevronRight />
          </Button>
        </form>

        <footer className="mt-12 text-center pt-8 border-t border-spy-green/10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold uppercase hover:text-white transition-all underline underline-offset-8"
          >
            {isLogin ? "Lost access? Request new encryption key" : "Existing operative? Authenticate here"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
