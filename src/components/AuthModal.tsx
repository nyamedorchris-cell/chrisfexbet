import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { soundFx } from '../utils/audioEffects';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  Smartphone,
  Gift,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
}) => {
  const { wallet, depositFunds } = useSportsbook();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [phone, setPhone] = useState<string>('0244123456');
  const [network, setNetwork] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [password, setPassword] = useState<string>('••••••••');
  const [promoCode, setPromoCode] = useState<string>('VANTA300');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playDepositSuccess();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0d1017] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(249,115,22,0.2)] overflow-hidden text-white">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white font-sans">
              CHRISFIX<span className="text-orange-500">BET</span>
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest -mt-0.5">
              Ghana's Premier Betting Engine
            </p>
          </div>
        </div>

        {/* Switcher Tab: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-gray-950 rounded-xl border border-gray-800 mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              mode === 'signup'
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Sign Up</span>
            <span className="px-1 py-0.2 text-[8px] bg-black text-orange-400 font-mono rounded font-black">
              +300%
            </span>
          </button>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {mode === 'signup' ? 'Welcome to CHRISFIXBET!' : 'Welcome Back!'}
            </h4>
            <p className="text-xs text-gray-400">
              {mode === 'signup'
                ? 'Your account is verified with 300% First Deposit Bonus unlocked!'
                : 'Authenticated securely via Ghana MoMo network.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number with MoMo Network Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 block">
                Ghana Mobile Money Number
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as any)}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2.5 text-xs text-orange-400 font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="mtn">🟡 MTN MoMo</option>
                  <option value="vodafone">🔴 Telecel Cash</option>
                  <option value="airteltigo">🔵 AT Money</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    placeholder="024 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 block">
                {mode === 'signup' ? 'Create Secure PIN / Password' : 'PIN / Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter 4-6 digit PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Promo Code for Sign Up */}
            {mode === 'signup' && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-400 flex items-center space-x-1">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Active Promo: 300% First Deposit Bonus</span>
                  </span>
                  <span className="font-mono font-black text-white bg-orange-500/20 px-2 py-0.5 rounded text-[10px]">
                    {promoCode}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Deposit as low as GH₵ 2.00 to receive triple bonus funds instantly.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 hover:from-orange-400 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{mode === 'signup' ? 'Create Account & Claim 300%' : 'Sign In To Account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center justify-center space-x-1 text-[10px] text-gray-500 uppercase tracking-wider font-semibold pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Gaming Commission of Ghana Regulated • 18+</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
