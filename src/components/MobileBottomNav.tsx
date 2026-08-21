import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { useChat } from '../context/ChatContext';
import {
  Menu,
  Radio,
  Trophy,
  Headphones,
  Receipt,
  TrendingUp,
  Flame,
  X,
  Phone,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeMainTab,
    setActiveMainTab,
    selectedSport,
    setSelectedSport,
    betSlipItems,
    setIsSlipOpen,
    placedBets,
    setIsResponsibleModalOpen,
    setIsDepositModalOpen,
    matches,
  } = useSportsbook();

  const { setIsChatOpen, activeUsersCount } = useChat();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;
  const activeBetsCount = placedBets.filter((b) => b.status === 'active').length;

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <nav
        id="mobile-bottom-dock"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1017]/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-2 shadow-2xl"
      >
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* 1. Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
          </button>

          {/* 2. Live */}
          <button
            onClick={() => {
              setActiveMainTab('sports');
              setSelectedSport('live');
            }}
            className={`flex flex-col items-center justify-center space-y-1 px-2 py-1 transition-colors cursor-pointer relative ${
              activeMainTab === 'sports' && selectedSport === 'live'
                ? 'text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Radio className="w-5 h-5" />
              {liveMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
          </button>

          {/* 3. Center Floating Elevated Action Button matching reference image */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              id="mobile-floating-center-btn"
              onClick={() => setIsSlipOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 hover:from-orange-400 p-0.5 shadow-[0_0_20px_rgba(249,115,22,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center relative"
            >
              <div className="w-full h-full rounded-full bg-[#0d1017] flex items-center justify-center">
                {/* Hexagon Soccer Icon Badge */}
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black">
                  <Receipt className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Badge Counter for Slip Items */}
              {betSlipItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 text-black font-mono font-black text-xs flex items-center justify-center shadow-lg animate-bounce">
                  {betSlipItems.length}
                </span>
              )}
            </button>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 mt-1">
              Slip
            </span>
          </div>

          {/* 4. Sports / Casino */}
          <button
            onClick={() => {
              setActiveMainTab('sports');
              setSelectedSport('all');
            }}
            className={`flex flex-col items-center justify-center space-y-1 px-2 py-1 transition-colors cursor-pointer ${
              activeMainTab === 'sports' && selectedSport !== 'live'
                ? 'text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sports</span>
          </button>

          {/* 5. Support */}
          <button
            onClick={() => setIsSupportOpen(true)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            <Headphones className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
          </button>
        </div>
      </nav>

      {/* Menu Drawer Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-80 max-w-[85vw] bg-[#0f1116] border-r border-gray-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/40 bg-black/50">
                    <img
                      src="/src/assets/images/chrisfixbet_logo_shield_1787255347896.jpg"
                      alt="CHRISFIXBET Crest"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-black text-lg text-white font-sans">CHRISFIX<span className="text-orange-500">BET</span></span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
                  Platforms
                </p>
                <button
                  onClick={() => {
                    setActiveMainTab('sports');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    activeMainTab === 'sports'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span>Sportsbook Markets</span>
                </button>

                <button
                  onClick={() => {
                    setActiveMainTab('casino');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    activeMainTab === 'casino'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Casino & Crash Games</span>
                </button>

                <button
                  onClick={() => {
                    setActiveMainTab('my_bets');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    activeMainTab === 'my_bets'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>My Bets & Ticket Vault</span>
                  {activeBetsCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-black font-mono">
                      {activeBetsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Live Fan Chat 🇬🇭</span>
                  <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-green-500/20 text-green-400 font-mono font-bold">
                    {activeUsersCount} online
                  </span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDepositModalOpen(true);
                  }}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Deposit Mobile Money
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsResponsibleModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>Responsible Limits</span>
                </button>
              </div>
            </div>

            {/* Bottom Ghana Disclaimer */}
            <div className="pt-6 border-t border-gray-800/80 text-[10px] text-gray-500 space-y-1">
              <p>Licensed by Gaming Commission of Ghana.</p>
              <p>Gambling is strictly 18+. Play responsibly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Ghana Support 24/7 Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#0f1116] border border-orange-500/30 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">CHRISFIXBET Ghana Support</h3>
                  <p className="text-[10px] text-orange-400 font-mono">Available 24/7 in Accra & Kumasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg bg-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <a
                href="tel:+233302000000"
                className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-xs font-semibold text-gray-200 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>Toll-Free Phone: +233 (0) 30 200 0000</span>
                </span>
              </a>

              <a
                href="https://wa.me/233240000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl text-xs font-bold text-orange-400 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Live Chat</span>
                </span>
                <span className="text-[10px] bg-orange-500/20 px-2 py-0.5 rounded font-mono">Instant</span>
              </a>
            </div>

            <button
              onClick={() => setIsSupportOpen(false)}
              className="w-full py-2.5 bg-gray-800 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
