import React, { useState, useMemo } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { CASINO_GAMES } from '../../data/casinoGamesData';
import { CasinoCategory, CasinoGameId } from '../../types';
import { formatCurrency } from '../../utils/oddsFormatter';
import {
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Search,
  Users,
  Trophy,
  Play,
  ArrowRight,
  ShieldCheck,
  Disc,
  Layers,
  Bomb,
  Plane,
  Coins,
  ArrowDownCircle,
} from 'lucide-react';

export const CasinoLobby: React.FC = () => {
  const { setActiveCasinoGame, casinoLiveWins, setIsDepositModalOpen } = useSportsbook();

  const [selectedCategory, setSelectedCategory] = useState<CasinoCategory>('all');
  const [casinoSearch, setCasinoSearch] = useState<string>('');

  // Category filter
  const categories: { id: CasinoCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All Games', icon: Sparkles },
    { id: 'crash', label: 'Crash / Fast Games', icon: Plane },
    { id: 'table', label: 'Live Table & Roulette', icon: Disc },
    { id: 'slots', label: 'Slots & Megaways', icon: Flame },
    { id: 'instant', label: 'Instant Win & Shootout', icon: Zap },
  ];

  // Filtered games
  const filteredGames = useMemo(() => {
    return CASINO_GAMES.filter((game) => {
      if (selectedCategory !== 'all' && game.category !== selectedCategory) {
        return false;
      }
      if (casinoSearch.trim()) {
        const q = casinoSearch.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.subtitle.toLowerCase().includes(q) ||
          game.provider.toLowerCase().includes(q) ||
          game.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, casinoSearch]);

  const featuredGames = CASINO_GAMES.filter((g) => g.isHot);

  return (
    <div className="space-y-6">
      {/* Live Winners Marquee Ticker */}
      <div className="bg-[#0f121a] border border-gray-800 rounded-xl p-3 flex items-center overflow-hidden gap-3 shadow-md">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 shrink-0 uppercase tracking-wider pr-3 border-r border-gray-800">
          <Trophy className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span>Live Ghana Winners:</span>
        </div>
        <div className="flex items-center space-x-6 overflow-x-auto py-0.5 no-scrollbar">
          {casinoLiveWins.map((win) => (
            <div key={win.id} className="flex items-center space-x-2 shrink-0 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-gray-300">{win.playerName}</span>
              <span className="text-gray-500 text-[11px]">won in {win.gameTitle}:</span>
              <span className="font-mono font-bold text-emerald-400">
                +{formatCurrency(win.winAmount)} ({win.multiplier}x)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Featured Game Spotlight (Aviator & Black Stars Shootout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aviator Hero Card */}
        <div
          onClick={() => setActiveCasinoGame('aviator')}
          className="relative bg-gradient-to-br from-rose-950/70 via-[#181119] to-[#0d0d12] border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xl group cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-rose-500 text-white rounded-md">
                HOT CRASH
              </span>
              <span className="text-xs font-mono text-gray-400">3,400+ Active in Ghana</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-400 transition-colors">
              Aviator Crash Rocket
            </h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Watch multiplier flight curve climb to 10,000x! Auto cash-out and provably fair payouts in Ghana Cedis.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between relative z-10 pt-4 border-t border-gray-800/80">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-gray-400">RTP:</span>
              <strong className="text-emerald-400">97.00%</strong>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">Max:</span>
              <strong className="text-rose-400">10,000x</strong>
            </div>

            <button className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-500/30 flex items-center space-x-1.5 group-hover:translate-x-1 transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Aviator</span>
            </button>
          </div>
        </div>

        {/* Ghana Black Stars Shootout Hero Card */}
        <div
          onClick={() => setActiveCasinoGame('penalty')}
          className="relative bg-gradient-to-br from-amber-950/70 via-[#19150d] to-[#0d0d12] border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xl group cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-black rounded-md">
                GHANA EXCLUSIVE
              </span>
              <span className="text-xs font-mono text-gray-400">Black Stars Tournament</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
              Ghana Black Stars Shootout
            </h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Spot kick against the world goalkeeper. Score up to 5 consecutive goals for a 32x multiplier payout!
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between relative z-10 pt-4 border-t border-gray-800/80">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-gray-400">RTP:</span>
              <strong className="text-emerald-400">97.50%</strong>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">Ladder:</span>
              <strong className="text-amber-400">32x Goal Streak</strong>
            </div>

            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 group-hover:translate-x-1 transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Shootout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto py-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search within Casino */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search casino games..."
            value={casinoSearch}
            onChange={(e) => setCasinoSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => setActiveCasinoGame(game.id)}
            className="group relative bg-[#11141c] border border-gray-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
          >
            {/* Top Game Art Banner */}
            <div
              className={`h-28 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="flex items-center justify-between relative z-10">
                {game.isHot ? (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 rounded-md border border-amber-400/30">
                    🔥 HOT
                  </span>
                ) : game.isNew ? (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 rounded-md border border-emerald-400/30">
                    ✨ NEW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-mono text-white/80 bg-black/40 rounded">
                    RTP {game.rtp}
                  </span>
                )}

                <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>{game.activePlayers}</span>
                </div>
              </div>

              {/* Center Game Title Overlay */}
              <div className="relative z-10">
                <h4 className="text-base font-extrabold text-white leading-tight drop-shadow-md">
                  {game.title}
                </h4>
                <p className="text-[10px] text-white/80 font-medium">{game.subtitle}</p>
              </div>

              {/* Play Hover Overlay Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Game Specs */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">{game.provider}</span>
                <span className="font-mono font-bold text-emerald-400">Max {game.maxMultiplier}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {game.tags.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 bg-gray-900 border border-gray-800 rounded text-[9px] font-medium text-gray-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
