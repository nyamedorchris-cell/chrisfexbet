import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { OddsFormat } from '../types';
import { formatCurrency } from '../utils/oddsFormatter';
import { AuthModal } from './AuthModal';
import {
  Wallet,
  PlusCircle,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
  Search,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Plane,
  Trophy,
  Receipt,
  Clock,
  UserCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    wallet,
    oddsFormat,
    setOddsFormat,
    soundEnabled,
    setSoundEnabled,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsResponsibleModalOpen,
    setIsAIParlayModalOpen,
    searchQuery,
    setSearchQuery,
    betSlipItems,
    setIsSlipOpen,
    activeMainTab,
    setActiveMainTab,
    placedBets,
  } = useSportsbook();

  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const activeBetsCount = placedBets.filter((b) => b.status === 'active').length;

  return (
    <>
      <header id="chrisfixbet-header" className="sticky top-0 z-30 bg-[#0f1116]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo with Glowing Shield Badge */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div
              onClick={() => setActiveMainTab('sports')}
              className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group"
            >
              {/* Official Gold Shield Logo */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.8)] transition-all">
                <img
                  src="/src/assets/images/chrisfixbet_logo_shield_1787255347896.jpg"
                  alt="CHRISFIXBET Crest"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-white font-sans">
                    CHRISFIX<span className="text-orange-500">BET</span>
                  </h1>
                  <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">
                    GH 🇬🇭
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest -mt-0.5">Ghana's Fastest Bet</p>
              </div>
            </div>
          </div>

        {/* Primary Platform Navigation: Sportsbook vs Casino vs My Bets */}
        <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 shadow-inner overflow-x-auto no-scrollbar">
          <button
            id="nav-tab-sports"
            onClick={() => setActiveMainTab('sports')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'sports'
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sportsbook</span>
          </button>

          <button
            id="nav-tab-casino"
            onClick={() => setActiveMainTab('casino')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
              activeMainTab === 'casino'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Casino</span>
            <span className="hidden sm:inline-block px-1 py-0.2 text-[8px] bg-rose-500 text-white rounded font-mono font-extrabold ml-1">
              HOT
            </span>
          </button>

          <button
            id="nav-tab-my-bets"
            onClick={() => setActiveMainTab('my_bets')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
              activeMainTab === 'my_bets'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>My Bets</span>
            {activeBetsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold bg-blue-400 text-black">
                {activeBetsCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Search Bar (Shown when on sports) */}
        {activeMainTab === 'sports' && (
          <div className="hidden md:flex flex-1 max-w-xs relative items-center">
            <div className="w-full bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5 flex items-center space-x-2 focus-within:border-orange-500/50 transition-colors">
              <Search className="w-4 h-4 text-gray-500 pointer-events-none shrink-0" />
              <input
                id="header-search-input"
                type="text"
                placeholder="Search events, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Action Controls & Wallet */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Parlay Generator Quick Button */}
          <button
            id="ai-parlay-nav-btn"
            onClick={() => setIsAIParlayModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg transition-all"
            title="ChrisFix Smart Parlay Builder"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="hidden sm:inline">ChrisFix AI Slip</span>
          </button>

          {/* Odds Format Selector */}
          <div className="hidden lg:flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5 text-[11px] font-semibold text-gray-400">
            {(['decimal', 'american', 'fractional'] as OddsFormat[]).map((fmt) => (
              <button
                key={fmt}
                id={`odds-fmt-${fmt}`}
                onClick={() => setOddsFormat(fmt)}
                className={`px-2 py-1 rounded capitalize transition-all ${
                  oddsFormat === fmt ? 'bg-gray-800 text-orange-400 font-bold shadow-xs' : 'hover:text-gray-200'
                }`}
              >
                {fmt === 'decimal' ? 'Dec' : fmt === 'american' ? 'US' : 'Frac'}
              </button>
            ))}
          </div>

          {/* Audio Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
          </button>

          {/* Responsible Gaming Quick Link */}
          <button
            id="responsible-gaming-nav-btn"
            onClick={() => setIsResponsibleModalOpen(true)}
            className="hidden sm:flex p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            title="Responsible Gaming Limits"
          >
            <ShieldCheck className="w-4 h-4 text-gray-400 hover:text-orange-400" />
          </button>

          {/* Auth Buttons: Sign In / Sign Up */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              id="header-signin-btn"
              onClick={() => {
                setAuthMode('signin');
                setIsAuthOpen(true);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-gray-300 bg-gray-900 hover:bg-gray-800 border border-gray-700/80 transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>

            <button
              id="header-signup-btn"
              onClick={() => {
                setAuthMode('signup');
                setIsAuthOpen(true);
              }}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-black text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 shadow-[0_0_15px_rgba(249,115,22,0.5)] active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1"
            >
              <span>Sign Up</span>
            </button>
          </div>

          {/* Wallet Balance & Deposit Pill */}
          <div className="relative hidden sm:block">
            <div className="flex items-center bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl pl-3 pr-1.5 py-1.5 transition-all">
              <div
                className="flex items-center space-x-2.5 cursor-pointer select-none"
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-black">
                  <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="text-right pr-1">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-widest leading-none">Wallet</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-orange-400 leading-tight">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
              </div>

              {/* Deposit Quick Button */}
              <button
                id="header-deposit-btn"
                onClick={() => setIsDepositModalOpen(true)}
                className="ml-1.5 px-3 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black rounded-lg flex items-center space-x-1 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Deposit</span>
              </button>
            </div>

            {/* Wallet Dropdown Menu */}
            {isWalletMenuOpen && (
              <div
                id="wallet-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-[#0f1116] border border-gray-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="pb-3 mb-3 border-b border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Available Funds</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    {formatCurrency(wallet.balance)}
                  </p>
                  {wallet.bonusBalance > 0 && (
                    <div className="flex items-center justify-between text-xs text-orange-400 mt-1.5 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                      <span>Bonus Free Bets</span>
                      <span className="font-mono font-bold">{formatCurrency(wallet.bonusBalance)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <button
                    id="dropdown-deposit-action"
                    onClick={() => {
                      setIsWalletMenuOpen(false);
                      setIsDepositModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors border border-orange-500/20"
                  >
                    <span className="flex items-center space-x-2">
                      <PlusCircle className="w-4 h-4" />
                      <span>Deposit Funds</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="dropdown-withdraw-action"
                    onClick={() => {
                      setIsWalletMenuOpen(false);
                      setIsWithdrawModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-gray-800/60 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
                  >
                    <span>Instant Withdrawal</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  <button
                    id="dropdown-responsible-action"
                    onClick={() => {
                      setIsWalletMenuOpen(false);
                      setIsResponsibleModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-gray-800/60 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                      <span>Deposit Limits & Safety</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bet Slip Trigger */}
          <button
            id="mobile-slip-trigger-btn"
            onClick={() => setIsSlipOpen(true)}
            className="lg:hidden relative p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 hover:text-white"
          >
            <TrendingUp className="w-5 h-5 text-orange-400" />
            {betSlipItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-black font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                {betSlipItems.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>

    <AuthModal
      isOpen={isAuthOpen}
      onClose={() => setIsAuthOpen(false)}
      initialMode={authMode}
    />
  </>
  );
};
