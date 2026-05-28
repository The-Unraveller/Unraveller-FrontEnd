import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import { login, register, loginWithGoogle, getUserProfile } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  
  // State variables
  const [mode, setMode] = useState<'register' | 'login'>(initialMode as 'register' | 'login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setAuthenticated } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { token } = await login(email, password);
        localStorage.setItem('token', token);
        const profile = await getUserProfile();
        setUser(profile);
        setAuthenticated(true);
        toast.success(`Welcome back, Agent ${profile.username}! Establishing secure connection...`);
        navigate(profile.role === 'Admin' ? '/admin' : '/courses');
      } else {
        if (!agreed) {
          setError('You must agree to the Terms & Conditions.');
          toast.error('You must agree to the Terms & Conditions.');
          setIsLoading(false);
          return;
        }
        const username = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        await register(username, email, password);
        setMode('login');
        toast.success('Agent profile initialized! Please log in to establish link.');
        setError('Agent profile initialized! Log in to establish link.');
      }
    } catch (err: any) {
      let errMsg = '';
      if (err.response) {
        errMsg = err.response.data?.message || err.response.data || 'Authentication failed. Please verify credentials.';
      } else if (err.request) {
        errMsg = 'Cannot connect to server. Please verify the backend API is running.';
      } else {
        errMsg = 'Authentication error: ' + err.message;
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const { token } = await loginWithGoogle(credentialResponse.credential);
      localStorage.setItem('token', token);
      const profile = await getUserProfile();
      setUser(profile);
      setAuthenticated(true);
      toast.success(`Google verification secure. Welcome, Agent ${profile.username}!`);
      navigate(profile.role === 'Admin' ? '/admin' : '/courses');
    } catch (err: any) {
      let errMsg = '';
      if (err.response) {
        errMsg = err.response.data?.message || err.response.data || 'Google authentication failed.';
      } else if (err.request) {
        errMsg = 'Cannot connect to server. Please verify the backend is running.';
      } else {
        errMsg = 'Google login error: ' + err.message;
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout isLoggedIn={false}>
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 min-h-[72vh]">

          {/* ── Left: Image panel ── */}
          <div className="w-full lg:w-[52%] relative rounded-2xl overflow-hidden shadow-2xl min-h-80 lg:min-h-[500px] flex-shrink-0">
            <img
              src="/london_bg.png"
              alt="English environment"
              className="w-full h-full object-cover absolute inset-0"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12003a]/70 via-[#12003a]/30 to-transparent" />
            {/* Logo */}
            <div className="absolute top-6 left-6">
              <img src="/logo.png" alt="Unraveller" className="h-20 object-contain drop-shadow-xl" />
            </div>
            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                Ready to join the<br />English speaking environment?
              </h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                Explore unique scenarios, improve your English skills, and become a better version of yourself!
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="w-full lg:flex-1 max-w-md mx-auto lg:mx-0">
            {error && (
              <div className="mb-6 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs uppercase animate-pulse rounded-xl">
                {error}
              </div>
            )}

            {mode === 'register' ? (
              <>
                <h1 className="text-white text-3xl font-bold mb-1">Create an account</h1>
                <p className="text-white/55 text-sm mb-7">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-login"
                    disabled={isLoading}
                  >
                    Log in
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="ur-input"
                      type="text"
                      placeholder="First name"
                      id="reg-firstname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <input
                      className="ur-input"
                      type="text"
                      placeholder="Last name"
                      id="reg-lastname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    className="ur-input"
                    type="email"
                    placeholder="Email"
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <input
                    className="ur-input"
                    type="password"
                    placeholder="Password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />

                  {/* Terms checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none" id="auth-terms-label">
                    <button
                      type="button"
                      onClick={() => !isLoading && setAgreed(!agreed)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        agreed ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-white/30 hover:border-white/60'
                      }`}
                      disabled={isLoading}
                    >
                      {agreed && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="text-white/65 text-sm">
                      I agree to the{' '}
                      <span className="text-[#f5c842] font-semibold cursor-pointer hover:underline">Terms &amp; Conditions</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="auth-create-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-white text-3xl font-bold mb-1">Welcome back!</h1>
                <p className="text-white/55 text-sm mb-7">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-register"
                    disabled={isLoading}
                  >
                    Sign up free
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    className="ur-input"
                    type="email"
                    placeholder="Email address"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <input
                    className="ur-input"
                    type="password"
                    placeholder="Password"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <div className="flex justify-end">
                    <span className="text-white/40 text-xs hover:text-white/70 cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    id="auth-login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </button>
                </form>
              </>
            )}

            {/* Google OAuth alternative access */}
            <div className="mt-8 flex flex-col gap-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <span className="relative px-4 bg-navy text-[10px] uppercase text-gray-500">Alternative Access</span>
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
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
