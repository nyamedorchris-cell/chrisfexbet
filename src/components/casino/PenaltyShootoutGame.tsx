import React, { useState } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Trophy,
  Target,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

type ShotTarget = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center';

const MULTIPLIER_LADDER = [1.92, 3.84, 7.68, 15.36, 32.0];

export const PenaltyShootoutGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [stake, setStake] = useState<number>(20);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'scored' | 'saved' | 'cashed_out'>('betting');
  const [round, setRound] = useState<number>(0);
  const [goalieDive, setGoalieDive] = useState<ShotTarget | null>(null);
  const [playerShot, setPlayerShot] = useState<ShotTarget | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);

  const currentMultiplier = round > 0 ? MULTIPLIER_LADDER[round - 1] : 1.0;

  // Start new penalty series
  const handleStartGame = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    soundFx.playChipDrop();
    setRound(0);
    setGoalieDive(null);
    setPlayerShot(null);
    setLastWinAmount(0);
    setGameState('playing');
  };

  // Shoot at a spot
  const handleShoot = (target: ShotTarget) => {
    if (gameState !== 'playing' && gameState !== 'scored') return;

    setPlayerShot(target);

    // Goalie randomly dives to one of the 5 targets
    const allTargets: ShotTarget[] = ['top_left', 'top_right', 'bottom_left', 'bottom_right', 'center'];
    const gDive = allTargets[Math.floor(Math.random() * allTargets.length)];
    setGoalieDive(gDive);

    // Goal if goalie didn't dive to exact same corner (80% goal rate per kick)
    const isGoal = target !== gDive;

    if (isGoal) {
      soundFx.playGoalNotification();
      const nextRound = round + 1;
      setRound(nextRound);
      setGameState('scored');

      // Check if max 5 rounds achieved
      if (nextRound >= 5) {
        handleCashout(MULTIPLIER_LADDER[4]);
      }
    } else {
      // Saved by keeper!
      soundFx.playExplosion();
      setGameState('saved');
      playCasinoBet('penalty', 'Ghana Black Stars Shootout', stake, 0, 0, {
        round,
        target,
        saved: true,
      });
    }
  };

  // Cash out current goal ladder winnings
  const handleCashout = (mult = currentMultiplier) => {
    if (round === 0) return;
    const winAmount = Number((stake * mult).toFixed(2));
    setGameState('cashed_out');
    setLastWinAmount(winAmount);

    playCasinoBet('penalty', 'Ghana Black Stars Shootout', stake, mult, winAmount, {
      goalsScored: round,
    });
  };

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Ghana Black Stars Penalty Shootout
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Up to 32x Multiplier Ladder
        </span>
      </div>

      {/* Goal Multiplier Ladder Header */}
      <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Goal Streak Ladder:</span>
        </div>
        <div className="flex items-center space-x-2">
          {MULTIPLIER_LADDER.map((mult, idx) => {
            const isCompleted = round > idx;
            const isCurrent = round === idx && (gameState === 'playing' || gameState === 'scored');

            return (
              <div
                key={idx}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-amber-500 text-black ring-2 ring-amber-300 animate-pulse'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span>Kick {idx + 1}:</span>
                <span>{mult}x</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Post & Pitch Stage */}
      <div className="relative p-6 bg-gradient-to-b from-[#0a2618] to-[#04120a] min-h-[340px] flex flex-col items-center justify-center select-none overflow-hidden">
        {/* Goal Frame */}
        <div className="relative w-full max-w-md h-52 border-4 border-white/90 rounded-t-xl bg-black/40 shadow-2xl flex items-center justify-center p-3">
          {/* Net grid pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* Goalie representation */}
          <div
            className={`absolute transition-all duration-300 flex flex-col items-center justify-center ${
              goalieDive === 'top_left'
                ? 'top-2 left-6 -rotate-45'
                : goalieDive === 'top_right'
                ? 'top-2 right-6 rotate-45'
                : goalieDive === 'bottom_left'
                ? 'bottom-2 left-6 -rotate-20'
                : goalieDive === 'bottom_right'
                ? 'bottom-2 right-6 rotate-20'
                : 'top-12'
            }`}
          >
            <div className="w-12 h-16 rounded-2xl bg-gradient-to-b from-yellow-500 to-amber-600 border-2 border-yellow-300 shadow-xl flex flex-col items-center justify-center text-black font-extrabold text-[10px]">
              <span>KEEPER</span>
            </div>
          </div>

          {/* 5 Interactive Shot Target Buttons */}
          {(gameState === 'playing' || gameState === 'scored') && (
            <div className="absolute inset-0 p-3 grid grid-cols-3 grid-rows-2 gap-3 z-10">
              <button
                onClick={() => handleShoot('top_left')}
                className="rounded-xl border-2 border-dashed border-amber-400/60 hover:bg-amber-500/20 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShoot('center')}
                className="row-span-2 rounded-xl border-2 border-dashed border-yellow-400/60 hover:bg-yellow-500/20 hover:border-yellow-400 text-yellow-300 font-bold text-xs flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold mt-1">Panenka</span>
              </button>
              <button
                onClick={() => handleShoot('top_right')}
                className="rounded-xl border-2 border-dashed border-amber-400/60 hover:bg-amber-500/20 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShoot('bottom_left')}
                className="rounded-xl border-2 border-dashed border-amber-400/60 hover:bg-amber-500/20 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShoot('bottom_right')}
                className="rounded-xl border-2 border-dashed border-amber-400/60 hover:bg-amber-500/20 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Shootout Status / Goal Toast */}
        {gameState === 'scored' && (
          <div className="mt-4 px-6 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/30 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              GOAL!! Kick #{round} Scored ({currentMultiplier}x • {formatCurrency(stake * currentMultiplier)})
            </span>
          </div>
        )}

        {gameState === 'saved' && (
          <div className="mt-4 px-6 py-2 rounded-xl bg-red-600 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-red-600/30 animate-in zoom-in-95">
            <AlertTriangle className="w-5 h-5" />
            <span>SAVED BY THE GOALIE! Shootout over.</span>
          </div>
        )}

        {gameState === 'cashed_out' && (
          <div className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/30 animate-in zoom-in-95">
            <Trophy className="w-5 h-5 fill-black" />
            <span>CASHED OUT: +{formatCurrency(lastWinAmount)} ({currentMultiplier}x)</span>
          </div>
        )}
      </div>

      {/* Control Deck */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Stake Chips */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
              Penalty Stake (GH₵)
            </span>
            <span className="text-gray-400 font-mono text-[11px]">
              Bal: <strong className="text-white">{formatCurrency(wallet.balance)}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {[2, 5, 10, 20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                disabled={gameState === 'playing' || gameState === 'scored'}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  stake === amt
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-5">
          {gameState === 'scored' && round > 0 ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCashout()}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black font-extrabold rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center leading-tight"
              >
                <span>CASH OUT</span>
                <span className="text-xs font-mono font-bold mt-0.5">
                  {formatCurrency(stake * currentMultiplier)} ({currentMultiplier}x)
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartGame}
              disabled={gameState === 'playing'}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-extrabold rounded-xl text-base uppercase tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>
                {gameState === 'playing'
                  ? 'PICK CORNER TO SHOOT'
                  : `START PENALTY SERIES (${formatCurrency(stake)})`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
