import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard } from 'lucide-react';
import Layout from '../../components/layout/Layout';

const plans = [
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

const Premium = () => {
  const [selected, setSelected] = useState('premium');

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
                      ? 'plan-highlighted'
                      : `ur-card ${selected === plan.id ? 'border-purple-500/60' : 'hover:border-purple-500/40'}`
                  }`}
                >
                  <h3 className="text-white text-2xl font-black mb-5">{plan.name}</h3>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-white/80 text-sm flex items-start gap-2.5">
                        <Check size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
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
              >
                Subscribe to a Plan
              </button>
            </div>
          </div>

          {/* ── Payment Form ── */}
          <div className="w-full xl:w-96 flex-shrink-0">
            <div className="ur-card p-6 rounded-2xl">
              <h3 className="text-white font-bold text-lg mb-5">Payment Details</h3>

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

              <div className="space-y-3">
                <input
                  className="ur-input"
                  type="text"
                  placeholder="Cardholder name"
                  id="payment-name"
                />
                <input
                  className="ur-input"
                  type="text"
                  placeholder="Card number"
                  id="payment-card"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="ur-input"
                    type="text"
                    placeholder="MM / YY"
                    id="payment-expiry"
                    maxLength={7}
                  />
                  <input
                    className="ur-input"
                    type="text"
                    placeholder="CVC"
                    id="payment-cvc"
                    maxLength={4}
                  />
                </div>
                <button
                  className="ur-btn-primary w-full py-3.5 text-base rounded-xl mt-1"
                  id="payment-pay-btn"
                >
                  Pay now
                </button>
              </div>

              <p className="text-white/30 text-xs text-center mt-4">
                🔒 Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
