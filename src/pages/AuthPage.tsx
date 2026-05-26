import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Chrome } from 'lucide-react';
import { login, register, loginWithGoogle } from '../services/api';
import { useGameStore } from '../store/useGameStore';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useGameStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { token } = await login(email, password);
        localStorage.setItem('token', token);
      } else {
        await register(username, email, password);
        // After register, we can either login automatically or ask them to login
        // For smooth UX, let's just redirect to login
        setIsLogin(true);
        setError('Profile initialized! Please establish link.');
        setIsLoading(false);
        return;
      }

      setAuthenticated(true);
      navigate('/missions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const { token } = await loginWithGoogle(credentialResponse.credential);
      localStorage.setItem('token', token);
      setAuthenticated(true);
      navigate('/missions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spy-black flex items-center justify-center p-4 font-mono text-spy-green">
      <div className="w-full max-w-md border border-spy-green p-8 bg-spy-black/80 relative shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        <div className="absolute top-0 right-0 p-2 text-[10px] opacity-30 flex items-center gap-1">
          <Shield className="w-3 h-3" /> SECURITY LEVEL: ENCRYPTED
        </div>

        <h2 className="text-2xl font-bold mb-12 flex items-center gap-2">
          <span className="animate-pulse">_</span> {isLogin ? 'ACCESS GRANTED?' : 'REGISTER NEW AGENT'}
        </h2>

        {error && (
          <div className="mb-6 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs uppercase animate-pulse">
            CRITICAL_ERROR: {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleAuth}>
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase mb-2 text-gray-400">Agent Username</label>
              <input
                type="text"
                required
                className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none transition-all"
                placeholder="AG_USER_X"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase mb-2 text-gray-400">Agent ID (Email)</label>
            <input
              type="email"
              required
              className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none transition-all"
              placeholder="AGENT@UNRAVELLER.IO"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase mb-2 text-gray-400">Access Key (Password)</label>
            <input
              type="password"
              required
              className="w-full bg-spy-black border border-spy-green/30 p-3 text-spy-green focus:border-spy-green outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-spy-green text-black font-bold uppercase transition-all hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'PROCESSING...' : (isLogin ? 'Establish Link' : 'Initialize Profile')}
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-spy-green/20"></span></div>
            <span className="relative px-4 bg-spy-black text-[10px] uppercase text-gray-500">Alternative Access</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login failed. Please try again.')}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs uppercase hover:text-white transition-all underline underline-offset-4"
            >
              {isLogin ? "No ID? Create Profile" : "Existing Agent? Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
