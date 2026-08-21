export type SportId =
  | 'soccer'
  | 'basketball'
  | 'tennis'
  | 'esports'
  | 'mma'
  | 'nfl'
  | 'baseball';

export type OddsFormat = 'decimal' | 'fractional' | 'american';

export interface MarketOutcome {
  id: string;
  name: string; // e.g. "Arsenal", "Draw", "Real Madrid", "Over 2.5", "Under 2.5"
  odds: number; // decimal e.g. 1.85
  previousOdds?: number;
  trend?: 'up' | 'down' | 'neutral';
  isSuspended?: boolean;
}

export interface Market {
  id: string;
  name: string; // e.g. "Match Result (1X2)", "Total Goals O/U 2.5", "Both Teams to Score", "Asian Handicap"
  category: 'main' | 'goals' | 'halves' | 'corners' | 'players' | 'specials';
  outcomes: MarketOutcome[];
}

export interface MatchStats {
  possession?: [number, number]; // [home, away] e.g. [58, 42]
  shots?: [number, number];
  shotsOnTarget?: [number, number];
  corners?: [number, number];
  fouls?: [number, number];
  yellowCards?: [number, number];
  redCards?: [number, number];
  dangerousAttacks?: [number, number];
  expectedGoals?: [number, number]; // xG e.g. [1.82, 0.94]
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card' | 'point' | 'sub' | 'var' | 'corner' | 'dangerous_attack' | 'penalty';
  team: 'home' | 'away';
  title: string;
  description: string;
}

export interface MatchPitchState {
  ballZone: number; // 0 (far left / home defense) to 100 (far right / away defense)
  actionText: string;
  attackingTeam: 'home' | 'away' | 'neutral';
  intensity: 'low' | 'medium' | 'high';
}

export interface Match {
  id: string;
  sport: SportId;
  league: string;
  countryCode?: string;
  status: 'live' | 'upcoming' | 'finished';
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    rank?: string;
    form: ('W' | 'D' | 'L')[];
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    rank?: string;
    form: ('W' | 'D' | 'L')[];
  };
  startTime: string; // ISO string or human readable
  minute?: number;
  period?: string; // "1st Half", "2nd Half", "Q3", "Set 2", "Round 2"
  score: {
    home: number;
    away: number;
    periodScores?: { home: number; away: number }[];
  };
  pitchState?: MatchPitchState;
  stats?: MatchStats;
  events?: MatchEvent[];
  markets: Market[];
  isFeatured?: boolean;
  h2hSummary?: string;
}

export interface BetSlipItem {
  id: string; // unique selection ID
  matchId: string;
  matchTitle: string; // "Arsenal vs Real Madrid"
  league: string;
  sport: SportId;
  marketId: string;
  marketName: string;
  outcomeId: string;
  outcomeName: string;
  odds: number;
  previousOdds?: number;
  stake: number;
  isLive: boolean;
}

export type BetSlipMode = 'single' | 'parlay' | 'system';

export interface PlacedBet {
  id: string;
  placedAt: string;
  type: 'single' | 'parlay' | 'system';
  items: BetSlipItem[];
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'cashed_out';
  cashoutValue?: number;
  settledAmount?: number;
  cashedOutAt?: string;
}

export interface PaymentTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet_payout' | 'bonus' | 'cashout';
  method: 'paystack' | 'momo' | 'vodafone_cash' | 'airteltigo' | 'card' | 'crypto' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'ghlink';
  amount: number;
  fee: number;
  status: 'completed' | 'processing' | 'failed';
  date: string;
  referenceCode: string;
  details?: {
    phoneNumber?: string;
    network?: string;
    cardLast4?: string;
    cryptoTxHash?: string;
    cryptoCurrency?: string;
    bankAccountMask?: string;
    paystackRef?: string;
    paystackChannel?: string;
    gameId?: string;
    gameTitle?: string;
    multiplier?: number;
    [key: string]: any;
  };
}

export interface UserWallet {
  balance: number;
  bonusBalance: number;
  currency: string;
  depositLimitDaily: number;
  depositLimitMonthly: number;
  depositedToday: number;
  kycVerified: boolean;
}

export interface AIMatchAnalysis {
  matchId: string;
  summary: string;
  homeWinProb: number;
  drawProb?: number;
  awayWinProb: number;
  confidenceScore: number; // 0-100
  recommendedPicks: {
    marketName: string;
    pick: string;
    odds: number;
    confidence: 'High' | 'Medium' | 'Value Play';
    reasoning: string;
  }[];
  keyFactors: string[];
  riskAssessment: string;
}

export type CasinoGameId =
  | 'aviator'
  | 'roulette'
  | 'blackjack'
  | 'slots'
  | 'mines'
  | 'plinko'
  | 'baccarat'
  | 'penalty';

export type CasinoCategory = 'all' | 'crash' | 'table' | 'slots' | 'instant';

export interface CasinoGameMeta {
  id: CasinoGameId;
  title: string;
  subtitle: string;
  category: CasinoCategory;
  provider: string;
  rtp: string; // e.g. "97.00%"
  maxMultiplier: string; // e.g. "10,000x"
  minBet: number;
  maxBet: number;
  isHot?: boolean;
  isNew?: boolean;
  bannerGradient: string;
  iconName: string;
  activePlayers: number;
  tags: string[];
}

export interface CasinoLiveWin {
  id: string;
  playerName: string;
  gameId: CasinoGameId;
  gameTitle: string;
  betAmount: number;
  multiplier: number;
  winAmount: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; // 'global-live' or matchId (e.g. 'm1', 'm2')
  matchId?: string;
  matchTitle?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadge?: string; // '🔥 Top Punter' | '🇬🇭 Ghana VIP' | '⚡ Pro Tipper' | '👑 High Roller' | '🛡️ Moderator'
  text: string;
  timestamp: string;
  isModerator?: boolean;
  isSystemAnnouncement?: boolean;
  isFlagged?: boolean;
  moderationReason?: string;
  reactions: Record<string, number>; // emoji -> count e.g. { '🔥': 5, '⚽': 3 }
  userReactions?: Record<string, string[]>; // emoji -> userIds
  sharedBet?: {
    matchTitle: string;
    marketName: string;
    outcomeName: string;
    odds: number;
    stake?: number;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  matchId?: string;
  sport?: SportId;
  activeUsers: number;
  description?: string;
  isMatchRoom?: boolean;
}

export interface ChatReport {
  id: string;
  messageId: string;
  reporterUserId: string;
  reason: 'spam' | 'offensive' | 'scam' | 'harassment' | 'other';
  details?: string;
  timestamp: string;
}

