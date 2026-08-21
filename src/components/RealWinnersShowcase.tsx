import React from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import {
  Trophy,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Flame,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const RealWinnersShowcase: React.FC = () => {
  const { setIsDepositModalOpen, setIsWithdrawalModalOpen, setIsSlipOpen, setActiveMainTab } = useSportsbook();
  const hugeWinsImageSrc = '/src/assets/images/chrisfixbet_huge_wins_banner_1787255534836.jpg';

  const recentGhanaPayouts = [
    {
      id: 'p-1',
      name: 'Kwame A.',
      city: 'Kumasi',
      method: 'MTN MoMo',
      amount: 'GH₵ 65,000.00',
      multiplier: '128.4x',
      time: 'Just now',
      tag: 'Big Win',
    },
    {
      id: 'p-2',
      name: 'Abena M.',
      city: 'Accra',
      method: 'Telecel Cash',
      amount: 'GH₵ 12,500.00',
      multiplier: '34.2x',
      time: '2 mins ago',
      tag: 'Instant Payout',
    },
    {
      id: 'p-3',
      name: 'Emmanuel O.',
      city: 'Takoradi',
      method: 'Vodafone Cash',
      amount: 'GH₵ 28,450.00',
      multiplier: '72.0x',
      time: '5 mins ago',
      tag: 'Parlay Hit',
    },
  ];

  return (
    <div id="chrisfixbet-real-winners" className="my-6 space-y-3 select-none">
      {/* Header section with live indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Trophy className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-white flex items-center space-x-2">
              <span>Real Players • Real Wins</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono text-orange-400 font-bold">
                LIVE PAYOUTS 🇬🇭
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsWithdrawalModalOpen(true)}
          className="text-xs text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>Instant Cashier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Visual Display Frame for the Huge Wins Image */}
      <div className="relative rounded-2xl p-1 bg-gradient-to-r from-orange-500/40 via-amber-500/20 to-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.2)] group">
        <div className="relative rounded-[18px] overflow-hidden bg-black border border-orange-500/40">
          
          {/* Main Display Image */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden flex items-center justify-center bg-[#0d0702]">
            <img
              src={hugeWinsImageSrc}
              alt="Huge Wins Real Players Real Wins Real Excitement"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />

            {/* Contrast Gradients for visual pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

            {/* Top Badge: Verified Winners */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-orange-500/50 text-orange-400 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-xl flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>CHRISFIXBET Community Proof</span>
              </span>
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center space-x-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 hover:from-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(249,115,22,0.7)] active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Join & Win Today</span>
              </button>
            </div>
          </div>

          {/* Live Mobile Money Settlement Ribbon */}
          <div className="p-3 sm:p-4 bg-gradient-to-b from-[#130b04] to-[#0c0702] border-t border-orange-500/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {recentGhanaPayouts.map((win) => (
                <div
                  key={win.id}
                  className="p-2.5 rounded-xl bg-black/60 border border-orange-500/20 hover:border-orange-500/50 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                      <Smartphone className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold text-white truncate">{win.name}</p>
                        <span className="text-[10px] text-gray-500">({win.city})</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono flex items-center space-x-1">
                        <span className="text-yellow-400">{win.method}</span>
                        <span>•</span>
                        <span className="text-gray-500">{win.time}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-black font-mono text-orange-400">{win.amount}</p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30 font-mono">
                      {win.multiplier}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Security / Trust Micro Footer */}
            <div className="mt-3 pt-2.5 border-t border-gray-900 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-orange-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant MTN MoMo & Telecel Credited</span>
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 font-mono">0% Payout Deduction</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-500 text-[10px] font-mono">
                <span>JOIN NOW</span>
                <span>•</span>
                <span className="text-gray-300">INSTANT PAYOUTS</span>
                <span>•</span>
                <span className="text-orange-400">100% SECURE</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
