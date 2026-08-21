import React, { useMemo } from 'react';
import { SportsbookProvider, useSportsbook } from './context/SportsbookContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { Header } from './components/Header';
import { SportsNav } from './components/SportsNav';
import { LiveScoreTicker } from './components/LiveScoreTicker';
import { MatchCard } from './components/MatchCard';
import { MatchCenter } from './components/MatchCenter';
import { BetSlip } from './components/BetSlip';
import { DepositModal } from './components/DepositModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { ResponsibleGamingModal } from './components/ResponsibleGamingModal';
import { AIParlayBuilderModal } from './components/AIParlayBuilderModal';
import { BetReceiptModal } from './components/BetReceiptModal';
import { CasinoLobby } from './components/casino/CasinoLobby';
import { CasinoGameModal } from './components/casino/CasinoGameModal';
import { MyBetsView } from './components/MyBetsView';
import { PromoHeroBanner } from './components/PromoHeroBanner';
import { RealWinnersShowcase } from './components/RealWinnersShowcase';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { LiveMatchChatRoom } from './components/chat/LiveMatchChatRoom';
import {
  Activity,
  Flame,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Lock,
  MessageSquare,
} from 'lucide-react';

function SportsbookApp() {
  const {
    matches,
    selectedSport,
    searchQuery,
    activeMatch,
    setIsAIParlayModalOpen,
    setIsDepositModalOpen,
    activeMainTab,
  } = useSportsbook();

  // Filter matches based on selected category & search query
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Category filter
      if (selectedSport === 'live' && match.status !== 'live') return false;
      if (selectedSport !== 'all' && selectedSport !== 'live' && match.sport !== selectedSport) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const home = match.homeTeam.name.toLowerCase();
        const away = match.awayTeam.name.toLowerCase();
        const league = match.league.toLowerCase();
        return home.includes(q) || away.includes(q) || league.includes(q);
      }

      return true;
    });
  }, [matches, selectedSport, searchQuery]);

  const liveList = filteredMatches.filter((m) => m.status === 'live');
  const upcomingList = filteredMatches.filter((m) => m.status === 'upcoming');

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black pb-20 lg:pb-6">
      {/* App Header */}
      <Header />

      {/* Live Ticker */}
      <LiveScoreTicker />

      {activeMainTab === 'sports' ? (
        <>
          {/* Sports Navigation Bar */}
          <SportsNav />

          {/* Main Grid Layout for Sportsbook */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left / Center Area (Matches & Match Center) */}
            <div className="lg:col-span-8 space-y-6">
              {/* CHRISFIXBET 300% Bonus Hero Banner */}
              <PromoHeroBanner />

              {/* AI Parlay Quick Generator Banner */}
              <div className="bg-gradient-to-r from-orange-950/20 via-[#13151a] to-[#0f1116] border border-orange-500/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/5">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">ChrisFix AI Smart Parlay Builder</h3>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                        GEMINI 3.7
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Let quantitative neural models build +EV multi-leg slips with automatic payout multiplier boosts.
                    </p>
                  </div>
                </div>

                <button
                  id="hero-ai-parlay-btn"
                  onClick={() => setIsAIParlayModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Generate Parlay</span>
                </button>
              </div>

              {/* Active Match Center (Pitch visualizer & deep analytical breakdown) */}
              {activeMatch && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <span>Selected Event Match Center</span>
                    </h2>
                  </div>
                  <MatchCenter />
                </div>
              )}

              {/* Live In-Play Section */}
              {liveList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block mr-1"></span>
                      <span>Live In-Play Matches ({liveList.length})</span>
                    </h2>
                    <span className="text-[11px] text-orange-400 font-mono flex items-center space-x-1 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Live Discussion Active</span>
                    </span>
                  </div>

                  {/* If user specifically clicked the 'Live' filter tab, show the live chat room inline */}
                  {selectedSport === 'live' && (
                    <div className="mb-4">
                      <LiveMatchChatRoom embedded defaultMatchId={activeMatch?.status === 'live' ? activeMatch.id : 'global-live'} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {liveList.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {/* CHRISFIXBET Real Players & Huge Wins Showcase */}
              <RealWinnersShowcase />

              {/* Upcoming Matches Section */}
              {upcomingList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Upcoming Premier Events ({upcomingList.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {upcomingList.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {filteredMatches.length === 0 && (
                <div className="p-12 text-center bg-[#13151a] border border-gray-800 rounded-xl space-y-2 text-gray-400">
                  <TrendingUp className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm font-bold text-gray-300">No events found matching your search</p>
                  <p className="text-xs text-gray-500">Try changing your sports filter or search query</p>
                </div>
              )}

              {/* Trust & Regulatory Banner */}
              <div className="mt-8 p-4 sm:p-6 bg-[#13151a] border border-gray-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-orange-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">Secure Payment Rails & Rapid Payout Settlement</p>
                    <p className="text-[11px] text-gray-500">
                      Transactions encrypted via 256-bit SSL Vault. Automated instant cashout with zero platform fee.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-lg text-xs transition-colors border border-gray-700"
                  >
                    Deposit Vault
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Bet Slip */}
            <div className="hidden lg:block lg:col-span-4">
              <BetSlip />
            </div>
          </main>

          {/* Floating Bet Slip for Mobile/Tablet */}
          <div className="lg:hidden">
            <BetSlip />
          </div>
        </>
      ) : activeMainTab === 'casino' ? (
        /* Casino & Crash Games Lobby */
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
          <CasinoLobby />
        </main>
      ) : (
        /* My Bets View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
          <MyBetsView />
          {/* Floating Bet Slip for Mobile/Tablet if triggered via re-bet */}
          <div className="lg:hidden">
            <BetSlip />
          </div>
        </main>
      )}

      {/* Modals */}
      <CasinoGameModal />
      <DepositModal />
      <WithdrawalModal />
      <ResponsibleGamingModal />
      <AIParlayBuilderModal />
      <BetReceiptModal />

      {/* Floating Bottom Navigation Bar for Mobile */}
      <MobileBottomNav />

      {/* Floating Live Match Chat Button & Drawer */}
      <FloatingChatButton />
    </div>
  );
}

export default function App() {
  return (
    <SportsbookProvider>
      <ChatProvider>
        <SportsbookApp />
      </ChatProvider>
    </SportsbookProvider>
  );
}
