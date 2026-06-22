import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Shield, AlertCircle, CheckCircle, Zap, Loader2, ExternalLink, Clock } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { createPayOSLink } from '../../services/api';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  priceLabel: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Explorer',
    price: '0₫',
    priceValue: 0,
    priceLabel: 'Không cần thẻ tín dụng',
    features: [
      '5 kịch bản giao tiếp đầy đủ tính năng',
      '100 năng lượng mỗi ngày (tự hồi phục)',
      'AI Feedback sau mỗi lượt chat',
      'Bài luyện cú pháp Terminal Hack',
      'Bảng xếp hạng cộng đồng',
      'Huy chương & thành tích cơ bản',
    ],
    highlighted: false,
    badge: '🎒 MIỄN PHÍ MÃI MÃI',
  },
  {
    id: 'premium',
    name: 'Premium VIP',
    price: '199,000₫',
    priceValue: 199000,
    priceLabel: 'Mỗi tháng · Hủy bất kỳ lúc nào',
    features: [
      'Năng lượng vô hạn — không giới hạn lượt học',
      'Gấp đôi XP trên mỗi cuộc hội thoại (2×)',
      'Mở khóa tất cả 15+ kịch bản độc quyền',
      'AI Coach phân tích chuyên sâu ngữ pháp',
      'Tắt toàn bộ quảng cáo',
      'Giảm 20% khi mua vật phẩm Cửa Hàng',
      'Hồi năng lượng nhanh gấp đôi',
      'Badge VIP + Khung avatar đặc biệt ✨',
    ],
    highlighted: true,
    badge: '⚡ PHỔ BIẾN NHẤT',
  },
];

