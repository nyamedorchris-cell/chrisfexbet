import React, { useState, useMemo } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { PlacedBet, SportId } from '../types';
import { formatCurrency, formatOdds } from '../utils/oddsFormatter';
import { soundFx } from '../utils/audioEffects';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Receipt,
  Share2,
  Copy,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Trophy,
  Activity,
  Flame,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Check,
  Zap,
} from 'lucide-react';

export const MyBetsView: React.FC = () => {
  const {
    placedBets,
    cashoutBet,
    rebetTicket,
    oddsFormat,
    setReceiptBet,
    setIsSlipOpen,
    setActiveMainTab,
    setIsAIParlayModalOpen,
    matches,
  } = useSportsbook();

  // Category Tabs: 'all' | 'active' | 'won' | 'past'
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'won' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sportFilter, setSportFilter] = useState<SportId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'parlay'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'stake' | 'odds' | 'payout'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedBetIds, setExpandedBetIds] = useState<Record<string, boolean>>({});

  // Tab counts
  const activeBets = useMemo(() => placedBets.filter((b) => b.status === 'active'), [placedBets]);
  const wonBets = useMemo(() => placedBets.filter((b) => b.status === 'won'), [placedBets]);
  const pastBets = useMemo(
    () => placedBets.filter((b) => b.status === 'won' || b.status === 'lost' || b.status === 'cashed_out'),
    [placedBets]
  );

  // Performance Analytics Summary calculations
  const stats = useMemo(() => {
    const totalWagered = placedBets.reduce((acc, b) => acc + b.totalStake, 0);
    const activeStake = activeBets.reduce((acc, b) => acc + b.totalStake, 0);
    const totalWon = placedBets.reduce((acc, b) => acc + (b.settledAmount || (b.status === 'won' ? b.potentialPayout : 0)), 0);
    
    // Settled bets
    const settled = placedBets.filter((b) => b.status !== 'active');
    const settledStake = settled.reduce((acc, b) => acc + b.totalStake, 0);
    const netProfit = totalWon - settledStake;
    
    const wonCount = wonBets.length;
    const settledCount = settled.length;
    const winRate = settledCount > 0 ? ((wonCount / settledCount) * 100).toFixed(1) : '0.0';

    const maxWin = Math.max(0, ...wonBets.map((b) => b.settledAmount || b.potentialPayout));

    return {
      totalWagered,
      activeStake,
      totalWon,
      netProfit,
      winRate,
      maxWin,
      totalCount: placedBets.length,
      activeCount: activeBets.length,
      wonCount: wonBets.length,
      pastCount: pastBets.length,
    };
  }, [placedBets, activeBets, wonBets, pastBets]);

  // Filter & Search Logic
  const filteredBets = useMemo(() => {
    let list = placedBets;

    // Tab filter
    if (selectedTab === 'active') {
      list = list.filter((b) => b.status === 'active');
    } else if (selectedTab === 'won') {
      list = list.filter((b) => b.status === 'won');
    } else if (selectedTab === 'past') {
      list = list.filter((b) => b.status !== 'active');
    }

    // Sport filter
    if (sportFilter !== 'all') {
      list = list.filter((b) => b.items.some((item) => item.sport === sportFilter));
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter((b) => b.type === typeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.items.some(
            (item) =>
              item.matchTitle.toLowerCase().includes(q) ||
              item.outcomeName.toLowerCase().includes(q) ||
              item.league.toLowerCase().includes(q)
          )
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
      }
      if (sortBy === 'stake') {
        return b.totalStake - a.totalStake;
      }
      if (sortBy === 'odds') {
        return b.totalOdds - a.totalOdds;
      }
      if (sortBy === 'payout') {
        return b.potentialPayout - a.potentialPayout;
      }
      return 0;
    });
  }, [placedBets, selectedTab, sportFilter, typeFilter, searchQuery, sortBy]);

  // Toggle leg accordion
  const toggleExpand = (betId: string) => {
    setExpandedBetIds((prev) => ({
      ...prev,
      [betId]: !prev[betId],
    }));
  };

  // Copy booking code
  const handleCopyCode = (betId: string) => {
    const code = `CHRIS-${betId.slice(-6).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    setCopiedId(betId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format date nicely
  const formatBetDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              My Bets & Ticket Vault
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md">
              {placedBets.length} Tickets
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time ticket tracking, instant cashout settlements, performance analytics, and one-click re-betting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMainTab('sports')}
            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
            <span>Sportsbook Markets</span>
          </button>

          <button
            onClick={() => setIsAIParlayModalOpen(true)}
            className="px-3.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Build AI Slip</span>
          </button>
        </div>
      </div>

      {/* Analytics & Betting Performance Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Wagered */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Stakes
          </span>
          <p className="text-sm sm:text-base font-extrabold font-mono text-white">
            {formatCurrency(stats.totalWagered)}
          </p>
          <span className="text-[10px] text-gray-500 block">Across {stats.totalCount} wagers</span>
        </div>

        {/* Active Open Stake */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              In-Play Open
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-sm sm:text-base font-extrabold font-mono text-blue-400">
            {formatCurrency(stats.activeStake)}
          </p>
          <span className="text-[10px] text-gray-500 block">{stats.activeCount} live tickets</span>
        </div>

        {/* Total Won / Settled */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
            Total Payouts
          </span>
          <p className="text-sm sm:text-base font-extrabold font-mono text-orange-400">
            {formatCurrency(stats.totalWon)}
          </p>
          <span className="text-[10px] text-gray-500 block">{stats.wonCount} winning tickets</span>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Net Profit
          </span>
          <p
            className={`text-sm sm:text-base font-extrabold font-mono ${
              stats.netProfit >= 0 ? 'text-orange-400' : 'text-rose-400'
            }`}
          >
            {stats.netProfit >= 0 ? `+${formatCurrency(stats.netProfit)}` : formatCurrency(stats.netProfit)}
          </p>
          <span className="text-[10px] text-gray-500 block">Settled ROI</span>
        </div>

        {/* Win Rate */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Ticket Win Rate
          </span>
          <p className="text-sm sm:text-base font-extrabold font-mono text-amber-400">
            {stats.winRate}%
          </p>
          <span className="text-[10px] text-gray-500 block">Resolution ratio</span>
        </div>

        {/* Biggest Single Win */}
        <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
            Max Payout
          </span>
          <p className="text-sm sm:text-base font-extrabold font-mono text-purple-400">
            {formatCurrency(stats.maxWin)}
          </p>
          <span className="text-[10px] text-gray-500 block">Top record ticket</span>
        </div>
      </div>

      {/* Category Pills & Toolbar */}
      <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-3 sm:p-4 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Category Tabs */}
          <div className="flex items-center space-x-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>All Tickets</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-700 text-gray-300 font-mono">
                {stats.totalCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedTab === 'active'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Active / In-Play</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-900/80 text-blue-200 font-mono font-bold">
                {stats.activeCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('won')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedTab === 'won'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                  : 'text-gray-400 hover:text-orange-400'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Winning Tickets</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-900/80 text-orange-200 font-mono font-bold">
                {stats.wonCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('past')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedTab === 'past'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Past & Settled</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-700 text-gray-300 font-mono">
                {stats.pastCount}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search match, team, ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Secondary Filter & Sort Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Bet Type Filter */}
            <div className="flex items-center space-x-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
              <span className="text-gray-500 text-[11px] font-semibold">Type:</span>
              {(['all', 'single', 'parlay'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-colors ${
                    typeFilter === t ? 'bg-gray-800 text-orange-400' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'single' ? 'Single' : 'Parlay'}
                </button>
              ))}
            </div>

            {/* Sport Filter */}
            <div className="flex items-center space-x-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
              <span className="text-gray-500 text-[11px] font-semibold">Sport:</span>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value as any)}
                className="bg-transparent text-gray-300 font-bold text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900">All Sports</option>
                <option value="soccer" className="bg-gray-900">⚽ Soccer</option>
                <option value="basketball" className="bg-gray-900">🏀 Basketball</option>
                <option value="tennis" className="bg-gray-900">🎾 Tennis</option>
                <option value="mma" className="bg-gray-900">🥊 MMA / UFC</option>
                <option value="esports" className="bg-gray-900">🎮 Esports</option>
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-semibold text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-lg text-gray-300 font-bold text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Placed</option>
              <option value="stake">Highest Stake</option>
              <option value="odds">Highest Odds</option>
              <option value="payout">Highest Potential Payout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredBets.length === 0 ? (
          <div className="bg-[#11141c] border border-gray-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-200">No Tickets Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || sportFilter !== 'all' || typeFilter !== 'all'
                  ? 'No bets match your active filters. Try adjusting your search query or criteria.'
                  : selectedTab === 'active'
                  ? 'You currently have no active open wagers.'
                  : selectedTab === 'won'
                  ? 'No winning tickets yet. Place a wager to start your streak!'
                  : 'Start placing single or combo multi-bets on live and upcoming matches!'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setActiveMainTab('sports')}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Explore Live Matches</span>
              </button>
            </div>
          </div>
        ) : (
          filteredBets.map((bet) => {
            const isExpanded = expandedBetIds[bet.id] ?? true; // Default open
            const isWon = bet.status === 'won';
            const isActive = bet.status === 'active';
            const isCashedOut = bet.status === 'cashed_out';
            const isLost = bet.status === 'lost';

            const profit = isWon
              ? (bet.settledAmount || bet.potentialPayout) - bet.totalStake
              : isCashedOut
              ? (bet.settledAmount || 0) - bet.totalStake
              : -bet.totalStake;

            const bookingCode = `CHRIS-${bet.id.slice(-6).toUpperCase()}`;

            return (
              <div
                key={bet.id}
                className={`bg-[#11141c] border rounded-2xl overflow-hidden shadow-lg transition-all ${
                  isWon
                    ? 'border-orange-500/40 shadow-orange-500/5'
                    : isActive
                    ? 'border-blue-500/30'
                    : 'border-gray-800'
                }`}
              >
                {/* Ticket Top Header Bar */}
                <div className="px-4 py-3 bg-gray-950/80 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    {/* Status Badge */}
                    {isActive && (
                      <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-mono font-extrabold flex items-center space-x-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        <span>IN PLAY</span>
                      </span>
                    )}
                    {isWon && (
                      <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-mono font-extrabold flex items-center space-x-1.5 shadow-sm">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>TICKET WON</span>
                      </span>
                    )}
                    {isCashedOut && (
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-mono font-extrabold flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>CASHED OUT</span>
                      </span>
                    )}
                    {isLost && (
                      <span className="px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-xs font-mono font-extrabold flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                        <span>SETTLED (LOST)</span>
                      </span>
                    )}

                    {/* Booking Code with Copy */}
                    <button
                      onClick={() => handleCopyCode(bet.id)}
                      className="px-2 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-md text-[11px] font-mono text-gray-300 flex items-center space-x-1 transition-colors"
                      title="Click to copy booking code"
                    >
                      <span>{bookingCode}</span>
                      {copiedId === bet.id ? (
                        <Check className="w-3 h-3 text-orange-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500" />
                      )}
                    </button>

                    <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 rounded text-[10px] font-bold uppercase">
                      {bet.type === 'single' ? 'Single' : `Parlay (${bet.items.length} Legs)`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span className="text-[11px] font-medium">{formatBetDate(bet.placedAt)}</span>
                    <button
                      onClick={() => toggleExpand(bet.id)}
                      className="p-1 text-gray-500 hover:text-gray-200 rounded transition-colors"
                      title={isExpanded ? 'Collapse ticket' : 'Expand ticket'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Ticket Body: Selection Legs */}
                {isExpanded && (
                  <div className="p-4 space-y-3 divide-y divide-gray-800/60">
                    {bet.items.map((item, idx) => {
                      const matchData = matches.find((m) => m.id === item.matchId);
                      const isMatchLive = matchData?.status === 'live';

                      return (
                        <div key={idx} className={`${idx > 0 ? 'pt-3' : ''} space-y-1.5`}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                                {item.league}
                              </span>
                              {isMatchLive && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-mono font-bold flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  <span>LIVE {matchData?.minute}'</span>
                                </span>
                              )}
                            </div>

                            {/* Individual Leg Odds */}
                            <span className="font-mono font-extrabold text-white text-xs bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                              {formatOdds(item.odds, oddsFormat)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-100">{item.matchTitle}</h4>
                            {matchData?.score && (
                              <span className="text-xs font-mono font-extrabold text-amber-400">
                                {matchData.score.home} - {matchData.score.away}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-gray-500 font-medium">{item.marketName}:</span>
                              <strong className="text-white font-bold">{item.outcomeName}</strong>
                            </div>

                            {/* Status Icon */}
                            {isActive ? (
                              <span className="text-[10px] text-blue-400 font-mono font-semibold flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-blue-400" />
                                <span>In-Play</span>
                              </span>
                            ) : isWon ? (
                              <span className="text-[10px] text-orange-400 font-mono font-semibold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-orange-400" />
                                <span>Won Leg</span>
                              </span>
                            ) : isLost ? (
                              <span className="text-[10px] text-rose-400 font-mono font-semibold flex items-center space-x-1">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Settled</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ticket Financials & Settlement Strip */}
                <div className="px-4 py-3.5 bg-gray-950 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-gray-500 font-sans block uppercase font-bold">
                        Total Stake:
                      </span>
                      <strong className="text-gray-200 font-bold text-sm">
                        {formatCurrency(bet.totalStake)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 font-sans block uppercase font-bold">
                        Total Odds:
                      </span>
                      <strong className="text-amber-400 font-bold text-sm">
                        {bet.totalOdds.toFixed(2)}x
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 font-sans block uppercase font-bold">
                        {isActive ? 'Est. Return:' : isWon ? 'Payout Settled:' : isCashedOut ? 'Cashed Out:' : 'Outcome:'}
                      </span>
                      <strong
                        className={`text-sm font-extrabold ${
                          isWon || isActive ? 'text-orange-400' : isCashedOut ? 'text-amber-400' : 'text-gray-400'
                        }`}
                      >
                        {isWon
                          ? `+${formatCurrency(bet.settledAmount || bet.potentialPayout)}`
                          : isCashedOut
                          ? formatCurrency(bet.settledAmount || 0)
                          : formatCurrency(bet.potentialPayout)}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons (Cashout, Re-Bet, View Receipt, Share) */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {/* Instant Cashout Button for Active Bets */}
                    {isActive && bet.cashoutValue && (
                      <button
                        onClick={() => cashoutBet(bet.id)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5 fill-black" />
                        <span>Cashout: {formatCurrency(bet.cashoutValue)}</span>
                      </button>
                    )}

                    {/* Re-Bet (Copy Slip) */}
                    <button
                      onClick={() => rebetTicket(bet)}
                      className="px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                      title="Copy selections into Bet Slip"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                      <span>Re-Bet</span>
                    </button>

                    {/* View Ticket Receipt Modal */}
                    <button
                      onClick={() => setReceiptBet(bet)}
                      className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="View full printable receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleCopyCode(bet.id)}
                      className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Copy booking share code"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
