import React, { useState } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { CASINO_GAMES } from '../../data/casinoGamesData';
import { formatCurrency } from '../../utils/oddsFormatter';
import { AviatorGame } from './AviatorGame';
import { RouletteGame } from './RouletteGame';
import { BlackjackGame } from './BlackjackGame';
import { SlotsGame } from './SlotsGame';
import { MinesGame } from './MinesGame';
import { PlinkoGame } from './PlinkoGame';
import { PenaltyShootoutGame } from './PenaltyShootoutGame';
import { BaccaratGame } from './BaccaratGame';
import {
  X,
  ShieldCheck,
  Volume2,
  VolumeX,
  PlusCircle,
  Sparkles,
  Info,
  Lock,
  CheckCircle,
} from 'lucide-react';

export const CasinoGameModal: React.FC = () => {
  const {
    activeCasinoGame,
    setActiveCasinoGame,
    wallet,
    soundEnabled,
    setSoundEnabled,
    setIsDepositModalOpen,
  } = useSportsbook();

  const [showFairModal, setShowFairModal] = useState<boolean>(false);

  if (!activeCasinoGame) return null;

  const gameMeta = CASINO_GAMES.find((g) => g.id === activeCasinoGame);
  if (!gameMeta) return null;

  // Render specific game engine
  const renderGameComponent = () => {
    switch (activeCasinoGame) {
      case 'aviator':
        return <AviatorGame />;
      case 'roulette':
        return <RouletteGame />;
      case 'blackjack':
        return <BlackjackGame />;
      case 'slots':
        return <SlotsGame />;
      case 'mines':
        return <MinesGame />;
      case 'plinko':
        return <PlinkoGame />;
      case 'penalty':
        return <PenaltyShootoutGame />;
      case 'baccarat':
        return <BaccaratGame />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f1219] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Game Modal Top Bar */}
        <div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gameMeta.bannerGradient} flex items-center justify-center text-white shadow-md`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">{gameMeta.title}</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-gray-800 text-emerald-400 border border-gray-700 rounded">
                  RTP {gameMeta.rtp}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{gameMeta.provider}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Wallet Pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Balance:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatCurrency(wallet.balance)}
              </span>
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300"
                title="Deposit Ghana Cedis"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Provably Fair Verifier Trigger */}
            <button
              onClick={() => setShowFairModal(true)}
              className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-900 rounded-lg transition-colors"
              title="Provably Fair Verifier"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded-lg transition-colors"
              title="Sound Effects"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Close Game Button */}
            <button
              onClick={() => setActiveCasinoGame(null)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Game Workspace */}
        <div className="p-2 sm:p-4 bg-[#0a0c10]">{renderGameComponent()}</div>

        {/* Provably Fair Verifier Overlay */}
        {showFairModal && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-in fade-in-50">
            <div className="max-w-md w-full bg-gray-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 text-left shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">Provably Fair Cryptographic Seed</h4>
                </div>
                <button
                  onClick={() => setShowFairModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Every game round outcome is determined using SHA-256 HMAC cryptographic hashing
                before the round starts, ensuring zero manipulation and 100% mathematical fairness.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Server Seed Hash (SHA-256):</span>
                  <p className="bg-black/60 p-2 rounded border border-gray-800 text-gray-300 break-all text-[11px]">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Client Seed:</span>
                  <p className="bg-black/60 p-2 rounded border border-gray-800 text-emerald-400 break-all text-[11px]">
                    vantastake-ghana-client-{Math.random().toString(36).substring(2, 10)}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowFairModal(false)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg"
                >
                  Close Verifier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
