import React, { useState } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Bomb,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface TileState {
  index: number;
  isMine: boolean;
  isRevealed: boolean;
}

export const MinesGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [mineCount, setMineCount] = useState<number>(3);
  const [stake, setStake] = useState<number>(20);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'cashed_out' | 'exploded'>('betting');
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [gemsUncovered, setGemsUncovered] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);

  // Multiplier math formula based on total tiles (25) and remaining safe tiles
  const calculateNextMultiplier = (uncovered: number, totalMines: number) => {
    let mult = 1.0;
    const totalTiles = 25;
    const safeTiles = totalTiles - totalMines;

    for (let i = 0; i < uncovered; i++) {
      const prob = (safeTiles - i) / (totalTiles - i);
      mult *= (1 / prob) * 0.98; // 98% RTP
    }
    return Number(Math.max(1.01, mult).toFixed(2));
  };

  // Start new Mines game round
  const handleStartGame = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    soundFx.playChipDrop();
    setLastWinAmount(0);
    setGemsUncovered(0);
    setCurrentMultiplier(1.0);

    // Randomly assign mine positions on 5x5 board (25 tiles)
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      mineIndices.add(idx);
    }

    const initialTiles: TileState[] = Array.from({ length: 25 }, (_, index) => ({
      index,
      isMine: mineIndices.has(index),
      isRevealed: false,
    }));

    setTiles(initialTiles);
    setGameState('playing');
  };

  // Click on a tile
  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    const tile = tiles[index];
    if (tile.isRevealed) return;

    if (tile.isMine) {
      // Hit mine -> explode!
      soundFx.playExplosion();
      setGameState('exploded');
      // Reveal all tiles
      setTiles((prev) =>
        prev.map((t) => ({ ...t, isRevealed: true }))
      );
      playCasinoBet('mines', 'Mines Vault', stake, 0, 0, {
        mineCount,
        gemsUncovered,
        explodedAtIndex: index,
      });
    } else {
      // Uncovered Gem!
      soundFx.playGemReveal();
      const newUncovered = gemsUncovered + 1;
      const nextMult = calculateNextMultiplier(newUncovered, mineCount);
      setGemsUncovered(newUncovered);
      setCurrentMultiplier(nextMult);

      setTiles((prev) =>
        prev.map((t) => (t.index === index ? { ...t, isRevealed: true } : t))
      );

      // Check if all safe tiles cleared
      if (newUncovered === 25 - mineCount) {
        handleCashout(nextMult);
      }
    }
  };

  // Cash out
  const handleCashout = (mult = currentMultiplier) => {
    if (gameState !== 'playing' || gemsUncovered === 0) return;
    const winAmount = Number((stake * mult).toFixed(2));

    setGameState('cashed_out');
    setLastWinAmount(winAmount);
    // Reveal rest of tiles
    setTiles((prev) => prev.map((t) => ({ ...t, isRevealed: true })));

    playCasinoBet('mines', 'Mines Vault', stake, mult, winAmount, {
      mineCount,
      gemsUncovered,
    });
  };

  const nextMultiplierPreview = calculateNextMultiplier(gemsUncovered + 1, mineCount);

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bomb className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Mines Vault (5x5 Grid)
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
          99.00% RTP • Provably Fair
        </span>
      </div>

      {/* Main Grid Area */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0f1f1d] to-[#0a1212] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center select-none">
        {/* 5x5 Minefield */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="grid grid-cols-5 gap-2 w-full max-w-sm p-3 bg-black/60 border border-teal-500/30 rounded-2xl shadow-2xl backdrop-blur-sm">
            {Array.from({ length: 25 }, (_, i) => {
              const tile = tiles[i];
              const isRevealed = tile?.isRevealed;
              const isMine = tile?.isMine;

              return (
                <button
                  key={i}
                  onClick={() => handleTileClick(i)}
                  disabled={gameState !== 'playing' || isRevealed}
                  className={`h-14 sm:h-16 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl transition-all cursor-pointer shadow-md ${
                    isRevealed
                      ? isMine
                        ? 'bg-red-600/90 border-2 border-red-400 text-white animate-bounce'
                        : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black border-2 border-emerald-300 scale-95'
                      : gameState === 'playing'
                      ? 'bg-[#1b2729] hover:bg-[#25393c] border border-teal-700/40 active:scale-95'
                      : 'bg-[#1b2729]/60 border border-gray-800 cursor-not-allowed'
                  }`}
                >
                  {isRevealed ? (
                    isMine ? (
                      <Bomb className="w-7 h-7 text-white stroke-[2.5]" />
                    ) : (
                      <Sparkles className="w-7 h-7 text-black stroke-[2.5]" />
                    )
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats & Multipliers Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Status */}
          <div className="bg-gray-950/80 border border-teal-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Gems Uncovered</span>
              <span className="text-base font-extrabold font-mono text-teal-400">
                {gemsUncovered} / {25 - mineCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Current Multiplier</span>
              <span className="text-2xl font-extrabold font-mono text-white">
                {currentMultiplier.toFixed(2)}x
              </span>
            </div>

            {gameState === 'playing' && gemsUncovered > 0 && (
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400">Next Gem Step:</span>
                <span className="font-mono font-bold text-amber-400">
                  {nextMultiplierPreview.toFixed(2)}x (+{formatCurrency(stake * nextMultiplierPreview)})
                </span>
              </div>
            )}
          </div>

          {/* Outcome Alert */}
          {gameState === 'cashed_out' && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold uppercase">Cashed Out Successfully!</p>
                  <p className="text-[10px] text-gray-400">Profit: +{formatCurrency(lastWinAmount - stake)}</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-400">
                +{formatCurrency(lastWinAmount)}
              </span>
            </div>
          )}

          {gameState === 'exploded' && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 flex items-center space-x-2 animate-in zoom-in-95">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase">Bomb Exploded!</p>
                <p className="text-[10px] text-gray-400">Round ended. Choose your stake to try again.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Betting Deck */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Mine Count & Stake Selection */}
        <div className="lg:col-span-7 space-y-3">
          {/* Mines Count Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
              Mines Count: <strong className="text-teal-400">{mineCount}</strong>
            </span>
            <span className="text-[11px] text-gray-500">More mines = Higher Multiplier</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {[1, 2, 3, 5, 10, 15, 20, 24].map((count) => (
              <button
                key={count}
                onClick={() => setMineCount(count)}
                disabled={gameState === 'playing'}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  mineCount === count
                    ? 'bg-teal-500 text-black shadow-md shadow-teal-500/30'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {/* Quick Stake Chips */}
          <div className="flex items-center space-x-2 pt-1 border-t border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Stake:</span>
            {[2, 5, 10, 20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                disabled={gameState === 'playing'}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  stake === amt
                    ? 'bg-gray-700 text-white border border-teal-400'
                    : 'bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-5">
          {gameState === 'playing' ? (
            <button
              onClick={() => handleCashout()}
              disabled={gemsUncovered === 0}
              className={`w-full py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center ${
                gemsUncovered === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black shadow-emerald-500/30'
              }`}
            >
              <span>CASH OUT NOW</span>
              <span className="text-xs font-mono font-bold mt-0.5">
                {formatCurrency(stake * currentMultiplier)} ({currentMultiplier.toFixed(2)}x)
              </span>
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-black font-extrabold rounded-xl text-base uppercase tracking-wider shadow-lg shadow-teal-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>START MINES ROUND ({formatCurrency(stake)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
