import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Match,
  SportId,
  OddsFormat,
  BetSlipItem,
  BetSlipMode,
  PlacedBet,
  UserWallet,
  PaymentTransaction,
  AIMatchAnalysis,
  CasinoGameId,
  CasinoLiveWin,
} from '../types';
import { INITIAL_MATCHES } from '../data/mockMatches';
import { INITIAL_LIVE_CASINO_WINS } from '../data/casinoGamesData';
import { soundFx } from '../utils/audioEffects';
import { calculateParlayOdds, calculateComboBonusPercentage } from '../utils/oddsFormatter';
import confetti from 'canvas-confetti';

interface SportsbookContextType {
  matches: Match[];
  selectedSport: SportId | 'all' | 'live';
  setSelectedSport: (sport: SportId | 'all' | 'live') => void;
  selectedLeague: string | null;
  setSelectedLeague: (league: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeMatch: Match | null;
  setActiveMatch: (match: Match | null) => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (format: OddsFormat) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Main Navigation (Sports vs Casino vs My Bets)
  activeMainTab: 'sports' | 'casino' | 'my_bets';
  setActiveMainTab: (tab: 'sports' | 'casino' | 'my_bets') => void;
  activeCasinoGame: CasinoGameId | null;
  setActiveCasinoGame: (gameId: CasinoGameId | null) => void;
  casinoLiveWins: CasinoLiveWin[];
  playCasinoBet: (
    gameId: CasinoGameId,
    gameTitle: string,
    stake: number,
    multiplier: number,
    winAmount: number,
    details?: Record<string, unknown>
  ) => boolean;
  
  // Bet Slip
  betSlipItems: BetSlipItem[];
  addBetSelection: (item: Omit<BetSlipItem, 'stake'>, defaultStake?: number) => void;
  removeBetSelection: (id: string) => void;
  clearBetSlip: () => void;
  updateSelectionStake: (id: string, stake: number) => void;
  betSlipMode: BetSlipMode;
  setBetSlipMode: (mode: BetSlipMode) => void;
  parlayStake: number;
  setParlayStake: (stake: number) => void;
  isSlipOpen: boolean;
  setIsSlipOpen: (open: boolean) => void;
  placeBet: () => { success: boolean; message: string; bet?: PlacedBet };
  rebetTicket: (bet: PlacedBet) => void;
  
  // Placed Bets & Cashout
  placedBets: PlacedBet[];
  cashoutBet: (betId: string) => boolean;
  
  // User Wallet & Transactions
  wallet: UserWallet;
  transactions: PaymentTransaction[];
  depositFunds: (amount: number, method: PaymentTransaction['method'], details?: Record<string, unknown>) => Promise<boolean>;
  withdrawFunds: (amount: number, method: PaymentTransaction['method'], destination: string) => Promise<{ success: boolean; message: string }>;
  updateDepositLimit: (daily: number, monthly: number) => void;
  
  // Modals
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isResponsibleModalOpen: boolean;
  setIsResponsibleModalOpen: (open: boolean) => void;
  isAIParlayModalOpen: boolean;
  setIsAIParlayModalOpen: (open: boolean) => void;
  receiptBet: PlacedBet | null;
  setReceiptBet: (bet: PlacedBet | null) => void;

  // AI Analysis Cache
  aiAnalysisCache: Record<string, AIMatchAnalysis>;
  fetchAIMatchAnalysis: (match: Match) => Promise<AIMatchAnalysis | null>;
  isAnalyzingMatch: boolean;
}

const SportsbookContext = createContext<SportsbookContextType | undefined>(undefined);

const LOCAL_STORAGE_WALLET_KEY = 'chrisfixbet_wallet_v1';
const LOCAL_STORAGE_BETS_KEY = 'chrisfixbet_placed_bets_v1';
const LOCAL_STORAGE_TX_KEY = 'chrisfixbet_transactions_v1';

export const SportsbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [selectedSport, setSelectedSport] = useState<SportId | 'all' | 'live'>('all');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMatch, setActiveMatch] = useState<Match | null>(INITIAL_MATCHES[0]);
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('decimal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Bet slip
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [betSlipMode, setBetSlipMode] = useState<BetSlipMode>('single');
  const [parlayStake, setParlayStake] = useState<number>(25);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  // Wallet
  const [wallet, setWallet] = useState<UserWallet>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      balance: 1450.0,
      bonusBalance: 100.0,
      currency: 'GHS',
      depositLimitDaily: 50000,
      depositLimitMonthly: 200000,
      depositedToday: 0,
      kycVerified: true,
    };
  });

  // Placed Bets
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'bet-vanta-001',
        placedAt: new Date(Date.now() - 35 * 60000).toISOString(),
        type: 'single',
        items: [
          {
            id: 'init-1',
            matchId: 'match-ucl-1',
            matchTitle: 'Arsenal vs Real Madrid',
            league: 'UEFA Champions League',
            sport: 'soccer',
            marketId: 'm-1x2',
            marketName: 'Match Result (1X2)',
            outcomeId: '1x2-home',
            outcomeName: 'Arsenal',
            odds: 1.85,
            stake: 50,
            isLive: true,
          },
        ],
        totalStake: 50,
        totalOdds: 1.85,
        potentialPayout: 92.5,
        status: 'active',
        cashoutValue: 68.2,
      },
      {
        id: 'bet-vanta-002',
        placedAt: new Date(Date.now() - 180 * 60000).toISOString(),
        type: 'parlay',
        items: [
          {
            id: 'init-2a',
            matchId: 'match-epl-2',
            matchTitle: 'Man City vs Liverpool',
            league: 'Premier League',
            sport: 'soccer',
            marketId: 'm-1x2',
            marketName: 'Match Result (1X2)',
            outcomeId: '1x2-home',
            outcomeName: 'Man City',
            odds: 1.65,
            stake: 0,
            isLive: true,
          },
          {
            id: 'init-2b',
            matchId: 'match-nba-1',
            matchTitle: 'LA Lakers vs GS Warriors',
            league: 'NBA',
            sport: 'basketball',
            marketId: 'm-winner',
            marketName: 'Moneyline',
            outcomeId: 'ml-lal',
            odds: 1.70,
            stake: 0,
            isLive: true,
          },
        ],
        totalStake: 40,
        totalOdds: 2.80,
        potentialPayout: 112.0,
        status: 'active',
        cashoutValue: 56.4,
      },
      {
        id: 'bet-vanta-003',
        placedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        type: 'parlay',
        items: [
          {
            id: 'init-3a',
            matchId: 'match-epl-3',
            matchTitle: 'Chelsea vs Aston Villa',
            league: 'Premier League',
            sport: 'soccer',
            marketId: 'm-1x2',
            marketName: 'Match Result (1X2)',
            outcomeId: '1x2-home',
            outcomeName: 'Chelsea',
            odds: 1.95,
            stake: 0,
            isLive: false,
          },
          {
            id: 'init-3b',
            matchId: 'match-bun-1',
            matchTitle: 'Bayern Munich vs Dortmund',
            league: 'Bundesliga',
            sport: 'soccer',
            marketId: 'm-goals',
            marketName: 'Total Goals Over 2.5',
            outcomeId: 'ou-over',
            odds: 1.60,
            stake: 0,
            isLive: false,
          },
        ],
        totalStake: 100,
        totalOdds: 3.12,
        potentialPayout: 312.0,
        settledAmount: 312.0,
        status: 'won',
      },
      {
        id: 'bet-vanta-004',
        placedAt: new Date(Date.now() - 86400000 * 2.8).toISOString(),
        type: 'single',
        items: [
          {
            id: 'init-4a',
            matchId: 'match-laliga-1',
            matchTitle: 'Barcelona vs Juventus',
            league: 'Club Friendly Showcase',
            sport: 'soccer',
            marketId: 'm-1x2',
            marketName: 'Match Result (1X2)',
            outcomeId: '1x2-home',
            outcomeName: 'Barcelona',
            odds: 2.10,
            stake: 75,
            isLive: false,
          },
        ],
        totalStake: 75,
        totalOdds: 2.10,
        potentialPayout: 157.5,
        settledAmount: 135.0,
        status: 'cashed_out',
        cashedOutAt: new Date(Date.now() - 86400000 * 2.7).toISOString(),
      },
      {
        id: 'bet-vanta-005',
        placedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        type: 'single',
        items: [
          {
            id: 'init-5a',
            matchId: 'match-ucl-old',
            matchTitle: 'PSG vs Inter Milan',
            league: 'UEFA Champions League',
            sport: 'soccer',
            marketId: 'm-btts',
            marketName: 'Both Teams To Score (BTTS)',
            outcomeId: 'btts-no',
            outcomeName: 'No',
            odds: 2.25,
            stake: 30,
            isLive: false,
          },
        ],
        totalStake: 30,
        totalOdds: 2.25,
        potentialPayout: 67.5,
        settledAmount: 0,
        status: 'lost',
      },
    ];
  });

  // Transactions
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'tx-init-1',
        type: 'deposit',
        method: 'card',
        amount: 500,
        fee: 0,
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        referenceCode: 'DEP-8839210',
        details: { cardLast4: '4242' },
      },
      {
        id: 'tx-init-2',
        type: 'bonus',
        method: 'card',
        amount: 100,
        fee: 0,
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        referenceCode: 'BONUS-WELCOME',
      },
    ];
  });

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState(false);
  const [isAIParlayModalOpen, setIsAIParlayModalOpen] = useState(false);
  const [receiptBet, setReceiptBet] = useState<PlacedBet | null>(null);

  // Main Navigation (Sports vs Casino)
  const [activeMainTab, setActiveMainTab] = useState<'sports' | 'casino'>('sports');
  const [activeCasinoGame, setActiveCasinoGame] = useState<CasinoGameId | null>(null);
  const [casinoLiveWins, setCasinoLiveWins] = useState<CasinoLiveWin[]>(INITIAL_LIVE_CASINO_WINS);

  // AI cache
  const [aiAnalysisCache, setAiAnalysisCache] = useState<Record<string, AIMatchAnalysis>>({});
  const [isAnalyzingMatch, setIsAnalyzingMatch] = useState(false);

  // Periodic simulated live casino winners across Ghana
  useEffect(() => {
    const players = [
      'Kwame O.', 'Kofi M.', 'Ama P.', 'Kojo D.', 'Emmanuel T.', 'Abena S.',
      'Yaw Agyemang', 'Akua B.', 'Samuel K.', 'Prince O.', 'Eunice M.', 'Nana K.'
    ];
    const games: { id: CasinoGameId; title: string; minMult: number; maxMult: number }[] = [
      { id: 'aviator', title: 'Aviator Crash', minMult: 2.5, maxMult: 65.0 },
      { id: 'roulette', title: 'Lightning Roulette Pro', minMult: 3.0, maxMult: 100.0 },
      { id: 'mines', title: 'Mines Vault', minMult: 2.0, maxMult: 35.0 },
      { id: 'slots', title: 'Vanta Megaways 777', minMult: 5.0, maxMult: 150.0 },
      { id: 'penalty', title: 'Ghana Black Stars Shootout', minMult: 2.0, maxMult: 16.0 },
      { id: 'blackjack', title: 'Blackjack 21 VIP', minMult: 2.0, maxMult: 2.5 },
      { id: 'plinko', title: 'Plinko Master 1000x', minMult: 2.0, maxMult: 130.0 },
      { id: 'baccarat', title: 'Baccarat Royale Squeeze', minMult: 1.95, maxMult: 11.0 },
    ];

    const interval = setInterval(() => {
      const p = players[Math.floor(Math.random() * players.length)];
      const g = games[Math.floor(Math.random() * games.length)];
      const mult = Number((g.minMult + Math.random() * (g.maxMult - g.minMult)).toFixed(2));
      const bet = [10, 20, 50, 100, 200, 500][Math.floor(Math.random() * 6)];
      const win = Number((bet * mult).toFixed(2));

      const newWin: CasinoLiveWin = {
        id: `cwin-${Date.now()}`,
        playerName: p,
        gameId: g.id,
        gameTitle: g.title,
        betAmount: bet,
        multiplier: mult,
        winAmount: win,
        timestamp: 'Just now',
      };

      setCasinoLiveWins((prev) => [newWin, ...prev.slice(0, 14)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [wallet]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BETS_KEY, JSON.stringify(placedBets));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [placedBets]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [transactions]);

  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Real-Time Simulator for In-Play Matches & Dynamic Odds
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prevMatches) => {
        return prevMatches.map((match) => {
          if (match.status !== 'live') return match;

          // 30% chance to update pitch commentary/zone
          let newPitch = match.pitchState ? { ...match.pitchState } : undefined;
          if (newPitch && Math.random() < 0.4) {
            const shift = (Math.random() - 0.5) * 16;
            const newZone = Math.max(10, Math.min(90, Math.round(newPitch.ballZone + shift)));
            let action = newPitch.actionText;
            if (match.sport === 'soccer') {
              const actions = [
                `${match.homeTeam.name} probing on left wing with quick triangular passes`,
                `High press by ${match.awayTeam.name} winning ball recovery in middle third`,
                `Dangerous through-ball into penalty box! Defense scrambles clear`,
                `Corner kick awarded to ${match.homeTeam.name} after deflected cross`,
                `Midfield tactical battle with swift switch of play to opposite flank`,
              ];
              action = actions[Math.floor(Math.random() * actions.length)];
            }
            newPitch = {
              ...newPitch,
              ballZone: newZone,
              actionText: action,
              attackingTeam: newZone > 50 ? 'home' : 'away',
            };
          }

          // 20% chance for subtle odds fluctuation
          const updatedMarkets = match.markets.map((market) => {
            if (Math.random() < 0.25) {
              const updatedOutcomes = market.outcomes.map((outcome) => {
                if (outcome.isSuspended) return outcome;
                const change = (Math.random() - 0.5) * 0.08;
                const newOdds = Math.max(1.05, Math.min(30.0, Number((outcome.odds + change).toFixed(2))));
                const trend = newOdds > outcome.odds ? 'up' : newOdds < outcome.odds ? 'down' : 'neutral';

                return {
                  ...outcome,
                  previousOdds: outcome.odds,
                  odds: newOdds,
                  trend,
                };
              });
              return { ...market, outcomes: updatedOutcomes };
            }
            return market;
          });

          return {
            ...match,
            pitchState: newPitch,
            markets: updatedMarkets,
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Update activeMatch when matches array changes
  useEffect(() => {
    if (activeMatch) {
      const refreshed = matches.find((m) => m.id === activeMatch.id);
      if (refreshed) {
        setActiveMatch(refreshed);
      }
    }
  }, [matches, activeMatch?.id]);

  // Dynamic cashout value updater for active placed bets
  useEffect(() => {
    const cashoutInterval = setInterval(() => {
      setPlacedBets((prevBets) =>
        prevBets.map((bet) => {
          if (bet.status !== 'active') return bet;
          // Calculate realistic cashout offer based on potential payout and randomized momentum
          const momentum = 0.5 + Math.random() * 0.4;
          const newCashout = Number((bet.potentialPayout * momentum * 0.75).toFixed(2));
          return {
            ...bet,
            cashoutValue: Math.min(bet.potentialPayout * 0.95, Math.max(bet.totalStake * 0.2, newCashout)),
          };
        })
      );
    }, 6000);
    return () => clearInterval(cashoutInterval);
  }, []);

  // Bet slip selection handler
  const addBetSelection = useCallback(
    (item: Omit<BetSlipItem, 'stake'>, defaultStake: number = 25) => {
      soundFx.playOddsTick('up');
      setBetSlipItems((prev) => {
        // If already selected the same outcome, remove it (toggle off)
        const exists = prev.find((p) => p.outcomeId === item.outcomeId);
        if (exists) {
          return prev.filter((p) => p.outcomeId !== item.outcomeId);
        }
        // If outcome from same market, replace it
        const filtered = prev.filter((p) => !(p.matchId === item.matchId && p.marketId === item.marketId));
        return [...filtered, { ...item, stake: defaultStake }];
      });
      setIsSlipOpen(true);
    },
    []
  );

  const removeBetSelection = useCallback((id: string) => {
    setBetSlipItems((prev) => prev.filter((item) => item.id !== id && item.outcomeId !== id));
  }, []);

  const clearBetSlip = useCallback(() => {
    setBetSlipItems([]);
  }, []);

  const updateSelectionStake = useCallback((id: string, stake: number) => {
    setBetSlipItems((prev) =>
      prev.map((item) => (item.id === id || item.outcomeId === id ? { ...item, stake: Math.max(0, stake) } : item))
    );
  }, []);

  // Place Bet
  const placeBet = useCallback(() => {
    if (betSlipItems.length === 0) {
      return { success: false, message: 'Bet slip is empty' };
    }

    let totalStakeNeeded = 0;
    if (betSlipMode === 'single') {
      totalStakeNeeded = betSlipItems.reduce((sum, item) => sum + (item.stake || 0), 0);
    } else {
      totalStakeNeeded = parlayStake;
    }

    if (totalStakeNeeded <= 0) {
      return { success: false, message: 'Please enter a valid stake amount' };
    }

    if (wallet.balance < totalStakeNeeded) {
      setIsDepositModalOpen(true);
      return { success: false, message: 'Insufficient balance. Please deposit funds.' };
    }

    // Deduct stake from wallet balance
    setWallet((prev) => ({
      ...prev,
      balance: Number((prev.balance - totalStakeNeeded).toFixed(2)),
    }));

    // Calculate odds and payout
    let totalOdds = 1.0;
    let potentialPayout = 0;

    if (betSlipMode === 'single') {
      potentialPayout = betSlipItems.reduce((sum, item) => sum + item.stake * item.odds, 0);
      totalOdds = betSlipItems.length === 1 ? betSlipItems[0].odds : Number((potentialPayout / totalStakeNeeded).toFixed(2));
    } else {
      const oddsList = betSlipItems.map((i) => i.odds);
      const baseOdds = calculateParlayOdds(oddsList);
      const bonusPct = calculateComboBonusPercentage(betSlipItems.length);
      totalOdds = Number((baseOdds * (1 + bonusPct / 100)).toFixed(2));
      potentialPayout = Number((parlayStake * totalOdds).toFixed(2));
    }

    const newBet: PlacedBet = {
      id: `bet-${Date.now()}`,
      placedAt: new Date().toISOString(),
      type: betSlipMode,
      items: [...betSlipItems],
      totalStake: totalStakeNeeded,
      totalOdds,
      potentialPayout: Number(potentialPayout.toFixed(2)),
      status: 'active',
      cashoutValue: Number((totalStakeNeeded * 0.9).toFixed(2)),
    };

    setPlacedBets((prev) => [newBet, ...prev]);
    clearBetSlip();
    soundFx.playBetPlaced();
    setReceiptBet(newBet);

    return {
      success: true,
      message: `Bet placed successfully! Ticket #${newBet.id.slice(-6).toUpperCase()}`,
      bet: newBet,
    };
  }, [betSlipItems, betSlipMode, parlayStake, wallet.balance, clearBetSlip]);

  // Cashout Bet
  const cashoutBet = useCallback(
    (betId: string) => {
      const targetBet = placedBets.find((b) => b.id === betId);
      if (!targetBet || targetBet.status !== 'active' || !targetBet.cashoutValue) {
        return false;
      }

      const payout = targetBet.cashoutValue;

      // Credit wallet
      setWallet((prev) => ({
        ...prev,
        balance: Number((prev.balance + payout).toFixed(2)),
      }));

      // Update bet status
      setPlacedBets((prev) =>
        prev.map((b) =>
          b.id === betId
            ? {
                ...b,
                status: 'cashed_out',
                settledAmount: payout,
                cashedOutAt: new Date().toISOString(),
              }
            : b
        )
      );

      // Record transaction
      const tx: PaymentTransaction = {
        id: `tx-cashout-${Date.now()}`,
        type: 'cashout',
        method: 'card',
        amount: payout,
        fee: 0,
        status: 'completed',
        date: new Date().toISOString(),
        referenceCode: `CSH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };
      setTransactions((prev) => [tx, ...prev]);

      soundFx.playCashoutSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      return true;
    },
    [placedBets]
  );

  // Deposit funds
  const depositFunds = useCallback(
    async (amount: number, method: PaymentTransaction['method'], details: Record<string, unknown> = {}): Promise<boolean> => {
      try {
        let endpoint = '/api/payments/process-deposit';
        let bodyPayload: Record<string, unknown> = { amount, method, details };

        if (method === 'paystack' && details.reference) {
          endpoint = `/api/paystack/verify/${encodeURIComponent(String(details.reference))}`;
          const res = await fetch(endpoint);
          const data = await res.json();
          if (data.status && data.transaction) {
            setWallet((prev) => ({
              ...prev,
              balance: Number((prev.balance + amount).toFixed(2)),
              depositedToday: prev.depositedToday + amount,
            }));
            setTransactions((prev) => [data.transaction, ...prev]);
            soundFx.playDepositSuccess();
            return true;
          }
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        if (data.success && data.transaction) {
          setWallet((prev) => ({
            ...prev,
            balance: Number((prev.balance + amount).toFixed(2)),
            depositedToday: prev.depositedToday + amount,
          }));
          setTransactions((prev) => [data.transaction, ...prev]);
          soundFx.playDepositSuccess();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Deposit error:', err);
        // Fallback local deposit
        const ref = method === 'paystack'
          ? `PSTK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : `DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const tx: PaymentTransaction = {
          id: `tx-${Date.now()}`,
          type: 'deposit',
          method,
          amount,
          fee: 0,
          status: 'completed',
          date: new Date().toISOString(),
          referenceCode: ref,
          details: {
            ...details,
            cardLast4: details.cardNumber ? String(details.cardNumber).slice(-4) : '4242',
            paystackRef: method === 'paystack' ? ref : undefined,
          },
        };
        setWallet((prev) => ({
          ...prev,
          balance: Number((prev.balance + amount).toFixed(2)),
          depositedToday: prev.depositedToday + amount,
        }));
        setTransactions((prev) => [tx, ...prev]);
        soundFx.playDepositSuccess();
        return true;
      }
    },
    []
  );

  // Withdraw funds
  const withdrawFunds = useCallback(
    async (amount: number, method: PaymentTransaction['method'], destination: string): Promise<{ success: boolean; message: string }> => {
      if (amount > wallet.balance) {
        return { success: false, message: 'Withdrawal amount exceeds current balance' };
      }

      try {
        const endpoint = method === 'paystack' ? '/api/paystack/transfer' : '/api/payments/process-withdrawal';
        const payload = method === 'paystack'
          ? { amount, accountNumber: destination, bankOrNetwork: 'Ghana MoMo / Bank', accountName: 'Verified Player' }
          : { amount, method, addressOrAccount: destination };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success || data.status) {
          setWallet((prev) => ({
            ...prev,
            balance: Number((prev.balance - amount).toFixed(2)),
          }));
          if (data.transaction) {
            setTransactions((prev) => [data.transaction, ...prev]);
          }
          return {
            success: true,
            message: data.message || `Instant payout of GH₵ ${amount.toFixed(2)} dispatched successfully via Paystack rails.`,
          };
        }
        return { success: false, message: data.message || data.error || 'Withdrawal failed' };
      } catch (e) {
        setWallet((prev) => ({
          ...prev,
          balance: Number((prev.balance - amount).toFixed(2)),
        }));
        const tx: PaymentTransaction = {
          id: `tx-${Date.now()}`,
          type: 'withdrawal',
          method,
          amount,
          fee: 0,
          status: 'completed',
          date: new Date().toISOString(),
          referenceCode: method === 'paystack'
            ? `PSTK-TRF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            : `WTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          details: {
            destinationMask: destination,
            paystackChannel: method === 'paystack' ? 'transfer_ghs' : undefined,
          },
        };
        setTransactions((prev) => [tx, ...prev]);
        return { success: true, message: `Withdrawal of GH₵ ${amount.toFixed(2)} processed and dispatched.` };
      }
    },
    [wallet.balance]
  );

  const updateDepositLimit = useCallback((daily: number, monthly: number) => {
    setWallet((prev) => ({
      ...prev,
      depositLimitDaily: daily,
      depositLimitMonthly: monthly,
    }));
  }, []);

  // Fetch AI Match Analysis
  const fetchAIMatchAnalysis = useCallback(
    async (match: Match): Promise<AIMatchAnalysis | null> => {
      if (aiAnalysisCache[match.id]) {
        return aiAnalysisCache[match.id];
      }

      setIsAnalyzingMatch(true);
      try {
        const res = await fetch('/api/gemini/analyze-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchData: match }),
        });
        const data: AIMatchAnalysis = await res.json();
        setAiAnalysisCache((prev) => ({ ...prev, [match.id]: data }));
        setIsAnalyzingMatch(false);
        return data;
      } catch (err) {
        console.error('Error fetching AI analysis:', err);
        setIsAnalyzingMatch(false);
        return null;
      }
    },
    [aiAnalysisCache]
  );

  // Casino Betting Engine Handler
  const playCasinoBet = useCallback(
    (
      gameId: CasinoGameId,
      gameTitle: string,
      stake: number,
      multiplier: number,
      winAmount: number,
      details: Record<string, unknown> = {}
    ): boolean => {
      if (stake > wallet.balance) {
        return false;
      }

      const isWin = winAmount > 0;
      const netProfit = winAmount - stake;
      const newBalance = Number((wallet.balance - stake + winAmount).toFixed(2));

      setWallet((prev) => ({
        ...prev,
        balance: newBalance,
      }));

      // Create transaction for payout / win if any
      if (isWin) {
        const tx: PaymentTransaction = {
          id: `tx-casino-${Date.now()}`,
          type: 'bet_payout',
          method: 'card',
          amount: winAmount,
          fee: 0,
          status: 'completed',
          date: new Date().toISOString(),
          referenceCode: `CASINO-${gameId.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          details: {
            ...details,
            gameId,
            gameTitle,
            multiplier,
          },
        };
        setTransactions((prev) => [tx, ...prev]);

        // Add to live wins feed
        const playerWin: CasinoLiveWin = {
          id: `cwin-user-${Date.now()}`,
          playerName: 'You (Player)',
          gameId,
          gameTitle,
          betAmount: stake,
          multiplier,
          winAmount,
          timestamp: 'Just now',
        };
        setCasinoLiveWins((prev) => [playerWin, ...prev.slice(0, 14)]);

        // Sound & visual celebrations
        if (multiplier >= 5) {
          soundFx.playWinBig();
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          soundFx.playCashoutSuccess();
        }
      }

      return true;
    },
    [wallet.balance]
  );

  // Re-bet Ticket (Copy Slip)
  const rebetTicket = useCallback(
    (bet: PlacedBet) => {
      const itemsToAdd: BetSlipItem[] = bet.items.map((item) => ({
        ...item,
        id: `slip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stake: bet.type === 'single' ? (item.stake || bet.totalStake) : 0,
      }));
      setBetSlipItems(itemsToAdd);
      setBetSlipMode(bet.type);
      if (bet.type === 'parlay') {
        setParlayStake(bet.totalStake);
      }
      setIsSlipOpen(true);
      soundFx.playChipDrop();
    },
    [setIsSlipOpen]
  );

  return (
    <SportsbookContext.Provider
      value={{
        matches,
        selectedSport,
        setSelectedSport,
        selectedLeague,
        setSelectedLeague,
        searchQuery,
        setSearchQuery,
        activeMatch,
        setActiveMatch,
        oddsFormat,
        setOddsFormat,
        soundEnabled,
        setSoundEnabled,
        activeMainTab,
        setActiveMainTab,
        activeCasinoGame,
        setActiveCasinoGame,
        casinoLiveWins,
        playCasinoBet,
        betSlipItems,
        addBetSelection,
        removeBetSelection,
        clearBetSlip,
        updateSelectionStake,
        betSlipMode,
        setBetSlipMode,
        parlayStake,
        setParlayStake,
        isSlipOpen,
        setIsSlipOpen,
        placeBet,
        rebetTicket,
        placedBets,
        cashoutBet,
        wallet,
        transactions,
        depositFunds,
        withdrawFunds,
        updateDepositLimit,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isResponsibleModalOpen,
        setIsResponsibleModalOpen,
        isAIParlayModalOpen,
        setIsAIParlayModalOpen,
        receiptBet,
        setReceiptBet,
        aiAnalysisCache,
        fetchAIMatchAnalysis,
        isAnalyzingMatch,
      }}
    >
      {children}
    </SportsbookContext.Provider>
  );
};

export const useSportsbook = () => {
  const context = useContext(SportsbookContext);
  if (!context) {
    throw new Error('useSportsbook must be used within a SportsbookProvider');
  }
  return context;
};
