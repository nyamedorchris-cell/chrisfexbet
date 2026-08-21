import React, { useState, useEffect } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Sparkles,
  Zap,
  RotateCw,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';

interface SymbolItem {
  name: string;
  emoji: string;
  payout3: number;
  payout4: number;
  payout5: number;
  isWild?: boolean;
  isScatter?: boolean;
}

const SLOT_SYMBOLS: SymbolItem[] = [
  { name: 'Seven', emoji: '7️⃣', payout3: 10, payout4: 50, payout5: 500 },
  { name: 'Diamond', emoji: '💎', payout3: 8, payout4: 30, payout5: 250 },
  { name: 'Crown', emoji: '👑', payout3: 5, payout4: 20, payout5: 150 },
  { name: 'Star', emoji: '⭐', payout3: 4, payout4: 15, payout5: 100 },
  { name: 'Bell', emoji: '🔔', payout3: 3, payout4: 10, payout5: 60 },
  { name: 'Cherry', emoji: '🍒', payout3: 2, payout4: 6, payout5: 40 },
  { name: 'Lemon', emoji: '🍋', payout3: 1.5, payout4: 4, payout5: 25 },
  { name: 'Wild', emoji: '⚡', payout3: 15, payout4: 75, payout5: 750, isWild: true },
  { name: 'Scatter', emoji: '🪙', payout3: 5, payout4: 25, payout5: 100, isScatter: true },
];

