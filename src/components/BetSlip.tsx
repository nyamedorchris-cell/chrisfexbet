import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { formatOdds, calculateParlayOdds, calculateComboBonusPercentage, formatCurrency } from '../utils/oddsFormatter';
import {
  TrendingUp,
  Trash2,
  X,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Receipt,
  Share2,
  DollarSign,
  AlertCircle,
  PlusCircle,
  Wallet,
  RotateCcw,
  Trophy,
  ExternalLink,
} from 'lucide-react';

export const BetSlip: React.FC = () => {
  const {
    betSlipItems,
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
    oddsFormat,
    setReceiptBet,
    setIsAIParlayModalOpen,
    setIsDepositModalOpen,
    setActiveMainTab,
  } = useSportsbook();

  const [activeTab, setActiveTab] = useState<'slip' | 'my_bets'>('slip');
  const [myBetsFilter, setMyBetsFilter] = useState<'all' | 'active' | 'won' | 'past'>('all');
  const [betFeedback, setBetFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const activeBetsCount = placedBets.filter((b) => b.status === 'active').length;
  const wonBetsCount = placedBets.filter((b) => b.status === 'won').length;

  const filteredMyBets = placedBets.filter((b) => {
    if (myBetsFilter === 'active') return b.status === 'active';
    if (myBetsFilter === 'won') return b.status === 'won';
    if (myBetsFilter === 'past') return b.status !== 'active';
    return true;
  });

  // Single mode total calculation
  const singleTotalStake = betSlipItems.reduce((acc, item) => acc + (item.stake || 0), 0);
  const singleTotalReturn = betSlipItems.reduce((acc, item) => acc + (item.stake || 0) * item.odds, 0);

  // Parlay mode calculations
  const oddsList = betSlipItems.map((i) => i.odds);
  const rawParlayOdds = calculateParlayOdds(oddsList);
  const bonusPct = calculateComboBonusPercentage(betSlipItems.length);
  const boostedParlayOdds = Number((rawParlayOdds * (1 + bonusPct / 100)).toFixed(2));
  const parlayReturn = Number((parlayStake * boostedParlayOdds).toFixed(2));

  const totalStake = betSlipMode === 'single' ? singleTotalStake : parlayStake;
  const totalReturn = betSlipMode === 'single' ? singleTotalReturn : parlayReturn;
  const potentialProfit = Math.max(0, totalReturn - totalStake);

  const handlePlaceBet = () => {
    const res = placeBet();
    if (res.success) {
      setBetFeedback({ message: res.message, type: 'success' });
      setTimeout(() => setBetFeedback(null), 4000);
      setActiveTab('my_bets');
    } else {
      setBetFeedback({ message: res.message, type: 'error' });
      setTimeout(() => setBetFeedback(null), 3500);
    }
  };

  const applyQuickStake = (amount: number) => {
    if (betSlipMode === 'single') {
      betSlipItems.forEach((item) => updateSelectionStake(item.id, amount));
    } else {
      setParlayStake(amount);
    }
  };

  return (
    <div
      id="chrisfixbet-betslip"
      className={`fixed lg:sticky top-20 right-0 h-[calc(100vh-5rem)] w-full sm:w-80 lg:w-88 bg-[#0f1116] backdrop-blur-xl border-l border-gray-800 z-40 flex flex-col transition-transform duration-300 shadow-2xl ${
        isSlipOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Header with Tabs */}
      <div className="p-4 bg-[#0f1116] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            id="betslip-tab-slip"
            onClick={() => setActiveTab('slip')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'slip'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Bet Slip</span>
            {betSlipItems.length > 0 && (
              <span className="px-1.5 py-0.2 bg-orange-500 text-black text-[10px] font-bold rounded-full">
                {betSlipItems.length}
              </span>
            )}
          </button>

          <button
            id="betslip-tab-mybets"
            onClick={() => setActiveTab('my_bets')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'my_bets'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>My Bets</span>
            {activeBetsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                {activeBetsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'slip' && betSlipItems.length > 0 && (
            <button
              onClick={clearBetSlip}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              title="Clear Slip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close for mobile drawer */}
          <button
            onClick={() => setIsSlipOpen(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {betFeedback && (
        <div
          className={`p-3 text-xs font-bold flex items-center space-x-2 ${
            betFeedback.type === 'success'
              ? 'bg-orange-500/20 text-orange-300 border-b border-orange-500/30'
              : 'bg-red-500/20 text-red-300 border-b border-red-500/30'
          }`}
        >
          {betFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{betFeedback.message}</span>
        </div>
      )}

      {/* CONTENT: BET SLIP TAB */}
      {activeTab === 'slip' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {betSlipItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-3 text-gray-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-300">Your Bet Slip is Empty</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                Click on any odds button across live or upcoming sports to place a wager.
              </p>

              <button
                onClick={() => setIsAIParlayModalOpen(true)}
                className="mt-4 flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-xs font-bold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Build with ChrisFix AI</span>
              </button>
            </div>
          ) : (
            <>
              {/* Slip Mode Selector (Single / Parlay) */}
              <div className="p-2.5 bg-gray-900/60 border-b border-gray-800 grid grid-cols-2 gap-1.5">
                <button
                  id="mode-single-btn"
                  onClick={() => setBetSlipMode('single')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betSlipMode === 'single'
                      ? 'bg-gray-800 text-orange-400 border border-orange-500/30 shadow-xs'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Single ({betSlipItems.length})
                </button>
                <button
                  id="mode-parlay-btn"
                  onClick={() => setBetSlipMode('parlay')}
                  disabled={betSlipItems.length < 2}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betSlipMode === 'parlay'
                      ? 'bg-gray-800 text-orange-400 border border-orange-500/30 shadow-xs'
                      : betSlipItems.length < 2
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Parlay {bonusPct > 0 && <span className="text-orange-400 font-mono">+{bonusPct}%</span>}
                </button>
              </div>

              {/* Combo Multiplier Bonus Banner */}
              {betSlipMode === 'parlay' && (
                <div className="px-3.5 py-2 bg-orange-500/10 border-b border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span className="font-bold text-orange-400">Parlay Multiplier Boost</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    +{bonusPct}% Extra Payout
                  </span>
                </div>
              )}

              {/* Selections List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {betSlipItems.map((item) => (
                  <div
                    key={item.outcomeId}
                    className="p-3.5 bg-[#1a1c22] border-l-4 border-orange-500 rounded-lg space-y-2 relative group shadow-sm"
                  >
                    <button
                      onClick={() => removeBetSelection(item.outcomeId)}
                      className="absolute top-2.5 right-2.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                        <span>{item.league}</span>
                        {item.isLive && (
                          <span className="text-red-400 font-bold">• LIVE</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-100 truncate pr-4">
                        {item.matchTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                      <div>
                        <p className="text-xs font-bold text-orange-400">{item.outcomeName}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{item.marketName}</p>
                      </div>
                      <span className="font-mono font-bold text-xs text-orange-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                        {formatOdds(item.odds, oddsFormat)}
                      </span>
                    </div>

                    {/* Single mode: individual stake input */}
                    {betSlipMode === 'single' && (
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-400 font-medium">Stake:</span>
                        <div className="relative w-32">
                          <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400 font-mono font-bold">GH₵</span>
                          <input
                            type="number"
                            min="1"
                            value={item.stake || ''}
                            onChange={(e) => updateSelectionStake(item.id, Number(e.target.value))}
                            className="w-full pl-9 pr-2 py-1 text-xs font-mono font-bold bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Calculations & Actions */}
              <div className="p-4 bg-gray-900 border-t border-gray-800 space-y-3">
                {/* Parlay mode: Global stake input */}
                {betSlipMode === 'parlay' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Parlay Stake:</span>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400 font-mono font-bold">GH₵</span>
                      <input
                        type="number"
                        min="1"
                        value={parlayStake || ''}
                        onChange={(e) => setParlayStake(Number(e.target.value))}
                        className="w-full pl-9 pr-2 py-1.5 text-xs font-mono font-bold bg-[#0f1116] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stake Preset Chips tailored for GHS */}
                <div className="flex items-center space-x-1.5">
                  {[5, 10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => applyQuickStake(amt)}
                      className="flex-1 py-1 text-[10px] font-mono font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-md transition-colors cursor-pointer"
                    >
                      GH₵{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => applyQuickStake(Math.min(wallet.balance, 500))}
                    className="flex-1 py-1 text-[10px] font-mono font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-md transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>

                {/* Totals Breakdown */}
                <div className="p-3 bg-[#0f1116] rounded-xl border border-gray-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Total Stake:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(totalStake)}</span>
                  </div>
                  {betSlipMode === 'parlay' && (
                    <div className="flex justify-between text-gray-400">
                      <span>Combined Odds:</span>
                      <span className="font-mono font-bold text-orange-400">{boostedParlayOdds}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>Est. Profit:</span>
                    <span className="font-mono font-bold text-orange-400">{formatCurrency(potentialProfit)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-gray-800">
                    <span className="text-xs uppercase tracking-wider">Est. Return:</span>
                    <span className="font-mono text-orange-500 font-bold text-base">
                      {formatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>

                {/* Insufficient Funds Helper Pill */}
                {totalStake > wallet.balance && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-semibold">
                        Need {formatCurrency(totalStake - wallet.balance)} more
                      </span>
                    </div>
                    <button
                      id="betslip-quick-deposit-btn"
                      onClick={() => setIsDepositModalOpen(true)}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all shadow-sm"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Deposit</span>
                    </button>
                  </div>
                )}

                {/* Place Bet Primary Button */}
                <button
                  id="place-wager-submit-btn"
                  onClick={handlePlaceBet}
                  disabled={totalStake <= 0}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-widest text-xs flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  <span>Place Wager ({formatCurrency(totalStake)})</span>
                </button>

                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>Instant Settlement • 256-Bit SSL Encrypted</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTENT: MY BETS TAB */}
      {activeTab === 'my_bets' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Quick Header Navigation to Full View */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {(['all', 'active', 'won', 'past'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMyBetsFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    myBetsFilter === tab
                      ? tab === 'active'
                        ? 'bg-blue-600 text-white'
                        : tab === 'won'
                        ? 'bg-orange-500 text-black'
                        : 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab === 'all'
                    ? `All (${placedBets.length})`
                    : tab === 'active'
                    ? `Active (${activeBetsCount})`
                    : tab === 'won'
                    ? `Won (${wonBetsCount})`
                    : 'Past'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveMainTab('my_bets');
                setIsSlipOpen(false);
              }}
              className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1 shrink-0 ml-1"
              title="Open full dedicated My Bets vault"
            >
              <span>Full View</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>

          {filteredMyBets.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-bold text-gray-300">No Tickets in this Category</p>
              <p className="text-xs text-gray-500 mt-1">Your active and settled tickets will appear here.</p>
            </div>
          ) : (
            filteredMyBets.map((bet) => (
              <div
                key={bet.id}
                className={`bg-[#1a1c22] border rounded-xl p-3.5 space-y-2.5 shadow-md transition-all ${
                  bet.status === 'won'
                    ? 'border-orange-500/40 bg-gradient-to-b from-[#2e1808] to-[#1a1c22]'
                    : bet.status === 'active'
                    ? 'border-blue-500/30'
                    : 'border-gray-800'
                }`}
              >
                {/* Top Ticket Meta */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-gray-400">
                      #{bet.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="px-1.5 py-0.2 bg-gray-800 text-gray-300 rounded font-bold uppercase text-[9px]">
                      {bet.type}
                    </span>
                  </div>

                  <div>
                    {bet.status === 'active' && (
                      <span className="flex items-center space-x-1 text-blue-400 font-bold font-mono text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>IN PLAY</span>
                      </span>
                    )}
                    {bet.status === 'cashed_out' && (
                      <span className="text-amber-400 font-bold uppercase font-mono text-[10px]">CASHED OUT</span>
                    )}
                    {bet.status === 'won' && (
                      <span className="flex items-center space-x-1 text-orange-400 font-bold uppercase font-mono text-[10px]">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>WON</span>
                      </span>
                    )}
                    {bet.status === 'lost' && (
                      <span className="text-gray-500 font-bold uppercase font-mono text-[10px]">LOST</span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {bet.items.map((item, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-bold text-white truncate">{item.outcomeName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{item.matchTitle} ({item.marketName})</p>
                    </div>
                  ))}
                </div>

                {/* Stake & Return */}
                <div className="pt-2 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 text-[10px] block font-sans">Stake:</span>
                    <span className="text-gray-200 font-bold">{formatCurrency(bet.totalStake)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[10px] block font-sans">
                      {bet.status === 'won' ? 'Payout Won:' : 'Potential Return:'}
                    </span>
                    <span className="text-orange-400 font-extrabold">
                      {formatCurrency(bet.status === 'won' ? (bet.settledAmount || bet.potentialPayout) : bet.potentialPayout)}
                    </span>
                  </div>
                </div>

                {/* Cashout Action Button */}
                {bet.status === 'active' && bet.cashoutValue && (
                  <div className="pt-1">
                    <button
                      id={`cashout-btn-${bet.id}`}
                      onClick={() => cashoutBet(bet.id)}
                      className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                      <span>Instant Cashout: {formatCurrency(bet.cashoutValue)}</span>
                    </button>
                  </div>
                )}

                {/* Action Toolbar: Re-Bet & View Receipt */}
                <div className="pt-1 flex items-center justify-between text-[11px] border-t border-gray-800/60">
                  <button
                    onClick={() => {
                      rebetTicket(bet);
                      setActiveTab('slip');
                    }}
                    className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 font-bold transition-colors"
                    title="Clone these picks into active slip"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-Bet Picks</span>
                  </button>

                  <button
                    onClick={() => setReceiptBet(bet)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-orange-400 font-medium transition-colors"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Ticket Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
