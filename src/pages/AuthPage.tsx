import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spy-black flex items-center justify-center p-4 font-mono text-spy-green">
      <div className="w-full max-w-md border border-spy-green p-8 bg-spy-black/80 relative">
        <div className="absolute top-0 right-0 p-2 text-[10px] opacity-30 flex items-center gap-1">
          <Shield className="w-3 h-3" /> SECURITY LEVEL: ENCRYPTED
        </div>

        <h2 className="text-2xl font-bold mb-12 flex items-center gap-2">
          <span className="animate-pulse">_</span> {isLogin ? 'ACCESS GRANTED?' : 'REGISTER NEW AGENT'}
        </h2>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/missions'); }}>
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase mb-2 text-gray-400">Agent Username</label>
              <input 
                type="text" 
                className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none"
                placeholder="AG_USER_X"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase mb-2 text-gray-400">Agent ID (Email)</label>
            <input 
              type="email" 
              className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none"
              placeholder="AGENT@UNRAVELLER.IO"
            />
          </div>

          <div>
            <label className="block text-xs uppercase mb-2 text-gray-400">Access Key (Password)</label>
            <input 
              type="password" 
              className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-spy-green text-black font-bold uppercase transition-all hover:bg-white flex items-center justify-center gap-2"
          >
            {isLogin ? 'Establish Link' : 'Initialize Profile'} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-spy-green/20 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase hover:text-white transition-all underline underline-offset-4"
          >
            {isLogin ? "No ID? Create Profile" : "Existing Agent? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