export const SlotsGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [stake, setStake] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reels, setReels] = useState<SymbolItem[][]>([
    [SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]],
    [SLOT_SYMBOLS[3], SLOT_SYMBOLS[4], SLOT_SYMBOLS[5]],
    [SLOT_SYMBOLS[6], SLOT_SYMBOLS[7], SLOT_SYMBOLS[0]],
    [SLOT_SYMBOLS[1], SLOT_SYMBOLS[2], SLOT_SYMBOLS[3]],
    [SLOT_SYMBOLS[4], SLOT_SYMBOLS[5], SLOT_SYMBOLS[6]],
  ]);
  const [winningLines, setWinningLines] = useState<string[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);

  const getRandomSymbol = () => {
    return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
  };

  const handleSpin = () => {
    if (isSpinning) return;
    const isFreeSpin = freeSpinsLeft > 0;
    if (!isFreeSpin && stake > wallet.balance) {
      setIsDepositModalOpen(true);
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    setLastWinAmount(0);
    soundFx.playSpin();

    if (isFreeSpin) {
      setFreeSpinsLeft((prev) => prev - 1);
    }

    // Reel spin animation with staggered landing
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);

      if (ticks >= 12) {
        clearInterval(interval);
        finalizeSpin(isFreeSpin);
      }
    }, 80);
  };

  const finalizeSpin = (isFreeSpin: boolean) => {
    // Generate final grid
    const finalGrid: SymbolItem[][] = Array.from({ length: 5 }, () => [
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
    ]);
    setReels(finalGrid);
    setIsSpinning(false);

    // Evaluate 20 classic slot paylines across 5 reels
    let totalMultiplier = 0;
    const hits: string[] = [];

    // Check 3 horizontal rows
    for (let row = 0; row < 3; row++) {
      const s0 = finalGrid[0][row];
      const s1 = finalGrid[1][row];
      const s2 = finalGrid[2][row];
      const s3 = finalGrid[3][row];
      const s4 = finalGrid[4][row];

      // Match 5
      if (
        (s1.name === s0.name || s1.isWild) &&
        (s2.name === s0.name || s2.isWild) &&
        (s3.name === s0.name || s3.isWild) &&
        (s4.name === s0.name || s4.isWild)
      ) {
        totalMultiplier += s0.payout5;
        hits.push(`Line ${row + 1}: 5x ${s0.name} (+${s0.payout5}x)`);
      }
      // Match 4
      else if (
        (s1.name === s0.name || s1.isWild) &&
        (s2.name === s0.name || s2.isWild) &&
        (s3.name === s0.name || s3.isWild)
      ) {
        totalMultiplier += s0.payout4;
        hits.push(`Line ${row + 1}: 4x ${s0.name} (+${s0.payout4}x)`);
      }
      // Match 3
      else if (
        (s1.name === s0.name || s1.isWild) &&
        (s2.name === s0.name || s2.isWild)
      ) {
        totalMultiplier += s0.payout3;
        hits.push(`Line ${row + 1}: 3x ${s0.name} (+${s0.payout3}x)`);
      }
    }

    // Check Scatter Free Spins count
    let scatterCount = 0;
    finalGrid.forEach((col) => {
      col.forEach((s) => {
        if (s.isScatter) scatterCount++;
      });
    });

    if (scatterCount >= 3) {
      const awarded = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 25;
      setFreeSpinsLeft((prev) => prev + awarded);
      hits.push(`BONUS TRIGGER: ${scatterCount} Scatters awarded ${awarded} Free Spins (3x Boost)!`);
    }

    // Apply Free Spin 3x Multiplier
    if (isFreeSpin && totalMultiplier > 0) {
      totalMultiplier *= 3;
    }

    const winAmount = Number((stake * totalMultiplier).toFixed(2));
    setWinningLines(hits);
    setLastWinAmount(winAmount);

    playCasinoBet(
      'slots',
      'Vanta Megaways 777',
      isFreeSpin ? 0 : stake,
      totalMultiplier,
      winAmount,
      { hits }
    );
  };

  // Auto spin loop
  useEffect(() => {
    if (!autoSpin || isSpinning) return;
    const timer = setTimeout(() => {
      if (stake <= wallet.balance || freeSpinsLeft > 0) {
        handleSpin();
      } else {
        setAutoSpin(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [autoSpin, isSpinning, freeSpinsLeft]);

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Slot Machine Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-900/60 via-gray-900 to-pink-900/60 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              VANTA MEGAWAYS 777
            </h3>
            <p className="text-[10px] text-purple-300 font-mono">20 Paylines • Wild ⚡ • Scatter 🪙</p>
          </div>
        </div>

        {freeSpinsLeft > 0 && (
          <div className="px-3 py-1 bg-amber-500 text-black font-extrabold text-xs rounded-full flex items-center space-x-1.5 shadow-lg shadow-amber-500/30 animate-bounce">
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>{freeSpinsLeft} FREE SPINS (3X MULTIPLIER)</span>
          </div>
        )}
      </div>

      {/* 5-Reel Slot Grid Stage */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-[#1a1226] via-[#100c19] to-[#0a0810] flex flex-col items-center justify-center select-none">
        <div className="w-full max-w-2xl bg-black/70 border-4 border-purple-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {reels.map((col, colIdx) => (
              <div
                key={colIdx}
                className="bg-gradient-to-b from-gray-900 to-gray-950 border border-purple-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col gap-2 shadow-inner"
              >
                {col.map((sym, rowIdx) => (
                  <div
                    key={rowIdx}
                    className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-center border transition-all ${
                      sym.isWild
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/20'
                        : sym.isScatter
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/20'
                        : 'bg-gray-800/40 border-gray-700/50'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-md">{sym.emoji}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                      {sym.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Win Banner */}
        {lastWinAmount > 0 && (
          <div className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm sm:text-base flex items-center space-x-2 shadow-lg shadow-amber-500/30 animate-in zoom-in-95 duration-150">
            <Trophy className="w-5 h-5 fill-black" />
            <span>MEGA WIN! +{formatCurrency(lastWinAmount)}</span>
          </div>
        )}

        {winningLines.length > 0 && lastWinAmount === 0 && (
          <div className="mt-3 text-xs text-purple-300 font-semibold text-center">
            {winningLines.join(' • ')}
          </div>
        )}
      </div>

      {/* Control Deck */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Bet Amount Controls */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
              Spin Stake (GH₵)
            </span>
            <span className="text-gray-400 font-mono text-[11px]">
              Wallet: <strong className="text-white">{formatCurrency(wallet.balance)}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {[2, 5, 10, 20, 50, 100, 200].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setStake(amt);
                  soundFx.playChipDrop();
                }}
                disabled={freeSpinsLeft > 0}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  stake === amt
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-5 flex items-center space-x-2">
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`px-4 py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center space-x-1.5 ${
              autoSpin
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {autoSpin ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>AUTO</span>
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`flex-1 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              isSpinning
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : freeSpinsLeft > 0 ? 'FREE SPIN' : 'SPIN REELS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
