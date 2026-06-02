import * as React from 'react';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const currentMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
    setMode(currentMode);
  }, [searchParams]);
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
        toast.success(`Chào mừng đặc vụ ${profile.username} trở lại! Đang thiết lập kết nối an toàn...`);
        // Role-based redirect: Admin → user management, Moderator → mission editor, Player → courses
        if (profile.role === 'Admin') navigate('/admin/users');
        else if (profile.role === 'Moderator') navigate('/admin/missions');
        else navigate('/courses');
      } else {
        if (!agreed) {
          setError('Bạn phải đồng ý với Điều khoản & Điều kiện.');
          toast.error('Bạn phải đồng ý với Điều khoản & Điều kiện.');
          setIsLoading(false);
          return;
        }
        const username = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        await register(username, email, password);
        setMode('login');
        toast.success('Hồ sơ đặc vụ đã khởi tạo! Vui lòng đăng nhập để thiết lập liên kết.');
        setError('Hồ sơ đặc vụ đã khởi tạo! Đăng nhập để thiết lập liên kết.');
      }
    } catch (err: any) {
      let errMsg = '';
      if (err.response) {
        errMsg = err.response.data?.message || err.response.data || 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
      } else if (err.request) {
        errMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API Backend.';
      } else {
        errMsg = 'Lỗi xác thực: ' + err.message;
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
      toast.success(`Xác minh Google an toàn. Chào mừng đặc vụ ${profile.username}!`);
      // Role-based redirect: Admin → user management, Moderator → mission editor, Player → courses
      if (profile.role === 'Admin') navigate('/admin/users');
      else if (profile.role === 'Moderator') navigate('/admin/missions');
      else navigate('/courses');
    } catch (err: any) {
      let errMsg = '';
      if (err.response) {
        errMsg = err.response.data?.message || err.response.data || 'Xác thực tài khoản Google thất bại.';
      } else if (err.request) {
        errMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend.';
      } else {
        errMsg = 'Lỗi đăng nhập Google: ' + err.message;
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
                Sẵn sàng bước vào<br />môi trường nói tiếng Anh?
              </h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                Khám phá các kịch bản độc đáo, nâng cao kỹ năng tiếng Anh và trở thành phiên bản tốt hơn của chính mình!
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
                <h1 className="text-white text-3xl font-bold mb-1">Đăng ký tài khoản</h1>
                <p className="text-white/55 text-sm mb-7">
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-login"
                    disabled={isLoading}
                  >
                    Đăng nhập
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="ur-input"
                      type="text"
                      placeholder="Tên"
                      id="reg-firstname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <input
                      className="ur-input"
                      type="text"
                      placeholder="Họ"
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
                    placeholder="Mật khẩu"
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
                      Tôi đồng ý với{' '}
                      <span className="text-[#f5c842] font-semibold cursor-pointer hover:underline">Điều khoản &amp; Điều kiện</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="auth-create-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-white text-3xl font-bold mb-1">Chào mừng trở lại!</h1>
                <p className="text-white/55 text-sm mb-7">
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-[#f5c842] font-semibold hover:underline transition-all"
                    id="auth-switch-register"
                    disabled={isLoading}
                  >
                    Đăng ký miễn phí
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    className="ur-input"
                    type="email"
                    placeholder="Địa chỉ Email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <input
                    className="ur-input"
                    type="password"
                    placeholder="Mật khẩu"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <div className="flex justify-end">
                    <span className="text-white/40 text-xs hover:text-white/70 cursor-pointer transition-colors">
                      Quên mật khẩu?
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="ur-btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    id="auth-login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
                <span className="relative px-4 bg-navy text-[10px] uppercase text-gray-500">Đăng nhập bằng cách khác</span>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Đăng nhập Google thất bại. Vui lòng thử lại.')}
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
