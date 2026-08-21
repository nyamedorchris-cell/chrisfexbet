import React, { useState, useEffect } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Layers,
  Plus,
  Hand,
  TrendingUp,
  RotateCcw,
  Trophy,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  weight: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: '2', weight: 2 },
  { val: '3', weight: 3 },
  { val: '4', weight: 4 },
  { val: '5', weight: 5 },
  { val: '6', weight: 6 },
  { val: '7', weight: 7 },
  { val: '8', weight: 8 },
  { val: '9', weight: 9 },
  { val: '10', weight: 10 },
  { val: 'J', weight: 10 },
  { val: 'Q', weight: 10 },
  { val: 'K', weight: 10 },
  { val: 'A', weight: 11 },
];

export const BlackjackGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [stake, setStake] = useState<number>(25);
  const [selectedChip, setSelectedChip] = useState<number>(25);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'resolved'>('betting');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [outcomeMessage, setOutcomeMessage] = useState<string>('');
  const [outcomeType, setOutcomeType] = useState<'win' | 'loss' | 'push' | 'blackjack' | ''>('');
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);

  // Deck generation
  const drawRandomCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const v = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit: s, value: v.val, weight: v.weight };
  };

  // Score calculation with Ace adjustment
  const calculateScore = (cards: Card[]): number => {
    let score = 0;
    let aces = 0;

    cards.forEach((c) => {
      score += c.weight;
      if (c.value === 'A') aces++;
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  };

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);
  const isPlayerBlackjack = playerCards.length === 2 && playerScore === 21;

  // Start Deal
  const handleDeal = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    soundFx.playCardDeal();
    setOutcomeMessage('');
    setOutcomeType('');
    setLastWinAmount(0);

    const p1 = drawRandomCard();
    const d1 = drawRandomCard();
    const p2 = drawRandomCard();
    const d2 = drawRandomCard();

    setPlayerCards([p1, p2]);
    setDealerCards([d1, d2]);
    setGameState('playing');

    // Check immediate player blackjack
    const pScore = calculateScore([p1, p2]);
    const dScore = calculateScore([d1, d2]);

    if (pScore === 21) {
      if (dScore === 21) {
        // Push
        setGameState('resolved');
        setOutcomeType('push');
        setOutcomeMessage('Both have Blackjack! Push (Bet Refunded).');
        playCasinoBet('blackjack', 'Blackjack 21 VIP', stake, 1.0, stake);
      } else {
        // Natural 3:2 payout!
        const win = Number((stake * 2.5).toFixed(2));
        setGameState('resolved');
        setOutcomeType('blackjack');
        setOutcomeMessage('NATURAL BLACKJACK 21! Pays 3:2!');
        setLastWinAmount(win);
        playCasinoBet('blackjack', 'Blackjack 21 VIP', stake, 2.5, win);
      }
    }
  };

  // Player Hit
  const handleHit = () => {
    if (gameState !== 'playing') return;
    soundFx.playCardDeal();
    const newCard = drawRandomCard();
    const newCards = [...playerCards, newCard];
    setPlayerCards(newCards);

    const score = calculateScore(newCards);
    if (score > 21) {
      // Player busts
      setGameState('resolved');
      setOutcomeType('loss');
      setOutcomeMessage('Player Bust! Over 21.');
      soundFx.playExplosion();
      playCasinoBet('blackjack', 'Blackjack 21 VIP', stake, 0, 0, { bust: true });
    } else if (score === 21) {
      // Auto stand
      handleStand(newCards);
    }
  };

  // Player Double Down
  const handleDoubleDown = () => {
    if (gameState !== 'playing' || playerCards.length !== 2) return;
    if (stake * 2 > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    soundFx.playCardDeal();
    const doubledStake = stake * 2;
    setStake(doubledStake);

    const newCard = drawRandomCard();
    const newCards = [...playerCards, newCard];
    setPlayerCards(newCards);

    const score = calculateScore(newCards);
    if (score > 21) {
      setGameState('resolved');
      setOutcomeType('loss');
      setOutcomeMessage('Player Bust on Double Down!');
      soundFx.playExplosion();
      playCasinoBet('blackjack', 'Blackjack 21 VIP', doubledStake, 0, 0);
    } else {
      handleStand(newCards, doubledStake);
    }
  };

  // Player Stand -> Dealer Turn
  const handleStand = (currentCards = playerCards, currentStake = stake) => {
    setGameState('dealer_turn');

    let currentDealerCards = [...dealerCards];
    let dScore = calculateScore(currentDealerCards);

    // Dealer hits on soft 17 until 17 or more
    const dealerInterval = setInterval(() => {
      if (dScore < 17) {
        soundFx.playCardDeal();
        const nextCard = drawRandomCard();
        currentDealerCards = [...currentDealerCards, nextCard];
        setDealerCards(currentDealerCards);
        dScore = calculateScore(currentDealerCards);
      } else {
        clearInterval(dealerInterval);
        resolveRound(calculateScore(currentCards), dScore, currentStake);
      }
    }, 700);
  };

  // Resolve winner
  const resolveRound = (finalPlayerScore: number, finalDealerScore: number, currentStake: number) => {
    setGameState('resolved');

    if (finalDealerScore > 21) {
      // Dealer bust, player wins
      const win = currentStake * 2;
      setOutcomeType('win');
      setOutcomeMessage('Dealer Busts! You Win!');
      setLastWinAmount(win);
      playCasinoBet('blackjack', 'Blackjack 21 VIP', currentStake, 2.0, win);
    } else if (finalPlayerScore > finalDealerScore) {
      const win = currentStake * 2;
      setOutcomeType('win');
      setOutcomeMessage(`You Win! (${finalPlayerScore} vs ${finalDealerScore})`);
      setLastWinAmount(win);
      playCasinoBet('blackjack', 'Blackjack 21 VIP', currentStake, 2.0, win);
    } else if (finalPlayerScore < finalDealerScore) {
      setOutcomeType('loss');
      setOutcomeMessage(`Dealer Wins (${finalDealerScore} vs ${finalPlayerScore})`);
      playCasinoBet('blackjack', 'Blackjack 21 VIP', currentStake, 0, 0);
    } else {
      setOutcomeType('push');
      setOutcomeMessage(`Push! Tie at ${finalPlayerScore} (Bet Refunded).`);
      setLastWinAmount(currentStake);
      playCasinoBet('blackjack', 'Blackjack 21 VIP', currentStake, 1.0, currentStake);
    }
  };

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Table Header */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Blackjack 21 VIP Table
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Blackjack Pays 3:2 • Dealer stands on 17
        </span>
      </div>

      {/* Felt Game Table */}
      <div className="p-6 bg-gradient-to-b from-[#0a2e1d] to-[#06180f] min-h-[360px] flex flex-col justify-between relative select-none">
        {/* Dealer Area */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs uppercase font-bold text-emerald-300 tracking-widest">Dealer</span>
            {gameState !== 'betting' && (
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                {gameState === 'playing' ? calculateScore([dealerCards[0]]) : dealerScore}
              </span>
            )}
          </div>

          {/* Dealer Cards */}
          <div className="flex items-center justify-center space-x-2 min-h-[100px]">
            {gameState === 'betting' ? (
              <div className="w-16 h-24 rounded-lg border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-xs text-emerald-500/50">
                Dealer Deck
              </div>
            ) : (
              dealerCards.map((card, idx) => {
                // Hide second card during active player turn
                const isHidden = gameState === 'playing' && idx === 1;
                const isRed = card.suit === '♥' || card.suit === '♦';

                if (isHidden) {
                  return (
                    <div
                      key={idx}
                      className="w-16 h-24 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-800 border-2 border-blue-400/40 shadow-xl flex items-center justify-center text-blue-300"
                    >
                      <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="w-16 h-24 rounded-xl bg-white text-gray-900 border border-gray-300 shadow-xl p-1.5 flex flex-col justify-between font-bold animate-in zoom-in-75 duration-200"
                  >
                    <div className={`text-xs ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                    <div className={`text-2xl text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-xs text-right ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Outcome Banner */}
        {outcomeMessage && (
          <div className="my-2 py-2 px-4 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/40 mx-auto text-center animate-in zoom-in-90 shadow-2xl">
            <h4
              className={`text-sm font-extrabold uppercase tracking-wide ${
                outcomeType === 'win' || outcomeType === 'blackjack'
                  ? 'text-emerald-400'
                  : outcomeType === 'push'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {outcomeMessage}
            </h4>
            {lastWinAmount > 0 && (
              <p className="text-xs font-mono font-bold text-white mt-0.5">
                Payout: +{formatCurrency(lastWinAmount)}
              </p>
            )}
          </div>
        )}

        {/* Player Area */}
        <div className="space-y-2 text-center">
          {/* Player Cards */}
          <div className="flex items-center justify-center space-x-2 min-h-[100px]">
            {gameState === 'betting' ? (
              <div className="w-16 h-24 rounded-lg border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-xs text-emerald-500/50">
                Your Hand
              </div>
            ) : (
              playerCards.map((card, idx) => {
                const isRed = card.suit === '♥' || card.suit === '♦';
                return (
                  <div
                    key={idx}
                    className="w-16 h-24 rounded-xl bg-white text-gray-900 border border-gray-300 shadow-xl p-1.5 flex flex-col justify-between font-bold animate-in zoom-in-75 duration-200"
                  >
                    <div className={`text-xs ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                    <div className={`text-2xl text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-xs text-right ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.value}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs uppercase font-bold text-emerald-300 tracking-widest">
              You (Player)
            </span>
            {gameState !== 'betting' && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  playerScore > 21
                    ? 'bg-red-500/30 text-red-300 border-red-500'
                    : playerScore === 21
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500 animate-bounce'
                    : 'bg-black/40 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {playerScore} {isPlayerBlackjack && '★ BLACKJACK'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Deck Controls */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800">
        {gameState === 'playing' ? (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleHit}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>HIT</span>
            </button>

            <button
              onClick={() => handleStand()}
              className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-sm uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Hand className="w-4 h-4" />
              <span>STAND</span>
            </button>

            <button
              onClick={handleDoubleDown}
              disabled={playerCards.length !== 2}
              className="py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>DOUBLE (2X)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chip Selection & Bet Input */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Bet Chips:</span>
                {[5, 10, 25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setStake(amt);
                      soundFx.playChipDrop();
                    }}
                    className={`w-9 h-9 rounded-full text-xs font-mono font-bold border-2 transition-all cursor-pointer flex items-center justify-center ${
                      stake === amt
                        ? 'border-emerald-400 bg-emerald-500 text-black scale-110 shadow-lg shadow-emerald-500/20'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Active Bet</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrency(stake)}
                </span>
              </div>
            </div>

            {/* Deal Button */}
            <button
              onClick={handleDeal}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl text-base uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Layers className="w-5 h-5 stroke-[2.5]" />
              <span>{gameState === 'resolved' ? 'DEAL NEXT HAND' : 'DEAL HAND (21)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
