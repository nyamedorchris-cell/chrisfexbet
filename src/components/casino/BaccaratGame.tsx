import React, { useState } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Coins,
  Sparkles,
  RotateCcw,
  Trophy,
  History,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  points: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: 'A', points: 1 },
  { val: '2', points: 2 },
  { val: '3', points: 3 },
  { val: '4', points: 4 },
  { val: '5', points: 5 },
  { val: '6', points: 6 },
  { val: '7', points: 7 },
  { val: '8', points: 8 },
  { val: '9', points: 9 },
  { val: '10', points: 0 },
  { val: 'J', points: 0 },
  { val: 'Q', points: 0 },
  { val: 'K', points: 0 },
];

export const BaccaratGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [selectedBetType, setSelectedBetType] = useState<'player' | 'banker' | 'tie'>('banker');
  const [stake, setStake] = useState<number>(25);
  const [selectedChip, setSelectedChip] = useState<number>(25);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [outcome, setOutcome] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [roadHistory, setRoadHistory] = useState<('P' | 'B' | 'T')[]>([
    'B', 'B', 'P', 'B', 'T', 'P', 'P', 'B', 'B', 'P', 'B', 'B'
  ]);

  const drawCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const v = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit: s, value: v.val, points: v.points };
  };

  const calculateBaccaratScore = (cards: Card[]): number => {
    const total = cards.reduce((sum, c) => sum + c.points, 0);
    return total % 10;
  };

  const playerScore = calculateBaccaratScore(playerCards);
  const bankerScore = calculateBaccaratScore(bankerCards);

  // Deal baccarat hand
  const handleDeal = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    setIsDealing(true);
    setOutcome(null);
    setLastWinAmount(null);
    soundFx.playCardDeal();

    const p1 = drawCard();
    const b1 = drawCard();
    const p2 = drawCard();
    const b2 = drawCard();

    let finalPlayerCards = [p1, p2];
    let finalBankerCards = [b1, b2];

    let pTotal = calculateBaccaratScore(finalPlayerCards);
    let bTotal = calculateBaccaratScore(finalBankerCards);

    // Natural 8 or 9 check
    if (pTotal >= 8 || bTotal >= 8) {
      // Stand immediately
    } else {
      // Player draws 3rd card on 0-5
      let p3: Card | null = null;
      if (pTotal <= 5) {
        p3 = drawCard();
        finalPlayerCards.push(p3);
        pTotal = calculateBaccaratScore(finalPlayerCards);
      }

      // Banker third card rules
      if (!p3) {
        if (bTotal <= 5) {
          finalBankerCards.push(drawCard());
        }
      } else {
        const p3Val = p3.points;
        if (bTotal <= 2) {
          finalBankerCards.push(drawCard());
        } else if (bTotal === 3 && p3Val !== 8) {
          finalBankerCards.push(drawCard());
        } else if (bTotal === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) {
          finalBankerCards.push(drawCard());
        } else if (bTotal === 5 && [4, 5, 6, 7].includes(p3Val)) {
          finalBankerCards.push(drawCard());
        } else if (bTotal === 6 && [6, 7].includes(p3Val)) {
          finalBankerCards.push(drawCard());
        }
      }
    }

    setPlayerCards(finalPlayerCards);
    setBankerCards(finalBankerCards);

    const fPlayerScore = calculateBaccaratScore(finalPlayerCards);
    const fBankerScore = calculateBaccaratScore(finalBankerCards);

    setTimeout(() => {
      setIsDealing(false);
      let winner: 'player' | 'banker' | 'tie';
      let multiplier = 0;

      if (fPlayerScore > fBankerScore) {
        winner = 'player';
        if (selectedBetType === 'player') multiplier = 2.0; // 1:1
      } else if (fBankerScore > fPlayerScore) {
        winner = 'banker';
        if (selectedBetType === 'banker') multiplier = 1.95; // 0.95:1
      } else {
        winner = 'tie';
        if (selectedBetType === 'tie') multiplier = 9.0; // 8:1
        else if (selectedBetType !== 'tie') multiplier = 1.0; // Push on tie for Main bets
      }

      setOutcome(winner);
      setRoadHistory((prev) => [winner === 'player' ? 'P' : winner === 'banker' ? 'B' : 'T', ...prev.slice(0, 15)]);

      const winAmount = Number((stake * multiplier).toFixed(2));
      setLastWinAmount(winAmount);

      playCasinoBet('baccarat', 'Baccarat Royale Squeeze', stake, multiplier, winAmount, {
        winner,
        playerScore: fPlayerScore,
        bankerScore: fBankerScore,
      });
    }, 800);
  };

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header & Roadmap */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Baccarat Royale Squeeze
          </span>
        </div>

        {/* Big Road History */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {roadHistory.map((r, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                r === 'P' ? 'bg-blue-600' : r === 'B' ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Felt Table Stage */}
      <div className="p-6 bg-gradient-to-b from-[#1b1509] to-[#0c0903] min-h-[340px] flex flex-col justify-between relative select-none">
        {/* Table Cards Comparison */}
        <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto w-full">
          {/* Player Hand */}
          <div className="bg-black/50 border border-blue-500/40 rounded-2xl p-4 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-blue-400">Player</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-xs font-mono font-bold text-blue-300">
                {playerScore}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 min-h-[85px]">
              {playerCards.map((card, idx) => {
                const isRed = card.suit === '♥' || card.suit === '♦';
                return (
                  <div
                    key={idx}
                    className="w-14 h-20 rounded-xl bg-white text-gray-900 border border-gray-300 shadow-xl p-1 flex flex-col justify-between font-bold animate-in zoom-in-75 duration-200"
                  >
                    <div className={`text-[10px] ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                    <div className={`text-lg text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-[10px] text-right ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banker Hand */}
          <div className="bg-black/50 border border-red-500/40 rounded-2xl p-4 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-red-400">Banker</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-xs font-mono font-bold text-red-300">
                {bankerScore}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 min-h-[85px]">
              {bankerCards.map((card, idx) => {
                const isRed = card.suit === '♥' || card.suit === '♦';
                return (
                  <div
                    key={idx}
                    className="w-14 h-20 rounded-xl bg-white text-gray-900 border border-gray-300 shadow-xl p-1 flex flex-col justify-between font-bold animate-in zoom-in-75 duration-200"
                  >
                    <div className={`text-[10px] ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                    <div className={`text-lg text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-[10px] text-right ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Outcome Winner Banner */}
        {outcome && (
          <div className="mt-4 px-6 py-2 rounded-xl bg-black/80 border border-amber-500/40 mx-auto text-center animate-in zoom-in-95">
            <span className="text-xs uppercase font-bold text-gray-400 block">Round Result:</span>
            <span
              className={`text-base font-extrabold uppercase ${
                outcome === 'player'
                  ? 'text-blue-400'
                  : outcome === 'banker'
                  ? 'text-red-400'
                  : 'text-emerald-400'
              }`}
            >
              {outcome.toUpperCase()} WINS ({playerScore} vs {bankerScore})
            </span>
            {lastWinAmount !== null && lastWinAmount > 0 && (
              <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                Payout: +{formatCurrency(lastWinAmount)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Betting Controls & Chips */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 space-y-4">
        {/* Main Bet Options (Player 1:1, Tie 8:1, Banker 0.95:1) */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedBetType('player')}
            className={`py-3 rounded-xl border-2 font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBetType === 'player'
                ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102'
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-sm">PLAYER</span>
            <span className="text-[10px] font-mono text-blue-300">PAYS 1:1</span>
          </button>

          <button
            onClick={() => setSelectedBetType('tie')}
            className={`py-3 rounded-xl border-2 font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBetType === 'tie'
                ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-102'
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-sm">TIE</span>
            <span className="text-[10px] font-mono text-emerald-300">PAYS 8:1</span>
          </button>

          <button
            onClick={() => setSelectedBetType('banker')}
            className={`py-3 rounded-xl border-2 font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBetType === 'banker'
                ? 'bg-red-600/30 border-red-500 text-white shadow-lg shadow-red-500/20 scale-102'
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-sm">BANKER</span>
            <span className="text-[10px] font-mono text-red-300">PAYS 0.95:1</span>
          </button>
        </div>

        {/* Chip Selection & Deal Action */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Chip:</span>
            {[5, 10, 25, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setStake(amt);
                  soundFx.playChipDrop();
                }}
                className={`w-9 h-9 rounded-full text-xs font-mono font-bold border-2 transition-all cursor-pointer flex items-center justify-center ${
                  stake === amt
                    ? 'border-amber-400 bg-amber-500 text-black scale-110 shadow-lg shadow-amber-500/20'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeal}
            disabled={isDealing}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-extrabold rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>{isDealing ? 'DEALING...' : `DEAL CARDS (${formatCurrency(stake)})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
