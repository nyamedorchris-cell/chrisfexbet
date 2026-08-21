import { Match } from '../types';

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-ucl-1',
    sport: 'soccer',
    league: 'UEFA Champions League',
    countryCode: 'EU',
    status: 'live',
    minute: 68,
    period: '2nd Half',
    homeTeam: {
      name: 'Arsenal',
      shortName: 'ARS',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop&q=80',
      rank: '#1 Group B',
      form: ['W', 'W', 'W', 'D', 'W'],
    },
    awayTeam: {
      name: 'Real Madrid',
      shortName: 'RMA',
      logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=80&auto=format&fit=crop&q=80',
      rank: '#1 Group C',
      form: ['W', 'L', 'W', 'W', 'W'],
    },
    startTime: 'Live Now',
    score: {
      home: 2,
      away: 1,
    },
    pitchState: {
      ballZone: 76,
      actionText: 'Arsenal in possession: Saka driving inside right penalty area',
      attackingTeam: 'home',
      intensity: 'high',
    },
    stats: {
      possession: [56, 44],
      shots: [14, 9],
      shotsOnTarget: [7, 4],
      corners: [6, 3],
      fouls: [9, 12],
      yellowCards: [1, 2],
      redCards: [0, 0],
      dangerousAttacks: [54, 38],
      expectedGoals: [1.94, 1.12],
    },
    events: [
      { id: 'ev-1', minute: 18, type: 'goal', team: 'home', title: 'GOAL! Arsenal 1 - 0', description: 'Bukayo Saka curler from edge of the box.' },
      { id: 'ev-2', minute: 34, type: 'card', team: 'away', title: 'Yellow Card', description: 'Camavinga late challenge in midfield.' },
      { id: 'ev-3', minute: 42, type: 'goal', team: 'away', title: 'GOAL! 1 - 1', description: 'Vinícius Jr counter-attack solo sprint finish.' },
      { id: 'ev-4', minute: 58, type: 'goal', team: 'home', title: 'GOAL! Arsenal 2 - 1', description: 'Declan Rice towering header from corner kick.' },
      { id: 'ev-5', minute: 65, type: 'dangerous_attack', team: 'home', title: 'Close Shot!', description: 'Ødegaard strike deflected wide by Courtois.' },
    ],
    markets: [
      {
        id: 'm-1x2',
        name: 'Match Result (1X2)',
        category: 'main',
        outcomes: [
          { id: '1x2-home', name: 'Arsenal', odds: 1.48, trend: 'neutral' },
          { id: '1x2-draw', name: 'Draw', odds: 3.90, trend: 'up' },
          { id: '1x2-away', name: 'Real Madrid', odds: 7.20, trend: 'down' },
        ],
      },
      {
        id: 'm-ou',
        name: 'Total Goals Over / Under',
        category: 'goals',
        outcomes: [
          { id: 'ou-over-35', name: 'Over 3.5 Goals', odds: 1.88, trend: 'neutral' },
          { id: 'ou-under-35', name: 'Under 3.5 Goals', odds: 1.92, trend: 'neutral' },
        ],
      },
      {
        id: 'm-btts',
        name: 'Both Teams to Score',
        category: 'goals',
        outcomes: [
          { id: 'btts-yes', name: 'Yes (Settled)', odds: 1.01, isSuspended: true },
          { id: 'btts-no', name: 'No', odds: 25.0, isSuspended: true },
        ],
      },
      {
        id: 'm-next-goal',
        name: 'Next Team to Score (Goal 4)',
        category: 'goals',
        outcomes: [
          { id: 'ng-home', name: 'Arsenal', odds: 2.25, trend: 'neutral' },
          { id: 'ng-away', name: 'Real Madrid', odds: 2.85, trend: 'neutral' },
          { id: 'ng-none', name: 'No 4th Goal', odds: 2.70, trend: 'up' },
        ],
      },
      {
        id: 'm-handicap',
        name: 'Handicap (-1.0 Arsenal)',
        category: 'main',
        outcomes: [
          { id: 'hc-home', name: 'Arsenal (-1.0)', odds: 2.45, trend: 'neutral' },
          { id: 'hc-away', name: 'Real Madrid (+1.0)', odds: 1.55, trend: 'neutral' },
        ],
      },
    ],
    isFeatured: true,
    h2hSummary: 'Arsenal won 2, Draw 1, Real Madrid won 2 in last 5 meetings. Average 3.2 goals per game.',
  },
  {
    id: 'match-epl-2',
    sport: 'soccer',
    league: 'Premier League',
    countryCode: 'GB',
    status: 'live',
    minute: 34,
    period: '1st Half',
    homeTeam: {
      name: 'Manchester City',
      shortName: 'MCI',
      rank: '#2 EPL',
      form: ['W', 'W', 'D', 'W', 'W'],
    },
    awayTeam: {
      name: 'Liverpool',
      shortName: 'LIV',
      rank: '#1 EPL',
      form: ['W', 'W', 'W', 'W', 'D'],
    },
    startTime: 'Live Now',
    score: {
      home: 1,
      away: 0,
    },
    pitchState: {
      ballZone: 62,
      actionText: 'Man City pressuring: De Bruyne crossing from right flank',
      attackingTeam: 'home',
      intensity: 'high',
    },
    stats: {
      possession: [62, 38],
      shots: [8, 4],
      shotsOnTarget: [4, 1],
      corners: [4, 1],
      fouls: [3, 5],
      yellowCards: [0, 1],
      redCards: [0, 0],
      dangerousAttacks: [41, 22],
      expectedGoals: [1.25, 0.42],
    },
    events: [
      { id: 'ev-epl-1', minute: 14, type: 'goal', team: 'home', title: 'GOAL! Man City 1 - 0', description: 'Erling Haaland tap-in after Bernardo Silva cutback.' },
      { id: 'ev-epl-2', minute: 28, type: 'card', team: 'away', title: 'Yellow Card', description: 'Mac Allister foul on Foden.' },
    ],
    markets: [
      {
        id: 'm-1x2',
        name: 'Match Result (1X2)',
        category: 'main',
        outcomes: [
          { id: '1x2-home', name: 'Man City', odds: 1.58, trend: 'down' },
          { id: '1x2-draw', name: 'Draw', odds: 4.10, trend: 'up' },
          { id: '1x2-away', name: 'Liverpool', odds: 5.60, trend: 'up' },
        ],
      },
      {
        id: 'm-ou',
        name: 'Total Goals Over / Under 2.5',
        category: 'goals',
        outcomes: [
          { id: 'ou-over-25', name: 'Over 2.5', odds: 1.62, trend: 'neutral' },
          { id: 'ou-under-25', name: 'Under 2.5', odds: 2.28, trend: 'neutral' },
        ],
      },
      {
        id: 'm-btts',
        name: 'Both Teams to Score',
        category: 'goals',
        outcomes: [
          { id: 'btts-yes', name: 'Yes', odds: 1.70, trend: 'neutral' },
          { id: 'btts-no', name: 'No', odds: 2.10, trend: 'neutral' },
        ],
      },
    ],
    isFeatured: true,
    h2hSummary: 'Last 6 matches at Etihad Stadium: Man City 3 wins, 2 draws, Liverpool 1 win.',
  },
  {
    id: 'match-nba-1',
    sport: 'basketball',
    league: 'NBA',
    countryCode: 'US',
    status: 'live',
    minute: 8,
    period: 'Q3 08:22',
    homeTeam: {
      name: 'Los Angeles Lakers',
      shortName: 'LAL',
      rank: '#4 West',
      form: ['W', 'L', 'W', 'W', 'W'],
    },
    awayTeam: {
      name: 'Golden State Warriors',
      shortName: 'GSW',
      rank: '#5 West',
      form: ['W', 'W', 'L', 'W', 'L'],
    },
    startTime: 'Live Now',
    score: {
      home: 78,
      away: 74,
      periodScores: [
        { home: 28, away: 26 },
        { home: 27, away: 29 },
        { home: 23, away: 19 },
      ],
    },
    pitchState: {
      ballZone: 85,
      actionText: 'Steph Curry pull-up 3-point attempt from top of key',
      attackingTeam: 'away',
      intensity: 'high',
    },
    stats: {
      possession: [50, 50],
      shots: [58, 54],
      shotsOnTarget: [30, 26],
      fouls: [12, 14],
      expectedGoals: [0, 0],
    },
    events: [
      { id: 'ev-nba-1', minute: 2, type: 'point', team: 'home', title: 'LeBron James Dunk', description: 'LeBron fastbreak slam + foul.' },
      { id: 'ev-nba-2', minute: 5, type: 'point', team: 'away', title: 'Curry 3-Pointer', description: 'Deep 29ft three pointer.' },
    ],
    markets: [
      {
        id: 'm-winner',
        name: 'Moneyline (Winner)',
        category: 'main',
        outcomes: [
          { id: 'ml-lal', name: 'LA Lakers', odds: 1.65, trend: 'neutral' },
          { id: 'ml-gsw', name: 'GS Warriors', odds: 2.25, trend: 'neutral' },
        ],
      },
      {
        id: 'm-spread',
        name: 'Point Spread',
        category: 'main',
        outcomes: [
          { id: 'sp-lal', name: 'LAL -3.5', odds: 1.90, trend: 'neutral' },
          { id: 'sp-gsw', name: 'GSW +3.5', odds: 1.90, trend: 'neutral' },
        ],
      },
      {
        id: 'm-total-pts',
        name: 'Total Points Over/Under 224.5',
        category: 'goals',
        outcomes: [
          { id: 'tot-over', name: 'Over 224.5', odds: 1.85, trend: 'up' },
          { id: 'tot-under', name: 'Under 224.5', odds: 1.95, trend: 'down' },
        ],
      },
    ],
    isFeatured: true,
    h2hSummary: 'Season series tied 1-1. Average combined score 228.4 PPG.',
  },
  {
    id: 'match-tennis-1',
    sport: 'tennis',
    league: 'ATP Finals Championship',
    countryCode: 'IT',
    status: 'live',
    period: 'Set 2 (6-4, 3-4)',
    homeTeam: {
      name: 'Carlos Alcaraz',
      shortName: 'ALC',
      rank: '#2 World',
      form: ['W', 'W', 'W', 'W', 'W'],
    },
    awayTeam: {
      name: 'Jannik Sinner',
      shortName: 'SIN',
      rank: '#1 World',
      form: ['W', 'W', 'W', 'W', 'W'],
    },
    startTime: 'Live Now',
    score: {
      home: 1,
      away: 0,
      periodScores: [
        { home: 6, away: 4 },
        { home: 3, away: 4 },
      ],
    },
    pitchState: {
      ballZone: 50,
      actionText: 'Sinner serving (40-30): 134 mph first serve to Alcaraz backhand',
      attackingTeam: 'away',
      intensity: 'high',
    },
    stats: {
      possession: [50, 50],
      shots: [9, 12], // aces
      shotsOnTarget: [2, 1], // double faults
      dangerousAttacks: [14, 18], // break point opps
    },
    events: [
      { id: 'ev-ten-1', minute: 45, type: 'point', team: 'home', title: 'Set 1 to Alcaraz', description: 'Alcaraz converts break point to take first set 6-4.' },
      { id: 'ev-ten-2', minute: 72, type: 'point', team: 'away', title: 'Break Sinner!', description: 'Sinner breaks Alcaraz in game 5 of Set 2.' },
    ],
    markets: [
      {
        id: 'm-match-winner',
        name: 'Match Winner',
        category: 'main',
        outcomes: [
          { id: 'ten-alc', name: 'Carlos Alcaraz', odds: 1.72, trend: 'neutral' },
          { id: 'ten-sin', name: 'Jannik Sinner', odds: 2.15, trend: 'neutral' },
        ],
      },
      {
        id: 'm-set2-winner',
        name: 'Set 2 Winner',
        category: 'halves',
        outcomes: [
          { id: 's2-alc', name: 'Alcaraz (Set 2)', odds: 3.40, trend: 'up' },
          { id: 's2-sin', name: 'Sinner (Set 2)', odds: 1.32, trend: 'down' },
        ],
      },
      {
        id: 'm-total-games',
        name: 'Total Games O/U 23.5',
        category: 'goals',
        outcomes: [
          { id: 'tg-over', name: 'Over 23.5 Games', odds: 1.65, trend: 'neutral' },
          { id: 'tg-under', name: 'Under 23.5 Games', odds: 2.20, trend: 'neutral' },
        ],
      },
    ],
    isFeatured: true,
  },
  {
    id: 'match-esports-1',
    sport: 'esports',
    league: 'CS2 PGL Major Grand Finals',
    countryCode: 'DK',
    status: 'live',
    period: 'Map 2 (Inferno) 11-9',
    homeTeam: {
      name: 'Natus Vincere',
      shortName: 'NAVI',
      rank: '#2 HLTV',
      form: ['W', 'W', 'W', 'W', 'L'],
    },
    awayTeam: {
      name: 'FaZe Clan',
      shortName: 'FaZe',
      rank: '#3 HLTV',
      form: ['W', 'W', 'L', 'W', 'W'],
    },
    startTime: 'Live Now',
    score: {
      home: 1,
      away: 0,
      periodScores: [
        { home: 13, away: 8 }, // Map 1 Mirage
        { home: 11, away: 9 }, // Map 2 Inferno
      ],
    },
    pitchState: {
      ballZone: 40,
      actionText: 'Round 21: NAVI Buy round executing B-site Banana with 3 smokes',
      attackingTeam: 'home',
      intensity: 'high',
    },
    markets: [
      {
        id: 'm-series-winner',
        name: 'Series Winner (BO3)',
        category: 'main',
        outcomes: [
          { id: 'esp-navi', name: 'NAVI', odds: 1.30, trend: 'down' },
          { id: 'esp-faze', name: 'FaZe Clan', odds: 3.50, trend: 'up' },
        ],
      },
      {
        id: 'm-map2-winner',
        name: 'Map 2 (Inferno) Winner',
        category: 'halves',
        outcomes: [
          { id: 'm2-navi', name: 'NAVI (Map 2)', odds: 1.42, trend: 'neutral' },
          { id: 'm2-faze', name: 'FaZe (Map 2)', odds: 2.80, trend: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'match-ufc-1',
    sport: 'mma',
    league: 'UFC 312: Lightweight Title',
    countryCode: 'US',
    status: 'upcoming',
    startTime: 'Today, 22:30',
    homeTeam: {
      name: 'Islam Makhachev',
      shortName: 'MAK',
      rank: 'Champion (26-1)',
      form: ['W', 'W', 'W', 'W', 'W'],
    },
    awayTeam: {
      name: 'Arman Tsarukyan',
      shortName: 'TSA',
      rank: '#1 Contender (22-3)',
      form: ['W', 'W', 'W', 'W', 'W'],
    },
    score: {
      home: 0,
      away: 0,
    },
    markets: [
      {
        id: 'm-fight-winner',
        name: 'Fight Winner',
        category: 'main',
        outcomes: [
          { id: 'ufc-mak', name: 'Islam Makhachev', odds: 1.38, trend: 'neutral' },
          { id: 'ufc-tsa', name: 'Arman Tsarukyan', odds: 3.10, trend: 'neutral' },
        ],
      },
      {
        id: 'm-method',
        name: 'Method of Victory',
        category: 'specials',
        outcomes: [
          { id: 'meth-mak-sub', name: 'Makhachev by Submission', odds: 2.40, trend: 'neutral' },
          { id: 'meth-mak-dec', name: 'Makhachev by Decision', odds: 3.20, trend: 'neutral' },
          { id: 'meth-tsa-ko', name: 'Tsarukyan by KO/TKO', odds: 6.50, trend: 'neutral' },
          { id: 'meth-tsa-dec', name: 'Tsarukyan by Decision', odds: 5.50, trend: 'neutral' },
        ],
      },
      {
        id: 'm-rounds',
        name: 'Total Rounds O/U 3.5',
        category: 'goals',
        outcomes: [
          { id: 'rnd-over', name: 'Over 3.5 Rounds', odds: 1.75, trend: 'neutral' },
          { id: 'rnd-under', name: 'Under 3.5 Rounds', odds: 2.05, trend: 'neutral' },
        ],
      },
    ],
    h2hSummary: 'First bout in 2019 ended in Makhachev unanimous decision in a competitive wrestling war.',
  },
  {
    id: 'match-nfl-1',
    sport: 'nfl',
    league: 'NFL Super Clash',
    countryCode: 'US',
    status: 'upcoming',
    startTime: 'Tomorrow, 18:00',
    homeTeam: {
      name: 'Kansas City Chiefs',
      shortName: 'KC',
      rank: '12-2',
      form: ['W', 'W', 'W', 'W', 'L'],
    },
    awayTeam: {
      name: 'San Francisco 49ers',
      shortName: 'SF',
      rank: '11-3',
      form: ['W', 'W', 'W', 'L', 'W'],
    },
    score: {
      home: 0,
      away: 0,
    },
    markets: [
      {
        id: 'm-nfl-ml',
        name: 'Moneyline',
        category: 'main',
        outcomes: [
          { id: 'ml-kc', name: 'Kansas City Chiefs', odds: 1.80, trend: 'neutral' },
          { id: 'ml-sf', name: 'San Francisco 49ers', odds: 2.05, trend: 'neutral' },
        ],
      },
      {
        id: 'm-nfl-spread',
        name: 'Spread (KC -2.5)',
        category: 'main',
        outcomes: [
          { id: 'sp-kc', name: 'Chiefs -2.5', odds: 1.91, trend: 'neutral' },
          { id: 'sp-sf', name: '49ers +2.5', odds: 1.91, trend: 'neutral' },
        ],
      },
      {
        id: 'm-nfl-total',
        name: 'Total Points Over/Under 48.5',
        category: 'goals',
        outcomes: [
          { id: 'tot-over-48', name: 'Over 48.5', odds: 1.88, trend: 'neutral' },
          { id: 'tot-under-48', name: 'Under 48.5', odds: 1.92, trend: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'match-laliga-1',
    sport: 'soccer',
    league: 'La Liga',
    countryCode: 'ES',
    status: 'upcoming',
    startTime: 'Today, 20:00',
    homeTeam: {
      name: 'FC Barcelona',
      shortName: 'BAR',
      rank: '#1 La Liga',
      form: ['W', 'W', 'W', 'D', 'W'],
    },
    awayTeam: {
      name: 'Atletico Madrid',
      shortName: 'ATM',
      rank: '#3 La Liga',
      form: ['W', 'D', 'W', 'W', 'W'],
    },
    score: {
      home: 0,
      away: 0,
    },
    markets: [
      {
        id: 'm-1x2',
        name: 'Match Result (1X2)',
        category: 'main',
        outcomes: [
          { id: '1x2-bar', name: 'Barcelona', odds: 1.78, trend: 'neutral' },
          { id: '1x2-draw-laliga', name: 'Draw', odds: 3.75, trend: 'neutral' },
          { id: '1x2-atm', name: 'Atletico Madrid', odds: 4.50, trend: 'neutral' },
        ],
      },
      {
        id: 'm-ou',
        name: 'Total Goals Over / Under 2.5',
        category: 'goals',
        outcomes: [
          { id: 'ou-over-bar', name: 'Over 2.5', odds: 1.68, trend: 'neutral' },
          { id: 'ou-under-bar', name: 'Under 2.5', odds: 2.15, trend: 'neutral' },
        ],
      },
      {
        id: 'm-btts',
        name: 'Both Teams to Score',
        category: 'goals',
        outcomes: [
          { id: 'btts-bar-yes', name: 'Yes', odds: 1.62, trend: 'neutral' },
          { id: 'btts-bar-no', name: 'No', odds: 2.25, trend: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'match-nba-2',
    sport: 'basketball',
    league: 'NBA',
    countryCode: 'US',
    status: 'upcoming',
    startTime: 'Today, 21:00',
    homeTeam: {
      name: 'Boston Celtics',
      shortName: 'BOS',
      rank: '#1 East',
      form: ['W', 'W', 'W', 'W', 'W'],
    },
    awayTeam: {
      name: 'Milwaukee Bucks',
      shortName: 'MIL',
      rank: '#3 East',
      form: ['L', 'W', 'W', 'L', 'W'],
    },
    score: {
      home: 0,
      away: 0,
    },
    markets: [
      {
        id: 'm-winner',
        name: 'Moneyline (Winner)',
        category: 'main',
        outcomes: [
          { id: 'ml-bos', name: 'Boston Celtics', odds: 1.45, trend: 'neutral' },
          { id: 'ml-mil', name: 'Milwaukee Bucks', odds: 2.80, trend: 'neutral' },
        ],
      },
      {
        id: 'm-spread',
        name: 'Spread (BOS -5.5)',
        category: 'main',
        outcomes: [
          { id: 'sp-bos', name: 'Celtics -5.5', odds: 1.91, trend: 'neutral' },
          { id: 'sp-mil', name: 'Bucks +5.5', odds: 1.91, trend: 'neutral' },
        ],
      },
    ],
  },
];
