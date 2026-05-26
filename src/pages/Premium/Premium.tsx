import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Lock, Shield, AlertCircle, CheckCircle, Zap, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { createPayment } from '../../services/api';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  features: string[];
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0₫',
    priceLabel: 'Forever',
    features: ['3 scenarios per week', 'Basic streak & XP', 'Limited audio feedback'],
    highlighted: false,
  },
  {
    id: 'plus',
    name: 'Plus+',
    price: '99,000₫',
    priceLabel: 'per month',
    features: ['Unlimited scenarios', 'Full leaderboard & streak', 'All story chapters unlocked'],
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '299,000₫',
    priceLabel: 'per month',
    features: ['AI Speaking feedback', 'Offline mode', 'Exclusive scenarios & content'],
    highlighted: true,
  },
];

interface FormData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const Premium = () => {
  const [selected, setSelected] = useState('premium');
  const [searchParams] = useSearchParams();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentResult, setPaymentResult] = useState<{type: 'success' | 'failed' | 'error'; orderId?: string} | null>(null);

  // Check for payment result from query params on mount
  useEffect(() => {
    const payment = searchParams.get('payment');
    const orderId = searchParams.get('orderId');

    if (payment === 'success') {
      setPaymentResult({ type: 'success', orderId: orderId ?? undefined });
      setPaymentStatus('success');
      // Clear form
      setFormData({ cardholderName: '', cardNumber: '', expiry: '', cvc: '' });
    } else if (payment === 'failed') {
      setPaymentResult({ type: 'failed', orderId: orderId ?? undefined });
      setPaymentStatus('error');
      setErrorMessage('Payment failed. Please try again or use a different payment method.');
    } else if (payment === 'error') {
      setPaymentResult({ type: 'error' });
      setPaymentStatus('error');
      setErrorMessage('An error occurred during payment processing. Please contact support.');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberClean.length < 16 || !/^\d+$/.test(cardNumberClean)) {
      newErrors.cardNumber = 'Invalid card number (16 digits required)';
    }

    if (!formData.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\s?\/\s?\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Use MM/YY format';
    }

    if (!formData.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = 'Invalid CVC (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === 'payment-card') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
    } else if (id === 'payment-expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d{0,2})$/, (_, p1, p2) => {
          if (p2) return `${p1} / ${p2}`;
          return p1;
        })
        .slice(0, 7);
    } else if (id === 'payment-cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [id.replace('payment-', '')]: formattedValue }));
    if (errors[id.replace('payment-', '') as keyof FormData]) {
      setErrors(prev => ({ ...prev, [id.replace('payment-', '')]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('processing');
    setErrorMessage('');

    if (!validateForm()) {
      setPaymentStatus('idle');
      return;
    }

    try {
      // Call backend API to create VNPAY payment
      const response = await createPayment({
        planId: selected,
        amount: selected === 'plus' ? 99000 : 299000,
      });

      if (response.success && response.paymentUrl) {
        // Redirect to VNPAY payment page
        window.location.href = response.paymentUrl;
      } else {
        setPaymentStatus('error');
        setErrorMessage(response.message || 'Failed to create payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || 'Network error. Please check your connection.');
    }
  };

  const selectedPlan = plans.find(p => p.id === selected);

  return (
    <Layout isLoggedIn={false}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Logo */}
        <div className="flex justify-start mb-8">
          <img src="/logo.png" alt="Unraveller" className="h-24 object-contain drop-shadow-xl" />
        </div>

        <div className="flex flex-col xl:flex-row gap-10 items-start">
          {/* ── Pricing ── */}
          <div className="flex-1">
            <h2 className="text-white text-3xl font-black text-center mb-2 tracking-widest">PRICING</h2>
            <p className="text-white/45 text-sm text-center mb-8">Choose the plan that works for you</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  onClick={() => setSelected(plan.id)}
                  className={`cursor-pointer rounded-2xl p-6 flex flex-col transition-all w-full sm:max-w-[200px] ${
                    plan.highlighted
                      ? 'plan-highlighted border-2 border-cyan-brand/60 shadow-glow-cyan'
                      : `ur-card ${selected === plan.id ? 'border-purple-500/60' : 'hover:border-purple-500/40'}`
                  }`}
                >
                  <h3 className="text-white text-2xl font-black mb-5">{plan.name}</h3>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-white/80 text-sm flex items-start gap-2.5">
                        <Check size={14} className="text-cyan-brand mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div>
                    <p className="text-white text-2xl font-black">{plan.price}</p>
                    <p className="text-white/40 text-xs mt-0.5">{plan.priceLabel}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <Link to="/auth?mode=register">
                <button
                  className="ur-btn-primary px-7 py-3 rounded-full font-bold"
                  id="premium-free-start"
                >
                  Start for Free
                </button>
              </Link>
              <button
                className="ur-btn-outline px-7 py-3 rounded-full font-bold"
                id="premium-register-plan"
                onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Subscribe to a Plan
              </button>
            </div>
          </div>

          {/* ── Payment Form ── */}
          <div className="w-full xl:w-96 flex-shrink-0" id="payment-section">
            <div className="ur-card p-6 rounded-2xl border border-purple-brand/30">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-cyan-brand" />
                Payment Details
              </h3>

              {/* Payment result message */}
              {paymentResult && (
                <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
                  paymentResult.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/50'
                    : paymentResult.type === 'failed'
                    ? 'bg-red-500/20 border border-red-500/50'
                    : 'bg-yellow-500/20 border border-yellow-500/50'
                }`}>
                  {paymentResult.type === 'success' && <CheckCircle size={18} className="text-green-400" />}
                  {paymentResult.type === 'failed' && <AlertCircle size={18} className="text-red-400" />}
                  {paymentResult.type === 'error' && <AlertCircle size={18} className="text-yellow-400" />}
                  <span className={`text-sm ${
                    paymentResult.type === 'success' ? 'text-green-300' :
                    paymentResult.type === 'failed' ? 'text-red-300' : 'text-yellow-300'
                  }`}>
                    {paymentResult.type === 'success'
                      ? 'Payment successful! Welcome to Premium!'
                      : paymentResult.type === 'failed'
                      ? 'Payment failed. Please try again.'
                      : 'Payment processing error.'}
                  </span>
                </div>
              )}

              {/* Selected plan summary */}
              {selectedPlan && !paymentStatus && (
                <div className="mb-4 p-3 rounded-xl bg-cyan-brand/10 border border-cyan-brand/30">
                  <p className="text-white/70 text-xs mb-1">Selected Plan</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{selectedPlan.name}</p>
                      <p className="text-cyan-brand font-black text-lg">{selectedPlan.price}</p>
                    </div>
                    <Zap size={24} className="text-cyan-brand" />
                  </div>
                </div>
              )}

              {/* Payment method icons */}
              <div className="flex items-center justify-around mb-5 p-3 rounded-xl bg-white/8 border border-white/10">
                {/* Mastercard */}
                <div className="relative w-9 h-6">
                  <div className="absolute left-0 w-6 h-6 rounded-full bg-red-500 opacity-90" />
                  <div className="absolute right-0 w-6 h-6 rounded-full bg-yellow-400 opacity-90 mix-blend-multiply" />
                </div>
                <span className="text-white font-black text-base italic tracking-tight">VISA</span>
                <span className="text-blue-400 font-black text-sm">PayPal</span>
                <CreditCard size={22} className="text-white/50" />
              </div>

              {/* Error message */}
              {paymentStatus === 'error' && errorMessage && !paymentResult && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-red-300 text-sm">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    className={`ur-input ${errors.cardholderName ? 'border-red-500 focus:border-red-500' : ''}`}
                    type="text"
                    placeholder="Cardholder name"
                    id="payment-name"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                  />
                  {errors.cardholderName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.cardholderName}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className={`ur-input ${errors.cardNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                    type="text"
                    placeholder="Card number"
                    id="payment-card"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      className={`ur-input ${errors.expiry ? 'border-red-500 focus:border-red-500' : ''}`}
                      type="text"
                      placeholder="MM / YY"
                      id="payment-expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      maxLength={7}
                      disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                    />
                    {errors.expiry && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`ur-input ${errors.cvc ? 'border-red-500 focus:border-red-500' : ''}`}
                      type="text"
                      placeholder="CVC"
                      id="payment-cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      maxLength={4}
                      disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                    />
                    {errors.cvc && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.cvc}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="ur-btn-primary w-full py-3.5 text-base rounded-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  id="payment-pay-btn"
                  disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Pay {selectedPlan?.price || '0₫'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                <Shield size={16} className="text-cyan-brand mt-0.5 flex-shrink-0" />
                <p className="text-white/50 text-xs leading-relaxed">
                  🔒 Secured by VNPAY 256-bit SSL encryption. Your payment data is protected.
                </p>
              </div>

              <p className="text-white/30 text-xs text-center mt-4">
                By paying, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
