import React, { useState, useEffect } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import {
  ShieldCheck,
  Zap,
  Trophy,
  Sparkles,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Headphones,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Smartphone,
} from 'lucide-react';

export const PromoHeroBanner: React.FC = () => {
  const { setIsDepositModalOpen, setIsWithdrawalModalOpen, setIsSlipOpen, setActiveMainTab } = useSportsbook();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Official billboard & winners images generated from uploaded assets
  const officialBannerImageSrc = '/src/assets/images/chrisfixbet_official_banner_1787255335998.jpg';
  const hugeWinsImageSrc = '/src/assets/images/chrisfixbet_huge_wins_banner_1787255534836.jpg';
  const heroPlayerImageSrc = '/src/assets/images/vantastake_hero_banner_1787142931200.jpg';

  const TOTAL_SLIDES = 4;

  // Auto rotate banner every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6 select-none">
      {/* Outer Glow Ring / Frame in Orange */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent shadow-[0_0_50px_rgba(249,115,22,0.25)]">
        
        {/* Main Banner Card */}
        <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-br from-[#180e06] via-[#100903] to-[#0a0602] border border-orange-500/30 text-white min-h-[360px] sm:min-h-[400px] flex flex-col justify-between p-4 sm:p-7">
          
          {/* SLIDE 0: Official Chrisfixbet Image Display Form */}
          {activeSlide === 0 && (
            <div className="relative z-10 flex flex-col justify-between flex-1 space-y-4 animate-in fade-in zoom-in-98 duration-300">
              {/* Display Banner Image Container */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/40 shadow-2xl group bg-black/60 aspect-[21/9] sm:aspect-[24/9] flex items-center justify-center">
                <img
                  src={officialBannerImageSrc}
                  alt="Chrisfixbet Ghana's Fastest Bet Official Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />

                {/* Subtle Gradient Overlays for High Contrast Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-orange-500/50 text-orange-400 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-lg flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span>Official Brand Billboard</span>
                  </span>
                </div>

                {/* Quick Action CTA Pill Overlay */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center space-x-2">
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.6)] active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Deposit Now</span>
                  </button>
                </div>
              </div>

              {/* Bottom Feature Tags row matching image features */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <button
                  onClick={() => setActiveMainTab('sports')}
                  className="p-2 sm:p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 hover:border-orange-500/60 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-orange-200">
                    Live Betting
                  </span>
                </button>

                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-200">
                    Fast Payouts
                  </span>
                </button>

                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-center space-x-2">
                  <Headphones className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-gray-300">
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 1: Huge Wins Real Players Display */}
          {activeSlide === 1 && (
            <div className="relative z-10 flex flex-col justify-between flex-1 space-y-4 animate-in fade-in zoom-in-98 duration-300">
              {/* Display Banner Image Container */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/40 shadow-2xl group bg-black/60 aspect-[21/9] sm:aspect-[24/9] flex items-center justify-center">
                <img
                  src={hugeWinsImageSrc}
                  alt="Huge Wins Real Players Real Wins Real Excitement"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-orange-500/50 text-orange-400 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-lg flex items-center space-x-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real Ghanaian Winners</span>
                  </span>
                </div>

                {/* Quick Action CTA Pill Overlay */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center space-x-2">
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.6)] active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Join Now • Win Big</span>
                  </button>
                </div>
              </div>

              {/* Bottom Feature Tags row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 flex items-center justify-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-orange-200 truncate">
                    GH₵ 65,000 Payout
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-200 truncate">
                    Instant MoMo Credited
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-gray-300 truncate">
                    100% Secure
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: 300% First Deposit Bonus */}
          {activeSlide === 2 && (
            <div className="relative z-10 flex flex-col justify-between flex-1 animate-in fade-in duration-300">
              {/* Card Top: Brand Header */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                    CHRISFIX<span className="text-orange-500">BET</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                  Ghana Special 🇬🇭
                </span>
              </div>

              {/* Center Content */}
              <div className="grid grid-cols-12 items-center gap-4 py-2">
                <div className="col-span-7 space-y-1.5 select-none">
                  <h2 className="text-2xl sm:text-5xl font-black italic tracking-tighter uppercase leading-[0.95] text-white">
                    GET
                  </h2>
                  <span className="text-3xl sm:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]">
                    300% BONUS
                  </span>
                  <p className="text-sm sm:text-2xl font-extrabold tracking-tight text-gray-200 uppercase leading-none pt-0.5">
                    ON YOUR FIRST DEPOSIT
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsDepositModalOpen(true)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 hover:from-orange-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.5)] active:scale-95 transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>Claim 300% Bonus</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

                <div className="col-span-5 relative flex justify-end items-center">
                  <div className="relative w-36 sm:w-56 h-40 sm:h-52 rounded-2xl overflow-hidden border border-orange-500/30 shadow-xl">
                    <img
                      src={heroPlayerImageSrc}
                      alt="CHRISFIXBET Athlete"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-lg border border-orange-500/40 text-[9px] font-mono text-orange-400">
                      <span>GH₵ 100 → GH₵ 400</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Instant MoMo & GIP Rails */}
          {activeSlide === 3 && (
            <div className="relative z-10 flex flex-col justify-between flex-1 animate-in fade-in duration-300 py-1">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                    CHRISFIX<span className="text-orange-500">BET</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                  Zero Processing Fees ⚡
                </span>
              </div>

              <div className="space-y-3 py-2 text-center sm:text-left">
                <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
                  Ghana's Fastest Mobile Money Cashout
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                  Automated payout settlement directly to MTN Mobile Money, Vodafone Cash, Telecel, and Ghana Interbank GIP bank accounts.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-mono">MTN MoMo</p>
                    <p className="text-xs font-bold text-yellow-400 mt-0.5">Instant &lt; 60s</p>
                  </div>
                  <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-mono">Telecel Cash</p>
                    <p className="text-xs font-bold text-red-400 mt-0.5">Instant Direct</p>
                  </div>
                  <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-mono">Bank GIP</p>
                    <p className="text-xs font-bold text-orange-400 mt-0.5">GCB / Ecobank</p>
                  </div>
                  <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-mono">Web3 Crypto</p>
                    <p className="text-xs font-bold text-teal-400 mt-0.5">USDT TRC-20</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-center sm:justify-start">
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Deposit & Play Instantly</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Bar: Carousel Switcher & Licensing Mark */}
          <div className="relative z-10 pt-3 mt-3 border-t border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-gray-400">
              <span className="text-gray-500">LICENSED</span>
              <span>•</span>
              <span className="text-gray-300 font-bold">GHANA</span>
              <span>•</span>
              <span className="text-orange-400 font-mono font-bold">RESPONSIBLE GAMING 18+</span>
            </div>

            {/* Slide Navigation Buttons & Dots */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSlide((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1))}
                className="p-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Previous banner"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-gray-800">
                {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx
                        ? 'w-5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                        : 'w-2 bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % TOTAL_SLIDES)}
                className="p-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Next banner"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
