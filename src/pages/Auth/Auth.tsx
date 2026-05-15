import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [mode, setMode] = useState<'register' | 'login'>(initialMode as 'register' | 'login');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/courses');
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
            {mode === 'register' ? (
              <>
                <h1 className="text-white text-3xl font-bold mb-1">Create an account</h1>
                <p className="text-white/55 text-sm mb-7">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-login"
                  >
                    Log in
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="ur-input" type="text" placeholder="First name" id="reg-firstname" required />
                    <input className="ur-input" type="text" placeholder="Last name" id="reg-lastname" required />
                  </div>
                  <input className="ur-input" type="email" placeholder="Email" id="reg-email" required />
                  <input className="ur-input" type="password" placeholder="Password" id="reg-password" required />

                  {/* Terms checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none" id="auth-terms-label">
                    <button
                      type="button"
                      onClick={() => setAgreed(!agreed)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        agreed ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-white/30 hover:border-white/60'
                      }`}
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
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl mt-2"
                    id="auth-create-btn"
                  >
                    Create account
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-white text-3xl font-bold mb-1">Welcome back!</h1>
                <p className="text-white/55 text-sm mb-7">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-register"
                  >
                    Sign up free
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="ur-input" type="email" placeholder="Email address" id="login-email" required />
                  <input className="ur-input" type="password" placeholder="Password" id="login-password" required />
                  <div className="flex justify-end">
                    <span className="text-white/40 text-xs hover:text-white/70 cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl"
                    id="auth-login-btn"
                  >
                    Log in
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