const Premium = () => {
  const [selected, setSelected] = useState('premium');
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentResult, setPaymentResult] = useState<{type: 'success' | 'failed' | 'error'; orderId?: string} | null>(null);

  // Handle payOS return redirect
  useEffect(() => {
    const payment = searchParams.get('payment');
    const orderId = searchParams.get('orderId');

    if (payment === 'success') {
      setPaymentResult({ type: 'success', orderId: orderId ?? undefined });
      setPaymentStatus('success');
    } else if (payment === 'failed') {
      setPaymentResult({ type: 'failed', orderId: orderId ?? undefined });
      setPaymentStatus('error');
      setErrorMessage('Thanh toán bị huỷ hoặc thất bại. Vui lòng thử lại.');
    } else if (payment === 'error') {
      setPaymentResult({ type: 'error' });
      setPaymentStatus('error');
      setErrorMessage('Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng liên hệ hỗ trợ.');
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (selected === 'free') return;

    const selectedPlan = plans.find(p => p.id === selected);
    if (!selectedPlan) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const response = await createPayOSLink({
        planId: selected,
        amount: selectedPlan.priceValue,
      });

      if (response.success && response.checkoutUrl) {
        // Redirect to payOS hosted checkout page
        window.location.href = response.checkoutUrl;
      } else {
        setPaymentStatus('error');
        setErrorMessage(response.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('payOS error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || 'Lỗi kết nối. Vui lòng kiểm tra đường truyền.');
      setIsProcessing(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selected);

  return (
    <Layout isLoggedIn={true}>
      <Seo title="Goi Dich Vu Premium" description="Nâng cấp lên gói Premium để không giới hạn quyền truy cập vào tất cả kịch bản học tiếng Anh. Chỉ từ 199.000đ/tháng." keywords="premium, gia dich vu, nang cap, thanh toan, goi Plus, goi Premium" canonical="/premium" noIndex />
      <div className="max-w-screen-xl mx-auto px-6 py-12 app-bg min-h-screen">
        {/* Header Block with Cyberpunk Glow */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-transparent bg-clip-text bg-gradient-brand text-5xl font-black mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(124,58,237,0.3)] font-heading leading-normal py-2 inline-block">
            CÁC GÓI DỊCH VỤ
          </h2>
          <div className="ur-divider mb-4"></div>
          <p className="text-white/60 text-base max-w-md mx-auto">
            Chọn gói hội viên giúp mở khóa hành trình luyện tập giao tiếp tiếng Anh nâng cao của bạn
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* ── Pricing Cards Grid ── */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch mb-8">
              {plans.map((plan) => {
                const isSelected = selected === plan.id;
                return (
                  <div
                    key={plan.id}
                    id={`plan-${plan.id}`}
                    onClick={() => setSelected(plan.id)}
                    className={`cursor-pointer rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 w-full md:w-[320px] relative backdrop-blur-md hover:-translate-y-2 hover:scale-[1.02] hover:opacity-100 ${
                      isSelected
                        ? plan.id === 'free'
                          ? 'border-2 border-slate-400 bg-slate-400/10 shadow-[0_0_25px_rgba(148,163,184,0.2)] opacity-100 z-10'
                          : 'border-2 border-purple-brand bg-purple-brand/10 shadow-glow-purple opacity-100 z-10'
                        : 'border-2 border-purple-brand/20 bg-card/45 opacity-70 hover:border-purple-brand/40 hover:shadow-glow-purple/10'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-brand text-white text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-glow-purple animate-pulse-slow">
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <h3 className="text-white text-2xl font-black mb-6 flex items-center justify-between">
                        {plan.name}
                        {isSelected && (
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            plan.id === 'free' ? 'bg-slate-400' : 'bg-purple-brand'
                          } animate-ping`} />
                        )}
                      </h3>
                      
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-white/80 text-sm flex items-start gap-3">
                            <Check size={16} className={`mt-0.5 flex-shrink-0 ${
                              plan.id === 'free' ? 'text-slate-400' : 'text-purple-brand'
                            }`} />
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto">
                      <p className="text-white text-3xl font-black tracking-tight">{plan.price}</p>
                      <p className="text-white/40 text-xs mt-1 font-mono uppercase tracking-wider">{plan.priceLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Decorative Action Block */}
            <div className="flex justify-center gap-6 mt-4 flex-wrap">
              <Link to="/auth?mode=register">
                <button
                  className="ur-btn-primary px-8 py-3.5 rounded-full font-bold text-sm hover:shadow-glow-purple transition-all duration-300"
                  id="premium-free-start"
                >
                  Bắt đầu Miễn phí
                </button>
              </Link>
              <button
                className="ur-btn-outline px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300"
                id="premium-register-plan"
                onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Đăng ký Hội viên
              </button>
            </div>
          </div>

          {/* ── High-Fidelity payOS Checkout Panel ── */}
          <div className="w-full lg:w-[400px] flex-shrink-0" id="payment-section">
            <div className="ur-card p-8 rounded-3xl border border-purple-brand/35 relative overflow-hidden shadow-glow-purple/10 flex flex-col justify-between h-full">
              {/* Header Gradient Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-brand"></div>

              {/* Payment result banner */}
              {paymentResult && (
                <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 animate-slide-up ${
                  paymentResult.type === 'success'
                    ? 'bg-success/15 border border-success/40 text-success'
                    : 'bg-danger/15 border border-danger/40 text-danger'
                }`}>
                  {paymentResult.type === 'success' ? (
                    <CheckCircle size={22} className="text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={22} className="text-danger mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm tracking-wide">
                      {paymentResult.type === 'success'
                        ? '🎉 NÂNG CẤP PREMIUM THÀNH CÔNG!'
                        : 'THANH TOÁN THẤT BẠI'}
                    </p>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">
                      {paymentResult.type === 'success'
                        ? 'Tài khoản của bạn đã được kích hoạt VIP. Hãy trải nghiệm năng lượng vô hạn ngay!'
                        : 'Giao dịch bị huỷ hoặc chưa hoàn tất. Vui lòng kiểm tra và thanh toán lại.'}
                    </p>
                    {paymentResult.orderId && (
                      <p className="text-white/40 text-[10px] font-mono mt-2 uppercase tracking-widest">
                        Mã đơn: #{paymentResult.orderId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-white font-extrabold text-xl mb-1 flex items-center gap-2.5 font-heading">
                  <Zap size={22} className="text-cyan-brand animate-pulse" />
                  Nâng cấp qua PayOS
                </h3>
                <p className="text-white/50 text-xs mb-6 leading-relaxed">
                  Trải nghiệm thanh toán nhanh bảo mật bằng cổng thanh toán payOS qua quét mã VietQR.
                </p>

                {/* Dynamic Selected Plan Summary Card */}
                {selectedPlan && selectedPlan.id !== 'free' && (
                  <div className="mb-6 p-5 rounded-2xl transition-all duration-300 border bg-purple-brand/15 border-purple-brand/35 shadow-[0_0_20px_rgba(124,58,237,0.08)]">
                    <p className="text-white/45 text-xs uppercase tracking-wider mb-2 font-mono">Gói đang chọn</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-lg font-heading">{selectedPlan.name}</p>
                        <p className="font-black text-2xl mt-1 text-purple-soft">{selectedPlan.price}</p>
                        <p className="text-white/40 text-xs font-mono">{selectedPlan.priceLabel}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-brand/20">
                        <Zap size={28} className="text-purple-soft" />
                      </div>
                    </div>
                  </div>
                )}

                {selected === 'free' && (
                  <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center animate-slide-up">
                    <p className="text-white/60 text-sm">Gói Free không cần giao dịch thanh toán.</p>
                    <Link to="/auth?mode=register">
                      <button className="ur-btn-primary mt-4 px-6 py-2.5 rounded-full text-sm font-black tracking-wide">
                        Đăng ký tài khoản mới
                      </button>
                    </Link>
                  </div>
                )}

                {/* Error Banner */}
                {paymentStatus === 'error' && errorMessage && !paymentResult && (
                  <div className="mb-5 p-4 rounded-2xl bg-danger/15 border border-danger/45 flex items-center gap-3">
                    <AlertCircle size={18} className="text-danger flex-shrink-0" />
                    <span className="text-red-300 text-xs leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Payment checklist steps */}
                {selected !== 'free' && paymentStatus !== 'success' && (
                  <div className="mb-6 space-y-3">
                    {[
                      { icon: '1', text: 'Chọn gói hội viên bạn mong muốn đăng ký' },
                      { icon: '2', text: 'Bấm nút thanh toán để chuyển tiếp sang cổng payOS' },
                      { icon: '3', text: 'Quét mã VietQR bằng bất kỳ App Ngân hàng hoặc ví điện tử' },
                    ].map(step => (
                      <div key={step.icon} className="flex items-start gap-3.5 text-white/50 text-xs">
                        <span className="w-5.5 h-5.5 rounded-full bg-cyan-brand/10 border border-cyan-brand/30 text-cyan-brand text-xs flex items-center justify-center font-black flex-shrink-0">
                          {step.icon}
                        </span>
                        <span className="leading-snug pt-0.5">{step.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* Main pay button with neon color gradients based on selection */}
                {selected !== 'free' && (
                  <button
                    type="button"
                    className={`w-full py-4 text-base font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] ${
                      isProcessing ? 'cursor-wait' : ''
                    } bg-gradient-purple text-white shadow-glow-purple hover:shadow-[0_0_30px_rgba(124,58,237,0.55)]`}
                    id="payment-pay-btn"
                    disabled={isProcessing || paymentStatus === 'success'}
                    onClick={handleUpgrade}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang kết nối cổng payOS...
                      </>
                    ) : paymentStatus === 'success' ? (
                      <>
                        <CheckCircle size={18} />
                        Đã nâng cấp VIP!
                      </>
                    ) : (
                      <>
                        <ExternalLink size={18} />
                        Thanh toán {selectedPlan?.price} qua payOS
                      </>
                    )}
                  </button>
                )}

                {/* Security trust badges */}
                <div className="mt-6 space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <Shield size={16} className="text-cyan-brand mt-0.5 flex-shrink-0" />
                    <p className="text-white/45 text-[11px] leading-relaxed">
                      🔒 Kết nối bảo mật bởi đối tác <strong className="text-white/70 font-bold">payOS</strong> — mã hoá chuẩn SSL 256-bit bảo vệ giao dịch tuyệt đối.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <Clock size={16} className="text-purple-soft mt-0.5 flex-shrink-0" />
                    <p className="text-white/45 text-[11px] leading-relaxed">
                      Tài khoản VIP được kích hoạt tự động tức thì ngay sau khi hệ thống ghi nhận chuyển khoản thành công.
                    </p>
                  </div>
                </div>

                <p className="text-white/30 text-[10px] text-center mt-5 leading-normal">
                  Bằng việc tiến hành thanh toán, bạn đồng ý tuân thủ với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
